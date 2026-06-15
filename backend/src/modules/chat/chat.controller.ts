import { Controller, Get, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private chatService: ChatService) {}

    @Get('history')
    async getMyHistory(@Req() req: any) {
        const userId = req.user.id || req.user.sub;
        return this.chatService.getSupportHistory(userId);
    }

    @Get('history/:customerId')
    async getHistoryForAdmin(@Param('customerId') customerId: string) {
        return this.chatService.getSupportHistory(customerId);
    }

    @Get('conversations')
    async getConversations() {
        return this.chatService.getConversations();
    }

    @Patch('read/:customerId')
    async markAsRead(@Param('customerId') customerId: string) {
        return this.chatService.markAsRead(customerId);
    }
}
