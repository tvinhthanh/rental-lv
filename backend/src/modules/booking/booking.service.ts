import { BadRequestException, Injectable, NotFoundException, Inject, forwardRef, Optional } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { randomBytes } from 'crypto';
import { checkVehicleDocumentsComplete } from '@/common/utils/vehicle-document-checker';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RedisService } from '@/shared/redis/redis.service';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class BookingService {

    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService,
        private redisService: RedisService,
        @InjectQueue('booking-queue') private bookingQueue: Queue,
        @Optional() @Inject(forwardRef(() => NotificationGateway))
        private notificationGateway?: NotificationGateway
    ) { }

    //  GENERATE BOOKING CODE 
    generateBookingCode() {
        return 'BKG-' + randomBytes(4).toString('hex').toUpperCase();
    }

    //  CHECK VEHICLE AVAILABLE 
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

    //  AUTO CALCULATE PRICE 
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

    private async validatePromotion(promotionId: string) {
        const promo = await this.prisma.promotion.findUnique({ where: { id: promotionId } });
        if (!promo) throw new BadRequestException('Promotion not found');
        if (promo.status !== 'ACTIVE') throw new BadRequestException('Promotion is not active');

        const now = new Date();
        if (promo.startDate) {
            const start = new Date(promo.startDate);
            start.setHours(0, 0, 0, 0);
            if (start > now) {
                throw new BadRequestException('Promotion not started');
            }
        }
        if (promo.endDate) {
            const end = new Date(promo.endDate);
            end.setHours(23, 59, 59, 999);
            if (end < now) {
                throw new BadRequestException('Promotion expired');
            }
        }
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            throw new BadRequestException('Promotion usage limit reached');
        }
        return promo;
    }

    //  CHECK VEHICLE DOCUMENTS 
    private async checkVehicleDocuments(vehicleId: string) {
        const { isValid, missingDocs } = await checkVehicleDocumentsComplete(this.prisma, vehicleId);

        if (!isValid) {
            const docNames: Record<string, string> = {
                'REGISTRATION': 'Đăng kiểm',
                'INSURANCE': 'Bảo hiểm'
            };

            const missingNames = missingDocs.map(doc => {
                const baseType = doc.split(' ')[0];
                return docNames[baseType] || baseType;
            }).join(', ');

            throw new BadRequestException(
                `Xe chưa đủ giấy tờ để cho thuê. Thiếu: ${missingNames}. Vui lòng cập nhật giấy tờ xe trước khi cho phép thuê.`
            );
        }

        return true;
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
                    invoice: true,
                    review: true,
                    promotion: true
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

    //  DETAIL 
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
                invoice: true,
                review: true,
                promotion: true
            }
        });

        if (!b) throw new NotFoundException('Booking not found');
        return b;
    }

    //  CREATE BOOKING 
    async create(dto: CreateBookingDto, actorId?: string) {
        const lockToken = await this.redisService.acquireLock(`vehicle:${dto.vehicleId}`, 10000);
        if (!lockToken) {
            throw new BadRequestException('Hệ thống đang xử lý giao dịch cho xe này, vui lòng thử lại sau.');
        }
        try {
            const pickup = new Date(dto.pickupDate);
            const rt = new Date(dto.returnDate);

            if (pickup >= rt) throw new BadRequestException('Invalid pickup/return date');

            // Kiểm tra thông tin khách hàng - bắt buộc có số bằng lái
            const customer = await this.prisma.customer.findUnique({
                where: { id: dto.customerId },
                select: { id: true, fullName: true, driverLicenseNo: true, driverLicenseExpiry: true }
            });
            if (!customer) throw new BadRequestException('Customer not found');
            if (!customer.driverLicenseNo) {
                throw new BadRequestException('Customer must provide driver license number before booking');
            }
            if (customer.driverLicenseExpiry) {
                const expiry = new Date(customer.driverLicenseExpiry);
                const now = new Date();
                if (expiry < now) {
                    throw new BadRequestException('Driver license is expired');
                }
            }

            // check xem xe có available không 1. xe có đang có booking nào không 2. xe có đang có maintenance nào không 3. xe active không
            const available = await this.checkVehicleAvailable(dto.vehicleId, pickup, rt);
            if (!available) throw new BadRequestException('Vehicle not available for selected dates');

            // Kiểm tra giấy tờ xe - nếu thiếu thì không cho thuê
            await this.checkVehicleDocuments(dto.vehicleId);

            const baseAmount = await this.calcPrice(dto.vehicleId, pickup, rt);
            let discount = dto.discountAmount ?? 0;
            let promotionId = dto.promotionId;

            if (promotionId) {
                const promo = await this.validatePromotion(promotionId);
                const promoDiscount = promo.discountPercent
                    ? (baseAmount * promo.discountPercent) / 100
                    : promo.discountAmount || 0;
                if (dto.discountAmount === undefined) {
                    discount = promoDiscount;
                }
                discount = Math.min(discount, baseAmount);
            }

            const total = Math.max(baseAmount - discount, 0);

            const [booking] = await this.prisma.$transaction([
                this.prisma.booking.create({
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
                        promotionId,
                        note: dto.note,
                        status: 'PENDING'
                    }
                }),
                ...(promotionId
                    ? [this.prisma.promotion.update({
                        where: { id: promotionId },
                        data: { usedCount: { increment: 1 } }
                    })]
                    : [])
            ]);

            await this.audit.log(actorId ?? null, 'CREATE', 'Booking', booking.id, booking);

            // Queue booking for auto-cancel if not paid/confirmed within 30 minutes (async, non-blocking)
            this.bookingQueue.add(
                'auto-cancel',
                { bookingId: booking.id },
                { delay: 30 * 60 * 1000 } // 30 minutes
            ).catch(err => {
                console.error('Failed to add booking auto-cancel job:', err);
            });

            // Send notification to customer and employees (async, non-blocking)
            this.sendBookingNotification(dto.customerId, dto.branchId, booking.bookingCode, booking.id).catch(err => {
                console.error('Failed to send booking notification:', err);
            });

            return booking;
        } finally {
            await this.redisService.releaseLock(`vehicle:${dto.vehicleId}`, lockToken);
        }
    }

    private async sendBookingNotification(
        customerId: string,
        branchId: string,
        bookingCode: string,
        bookingId: string
    ) {
        try {
            if (!this.notificationGateway) return;

            // 1. Send notification to customer
            const customer = await this.prisma.customer.findUnique({
                where: { id: customerId },
                select: { userId: true, fullName: true }
            });

            if (customer?.userId) {
                // Emit socket event to customer
                this.notificationGateway.emitToUser(customer.userId, 'booking:created', {
                    bookingCode,
                    message: `Bạn đã đặt xe thành công với mã booking: ${bookingCode}`
                });

                // Create database notification record for customer
                await this.prisma.notification.create({
                    data: {
                        userId: customer.userId,
                        title: 'Đặt xe thành công',
                        message: `Bạn đã đặt xe thành công với mã booking: ${bookingCode}`,
                        status: 'UNREAD'
                    }
                });
            }

            // 2. Send notification to all employees of the branch
            const employees = await this.prisma.employee.findMany({
                where: {
                    branchId: branchId,
                    userId: { not: null }
                },
                select: {
                    userId: true,
                    fullName: true
                }
            });

            if (employees.length > 0) {
                const customerName = customer?.fullName || 'Khách hàng';

                for (const employee of employees) {
                    if (!employee.userId) continue;

                    // Emit socket event to employee
                    this.notificationGateway.emitToUser(employee.userId, 'booking:created', {
                        bookingCode,
                        message: `Có đơn đặt xe mới từ ${customerName} - Mã booking: ${bookingCode}`
                    });

                    // Create database notification record for employee
                    await this.prisma.notification.create({
                        data: {
                            userId: employee.userId,
                            title: 'Đơn đặt xe mới',
                            message: `Có đơn đặt xe mới từ ${customerName} - Mã booking: ${bookingCode}`,
                            status: 'UNREAD'
                        }
                    });
                }
            }
        } catch (err) {
            // Ignore - notification is optional
            console.error('Error sending booking notifications:', err);
        }
    }

    //  UPDATE BOOKING 
    async update(id: string, dto: UpdateBookingDto, actorId?: string) {
        const before = await this.findOne(id);

        const pickup = dto.pickupDate ? new Date(dto.pickupDate) : before.pickupDate;
        const rt = dto.returnDate ? new Date(dto.returnDate) : before.returnDate;

        if (pickup >= rt) throw new BadRequestException('Invalid pickup/return date');
        if (dto.promotionId) {
            await this.validatePromotion(dto.promotionId);
        }

        const vehicleId = dto.vehicleId ?? before.vehicleId;
        const lockToken = await this.redisService.acquireLock(`vehicle:${vehicleId}`, 10000);
        if (!lockToken) {
            throw new BadRequestException('Hệ thống đang xử lý giao dịch cho xe này, vui lòng thử lại sau.');
        }
        try {
            if (dto.pickupDate || dto.returnDate || dto.vehicleId) {
                const overlapping = await this.prisma.booking.findFirst({
                    where: {
                        id: { not: id },
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
                if (overlapping) {
                    throw new BadRequestException('Vehicle not available for updated dates');
                }
            }

            const updated = await this.prisma.booking.update({
                where: { id },
                data: dto
            });

            await this.audit.log(actorId ?? null, 'UPDATE', 'Booking', id, {
                before,
                after: updated
            });

            return updated;
        } finally {
            await this.redisService.releaseLock(`vehicle:${vehicleId}`, lockToken);
        }
    }

    //  CHANGE STATUS 
    async changeStatus(id: string, status: string, actorId?: string) {
        const updated = await this.prisma.booking.update({
            where: { id },
            data: { status }
        });

        await this.audit.log(actorId ?? null, 'STATUS', 'Booking', id, { status });

        return updated;
    }

    //  CANCEL 
    async cancel(id: string, reason: string, actorId?: string) {
        const updated = await this.prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED', cancelReason: reason }
        });

        await this.audit.log(actorId ?? null, 'CANCEL', 'Booking', id, { reason });

        return updated;
    }

    //  DELETE 
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
        const ranges = bookings.map((b: any) => ({
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
                where: {
                    OR: [
                        { branchId },
                        { returnBranchId: branchId }
                    ]
                },
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
                where: {
                    OR: [
                        { branchId },
                        { returnBranchId: branchId }
                    ]
                }
            })
        ]);

        return {
            items,
            total
        };
    }


}
