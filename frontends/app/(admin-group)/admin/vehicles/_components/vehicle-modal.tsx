"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { vehicleService } from "@/services/vehicle.service";
import { brandService } from "@/services/brand.service";
import { branchService } from "@/services/branch.service";
import { vehicleCategoryService } from "@/services/vehicle-category.service";
import { priceListService } from "@/services/price-list.service";

import { useFormSubmit } from "@/hooks/useHooks";

interface VehicleModalProps {
  open: boolean;
  selected?: any;
  onClose: () => void;
}

const STATUS_OPTIONS = ["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"];

export default function VehicleModal({ open, selected, onClose }: VehicleModalProps) {
  const defaultValues = useMemo(
    () =>
      selected ?? {
        name: "",
        slug: "",
        vehicleType: "",
        licensePlate: "",
        model: "",
        year: "",
        color: "",
        seatCount: "",
        transmission: "",
        fuelType: "",
        mileage: "",
        status: "AVAILABLE",

        metaTitle: "",
        metaDescription: "",
        seoDescription: "",
        photos: [],

        priceListId: "",
        overridePriceEnabled: false,
        overrideDailyRate: "",
        overrideHourlyRate: "",
        overrideWeekendRate: "",
        overrideHolidayRate: "",

        categoryId: "",
        branchId: "",
        brandId: "",
      },
    [selected]
  );

  const { register, setValue, handleSubmit: formHandle, watch, reset } = useForm({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const overridePriceEnabled = watch("overridePriceEnabled");

  // BRAND
  const { data: brandsRes } = useQuery({
    queryKey: ["vehicle-brands"],
    queryFn: () => brandService.getAll(),
  });
  const brands = Array.isArray(brandsRes?.items ? brandsRes.items : brandsRes) ? (brandsRes?.items ?? brandsRes ?? []) : [];

  // BRANCH
  const { data: branchesRes } = useQuery({
    queryKey: ["branches-all"],
    queryFn: () => branchService.getAll(),
  });
  const branches = Array.isArray(branchesRes?.items ? branchesRes.items : branchesRes) ? (branchesRes?.items ?? branchesRes ?? []) : [];

  // CATEGORY
  const { data: categoriesRes } = useQuery({
    queryKey: ["vehicle-categories"],
    queryFn: () => vehicleCategoryService.list(),
  });
  const categories = Array.isArray(categoriesRes?.items ? categoriesRes.items : categoriesRes) ? (categoriesRes?.items ?? categoriesRes ?? []) : [];

  // PRICE LIST
  const { data: priceListsRes } = useQuery({
    queryKey: ["price-lists"],
    queryFn: () => priceListService.getAll(),
  });
  const priceLists = Array.isArray(priceListsRes?.items ? priceListsRes.items : priceListsRes) ? (priceListsRes?.items ?? priceListsRes ?? []) : [];

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

  const { handleSubmit, isPending } = useFormSubmit(
    (formData: any) => {
      const clean: any = { ...formData };

      // Remove auto fields
      ["id", "createdAt", "updatedAt", "rating", "reviewCount"].forEach((f) => delete clean[f]);

      // Convert number fields
      clean.year = clean.year ? Number(clean.year) : null;
      clean.seatCount = clean.seatCount ? Number(clean.seatCount) : null;
      clean.mileage = clean.mileage ? Number(clean.mileage) : null;

      clean.overrideDailyRate = clean.overrideDailyRate ? Number(clean.overrideDailyRate) : null;
      clean.overrideHourlyRate = clean.overrideHourlyRate ? Number(clean.overrideHourlyRate) : null;
      clean.overrideWeekendRate = clean.overrideWeekendRate ? Number(clean.overrideWeekendRate) : null;
      clean.overrideHolidayRate = clean.overrideHolidayRate ? Number(clean.overrideHolidayRate) : null;

      if (clean.overridePriceEnabled) clean.priceListId = null;
      else {
        clean.overrideDailyRate = null;
        clean.overrideHourlyRate = null;
        clean.overrideWeekendRate = null;
        clean.overrideHolidayRate = null;
      }

      if (typeof clean.photos === "string") {
        clean.photos = clean.photos.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      clean.slug = clean.slug || generateSlug(clean.name);

      return selected ? vehicleService.update(selected.id, clean) : vehicleService.create(clean);
    },
    ["vehicles"]
  );

  const onSubmit = async (data: any) => {
    await handleSubmit(data);
    onClose();
  };

  if (!open) return null;

  const photosValue = Array.isArray(selected?.photos) && selected.photos.length ? selected.photos.join(", ") : "";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6 pb-4 border-b border-slate-700/50">
            <h2 className="text-2xl font-bold text-white">{selected ? "Chỉnh sửa Xe" : "Thêm Xe"}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {selected ? "Cập nhật thông tin xe" : "Thêm xe mới vào hệ thống"}
            </p>
          </div>

          <form onSubmit={formHandle(onSubmit)} className="space-y-4">
          {/* BASIC INFO */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Thông tin cơ bản</h3>
          <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Tên xe *</label>
            <input
              {...register("name")}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                    placeholder="Tên xe"
              required
              onBlur={(e) => {
                if (!selected) setValue("slug", generateSlug(e.target.value));
              }}
            />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Slug</label>
                  <input 
                    {...register("slug")} 
                    className="w-full px-4 py-2.5 bg-slate-800/30 border border-slate-700 text-slate-400 rounded-lg focus:outline-none placeholder:text-slate-600" 
                    placeholder="slug-tu-dong" 
                    readOnly={!!selected} 
                  />
                </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Loại xe</label>
                  <input 
                    {...register("vehicleType")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                    placeholder="SUV, Sedan..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Biển số *</label>
                  <input 
                    {...register("licensePlate")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                    placeholder="30A-12345" 
                    required 
                  />
                </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Model</label>
                  <input 
                    {...register("model")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                    placeholder="Model" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Năm sản xuất</label>
                  <input 
                    type="number" 
                    {...register("year")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                    placeholder="2024" 
                  />
                </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Màu sắc</label>
                  <input 
                    {...register("color")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                    placeholder="Màu" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Số ghế</label>
                  <input 
                    type="number" 
                    {...register("seatCount")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                    placeholder="5" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Số km</label>
                  <input 
                    type="number" 
                    {...register("mileage")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                    placeholder="0" 
                  />
                </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Hộp số</label>
                  <input 
                    {...register("transmission")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                    placeholder="AT/MT" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Nhiên liệu</label>
                  <input 
                    {...register("fuelType")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                    placeholder="Xăng/Dầu" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Trạng thái</label>
                  <select 
                    {...register("status")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
              {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-slate-800">
                  {s}
                </option>
              ))}
            </select>
                </div>
              </div>
          </div>

          {/* RELATIONS */}
            <div className="space-y-4 pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Liên kết</h3>
          <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Thương hiệu *</label>
                  <select 
                    {...register("brandId")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required
                  >
                    <option value="" className="bg-slate-800">Chọn thương hiệu</option>
              {brands.map((b: any) => (
                      <option key={b.id} value={b.id} className="bg-slate-800">
                  {b.name}
                </option>
              ))}
            </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Chi nhánh *</label>
                  <select 
                    {...register("branchId")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required
                  >
                    <option value="" className="bg-slate-800">Chọn chi nhánh</option>
              {branches.map((b: any) => (
                      <option key={b.id} value={b.id} className="bg-slate-800">
                  {b.name}
                </option>
              ))}
            </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Danh mục *</label>
                  <select 
                    {...register("categoryId")} 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required
                  >
                    <option value="" className="bg-slate-800">Chọn danh mục</option>
              {categories.map((c: any) => (
                      <option key={c.id} value={c.id} className="bg-slate-800">
                  {c.name}
                </option>
              ))}
            </select>
                </div>
              </div>
          </div>

          {/* PRICING */}
            <div className="space-y-4 pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Cấu hình giá</h3>
              <div className="rounded-xl border border-slate-700/80 bg-slate-800/30 p-4 space-y-4">
                <label className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <input
                type="checkbox"
                {...register("overridePriceEnabled")}
                onChange={(e) => {
                  setValue("overridePriceEnabled", e.target.checked);
                  if (e.target.checked) setValue("priceListId", "");
                }}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
              />
                  <span className="text-sm text-gray-300">Tùy chỉnh giá (ghi đè bảng giá)</span>
            </label>

            {!overridePriceEnabled ? (
              <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Bảng giá</label>
                    <select 
                      {...register("priceListId")} 
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" className="bg-slate-800">Chọn bảng giá</option>
                  {priceLists.map((pl: any) => (
                        <option key={pl.id} value={pl.id} className="bg-slate-800">
                          {pl.name} - Ngày: {pl.dailyRate || 0}đ | Giờ: {pl.hourlyRate || 0}đ
                    </option>
                  ))}
                </select>
                    <p className="text-xs text-slate-500 mt-2">
                      Chọn bảng giá để sử dụng giá chuẩn, hoặc bật tùy chỉnh để đặt giá riêng
                </p>
              </div>
            ) : (
                  <div className="space-y-3 grid grid-cols-2 gap-3">
                <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Giá theo ngày (đ)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        {...register("overrideDailyRate")} 
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                        placeholder="0" 
                      />
                </div>
                <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Giá theo giờ (đ)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        {...register("overrideHourlyRate")} 
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                        placeholder="0" 
                      />
                </div>
                <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Giá cuối tuần (đ)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        {...register("overrideWeekendRate")} 
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                        placeholder="0" 
                      />
                </div>
                <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Giá ngày lễ (đ)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        {...register("overrideHolidayRate")} 
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500" 
                        placeholder="0" 
                      />
                </div>
              </div>
            )}
              </div>
          </div>

          {/* PHOTOS */}
            <div className="space-y-4 pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Hình ảnh</h3>
          <textarea
            {...register("photos")}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500 min-h-[80px]"
                placeholder="URLs hình ảnh, phân cách bằng dấu phẩy"
            defaultValue={photosValue}
          />
            </div>

          {/* ACTION BUTTONS */}
            <div className="border-t border-slate-700/50 pt-4 mt-6">
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-5 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-800/50 transition-colors font-medium"
                >
                  Hủy
            </button>
                <button 
                  type="submit" 
                  disabled={isPending} 
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  {isPending ? "Đang lưu..." : "Lưu"}
            </button>
              </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
