"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";

export function useCurrentUser() {
    return useQuery({
        queryKey: ["current-user"],
        queryFn: () => userService.me(),
        retry: false,            // tránh loop nếu token sai
        refetchOnWindowFocus: false,
    });
}
