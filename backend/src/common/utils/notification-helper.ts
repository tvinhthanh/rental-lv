import { NotificationService } from '@/modules/notification/notification.service';

/**
 * Helper để gửi notification từ các service khác
 * Sử dụng dynamic import để tránh circular dependency
 */
export async function sendNotification(
    notificationService: NotificationService | null,
    userId: string,
    title: string,
    message: string
) {
    if (!notificationService) {
        return; // Service chưa available, skip
    }

    try {
        await notificationService.create({
            userId,
            title,
            message,
            status: 'UNREAD'
        }, true); // emitSocket = true
    } catch (error) {
        console.error('Failed to send notification:', error);
        // Ignore errors - notifications are not critical
    }
}

