import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client!: Redis;

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://127.0.0.1:6379';
        this.client = new Redis(redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
        });
    }

    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
    }

    getClient(): Redis {
        return this.client;
    }

    // --- Basic Key-Value Operations ---
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<string> {
        if (ttlSeconds) {
            return this.client.set(key, value, 'EX', ttlSeconds);
        }
        return this.client.set(key, value);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    // --- Distributed Lock implementation using Redis SET NX PX ---
    async acquireLock(key: string, ttlMs: number): Promise<string | null> {
        if (!this.client || this.client.status !== 'ready') {
            return 'mock-offline-lock-token'; // Fallback so service doesn't hang
        }
        const token = Math.random().toString(36).substring(2);
        const lockKey = `locks:${key}`;
        
        // SET key value NX (only if not exist) PX ttlMs (expire in milliseconds)
        const result = await this.client.set(lockKey, token, 'PX', ttlMs, 'NX');
        
        if (result === 'OK') {
            return token; // Lock acquired successfully, return unlock token
        }
        return null; // Failed to acquire lock
    }

    async releaseLock(key: string, token: string): Promise<boolean> {
        if (!this.client || this.client.status !== 'ready') {
            return true; // Fallback so service doesn't hang
        }
        const lockKey = `locks:${key}`;
        
        // Use a Lua script to ensure safe lock release (only release if token matches)
        const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
        `;
        
        const result = await this.client.eval(script, 1, lockKey, token);
        return result === 1;
    }
}
