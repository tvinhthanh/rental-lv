export interface MenuItem {
    label: string;
    href?: string;
    children?: MenuItem[];
}

export const ROLE_MENU_SIDEBAR: Record<string, (MenuItem | string)[]> = {
    ADMIN: [
        { label: "Chi nhánh", href: "/admin/branches" },
        { label: "Danh mục giá", href: "/admin/price-lists" },

        {
            label: "Xe",
            children: [
                { label: "Danh sách xe", href: "/admin/vehicles" },
                { label: "Danh mục xe", href: "/admin/vehicle-categories" },
                { label: "Thương hiệu", href: "/admin/brands" },
                { label: "Quy tắc định giá", href: "/admin/pricing-rules" },
                { label: "Bảo dưỡng", href: "/admin/maintenance" },
            ]
        },

        {
            label: "Đơn đặt xe",
            children: [
                { label: "Đơn đặt xe", href: "/admin/bookings" },
                { label: "Hợp đồng", href: "/admin/contracts" },
                { label: "Giao xe", href: "/admin/handover" },
                { label: "Nhận xe", href: "/admin/returns" },
            ]
        },
        
        {
            label: "Tài chính",
            children: [
                { label: "Hóa đơn", href: "/admin/invoices" },
                { label: "Thanh toán", href: "/admin/payments" },
                { label: "Tiền cọc", href: "/admin/deposits" },
                { label: "Phụ phí", href: "/admin/surcharges" },
            ]
        },
        
        {
            label: "Người dùng",
            children: [
                { label: "Người dùng", href: "/admin/users" },
                { label: "Nhân viên", href: "/admin/employees" },
                { label: "Khách hàng", href: "/admin/customers" },
                { label: "Đối tác", href: "/admin/partners" },
            ]
        },
        
        {
            label: "Marketing",
            children: [
                { label: "Mẫu thông báo", href: "/admin/notification-templates" },
                { label: "Phân khúc khách hàng", href: "/admin/customer-segments" },
                { label: "Chiến dịch marketing", href: "/admin/marketing-campaigns" },
                { label: "Khuyến mãi", href: "/admin/promotions" },
            ]
        },
        
        {
            label: "Khách hàng thân thiết",
            children: [
                { label: "Chương trình tích điểm", href: "/admin/loyalty-programs" },
                { label: "Giao dịch tích điểm", href: "/admin/loyalty-transactions" },
            ]
        },
        
        {
            label: "Khác",
            children: [
                { label: "Blog", href: "/admin/blog" },
                { label: "Đánh giá", href: "/admin/reviews" },
                { label: "Chat Hỗ Trợ", href: "/admin/chat" },
            ]
        },
        
        "---",
        
        {
            label: "Hệ thống",
            children: [
                { label: "Cài đặt", href: "/admin/settings" },
                { label: "Nhật ký hệ thống", href: "/admin/audit-logs" },
            ]
        },
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
