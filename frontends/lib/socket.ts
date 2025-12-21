import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
    // Check if already connected
    if (socket?.connected) {
        return socket;
    }

    // Only run on client side
    if (typeof window === 'undefined') {
        return null;
    }

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001';
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return null;
    }

    // Disconnect existing socket if any
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    socket = io(`${apiEndpoint}/notifications`, {
        auth: {
            token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

