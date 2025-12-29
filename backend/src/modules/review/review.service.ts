import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';

@Injectable()
export class ReviewService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: ReviewQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.vehicleId) where.vehicleId = query.vehicleId;
        if (query.customerId) where.customerId = query.customerId;
        if (query.bookingId) where.bookingId = query.bookingId;
        if (query.minRating) where.rating = { gte: query.minRating };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: true,
                    vehicle: {
                        select: {
                            id: true,
                            name: true,
                            licensePlate: true
                        }
                    },
                    booking: {
                        select: {
                            id: true,
                            bookingCode: true
                        }
                    }
                }
            }),
            this.prisma.review.count({ where })
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(id: string) {
        const review = await this.prisma.review.findUnique({
            where: { id },
            include: {
                customer: true,
                vehicle: true,
                booking: true
            }
        });
        if (!review) throw new NotFoundException('Review not found');
        return review;
    }

    async create(dto: CreateReviewDto, actorId?: string) {
        // Validate booking exists if provided
        if (dto.bookingId) {
            const booking = await this.prisma.booking.findUnique({
                where: { id: dto.bookingId }
            });
            if (!booking) {
                throw new BadRequestException('Booking not found');
            }
            // Check if review already exists for this booking
            const existingReview = await this.prisma.review.findUnique({
                where: { bookingId: dto.bookingId }
            });
            if (existingReview) {
                throw new BadRequestException('Review already exists for this booking');
            }
        }

        // Validate customer exists
        const customer = await this.prisma.customer.findUnique({
            where: { id: dto.customerId }
        });
        if (!customer) {
            throw new BadRequestException('Customer not found');
        }

        // Validate vehicle exists
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicleId }
        });
        if (!vehicle) {
            throw new BadRequestException('Vehicle not found');
        }

        const review = await this.prisma.review.create({
            data: {
                bookingId: dto.bookingId,
                customerId: dto.customerId,
                vehicleId: dto.vehicleId,
                rating: dto.rating,
                comment: dto.comment
            },
            include: {
                customer: true,
                vehicle: true,
                booking: true
            }
        });

        // Update vehicle rating and review count
        await this.updateVehicleRating(dto.vehicleId);

        await this.audit.log(actorId ?? null, 'CREATE', 'Review', review.id, review);
        return review;
    }

    async update(id: string, dto: UpdateReviewDto, actorId?: string) {
        const existing = await this.findOne(id);

        const review = await this.prisma.review.update({
            where: { id },
            data: {
                rating: dto.rating,
                comment: dto.comment
            },
            include: {
                customer: true,
                vehicle: true,
                booking: true
            }
        });

        // Update vehicle rating if rating changed
        if (dto.rating && dto.rating !== existing.rating) {
            await this.updateVehicleRating(review.vehicleId);
        }

        await this.audit.log(actorId ?? null, 'UPDATE', 'Review', id, {
            before: existing,
            after: review
        });
        return review;
    }

    async delete(id: string, actorId?: string) {
        const review = await this.findOne(id);
        const vehicleId = review.vehicleId;

        await this.prisma.review.delete({ where: { id } });

        // Update vehicle rating after deletion
        await this.updateVehicleRating(vehicleId);

        await this.audit.log(actorId ?? null, 'DELETE', 'Review', id);
    }

    private async updateVehicleRating(vehicleId: string) {
        const reviews = await this.prisma.review.findMany({
            where: { vehicleId },
            select: { rating: true }
        });

        if (reviews.length === 0) {
            await this.prisma.vehicle.update({
                where: { id: vehicleId },
                data: {
                    rating: 0,
                    reviewCount: 0
                }
            });
            return;
        }

        const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

        await this.prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
                rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
                reviewCount: reviews.length
            }
        });
    }
}

