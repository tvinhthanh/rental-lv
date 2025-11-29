"use client";

import {
    createContext,
    useContext,
    useCallback
} from "react";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type AuthUser = {
    id: string;
    email: string;
    role: string;
    name?: string;
};

interface AuthContextProps {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
    refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    const {
        data: user,
        refetch: loadProfile,
        isLoading,
        isFetching
    } = useQuery({
        queryKey: ["auth", "profile"],
        queryFn: async () => {
            const token = authService.getToken();
            if (!token) return null;

            try {
                return await userService.me();
            } catch (e) {
                authService.logout();
                return null;
            }
        },
        enabled: typeof window !== "undefined",
        retry: false,
        staleTime: 5 * 60 * 1000
    });

    const logout = useCallback(() => {
        authService.logout();

        queryClient.setQueryData(["auth", "profile"], null);

        queryClient.invalidateQueries({
            queryKey: ["auth", "profile"]
        });

        queryClient.clear();
    }, [queryClient]);

    const refreshProfile = useCallback(() => {
        loadProfile();
    }, [loadProfile]);

    const value: AuthContextProps = {
        user: user ?? null,
        loading: isLoading || isFetching,
        isAuthenticated: !!user,
        logout,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return ctx;
}

// ⚡ Login tự động refreshProfile và redirect
export function useLogin() {
    const { refreshProfile } = useAuth();
    const router = useRouter();

    return useMutation({
        mutationFn: authService.login,
        onSuccess: async () => {
            await refreshProfile();
            router.push("/dashboard");
        }
    });
}

export function useRegister() {
    return useMutation({
        mutationFn: authService.register
    });
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: authService.forgotPassword
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: userService.resetPassword
    });
}
