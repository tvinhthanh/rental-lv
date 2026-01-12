# 📋 BÁO CÁO VALIDATION CÁC FORM

## ✅ TỔNG QUAN

Đã kiểm tra các form trong UI, phát hiện **nhiều field chưa có validation đầy đủ**.

---

## 🔴 CÁC VẤN ĐỀ CHÍNH

### 1. **Thiếu Validation Messages**
- ❌ Không có error messages hiển thị dưới các field
- ❌ Chỉ dựa vào HTML5 `required` attribute
- ❌ User không biết lỗi cụ thể là gì

### 2. **Thiếu Format Validation**
- ❌ Email không validate format
- ❌ Phone không validate format (VN: 10 số, bắt đầu 0)
- ❌ License plate không validate format
- ❌ National ID không validate format

### 3. **Thiếu Range/Logic Validation**
- ❌ Date range: startDate < endDate
- ❌ Number fields: min/max values
- ❌ Discount: 0-100% hoặc amount > 0
- ❌ Usage limit: > 0

### 4. **Thiếu Real-time Validation**
- ❌ Chỉ validate khi submit
- ❌ Không có validation khi user đang nhập
- ❌ Không có visual feedback (red border, error icon)

---

## 📊 CHI TIẾT TỪNG FORM

### 1. **Vehicle Modal** (`vehicle-modal.tsx`)

#### ✅ Đã có:
- `required` cho: name, licensePlate, brandId, branchId, categoryId
- `type="number"` cho: year, seatCount, mileage, price fields

#### ❌ Thiếu:
- [ ] **License Plate**: Format validation (VD: 30A-12345, 51G-12345)
- [ ] **Year**: Min/Max (1900 - current year + 1)
- [ ] **Seat Count**: Min 1, Max 50
- [ ] **Mileage**: Min 0
- [ ] **Price fields**: Min 0, format số
- [ ] **Email** (nếu có): Format validation
- [ ] **Slug**: Format validation (lowercase, no spaces)
- [ ] **Error messages** hiển thị dưới mỗi field

---

### 2. **Customer Modal** (`customer-modal.tsx`)

#### ✅ Đã có:
- Basic validation trong `onSubmit`: check `fullName` và `phone` không rỗng

#### ❌ Thiếu:
- [ ] **Full Name**: Min length 2, Max length 100
- [ ] **Phone**: Format VN (10 số, bắt đầu 0) hoặc international format
- [ ] **Email**: Format validation (regex)
- [ ] **National ID**: Format validation (9 hoặc 12 số)
- [ ] **Driver License**: Format validation
- [ ] **License Expiry**: Phải > today
- [ ] **Real-time validation** khi user nhập
- [ ] **Error messages** hiển thị dưới mỗi field

**Code hiện tại:**
```typescript
const onSubmit = () => {
    if (!form.fullName || !form.phone) {
        toast.error("Full name and phone are required");
        return;
    }
    mutation.mutate();
};
```

**Cần cải thiện:**
```typescript
const [errors, setErrors] = useState({});

const validate = () => {
    const errs: any = {};
    if (!form.fullName || form.fullName.length < 2) {
        errs.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }
    if (!form.phone || !/^0\d{9}$/.test(form.phone)) {
        errs.phone = "Số điện thoại phải có 10 số và bắt đầu bằng 0";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = "Email không hợp lệ";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
};
```

---

### 3. **Employee Modal** (`EmployeeModal.tsx`)

#### ✅ Đã có:
- `required` cho: fullName

#### ❌ Thiếu:
- [ ] **Full Name**: Min length 2, Max length 100
- [ ] **Phone**: Format validation
- [ ] **Email**: Format validation
- [ ] **Salary**: Min 0, Max reasonable value
- [ ] **Hire Date**: Không được > today
- [ ] **Error messages** hiển thị dưới mỗi field

---

### 4. **Promotion Modal** (`promotion-modal.tsx`)

#### ✅ Đã có:
- `required` cho: code, name
- `min={0}`, `max={100}` cho discountPercent
- `min={0}` cho discountAmount, usageLimit
- Validation trong `onSubmit`: check có discountPercent hoặc discountAmount

