'use client';

import { useEffect } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth/use-auth';

export function SocketNotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            return;
        }

        if (!user) {
            disconnectSocket();
            return;
        }

        let socket: any = null;
        let mounted = true;

        // Define event handlers
        const handleNotification = (data: any) => {
            toast.info(data.title, {
                description: data.message,
                duration: 5000,
            });
        };

        const handleBookingCreated = (data: any) => {
            const isEmployee = data.message?.includes('Có đơn đặt xe mới');
            
            if (isEmployee) {
                toast.info('Đơn đặt xe mới', {
                    description: data.message || `Mã booking: ${data.bookingCode}`,
                    duration: 5000,
                });
            } else {
                toast.success('Đặt xe thành công', {
                    description: `Mã booking: ${data.bookingCode}`,
                    duration: 5000,
                });
            }
        };

        const handleBookingUpdated = (data: any) => {
            toast.info('Booking đã được cập nhật', {
                description: `Mã booking: ${data.bookingCode}`,
                duration: 5000,
            });
        };

        const handleBookingCancelled = (data: any) => {
            toast.warning('Booking đã bị hủy', {
                description: `Mã booking: ${data.bookingCode}`,
                duration: 5000,
            });
        };

        const handlePaymentReceived = (data: any) => {
            toast.success('Thanh toán thành công', {
                description: `Số tiền: ${data.amount?.toLocaleString('vi-VN')} VNĐ`,
                duration: 5000,
            });
        };

        const handleInvoiceCreated = (data: any) => {
            toast.info('Hóa đơn đã được tạo', {
                description: `Mã hóa đơn: ${data.invoiceNo}`,
                duration: 5000,
            });
        };

        const handleConnected = (data: any) => {
            console.log('Socket connected:', data);
        };

        // Initialize socket synchronously (now safe with conditional require)
        socket = getSocket();

        if (socket) {
            // Register event listeners
            socket.on('notification', handleNotification);
            socket.on('booking:created', handleBookingCreated);
            socket.on('booking:updated', handleBookingUpdated);
            socket.on('booking:cancelled', handleBookingCancelled);
            socket.on('payment:received', handlePaymentReceived);
            socket.on('invoice:created', handleInvoiceCreated);
            socket.on('connected', handleConnected);
        }

        return () => {
            mounted = false;
            // Cleanup: remove all event listeners
            if (socket) {
                socket.off('notification', handleNotification);
                socket.off('booking:created', handleBookingCreated);
                socket.off('booking:updated', handleBookingUpdated);
                socket.off('booking:cancelled', handleBookingCancelled);
                socket.off('payment:received', handlePaymentReceived);
                socket.off('invoice:created', handleInvoiceCreated);
                socket.off('connected', handleConnected);
            }
        };
    }, [user]);

    return <>{children}</>;
}

