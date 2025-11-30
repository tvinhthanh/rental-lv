import { useQuery } from "@tanstack/react-query";
import { priceListService } from "@/services/price-list.service";

export function usePriceLists() {
    const { data } = useQuery({
        queryKey: ["price-lists"],
        queryFn: () => priceListService.getAll(),
    });

    return data;
}
