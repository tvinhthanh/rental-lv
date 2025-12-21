// Socket helper with conditional loading to avoid SSR issues
let socket: any = null;
let ioClient: any = null;

// Lazy load socket.io-client on the client only
function getIOClient() {
    if (typeof window === 'undefined') {
        return null;
    }

    if (ioClient) {
        return ioClient;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ioModule = require('socket.io-client');

        if (typeof ioModule === 'function') {
            ioClient = ioModule;
        } else if (ioModule.default && typeof ioModule.default === 'function') {
            ioClient = ioModule.default;
        } else if (ioModule.io && typeof ioModule.io === 'function') {
            ioClient = ioModule.io;
        } else {
            ioClient = ioModule;
        }

        if (typeof ioClient !== 'function') {
            console.error('socket.io-client is not a function');
            return null;
        }

        return ioClient;
    } catch (error) {
        console.error('Failed to load socket.io-client:', error);
        return null;
    }
}

export function getSocket(): any {
    if (typeof window === 'undefined') {
        return null;
    }

    const socketEnabled = process.env.NEXT_PUBLIC_SOCKET_ENABLED !== 'false';
    if (!socketEnabled) {
        return null;
    }

    if (socket?.connected) {
        return socket;
    }

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001';
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return null;
    }

    const io = getIOClient();
    if (!io) {
        return null;
    }

    if (socket) {
        try {
            socket.removeAllListeners();
            socket.disconnect();
        } catch {
            // ignore disconnect errors
        }
        socket = null;
    }

    try {
        const baseUrl = apiEndpoint.replace(/\/$/, '');
        const namespace = '/notifications';
        const socketUrl = `${baseUrl}${namespace}`;

        socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: false,
            autoConnect: true,
            forceNew: true
        });

        const originalEmit = socket.emit;
        socket.emit = function (...args: any[]) {
            try {
                return originalEmit.apply(this, args);
            } catch (e: any) {
                if (e?.message?.includes('Invalid namespace')) {
                    return socket;
                }
                throw e;
            }
        };

        socket.on('connect_error', (error: any) => {
            if (error?.message?.includes('Invalid namespace')) {
                return;
            }
        });

        return socket;
    } catch (error: any) {
        if (error?.message?.includes('Invalid namespace')) {
            return null;
        }
        return null;
    }
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
