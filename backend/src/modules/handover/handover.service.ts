import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateHandoverDto } from './dto/create-handover.dto';

@Injectable()
export class HandoverService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findByBooking(bookingId: string) {
        return this.prisma.handover.findUnique({
            where: { bookingId },
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
                employee: true
            }
        });
    }

    async create(dto: CreateHandoverDto, actorId?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: { deposit: true }
        });
        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.status !== 'CONTRACTED') {
            throw new BadRequestException('Booking must be CONTRACTED before handover');
        }

        if (!booking.deposit) {
            throw new BadRequestException('Deposit must be created before handover');
        }

        const existing = await this.prisma.handover.findUnique({
            where: { bookingId: dto.bookingId }
        });

        if (existing) {
            const updated = await this.prisma.handover.update({
                where: { bookingId: dto.bookingId },
                data: {
                    ...dto,
                    employeeId: dto.employeeId ?? existing.employeeId,
                    photoUrls: dto.photoUrls ?? existing.photoUrls
                }
            });

            await this.audit.log(actorId ?? null, 'UPDATE', 'Handover', existing.id, {
                before: existing,
                after: updated
            });

            return updated;
        }

        const handover = await this.prisma.handover.create({
            data: {
                ...dto,
                employeeId: dto.employeeId ?? null,
                photoUrls: dto.photoUrls ?? []
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Handover', handover.id, handover);

        // Check nếu đã có deposit → chuyển booking sang ONGOING
        const deposit = await this.prisma.deposit.findUnique({
            where: { bookingId: dto.bookingId }
        });

        if (deposit) {
            await this.prisma.booking.update({
                where: { id: dto.bookingId },
                data: { status: 'ONGOING' }
            });
        }

        return handover;
    }

    async findByBranch(branchId: string) {
        const [items, total] = await Promise.all([
            this.prisma.handover.findMany({
                where: {
                    booking: {
                        branchId
                    }
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
                    employee: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.handover.count({
                where: {
                    booking: {
                        branchId
                    }
                }
            })
        ]);

        return {
            items,
            total
        };
    }
}