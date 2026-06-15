'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useAuth } from '@/hooks/auth/use-auth';
import { toast } from 'sonner';

interface SocketContextProps {
    socket: any;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
    socket: null,
    isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            disconnectSocket();
            setSocket(null);
            setIsConnected(false);
            return;
        }

        const sk = getSocket();
        setSocket(sk);

        if (sk) {
            setIsConnected(sk.connected);

            const onConnect = () => setIsConnected(true);
            const onDisconnect = () => setIsConnected(false);

            sk.on('connect', onConnect);
            sk.on('disconnect', onDisconnect);

            // Đăng ký các sự kiện thông báo hệ thống chung
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

            sk.on('notification', handleNotification);
            sk.on('booking:created', handleBookingCreated);
            sk.on('booking:updated', handleBookingUpdated);
            sk.on('booking:cancelled', handleBookingCancelled);
            sk.on('payment:received', handlePaymentReceived);
            sk.on('invoice:created', handleInvoiceCreated);

            return () => {
                sk.off('connect', onConnect);
                sk.off('disconnect', onDisconnect);
                sk.off('notification', handleNotification);
                sk.off('booking:created', handleBookingCreated);
                sk.off('booking:updated', handleBookingUpdated);
                sk.off('booking:cancelled', handleBookingCancelled);
                sk.off('payment:received', handlePaymentReceived);
                sk.off('invoice:created', handleInvoiceCreated);
            };
        }
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
export default SocketProvider;
