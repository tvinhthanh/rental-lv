import {
    Controller,
    Post,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

@Controller('upload')
export class CloudinaryController {
    constructor(private cloudinary: CloudinaryService) { }

    @Post('images')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
        const results = await Promise.all(
            files.map((file) => this.cloudinary.uploadImage(file))
        );

        return { urls: results.map((r) => r.secure_url) };
    }

    @Post('file')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const result = await this.cloudinary.uploadFile(file, {
            folder: 'vehicle-documents',
            resource_type: 'auto'
        });

        return { url: result.secure_url };
    }
}
