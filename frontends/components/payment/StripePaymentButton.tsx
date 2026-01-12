"use client";

import { useState } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { paymentGatewayService } from "@/services/payment-gateway.service";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface StripePaymentButtonProps {
  invoiceId: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function PaymentForm({ invoiceId, amount, currency = "vnd", onSuccess, onError }: StripePaymentButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Thanh toán thất bại");
        onError?.(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Thanh toán thành công!");
        onSuccess?.();
      }
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
      onError?.(err?.message || "Payment error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Thanh toán {amount.toLocaleString("vi-VN")} đ</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function StripePaymentButton({ invoiceId, amount, currency, onSuccess, onError }: StripePaymentButtonProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitPayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentGatewayService.createStripePaymentIntent({
        invoiceId,
        amount,
        currency,
      });

      setClientSecret(response.clientSecret);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Không thể khởi tạo thanh toán";
      toast.error(errorMessage);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Thanh toán qua Stripe</h3>
              <p className="text-slate-400 text-sm">Tổng tiền: {amount.toLocaleString("vi-VN")} đ</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <button
            onClick={handleInitPayment}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang khởi tạo...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Thanh toán ngay</span>
              </>
            )}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
          )}
        </div>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#3b82f6",
        colorBackground: "#0f172a",
        colorText: "#f1f5f9",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Thanh toán qua Stripe</h3>
        <Elements options={options} stripe={stripePromise}>
          <PaymentForm invoiceId={invoiceId} amount={amount} currency={currency} onSuccess={onSuccess} onError={onError} />
        </Elements>
      </div>
    </div>
  );
}
