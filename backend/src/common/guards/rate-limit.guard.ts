import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '@/shared/redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
    // Default: 60 requests per minute
    private readonly LIMIT = 100;
    private readonly WINDOW_SIZE_IN_SECONDS = 60;

    constructor(private readonly redisService: RedisService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        // Get client IP address
        const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || '127.0.0.1';
        
        // Key format: rate-limit:ip:<ip_address>
        const key = `rate-limit:ip:${ip}`;
        const redis = this.redisService.getClient();

        // Safety Fallback: If Redis is offline or not ready, bypass rate limiting to prevent hanging the API
        if (!redis || redis.status !== 'ready') {
            return true;
        }

        // Increment count
        const currentCount = await redis.incr(key);

        if (currentCount === 1) {
            // New key, set expiration time
            await redis.expire(key, this.WINDOW_SIZE_IN_SECONDS);
        }

        if (currentCount > this.LIMIT) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    error: 'Too Many Requests',
                    message: `Yêu cầu quá giới hạn. Vui lòng thử lại sau ${this.WINDOW_SIZE_IN_SECONDS} giây.`,
                },
                HttpStatus.TOO_MANY_REQUESTS
            );
        }

        return true;
    }
}
