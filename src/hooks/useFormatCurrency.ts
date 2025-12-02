import { useCallback } from "react";
import { useCurrencyStore } from "@/stores/currency";
import { formatCurrency } from "@/utils/currencies";

/**
 * Hook that returns a memoized currency formatter using the current currency from store
 * @returns A function to format numbers as currency
 */
export function useFormatCurrency() {
  const { currency } = useCurrencyStore();

  return useCallback(
    (value: number) => formatCurrency(value, currency),
    [currency]
  );
}
