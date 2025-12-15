
## Car Rental Management System – NestJS + Next.js

### 🎯 Overview

Full-stack car rental management system with:
- **Backend**: NestJS + TypeScript + Prisma + MongoDB
- **Frontend**: Next.js App Router + React + Tailwind CSS
- **Domain**: Vehicle rental workflow (booking → contract → deposit → handover → return → invoice), SEO content (blog, pages), promotions, and basic CRM.

This README mô tả **code hiện tại trong repo**, không chỉ là roadmap.

---

### 🧱 Project Structure

- **backend/**
  - `src/app.module.ts` – Root module wiring all feature modules
  - `src/modules/*` – Business modules (auth, booking, billing, vehicle, promotion, blog, page, …)
  - `prisma/schema.prisma` – MongoDB schema (Prisma)
  - `prisma/erd.md` – Mermaid ERD (tự sinh từ schema)
- **frontends/**
  - `app/(admin-group)/admin/*` – Admin dashboard (management screens)
  - `app/(employee-group)/employee/*` – Employee workflow (operational screens)
  - `app/(user-group)/user/*` – Customer portal (search cars, booking, invoices, profile…)
  - `app/(auth-group)/auth/*` – Auth pages (login/register)
  - `services/*.service.ts` – Typed API clients talking to backend

---

### 🗄 Backend – Modules & Features

File chính: `backend/src/app.module.ts`  
Database schema: `backend/prisma/schema.prisma`

#### Core Business

- **AuthModule** (`modules/auth`): JWT auth, login/register, forgot/reset password, guards.
- **UserModule** (`modules/user`): CRUD user, đổi mật khẩu, cập nhật role.
- **CustomerModule** (`modules/customer`): CRUD khách hàng, link `User`.
- **EmployeeModule** (`modules/employee`): CRUD nhân viên, chi nhánh, quyền hạn.
- **BranchModule** (`modules/branch`): Chi nhánh + local SEO (lat/lng, map URL, business hours).
- **VehicleCategoryModule** (`modules/vehicle-category`): Danh mục xe + SEO.
- **VehicleBrandModule** (`modules/brand`): Hãng xe (logo, slug, SEO).
- **PriceListModule** (`modules/price-list`): Bảng giá theo loại xe.
- **VehicleModule** (`modules/vehicle`): CRUD xe, liên kết category/branch/brand/priceList, SEO fields, photos.

#### Booking Flow

- **BookingModule** (`modules/booking`)
  - Tạo booking:
    - Kiểm tra xe rảnh (`checkVehicleAvailable`)
    - Tự tính giá thuê theo khoảng ngày (`calcPrice`)
    - Hỗ trợ **promotion** thông qua `promotionId`
  - Cập nhật / cancel / đổi status booking
  - API list + filter (status, branch, vehicle, customer…)
  - Trả về đầy đủ quan hệ: `customer`, `vehicle`, `branch`, `returnBranch`, `contract`, `deposit`, `handover`, `returnReport`, `invoice`, `review`, `promotion`.
  - Hàm `getDateAvailable` tổng hợp dải ngày đã được đặt để FE disable date.
- **ContractModule** (`modules/contact`): Hợp đồng thuê xe.
- **DepositModule** (`modules/deposit`): Đặt cọc + chi tiết tài sản cọc.
- **HandoverModule** (`modules/handover`): Biên bản bàn giao xe.
- **ReturnReportModule** (`modules/return-report`): Báo cáo trả xe.

#### Billing & Finance

- **BillingModule** (`modules/billing`): Điều phối Invoice/Payment/Surcharge.
- **Invoice / Payment / Surcharge**: Nằm trong Prisma schema, thao tác qua Billing APIs.

#### Operations & Settings

- **MaintenanceModule** (`modules/maintenance`): Lịch sử bảo dưỡng, chi phí, nhắc bảo dưỡng.
- **AuditLogModule** (`modules/audit-log`): Audit mọi thay đổi quan trọng.
- **CloudinaryModule** (`cloudinary`): Upload file/image lên Cloudinary.
- **SettingsModule** (`modules/settings`): Cấu hình hệ thống (map `SystemConfig`).

#### Marketing, Content & Promotion

- **PromotionModule** (`modules/promotion`)
  - Mã khuyến mãi:
    - code, name, description
    - discountPercent / discountAmount
    - usageLimit / usedCount
    - startDate / endDate, status
  - `BookingService`:
    - `validatePromotion()` kiểm tra thời gian + trạng thái + usage limit
    - Khi tạo booking: tự tính discount từ promotion, ghi `promotionId`, tăng `usedCount`.
- **BlogModule** (`modules/blog`): CRUD blog categories + posts (slug, metaTitle, metaDescription).
- **PageModule** (`modules/page`): CRUD các trang tĩnh (About, FAQ, Terms, Privacy…).

> Các module Marketing nâng cao (notification, loyalty, campaign, multi-tenant…) đã có schema trong Prisma nhưng **chưa có full API/UI** – xem `PHAN_TICH_PHAN_THIEU.md` nếu cần chi tiết.

---

### 🎨 Frontend – Apps & Flows

Thư mục: `frontends/`

#### User Portal (`app/(user-group)/user`)

- `user/cars` – Listing xe.
- `user/cars/[slug]` – Trang chi tiết xe:
  - Ảnh chính + gallery.
  - Thông tin: biển số, hãng, mẫu, năm, màu, danh mục, chi nhánh, trạng thái.
  - Giá thuê từ `priceList.dailyRate`.
  - Nếu user là CUSTOMER nhưng **chưa có Customer profile**:
    - Nút **“Tạo hồ sơ khách hàng để thuê xe”** → modal `CreateCustomerModal`.
  - Nếu đã có profile:
    - Nút **“Thuê ngay”** → `user/bookings/[vehicle.slug]`.
  - **Reviews block**:
    - Dùng `reviewService.list({ vehicleId, limit: 20 })`.
    - Tính `avgRating` từ reviews +/or `vehicle.rating`.
    - Hiển thị sao, tên khách, comment, mã booking, ngày.
- Các trang khác: `bookings`, `invoices`, `profile`, `about`, `contact`, `terms`, `privacy`, `refund`, `membership`, `sitemap`…

#### Admin Portal (`app/(admin-group)/admin`)

- Dashboard quản lý:
  - Vehicles, Vehicle Categories, Vehicle Brands
  - Branches
  - Customers, Employees, Users
  - Bookings, Contracts, Deposits, Returns, Invoices, Payments
  - Price Lists, Maintenance, Promotions, Settings, Audit Logs

#### Employee Portal (`app/(employee-group)/employee`)

- Dành cho nhân viên:
  - Lịch bookings theo chi nhánh
  - Handover / Returns
  - Thu cọc, thanh toán, hóa đơn
  - Làm việc với khách tại chi nhánh

#### Auth & Shared UI

- `app/(auth-group)/auth` – Login/Register.
- `components/*`, `providers/*` – Layout, theme, React Query, Redux…

---

### 🔌 Frontend ↔ Backend Integration

- `frontends/lib/api.ts` – `APIRequest`:
  - Base URL: `NEXT_PUBLIC_API_ENDPOINT`
  - Tự attach `Authorization` từ cookie/localStorage
  - Bắt lỗi khi backend trả HTML/redirect.
- `frontends/services/*.service.ts` – Service layer (vehicle, booking, promotion, review, settings…)
  - Ví dụ `review.service.ts`:
    ```ts
    reviewService.list({ vehicleId, limit: 20 });
    ```

---

### 🚀 Run Project

#### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Yêu cầu:
- MongoDB + `DATABASE_URL` trong `backend/.env`.

#### Frontend

```bash
cd frontends
npm install
npm run dev
```

Yêu cầu:
- `NEXT_PUBLIC_API_ENDPOINT` trong `frontends/.env.local` trỏ về backend.

---

### 📚 Tài liệu thêm

- `TECH_STACK.md` – Tech stack chi tiết.
- `QUICKSTART.md` – Hướng dẫn dựng project template.
- `INDEX.md` – Roadmap 5 phase + budget.
- `CHECKLIST.md` – Checklist 35 bảng/tính năng.
- `PHAN_TICH_PHAN_THIEU.md` – Phân tích phần đã làm & còn thiếu dựa trên code.

---

### ✅ Trạng thái hiện tại (ngắn gọn)

- ✅ Schema Prisma đầy đủ cho core + SEO + marketing/enterprise.
- ✅ Backend: phần lớn core modules hoạt động (auth, booking, vehicle, promotion, blog, page, billing, audit-log, …).
- ✅ Frontend: 3 portal (admin, employee, user) + auth, booking flow cơ bản và review hiển thị trên trang chi tiết xe.
- ⏳ Một số module nâng cao vẫn theo roadmap, chưa có full API + UI.


