export const ROLE_MENU_HEADER = {
    USER: [
        { label: "Trang chủ", href: "/user" },
        { label: "Cars", href: "/user/cars" },
        { label: "Đặt xe", href: "/user/bookings" },
        { label: "Blog", href: "/user/blog" },
        { label: "Membership", href: "/user/membership" },
        { label: "Hóa đơn", href: "/user/invoices" },
        { label: "Thông tin", href: "/user/profile" },
    ],

    EMPLOYEE: [
        { label: "Tổng quan", href: "/employee/dashboard" },
        { label: "Hợp đồng", href: "/employee/contracts" },
        { label: "Đặt xe", href: "/employee/bookings" },
        { label: "Khách hàng", href: "/employee/customers" },
        { label: "Thông tin", href: "/employee/informations" },
    ],

    ADMIN: [
        { label: "Tổng quan", href: "/admin/dashboard" },
        { label: "Xe", href: "/admin/vehicles" },
        { label: "Danh mục xe", href: "/admin/vehicle-categories" },
        { label: "Nhân viên", href: "/admin/employees" },
        { label: "Nhật ký hệ thống", href: "/admin/audit-logs" },
    ],
} as const;
