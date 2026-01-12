# 💳 Payment Methods - Stripe & Cash

## 📋 Tổng quan

Hệ thống hỗ trợ **2 phương thức thanh toán**:

1. **Stripe** - Thanh toán online (Thẻ tín dụng/ghi nợ)
2. **Tiền mặt (Cash)** - Thanh toán trực tiếp tại cửa hàng

---

## 🔧 Backend Implementation

### 1. Cash Payment Endpoint

**POST** `/api/billing/payments/cash`

**Request Body:**
```json
{
  "invoiceId": "invoice_id",
  "amount": 1000000,
  "referenceNo": "CASH-1234567890", // Optional, tự động generate nếu không có
  "note": "Thanh toán tiền mặt" // Optional
}
```

**Response:**
```json
{
  "message": "Cash payment recorded successfully",
  "payment": {
    "id": "payment_id",
    "invoiceId": "invoice_id",
    "method": "CASH",
    "amount": 1000000,
    "status": "SUCCESS",
    "paidAt": "2024-12-19T10:00:00Z"
  }
}
```

### 2. Stripe Payment Endpoint

**POST** `/api/payment-gateway/stripe/create-intent`

**Request Body:**
```json
{
  "invoiceId": "invoice_id",
  "amount": 1000000,
  "currency": "vnd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

---

## 🎨 Frontend Components

### 1. PaymentMethodSelector (Khuyến nghị)

Component chính để chọn phương thức thanh toán:

```tsx
import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";

<PaymentMethodSelector
  invoiceId={invoice.id}
  amount={invoice.totalAmount}
  currency="vnd"
  onSuccess={() => {
    toast.success("Thanh toán thành công!");
    router.refresh();
  }}
  onError={(error) => {
    toast.error(error);
  }}
/>
```

**Tính năng:**
- ✅ UI để chọn giữa Stripe và Cash
- ✅ Tự động hiển thị form tương ứng
- ✅ Có nút quay lại để chọn lại phương thức
- ✅ Gradient design với icons

### 2. CashPaymentButton (Standalone)

Component riêng cho thanh toán tiền mặt:

```tsx
import CashPaymentButton from "@/components/payment/CashPaymentButton";

<CashPaymentButton
  invoiceId={invoice.id}
  amount={invoice.totalAmount}
  onSuccess={() => router.refresh()}
  onError={(error) => toast.error(error)}
/>
```

**Tính năng:**
- ✅ Form nhập ghi chú
- ✅ Confirmation dialog
- ✅ Loading states
- ✅ Success/Error handling

### 3. StripePaymentButton (Standalone)

Component riêng cho thanh toán Stripe:

```tsx
import StripePaymentButton from "@/components/payment/StripePaymentButton";

<StripePaymentButton
  invoiceId={invoice.id}
  amount={invoice.totalAmount}
  currency="vnd"
  onSuccess={() => router.refresh()}
  onError={(error) => toast.error(error)}
/>
```

---

## 📝 Usage Examples

### Trong Invoice Detail Page

```tsx
"use client";

import { useState } from "react";
import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";
import { billingService } from "@/services/billing.service";

export default function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState(null);

  // Load invoice...

  if (invoice.status === "PAID") {
    return <div>Hóa đơn đã thanh toán</div>;
  }

  return (
    <div>
      <h2>Thanh toán hóa đơn {invoice.invoiceNo}</h2>
      <p>Tổng tiền: {invoice.totalAmount.toLocaleString("vi-VN")} đ</p>
      
      <PaymentMethodSelector
        invoiceId={invoice.id}
        amount={invoice.totalAmount}
        currency="vnd"
        onSuccess={async () => {
          // Reload invoice
          const updated = await billingService.invoice(invoice.id);
          setInvoice(updated);
        }}
      />
    </div>
  );
}
```

### Trong Admin Invoice Management

```tsx
// Admin có thể chọn thanh toán tiền mặt trực tiếp
import CashPaymentButton from "@/components/payment/CashPaymentButton";

<CashPaymentButton
  invoiceId={invoice.id}
  amount={remainingAmount}
  onSuccess={() => {
    toast.success("Đã ghi nhận thanh toán tiền mặt");
    loadInvoices();
  }}
/>
```

---

## 🔄 Payment Flow

### Stripe Payment Flow
1. User chọn "Thanh toán online"
2. Click "Thanh toán ngay"
3. Backend tạo Payment Intent
4. Frontend hiển thị Stripe Elements form
5. User nhập thông tin thẻ
6. Stripe xử lý thanh toán
7. Webhook cập nhật payment status
8. Invoice status được cập nhật tự động

### Cash Payment Flow
1. User/Admin chọn "Tiền mặt"
2. Nhập ghi chú (optional)
3. Click "Xác nhận nhận tiền mặt"
4. Backend tạo payment với method="CASH", status="SUCCESS"
5. Invoice status được cập nhật ngay lập tức
6. Payment được ghi nhận trong database

---

## 📊 Payment Status

### Payment Methods
- `STRIPE` - Thanh toán qua Stripe
- `CASH` - Thanh toán tiền mặt
- `BANK_TRANSFER` - Chuyển khoản (có thể thêm sau)
- `OTHER` - Phương thức khác

### Payment Status
- `PENDING` - Đang chờ (chỉ cho Stripe)
- `SUCCESS` - Thành công
- `FAILED` - Thất bại (chỉ cho Stripe)
- `REFUNDED` - Đã hoàn tiền

---

## ⚠️ Lưu ý

1. **Cash Payment**: Luôn có status="SUCCESS" ngay khi tạo
2. **Stripe Payment**: Status được cập nhật qua webhook
3. **Invoice Status**: Tự động cập nhật dựa trên tổng số tiền đã thanh toán
4. **Reference No**: 
   - Stripe: Payment Intent ID
   - Cash: `CASH-{timestamp}` (tự động generate)

---

## 🚀 Next Steps

- [ ] Thêm Bank Transfer payment method
- [ ] Thêm QR code payment (VNPay QR)
- [ ] Payment history page
- [ ] Payment receipt generation
- [ ] Refund functionality UI

---

**Cập nhật:** 2024-12-19
