import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('====================================================');
    console.log('📊 DANH SÁCH TẤT CẢ TÀI KHOẢN TRONG HỆ THỐNG');
    console.log('====================================================');

    const users = await prisma.user.findMany({
        orderBy: {
            role: 'asc'
        }
    });

    console.log(`Tổng số tài khoản: ${users.length}\n`);

    console.log(`${'Vai trò'.padEnd(12)} | ${'Họ tên'.padEnd(25)} | ${'Email'.padEnd(30)}`);
    console.log('-'.repeat(70));
    
    for (const u of users) {
        const roleStr = u.role.padEnd(12);
        const nameStr = (u.name || 'N/A').padEnd(25);
        const emailStr = u.email;
        console.log(`${roleStr} | ${nameStr} | ${emailStr}`);
    }

    console.log('====================================================');
}

main()
    .catch((e) => {
        console.error('❌ Lỗi:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
