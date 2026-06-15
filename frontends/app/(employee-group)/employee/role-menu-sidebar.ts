export const ROLE_MENU_SIDEBAR = {
    ADMIN: [
        { label: "Chi nhánh", href: "/admin/branches" },
        { label: "Danh mục giá", href: "/admin/price-lists" },

        { label: "Đơn đặt xe", href: "/admin/bookings" },
        { label: "Hợp đồng", href: "/admin/contracts" },
        { label: "Tiền cọc", href: "/admin/deposits" },
        { label: "Giao xe", href: "/admin/handover" },
        { label: "Nhận xe", href: "/admin/returns" },

        { label: "Hóa đơn", href: "/admin/invoices" },
        { label: "Thanh toán", href: "/admin/payments" },
        { label: "Phụ phí", href: "/admin/surcharges" },

        { label: "Khách hàng", href: "/admin/customers" },

        { label: "Khuyến mãi", href: "/admin/promotions" },
        { label: "Đánh giá", href: "/admin/reviews" },
        { label: "Bảo dưỡng", href: "/admin/maintenance" },
    ],

    EMPLOYEE: [
        { label: "Giao xe", href: "/employee/handover" },
        { label: "Nhận xe", href: "/employee/returns" },
        { label: "Tiền cọc", href: "/employee/deposits" },
        { label: "Bảo dưỡng", href: "/employee/maintenance" },
        { label: "Bảng điều khiển", href: "/employee/dashboard" },
        { label: "Đơn đặt xe", href: "/employee/bookings" },
        { label: "Thanh toán", href: "/employee/checkout" },
        { label: "Khách hàng", href: "/employee/customers" },
    ],
};
