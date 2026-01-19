/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Chỉ hiển thị khi dark mode
  if (theme !== "dark") return null;

  return (
    <button
      onClick={() => setTheme("light")}
      className="relative flex items-center justify-center
                 w-10 h-10 rounded-full 
                 bg-gradient-to-br from-amber-500/20 to-orange-500/20
                 text-amber-300
                 hover:from-amber-500/30 hover:to-orange-500/30
                 border border-amber-500/30
                 shadow-lg hover:shadow-xl
                 hover:scale-110 active:scale-95
                 transition-all duration-300
                 group"
      title="Chuyển sang sáng"
    >
      <span className="text-lg group-hover:scale-110 transition-transform duration-300">
        🌙
      </span>
      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
        Tối
      </span>
    </button>
  );
}
