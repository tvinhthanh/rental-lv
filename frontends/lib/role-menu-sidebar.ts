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
        { label: "Khách hàng", href: "/admin/customers" },
            ]
        },
        
        {
            label: "Marketing",
            children: [
                { label: "Notification Templates", href: "/admin/notification-templates" },
                { label: "Customer Segments", href: "/admin/customer-segments" },
                { label: "Marketing Campaigns", href: "/admin/marketing-campaigns" },
            ]
        },
        
        {
            label: "Loyalty",
            children: [
                { label: "Loyalty Programs", href: "/admin/loyalty-programs" },
                { label: "Loyalty Transactions", href: "/admin/loyalty-transactions" },
            ]
        },
        
        {
            label: "Khác",
            children: [
                { label: "Blog", href: "/admin/blog" },
                { label: "Khuyến mãi", href: "/admin/promotions" },
                { label: "Đánh giá", href: "/admin/reviews" },
        { label: "Bảo dưỡng", href: "/admin/maintenance" },
        { label: "Thương hiệu", href: "/admin/brands" },
                { label: "Pricing Rules", href: "/admin/pricing-rules" },
                { label: "Partners", href: "/admin/partners" },
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
