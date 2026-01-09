# 📦 CÁC MODULE CẦN TẠO

## 📊 Tổng quan

Có **10 models** trong Prisma schema. Hiện tại còn **2 models** chưa có module tương ứng trong backend.

**Status:** ✅ **8/10 modules đã hoàn thành (80%)**

---

## ✅ 1. PasswordResetToken

**Status:** ⚠️ Logic có trong AuthModule nhưng chưa có module riêng

**Model:**
```prisma
model PasswordResetToken {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  token     String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

**Ưu tiên:** 🟢 LOW (đã có logic trong AuthModule)

**Gợi ý:**
- Có thể giữ logic trong AuthModule
- Hoặc tách ra PasswordResetModule nếu cần quản lý riêng

---

## ✅ 2. NotificationTemplate

**Status:** ✅ Đã có module

**Model:**
```prisma
model NotificationTemplate {
  id      String @id @default(auto()) @map("_id") @db.ObjectId
  name    String
  code    String @unique
  subject String?
  content String?
  type    String // email, sms, push
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  notifications Notification[]
  campaigns     MarketingCampaign[]
}
```

**Ưu tiên:** ✅ HOÀN THÀNH

**Đã có:**
- ✅ `notification-template.module.ts`
- ✅ `notification-template.controller.ts`
- ✅ `notification-template.service.ts`
- ✅ DTOs đầy đủ

**Tính năng:**
- ✅ CRUD templates
- ⚠️ Preview template với sample data (có thể thêm sau)
- ⚠️ Validate template syntax (có thể thêm sau)
- ⚠️ Export/Import templates (có thể thêm sau)

---

## ✅ 3. CustomerSegment

**Status:** ✅ Đã có module

**Model:**
```prisma
model CustomerSegment {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  conditions  Json
  description String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  campaigns MarketingCampaign[]
}
```

**Ưu tiên:** ✅ HOÀN THÀNH

**Đã có:**
- ✅ `customer-segment.module.ts`
- ✅ `customer-segment.controller.ts`
- ✅ `customer-segment.service.ts`
- ✅ DTOs đầy đủ

**Tính năng:**
- ✅ CRUD segments
- ⚠️ Builder UI cho conditions (JSON) - Frontend có thể thêm sau
- ⚠️ Preview customers trong segment - Frontend có thể thêm sau
- ⚠️ Auto-update segment membership - Có thể thêm sau

**Conditions JSON structure:**
```json
{
  "and": [
    { "field": "totalSpent", "operator": ">=", "value": 10000000 },
    { "field": "membershipTier", "operator": "in", "value": ["PREMIUM", "VIP"] }
  ]
}
```

---

## ✅ 4. MarketingCampaign

**Status:** ✅ Đã có module

**Model:**
```prisma
model MarketingCampaign {
  id         String @id @default(auto()) @map("_id") @db.ObjectId
  name       String
  segmentId  String @db.ObjectId
  templateId String @db.ObjectId
  status     String @default("DRAFT")
  scheduledAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  segment  CustomerSegment      @relation(fields: [segmentId], references: [id])
  template NotificationTemplate @relation(fields: [templateId], references: [id])
}
```

**Ưu tiên:** ✅ HOÀN THÀNH

**Đã có:**
- ✅ `marketing-campaign.module.ts`
- ✅ `marketing-campaign.controller.ts`
- ✅ `marketing-campaign.service.ts`
- ✅ DTOs đầy đủ

**Tính năng:**
- ✅ CRUD campaigns
- ⚠️ Schedule campaigns - Có thể thêm sau
- ⚠️ Send test email/SMS - Cần integrate email/SMS service
- ⚠️ Track campaign performance - Có thể thêm sau
- ⚠️ Auto-send based on schedule - Cần job queue (Bull)

**Dependencies:**
- ✅ CustomerSegmentModule
- ✅ NotificationTemplateModule
- ✅ NotificationModule

---

## ✅ 5. LoyaltyProgram

**Status:** ✅ Đã có module

**Model:**
```prisma
model LoyaltyProgram {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  minAmount   Float?
  pointsPer100k Int?
  description String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  transactions LoyaltyTransaction[]
}
```

**Ưu tiên:** ✅ HOÀN THÀNH

**Đã có:**
- ✅ `loyalty-program.module.ts`
- ✅ `loyalty-program.controller.ts`
- ✅ `loyalty-program.service.ts`
- ✅ DTOs đầy đủ

**Tính năng:**
- ✅ CRUD programs
- ⚠️ Calculate points based on spending - Có thể thêm logic
- ⚠️ Auto-apply to bookings - Cần hook vào BookingModule
- ⚠️ Tier management (BASIC, PREMIUM, VIP) - Có thể thêm logic

**Integration:**
- ⚠️ Hook vào BookingModule để tự động tính points - Cần thêm
- ⚠️ Update Customer.loyaltyPoints và membershipTier - Cần thêm

---

## ✅ 6. LoyaltyTransaction

**Status:** ✅ Đã có module

**Model:**
```prisma
model LoyaltyTransaction {
  id         String @id @default(auto()) @map("_id") @db.ObjectId
  customerId String @db.ObjectId
  programId  String? @db.ObjectId
  bookingId  String? @db.ObjectId
  type     String // earn, redeem
  points   Int
  note     String?
  createdAt DateTime @default(now())
  customer Customer        @relation(fields: [customerId], references: [id])
  program  LoyaltyProgram? @relation(fields: [programId], references: [id])
  booking  Booking?        @relation(fields: [bookingId], references: [id])
}
```

**Ưu tiên:** ✅ HOÀN THÀNH

**Đã có:**
- ✅ `loyalty-transaction.module.ts`
- ✅ `loyalty-transaction.controller.ts`
- ✅ `loyalty-transaction.service.ts`
- ✅ DTOs đầy đủ

**Tính năng:**
- ✅ CRUD transactions
- ✅ Manual earn/redeem points
- ✅ Transaction history
- ✅ Points balance tracking

**Integration:**
- ⚠️ Auto-create transaction khi booking completed - Cần hook vào BookingModule
- ⚠️ Update Customer.loyaltyPoints - Cần thêm logic

---

## 🟢 7. SubscriptionPlan

**Status:** ❌ Chưa có module (Multi-tenant feature)

**Model:**
```prisma
model SubscriptionPlan {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  price       Float
  features    String[]
  duration    Int // days
  description String?
  tenants   Tenant[]
  createdAt DateTime @default(now())
}
```

**Ưu tiên:** 🟢 LOW (Multi-tenant - có thể bỏ qua nếu không cần)

**Cần tạo:**
- `subscription-plan.module.ts`
- `subscription-plan.controller.ts`
- `subscription-plan.service.ts`
- `dto/create-subscription-plan.dto.ts`
- `dto/update-subscription-plan.dto.ts`
- `dto/subscription-plan-query.dto.ts`

**Tính năng:**
- CRUD plans
- Feature management
- Pricing tiers

---

## 🟢 8. Tenant

**Status:** ❌ Chưa có module (Multi-tenant feature)

**Model:**
```prisma
model Tenant {
  id             String @id @default(auto()) @map("_id") @db.ObjectId
  name           String
  subdomain      String? @unique
  customDomain   String?
  subscriptionId String @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  subscription SubscriptionPlan @relation(fields: [subscriptionId], references: [id])
}
```

**Ưu tiên:** 🟢 LOW (Multi-tenant - có thể bỏ qua nếu không cần)

**Cần tạo:**
- `tenant.module.ts`
- `tenant.controller.ts`
- `tenant.service.ts`
- `dto/create-tenant.dto.ts`
- `dto/update-tenant.dto.ts`
- `dto/tenant-query.dto.ts`

**Tính năng:**
- CRUD tenants
- Subdomain management
- Custom domain setup
- Subscription management

**Note:** Cần middleware để route theo tenant

---

## ✅ 9. PricingRule

**Status:** ✅ Đã có module

**Model:**
```prisma
model PricingRule {
  id         String @id @default(auto()) @map("_id") @db.ObjectId
  categoryId String @db.ObjectId
  name       String
  type       String   // weekend, holiday, seasonal
  percent    Float?
  amount     Float?
  startDate  DateTime?
  endDate    DateTime?
  createdAt DateTime @default(now())
  category VehicleCategory @relation(fields: [categoryId], references: [id])
}
```

**Ưu tiên:** ✅ HOÀN THÀNH

**Đã có:**
- ✅ `pricing-rule.module.ts`
- ✅ `pricing-rule.controller.ts`
- ✅ `pricing-rule.service.ts`
- ✅ DTOs đầy đủ

**Tính năng:**
- ✅ CRUD rules
- ⚠️ Apply rules to bookings - Cần hook vào BookingModule
- ⚠️ Priority handling (nếu nhiều rules) - Cần thêm logic
- ⚠️ Calendar view cho rules - Frontend có thể thêm sau

**Integration:**
- ⚠️ Hook vào BookingModule để apply rules - Cần thêm
- ⚠️ Tính toán giá động dựa trên rules - Cần thêm logic

---

## ✅ 10. Partner

**Status:** ✅ Đã có module

**Model:**
```prisma
model Partner {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  name  String
  code  String @unique
  phone String?
  email String?
  note   String?
  status String @default("ACTIVE")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Ưu tiên:** ✅ HOÀN THÀNH

**Đã có:**
- ✅ `partner.module.ts`
- ✅ `partner.controller.ts`
- ✅ `partner.service.ts`
- ✅ DTOs đầy đủ

**Tính năng:**
- ✅ CRUD partners
- ⚠️ Referral code tracking - Có thể thêm sau
- ⚠️ Commission calculation - Có thể thêm sau

---

## 📋 KẾ HOẠCH TRIỂN KHAI

### Phase 1: HIGH PRIORITY ✅ HOÀN THÀNH
1. ✅ **NotificationTemplateModule** - Đã hoàn thành
2. ✅ **CustomerSegmentModule** - Đã hoàn thành

### Phase 2: MEDIUM PRIORITY ✅ HOÀN THÀNH
3. ✅ **MarketingCampaignModule** - Đã hoàn thành
4. ✅ **LoyaltyProgramModule** - Đã hoàn thành
5. ✅ **LoyaltyTransactionModule** - Đã hoàn thành
6. ✅ **PricingRuleModule** - Đã hoàn thành

### Phase 3: LOW PRIORITY ✅ HOÀN THÀNH
7. ✅ **PartnerModule** - Đã hoàn thành

### Phase 4: MULTI-TENANT (Tùy chọn)
8. ❌ **SubscriptionPlanModule** - Chưa có (chỉ nếu cần multi-tenant)
9. ❌ **TenantModule** - Chưa có (chỉ nếu cần multi-tenant)

---

## 🛠️ TEMPLATE TẠO MODULE

### 1. Module Structure
```
backend/src/modules/{module-name}/
├── {module-name}.module.ts
├── {module-name}.controller.ts
├── {module-name}.service.ts
└── dto/
    ├── create-{module-name}.dto.ts
    ├── update-{module-name}.dto.ts
    └── {module-name}-query.dto.ts
```

### 2. Module File Template
```typescript
import { Module } from '@nestjs/common';
import { {ModuleName}Controller } from './{module-name}.controller';
import { {ModuleName}Service } from './{module-name}.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [{ModuleName}Controller],
    providers: [{ModuleName}Service, PrismaService, AuditLogService],
    exports: [{ModuleName}Service]
})
export class {ModuleName}Module { }
```

### 3. Controller Template
```typescript
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { {ModuleName}Service } from './{module-name}.service';
import { {ModuleName}QueryDto } from './dto/{module-name}-query.dto';
import { Create{ModuleName}Dto } from './dto/create-{module-name}.dto';
import { Update{ModuleName}Dto } from './dto/update-{module-name}.dto';

@Controller('{module-name}s')
export class {ModuleName}Controller {
    constructor(private service: {ModuleName}Service) { }

    @Get()
    list(@Query() query: {ModuleName}QueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: Create{ModuleName}Dto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: Update{ModuleName}Dto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
}
```

### 4. Service Template
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Create{ModuleName}Dto } from './dto/create-{module-name}.dto';
import { Update{ModuleName}Dto } from './dto/update-{module-name}.dto';
import { {ModuleName}QueryDto } from './dto/{module-name}-query.dto';

