"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { getSocket } from '@/lib/socket';
import { chatService } from '@/services/chat.service';
import { Send, User, MessageSquare, Search, ArrowLeft } from 'lucide-react';

export default function AdminChatPage() {
    const { user, isAuthenticated } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const socketRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Guard will be checked before rendering

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load conversations list
    const loadConversations = async (selectFirst = false) => {
        try {
            setConversationsLoading(prev => prev ? prev : true);
            const res = await chatService.getConversations();
            if (Array.isArray(res)) {
                setConversations(res);
                // Only select first automatically on desktop widths
                if (selectFirst && res.length > 0 && !selectedCustomer && window.innerWidth >= 768) {
                    setSelectedCustomer(res[0]);
                }
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách hội thoại:", err);
        } finally {
            setConversationsLoading(false);
        }
    };

    // Load conversations when authenticated
    useEffect(() => {
        if (!isAuthenticated || !user || (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) return;
        Promise.resolve().then(() => loadConversations(true));
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (!isAuthenticated || !user || (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) return;
        if (selectedCustomer) {
            Promise.resolve().then(() => setMessagesLoading(true));
            chatService.getHistoryForAdmin(selectedCustomer.customerId)
                .then((res: any) => {
                    if (Array.isArray(res)) {
                        setMessages(res);
                    }
                    // Đánh dấu đã đọc
                    chatService.markAsRead(selectedCustomer.customerId)
                        .then(() => {
                            // Cập nhật lại trạng thái read trong list conversations cục bộ
                            setConversations(prev => 
                                prev.map(c => 
                                    c.customerId === selectedCustomer.customerId 
                                        ? { ...c, isRead: true } 
                                        : c
                                )
                            );
                        });
                })
                .catch((err) => console.error("Lỗi lấy lịch sử chat khách hàng:", err))
                .finally(() => {
                    setMessagesLoading(false);
                    setTimeout(scrollToBottom, 50);
                });
        }
    }, [isAuthenticated, user, selectedCustomer]);

    // Socket listeners setup
    useEffect(() => {
        if (!isAuthenticated) return;

        const socket = getSocket();
        if (!socket) return;
        socketRef.current = socket;

        // Lắng nghe tin nhắn mới từ mọi nguồn
        socket.on('receive_message', (message: any) => {
            // Trường hợp 1: Tin nhắn này thuộc về cuộc trò chuyện của khách hàng đang được chọn
            if (selectedCustomer && (
                message.senderId === selectedCustomer.customerId ||
                message.receiverId === selectedCustomer.customerId
            )) {
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                setTimeout(scrollToBottom, 50);
                
                // Đánh dấu đã đọc ngay lập tức nếu đang mở
                if (message.senderRole === 'CUSTOMER') {
                    chatService.markAsRead(selectedCustomer.customerId);
                }
            }

            // Trường hợp 2: Luôn cập nhật hoặc nạp lại danh sách cuộc trò chuyện để hiển thị tin nhắn mới nhất
            loadConversations();
        });

        return () => {
            if (socket) {
                socket.off('receive_message');
            }
        };
    }, [isAuthenticated, selectedCustomer]);

    // Cuộn xuống khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedCustomer) return;

        const socket = socketRef.current;
        if (socket && socket.connected) {
            socket.emit('send_message', {
                content: inputText.trim(),
                receiverId: selectedCustomer.customerId
            });
            setInputText('');
        }
    };

    // Lọc danh sách hội thoại theo ô tìm kiếm
    const filteredConversations = conversations.filter(c => 
        c.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Guard: ensure only ADMIN/EMPLOYEE can access
    if (!isAuthenticated || !user || (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) {
        return null;
    }

    return (
        <div className="flex h-[calc(100vh-140px)] min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40 backdrop-blur-md">
            {/* Left Column: Conversations List */}
            <div className={`w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-900/30 ${selectedCustomer ? 'hidden md:flex' : 'flex'}`}>
                {/* Search */}
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white mb-3 font-semibold">Hỗ trợ khách hàng</h2>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm khách hàng..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-950/85 border border-slate-800 rounded-xl text-sm focus:border-cyan-500 focus:outline-none text-slate-100 transition-colors"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    </div>
                </div>

                {/* List body */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
                    {conversationsLoading && conversations.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                            Đang tải hội thoại...
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 font-medium">
                            Không tìm thấy hội thoại nào
                        </div>
                    ) : (
                        filteredConversations.map((c) => {
                            const isSelected = selectedCustomer?.customerId === c.customerId;
                            const hasUnread = !c.isRead;
                            
                            return (
                                <button
                                    key={c.customerId}
                                    type="button"
                                    onClick={() => setSelectedCustomer(c)}
                                    className={`w-full p-4 flex items-start gap-3 text-left transition-all ${
                                        isSelected 
                                            ? 'bg-slate-800/40 border-l-4 border-cyan-500' 
                                            : 'hover:bg-slate-800/20 border-l-4 border-transparent'
                                    }`}
                                >
                                    <div className="p-2 bg-slate-800 rounded-lg relative">
                                        <User className="w-5 h-5 text-slate-400" />
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`text-sm font-semibold truncate ${hasUnread ? 'text-white' : 'text-slate-300'}`}>
                                                {c.customerName || 'Khách hàng'}
                                            </h4>
                                            <span className="text-[10px] text-slate-500">
                                                {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate ${hasUnread ? 'text-cyan-400 font-medium' : 'text-slate-400'}`}>
                                            {c.lastMessage}
                                        </p>
                                    </div>
                                    {hasUnread && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 self-center"></span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Column: Chat Window */}
            <div className={`flex-1 flex flex-col bg-slate-950/20 ${selectedCustomer ? 'flex' : 'hidden md:flex'}`}>
                {selectedCustomer ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-1 hover:bg-slate-800 rounded-lg md:hidden transition-colors text-slate-400 hover:text-white mr-1"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <User className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-200">{selectedCustomer.customerName || 'Khách hàng'}</h3>
                                    <span className="text-xs text-slate-500">ID: {selectedCustomer.customerId}</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col bg-slate-950/40">
                            {messagesLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div 
                                            key={msg.id || index}
                                            className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                                        >
                                            <span className="text-[10px] text-slate-500 mb-1 px-1">
                                                {msg.senderName} ({msg.senderRole})
                                            </span>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                                isMe 
                                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none' 
                                                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/30'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[9px] text-slate-500 mt-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/30 flex gap-3">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Nhập tin nhắn phản hồi..."
                                className="flex-1 px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="px-5 bg-gradient-to-r from-cyan-500 to-blue-500 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-95 transition-opacity disabled:cursor-not-allowed cursor-pointer"
                            >
                                Gửi
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 space-y-3">
                        <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                            <MessageSquare className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="font-semibold text-slate-300">Không có cuộc trò chuyện nào được chọn</h3>
                        <p className="text-xs text-slate-500 text-center max-w-xs">
                            Chọn một khách hàng trong danh sách bên trái để bắt đầu hỗ trợ trực tuyến
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
