// Conditional import để tránh SSR issues với Turbopack
let socket: any = null;

export function getSocket(): any {
    // Only run on client side
    if (typeof window === 'undefined') {
        return null;
    }

    // Check if already connected
    if (socket?.connected) {
        return socket;
    }

    // Dynamic require để tránh top-level import issues
    let io: any;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        io = require('socket.io-client');
    } catch (error) {
        console.error('Failed to load socket.io-client:', error);
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

    try {
        socket = io.io(`${apiEndpoint}/notifications`, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            autoConnect: true,
        });

        socket.on('connect', () => {
            // Socket connected
        });

        socket.on('disconnect', () => {
            // Socket disconnected
        });

        socket.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error);
        });

        return socket;
    } catch (error) {
        console.error('Failed to create socket:', error);
        return null;
    }
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

