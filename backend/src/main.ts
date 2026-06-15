import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuditLogService } from './modules/audit-log/audit-log.service';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for Stripe webhook
  });

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  //  GLOBAL AUDIT LOGGER 
  const auditService = app.get(AuditLogService);
  app.useGlobalInterceptors(new AuditInterceptor(auditService));

  // Configure Socket.io Redis adapter
  const redisIoAdapter = new (RedisIoAdapter as any)(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter as any);

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Rental API')
    .setDescription('Car Rental Backend API (NestJS 11 + Prisma + MongoDB)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
