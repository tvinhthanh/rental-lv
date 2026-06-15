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

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    },
    namespace: '/notifications',
})
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(NotificationGateway.name);
    private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
            
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.disconnect();
                return;
            }

            const secret = this.configService.get<string>('JWT_SECRET') || 'change-this-secret';
            const payload = await this.jwtService.verifyAsync(token, { secret });
            const userId = payload.sub || payload.id;

            if (!userId) {
                this.logger.warn(`Client ${client.id} connected with invalid token`);
                client.disconnect();
                return;
            }

            // Store socket connection for user
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId)!.add(client.id);

            // Join room for user-specific notifications
            client.join(`user:${userId}`);

            this.logger.log(`User ${userId} connected (socket: ${client.id})`);

            // Send welcome message
            client.emit('connected', {
                message: 'Connected to notification server',
                userId,
            });
        } catch (error: any) {
            this.logger.error(`Connection error: ${error?.message || 'Unknown error'}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // Find and remove socket from userSockets
        for (const [userId, sockets] of this.userSockets.entries()) {
            if (sockets.has(client.id)) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                }
                this.logger.log(`User ${userId} disconnected (socket: ${client.id})`);
                break;
            }
        }
    }

    /**
     * Emit notification to specific user
     */
    emitToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
        this.logger.log(`Emitted ${event} to user ${userId}`);
    }

    /**
     * Emit notification to all connected users
     */
    emitToAll(event: string, data: any) {
        this.server.emit(event, data);
        this.logger.log(`Emitted ${event} to all users`);
    }

    /**
     * Get connected users count
     */
    getConnectedUsersCount(): number {
        return this.userSockets.size;
    }

    /**
     * Check if user is connected
     */
    isUserConnected(userId: string): boolean {
        return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
    }

    @SubscribeMessage('ping')
    handlePing(client: Socket) {
        client.emit('pong', { timestamp: new Date().toISOString() });
    }
}

