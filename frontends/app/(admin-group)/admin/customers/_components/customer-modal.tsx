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
        mutationFn: async () => {
            if (selected) {
                return customerService.update(selected.id, form);
            }
            return customerService.create(form);
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

    const onSubmit = () => {
        if (!form.fullName || !form.phone) {
            toast.error("Full name and phone are required");
            return;
        }
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 w-[520px] rounded-2xl shadow-xl text-gray-200 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                    {selected ? "Edit Customer" : "Add Customer"}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <Input label="Full Name *" value={form.fullName} onChange={(v:any) => setForm({ ...form, fullName: v })} />
                    <Input label="Phone *" value={form.phone} onChange={(v:any) => setForm({ ...form, phone: v })} />
                    <Input label="Email" value={form.email} onChange={(v:any) => setForm({ ...form, email: v })} />
                    <Input label="Address" value={form.address} onChange={(v:any) => setForm({ ...form, address: v })} />
                    <Input label="National ID" value={form.nationalId} onChange={(v:any) => setForm({ ...form, nationalId: v })} />
                    <Input label="Nationality" value={form.nationality} onChange={(v:any) => setForm({ ...form, nationality: v })} />
                    <Input label="Driver License No" value={form.driverLicenseNo} onChange={(v:any) => setForm({ ...form, driverLicenseNo: v })} />
                    <Input
                        label="License Expiry"
                        type="date"
                        value={form.driverLicenseExpiry}
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

function Input({ label, value, onChange, type = "text" }: any) {
    return (
        <div>
            <label className="text-xs text-slate-400 mb-1 block">{label}</label>
            <input
                type={type}
                className="input-dark w-full"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
