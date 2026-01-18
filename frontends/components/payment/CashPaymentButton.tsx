"use client";

import { useState } from "react";
import { billingService } from "@/services/billing.service";
import { toast } from "sonner";
import { Banknote, Loader2, CheckCircle2 } from "lucide-react";

interface CashPaymentButtonProps {
  invoiceId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CashPaymentButton({
  invoiceId,
  amount,
  onSuccess,
  onError,
}: CashPaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [note, setNote] = useState("");

  const handleCashPayment = async () => {
    if (!confirm(`Xác nhận thanh toán tiền mặt: ${amount.toLocaleString("vi-VN")} đ?`)) {
      return;
    }

    setIsProcessing(true);

    try {
      await billingService.payCash({
        invoiceId,
        amount,
        referenceNo: `CASH-${Date.now()}`,
        note: note || "Thanh toán tiền mặt",
      });

      toast.success("Đã ghi nhận thanh toán tiền mặt thành công!");
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Có lỗi xảy ra khi ghi nhận thanh toán";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Thanh toán tiền mặt</h3>
            <p className="text-slate-400 text-sm">Tổng tiền: {amount.toLocaleString("vi-VN")} đ</p>
          </div>
          <Banknote className="w-8 h-8 text-green-400" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú nếu có..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-green-400 mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Thanh toán sẽ được ghi nhận ngay sau khi xác nhận</li>
                  <li>Vui lòng nhận tiền mặt từ khách hàng trước khi xác nhận</li>
                  <li>Hóa đơn sẽ được cập nhật tự động</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleCashPayment}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Banknote className="w-5 h-5" />
                <span>Xác nhận nhận tiền mặt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
