"use client";

import { useForgotPassword } from "@/hooks/auth/use-auth";
import { useState } from "react";
import { toast } from "sonner";

interface ForgotFormProps {
    onChangeView: (view: "login" | "register" | "forgot") => void;
}

export default function ForgotForm({ onChangeView }: ForgotFormProps) {
    const forgotMutation = useForgotPassword();
    const [email, setEmail] = useState("");

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        if (!validateEmail(email)) {
            toast.error("Please enter a valid email");
            return;
        }

        forgotMutation.mutate(
            { email },
            {
                onSuccess: () => {
                    toast.success("Password reset link sent to your email!");
                    setEmail(""); // Clear form
                    onChangeView("login");
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || err?.message || "Failed to send reset email");
                },
            }
        );
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/30 via-purple-500/20 to-pink-400/20 blur-2xl opacity-70 pointer-events-none" />

            <form 
                onSubmit={handleSubmit}
                className="relative z-10 p-6 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.45)]"
            >
                <h1 className="text-3xl font-extrabold mb-4 text-center bg-linear-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Reset Password
                </h1>

                <p className="text-center text-gray-300 text-sm mb-6">
                    Enter your email and we&apos;ll send you a link to reset your password
                </p>

                <div>
                    <label className="text-sm text-gray-200 mb-1 block">
                        Email <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                        placeholder="your@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={forgotMutation.isPending}
                    />
                </div>

                <button
                    type="submit"
                    disabled={forgotMutation.isPending}
                    className="mt-6 w-full py-3 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 text-white font-bold hover:scale-[1.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                >
                    {forgotMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                        </span>
                    ) : (
                        "Send Reset Link"
                    )}
                </button>

                <p
                    onClick={() => !forgotMutation.isPending && onChangeView("login")}
                    className="mt-6 text-center text-gray-300 hover:text-purple-300 cursor-pointer transition-colors"
                >
                    Remember your password? <span className="font-semibold">Login</span>
                </p>
            </form>

            <div className="absolute inset-0 -z-10 rounded-xl bg-linear-to-r from-blue-600/40 via-purple-500/30 to-pink-400/40 blur-3xl" />
        </div>
    );
}