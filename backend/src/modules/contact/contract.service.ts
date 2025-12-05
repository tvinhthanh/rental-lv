import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { randomBytes } from 'crypto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Injectable()
export class ContractService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService,
        private cloudinary: CloudinaryService
    ) { }

    generateContractNo() {
        return 'CTR-' + randomBytes(4).toString('hex').toUpperCase();
    }

    async findOne(id: string) {
        const c = await this.prisma.contract.findUnique({
            where: { id },
            include: {
                booking: {
                    include: {
                        customer: true,
                        vehicle: true,
                        branch: true
                    }
                }
            }
        });
        if (!c) throw new NotFoundException('Contract not found');
        return c;
    }

    async findByBooking(bookingId: string) {
        return this.prisma.contract.findUnique({
            where: { bookingId },
            include: {
                booking: {
                    include: {
                        customer: true,
                        vehicle: true,
                        branch: true
                    }
                }
            }
        });
    }

    async findByBranch(branchId: string) {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.contract.findMany({
                where: {
                    booking: {
                        branchId
                    }
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    booking: {
                        include: {
                            customer: true,
                            vehicle: true,
                            branch: true
                        }
                    }
                }
            }),
            this.prisma.contract.count({
                where: {
                    booking: {
                        branchId
                    }
                }
            })
        ]);

        return { items, total };
    }

    async create(dto: CreateContractDto, actorId?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: {
                customer: true,
                vehicle: true,
                branch: true
            }
        });

        if (!booking) throw new NotFoundException('Booking not found');

        const exists = await this.findByBooking(dto.bookingId);
        if (exists) throw new BadRequestException('Contract already exists for this booking');

        // 1. Tạo contract trong DB (chưa có fileUrl)
        const contract = await this.prisma.contract.create({
            data: {
                bookingId: dto.bookingId,
                contractNo: this.generateContractNo(),
                startDate: dto.startDate ? new Date(dto.startDate) : booking.pickupDate,
                endDate: dto.endDate ? new Date(dto.endDate) : booking.returnDate,
                totalAmount: dto.totalAmount ?? booking.totalAmount,
                depositAmount: dto.depositAmount,
                terms: dto.terms ?? 'Default rental contract terms...',
                notes: dto.notes,
                customerSignature: dto.customerSignature,
                employeeSignature: dto.employeeSignature,
                signedBy: dto.signedBy,
                fileUrl: null,
                status: 'DRAFT'
            }
        });

        // 2. Generate PDF hợp đồng từ dữ liệu booking + contract
        //    YÊU CẦU: đã cài `pdfkit` (npm i pdfkit @types/pdfkit)
        let fileUrl: string | null = null;
        let pdfError: string | null = null;

        try {
            console.log(`[Contract] Starting PDF generation for contract ${contract.contractNo}...`);
            const pdfBuffer = await this.generateContractPdfBuffer(booking, contract);
            console.log(`[Contract] PDF generated successfully, size: ${pdfBuffer.length} bytes`);

            // 3. Upload PDF lên Cloudinary (resource_type = raw cho PDF)
            const fakeFile: any = {
                buffer: pdfBuffer,
                mimetype: 'application/pdf',
                originalname: `contract-${contract.contractNo}.pdf`
            };

            console.log(`[Contract] Uploading PDF to Cloudinary...`);
            const uploaded = await this.cloudinary.uploadFile(fakeFile);
            fileUrl = uploaded.secure_url;
            console.log(`[Contract] PDF uploaded successfully: ${fileUrl}`);
        } catch (err: any) {
            pdfError = err?.message || 'Unknown error';
            console.error('[Contract] Failed to generate/upload PDF:', err);
            console.error('[Contract] Error stack:', err?.stack);
            // Tiếp tục tạo contract dù PDF fail (fileUrl = null)
            // Có thể tạo lại PDF sau bằng cách update contract
        }

        // 4. Lưu lại fileUrl vào contract (có thể null nếu PDF fail)
        const updated = await this.prisma.contract.update({
            where: { id: contract.id },
            data: { fileUrl }
        });

        // 5. Cập nhật trạng thái booking → CONTRACTED
        await this.prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'CONTRACTED' }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Contract', updated.id, updated);

        // Trả về contract kèm thông tin PDF generation
        return {
            ...updated,
            pdfGenerated: !!fileUrl,
            pdfError: pdfError || null
        };
    }

    async update(id: string, dto: UpdateContractDto, actorId?: string) {
        const before = await this.findOne(id);

        const contract = await this.prisma.contract.update({
            where: { id },
            data: {
                ...dto,
                startDate: dto.startDate ? new Date(dto.startDate) : before.startDate,
                endDate: dto.endDate ? new Date(dto.endDate) : before.endDate
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Contract', id, {
            before,
            after: contract
        });

        return contract;
    }

    async changeStatus(id: string, status: string, actorId?: string) {
        const contract = await this.prisma.contract.update({
            where: { id },
            data: { status }
        });

        await this.audit.log(actorId ?? null, 'STATUS', 'Contract', id, { status });

        return contract;
    }

    async sign(id: string, body: { customerSignature?: string; employeeSignature?: string; signedBy?: string; fileUrl?: string }, actorId?: string) {
        const before = await this.findOne(id);

        const contract = await this.prisma.contract.update({
            where: { id },
            data: {
                customerSignature: body.customerSignature ?? before.customerSignature,
                employeeSignature: body.employeeSignature ?? before.employeeSignature,
                signedBy: body.signedBy ?? before.signedBy,
                fileUrl: body.fileUrl ?? before.fileUrl,
                status: 'SIGNED'
            }
        });

        await this.audit.log(actorId ?? null, 'SIGN', 'Contract', id, { before, after: contract });
        return contract;
    }

    async delete(id: string, actorId?: string) {
        await this.audit.log(actorId ?? null, 'DELETE', 'Contract', id);
        return this.prisma.contract.delete({ where: { id } });
    }

    async attachFile(id: string, file: Express.Multer.File, actorId?: string) {
        const before = await this.findOne(id);
        if (!file) throw new BadRequestException('File is required');

        const uploaded = await this.cloudinary.uploadFile(file);

        const contract = await this.prisma.contract.update({
            where: { id },
            data: { fileUrl: uploaded.secure_url }
        });

        await this.audit.log(actorId ?? null, 'ATTACH_FILE', 'Contract', id, {
            before,
            after: contract
        });

        return contract;
    }

    /**
     * Generate PDF buffer cho hợp đồng dựa trên dữ liệu booking + contract.
     * Sử dụng pdfmake để hỗ trợ tiếng Việt tốt hơn pdfkit.
     */
    private async generateContractPdfBuffer(booking: any, contract: any): Promise<Buffer> {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const PdfPrinter = require('pdfmake');
        const fs = require('fs');
        const path = require('path');

        // Tìm font hỗ trợ tiếng Việt
        const robotoPath = path.join(process.cwd(), 'node_modules', 'pdfmake', 'build', 'fonts', 'Roboto');
        let fonts: any = {
            Roboto: {
                normal: path.join(robotoPath, 'Roboto-Regular.ttf'),
                bold: path.join(robotoPath, 'Roboto-Medium.ttf'),
                italics: path.join(robotoPath, 'Roboto-Italic.ttf'),
                bolditalics: path.join(robotoPath, 'Roboto-MediumItalic.ttf')
            }
        };

        // Thử tìm font Vietnamese
        const fontPaths = [
            path.join(process.cwd(), 'assets', 'fonts', 'arial-unicode.ttf'),
            path.join(process.cwd(), 'assets', 'fonts', 'NotoSans-Regular.ttf'),
            'C:/Windows/Fonts/arial.ttf',
        ];

        for (const fontPath of fontPaths) {
            if (fs.existsSync(fontPath)) {
                fonts.Vietnamese = {
                    normal: fontPath,
                    bold: fontPath,
                    italics: fontPath,
                    bolditalics: fontPath
                };
                break;
            }
        }

        const printer = new PdfPrinter(fonts);
        const defaultFont = fonts.Vietnamese ? 'Vietnamese' : 'Roboto';

        // Định nghĩa document content với pdfmake
        const docDefinition = {
            content: [
                { text: 'HỢP ĐỒNG THUÊ XE', style: 'header', alignment: 'center' },
                { text: '\n' },
                {
                    text: [
                        { text: 'Số hợp đồng: ', bold: true },
                        contract.contractNo
                    ],
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Ngày lập: ', bold: true },
                        new Date().toLocaleDateString('vi-VN')
                    ],
                    font: defaultFont
                },
                { text: '\n' },
                {
                    text: '1. Thông tin khách hàng',
                    style: 'sectionHeader',
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Họ tên: ', bold: true },
                        booking.customer?.fullName || ''
                    ],
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Điện thoại: ', bold: true },
                        booking.customer?.phone || ''
                    ],
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Email: ', bold: true },
                        booking.customer?.email || ''
                    ],
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Địa chỉ: ', bold: true },
                        booking.customer?.address || ''
                    ],
                    font: defaultFont
                },
                { text: '\n' },
                {
                    text: '2. Thông tin xe',
                    style: 'sectionHeader',
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Tên xe: ', bold: true },
                        booking.vehicle?.name || ''
                    ],
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Biển số: ', bold: true },
                        booking.vehicle?.licensePlate || ''
                    ],
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Loại xe: ', bold: true },
                        booking.vehicle?.vehicleType || ''
                    ],
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Màu: ', bold: true },
                        booking.vehicle?.color || ''
                    ],
                    font: defaultFont
                },
                { text: '\n' },
                {
                    text: '3. Thời gian thuê',
                    style: 'sectionHeader',
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Từ ngày: ', bold: true },
                        new Date(contract.startDate).toLocaleDateString('vi-VN'),
                        { text: ' đến ngày: ', bold: true },
                        new Date(contract.endDate).toLocaleDateString('vi-VN')
                    ],
                    font: defaultFont
                },
                { text: '\n' },
                {
                    text: '4. Thanh toán',
                    style: 'sectionHeader',
                    font: defaultFont
                },
                {
                    text: [
                        { text: 'Tổng tiền thuê: ', bold: true },
                        (contract.totalAmount ?? booking.totalAmount ?? 0).toLocaleString('vi-VN') + ' đ'
                    ],
                    font: defaultFont
                },
                ...(contract.depositAmount ? [{
                    text: [
                        { text: 'Tiền đặt cọc: ', bold: true },
                        contract.depositAmount.toLocaleString('vi-VN') + ' đ'
                    ],
                    font: defaultFont
                }] : []),
                { text: '\n' },
                {
                    text: '5. Điều khoản',
                    style: 'sectionHeader',
                    font: defaultFont
                },
                {
                    text: contract.terms || 'Default rental contract terms...',
                    font: defaultFont,
                    alignment: 'justify'
                },
                { text: '\n\n' },
                {
                    columns: [
                        {
                            text: [
                                { text: 'Đại diện bên cho thuê\n\n', font: defaultFont },
                                { text: '(Ký và ghi rõ họ tên)', fontSize: 10, font: defaultFont }
                            ],
                            width: '50%'
                        },
                        {
                            text: [
                                { text: 'Đại diện bên thuê\n\n', font: defaultFont, alignment: 'right' },
                                { text: '(Ký và ghi rõ họ tên)', fontSize: 10, font: defaultFont, alignment: 'right' }
                            ],
                            width: '50%',
                            alignment: 'right'
                        }
                    ]
                }
            ],
            styles: {
                header: {
                    fontSize: 20,
                    bold: true,
                    font: defaultFont
                },
                sectionHeader: {
                    fontSize: 14,
                    bold: true,
                    decoration: 'underline',
                    font: defaultFont
                }
            },
            defaultStyle: {
                font: defaultFont,
                fontSize: 12
            }
        };

        return new Promise<Buffer>((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: Buffer[] = [];

            pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err: any) => reject(err));

            pdfDoc.end();
        });
    }
}
