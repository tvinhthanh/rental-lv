import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    const token = req.cookies.get("accessToken")?.value || null;
    const role = req.cookies.get("role")?.value || null;

    console.log("MW:", path, "| role:", role);

    // PUBLIC ROUTES
    const publicRoutes = ["/auth", "/auth/login", "/auth/register", "/auth/forgot-password"];
    if (publicRoutes.some((p) => path.startsWith(p))) {
        return NextResponse.next();
    }

    // Unauthenticated → redirect to /auth
    if (!token) {
        return NextResponse.redirect(new URL("/auth", req.url));
    }

    // RBAC RULES
    if (path.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/404", req.url));
    }

    if (path.startsWith("/employee") && role !== "EMPLOYEE") {
        return NextResponse.redirect(new URL("/404", req.url));
    }

    const isCustomer = role === "CUSTOMER" || role === "USER";

    if (path.startsWith("/user") && !isCustomer) {
        return NextResponse.redirect(new URL("/404", req.url));
    }

    // Everything OK → allow
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/employee/:path*",
        "/user/:path*",
        "/auth/:path*",
        "/"
    ],
};
