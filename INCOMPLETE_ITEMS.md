# 📋 BÁO CÁO CÁC PHẦN CHƯA HOÀN THIỆN

## ✅ TỔNG QUAN

Hầu hết các module và tính năng đã được triển khai. Dưới đây là danh sách các phần còn thiếu hoặc chưa hoàn thiện:

---

## 🔴 ƯU TIÊN CAO

### 1. Menu Sidebar Admin - Thiếu 2 items

**Vấn đề:** Có page nhưng chưa có trong menu sidebar

#### 1.1. Audit Logs
- ✅ **Page đã có:** `/admin/audit-logs`
- ❌ **Chưa có trong menu:** `frontends/lib/role-menu-sidebar.ts`
- 💡 **Cần thêm:** Menu item "Nhật ký hệ thống" hoặc "Audit Logs" vào menu Admin

#### 1.2. Settings
- ✅ **Page đã có:** `/admin/settings`
- ❌ **Chưa có trong menu:** `frontends/lib/role-menu-sidebar.ts`
- 💡 **Cần thêm:** Menu item "Cài đặt" hoặc "Settings" vào menu Admin

**File cần sửa:** `frontends/lib/role-menu-sidebar.ts`

---

### 2. Tính năng Membership Upgrade

**Vấn đề:** Button "Nâng cấp ngay" chưa có chức năng

**File:** `frontends/app/(user-group)/user/membership/page.tsx`

**Chi tiết:**
- ✅ UI đã có đầy đủ
- ✅ Hiển thị gói hiện tại của user
- ❌ Button "Nâng cấp ngay" chưa có handler
- ❌ Chưa có API endpoint để upgrade membership
- ❌ Chưa có logic xử lý payment cho membership

**Cần làm:**
1. Tạo API endpoint để upgrade membership (backend)
2. Tạo service để gọi API (frontend)
3. Thêm handler cho button "Nâng cấp ngay"
4. Tích hợp payment gateway (nếu cần)
5. Update customer.membershipTier sau khi upgrade thành công

---

## 🟡 ƯU TIÊN TRUNG BÌNH

### 3. TODO trong Code

#### 3.1. User Controller - actorId
**File:** `backend/src/modules/user/user.controller.ts`

**Dòng 36:**
```typescript
// TODO: lấy actorId từ CurrentUser sau
return this.service.create(dto);
```

**Dòng 50:**
```typescript
// tạm dùng id làm actorId, sau gắn CurrentUser
return this.service.changePassword(id, dto, id);
```

**Vấn đề:** Đang hardcode actorId thay vì lấy từ CurrentUser decorator

**Giải pháp:** 
- Sử dụng `@CurrentUser()` decorator (đã có sẵn trong project)
- Các module khác đã sử dụng đúng pattern này

**Ví dụ từ các module khác:**
```typescript
create(@Body() dto: CreateDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
}
```

---

### 4. Kiểm tra tính năng Blog

**Theo FEATURE_STATUS.md:**
- ✅ Có page `/user/blog` và `/user/blog/[slug]`
- ⚠️ Cần kiểm tra tính năng đầy đủ:
  - CRUD blog posts (Admin)
  - Categories management
  - Search functionality
  - SEO optimization

**Cần kiểm tra:**
- [ ] Admin có thể tạo/sửa/xóa blog posts?
- [ ] Có filter/search blog posts?
- [ ] Có pagination?
- [ ] SEO fields có được sử dụng đúng?

---

## 🟢 ƯU TIÊN THẤP

### 5. Export Excel/PDF

**Theo FEATURE_STATUS.md:**
- [ ] Báo cáo doanh thu chi tiết
- [ ] Báo cáo xe theo thời gian
- [ ] Báo cáo khách hàng
- [ ] Export Excel/PDF cho các báo cáo

**Cần thêm:**
- Library: `xlsx` hoặc `exceljs` cho Excel
- Library: `pdfkit` hoặc `puppeteer` cho PDF
- API endpoints để export
- UI buttons để trigger export

---

### 6. Cải thiện UI/UX

**Theo FEATURE_STATUS.md:**
- [ ] Loading states cho các modal và form
- [ ] Validation messages rõ ràng hơn
- [ ] Skeleton screens khi loading
- [ ] Filter nâng cao cho các danh sách

---

### 7. Notification Center

**Theo FEATURE_STATUS.md:**
- ✅ Có Socket.io integration
- ⚠️ Cần kiểm tra đầy đủ tính năng notification
- [ ] Notification center UI (tập trung tất cả notifications)
- [ ] Real-time notifications
- [ ] Notification preferences

---

### 8. Multi-tenant Features (Nếu cần)

**Theo MISSING_MODULES.md:**
- [ ] SubscriptionPlanModule (nếu cần multi-tenant)
- [ ] TenantModule (nếu cần multi-tenant)

**Lưu ý:** Chỉ cần nếu muốn làm SaaS model

---

## 📊 TỔNG KẾT

### Đã hoàn thành ✅
- ✅ Tất cả các module backend đã được tạo (theo MISSING_MODULES.md)
- ✅ Tất cả các page frontend đã có (theo FEATURE_STATUS.md)
- ✅ Core business logic đã hoàn thiện
- ✅ Authentication & Authorization đã có

### Còn thiếu ❌
1. **2 menu items trong Admin sidebar** (Audit Logs, Settings)
2. **Tính năng upgrade membership** (API + UI handler)
3. **TODO trong User Controller** (sử dụng CurrentUser)
4. **Export Excel/PDF** (tùy chọn)
5. **Cải thiện UI/UX** (tùy chọn)

### Tổng số items cần làm: **5-8 items** (tùy theo ưu tiên)

---

## 🎯 KẾ HOẠCH HÀNH ĐỘNG

### Phase 1: Quick Wins (1-2 giờ)
1. ✅ Thêm Audit Logs vào menu sidebar
2. ✅ Thêm Settings vào menu sidebar
3. ✅ Fix TODO trong User Controller

### Phase 2: Tính năng quan trọng (1-2 ngày)
4. ✅ Implement Membership Upgrade API
5. ✅ Implement Membership Upgrade UI

### Phase 3: Cải thiện (tùy chọn)
6. ⚠️ Export Excel/PDF
7. ⚠️ Cải thiện UI/UX
8. ⚠️ Notification Center

---

**Cập nhật:** $(date)
