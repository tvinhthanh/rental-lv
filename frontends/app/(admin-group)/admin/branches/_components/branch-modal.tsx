"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { branchService } from "@/services/branch.service";
import { useFormSubmit } from "@/hooks/useHooks";
import MapPicker from "@/components/add-ons/map-picker";

interface BranchModalProps {
    open: boolean;
    selected?: any;
    onClose: () => void;
}

export default function BranchModal({ open, selected, onClose }: BranchModalProps) {
    const [openMap, setOpenMap] = useState(false);

    const defaultValues = selected ?? {
        name: "",
        code: "",
        slug: "",
        address: "",
        city: "",
        country: "",
        phone: "",
        email: "",
        latitude: "",
        longitude: "",
        googleMapUrl: "",
        businessHours: "",
        metaTitle: "",
        metaDescription: "",
        isActive: true,
    };

    const { register, setValue, handleSubmit: formHandle } = useForm({
        defaultValues,
    });

    // AUTO-SLUG
    const generateSlug = (name: string) =>
        name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

    const { handleSubmit, isPending } = useFormSubmit(
        (formData: any) => {
            const data = {
                ...formData,
                latitude: formData.latitude ? Number(formData.latitude) : null,
                longitude: formData.longitude ? Number(formData.longitude) : null,
                slug: formData.slug || generateSlug(formData.name)
            };

            return selected
                ? branchService.update(selected.id, data)
                : branchService.create(data);
        },
        ["branches"]
    );

    const onSubmit = async (data: any) => {
        const clean = { ...data };

        // Loại bỏ field không được update
        [
            "id",
            "createdAt",
            "updatedAt",
            "vehicles",
            "employees",
            "bookings",
            "returnBranchBookings",
            "returnReportBranches"
        ].forEach(field => delete clean[field]);

        // Convert lại số
        clean.latitude = clean.latitude ? Number(clean.latitude) : null;
        clean.longitude = clean.longitude ? Number(clean.longitude) : null;

        clean.slug = clean.slug || generateSlug(clean.name);

        await handleSubmit(clean);
        onClose();
    };


    if (!open) return null;

    return (
        <>
            {/* MAIN MODAL */}
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-slate-900 border border-slate-700 p-6 w-[420px] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">

                    <h2 className="text-xl font-semibold mb-4 text-gray-200">
                        {selected ? "Edit Branch" : "Add Branch"}
                    </h2>

                    <form onSubmit={formHandle(onSubmit)} className="space-y-3">

                        {/* BASIC */}
                        <input
                            {...register("name")}
                            className="input-dark"
                            placeholder="Name *"
                            required
                            onBlur={(e) => setValue("slug", generateSlug(e.target.value))}
                        />

                        <input {...register("code")} className="input-dark" placeholder="Code (optional)" />
                        <input {...register("slug")} className="input-dark" placeholder="Slug" />

                        <input {...register("email")} className="input-dark" placeholder="Email" />
                        <input {...register("address")} className="input-dark" placeholder="Address" />
                        <input {...register("city")} className="input-dark" placeholder="City" />
                        <input {...register("country")} className="input-dark" placeholder="Country" />
                        <input {...register("phone")} className="input-dark" placeholder="Phone" />

                        {/* MAP PICKER */}
                        <div className="grid grid-cols-2 gap-3">
                            <input {...register("latitude")} className="input-dark" placeholder="Latitude" />
                            <input {...register("longitude")} className="input-dark" placeholder="Longitude" />
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpenMap(true)}
                            className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            📍 Pick Location on Map
                        </button>

                        <input {...register("googleMapUrl")} className="input-dark" placeholder="Google Map URL" />
                        <input {...register("businessHours")} className="input-dark" placeholder="08:00 - 17:00" />

                        <input {...register("metaTitle")} className="input-dark" placeholder="Meta Title (SEO)" />
                        <textarea {...register("metaDescription")} className="input-dark" placeholder="Meta Description (SEO)" />

                        <label className="flex items-center gap-2 text-gray-300">
                            <input type="checkbox" {...register("isActive")} />
                            Active
                        </label>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-slate-600 text-gray-300 rounded hover:bg-slate-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                            >
                                {isPending ? "Saving..." : "Save"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* MAP PICKER POPUP */}
            {openMap && (
                <MapPicker
                    onSelect={({ lat, lng }: any) => {
                        setValue("latitude", lat);
                        setValue("longitude", lng);
                        setValue("googleMapUrl", `https://www.google.com/maps?q=${lat},${lng}`);
                        setOpenMap(false);
                    }}
                    onClose={() => setOpenMap(false)}
                />
            )}
        </>
    );
}
