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
        file: Express.Multer.File,
        options?: { folder?: string; resource_type?: 'auto' | 'raw' | 'image' }
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadOptions: any = {
                resource_type: options?.resource_type || 'auto',
                folder: options?.folder || 'contracts'
            };

            // Nếu là PDF thì set resource_type = raw
            if (file.mimetype === 'application/pdf') {
                uploadOptions.resource_type = 'raw';
            }

            this.cloudinary.uploader.upload_stream(
                uploadOptions,
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
