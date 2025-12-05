"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/auth/user-profile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useFormatDate } from "@/hooks/useFormatDate";
import { customerService } from "@/services/customer.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const { format } = useFormatDate();
    const { profile, isLoading: profileLoading } = useProfile();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<any>({});
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (profile) {
            const formatDate = (date: any) => {
                if (!date) return "";
                if (typeof date === "string") return date.substring(0, 10);
                if (date instanceof Date) return date.toISOString().substring(0, 10);
                return "";
            };

            setForm({
                fullName: profile.fullName || "",
                phone: profile.phone || "",
                email: profile.email || user?.email || "",
                address: profile.address || "",
                gender: profile.gender || "",
                nationality: profile.nationality || "",
                dateOfBirth: formatDate(profile.dateOfBirth),
                nationalId: profile.nationalId || "",
                driverLicenseNo: profile.driverLicenseNo || "",
                driverLicenseExpiry: formatDate(profile.driverLicenseExpiry),
                avatarUrl: profile.avatarUrl || "",
            });
            setAvatarPreview(profile.avatarUrl || "");
        } else if (!profileLoading && user) {
            setForm({
                fullName: user.name || "",
                phone: "",
                email: user.email || "",
                address: "",
                gender: "",
                nationality: "",
                dateOfBirth: "",
                nationalId: "",
                driverLicenseNo: "",
                driverLicenseExpiry: "",
                avatarUrl: "",
            });
        }
    }, [profile, profileLoading, user]);

    const isCustomer = useMemo(() => user?.role === "CUSTOMER" || user?.role === "USER", [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleUpload = async (file?: File) => {
        if (!file) return;
        try {
            setUploading(true);
            const baseURL = process.env.NEXT_PUBLIC_API_ENDPOINT;
            if (!baseURL) throw new Error("Thiếu cấu hình NEXT_PUBLIC_API_ENDPOINT");

            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
            const fd = new FormData();
            fd.append("files", file);

            const res = await fetch(`${baseURL}/upload/images`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: fd
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Upload thất bại");
            }
            const json = await res.json();
            const url = json?.urls?.[0];

            setForm((prev: any) => ({ ...prev, avatarUrl: url }));
            setAvatarPreview(url);
            toast.success("Tải ảnh lên thành công");
        } catch (err: any) {
            toast.error(err?.message || "Upload thất bại");
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.fullName || !form.phone) {
            toast.error("Vui lòng điền họ tên và số điện thoại");
            return;
        }
        try {
            setSaving(true);

            const createData: any = {
                fullName: form.fullName,
                phone: form.phone,
                userId: user?.id,
            };

            if (form.email) createData.email = form.email;
            if (form.address) createData.address = form.address;
            if (form.dateOfBirth) createData.dateOfBirth = form.dateOfBirth;
            if (form.gender) createData.gender = form.gender;
            if (form.nationalId) createData.nationalId = form.nationalId;
            if (form.nationality) createData.nationality = form.nationality;
            if (form.driverLicenseNo) createData.driverLicenseNo = form.driverLicenseNo;
            if (form.driverLicenseExpiry) createData.driverLicenseExpiry = form.driverLicenseExpiry;
            if (form.avatarUrl) createData.avatarUrl = form.avatarUrl;

            await customerService.create(createData);

            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });

            toast.success("Tạo hồ sơ khách hàng thành công!");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || "Tạo hồ sơ thất bại";
            toast.error(errorMsg);
            console.error("Create customer error:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!profile?.id) return;
        try {
            setSaving(true);

            const updateData: any = {};
            if (form.fullName) updateData.fullName = form.fullName;
            if (form.phone) updateData.phone = form.phone;
            if (form.email) updateData.email = form.email;
            if (form.address !== undefined) updateData.address = form.address || null;
            if (form.dateOfBirth) updateData.dateOfBirth = form.dateOfBirth;
            if (form.gender) updateData.gender = form.gender;
            if (form.nationalId !== undefined) updateData.nationalId = form.nationalId || null;
            if (form.nationality !== undefined) updateData.nationality = form.nationality || null;
            if (form.driverLicenseNo !== undefined) updateData.driverLicenseNo = form.driverLicenseNo || null;
            if (form.driverLicenseExpiry) updateData.driverLicenseExpiry = form.driverLicenseExpiry;
            if (form.avatarUrl !== undefined) updateData.avatarUrl = form.avatarUrl || null;

            await customerService.update(profile.id, updateData);

            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });

            toast.success("Cập nhật hồ sơ thành công");
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || "Cập nhật thất bại";
            toast.error(errorMsg);
            console.error("Update customer error:", err);
        } finally {
            setSaving(false);
        }
    };

    if (userLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-[#0b1424] text-blue-100 flex items-center justify-center">
                <div className="loader" />
            </div>
        );
    }

    const isCreating = !profile && isCustomer;

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Hồ sơ cá nhân</p>
<<<<<<< HEAD
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                            {isCreating ? "Tạo hồ sơ khách hàng" : "Thông tin tài khoản"}
                        </h1>
                        <p className="text-blue-100 mt-1">
                            {isCreating
                                ? "Điền thông tin để tạo hồ sơ khách hàng và sử dụng dịch vụ"
                                : "Cập nhật avatar, thông tin liên hệ và giấy tờ tùy thân."
                            }
                        </p>
