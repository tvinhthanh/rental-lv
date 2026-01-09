import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { LoyaltyProgramService } from './loyalty-program.service';
import { LoyaltyProgramQueryDto } from './dto/loyalty-program-query.dto';
import { CreateLoyaltyProgramDto } from './dto/create-loyalty-program.dto';
import { UpdateLoyaltyProgramDto } from './dto/update-loyalty-program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('loyalty-programs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoyaltyProgramController {
    constructor(private service: LoyaltyProgramService) { }

    @Get()
    @Roles('ADMIN', 'EMPLOYEE')
    list(@Query() query: LoyaltyProgramQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() dto: CreateLoyaltyProgramDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateLoyaltyProgramDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Delete(':id')
    @Roles('ADMIN')
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }
}

