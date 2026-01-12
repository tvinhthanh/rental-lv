import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { LoyaltyTransactionService } from './loyalty-transaction.service';
import { LoyaltyTransactionQueryDto } from './dto/loyalty-transaction-query.dto';
import { CreateLoyaltyTransactionDto } from './dto/create-loyalty-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('loyalty-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoyaltyTransactionController {
    constructor(private service: LoyaltyTransactionService) { }

    @Get()
    @Roles('ADMIN', 'EMPLOYEE')
    list(@Query() query: LoyaltyTransactionQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @Roles('ADMIN', 'EMPLOYEE')
    create(@Body() dto: CreateLoyaltyTransactionDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }
}

