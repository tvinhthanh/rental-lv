# 🔴 HIGH PRIORITY IMPLEMENTATION GUIDE

## 📋 Các items cần implement ngay

### 1. Rate Limiting (Bảo vệ API)

#### Cài đặt
```bash
cd backend
npm install @nestjs/throttler
```

#### Setup trong `app.module.ts`
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // ... other imports
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10, // 10 requests per minute
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

#### Customize cho từng endpoint
```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @Post('login')
  login() {
    // ...
  }
}
```

#### Environment variables
```env
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

---

### 2. Payment Gateway Integration

#### Option A: VNPay (Khuyến nghị cho Việt Nam)

**Cài đặt:**
```bash
cd backend
npm install vnpay
```

**Tạo PaymentService:**
```typescript
// backend/src/modules/payment/payment-gateway.service.ts
import { Injectable } from '@nestjs/common';
import * as vnpay from 'vnpay';

@Injectable()
export class PaymentGatewayService {
  private vnpayClient: any;

  constructor() {
    this.vnpayClient = new vnpay({
      tmnCode: process.env.VNPAY_TMN_CODE,
      secretKey: process.env.VNPAY_SECRET_KEY,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    });
  }

  async createPaymentUrl(orderId: string, amount: number, returnUrl: string) {
    const paymentUrl = this.vnpayClient.buildPaymentUrl({
      vnp_Amount: amount * 100, // VNPay expects amount in cents
      vnp_Command: 'pay',
      vnp_CreateDate: new Date().toISOString(),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: orderId,
    });

    return paymentUrl;
  }

  async verifyPayment(query: any) {
    return this.vnpayClient.verifyReturnUrl(query);
  }
}
```

**Webhook handler:**
```typescript
// backend/src/modules/payment/payment.controller.ts
@Post('vnpay/callback')
async vnpayCallback(@Query() query: any, @Res() res: Response) {
  const isValid = await this.paymentGatewayService.verifyPayment(query);
  
  if (isValid && query.vnp_ResponseCode === '00') {
    // Update payment status
    await this.paymentService.updatePaymentStatus(
      query.vnp_TxnRef,
      'SUCCESS',
      query.vnp_TransactionNo
    );
    return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
  }
  
  return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
}
```

#### Option B: Stripe (International)

**Cài đặt:**
```bash
cd backend
npm install stripe
npm install @stripe/stripe-js
```

**Setup:**
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
```

---

### 3. Testing Setup

#### Jest Configuration

**Cài đặt:**
```bash
cd backend
npm install --save-dev @nestjs/testing jest @types/jest ts-jest
```

**Tạo `jest.config.js`:**
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

**Example test:**
```typescript
// backend/src/modules/vehicle/vehicle.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('VehicleService', () => {
  let service: VehicleService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: PrismaService,
          useValue: {
            vehicle: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of vehicles', async () => {
      const result = [{ id: '1', name: 'Test Vehicle' }];
      jest.spyOn(prisma.vehicle, 'findMany').mockResolvedValue(result as any);

      expect(await service.findAll({})).toBe(result);
    });
  });
});
```

#### E2E Testing với Playwright

**Cài đặt:**
```bash
cd frontends
npm install --save-dev @playwright/test
npx playwright install
```

**Tạo `playwright.config.ts`:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Example E2E test:**
```typescript
// frontends/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';

test('user can create booking', async ({ page }) => {
  await page.goto('/user/cars');
  await page.click('text=Đặt xe ngay');
  await page.fill('input[name="pickupDate"]', '2024-12-25');
  await page.fill('input[name="returnDate"]', '2024-12-27');
  await page.click('button:has-text("Xác nhận")');
  
  await expect(page.locator('text=Đặt xe thành công')).toBeVisible();
});
```

---

## 🟡 MEDIUM PRIORITY IMPLEMENTATION

### 4. SeoRedirect Module

**Tạo module theo template:**
```bash
cd backend/src/modules
mkdir seo-redirect
cd seo-redirect
```

