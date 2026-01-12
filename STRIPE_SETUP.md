# 💳 Stripe Payment Gateway Setup

## 📦 Cài đặt Dependencies

### Backend
```bash
cd backend
npm install stripe
```

### Frontend
```bash
cd frontends
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## 🔑 Environment Variables

### Backend (.env)
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe Secret Key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe Webhook Secret (for production)
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe Publishable Key
```

## 🔧 Backend Setup

### 1. PaymentGatewayModule
✅ Đã tạo:
- `backend/src/modules/payment-gateway/payment-gateway.module.ts`
- `backend/src/modules/payment-gateway/payment-gateway.service.ts`
- `backend/src/modules/payment-gateway/payment-gateway.controller.ts`

### 2. Đã đăng ký trong AppModule
✅ PaymentGatewayModule đã được thêm vào `app.module.ts`

### 3. Main.ts Configuration
✅ Đã enable `rawBody: true` để handle Stripe webhook

## 🎨 Frontend Setup

### 1. Payment Service
✅ Đã tạo: `frontends/services/payment-gateway.service.ts`

### 2. Stripe Payment Component
✅ Đã tạo: `frontends/components/payment/StripePaymentButton.tsx`

## 📝 Usage

### Trong Invoice Page
```tsx
import StripePaymentButton from "@/components/payment/StripePaymentButton";

<StripePaymentButton
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

## 🔗 API Endpoints

### 1. Create Payment Intent
```
POST /api/payment-gateway/stripe/create-intent
Body: {
  invoiceId: string;
  amount: number;
  currency?: string;
}
Response: {
  clientSecret: string;
  paymentIntentId: string;
}
```

### 2. Webhook (Stripe)
```
POST /api/payment-gateway/stripe/webhook
Headers: {
  stripe-signature: string
}
Body: Raw Stripe event
```

### 3. Get Payment Intent
```
GET /api/payment-gateway/stripe/payment-intent/:id
```

### 4. Create Refund
```
POST /api/payment-gateway/stripe/refund
Body: {
  paymentId: string;
  amount?: number;
}
```

## 🧪 Testing

### Test với Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test Webhook Locally
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3001/api/payment-gateway/stripe/webhook
```

## ⚠️ Lưu ý

1. **VND Currency**: Stripe hỗ trợ VND nhưng cần verify business ở Việt Nam
2. **Webhook Secret**: Cần setup webhook trong Stripe Dashboard và lấy secret
3. **Raw Body**: Backend đã enable rawBody để verify webhook signature
4. **Security**: Luôn verify webhook signature trước khi xử lý

## 🚀 Production Checklist

- [ ] Thay Stripe test keys bằng production keys
- [ ] Setup webhook endpoint trong Stripe Dashboard
- [ ] Lưu STRIPE_WEBHOOK_SECRET vào environment variables
- [ ] Test payment flow end-to-end
- [ ] Test webhook với real payments
- [ ] Setup error monitoring
- [ ] Setup payment notifications

---

**Cập nhật:** 2024-12-19
