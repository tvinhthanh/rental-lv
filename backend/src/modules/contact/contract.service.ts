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
                vehicle: {
                    include: {
                        brand: true
                    }
                },
                branch: true,
                returnBranch: true
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
            const pdfBuffer = await this.generateContractPdfBuffer(booking, contract);

            // 3. Upload PDF lên Cloudinary (resource_type = raw cho PDF)
            const fakeFile: any = {
                buffer: pdfBuffer,
                mimetype: 'application/pdf',
                originalname: `contract-${contract.contractNo}.pdf`
            };

            const uploaded = await this.cloudinary.uploadFile(fakeFile);
            fileUrl = uploaded.secure_url;
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

        // Tìm font hỗ trợ tiếng Việt tốt nhất
        // Ưu tiên: Times New Roman (Windows), Arial Unicode MS, Noto Sans, Roboto
        const windowsFontsPath = process.platform === 'win32' 
            ? 'C:/Windows/Fonts' 
            : '/usr/share/fonts';
        
        let fonts: any = {};
        let defaultFont = 'Roboto';
        
        // 1. Thử Times New Roman (Windows - hỗ trợ tiếng Việt tốt)
        const timesNewRomanPaths = [
            path.join(windowsFontsPath, 'times.ttf'),
            path.join(windowsFontsPath, 'timesi.ttf'),
            path.join(windowsFontsPath, 'timesbd.ttf'),
            path.join(windowsFontsPath, 'timesbi.ttf'),
            'C:/Windows/Fonts/times.ttf',
            'C:/Windows/Fonts/timesi.ttf',
            'C:/Windows/Fonts/timesbd.ttf',
            'C:/Windows/Fonts/timesbi.ttf'
        ];
        
        if (fs.existsSync(timesNewRomanPaths[0])) {
            fonts.TimesNewRoman = {
                normal: timesNewRomanPaths[0],
                bold: fs.existsSync(timesNewRomanPaths[2]) ? timesNewRomanPaths[2] : timesNewRomanPaths[0],
                italics: fs.existsSync(timesNewRomanPaths[1]) ? timesNewRomanPaths[1] : timesNewRomanPaths[0],
                bolditalics: fs.existsSync(timesNewRomanPaths[3]) ? timesNewRomanPaths[3] : timesNewRomanPaths[0]
            };
            defaultFont = 'TimesNewRoman';
        }
        
        // 2. Thử Arial Unicode MS (hỗ trợ Unicode đầy đủ)
        const arialUnicodePaths = [
            path.join(windowsFontsPath, 'ARIALUNI.TTF'),
            'C:/Windows/Fonts/ARIALUNI.TTF',
            path.join(process.cwd(), 'assets', 'fonts', 'arial-unicode.ttf')
        ];
        
        for (const arialPath of arialUnicodePaths) {
            if (fs.existsSync(arialPath)) {
                fonts.ArialUnicode = {
                    normal: arialPath,
                    bold: arialPath,
                    italics: arialPath,
                    bolditalics: arialPath
                };
                defaultFont = 'ArialUnicode';
                break;
            }
        }
        
        // 3. Thử Arial (Windows)
        const arialPaths = [
            path.join(windowsFontsPath, 'arial.ttf'),
            path.join(windowsFontsPath, 'ariali.ttf'),
            path.join(windowsFontsPath, 'arialbd.ttf'),
            path.join(windowsFontsPath, 'arialbi.ttf'),
            'C:/Windows/Fonts/arial.ttf',
            'C:/Windows/Fonts/ariali.ttf',
            'C:/Windows/Fonts/arialbd.ttf',
            'C:/Windows/Fonts/arialbi.ttf'
        ];
        
        if (!fonts.ArialUnicode && fs.existsSync(arialPaths[0])) {
            fonts.Arial = {
                normal: arialPaths[0],
                bold: fs.existsSync(arialPaths[2]) ? arialPaths[2] : arialPaths[0],
                italics: fs.existsSync(arialPaths[1]) ? arialPaths[1] : arialPaths[0],
                bolditalics: fs.existsSync(arialPaths[3]) ? arialPaths[3] : arialPaths[0]
            };
            if (defaultFont === 'Roboto') {
                defaultFont = 'Arial';
            }
        }
        
        // 4. Thử Noto Sans (nếu có)
        const notoSansPaths = [
            path.join(process.cwd(), 'assets', 'fonts', 'NotoSans-Regular.ttf'),
            path.join(process.cwd(), 'assets', 'fonts', 'NotoSans-Bold.ttf'),
            path.join(process.cwd(), 'assets', 'fonts', 'NotoSans-Italic.ttf'),
            path.join(process.cwd(), 'assets', 'fonts', 'NotoSans-BoldItalic.ttf')
        ];
        
        if (fs.existsSync(notoSansPaths[0])) {
            fonts.NotoSans = {
                normal: notoSansPaths[0],
                bold: fs.existsSync(notoSansPaths[1]) ? notoSansPaths[1] : notoSansPaths[0],
                italics: fs.existsSync(notoSansPaths[2]) ? notoSansPaths[2] : notoSansPaths[0],
                bolditalics: fs.existsSync(notoSansPaths[3]) ? notoSansPaths[3] : notoSansPaths[0]
            };
            if (defaultFont === 'Roboto') {
                defaultFont = 'NotoSans';
            }
        }
        
        // 5. Fallback: Roboto (từ pdfmake)
        const robotoPath = path.join(process.cwd(), 'node_modules', 'pdfmake', 'build', 'fonts', 'Roboto');
        if (fs.existsSync(robotoPath)) {
            fonts.Roboto = {
                normal: path.join(robotoPath, 'Roboto-Regular.ttf'),
                bold: path.join(robotoPath, 'Roboto-Medium.ttf'),
                italics: path.join(robotoPath, 'Roboto-Italic.ttf'),
                bolditalics: path.join(robotoPath, 'Roboto-MediumItalic.ttf')
            };
        }

        const printer = new PdfPrinter(fonts);
        const currentDate = new Date();
        const contractDate = new Date(contract.startDate || booking.pickupDate);
        const returnDate = new Date(contract.endDate || booking.returnDate);
        const daysDiff = Math.ceil((returnDate.getTime() - contractDate.getTime()) / (1000 * 60 * 60 * 24));

        // Định nghĩa document content với pdfmake - Form chuẩn
        // Lưu defaultFont vào biến để dùng trong closure
        const fontName = defaultFont;
        
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [60, 80, 60, 80],
            header: function(currentPage: number, pageCount: number) {
                return {
                    margin: [60, 20, 60, 0],
                    columns: [
                        {
                            text: 'RENTAL SYSTEM',
                            fontSize: 16,
                            bold: true,
                            color: '#1e40af',
                            font: fontName
                        },
                        {
                            text: `Trang ${currentPage}/${pageCount}`,
                            fontSize: 10,
                            alignment: 'right',
                            color: '#6b7280',
                            font: fontName
                        }
                    ]
                };
            },
            footer: function(currentPage: number, pageCount: number) {
                return {
                    margin: [60, 10, 60, 20],
                    text: [
                        { text: 'Hotline: 1900 1234 | Email: info@rentalsystem.com\n', fontSize: 9, color: '#6b7280', font: fontName },
                        { text: 'Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM', fontSize: 9, color: '#6b7280', font: fontName }
                    ],
                    alignment: 'center'
                };
            },
            content: [
                // Header với border
                {
                    margin: [0, 0, 0, 20],
                    table: {
                        widths: ['*'],
                        body: [[
                            {
                                text: 'HỢP ĐỒNG THUÊ XE',
                                style: 'header',
                                alignment: 'center',
                                border: [false, false, false, true],
                                borderColor: '#1e40af',
                                borderLineWidth: 2,
                                margin: [0, 0, 0, 10]
                            }
                        ]]
                    },
                    layout: 'noBorders'
                },
                
                // Thông tin hợp đồng
                {
                    margin: [0, 0, 0, 15],
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [
                                {
                                    text: [
                                        { text: 'Số hợp đồng: ', bold: true, font: fontName },
                                        { text: contract.contractNo, font: fontName }
                                    ],
                                    border: [false, false, false, false]
                                },
                                {
                                    text: [
                                        { text: 'Ngày lập: ', bold: true, font: fontName },
                                        { text: currentDate.toLocaleDateString('vi-VN'), font: fontName }
                                    ],
                                    border: [false, false, false, false],
                                    alignment: 'right'
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders'
                },

                // 1. Thông tin khách hàng - Table format
                {
                    text: '1. THÔNG TIN KHÁCH HÀNG',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 10]
                },
                {
                    margin: [0, 0, 0, 15],
                    table: {
                        widths: ['30%', '70%'],
                        body: [
                            [
                                { text: 'Họ và tên:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.customer?.fullName || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Số CMND/CCCD:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.customer?.nationalId || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Số bằng lái xe:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.customer?.driverLicenseNo || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Ngày hết hạn bằng lái:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.customer?.driverLicenseExpiry 
                                    ? new Date(booking.customer.driverLicenseExpiry).toLocaleDateString('vi-VN')
                                    : 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Điện thoại:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.customer?.phone || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Email:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.customer?.email || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Địa chỉ:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.customer?.address || 'N/A', font: fontName }
                            ]
                        ]
                    }
                },

                // 2. Thông tin xe - Table format
                {
                    text: '2. THÔNG TIN XE',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 10]
                },
                {
                    margin: [0, 0, 0, 15],
                    table: {
                        widths: ['30%', '70%'],
                        body: [
                            [
                                { text: 'Tên xe:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.vehicle?.name || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Biển số:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.vehicle?.licensePlate || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Hãng xe:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.vehicle?.brand?.name || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Loại xe:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.vehicle?.vehicleType || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Màu sắc:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.vehicle?.color || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Số chỗ ngồi:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.vehicle?.seatCount?.toString() || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Chi nhánh:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.branch?.name || 'N/A', font: fontName }
                            ]
                        ]
                    }
                },

                // 3. Thời gian thuê - Table format
                {
                    text: '3. THỜI GIAN THUÊ',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 10]
                },
                {
                    margin: [0, 0, 0, 15],
                    table: {
                        widths: ['30%', '70%'],
                        body: [
                            [
                                { text: 'Ngày nhận xe:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: contractDate.toLocaleDateString('vi-VN') + ' ' + contractDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), font: fontName }
                            ],
                            [
                                { text: 'Ngày trả xe:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: returnDate.toLocaleDateString('vi-VN') + ' ' + returnDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), font: fontName }
                            ],
                            [
                                { text: 'Số ngày thuê:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: `${daysDiff} ngày`, font: fontName }
                            ],
                            [
                                { text: 'Địa điểm nhận xe:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.branch?.address || booking.branch?.name || 'N/A', font: fontName }
                            ],
                            [
                                { text: 'Địa điểm trả xe:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: booking.returnBranch?.address || booking.returnBranch?.name || booking.branch?.address || booking.branch?.name || 'N/A', font: fontName }
                            ]
                        ]
                    }
                },

                // 4. Thanh toán - Table format
                {
                    text: '4. THANH TOÁN',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 10]
                },
                {
                    margin: [0, 0, 0, 15],
                    table: {
                        widths: ['30%', '70%'],
                        body: [
                            [
                                { text: 'Tổng tiền thuê:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: (contract.totalAmount ?? booking.totalAmount ?? 0).toLocaleString('vi-VN') + ' đ', font: fontName, color: '#1e40af', bold: true }
                            ],
                            ...(contract.depositAmount ? [[
                                { text: 'Tiền đặt cọc:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: contract.depositAmount.toLocaleString('vi-VN') + ' đ', font: fontName }
                            ]] : []),
                            [
                                { text: 'Phương thức thanh toán:', bold: true, font: fontName, fillColor: '#f3f4f6' },
                                { text: 'Chưa thanh toán', font: fontName }
                            ]
                        ]
                    }
                },

                // 5. Điều khoản
                {
                    text: '5. ĐIỀU KHOẢN VÀ ĐIỀU KIỆN',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 10]
                },
                {
                    text: contract.terms || this.getDefaultTerms(),
                    font: fontName,
                    alignment: 'justify',
                    margin: [0, 0, 0, 20],
                    lineHeight: 1.5
                },

                // Chữ ký
                {
                    margin: [0, 30, 0, 0],
                    columns: [
                        {
                            text: [
                                { text: 'ĐẠI DIỆN BÊN CHO THUÊ\n\n\n', bold: true, fontSize: 12, font: fontName, alignment: 'center' },
                                { text: '(Ký và ghi rõ họ tên)', fontSize: 10, font: fontName, italics: true }
                            ],
                            width: '50%',
                            alignment: 'center'
                        },
                        {
                            text: [
                                { text: 'ĐẠI DIỆN BÊN THUÊ\n\n\n', bold: true, fontSize: 12, font: fontName, alignment: 'center' },
                                { text: '(Ký và ghi rõ họ tên)', fontSize: 10, font: fontName, italics: true }
                            ],
                            width: '50%',
                            alignment: 'center'
                        }
                    ]
                }
            ],
            styles: {
                header: {
                    fontSize: 22,
                    bold: true,
                    color: '#1e40af',
                    font: fontName,
                    margin: [0, 10, 0, 10]
                },
                sectionHeader: {
                    fontSize: 14,
                    bold: true,
                    color: '#1e40af',
                    font: fontName,
                    margin: [0, 5, 0, 5]
                }
            },
            defaultStyle: {
                font: fontName,
                fontSize: 11,
                lineHeight: 1.5,
                characterSpacing: 0
            },
            // Đảm bảo encoding UTF-8 cho tiếng Việt
            info: {
                title: 'Hợp đồng thuê xe',
                author: 'Rental System',
                subject: 'Hợp đồng thuê xe',
                creator: 'Rental System',
                producer: 'Rental System PDF Generator'
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

    /**
     * Default terms cho hợp đồng thuê xe
     */
    private getDefaultTerms(): string {
        return `Điều 1: Bên cho thuê cam kết cung cấp xe đúng như thông tin đã thỏa thuận, đảm bảo chất lượng và an toàn.

Điều 2: Bên thuê có trách nhiệm:
- Sử dụng xe đúng mục đích, không vi phạm pháp luật
- Bảo quản và giữ gìn xe cẩn thận
- Thanh toán đầy đủ các khoản phí theo hợp đồng
- Trả xe đúng thời gian và địa điểm đã thỏa thuận
- Chịu trách nhiệm về các vi phạm giao thông trong thời gian thuê

Điều 3: Bên cho thuê có quyền:
- Yêu cầu bên thuê thanh toán đầy đủ các khoản phí
- Thu hồi xe nếu bên thuê vi phạm điều khoản hợp đồng
- Yêu cầu bồi thường thiệt hại nếu xe bị hư hỏng do lỗi của bên thuê

Điều 4: Trường hợp xe bị hư hỏng, tai nạn:
- Bên thuê phải báo ngay cho bên cho thuê
- Bên thuê chịu trách nhiệm về các chi phí sửa chữa, bảo hiểm
- Nếu xe không thể sửa chữa được, bên thuê phải bồi thường theo giá trị thị trường

Điều 5: Hợp đồng có hiệu lực từ ngày ký và kết thúc khi bên thuê trả xe và thanh toán đầy đủ các khoản phí.

Điều 6: Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng. Nếu không thỏa thuận được, sẽ đưa ra Tòa án có thẩm quyền.`;
    }
}
