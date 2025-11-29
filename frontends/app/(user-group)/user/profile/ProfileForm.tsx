"use client";

import { useEffect, useState } from "react";
import { customerService } from "@/services/customer.service";
import { toast } from "sonner";

export default function ProfileForm() {
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState<any>({});

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const res = await customerService.get(customer.userId);
        setCustomer(res);
        setLoading(false);
    };

    const handleChange = (e: any) => {
        setCustomer({
            ...customer,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        await customerService.update(customer.id, customer);
        toast.success("Profile updated!");
        load();
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="space-y-4 bg-white p-6 shadow rounded">
            <div>
                <label className="font-medium">Full Name</label>
                <input
                    name="fullName"
                    value={customer.fullName || ""}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                />
            </div>

            <div>
                <label className="font-medium">Phone</label>
                <input
                    name="phone"
                    value={customer.phone || ""}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                />
            </div>

            <div>
                <label className="font-medium">Address</label>
                <input
                    name="address"
                    value={customer.address || ""}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
