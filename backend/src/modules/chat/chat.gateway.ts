import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    },
    namespace: '/notifications',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds
    private supportSockets = new Set<string>(); // Set of socketIds of Admins/Employees

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private chatService: ChatService
    ) {}

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn(`Chat client ${client.id} connected without token`);
                client.disconnect();
                return;
            }

            const secret = this.configService.get<string>('JWT_SECRET') || 'change-this-secret';
            const payload = await this.jwtService.verifyAsync(token, { secret });
            const userId = payload.sub || payload.id;
            const role = payload.role;
            const name = payload.name || 'Người dùng';

            if (!userId) {
                this.logger.warn(`Chat client ${client.id} connected with invalid token`);
                client.disconnect();
                return;
            }

            // Store user details in socket
            client.data = { userId, role, name };

            // Store socket connection
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId)!.add(client.id);

            // Join personal room
            client.join(`user:${userId}`);

            // If Admin or Employee, join support room
            if (role === 'ADMIN' || role === 'EMPLOYEE') {
                client.join('support_agents');
                this.supportSockets.add(client.id);
                this.logger.log(`Support agent connected: ${name} (${userId})`);
            } else {
                this.logger.log(`Customer connected: ${name} (${userId})`);
            }

            client.emit('connected', { userId, role, name });
        } catch (error: any) {
            this.logger.error(`Chat Connection error: ${error?.message || 'Unknown error'}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data?.userId;
        if (userId) {
            const sockets = this.userSockets.get(userId);
            if (sockets) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                }
            }
        }
        this.supportSockets.delete(client.id);
        this.logger.log(`Chat client disconnected: ${client.id}`);
    }

    @SubscribeMessage('send_message')
    async handleMessage(client: Socket, payload: { receiverId?: string; content: string }) {
        const { userId, name, role } = client.data;
        if (!userId) return;

        // Save to DB
        const message = await this.chatService.saveMessage({
            senderId: userId,
            senderName: name,
            senderRole: role,
            receiverId: payload.receiverId || null,
            content: payload.content,
        });

        // Broadcast/Send message to receiver
        if (payload.receiverId) {
            // Send to target user room
            this.server.to(`user:${payload.receiverId}`).emit('receive_message', message);
            // Echo back to sender
            this.server.to(`user:${userId}`).emit('receive_message', message);
        } else {
            // Sent from Customer to Support
            // Send to all support agents
            this.server.to('support_agents').emit('receive_message', message);
            // Echo back to sender
            this.server.to(`user:${userId}`).emit('receive_message', message);
        }
    }
}