=======
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Thông tin tài khoản</h1>
                        <p className="text-blue-100 mt-1">Cập nhật avatar, thông tin liên hệ và giấy tờ tùy thân.</p>
>>>>>>> b9b3026 (update layout)
                    </div>
                    <div className="text-right text-blue-100 text-sm">
                        <p>Email: {user?.email}</p>
                        <p>Ngày tạo: {format(user?.createdAt)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur space-y-4">
                            <p className="text-sm uppercase tracking-[0.15em] text-blue-200">Ảnh đại diện</p>
                            <div className="w-36 h-36 rounded-full overflow-hidden border border-white/20 bg-white/10 mx-auto">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-blue-100 text-sm">Chưa có ảnh</div>
                                )}
                            </div>
                            <label className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-sm font-semibold cursor-pointer hover:bg-white/15 transition">
                                {uploading ? "Đang tải..." : "Tải ảnh lên"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleUpload(e.target.files?.[0])}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Họ tên" name="fullName" value={form.fullName || ""} onChange={handleChange} />
                                <Field label="Số điện thoại" name="phone" value={form.phone || ""} onChange={handleChange} />
                                <SelectField
                                    label="Giới tính"
                                    name="gender"
                                    value={form.gender || ""}
                                    onChange={handleChange}
                                    options={[
                                        { value: "", label: "Chọn giới tính" },
                                        { value: "MALE", label: "Nam" },
                                        { value: "FEMALE", label: "Nữ" },
                                        { value: "OTHER", label: "Khác" },
                                    ]}
                                />
                                <Field label="Địa chỉ" name="address" value={form.address || ""} onChange={handleChange} />
                                <Field label="Quốc tịch" name="nationality" value={form.nationality || ""} onChange={handleChange} />
                                <Field
                                    label="Ngày sinh"
                                    name="dateOfBirth"
                                    type="date"
                                    value={
                                        form.dateOfBirth
                                            ? typeof form.dateOfBirth === "string"
                                                ? form.dateOfBirth.substring(0, 10)
                                                : new Date(form.dateOfBirth).toISOString().substring(0, 10)
                                            : ""
                                    }
                                    onChange={handleChange}
                                />
                            </div>

                            {isCustomer && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="CMND/CCCD" name="nationalId" value={form.nationalId || ""} onChange={handleChange} />
                                    <Field label="Số GPLX" name="driverLicenseNo" value={form.driverLicenseNo || ""} onChange={handleChange} />
                                    <Field
                                        label="GPLX hết hạn"
                                        name="driverLicenseExpiry"
                                        type="date"
                                        value={
                                            form.driverLicenseExpiry
                                                ? typeof form.driverLicenseExpiry === "string"
                                                    ? form.driverLicenseExpiry.substring(0, 10)
                                                    : new Date(form.driverLicenseExpiry).toISOString().substring(0, 10)
                                                : ""
                                        }
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={isCreating ? handleCreate : handleSubmit}
                                    disabled={saving}
                                    className="px-5 py-3 bg-white text-[#0b1f3a] font-semibold rounded-lg shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                                >
                                    {saving
                                        ? (isCreating ? "Đang tạo..." : "Đang lưu...")
                                        : (isCreating ? "Tạo hồ sơ" : "Lưu thay đổi")
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder
}: {
    label: string;
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
}) {
    return (
        <label className="space-y-1 text-sm text-blue-100">
            <span className="block text-xs uppercase tracking-[0.12em] text-blue-200">{label}</span>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-blue-200 focus:outline-none focus:border-white/40"
            />
        </label>
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options
}: {
    label: string;
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <label className="space-y-1 text-sm text-blue-100">
            <span className="block text-xs uppercase tracking-[0.12em] text-blue-200">{label}</span>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-blue-200 focus:outline-none focus:border-white/40"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0b1424] text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
