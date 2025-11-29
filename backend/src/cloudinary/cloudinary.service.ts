import { Injectable, Inject } from '@nestjs/common';
import {
    UploadApiResponse,
    UploadApiErrorResponse
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(
        @Inject('CLOUDINARY') private cloudinary: any
    ) { }

    async uploadImage(
        file: Express.Multer.File
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader.upload_stream(
                (
                    error: UploadApiErrorResponse | undefined,
                    result: UploadApiResponse | undefined
                ) => {
                    if (error || !result) return reject(error);
                    resolve(result);
                }
            ).end(file.buffer);
        });
    }

    async uploadFile(
        file: Express.Multer.File
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                (
                    error: UploadApiErrorResponse | undefined,
                    result: UploadApiResponse | undefined
                ) => {
                    if (error || !result) return reject(error);
                    resolve(result);
                }
            ).end(file.buffer);
        });
    }
}
