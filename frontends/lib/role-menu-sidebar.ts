export const ROLE_MENU_SIDEBAR = {
    ADMIN: [
        { label: "Chi nhánh", href: "/admin/branches" },
        { label: "Danh mục giá", href: "/admin/price-lists" },

        { label: "Đơn đặt xe", href: "/admin/bookings" },
        { label: "Contracts", href: "/admin/contracts" },
        { label: "Deposits", href: "/admin/deposits" },
        { label: "Handover", href: "/admin/handover" },
        { label: "Returns", href: "/admin/returns" },

        { label: "Invoices", href: "/admin/invoices" },
        { label: "Payments", href: "/admin/payments" },
        { label: "Surcharges", href: "/admin/surcharges" },

        { label: "Người dùng", href: "/admin/users" },
        { label: "Khách hàng", href: "/admin/customers" },

        { label: "Promotions", href: "/admin/promotions" },
        { label: "Reviews", href: "/admin/reviews" },
        { label: "Bảo dưỡng", href: "/admin/maintenance" },
        { label: "Thương hiệu", href: "/admin/brands" },
    ],

    EMPLOYEE: [
        { label: "Xe", href: "/employee/vehicles" },
        { label: "Bảo dưỡng", href: "/employee/maintenance" },
        { label: "Giao xe", href: "/employee/handover" },
        { label: "Tiền cọc", href: "/employee/deposits" },
        { label: "Nhận xe", href: "/employee/returns" },
        { label: "Hóa đơn", href: "/employee/invoices" },
        { label: "Phụ phí", href: "/employee/surcharges" },
        { label: "Thanh toán", href: "/employee/payments" },
    ],
};
