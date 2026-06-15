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
            <div className="bg-slate-900 border border-slate-700 p-6 w-[520px] rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                    {selected ? "Chỉnh sửa bảng giá" : "Thêm bảng giá"}
                </h2>

                <form onSubmit={formHandle(onSubmit)} className="space-y-4">

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            {...register("name")}
                            className="input-dark focus:bg-white focus:text-black"
                            placeholder="Tên bảng giá *"
                            required
                        />

                        <input
                            {...register("description")}
                            className="input-dark focus:bg-white focus:text-black"
                            placeholder="Mô tả"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            {...register("currency")}
                            className="input-dark focus:bg-white focus:text-black"
                            placeholder="Loại tiền tệ (VND/USD)"
                        />

                        <input
                            type="number"
                            {...register("dailyRate", { valueAsNumber: true })}
                            className="input-dark focus:bg-white focus:text-black"
                            placeholder="Giá theo ngày *"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            {...register("hourlyRate", { valueAsNumber: true })}
                            className="input-dark focus:bg-white focus:text-black"
                            placeholder="Giá theo giờ"
                        />

                        <input
                            type="number"
                            {...register("weekendRate", { valueAsNumber: true })}
                            className="input-dark focus:bg-white focus:text-black"
                            placeholder="Giá cuối tuần"
                        />
                    </div>

                    <input
                        type="number"
                        {...register("holidayRate", { valueAsNumber: true })}
                        className="input-dark focus:bg-white focus:text-black"
                        placeholder="Giá ngày lễ (không bắt buộc)"
                    />

                    <label className="text-gray-300 flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register("isActive")} />
                        Hoạt động
                    </label>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-600 text-gray-300 rounded hover:bg-slate-700 transition-colors"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 transition-colors"
                        >
                            {isPending ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
