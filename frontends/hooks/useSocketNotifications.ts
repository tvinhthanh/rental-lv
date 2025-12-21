'use client';

import { useEffect } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { toast } from 'sonner';

export function useSocketNotifications() {
    useEffect(() => {
        const socket = getSocket();

        if (!socket) {
            return;
        }

        // Listen for notification events
        socket.on('notification', (data: any) => {
            toast.info(data.title, {
                description: data.message,
                duration: 5000,
            });
        });

        // Listen for booking events
        socket.on('booking:created', (data: any) => {
            toast.success('Đặt xe thành công', {
                description: `Mã booking: ${data.bookingCode}`,
                duration: 5000,
            });
        });

        socket.on('booking:updated', (data: any) => {
            toast.info('Booking đã được cập nhật', {
                description: `Mã booking: ${data.bookingCode}`,
                duration: 5000,
            });
        });

        socket.on('payment:received', (data: any) => {
            toast.success('Thanh toán thành công', {
                description: `Số tiền: ${data.amount?.toLocaleString('vi-VN')} VNĐ`,
                duration: 5000,
            });
        });

        socket.on('invoice:created', (data: any) => {
            toast.info('Hóa đơn đã được tạo', {
                description: `Mã hóa đơn: ${data.invoiceNo}`,
                duration: 5000,
            });
        });

        return () => {
            socket.off('notification');
            socket.off('booking:created');
            socket.off('booking:updated');
            socket.off('payment:received');
            socket.off('invoice:created');
        };
    }, []);
}