#### ❌ Thiếu:
- [ ] **Code**: Format validation (uppercase, no spaces, alphanumeric)
- [ ] **Discount Percent**: Phải <= 100
- [ ] **Discount Amount**: Phải > 0 nếu có
- [ ] **Usage Limit**: Phải > 0 nếu có
- [ ] **Date Range**: startDate < endDate, endDate > today
- [ ] **Error messages** hiển thị dưới mỗi field

**Code hiện tại:**
```typescript
if (!hasDiscount) {
    toast.error("Cần nhập % hoặc số tiền giảm.");
    return;
}
```

**Cần thêm:**
```typescript
if (form.startDate && form.endDate && form.startDate >= form.endDate) {
    toast.error("Ngày kết thúc phải sau ngày bắt đầu");
    return;
}
if (form.endDate && new Date(form.endDate) < new Date()) {
    toast.error("Ngày kết thúc không được là quá khứ");
    return;
}
```

---

### 5. **Branch Modal** (`branch-modal.tsx`)

#### ✅ Đã có:
- `required` cho: name

#### ❌ Thiếu:
- [ ] **Name**: Min length 2, Max length 200
- [ ] **Code**: Format validation (uppercase, alphanumeric)
- [ ] **Email**: Format validation
- [ ] **Phone**: Format validation
- [ ] **Latitude**: Range -90 to 90
- [ ] **Longitude**: Range -180 to 180
- [ ] **Slug**: Format validation (lowercase, no spaces)
- [ ] **Error messages** hiển thị dưới mỗi field

---

### 6. **Booking Form** (`user/bookings/[slug]/page.tsx`)

#### ✅ Đã có:
- Date conflict validation (check disabled dates, unavailable ranges)
- Alert khi có conflict

#### ❌ Thiếu:
- [ ] **Date Range**: startDate < endDate
- [ ] **Start Date**: Không được < today
- [ ] **End Date**: Phải > startDate
- [ ] **Visual feedback** cho dates có conflict (đã có một phần)
- [ ] **Error messages** rõ ràng hơn

---

### 7. **Login Form** (`login-form.tsx`)

#### ✅ Đã có:
- Basic validation: check email và password không rỗng

#### ❌ Thiếu:
- [ ] **Email**: Format validation
- [ ] **Password**: Min length (thường 6-8 ký tự)
- [ ] **Error messages** hiển thị dưới mỗi field

---

## 🎯 CÁC LOẠI VALIDATION CẦN THÊM

### 1. **Required Fields**
- ✅ Một số form đã có `required` attribute
- ❌ Cần thêm error messages khi field trống

### 2. **Format Validation**

#### Email
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

#### Phone (Vietnam)
```typescript
const phoneRegex = /^0\d{9}$/; // 10 số, bắt đầu 0
```

#### License Plate (Vietnam)
```typescript
const licensePlateRegex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/;
// VD: 30A-12345, 51G-12345
```

#### National ID (Vietnam)
```typescript
const nationalIdRegex = /^[0-9]{9}$|^[0-9]{12}$/;
// 9 số (CMND) hoặc 12 số (CCCD)
```

#### Slug
```typescript
const slugRegex = /^[a-z0-9-]+$/;
// lowercase, numbers, hyphens only
```

### 3. **Range Validation**

#### Date Range
```typescript
if (startDate >= endDate) {
    error = "Ngày kết thúc phải sau ngày bắt đầu";
}
if (endDate < new Date()) {
    error = "Ngày kết thúc không được là quá khứ";
}
```

#### Number Range
```typescript
if (value < min || value > max) {
    error = `Giá trị phải từ ${min} đến ${max}`;
}
```

### 4. **Length Validation**
```typescript
if (value.length < minLength) {
    error = `Tối thiểu ${minLength} ký tự`;
}
if (value.length > maxLength) {
    error = `Tối đa ${maxLength} ký tự`;
}
```

---

## 💡 GIẢI PHÁP ĐỀ XUẤT

