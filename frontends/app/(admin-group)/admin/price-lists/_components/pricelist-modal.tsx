"use client";

import { useForm } from "react-hook-form";
import { useFormSubmit } from "@/hooks/useHooks";
import { priceListService } from "@/services/price-list.service";
import { useEffect } from "react";

export default function PriceListModal({ open, selected, onClose }: any) {
    const {
        register,
        handleSubmit: formHandle,
        reset,
    } = useForm({
        defaultValues: {
            name: "",
            description: "",
            currency: "VND",
            dailyRate: 0,
            hourlyRate: null,
            weekendRate: null,
            holidayRate: null,
            isActive: true
        }
    });

    useEffect(() => {
        reset(
            selected ?? {
                name: "",
                description: "",
                currency: "VND",
                dailyRate: 0,
                hourlyRate: null,
                weekendRate: null,
                holidayRate: null,
                isActive: true
            }
        );
    }, [selected, reset]);

    const { handleSubmit, isPending } = useFormSubmit(
        (data: any) => {
            // Convert values
            const weekend = data.weekendRate ? Number(data.weekendRate) : null;

            const clean = {
                ...data,
                dailyRate: Number(data.dailyRate),
                hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : null,
                weekendRate: weekend,
                holidayRate:
                    data.holidayRate && data.holidayRate !== ""
                        ? Number(data.holidayRate)
                        : weekend
            };

            // XÓA CÁC FIELD KHÔNG ĐƯỢC UPDATE
            delete clean.id;
            delete clean.createdAt;
            delete clean.updatedAt;


            return selected
                ? priceListService.update(selected.id, clean)
                : priceListService.create(clean);
        },
        ["price-lists"]
    );

    const onSubmit = async (data: any) => {
        await handleSubmit(data);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 w-96 rounded shadow">
                <h2 className="text-lg font-semibold mb-4 text-gray-200">
                    {selected ? "Edit Price List" : "Add Price List"}
                </h2>

                <form onSubmit={formHandle(onSubmit)} className="space-y-3">

                    <input
                        {...register("name")}
                        className="input-dark"
                        placeholder="Name *"
                        required
                    />

                    <input
                        {...register("description")}
                        className="input-dark"
                        placeholder="Description"
                    />

                    <input
                        {...register("currency")}
                        className="input-dark"
                        placeholder="Currency (VND/USD)"
                    />

                    <input
                        type="number"
                        {...register("dailyRate", { valueAsNumber: true })}
                        className="input-dark"
                        placeholder="Daily Rate *"
                        required
                    />

                    <input
                        type="number"
                        {...register("hourlyRate", { valueAsNumber: true })}
                        className="input-dark"
                        placeholder="Hourly Rate"
                    />

                    <input
                        type="number"
                        {...register("weekendRate", { valueAsNumber: true })}
                        className="input-dark"
                        placeholder="Weekend Rate"
                    />

                    {/* NEW: HOLIDAY RATE */}
                    <input
                        type="number"
                        {...register("holidayRate", { valueAsNumber: true })}
                        className="input-dark"
                        placeholder="Holiday Rate (optional)"
                    />

                    <label className="text-gray-300 flex items-center gap-2">
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
    );
}
