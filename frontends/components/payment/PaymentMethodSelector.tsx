"use client";

import { useState } from "react";
import StripePaymentButton from "./StripePaymentButton";
import CashPaymentButton from "./CashPaymentButton";
import { CreditCard, Banknote } from "lucide-react";

interface PaymentMethodSelectorProps {
  invoiceId: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type PaymentMethod = "stripe" | "cash" | null;

export default function PaymentMethodSelector({
  invoiceId,
  amount,
  currency = "vnd",
  onSuccess,
  onError,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

  if (!selectedMethod) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Chọn phương thức thanh toán</h3>
          <p className="text-slate-400 text-sm mb-6">Tổng tiền: <span className="text-white font-semibold">{amount.toLocaleString("vi-VN")} đ</span></p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stripe Payment */}
            <button
              onClick={() => setSelectedMethod("stripe")}
              className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 hover:border-blue-400/50 rounded-xl transition-all hover:scale-105 group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-white mb-1">Thanh toán online</h4>
                  <p className="text-xs text-slate-400">Stripe (Thẻ tín dụng/ghi nợ)</p>
                </div>
              </div>
            </button>

            {/* Cash Payment */}
            <button
              onClick={() => setSelectedMethod("cash")}
              className="p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/30 hover:border-green-400/50 rounded-xl transition-all hover:scale-105 group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-white mb-1">Tiền mặt</h4>
                  <p className="text-xs text-slate-400">Thanh toán trực tiếp tại cửa hàng</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={() => setSelectedMethod(null)}
        className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <span>←</span>
        <span>Quay lại chọn phương thức</span>
      </button>

      {/* Payment form based on selected method */}
      {selectedMethod === "stripe" && (
        <StripePaymentButton
          invoiceId={invoiceId}
          amount={amount}
          currency={currency}
          onSuccess={() => {
            onSuccess?.();
            setSelectedMethod(null);
          }}
          onError={onError}
        />
      )}

      {selectedMethod === "cash" && (
        <CashPaymentButton
          invoiceId={invoiceId}
          amount={amount}
          onSuccess={() => {
            onSuccess?.();
            setSelectedMethod(null);
          }}
          onError={onError}
        />
      )}
    </div>
  );
}
