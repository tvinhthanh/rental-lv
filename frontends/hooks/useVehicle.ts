import { useQuery } from "@tanstack/react-query";
import { vehicleService } from "@/services/vehicle.service";

export function useVehicles() {
    return useQuery({
        queryKey: ["vehicles"],
        queryFn: () => vehicleService.getAll(),
    });
}
