"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useHooks";

interface LoginFormProps {
  onChangeView: (view: "login" | "register" | "forgot") => void;
}

export default function LoginForm({ onChangeView }: LoginFormProps) {
  const router = useRouter();
  const loginMutation = useLogin();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Email không hợp lệ";
    }
    if (!form.password || form.password.length < 6) {
      errs.password = "Mật khẩu tối thiểu 6 ký tự";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    const payload = { email: form.email.trim(), password: form.password };

    loginMutation.mutate(payload, {
      onSuccess: (res: any) => {
        toast.success("Logged in successfully");

        const role = localStorage.getItem("role");

        if (role === "ADMIN") router.push("/admin/dashboard");
        else if (role === "EMPLOYEE") router.push("/employee");
        else router.push("/");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Login failed");
      },
    });
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-linear-to-br from-indigo-600/30 via-purple-500/20 to-cyan-300/20 blur-2xl opacity-70 pointer-events-none" />

      <form 
        onSubmit={handleSubmit}
        className="relative z-10 p-6 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.45)]"
      >

        <h1 className="text-3xl font-extrabold mb-6 text-center bg-linear-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
          Welcome Back
        </h1>

        <div className="space-y-4">

          <div>
            <label className="text-sm text-gray-200 mb-1 block">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20"
              placeholder="your@email.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-200 mb-1 block">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20"
              placeholder="••••••••"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-6 w-full py-3 rounded-lg bg-linear-to-r from-indigo-600 to-cyan-500 text-white font-bold hover:scale-[1.03] transition-all disabled:opacity-50 cursor-pointer"
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>

        <p
          onClick={() => onChangeView("forgot")}
          className="mt-4 text-center text-gray-300 hover:text-indigo-300 cursor-pointer"
        >
          Forgot password?
        </p>

        <p
          onClick={() => onChangeView("register")}
          className="mt-2 text-center text-gray-300 hover:text-cyan-300 cursor-pointer"
        >
          Create an account
        </p>
      </form>

      <div className="absolute inset-0 -z-10 rounded-xl bg-linear-to-r from-indigo-600/40 via-purple-500/30 to-cyan-400/40 blur-3xl" />
    </div>
  );
}
