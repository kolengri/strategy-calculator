import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CurrencyCode } from "@/utils/currencies";

const CURRENCY_STORE_KEY = "currency-store" as const;

type CurrencyStore = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
};

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: "USD",
      setCurrency: (currency) => set({ currency }),
    }),
    { name: CURRENCY_STORE_KEY }
  )
);
