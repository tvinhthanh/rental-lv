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
        { label: "Handover", href: "/employee/handover" },
        { label: "Returns", href: "/employee/returns" },
        { label: "Deposits", href: "/employee/deposits" },
        { label: "Payments", href: "/employee/payments" },
        { label: "Checkout", href: "/employee/checkout" },
        { label: "Surcharges", href: "/employee/surcharges" },
        { label: "Vehicles", href: "/employee/vehicles" },
        { label: "Invoices", href: "/employee/invoices" },
        { label: "Maintenance", href: "/employee/maintenance" },
    ],
};
