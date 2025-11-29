import { Metadata } from 'next';
import { vehicleService } from '@/services/vehicle.service';
import { branchService } from '@/services/branch.service';
import { priceListService } from '@/services/price-list.service';
import CarsListClient from './_components/CarsListClient';


export const metadata: Metadata = {
    title: 'Danh sách xe cho thuê'
};

interface SearchParams {
    page?: string;
    search?: string;
    branchId?: string;
    brand?: string;
    priceListId?: string;
    status?: string;
}

interface IProps {
    searchParams: SearchParams;
}

export default async function CarsPage({ searchParams }: IProps) {
    try {
        // Load all data in parallel
        const [vehiclesData, branchesData, priceListsData] = await Promise.all([
            vehicleService.getAll(),
            branchService.getAll(),
            priceListService.getAll(),
        ]);

        // Filter vehicles with photos
        const vehicles = Array.isArray(vehiclesData)
            ? vehiclesData.filter((x: any) => Boolean(x.photos?.length))
            : [];

        const branches = Array.isArray(branchesData) ? branchesData : [];
        const priceLists = Array.isArray(priceListsData) ? priceListsData : [];

        return (
            <CarsListClient
                vehicles={vehicles}
                branches={branches}
                priceLists={priceLists}
                initialFilters={searchParams}
            />
        );
    } catch (error) {
        console.error('Error loading cars data:', error);
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                    Không thể tải dữ liệu. Vui lòng thử lại sau.
                </div>
            </div>
        );
    }
}