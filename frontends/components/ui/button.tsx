import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none gap-2",
        
        // Sizes
        size === "sm" && "text-xs h-8 px-3 py-1.5",
        size === "md" && "text-sm h-10 px-4 py-2",
        size === "lg" && "text-base h-12 px-6 py-3",

        // Variants (designed to bypass the global CSS override by including excluded keywords)
        variant === "primary" &&
          "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-blue-100 font-semibold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20",
        
        variant === "secondary" &&
          "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50",
        
        variant === "danger" &&
          "bg-red-600 hover:bg-red-700 text-red-100 font-semibold shadow-lg shadow-red-500/10 hover:shadow-red-500/20",
        
        variant === "outline" &&
          "border border-slate-600 text-slate-200 hover:bg-slate-800/50",
        
        variant === "ghost" &&
          "bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white",

        className
      )}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
}