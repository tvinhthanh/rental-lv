import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  children: ReactNode;
};

export function Button({ variant = "default", className, children, ...rest }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium h-9 px-4 py-2 transition-colors",
        variant === "default" &&
        "bg-slate-100 text-slate-900 hover:bg-white/90",
        variant === "outline" &&
        "border border-slate-700 text-slate-100 hover:bg-slate-800",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}