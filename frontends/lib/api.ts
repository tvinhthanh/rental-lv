// lib/api-request.ts
export class APIRequest {
    baseURL = process.env.NEXT_PUBLIC_API_ENDPOINT || "";

    private ensureBaseURL() {
        if (!this.baseURL) {
            throw new Error(
                "NEXT_PUBLIC_API_ENDPOINT is missing. Please set it in .env.local"
            );
        }
    }

    private async getToken() {
        // SERVER SIDE
        if (typeof window === "undefined") {
            const { cookies } = await import("next/headers");
            return (await cookies()).get("accessToken")?.value || "";
        }

        // CLIENT SIDE
        return localStorage.getItem("accessToken") || "";
    }

    private async request(
        url: string,
        method: string = "GET",
        data?: any,
        options: RequestInit = {}
    ) {
        this.ensureBaseURL();

        const token = await this.getToken();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string> || {})
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const fetchUrl = `${this.baseURL}${url}`;

        const response = await fetch(fetchUrl, {
            ...options,
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
            cache: "no-store",
        });

        // Handle redirect (login redirect → HTML)
        if (response.redirected) {
            const text = await response.text();
            throw new Error(`Redirected to: ${response.url}\n${text}`);
        }

        const contentType = response.headers.get("content-type") || "";

        // ❗ Nếu trả HTML → LỖI BACKEND hoặc ROUTE SAI
        if (!contentType.includes("application/json")) {
            const html = await response.text();
            console.error("NON-JSON RESPONSE:", html);
            throw new Error("Server did not return JSON");
        }

        const json = await response.json();

        if (!response.ok) {
            throw json; // BE error (JSON)
        }

        return json;
    }

    get(url: string, options?: RequestInit) {
        return this.request(url, "GET", null, options);
    }

    post(url: string, data?: any, options?: RequestInit) {
        return this.request(url, "POST", data, options);
    }

    put(url: string, data?: any, options?: RequestInit) {
        return this.request(url, "PUT", data, options);
    }

    delete(url: string, data?: any, options?: RequestInit) {
        return this.request(url, "DELETE", data, options);
    }
}
