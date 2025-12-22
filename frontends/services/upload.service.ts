import { APIRequest } from "@/lib/api";

const api = new APIRequest();

export const uploadService = {
    uploadFile: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001'}/upload/file`, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type, let browser set it with boundary
                'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message || 'Upload failed');
        }

        return response.json();
    }
};