**Files cần tạo:**
- `seo-redirect.module.ts`
- `seo-redirect.controller.ts`
- `seo-redirect.service.ts`
- `dto/create-seo-redirect.dto.ts`
- `dto/update-seo-redirect.dto.ts`
- `dto/seo-redirect-query.dto.ts`

**Middleware:**
```typescript
// backend/src/common/middleware/seo-redirect.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SeoRedirectMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }

    const redirect = await this.prisma.seoRedirect.findFirst({
      where: {
        fromUrl: req.path,
        isActive: true,
      },
    });

    if (redirect) {
      return res.redirect(parseInt(redirect.type), redirect.toUrl);
    }

    next();
  }
}
```

**Register middleware trong `app.module.ts`:**
```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SeoRedirectMiddleware)
      .forRoutes('*');
  }
}
```

---

### 5. ViewCount Increment Logic

**Update VehicleService:**
```typescript
// backend/src/modules/vehicle/vehicle.service.ts
async findOne(id: string, incrementView: boolean = true) {
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id },
    include: {
      category: true,
      branch: true,
      brand: true,
    },
  });

  if (!vehicle) {
    throw new NotFoundException('Vehicle not found');
  }

  // Increment view count (async, don't wait)
  if (incrementView) {
    this.prisma.vehicle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error); // Fire and forget
  }

  return vehicle;
}
```

---

### 6. PricingRule → Vehicle Logic

**Update BookingService để apply pricing rules:**
```typescript
// backend/src/modules/booking/booking.service.ts
async calculatePrice(vehicleId: string, pickupDate: Date, returnDate: Date) {
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { category: true, pricingRules: true },
  });

  let basePrice = vehicle.priceList?.dailyRate || 0;
  const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));

  // Check for vehicle-specific rules first
  const vehicleRule = vehicle.pricingRules?.find(
    rule => rule.vehicleId === vehicleId &&
    rule.startDate <= pickupDate &&
    rule.endDate >= returnDate
  );

  // Check for category rules
  const categoryRule = await this.prisma.pricingRule.findFirst({
    where: {
      categoryId: vehicle.categoryId,
      startDate: { lte: pickupDate },
      endDate: { gte: returnDate },
    },
  });

  // Apply rule (vehicle-specific has priority)
  const rule = vehicleRule || categoryRule;
  if (rule) {
    if (rule.percent) {
      basePrice = basePrice * (1 + rule.percent / 100);
    } else if (rule.amount) {
      basePrice = basePrice + rule.amount;
    }
  }

  return basePrice * days;
}
```

---

## 📝 QUICK START COMMANDS

### Rate Limiting
```bash
cd backend
npm install @nestjs/throttler
# Then update app.module.ts as shown above
```

### Payment Gateway (VNPay)
```bash
cd backend
npm install vnpay
# Add VNPAY_TMN_CODE and VNPAY_SECRET_KEY to .env
```

### Testing
```bash
# Backend
cd backend
npm install --save-dev @nestjs/testing jest @types/jest ts-jest

# Frontend E2E
cd frontends
npm install --save-dev @playwright/test
npx playwright install
```

---

## ✅ CHECKLIST IMPLEMENTATION

- [ ] Install @nestjs/throttler
- [ ] Setup ThrottlerModule in app.module.ts
- [ ] Add rate limiting guards
- [ ] Install payment gateway library (VNPay/Stripe)
- [ ] Create PaymentGatewayService
- [ ] Create payment webhook handlers
- [ ] Setup Jest for backend testing
- [ ] Create sample unit tests
- [ ] Setup Playwright for E2E testing
- [ ] Create sample E2E tests
- [ ] Create SeoRedirectModule
- [ ] Create SeoRedirectMiddleware
- [ ] Update VehicleService with viewCount increment
- [ ] Update BookingService with PricingRule logic

---

**Cập nhật:** 2024-12-19
