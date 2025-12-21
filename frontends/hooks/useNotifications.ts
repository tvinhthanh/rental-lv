'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { useAuth } from '@/hooks/auth/use-auth';

export function useNotifications(params?: { status?: string; page?: number; limit?: number }) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['notifications', params, user?.id],
        queryFn: () => notificationService.list({ ...params, userId: user?.id }),
        enabled: !!user,
        staleTime: 30000, // 30 seconds
    });
}

export function useUnreadNotificationsCount() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['notifications', 'unread-count', user?.id],
        queryFn: () => notificationService.getUnreadCount(),
        enabled: !!user,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

