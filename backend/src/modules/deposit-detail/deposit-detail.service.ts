import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateDepositDetailDto } from './dto/create-deposit-detail.dto';
import { UpdateDepositDetailDto } from './dto/update-deposit-detail.dto';
import { DepositDetailQueryDto } from './dto/deposit-detail-query.dto';

@Injectable()
export class DepositDetailService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: DepositDetailQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.depositId) where.depositId = query.depositId;
        if (query.itemType) where.itemType = query.itemType;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.depositDetail.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    deposit: {
                        select: {
                            id: true,
                            bookingId: true,
                            totalAmount: true
                        }
                    }
                }
            }),
            this.prisma.depositDetail.count({ where })
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
        const detail = await this.prisma.depositDetail.findUnique({
            where: { id },
            include: {
                deposit: true
            }
        });
        if (!detail) throw new NotFoundException('Deposit detail not found');
        return detail;
    }

    async create(dto: CreateDepositDetailDto, actorId?: string) {
        // Validate deposit exists
        const deposit = await this.prisma.deposit.findUnique({
            where: { id: dto.depositId }
        });
        if (!deposit) {
            throw new BadRequestException('Deposit not found');
        }

        const detail = await this.prisma.depositDetail.create({
            data: {
                depositId: dto.depositId,
                surchargeId: dto.surchargeId,
                itemType: dto.itemType,
                itemName: dto.itemName,
                identifier: dto.identifier,
                amount: dto.amount,
                condition: dto.condition,
                photoUrls: dto.photoUrls || [],
                notes: dto.notes
            },
            include: {
                deposit: true
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'DepositDetail', detail.id, detail);
        return detail;
    }

    async update(id: string, dto: UpdateDepositDetailDto, actorId?: string) {
        const existing = await this.findOne(id);

        const detail = await this.prisma.depositDetail.update({
            where: { id },
            data: {
                itemType: dto.itemType,
                itemName: dto.itemName,
                identifier: dto.identifier,
                amount: dto.amount,
                condition: dto.condition,
                photoUrls: dto.photoUrls,
                notes: dto.notes
            },
            include: {
                deposit: true
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'DepositDetail', id, {
            before: existing,
            after: detail
        });
        return detail;
    }

    async delete(id: string, actorId?: string) {
        await this.findOne(id);
        await this.audit.log(actorId ?? null, 'DELETE', 'DepositDetail', id);
        return this.prisma.depositDetail.delete({ where: { id } });
    }
}

