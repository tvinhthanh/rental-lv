import { APIRequest } from "@/lib/api";

const api = new APIRequest();

export const chatService = {
    getMyHistory() {
        return api.get(`/chat/history`);
    },

    getHistoryForAdmin(customerId: string) {
        return api.get(`/chat/history/${customerId}`);
    },

    getConversations() {
        return api.get(`/chat/conversations`);
    },

    markAsRead(customerId: string) {
        return api.patch(`/chat/read/${customerId}`, {});
    }
};
