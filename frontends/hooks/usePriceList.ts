import { useQuery } from "@tanstack/react-query";
import { priceListService } from "@/services/price-list.service";

export function usePriceLists(keyword: string = "") {
    const { data } = useQuery({
        queryKey: ["price-lists", keyword],
        queryFn: () => priceListService.getAll(keyword),
    });

    return data;
}
