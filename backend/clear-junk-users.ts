import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Các email cần GIỮ LẠI (không được xóa)
const KEEP_EMAILS = [
    'admin@rental.com',
    'employee1@rental.com',
    'playouu@mmologin.com',
    'cth123@gmail.com'
];

function shouldKeep(email: string): boolean {
    const normEmail = email.toLowerCase().trim();
    if (KEEP_EMAILS.includes(normEmail)) return true;
    if (normEmail.includes('xuantri')) return true;
    return false;
}

async function main() {
    console.log('====================================================');
    console.log('🔄 BẮT ĐẦU DỌN DẸP DỮ LIỆU MẪU / TÀI KHOẢN RÁC...');
    console.log('====================================================');

    // 1. Tìm tất cả tài khoản
    const allUsers = await prisma.user.findMany({
        include: {
            customer: true,
            employee: true
        }
    });

    const usersToDelete = allUsers.filter(u => !shouldKeep(u.email));

    console.log(`Tìm thấy ${usersToDelete.length} tài khoản rác cần dọn dẹp.\n`);

    for (const u of usersToDelete) {
        console.log(`❌ Đang dọn dẹp tài khoản: ${u.email} (${u.role})`);

        // A. Xử lý nếu là Employee
        if (u.employee) {
            const empId = u.employee.id;
            
            // Xóa BlogPost do nhân viên này viết
            await prisma.blogPost.deleteMany({ where: { authorId: empId } });
            
            // Unlink Handover liên kết với nhân viên này
            await prisma.handover.updateMany({
                where: { employeeId: empId },
                data: { employeeId: null }
            });

            // Xóa Employee
            await prisma.employee.delete({ where: { id: empId } });
            console.log(`   - Đã xóa Employee profile.`);
        }

        // B. Xử lý nếu là Customer
        if (u.customer) {
            const custId = u.customer.id;

            // Lấy danh sách Bookings của khách hàng này để dọn sạch
            const bookings = await prisma.booking.findMany({
                where: { customerId: custId }
            });

            for (const b of bookings) {
                // Xóa Contract liên kết
                await prisma.contract.deleteMany({ where: { bookingId: b.id } });
                
                // Xóa Handover liên kết
                await prisma.handover.deleteMany({ where: { bookingId: b.id } });

                // Xóa ReturnReport liên kết
                await prisma.returnReport.deleteMany({ where: { bookingId: b.id } });

                // Xóa Payments liên kết qua Invoices
                const invoice = await prisma.invoice.findUnique({
                    where: { bookingId: b.id }
                });
                if (invoice) {
                    await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
                    await prisma.surcharge.deleteMany({ where: { invoiceId: invoice.id } });
                    await prisma.invoice.delete({ where: { id: invoice.id } });
                }

                // Xóa Deposit và DepositDetail
                const deposit = await prisma.deposit.findUnique({
                    where: { bookingId: b.id }
                });
                if (deposit) {
                    await prisma.depositDetail.deleteMany({ where: { depositId: deposit.id } });
                    await prisma.deposit.delete({ where: { id: deposit.id } });
                }

                // Xóa Review liên kết
                await prisma.review.deleteMany({ where: { bookingId: b.id } });

                // Xóa LoyaltyTransactions liên kết
                await prisma.loyaltyTransaction.deleteMany({ where: { bookingId: b.id } });

                // Cuối cùng xóa Booking
                await prisma.booking.delete({ where: { id: b.id } });
            }

            // Xóa Loyalty Transactions còn lại của Customer
            await prisma.loyaltyTransaction.deleteMany({ where: { customerId: custId } });

            // Xóa Review còn lại của Customer
            await prisma.review.deleteMany({ where: { customerId: custId } });

            // Xóa Invoices còn lại của Customer
            await prisma.invoice.deleteMany({ where: { customerId: custId } });

            // Xóa Deposits còn lại của Customer
            await prisma.deposit.deleteMany({ where: { customerId: custId } });

            // Xóa Customer
            await prisma.customer.delete({ where: { id: custId } });
            console.log(`   - Đã xóa Customer profile và dọn sạch các Booking/Invoice liên quan.`);
        }

        // C. Xóa các Token và Notification liên quan tới User
        await prisma.passwordResetToken.deleteMany({ where: { userId: u.id } });
        await prisma.notification.deleteMany({ where: { userId: u.id } });

        // D. Xóa User
        await prisma.user.delete({ where: { id: u.id } });
        console.log(`   - Đã xóa tài khoản User thành công.`);
    }

    console.log('====================================================');
    console.log('✅ ĐÃ DỌN DẸP SẠCH SẼ TOÀN BỘ DỮ LIỆU RÁC!');
    console.log('====================================================');
}

main()
    .catch((e) => {
        console.error('❌ Lỗi dọn dẹp:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
