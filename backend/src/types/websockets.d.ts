// Type declarations for @nestjs/websockets
// This is a workaround for missing type definitions

declare module '@nestjs/websockets' {
    import { Type } from '@nestjs/common';
    import { Server as SocketIOServer, Socket as SocketIOSocket } from 'socket.io';

    export interface WebSocketGatewayOptions {
        namespace?: string | RegExp;
        cors?: {
            origin?: string | string[] | boolean | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
            methods?: string[];
            credentials?: boolean;
        };
        transports?: string[];
        reconnection?: boolean;
        reconnectionDelay?: number;
        reconnectionAttempts?: number;
    }

    export function WebSocketGateway(options?: WebSocketGatewayOptions): ClassDecorator;
    export function WebSocketServer(): PropertyDecorator;
    export interface OnGatewayConnection {
        handleConnection(client: SocketIOSocket, ...args: any[]): any;
    }
    export interface OnGatewayDisconnect {
        handleDisconnect(client: SocketIOSocket): any;
    }
    export function SubscribeMessage(message: string): MethodDecorator;
}
