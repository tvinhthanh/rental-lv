import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: ReviewQueryDto) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? query.limit : 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.customerId) where.customerId = query.customerId;
        if (query.vehicleId) where.vehicleId = query.vehicleId;
        if (query.bookingId) where.bookingId = query.bookingId;
        if (query.rating) where.rating = query.rating;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    vehicle: true,
                    customer: true,
                    booking: true
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
                vehicle: true,
                customer: true,
                booking: true
            }
        });
        if (!review) throw new NotFoundException('Review not found');
        return review;
    }

    async create(dto: CreateReviewDto) {
        // Check booking
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: { review: true }
        });
        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.customerId !== dto.customerId) {
            throw new BadRequestException('Booking does not belong to customer');
        }
        // Cho phép review khi đã hoàn tất hoặc đã trả xe
        const allowedStatuses = ['COMPLETED', 'RETURNED', 'CONTRACTED'];
        if (!allowedStatuses.includes(booking.status)) {
            throw new BadRequestException('Booking not eligible for review');
        }
        if (booking.review) {
            throw new BadRequestException('Review already exists for this booking');
        }

        const review = await this.prisma.review.create({
            data: {
                bookingId: dto.bookingId,
                customerId: dto.customerId,
                vehicleId: dto.vehicleId,
                rating: dto.rating,
                comment: dto.comment
            }
        });

        // Update vehicle aggregate
        await this.recalcVehicleRating(dto.vehicleId);

        return review;
    }

    private async recalcVehicleRating(vehicleId: string) {
        const agg = await this.prisma.review.aggregate({
            where: { vehicleId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await this.prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
                rating: agg._avg.rating || 0,
                reviewCount: agg._count.rating || 0
            }
        });
    }
}
