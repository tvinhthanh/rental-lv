"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

interface RegisterFormProps {
  onChangeView?: (view: "login" | "register" | "forgot") => void;
}

export default function RegisterForm({ onChangeView }: RegisterFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    avatar: "",
    role: "USER",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Invalid email address");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!/^\d{9,11}$/.test(form.phone)) {
      toast.error("Phone number must be 9–11 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address || undefined,
        avatar: form.avatar || undefined,
        role: form.role,
      });

      toast.success("Registration successful!");
      onChangeView ? onChangeView("login") : router.push("/auth");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background Blur + Gradient */}
      <div className="absolute inset-0 -z-10 rounded-xl bg-linear-to-r from-indigo-600/40 via-purple-500/30 to-cyan-400/40 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md p-6 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.45)]"
      >
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-linear-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
          Create Account
        </h1>

        <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} required />
        <InputField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required />
        <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required />
        <InputField label="Address" name="address" value={form.address} onChange={handleChange} />
        <InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
        <InputField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-3 rounded-lg bg-linear-to-r from-indigo-600 to-cyan-500 text-white font-bold hover:scale-[1.03] transition-all disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-gray-300 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => onChangeView?.("login")}
            className="text-cyan-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text", required = false }: any) {
  return (
    <div className="mt-4">
      <label className="text-sm text-gray-200 mb-1 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-cyan-400 outline-none"
      />
    </div>
  );
}
