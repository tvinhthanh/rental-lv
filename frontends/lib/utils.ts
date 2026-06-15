import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TRANSLATIONS: Record<string, Record<string, string>> = {
  booking: {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    ONGOING: "Đang thuê",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  },
  vehicle: {
    AVAILABLE: "Sẵn sàng",
    RENTED: "Đang thuê",
    MAINTENANCE: "Bảo dưỡng",
    ONGOING: "Đang thuê",
    INACTIVE: "Ngừng hoạt động",
    OUT_OF_SERVICE: "Ngừng hoạt động",
  },
  invoice: {
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    CANCELLED: "Đã hủy",
  },
  payment: {
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    PENDING: "Chờ xử lý",
    CASH: "Tiền mặt",
    STRIPE: "Stripe",
    BANK_TRANSFER: "Chuyển khoản ngân hàng",
    CREDIT_CARD: "Thẻ tín dụng",
    DEBIT_CARD: "Thẻ ghi nợ",
    E_WALLET: "Ví điện tử",
    OTHER: "Khác",
  },
  deposit: {
    HELD: "Đang giữ cọc",
    RELEASED: "Đã hoàn cọc",
    FORFEITED: "Khấu trừ cọc",
  },
  contract: {
    DRAFT: "Bản nháp",
    SIGNED: "Đã ký",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  },
  role: {
    ADMIN: "Quản trị viên",
    EMPLOYEE: "Nhân viên",
    CUSTOMER: "Khách hàng",
  },
  audit: {
    CREATE: "Tạo mới",
    UPDATE: "Cập nhật",
    DELETE: "Xóa",
    LOGIN: "Đăng nhập",
    LOGOUT: "Đăng xuất",
    STATUS: "Đổi trạng thái",
    SIGN: "Ký hợp đồng",
  },
  condition: {
    GOOD: "Tốt",
    FAIR: "Tạm ổn",
    POOR: "Kém",
  }
};

export function translateStatus(status: string | undefined | null, type: keyof typeof TRANSLATIONS): string {
  if (!status) return "—";
  const upperStatus = status.toUpperCase();
  return TRANSLATIONS[type]?.[upperStatus] || status;
}