### Option 1: Sử dụng React Hook Form với Validation Schema

**Ưu điểm:**
- Validation tự động
- Error messages tự động
- Real-time validation
- Dễ maintain

**Ví dụ:**
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const customerSchema = z.object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100),
    phone: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
    email: z.string().email("Email không hợp lệ").optional(),
    // ...
});

const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema)
});
```

### Option 2: Custom Validation Hook

**Tạo hook `useFormValidation.ts`:**
```typescript
export const useFormValidation = () => {
    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    
    const validatePhone = (phone: string) => {
        return /^0\d{9}$/.test(phone);
    };
    
    // ... more validators
    
    return { validateEmail, validatePhone, ... };
};
```

### Option 3: Validation Utility Functions

**Tạo file `utils/validation.ts`:**
```typescript
export const validators = {
    required: (value: any) => !value ? "Trường này là bắt buộc" : null,
    email: (value: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Email không hợp lệ" : null,
    phone: (value: string) => !/^0\d{9}$/.test(value) ? "Số điện thoại không hợp lệ" : null,
    minLength: (min: number) => (value: string) => 
        value.length < min ? `Tối thiểu ${min} ký tự` : null,
    maxLength: (max: number) => (value: string) => 
        value.length > max ? `Tối đa ${max} ký tự` : null,
    // ...
};
```

---

## 📋 CHECKLIST VALIDATION CẦN THÊM

### Form: Vehicle Modal
- [ ] License plate format
- [ ] Year range (1900 - current+1)
- [ ] Seat count (1-50)
- [ ] Mileage (>= 0)
- [ ] Price fields (>= 0)
- [ ] Error messages

### Form: Customer Modal
- [ ] Full name (2-100 chars)
- [ ] Phone format (VN)
- [ ] Email format
- [ ] National ID format
- [ ] Driver license format
- [ ] License expiry (> today)
- [ ] Error messages

### Form: Employee Modal
- [ ] Full name (2-100 chars)
- [ ] Phone format
- [ ] Email format
- [ ] Salary range
- [ ] Hire date (<= today)
- [ ] Error messages

### Form: Promotion Modal
- [ ] Code format (uppercase, alphanumeric)
- [ ] Discount percent (0-100)
- [ ] Discount amount (> 0)
- [ ] Usage limit (> 0)
- [ ] Date range (start < end, end > today)
- [ ] Error messages

### Form: Branch Modal
- [ ] Name (2-200 chars)
- [ ] Code format
- [ ] Email format
- [ ] Phone format
- [ ] Latitude (-90 to 90)
- [ ] Longitude (-180 to 180)
- [ ] Error messages

### Form: Booking Form
- [ ] Date range validation
- [ ] Start date (>= today)
- [ ] End date (> start date)
- [ ] Error messages

### Form: Login Form
- [ ] Email format
- [ ] Password min length
- [ ] Error messages

---

## 🎨 UI/UX CẢI THIỆN

### 1. Error Messages
```tsx
{errors.fieldName && (
    <p className="text-red-400 text-xs mt-1">{errors.fieldName}</p>
)}
```

### 2. Visual Feedback
```tsx
<input
    className={`... ${errors.fieldName ? 'border-red-500' : ''}`}
/>
```

### 3. Real-time Validation
```tsx
onBlur={(e) => validateField('fieldName', e.target.value)}
```

---

## 📊 TỔNG KẾT

### Đã có ✅
- Một số field có `required` attribute
- Một số form có basic validation trong onSubmit
- Một số number field có min/max

### Còn thiếu ❌
- **Format validation** (email, phone, license plate, etc.)
- **Range validation** (dates, numbers)
- **Length validation** (min/max length)
- **Error messages** hiển thị dưới fields
- **Real-time validation**
- **Visual feedback** (red border, error icon)

### Ưu tiên
1. **HIGH**: Thêm error messages cho tất cả fields
2. **HIGH**: Format validation cho email, phone
3. **MEDIUM**: Date range validation
4. **MEDIUM**: Number range validation
5. **LOW**: Real-time validation

---

**Cập nhật:** $(date)
