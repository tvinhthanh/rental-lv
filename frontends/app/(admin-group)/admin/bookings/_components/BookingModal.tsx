"use client";

import { useEffect, useState } from "react";
import { rentalProcessService } from "@/services/rental-process.service";
import { depositService } from "@/services/deposit.service";
import { billingService } from "@/services/billing.service";
import { translateStatus } from "@/lib/utils";

export default function AdminBookingModal({ booking, onClose }: any) {
    const [checking, setChecking] = useState(true);
    const [hasContract, setHasContract] = useState<boolean | null>(null);
    const [hasDeposit, setHasDeposit] = useState<boolean | null>(null);
    const [hasHandover, setHasHandover] = useState<boolean | null>(null);
    const [hasReturnReport, setHasReturnReport] = useState<boolean | null>(null);
    const [hasInvoice, setHasInvoice] = useState<boolean | null>(null);
    const [invoiceStatus, setInvoiceStatus] = useState<string | null>(null);
    const [hasPayment, setHasPayment] = useState<boolean | null>(null);

    useEffect(() => {
        if (!booking?.id) return;

        async function checkRelations() {
            setChecking(true);
            try {
                // Contract
                try {
                    await rentalProcessService.contract(booking.id);
                    setHasContract(true);
                } catch (e: any) {
                    setHasContract(false);
                }

                // Deposit
                try {
                    await depositService.get(booking.id);
                    setHasDeposit(true);
                } catch (e: any) {
                    setHasDeposit(false);
                }

                // Handover
                try {
                    await rentalProcessService.handover(booking.id);
                    setHasHandover(true);
                } catch (e: any) {
                    setHasHandover(false);
                }

                // Return report
                try {
                    await rentalProcessService.returnReport(booking.id);
                    setHasReturnReport(true);
                } catch (e: any) {
                    setHasReturnReport(false);
                }

                // Invoice & Payment (check từ booking object hoặc load từ API)
                let invoiceId: string | null = null;
                
                // Kiểm tra invoice từ booking object
                if (booking?.invoice) {
                    invoiceId = booking.invoice.id;
                    setHasInvoice(true);
                    setInvoiceStatus(booking.invoice.status || null);
                } else {
                    // Nếu không có trong booking object, thử load invoice từ API
                    try {
                        const invoicesRes = await billingService.invoices();
                        const invoices = Array.isArray(invoicesRes) ? invoicesRes : (invoicesRes?.items || []);
                        const invoiceForBooking = invoices.find((inv: any) => inv.bookingId === booking.id);
                        if (invoiceForBooking) {
                            invoiceId = invoiceForBooking.id;
                            setHasInvoice(true);
                            setInvoiceStatus(invoiceForBooking.status || null);
                        } else {
                            setHasInvoice(false);
                            setInvoiceStatus(null);
                        }
                    } catch (e: any) {
                        console.error("Load invoices failed", e);
                        setHasInvoice(false);
                        setInvoiceStatus(null);
                    }
                }

                // Check payments nếu có invoice
                if (invoiceId) {
                    try {
                        const paymentsRes = await billingService.payments(invoiceId);
                        const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : 
                                       (Array.isArray(paymentsRes) ? paymentsRes : []);
                        setHasPayment(payments.length > 0);
                    } catch (e: any) {
                        console.error("Load payments failed", e);
                        setHasPayment(false);
                    }
                } else {
                    setHasPayment(false);
                }
            } finally {
                setChecking(false);
            }
        }

        checkRelations();
    }, [booking?.id, booking?.invoice]);

    if (!booking) return null;

    const customer = booking.customer;
    const vehicle = booking.vehicle;
    const branch = booking.branch ?? vehicle?.branch;

    const renderStatus = (flag: boolean | null) => {
        if (flag === null) return "Đang kiểm tra...";
        return flag ? "ĐÃ TẠO" : "CHƯA TẠO";
    };

    const statusColor = (flag: boolean | null) =>
        flag ? "text-emerald-400" : flag === false ? "text-slate-400" : "text-blue-300";

    const getStatusText = (status: string | null | undefined) => {
        if (!status) return "Đang chờ xử lý";
        switch (status) {
            case "PENDING":
                return "Đang chờ xử lý";
            case "CONTRACTED":
                return "Đã có hợp đồng";
            case "ONGOING":
                return "Đang thuê xe";
            case "COMPLETED":
                return "Hoàn thành";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return status;
        }
    };

    // Xác định trạng thái hiện tại dựa trên các bước trong quy trình
    const getCurrentProcessStatus = () => {
        // Nếu đang kiểm tra, hiển thị đang kiểm tra
        if (checking) {
            return { text: "Đang kiểm tra...", color: "text-blue-300" };
        }

        // Nếu đã thanh toán → Hoàn thành
        if (hasPayment === true) {
            return { text: "Hoàn thành", color: "text-emerald-400" };
        }

        // Nếu có Invoice nhưng chưa thanh toán → Đang xử lý ở bước Payment
        if (hasInvoice === true && hasPayment === false) {
            return { text: "Đang xử lý ở bước Thanh toán", color: "text-yellow-400" };
        }

        // Nếu có Return Report nhưng chưa có Invoice → Đang xử lý ở bước Invoice
        if (hasReturnReport === true && hasInvoice === false) {
            return { text: "Đang xử lý ở bước Hóa đơn", color: "text-yellow-400" };
        }

        // Nếu có Handover nhưng chưa có Return Report → Đang xử lý ở bước Return Report
        if (hasHandover === true && hasReturnReport === false) {
            return { text: "Đang xử lý ở bước Nhận xe", color: "text-yellow-400" };
        }

        // Nếu có Deposit nhưng chưa có Handover → Đang xử lý ở bước Handover
        if (hasDeposit === true && hasHandover === false) {
            return { text: "Đang xử lý ở bước Bàn giao xe", color: "text-yellow-400" };
        }

        // Nếu có Contract nhưng chưa có Deposit → Đang xử lý ở bước Deposits
        if (hasContract === true && hasDeposit === false) {
            return { text: "Đang xử lý ở bước Đặt cọc", color: "text-yellow-400" };
        }

        // Nếu chưa có Contract → Đang chờ xử lý
        if (hasContract === false) {
            return { text: "Đang chờ xử lý", color: "text-slate-400" };
        }

        // Mặc định
        return { text: "Đang chờ xử lý", color: "text-slate-400" };
    };

    const currentStatus = getCurrentProcessStatus();

    return (
        <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm">
            <div className="m-auto max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Booking #{booking.bookingCode}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Xem chi tiết đơn đặt và trạng thái các bước trong quy trình thuê xe.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                    {/* Left: customer & vehicle */}
                    <div className="space-y-4 md:col-span-2">
                        {/* Customer */}
                        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                            <h3 className="text-sm font-semibold text-blue-300">
                                Thông tin khách hàng
                            </h3>
                            <div className="mt-2 space-y-1 text-sm text-slate-200">
                                <p>
                                    <b>Họ tên:</b> {customer?.fullName || "—"}
                                </p>
                                <p>
                                    <b>Điện thoại:</b> {customer?.phone || "—"}
                                </p>
                                <p>
                                    <b>Email:</b> {customer?.email || "—"}
                                </p>
                                <p>
                                    <b>Địa chỉ:</b> {customer?.address || "—"}
                                </p>
                            </div>
                        </section>

                        {/* Vehicle */}
                        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                            <h3 className="text-sm font-semibold text-blue-300">
                                Thông tin xe & chi nhánh
                            </h3>
                            <div className="mt-2 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p>
                                        <b>Tên xe:</b> {vehicle?.name}
                                    </p>
                                    <p>
                                        <b>Biển số:</b> {vehicle?.licensePlate}
                                    </p>
                                    <p>
                                        <b>Loại xe:</b> {vehicle?.vehicleType}
                                    </p>
                                    <p>
                                        <b>Màu:</b> {vehicle?.color}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p>
                                        <b>Chi nhánh:</b> {branch?.name}
                                    </p>
                                    <p>
                                        <b>Địa chỉ:</b> {branch?.address}
                                    </p>
                                    <p>
                                        <b>Điện thoại:</b> {branch?.phone}
                                    </p>
                                    <p>
                                        <b>Giờ làm việc:</b> {branch?.businessHours}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Dates & amount */}
                        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                            <h3 className="text-sm font-semibold text-blue-300">
                                Thời gian & thanh toán
                            </h3>
                            <div className="mt-2 grid gap-3 text-sm md:grid-cols-2">
                                <div className="space-y-1 text-slate-200">
                                    <p>
                                        <b>Ngày nhận xe:</b>{" "}
                                        {new Date(booking.pickupDate).toLocaleDateString("vi-VN")}
                                    </p>
                                    <p>
                                        <b>Ngày trả xe:</b>{" "}
                                        {new Date(booking.returnDate).toLocaleDateString("vi-VN")}
                                    </p>
                                    <p>
                                        <b>Trạng thái:</b> {translateStatus(booking.status, 'booking')}
                                    </p>
                                </div>
                                <div className="space-y-1 text-slate-200">
                                    <p>
                                        <b>Giá gốc:</b>{" "}
                                        {booking.baseAmount?.toLocaleString("vi-VN")} đ
                                    </p>
                                    <p>
                                        <b>Giảm giá:</b>{" "}
                                        {booking.discountAmount?.toLocaleString("vi-VN")} đ
                                    </p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        Tổng: {booking.totalAmount?.toLocaleString("vi-VN")} đ
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: process status */}
                    <div className="space-y-4">
                        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                            <h3 className="text-sm font-semibold text-purple-300">
                                Trạng thái quy trình
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                                Kiểm tra nhanh các bước đã được tạo cho booking này.
                            </p>

                            {/* Booking Status Overview */}
                            <div className="mb-4 rounded-lg bg-gradient-to-r from-blue-900/30 to-purple-900/30 px-3 py-2 border border-blue-500/20">
                                <p className="text-xs text-slate-400">Trạng thái hiện tại</p>
                                <p className={`text-lg font-bold mt-1 ${currentStatus.color}`}>
                                    {currentStatus.text}
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                    <div className={`h-2 w-2 rounded-full ${
                                        currentStatus.text === "Hoàn thành" ? "bg-emerald-400" :
                                        currentStatus.text.includes("Đang xử lý") ? "bg-yellow-400" :
                                        currentStatus.text === "Đang chờ xử lý" ? "bg-slate-400" :
                                        currentStatus.text === "Đang kiểm tra..." ? "bg-blue-400" :
                                        "bg-slate-500"
                                    }`}></div>
                                    <span>
                                        {currentStatus.text}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 space-y-2 text-sm">
                                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2">
                                    <span>1. Hợp đồng</span>
                                    <span className={statusColor(hasContract)}>
                                        {renderStatus(hasContract)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2">
                                    <span>2. Đặt cọc</span>
                                    <span className={statusColor(hasDeposit)}>
                                        {renderStatus(hasDeposit)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2">
                                    <span>3. Bàn giao xe</span>
                                    <span className={statusColor(hasHandover)}>
                                        {renderStatus(hasHandover)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2">
                                    <span>4. Nhận xe trả</span>
                                    <span className={statusColor(hasReturnReport)}>
                                        {renderStatus(hasReturnReport)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2">
                                    <span>5. Hóa đơn</span>
                                    <span className={statusColor(hasInvoice)}>
                                        {renderStatus(hasInvoice)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2">
                                    <span>6. Thanh toán</span>
                                    <span className={statusColor(hasPayment)}>
                                        {hasPayment === null ? "CHƯA TẠO" : hasPayment ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                                    </span>
                                </div>
                            </div>

                            {checking && (
                                <p className="mt-3 text-center text-[11px] text-slate-500">
                                    Đang kiểm tra dữ liệu liên quan...
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}


