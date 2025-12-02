import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateReturnReportDto } from './dto/create-return-report.dto';

@Injectable()
export class ReturnReportService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findByBooking(bookingId: string) {
        return this.prisma.returnReport.findUnique({
            where: { bookingId },
            include: {
                booking: true,
                returnBranch: true
            }
        });
    }

    async create(dto: CreateReturnReportDto, actorId?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: { 
                invoice: true,
                contract: true,
                deposit: true,
                handover: true
            }
        });
        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.status !== 'ONGOING') {
            throw new BadRequestException('Booking must be ONGOING before creating return report');
        }

        if (!booking.contract) {
            throw new BadRequestException('Contract must be created before return report');
        }

        if (!booking.deposit) {
            throw new BadRequestException('Deposit must be created before return report');
        }

        if (!booking.handover) {
            throw new BadRequestException('Handover must be created before return report');
        }

        const existing = await this.prisma.returnReport.findUnique({
            where: { bookingId: dto.bookingId }
        });

        const data = {
            bookingId: dto.bookingId,
            odoEnd: dto.odoEnd,
            fuelLevelEnd: dto.fuelLevelEnd,
            damageNote: dto.damageNote,
            extraCharge: dto.extraCharge,
            condition: dto.condition,
            checklist: dto.checklist,
            returnBranchId: dto.returnBranchId,
            note: dto.note,
            photoUrls: dto.photoUrls ?? [],
        };

        let report;

        if (existing) {
            report = await this.prisma.returnReport.update({
                where: { bookingId: dto.bookingId },
                data
            });
            await this.audit.log(actorId ?? null, 'UPDATE', 'ReturnReport', existing.id, { before: existing, after: report });
        } else {
            report = await this.prisma.returnReport.create({ data });
            await this.audit.log(actorId ?? null, 'CREATE', 'ReturnReport', report.id, report);
        }

        // Tính toán surcharges sẽ tạo và tự động tạo invoice nếu chưa có
        const handover = booking.handover;
        const surchargesToCreate: Array<{ 
            name: string; 
            amount: number; 
            description?: string;
            surchargeType?: string;
            occurredAt?: Date;
            evidenceUrl?: string;
        }> = [];

        // Lấy ảnh từ photoUrls làm evidence nếu có
        const photoUrls = dto.photoUrls && dto.photoUrls.length > 0 ? dto.photoUrls : [];
        const evidenceUrl = photoUrls.length > 0 ? photoUrls[0] : undefined; // Ảnh đầu tiên làm evidence
        const occurredAt = new Date(); // Ngày trả xe

        if (handover) {
            if (dto.fuelSurchargeAmount && handover.fuelLevelStart !== null && dto.fuelLevelEnd !== undefined && dto.fuelLevelEnd < (handover.fuelLevelStart ?? 0)) {
                surchargesToCreate.push({
                    name: 'Fuel shortage',
                    amount: dto.fuelSurchargeAmount,
                    description: `Fuel level on return (${dto.fuelLevelEnd}%) is lower than pickup (${handover.fuelLevelStart}%)`,
                    surchargeType: 'FUEL_SHORTAGE',
                    occurredAt,
                    evidenceUrl // Có thể có ảnh chứng minh mức nhiên liệu
                });
            }

            if (dto.overKmSurchargeAmount && handover.odoStart !== null && dto.odoEnd !== undefined && dto.odoEnd > (handover.odoStart ?? 0)) {
                const overKm = dto.odoEnd - handover.odoStart;
                surchargesToCreate.push({
                    name: 'Over mileage',
                    amount: dto.overKmSurchargeAmount,
                    description: `Mileage exceeded: ${handover.odoStart} km → ${dto.odoEnd} km (over ${overKm} km)`,
                    surchargeType: 'OVER_MILEAGE',
                    occurredAt,
                    evidenceUrl // Có thể có ảnh đồng hồ km
                });
            }
        }

        // Damage surcharge - sử dụng ảnh hư hỏng nếu có
        if (dto.damageSurchargeAmount && dto.damageNote) {
            let damageDescription = dto.damageNote;
            if (photoUrls.length > 0) {
                damageDescription += `\n\nẢnh đính kèm (${photoUrls.length} ảnh):\n${photoUrls.map((url, idx) => `${idx + 1}. ${url}`).join('\n')}`;
            }
            
            surchargesToCreate.push({
                name: 'Damage fee',
                amount: dto.damageSurchargeAmount,
                description: damageDescription,
                surchargeType: 'DAMAGE',
                occurredAt,
                evidenceUrl: photoUrls.length > 0 ? photoUrls[0] : undefined // Ảnh hư hỏng đầu tiên làm evidence chính
            });
        }

        // Extra charge - phí phát sinh khác (nếu có)
        if (dto.extraCharge && dto.extraCharge > 0) {
            surchargesToCreate.push({
                name: 'Extra charge',
                amount: dto.extraCharge,
                description: dto.note || 'Phí phát sinh khác',
                surchargeType: 'OTHER',
                occurredAt,
                evidenceUrl: photoUrls.length > 0 ? photoUrls[0] : undefined // Có thể có ảnh chứng minh
            });
        }

        // Tính tổng surcharge
        const surchargeTotal = surchargesToCreate.reduce((sum, item) => sum + item.amount, 0);

        // Nếu có surcharge hoặc chưa có invoice, tạo/cập nhật invoice
        if (surchargesToCreate.length > 0 || !booking.invoice) {
            let invoiceId: string;

            if (!booking.invoice) {
                // Tạo invoice mới
                const { randomUUID } = require('crypto');
                const invoiceNo = 'INV-' + randomUUID().slice(0, 8).toUpperCase();
                
                const subtotal = booking.totalAmount || booking.baseAmount || 0;
                const discountTotal = booking.discountAmount || 0;
                const depositApplied = booking.deposit?.usedAmount || booking.deposit?.totalAmount || 0;
                const totalAmount = subtotal + surchargeTotal - discountTotal - depositApplied;

                const newInvoice = await this.prisma.invoice.create({
                    data: {
                        invoiceNo,
                        bookingId: booking.id,
                        customerId: booking.customerId,
                        subtotal,
                        surchargeTotal,
                        discountTotal,
                        depositApplied,
                        totalAmount,
                        status: 'UNPAID'
                    }
                });

                invoiceId = newInvoice.id;
                await this.audit.log(actorId ?? null, 'CREATE', 'Invoice', newInvoice.id, newInvoice);
            } else {
                invoiceId = booking.invoice.id;
            }

            // Tạo các surcharge
            for (const item of surchargesToCreate) {
                await this.prisma.surcharge.create({
                    data: {
                        invoiceId,
                        name: item.name,
                        description: item.description,
                        amount: item.amount,
                        surchargeType: item.surchargeType,
                        occurredAt: item.occurredAt,
                        evidenceUrl: item.evidenceUrl,
                        createdBy: actorId,
                        status: 'ACTIVE'
                    }
                });
            }

            // Cập nhật lại tổng surcharge và totalAmount của invoice
            if (surchargesToCreate.length > 0) {
                const allSurcharges = await this.prisma.surcharge.findMany({
                    where: { invoiceId }
                });
                const totalSurcharge = allSurcharges.reduce((sum, s) => sum + (s.amount || 0), 0);
                
                const invoice = await this.prisma.invoice.findUnique({
                    where: { id: invoiceId }
                });

                if (invoice) {
                    const subtotal = invoice.subtotal || booking.totalAmount || booking.baseAmount || 0;
                    const discountTotal = invoice.discountTotal || booking.discountAmount || 0;
                    const depositApplied = invoice.depositApplied || booking.deposit?.usedAmount || booking.deposit?.totalAmount || 0;
                    const totalAmount = subtotal + totalSurcharge - discountTotal - depositApplied;

                    await this.prisma.invoice.update({
                        where: { id: invoiceId },
                        data: {
                            surchargeTotal: totalSurcharge,
                            totalAmount
                        }
                    });
                }
            }
        }

        return report;
    }

    async findByBranch(branchId: string) {
        console.log(`[ReturnReportService] findByBranch called with branchId: ${branchId}`);
        
        // Hiển thị return reports của bookings thuộc branch này HOẶC được trả về tại branch này
        const [items, total] = await Promise.all([
            this.prisma.returnReport.findMany({
                where: {
                    OR: [
                        {
                            booking: {
                                branchId
                            }
                        },
                        {
                            returnBranchId: branchId
                        }
                    ]
                },
                include: {
                    booking: {
                        include: {
                            customer: true,
                            vehicle: {
                                include: {
                                    category: true,
                                    branch: true
                                }
                            },
                            branch: true
                        }
                    },
                    returnBranch: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.returnReport.count({
                where: {
                    OR: [
                        {
                            booking: {
                                branchId
                            }
                        },
                        {
                            returnBranchId: branchId
                        }
                    ]
                }
            })
        ]);

        console.log(`[ReturnReportService] Found ${items.length} return reports for branch ${branchId}`);
        if (items.length > 0) {
            console.log(`[ReturnReportService] Sample booking branchId: ${items[0]?.booking?.branchId}, returnBranchId: ${items[0]?.returnBranchId}`);
        }

        return {
            items,
            total
        };
    }
}
