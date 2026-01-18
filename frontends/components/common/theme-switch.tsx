/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative flex items-center justify-center
                 w-10 h-10 rounded-full 
                 bg-gradient-to-br from-slate-700/50 to-slate-800/50
                 dark:from-amber-500/20 dark:to-orange-500/20
                 text-gray-200 dark:text-amber-300
                 hover:from-slate-600/50 hover:to-slate-700/50
                 dark:hover:from-amber-500/30 dark:hover:to-orange-500/30
                 border border-slate-600/50 dark:border-amber-500/30
                 shadow-lg hover:shadow-xl
                 hover:scale-110 active:scale-95
                 transition-all duration-300
                 group"
      title={theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
    >
      <span className="text-lg group-hover:scale-110 transition-transform duration-300">
      {theme === "dark" ? "🌞" : "🌙"}
      </span>
      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {theme === "dark" ? "Sáng" : "Tối"}
      </span>
    </button>
  );
}
