import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  [x: string]: any;

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    // Log database events
    this.$on('error' as never, (e: any) => {
      this.logger.error('Prisma error:', e);
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn('Prisma warning:', e);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error: any) {
      this.logger.error('Failed to connect to database:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    } catch (error: any) {
      this.logger.error('Error disconnecting from database:', error.message);
    }
  }

  /**
   * Safe transaction wrapper for MongoDB
   * Note: For read-only operations, use Promise.all instead of transactions
   */
  async safeTransaction<T>(
    callback: Parameters<PrismaClient['$transaction']>[0]
  ): Promise<T> {
    try {
      return (await this.$transaction(callback, {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
      })) as T;
    } catch (error: any) {
      // Handle connection errors
      if (error.code === 'P1001' || error.message?.includes('connection') || error.message?.includes('aborted')) {
        this.logger.error('Database connection error in transaction:', error.message);
        throw new Error('Database connection error. Please try again.');
      }
      throw error;
    }
  }
}
