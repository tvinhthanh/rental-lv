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

        // 204 No Content (or empty body) is valid for many APIs
        if (response.status === 204) {
            return null;
        }

        // If server doesn't declare JSON, it might still be a valid non-JSON payload
        // e.g. "0" for counts, or a plain-text message.
        const rawText = !contentType.includes("application/json")
            ? await response.text()
            : null;

        // JSON response path
        if (contentType.includes("application/json")) {
            const json = await response.json();
            if (!response.ok) {
                throw json; // BE error (JSON)
            }
            return json;
        }

        // Non-JSON response path
        const text = (rawText ?? "").trim();

        // Empty string: treat as no content
        if (!text) {
            if (!response.ok) {
                throw new Error(`Request failed (${response.status})`);
            }
            return null;
        }

        // Common case: backend returns numeric text like "0"
        if (/^-?\d+(\.\d+)?$/.test(text)) {
            const num = Number(text);
            if (!response.ok) {
                throw new Error(text);
            }
            return num;
        }

        // If it looks like JSON even without header, try parse
        if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
            try {
                const parsed = JSON.parse(text);
                if (!response.ok) {
                    throw parsed;
                }
                return parsed;
            } catch {
                // fall through
            }
        }

        // Probably HTML (login page) or unexpected plain text
        console.error("NON-JSON RESPONSE:", text);
        if (!response.ok) {
            throw new Error(text);
        }
        return text;
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
    patch(url: string, data?: any, options?: RequestInit) {
        return this.request(url, "PATCH", data, options);
    }
}
