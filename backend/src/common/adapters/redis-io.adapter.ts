import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: any;

    async connectToRedis(): Promise<void> {
        const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        
        const pubClient = new Redis(redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
        });
        const subClient = pubClient.duplicate();

        this.adapterConstructor = createAdapter(pubClient, subClient);
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}
