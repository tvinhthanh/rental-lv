"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { getSocket } from '@/lib/socket';
import { chatService } from '@/services/chat.service';
import { MessageCircle, X, Send, Headphones, ChevronUp } from 'lucide-react';

export default function CustomerChatWidget() {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const socketRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Kiểm tra cuộn trang để hiện nút Push to Top
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to bottom helper for chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll to top helper for page
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Load lịch sử chat khi mở widget
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            chatService.getMyHistory()
                .then((res: any) => {
                    if (Array.isArray(res)) {
                        setMessages(res);
                    } else if (res?.items && Array.isArray(res.items)) {
                        setMessages(res.items);
                    }
                })
                .catch((err) => console.error("Lỗi lấy lịch sử chat:", err))
                .finally(() => {
                    setLoading(false);
                    setTimeout(scrollToBottom, 50);
                });
        }
    }, [isOpen]);

    // Thiết lập kết nối socket
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const socket = getSocket();
        if (!socket) return;
        socketRef.current = socket;

        // Lắng nghe sự kiện nhận tin nhắn mới
        socket.on('receive_message', (message: any) => {
            if (
                message.senderId === user.id ||
                message.receiverId === user.id ||
                (!message.receiverId && message.senderRole !== 'CUSTOMER')
            ) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                setTimeout(scrollToBottom, 50);
            }
        });

        return () => {
            if (socket) {
                socket.off('receive_message');
            }
        };
    }, [isAuthenticated, user]);

    // Cuộn xuống khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const socket = socketRef.current;
        if (socket && socket.connected) {
            socket.emit('send_message', {
                content: inputText.trim(),
                receiverId: null
            });
            setInputText('');
        } else {
            console.error("Socket chưa kết nối!");
        }
    };

    // Chỉ hiển thị cho khách hàng (CUSTOMER)
    if (!isAuthenticated || !user || user.role !== 'CUSTOMER') {
        return null;
    }

    return (
        <>
            {/* Floating Dock (Chat & Push to Top) */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
                
                {/* Chat Panel */}
                {isOpen && (
                    <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[520px] max-h-[calc(100vh-120px)] bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col mb-2 overflow-hidden transition-all duration-300">
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-cyan-600/50 to-blue-600/50 border-b border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <Headphones className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-white">Chăm sóc khách hàng</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[11px] text-slate-300">Hỗ trợ trực tuyến</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col bg-slate-950/40">
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                                    <p className="text-sm font-medium text-slate-300">Xin chào {user.name || 'bạn'} 👋</p>
                                    <p className="text-xs text-slate-400">Bạn cần hỗ trợ gì? Hãy gửi tin nhắn cho chúng tôi nhé!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div 
                                            key={msg.id || index}
                                            className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                                        >
                                            <div className={`px-3 py-2 rounded-xl text-sm ${
                                                isMe 
                                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-tr-none' 
                                                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/30'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-slate-500 mt-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer Input */}
                        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-700/50 flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-700/50 rounded-xl text-slate-100 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-xl hover:opacity-95 transition-opacity disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}

                {/* Chat Bubble Button */}
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer relative group"
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
                    </button>
                )}

                {/* Push to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="p-3.5 bg-slate-900/90 backdrop-blur-sm border border-slate-800/80 text-slate-300 hover:text-white rounded-full shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        title="Cuộn lên đầu trang"
                    >
                        <ChevronUp className="w-5 h-5" />
                    </button>
                )}

            </div>
        </>
    );
}
