"use client";

import { useProfile } from "@/hooks/auth/user-profile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useFormatDate } from "@/hooks/useFormatDate";

export default function ProfilePage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const { format } = useFormatDate();

    // Lấy customer hoặc employee
    const { profile, isLoading: profileLoading } = useProfile();

    if (userLoading || profileLoading) {
        return <div className="p-4 text-gray-400">Đang tải thông tin...</div>;
    }

    return (
        <div className="p-4 text-gray-200">
            <h1 className="text-2xl font-bold mb-4">Thông tin cá nhân</h1>

            <div className="bg-gray-800/40 p-4 rounded-xl w-full max-w-xl space-y-2">
                {/* USER */}
                <h2 className="text-lg font-semibold mb-2 text-cyan-300">Tài khoản</h2>
                <p><b>Email:</b> {user?.email}</p>
                <p><b>Tên đăng nhập:</b> {user?.name ?? "—"}</p>
                <p><b>Vai trò:</b> {user?.role}</p>
                <p><b>Ngày tạo:</b> {format(user?.createdAt)}</p>

                {user.role !== "ADMIN" && (
                    <>
                        <hr className="my-3 border-gray-600" />

                        {/* CUSTOMER / EMPLOYEE */}
                        <h2 className="text-lg font-semibold mb-2 text-indigo-300">
                            {user.role === "CUSTOMER" ? "Hồ sơ khách hàng" : "Thông tin nhân viên"}
                        </h2>

                        <p><b>Họ tên:</b> {profile?.fullName ?? "—"}</p>
                        <p><b>Số điện thoại:</b> {profile?.phone ?? "—"}</p>
                        <p><b>Giới tính:</b> {profile?.gender ?? "—"}</p>
                        <p><b>Địa chỉ:</b> {profile?.address ?? "—"}</p>
                        <p><b>Ngày sinh:</b> {format(profile?.dateOfBirth)}</p>

                        {user.role === "CUSTOMER" && (
                            <>
                                <hr className="my-3 border-gray-600" />
                                <h2 className="text-lg font-semibold mb-2 text-purple-300">
                                    Giấy tờ tuỳ thân
                                </h2>
                                <p><b>CMND/CCCD:</b> {profile?.nationalId ?? "—"}</p>
                                <p><b>Quốc tịch:</b> {profile?.nationality ?? "—"}</p>
                                <p><b>Số GPLX:</b> {profile?.driverLicenseNo ?? "—"}</p>
                                <p><b>GPLX hết hạn:</b> {format(profile?.driverLicenseExpiry)}</p>
                            </>
                        )}

                        <hr className="my-3 border-gray-600" />

                        <p>
                            <b>Ảnh đại diện:</b>{" "}
                            {profile?.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt="avatar"
                                    className="w-24 h-24 rounded-full mt-2 border"
                                />
                            ) : (
                                "—"
                            )}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
