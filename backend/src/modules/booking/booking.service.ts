import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class BookingService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    // ============= GENERATE BOOKING CODE =============
    generateBookingCode() {
        return 'BKG-' + randomBytes(4).toString('hex').toUpperCase();
    }

    // ============= CHECK VEHICLE AVAILABLE =============
    async checkVehicleAvailable(vehicleId: string, pickup: Date, rt: Date) {
        const overlapping = await this.prisma.booking.findFirst({
            where: {
                vehicleId,
                status: { in: ['PENDING', 'CONFIRMED', 'ONGOING'] },
                OR: [
                    {
                        pickupDate: { lte: rt },
                        returnDate: { gte: pickup }
                    }
                ]
            }
        });

        return !overlapping;
    }

    // ============= AUTO CALCULATE PRICE =============
    async calcPrice(vehicleId: string, pickup: Date, rt: Date) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
            include: { priceList: true }
        });

        if (!vehicle) throw new NotFoundException('Vehicle not found');
        if (!vehicle.priceList) throw new BadRequestException('Vehicle has no price list');

        const ms = rt.getTime() - pickup.getTime();
        const days = Math.ceil(ms / (1000 * 60 * 60 * 24));

        const base = days * vehicle.priceList.dailyRate;

        return base;
    }

    // ============= LIST =============
    async findAll(query: BookingQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.bookingCode = { contains: query.search, mode: 'insensitive' };
        }

        if (query.status) where.status = query.status;
        if (query.branchId) where.branchId = query.branchId;
        if (query.customerId) where.customerId = query.customerId;
        if (query.vehicleId) where.vehicleId = query.vehicleId;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: true,
                    vehicle: true,
                    branch: true,
                    returnBranch: true,
                    contract: true,
                    deposit: true,
                    handover: true,
                    returnReport: true,
                    invoice: true
                }
            }),
            this.prisma.booking.count({ where })
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    // ============= DETAIL =============
    async findOne(id: string) {
        const b = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                customer: true,
                vehicle: true,
                branch: true,
                returnBranch: true,
                contract: true,
                deposit: true,
                handover: true,
                returnReport: true,
                invoice: true
            }
        });

        if (!b) throw new NotFoundException('Booking not found');
        return b;
    }

    // ============= CREATE BOOKING =============
    async create(dto: CreateBookingDto, actorId?: string) {
        const pickup = new Date(dto.pickupDate);
        const rt = new Date(dto.returnDate);

        if (pickup >= rt) throw new BadRequestException('Invalid pickup/return date');

        const available = await this.checkVehicleAvailable(dto.vehicleId, pickup, rt);
        if (!available) throw new BadRequestException('Vehicle not available for selected dates');

        const baseAmount = await this.calcPrice(dto.vehicleId, pickup, rt);
        const discount = dto.discountAmount ?? 0;
        const total = baseAmount - discount;

        const booking = await this.prisma.booking.create({
            data: {
                bookingCode: this.generateBookingCode(),
                customerId: dto.customerId,
                vehicleId: dto.vehicleId,
                branchId: dto.branchId,
                returnBranchId: dto.returnBranchId,
                pickupDate: pickup,
                returnDate: rt,
                baseAmount,
                discountAmount: discount,
                totalAmount: total,
                promotionId: dto.promotionId,
                note: dto.note,
                status: 'PENDING'
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Booking', booking.id, booking);

        return booking;
    }

    // ============= UPDATE BOOKING =============
    async update(id: string, dto: UpdateBookingDto, actorId?: string) {
        const before = await this.findOne(id);

        const pickup = dto.pickupDate ? new Date(dto.pickupDate) : before.pickupDate;
        const rt = dto.returnDate ? new Date(dto.returnDate) : before.returnDate;

        if (pickup >= rt) throw new BadRequestException('Invalid pickup/return date');

        const updated = await this.prisma.booking.update({
            where: { id },
            data: dto
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Booking', id, {
            before,
            after: updated
        });

        return updated;
    }

    // ============= CHANGE STATUS =============
    async changeStatus(id: string, status: string, actorId?: string) {
        const updated = await this.prisma.booking.update({
            where: { id },
            data: { status }
        });

        await this.audit.log(actorId ?? null, 'STATUS', 'Booking', id, { status });

        return updated;
    }

    // ============= CANCEL =============
    async cancel(id: string, reason: string, actorId?: string) {
        const updated = await this.prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED', cancelReason: reason }
        });

        await this.audit.log(actorId ?? null, 'CANCEL', 'Booking', id, { reason });

        return updated;
    }

    // ============= DELETE =============
    async delete(id: string, actorId?: string) {
        await this.audit.log(actorId ?? null, 'DELETE', 'Booking', id);
        return this.prisma.booking.delete({ where: { id } });
    }

    // booking.service.ts

    async getDateAvailable(vehicleId: string) {
        const bookings = await this.prisma.booking.findMany({
            where: {
                vehicleId,
                status: { in: ["PENDING", "CONFIRMED", "ONGOING"] },
            },
            select: {
                pickupDate: true,
                returnDate: true,
            },
            orderBy: { pickupDate: "asc" }
        });

        if (!bookings.length) {
            return {
                vehicleId,
                unavailableRanges: [],
                dates: [],
            };
        }

        // Convert từng range
        const ranges = bookings.map(b => ({
            start: b.pickupDate,
            end: b.returnDate
        }));

        // Gom ranges bị overlap thành 1 block
        const merged = [];
        let current = ranges[0];

        for (let i = 1; i < ranges.length; i++) {
            const next = ranges[i];

            // Nếu overlap → merge
            if (next.start <= current.end) {
                current.end = new Date(
                    Math.max(current.end.getTime(), next.end.getTime())
                );
            } else {
                merged.push(current);
                current = next;
            }
        }
        merged.push(current);

        // Flatten thành list từng ngày (nếu FE cần)
        const unavailableDates: string[] = [];

        merged.forEach(range => {
            const cursor = new Date(range.start);

            while (cursor <= range.end) {
                unavailableDates.push(new Date(cursor).toISOString().split("T")[0]);
                cursor.setDate(cursor.getDate() + 1);
            }
        });

        return {
            vehicleId,
            unavailableRanges: merged.map(m => ({
                start: m.start.toISOString().split("T")[0],
                end: m.end.toISOString().split("T")[0],
            })),
            dates: unavailableDates
        };
    }

    async getByBranch(branchId: string) {
        const [items, total] = await Promise.all([
            this.prisma.booking.findMany({
                where: { branchId },
                include: {
                    customer: true,
                    vehicle: {
                        include: {
                            category: true,
                            branch: true,
                        },
                    },
                    branch: true,
                    returnBranch: true,
                    contract: true,
                    deposit: true,
                    handover: true,
                    returnReport: true,
                    invoice: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.booking.count({
                where: { branchId }
            })
        ]);

        return {
            items,
            total
        };
    }


}
