// Conditional import để tránh SSR issues với Turbopack
let socket: any = null;
let ioClient: any = null;

// Lazy load socket.io-client
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
        
        // Handle different export formats
        if (typeof ioModule === 'function') {
            ioClient = ioModule;
        } else if (ioModule.default && typeof ioModule.default === 'function') {
            ioClient = ioModule.default;
        } else if (ioModule.io && typeof ioModule.io === 'function') {
            ioClient = ioModule.io;
        } else {
            // Try accessing the default export
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
    // Only run on client side
    if (typeof window === 'undefined') {
        return null;
    }

    // Check if socket notifications are disabled
    const socketEnabled = process.env.NEXT_PUBLIC_SOCKET_ENABLED !== 'false';
    if (!socketEnabled) {
        return null;
    }

    // Check if already connected
    if (socket?.connected) {
        return socket;
    }

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001';
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return null;
    }

    // Get io client
    const io = getIOClient();
    if (!io) {
        return null;
    }

    // Disconnect existing socket if any
    if (socket) {
        try {
            socket.removeAllListeners();
            socket.disconnect();
        } catch (e) {
            // Ignore disconnect errors
        }
        socket = null;
    }

    try {
        // Extract the root origin (e.g., http://localhost:3001) from apiEndpoint (e.g., http://localhost:3001/api)
        let baseUrl = apiEndpoint;
        try {
            const urlObj = new URL(apiEndpoint);
            baseUrl = urlObj.origin;
        } catch (e) {
            baseUrl = apiEndpoint.replace(/\/api\/?$/, '').replace(/\/$/, '');
        }

        // Connect to /notifications namespace
        const namespace = '/notifications';
        const socketUrl = `${baseUrl}${namespace}`;
        
        socket = io(socketUrl, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true, // Enable auto-reconnect now that URL is correct
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            autoConnect: true,
            forceNew: true,
        });

        // Suppress namespace errors
        const originalEmit = socket.emit;
        socket.emit = function(...args: any[]) {
            try {
                return originalEmit.apply(this, args);
            } catch (e: any) {
                if (e?.message?.includes('Invalid namespace')) {
                    return socket;
                }
                throw e;
            }
        };

        socket.on('connect', () => {
            // Socket connected successfully
        });

        socket.on('disconnect', () => {
            // Socket disconnected
        });

        socket.on('connect_error', (error: any) => {
            // Suppress "Invalid namespace" errors
            if (error?.message?.includes('Invalid namespace')) {
                // Silently ignore namespace errors
                return;
            }
        });

        return socket;
    } catch (error: any) {
        // Silently fail - socket is optional
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

