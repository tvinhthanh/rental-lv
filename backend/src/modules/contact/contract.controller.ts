import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('contracts')
export class ContractController {
    constructor(private service: ContractService) { }

    @Get('branch/:branchId')
    findByBranch(@Param('branchId') branchId: string) {
        return this.service.findByBranch(branchId);
    }

    @Get('booking/:bookingId')
    findByBooking(@Param('bookingId') bookingId: string) {
        return this.service.findByBooking(bookingId);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() dto: CreateContractDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() dto: UpdateContractDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    changeStatus(@Param('id') id: string, @Body() body: { status: string }, @CurrentUser() user: any) {
        return this.service.changeStatus(id, body.status, user?.id);
    }

    @Patch(':id/sign')
    @UseGuards(JwtAuthGuard)
    sign(
        @Param('id') id: string,
        @Body() body: { customerSignature?: string; employeeSignature?: string; signedBy?: string; fileUrl?: string },
        @CurrentUser() user: any
    ) {
        return this.service.sign(id, body, user?.id);
    }

    @Post(':id/attachment')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    uploadAttachment(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
        return this.service.attachFile(id, file, user?.id);
    }

    @Patch(':id/sign')
    @UseGuards(JwtAuthGuard)
    sign(
        @Param('id') id: string,
        @Body() body: { customerSignature?: string; employeeSignature?: string; signedBy?: string; fileUrl?: string },
        @CurrentUser() user: any
    ) {
        return this.service.sign(id, body, user?.id);
    }

    @Post(':id/attachment')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    uploadAttachment(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
        return this.service.attachFile(id, file, user?.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }
}
