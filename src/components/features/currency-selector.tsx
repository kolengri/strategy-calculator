"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCurrencyStore } from "@/stores/currency";
import { CURRENCIES } from "@/utils/currencies";

type CurrencySelectorProps = {
  className?: string;
};

export const CurrencySelector = ({ className }: CurrencySelectorProps) => {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <Select onValueChange={setCurrency} value={currency}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={currency} />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            {curr.code} - {curr.symbol}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
