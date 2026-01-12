# 📘 MongoDB Migration Guide - Prisma

## ⚠️ Quan trọng: MongoDB không hỗ trợ Migrations

MongoDB là NoSQL database và **Prisma không hỗ trợ `prisma migrate`** cho MongoDB như với SQL databases (PostgreSQL, MySQL, etc.).

## ✅ Cách làm việc với MongoDB + Prisma

### 1. Thay đổi Schema

Khi bạn thay đổi `schema.prisma`:

```prisma
model Vehicle {
  // ... existing fields ...
  viewCount Int? @default(0)  // Thêm field mới
}
```

### 2. Generate Prisma Client

Chỉ cần chạy:
```bash
cd backend
npx prisma generate
```

✅ **Đã xong!** Schema changes sẽ được apply tự động khi code chạy.

### 3. Schema Changes được Apply Tự Động

- **Fields mới:** Sẽ được tạo tự động khi insert/update documents
- **Default values:** Sẽ được apply khi tạo documents mới
- **Relations:** Sẽ hoạt động ngay khi generate xong

### 4. Update Existing Documents (Nếu cần)

Nếu bạn cần set default values cho documents đã tồn tại, có thể tạo script:

```typescript
// scripts/update-existing-documents.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateExistingVehicles() {
  // Update all vehicles without viewCount
  await prisma.vehicle.updateMany({
    where: { viewCount: null },
    data: { viewCount: 0 }
  });
  
  console.log('✅ Updated existing vehicles');
}

updateExistingVehicles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Chạy script:
```bash
npx ts-node scripts/update-existing-documents.ts
```

## 📋 Checklist khi thêm fields mới

- [x] Thêm field vào `schema.prisma`
- [x] Chạy `npx prisma generate`
- [ ] (Optional) Tạo script update existing documents nếu cần default values
- [ ] Update DTOs nếu cần
- [ ] Update Service logic nếu cần
- [ ] Update Frontend nếu cần

## 🔄 So sánh với SQL Databases

| Feature | SQL (PostgreSQL/MySQL) | MongoDB |
|---------|------------------------|---------|
| Migrations | ✅ `prisma migrate dev` | ❌ Không hỗ trợ |
| Generate Client | ✅ `prisma generate` | ✅ `prisma generate` |
| Schema Changes | Cần migration | Tự động apply |
| Default Values | Apply trong migration | Apply khi tạo document |

## 💡 Best Practices

1. **Luôn chạy `prisma generate`** sau khi thay đổi schema
2. **Test schema changes** trong development trước
3. **Update existing documents** nếu cần set default values
4. **Backup database** trước khi thay đổi schema lớn
5. **Document changes** trong commit messages

## 🚨 Lưu ý

- MongoDB không có schema validation như SQL
- Cần đảm bảo code handle missing fields gracefully
- Default values chỉ apply cho documents mới
- Existing documents cần update manually nếu cần

---

**Tóm lại:** Với MongoDB, chỉ cần `prisma generate` là đủ! 🎉
