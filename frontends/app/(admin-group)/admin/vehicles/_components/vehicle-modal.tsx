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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 p-6 w-[520px] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">{selected ? "Edit Vehicle" : "Add Vehicle"}</h2>

        <form onSubmit={formHandle(onSubmit)} className="space-y-3">
          {/* BASIC INFO */}
          <div className="grid grid-cols-2 gap-3">
            <input
              {...register("name")}
              className="input-dark focus:bg-white focus:text-black"
              placeholder="Name *"
              required
              onBlur={(e) => {
                if (!selected) setValue("slug", generateSlug(e.target.value));
              }}
            />
            <input {...register("slug")} className="input-dark focus:bg-white focus:text-black" placeholder="Slug" readOnly={!!selected} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input {...register("vehicleType")} className="input-dark focus:bg-white focus:text-black" placeholder="Type (SUV, Sedan...)" />
            <input {...register("licensePlate")} className="input-dark focus:bg-white focus:text-black" placeholder="License plate *" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input {...register("model")} className="input-dark focus:bg-white focus:text-black" placeholder="Model" />
            <input type="number" {...register("year")} className="input-dark focus:bg-white focus:text-black" placeholder="Year" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <input {...register("color")} className="input-dark focus:bg-white focus:text-black" placeholder="Color" />
            <input type="number" {...register("seatCount")} className="input-dark focus:bg-white focus:text-black" placeholder="Seats" />
            <input type="number" {...register("mileage")} className="input-dark focus:bg-white focus:text-black" placeholder="Mileage (km)" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <input {...register("transmission")} className="input-dark focus:bg-white focus:text-black" placeholder="Transmission (AT/MT)" />
            <input {...register("fuelType")} className="input-dark focus:bg-white focus:text-black" placeholder="Fuel (Gasoline/Diesel)" />
            <select {...register("status")} className="input-dark bg-slate-800 focus:bg-white focus:text-black">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* RELATIONS */}
          <div className="grid grid-cols-3 gap-3">
            <select {...register("brandId")} className="input-dark bg-slate-800 focus:bg-white focus:text-black" required>
              <option value="">Select brand</option>
              {brands.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select {...register("branchId")} className="input-dark bg-slate-800 focus:bg-white focus:text-black" required>
              <option value="">Select branch</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select {...register("categoryId")} className="input-dark bg-slate-800 focus:bg-white focus:text-black" required>
              <option value="">Select category</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* PRICING */}
          <div className="mt-4 rounded border border-slate-700 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Pricing Configuration</h3>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                {...register("overridePriceEnabled")}
                onChange={(e) => {
                  setValue("overridePriceEnabled", e.target.checked);
                  if (e.target.checked) setValue("priceListId", "");
                }}
              />
              <span className="text-sm">Override price (custom pricing for this vehicle)</span>
            </label>

            {!overridePriceEnabled ? (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Price List</label>
                <select {...register("priceListId")} className="input-dark bg-slate-800 w-full focus:bg-white focus:text-black">
                  <option value="">Select price list</option>
                  {priceLists.map((pl: any) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} - Daily: VND{pl.dailyRate || 0} | Hourly: VND{pl.hourlyRate || 0}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a price list to use standard rates, or enable override for custom pricing
                </p>
              </div>
            ) : (
              <div className="space-y-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Daily Rate (VND)</label>
                  <input type="number" step="0.01" {...register("overrideDailyRate")} className="input-dark w-full" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Hourly Rate (VND)</label>
                  <input type="number" step="0.01" {...register("overrideHourlyRate")} className="input-dark w-full" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Weekend Rate (VND)</label>
                  <input type="number" step="0.01" {...register("overrideWeekendRate")} className="input-dark w-full" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Holiday Rate (VND)</label>
                  <input type="number" step="0.01" {...register("overrideHolidayRate")} className="input-dark w-full" placeholder="0.00" />
                </div>
              </div>
            )}
          </div>

          {/* PHOTOS */}
          <textarea
            {...register("photos")}
            className="input-dark focus:bg-white focus:text-black"
            placeholder="Photo URLs, separated by comma"
            defaultValue={photosValue}
          />

          {/* SEO */}
          <input {...register("metaTitle")} className="input-dark focus:bg-white focus:text-black" placeholder="Meta title" />
          <textarea {...register("metaDescription")} className="input-dark focus:bg-white focus:text-black" placeholder="Meta description" />
          <textarea {...register("seoDescription")} className="input-dark focus:bg-white focus:text-black" placeholder="SEO description" />

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-600 text-gray-300 rounded hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50">
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
