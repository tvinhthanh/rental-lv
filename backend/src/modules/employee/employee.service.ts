import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';

@Injectable()
export class EmployeeService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    // LIST + PAGINATION
    async findAll(query: EmployeeQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { department: { contains: query.search, mode: 'insensitive' } },
                { position: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.employee.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    branch: true,
                    user: true
                }
            }),
            this.prisma.employee.count({ where })
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
        const e = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                branch: true,
                user: true,
                authoredPosts: true
            }
        });

        if (!e) throw new NotFoundException('Employee not found');
        return e;
    }

    async create(dto: CreateEmployeeDto, actorId?: string) {
        if (dto.userId) {
            const exists = await this.prisma.employee.findUnique({ where: { userId: dto.userId } });
            if (exists) throw new BadRequestException('User already assigned to another employee');
        }

        const employee = await this.prisma.employee.create({
            data: {
                ...dto,
                hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Employee', employee.id, employee);

        return employee;
    }

    async update(id: string, dto: UpdateEmployeeDto, actorId?: string) {
        const before = await this.findOne(id);

        const updated = await this.prisma.employee.update({
            where: { id },
            data: {
                ...dto,
                hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Employee', id, {
            before,
            after: updated
        });

        return updated;
    }

    async delete(id: string, actorId?: string) {
        await this.audit.log(actorId ?? null, 'DELETE', 'Employee', id);
        return this.prisma.employee.delete({ where: { id } });
    }

    async getByUserId(userId: string) {
        return this.prisma.employee.findUnique({ where: { userId } });
    }
}
