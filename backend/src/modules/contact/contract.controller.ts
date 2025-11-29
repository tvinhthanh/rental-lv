import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('contracts')
export class ContractController {
    constructor(private service: ContractService) { }

    @Get('booking/:bookingId')
    findByBooking(@Param('bookingId') bookingId: string) {
        return this.service.findByBooking(bookingId);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateContractDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/status')
    changeStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.service.changeStatus(id, body.status);
    }

    @Patch(':id/sign')
    sign(
        @Param('id') id: string,
        @Body() body: { customerSignature?: string; employeeSignature?: string; signedBy?: string; fileUrl?: string }
    ) {
        return this.service.sign(id, body);
    }

    @Post(':id/attachment')
    @UseInterceptors(FileInterceptor('file'))
    uploadAttachment(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.service.attachFile(id, file);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
}
