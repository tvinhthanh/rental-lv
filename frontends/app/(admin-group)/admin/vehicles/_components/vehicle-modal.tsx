"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { vehicleService } from "@/services/vehicle.service";
import { brandService } from "@/services/brand.service";
import { branchService } from "@/services/branch.service";
import { vehicleCategoryService } from "@/services/vehicle-category.service";
import { priceListService } from "@/services/price-list.service";
import { documentService } from "@/services/document.service";
import { uploadService } from "@/services/upload.service";

import { useFormSubmit } from "@/hooks/useHooks";

interface VehicleModalProps {
  open: boolean;
  selected?: any;
  onClose: () => void;
}

const STATUS_OPTIONS = ["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"];

export default function VehicleModal({ open, selected, onClose }: VehicleModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "documents">("info");
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

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

  const photos = watch("photos") || [];
  const photosArray = Array.isArray(photos) ? photos : (typeof photos === "string" && photos ? photos.split(",").map((s: string) => s.trim()).filter(Boolean) : []);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Load documents when vehicle is selected
  useEffect(() => {
    if (selected?.id) {
      setDocumentsLoading(true);
      documentService.list({ vehicleId: selected.id })
        .then((res) => {
          const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
          setDocuments(items);
        })
        .catch((err) => {
          console.error("Load documents failed:", err);
        })
        .finally(() => setDocumentsLoading(false));
    } else {
      setDocuments([]);
    }
  }, [selected?.id]);

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

      // Ensure photos is an array
      if (typeof clean.photos === "string") {
        clean.photos = clean.photos.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (!Array.isArray(clean.photos)) {
        clean.photos = [];
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

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Bạn có chắc muốn xóa giấy tờ này?")) return;
    try {
      await documentService.delete(docId);
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (err: any) {
      alert(err?.message || "Xóa thất bại");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6 pb-4 border-b border-slate-700/50">
            <h2 className="text-2xl font-bold text-white">{selected ? "Chỉnh sửa Xe" : "Thêm Xe"}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {selected ? "Cập nhật thông tin xe" : "Thêm xe mới vào hệ thống"}
            </p>
          </div>

          {/* Tabs */}
          {selected && (
            <div className="flex gap-2 mb-6 border-b border-slate-700/50">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "info"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Thông tin
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "documents"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Giấy tờ ({documents.length})
              </button>
            </div>
          )}

          {activeTab === "info" ? (
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
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Hình ảnh</h3>
                <button
                  type="button"
                  onClick={() => setShowPhotoUpload(true)}
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  + Thêm hình ảnh
                </button>
              </div>

              {photosArray.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {photosArray.map((url: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Vehicle photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.png';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPhotos = photosArray.filter((_, i) => i !== index);
                          setValue("photos", newPhotos);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        title="Xóa hình ảnh"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                  Chưa có hình ảnh. Nhấn "Thêm hình ảnh" để upload.
                </div>
              )}
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
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Quản lý giấy tờ xe</h3>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  + Thêm giấy tờ
                </button>
              </div>

              {documentsLoading ? (
                <div className="text-slate-400 text-center py-8">Đang tải...</div>
              ) : documents.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  Chưa có giấy tờ nào. Nhấn "Thêm giấy tờ" để upload.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => {
                    const docTypeMap: Record<string, string> = {
                      'REGISTRATION': 'Đăng kiểm',
                      'INSURANCE': 'Bảo hiểm',
                      'OWNERSHIP': 'Giấy chủ quyền',
                      'INSPECTION': 'Kiểm định',
                      'OTHER': 'Khác'
                    };
                    
                    const isExpired = doc.expiresAt && new Date(doc.expiresAt) < new Date();
                    
                    // Kiểm tra xem file có phải là hình ảnh không
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                    const isImage = doc.fileUrl && imageExtensions.some(ext => 
                      doc.fileUrl.toLowerCase().includes(ext)
                    );
                    
                    return (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        docTypeMap={docTypeMap}
                        isExpired={isExpired}
                        isImage={isImage}
                        onDelete={() => handleDeleteDocument(doc.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upload Document Modal */}
          {showUploadModal && selected?.id && (
            <DocumentUploadModal
              vehicleId={selected.id}
              onClose={() => setShowUploadModal(false)}
              onSuccess={(newDoc: any) => {
                setDocuments([...documents, newDoc]);
                setShowUploadModal(false);
              }}
            />
          )}

          {/* Upload Photo Modal */}
          {showPhotoUpload && (
            <PhotoUploadModal
              onClose={() => setShowPhotoUpload(false)}
              onSuccess={(newUrls: string[]) => {
                const currentPhotos = photosArray;
                const updatedPhotos = [...currentPhotos, ...newUrls];
                setValue("photos", updatedPhotos);
                setShowPhotoUpload(false);
              }}
              uploading={uploadingPhotos}
              setUploading={setUploadingPhotos}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Document Upload Modal Component
function DocumentUploadModal({ vehicleId, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    docType: 'REGISTRATION',
    description: '',
    file: null as File | null,
    issuedAt: '',
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, file });
    }
  };

  const handleSubmit = async () => {
    if (!form.file) {
      alert('Vui lòng chọn file để upload');
      return;
    }

    setLoading(true);
    setUploading(true);
    try {
      // Upload file lên Cloudinary
      const uploadResult = await uploadService.uploadFile(form.file);
      setUploading(false);

      // Tạo document với URL từ Cloudinary
      const data = {
        vehicleId,
        docType: form.docType,
        description: form.description || undefined,
        fileUrl: uploadResult.url,
        issuedAt: form.issuedAt || undefined,
        expiresAt: form.expiresAt || undefined,
      };
      const result = await documentService.create(data);
      onSuccess(result);
    } catch (err: any) {
      setUploading(false);
      alert(err?.message || 'Upload thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Thêm giấy tờ</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Loại giấy tờ *</label>
            <select
              value={form.docType}
              onChange={(e) => setForm({ ...form, docType: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg"
            >
              <option value="REGISTRATION">Đăng kiểm</option>
              <option value="INSURANCE">Bảo hiểm</option>
              <option value="OWNERSHIP">Giấy chủ quyền</option>
              <option value="INSPECTION">Kiểm định</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">File *</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              required
            />
            {form.file && (
              <p className="text-xs text-slate-400 mt-2">
                Đã chọn: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {uploading && (
              <p className="text-xs text-blue-400 mt-2">Đang upload file lên Cloudinary...</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Ngày cấp</label>
              <input
                type="date"
                value={form.issuedAt}
                onChange={(e) => setForm({ ...form, issuedAt: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Ngày hết hạn</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Photo Upload Modal Component
function PhotoUploadModal({ onClose, onSuccess, uploading, setUploading }: any) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Filter only image files
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    setFiles(imageFiles);
    
    // Create previews
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    // Revoke object URLs to free memory
    URL.revokeObjectURL(previews[index]);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert('Vui lòng chọn ít nhất một hình ảnh');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadService.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.url);
      
      // Clean up preview URLs
      previews.forEach(url => URL.revokeObjectURL(url));
      
      onSuccess(urls);
    } catch (err: any) {
      alert(err?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">Thêm hình ảnh</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Chọn hình ảnh *</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <p className="text-xs text-slate-500 mt-2">
              Có thể chọn nhiều hình ảnh cùng lúc
            </p>
          </div>

          {previews.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Xem trước</label>
              <div className="grid grid-cols-3 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      title="Xóa"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="text-center py-4">
              <p className="text-blue-400">Đang upload {files.length} hình ảnh lên Cloudinary...</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading || files.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {uploading ? 'Đang upload...' : `Upload ${files.length} hình`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Document Card Component với preview hình ảnh
function DocumentCard({ doc, docTypeMap, isExpired, isImage, onDelete }: any) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`p-4 rounded-xl border ${
        isExpired 
          ? 'border-red-500/50 bg-red-900/20' 
          : 'border-slate-700 bg-slate-800/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white">
          {docTypeMap[doc.docType] || doc.docType}
        </h4>
        {isExpired && (
          <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
            Hết hạn
          </span>
        )}
      </div>
      
      {doc.description && (
        <p className="text-sm text-slate-300 mb-2">{doc.description}</p>
      )}
      
      {doc.expiresAt && (
        <p className={`text-xs mb-1 ${isExpired ? 'text-red-300' : 'text-slate-400'}`}>
          Hết hạn: {new Date(doc.expiresAt).toLocaleDateString('vi-VN')}
        </p>
      )}
      
      {doc.fileUrl && (
        <div className="mb-2">
          {isImage && !imageError ? (
            <div className="space-y-2">
              <img
                src={doc.fileUrl}
                alt={docTypeMap[doc.docType] || 'Giấy tờ'}
                className="w-full h-32 object-cover rounded-lg border border-slate-600 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(doc.fileUrl, '_blank')}
                onError={() => setImageError(true)}
              />
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline block"
              >
                Xem tài liệu đầy đủ →
              </a>
            </div>
          ) : (
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline block"
            >
              Xem tài liệu →
            </a>
          )}
        </div>
      )}
      
      <button
        type="button"
        onClick={onDelete}
        className="mt-2 px-3 py-1 text-xs bg-red-600/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-600/30"
      >
        Xóa
      </button>
    </div>
  );
}
