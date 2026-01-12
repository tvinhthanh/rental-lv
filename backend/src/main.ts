import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuditLogService } from './modules/audit-log/audit-log.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for Stripe webhook
  });

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.setGlobalPrefix('api');

  //  GLOBAL AUDIT LOGGER 
  const auditService = app.get(AuditLogService);
  app.useGlobalInterceptors(new AuditInterceptor(auditService));

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
