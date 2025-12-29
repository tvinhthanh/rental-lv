import { PrismaService } from '@/prisma/prisma.service';

/**
 * Kiểm tra xe có đủ giấy tờ bắt buộc không
 * @param prisma PrismaService instance
 * @param vehicleId ID của xe
 * @returns { isValid: boolean, missingDocs: string[] }
 */
export async function checkVehicleDocumentsComplete(
    prisma: PrismaService,
    vehicleId: string
): Promise<{ isValid: boolean; missingDocs: string[] }> {
    // Danh sách giấy tờ bắt buộc
    const requiredDocTypes = ['REGISTRATION', 'INSURANCE']; // Đăng kiểm, Bảo hiểm

    const documents = await prisma.vehicleDocument.findMany({
        where: {
            vehicleId,
            docType: { in: requiredDocTypes }
        }
    });

    const missingDocs: string[] = [];

    for (const requiredType of requiredDocTypes) {
        const doc = documents.find((d: any) => d.docType === requiredType);

        if (!doc) {
            missingDocs.push(requiredType);
            continue;
        }

        // Kiểm tra giấy tờ còn hạn (nếu có expiresAt)
        if (doc.expiresAt) {
            const now = new Date();
            if (doc.expiresAt < now) {
                missingDocs.push(`${requiredType} (đã hết hạn)`);
            }
        }
    }

    return {
        isValid: missingDocs.length === 0,
        missingDocs
    };
}

