import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async saveMessage(data: {
        senderId: string;
        senderName: string;
        senderRole: string;
        receiverId: string | null;
        content: string;
    }) {
        return this.prisma.chatMessage.create({
            data: {
                senderId: data.senderId,
                senderName: data.senderName,
                senderRole: data.senderRole,
                receiverId: data.receiverId,
                content: data.content,
                isRead: false,
            },
        });
    }

    async getSupportHistory(customerId: string) {
        // Lấy lịch sử chat giữa khách hàng và hỗ trợ (receiverId = null là kênh chung chăm sóc khách hàng)
        return this.prisma.chatMessage.findMany({
            where: {
                OR: [
                    { senderId: customerId },
                    { receiverId: customerId },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getConversations() {
        // Lấy danh sách các cuộc trò chuyện của khách hàng
        const messages = await this.prisma.chatMessage.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const conversationsMap = new Map<string, any>();
        for (const msg of messages) {
            const customerId = msg.senderRole === 'CUSTOMER' ? msg.senderId : msg.receiverId;
            if (!customerId) continue;

            if (!conversationsMap.has(customerId)) {
                conversationsMap.set(customerId, {
                    customerId,
                    customerName: msg.senderRole === 'CUSTOMER' ? msg.senderName : 'Khách hàng',
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    isRead: msg.senderRole !== 'CUSTOMER' ? true : msg.isRead,
                });
            }
        }
        return Array.from(conversationsMap.values());
    }

    async markAsRead(customerId: string) {
        return this.prisma.chatMessage.updateMany({
            where: {
                senderId: customerId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
    }
}