@Injectable()
export class {ModuleName}Service {
    constructor(private prisma: PrismaService) { }

    async findAll(query: {ModuleName}QueryDto) {
        // Implementation
    }

    async findOne(id: string) {
        // Implementation
    }

    async create(dto: Create{ModuleName}Dto) {
        // Implementation
    }

    async update(id: string, dto: Update{ModuleName}Dto) {
        // Implementation
    }

    async delete(id: string) {
        // Implementation
    }
}
```

---

## 📝 LƯU Ý

1. **Đăng ký module trong `app.module.ts`** sau khi tạo
2. **Thêm guards/roles** nếu cần phân quyền
3. **Thêm validation** trong DTOs
4. **Thêm audit logs** cho các thao tác quan trọng
5. **Thêm tests** (unit tests, integration tests)

---

## 🔗 DEPENDENCIES

- ✅ **MarketingCampaign** → CustomerSegment, NotificationTemplate (Đã có)
- ✅ **LoyaltyTransaction** → LoyaltyProgram, Customer, Booking (Đã có)
- ✅ **PricingRule** → VehicleCategory (Đã có)
- ❌ **Tenant** → SubscriptionPlan (Chưa có - Multi-tenant)

---

## 📊 TỔNG KẾT CẬP NHẬT

### ✅ Đã hoàn thành (8/10 modules - 80%)

1. ✅ **NotificationTemplateModule** - Hoàn thành
2. ✅ **CustomerSegmentModule** - Hoàn thành
3. ✅ **MarketingCampaignModule** - Hoàn thành
4. ✅ **LoyaltyProgramModule** - Hoàn thành
5. ✅ **LoyaltyTransactionModule** - Hoàn thành
6. ✅ **PricingRuleModule** - Hoàn thành
7. ✅ **PartnerModule** - Hoàn thành
8. ✅ **PasswordResetToken** - Logic có trong AuthModule (không cần module riêng)

### ❌ Còn thiếu (2/10 modules - 20%)

1. ❌ **SubscriptionPlanModule** - Multi-tenant feature (tùy chọn)
2. ❌ **TenantModule** - Multi-tenant feature (tùy chọn)

### ⚠️ Cần cải thiện

- **Integration Logic:**
  - Hook LoyaltyProgram vào BookingModule để auto-calculate points
  - Hook PricingRule vào BookingModule để apply dynamic pricing
  - Auto-update CustomerSegment membership
  - Auto-send MarketingCampaign (cần job queue)

- **Advanced Features:**
  - Email/SMS service integration cho MarketingCampaign
  - Job queue (Bull) cho scheduled campaigns
  - Preview template với sample data
  - Builder UI cho CustomerSegment conditions

