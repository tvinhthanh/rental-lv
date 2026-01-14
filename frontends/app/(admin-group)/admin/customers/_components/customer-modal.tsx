"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { toast } from "sonner";

type Props = {
    selected: any;
    onClose: () => void;
};

export default function CustomerModal({ selected, onClose }: Props) {
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        driverLicenseNo: "",
        driverLicenseExpiry: "",
        nationalId: "",
        nationality: "",
    });

    useEffect(() => {
        if (selected) {
            setForm({
                fullName: selected.fullName ?? "",
                phone: selected.phone ?? "",
                email: selected.email ?? "",
                address: selected.address ?? "",
                driverLicenseNo: selected.driverLicenseNo ?? "",
                driverLicenseExpiry: selected.driverLicenseExpiry
                    ? selected.driverLicenseExpiry.slice(0, 10)
                    : "",
                nationalId: selected.nationalId ?? "",
                nationality: selected.nationality ?? "",
            });
        } else {
            setForm({
                fullName: "",
                phone: "",
                email: "",
                address: "",
                driverLicenseNo: "",
                driverLicenseExpiry: "",
                nationalId: "",
                nationality: "",
            });
        }
    }, [selected]);

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            if (selected) {
                return customerService.update(selected.id, payload);
            }
            return customerService.create(payload);
        },
        onSuccess: () => {
            toast.success("Saved customer");
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            onClose();
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || "Save failed";
            toast.error(msg);
        },
    });

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.fullName || form.fullName.trim().length < 2) {
            errs.fullName = "Họ tên tối thiểu 2 ký tự";
        }
        if (!form.phone || !/^0\d{9}$/.test(form.phone.trim())) {
            errs.phone = "Số điện thoại phải 10 số và bắt đầu bằng 0";
        }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errs.email = "Email không hợp lệ";
        }
        if (form.nationalId && !/^(?:\d{9}|\d{12})$/.test(form.nationalId.trim())) {
            errs.nationalId = "CMND/CCCD phải 9 hoặc 12 số";
        }
        if (form.driverLicenseNo && !/^[A-Za-z0-9]{6,20}$/.test(form.driverLicenseNo.trim())) {
            errs.driverLicenseNo = "Bằng lái 6-20 ký tự chữ/số";
        }
        if (form.driverLicenseExpiry) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const exp = new Date(form.driverLicenseExpiry);
            exp.setHours(0, 0, 0, 0);
            if (exp <= today) {
                errs.driverLicenseExpiry = "Hạn bằng lái phải lớn hơn hôm nay";
            }
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const onSubmit = () => {
        if (!validate()) return;
        const payload = {
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            email: form.email?.trim() || undefined,
            address: form.address?.trim() || undefined,
            driverLicenseNo: form.driverLicenseNo?.trim() || undefined,
            driverLicenseExpiry: form.driverLicenseExpiry || undefined,
            nationalId: form.nationalId?.trim() || undefined,
            nationality: form.nationality?.trim() || undefined,
        };
        mutation.mutate(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 w-[520px] rounded-2xl shadow-xl text-gray-200 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                    {selected ? "Edit Customer" : "Add Customer"}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <Input label="Full Name *" value={form.fullName} error={errors.fullName} onChange={(v:any) => setForm({ ...form, fullName: v })} />
                    <Input label="Phone *" value={form.phone} error={errors.phone} onChange={(v:any) => setForm({ ...form, phone: v })} />
                    <Input label="Email" value={form.email} error={errors.email} onChange={(v:any) => setForm({ ...form, email: v })} />
                    <Input label="Address" value={form.address} onChange={(v:any) => setForm({ ...form, address: v })} />
                    <Input label="National ID" value={form.nationalId} error={errors.nationalId} onChange={(v:any) => setForm({ ...form, nationalId: v })} />
                    <Input label="Nationality" value={form.nationality} onChange={(v:any) => setForm({ ...form, nationality: v })} />
                    <Input label="Driver License No" value={form.driverLicenseNo} error={errors.driverLicenseNo} onChange={(v:any) => setForm({ ...form, driverLicenseNo: v })} />
                    <Input
                        label="License Expiry"
                        type="date"
                        value={form.driverLicenseExpiry}
                        error={errors.driverLicenseExpiry}
                        onChange={(v:any) => setForm({ ...form, driverLicenseExpiry: v })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-600 text-gray-300 rounded hover:bg-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={mutation.isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-60"
                    >
                        {mutation.isPending ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, type = "text", error }: any) {
    return (
        <div>
            <label className="text-xs text-slate-400 mb-1 block">{label}</label>
            <input
                type={type}
                className="input-dark w-full"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>
    );
}
