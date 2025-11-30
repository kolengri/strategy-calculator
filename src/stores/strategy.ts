import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { STRATEGY_STORE_KEY } from "./stores";
import { FUNDS } from "@/db/funds";
import { findNextName } from "@/utils/find-next-name";
import i18n from "@/lib/i18n";

export const STRATEGY_TYPES = ["age-based", "goal-based"] as const;
export type StrategyType = (typeof STRATEGY_TYPES)[number];

type StrategyBase = {
  id: string;
  name: string;
  createdAt: Date;
  type: StrategyType;
  currentAge: number;
  initialAmount: number;
  monthlyContribution: number;
  selectedFund: (typeof FUNDS)[number]["id"];
  inflationRate: number;
};

export type AgeBasedStrategy = StrategyBase & {
  type: (typeof STRATEGY_TYPES)[0];
  goalAge: number;
};

export type GoalBasedStrategy = StrategyBase & {
  type: (typeof STRATEGY_TYPES)[1];
  goal: number;
};

export type Strategy = AgeBasedStrategy | GoalBasedStrategy;

type StrategyStore = {
  strategies: Strategy[];
  addStrategy: (strategy: Strategy) => void;
  removeStrategy: (id: string) => void;
  newBlankStrategy: () => void;
  updateStrategy: (strategy: Strategy) => void;
  resetStrategies: () => void;
};

export const useStrategyStore = create<StrategyStore>()(
  persist(
    (set) => ({
      strategies: [
        {
          id: uuidv4(),
          name: i18n.t("home.defaultStrategyName"),
          createdAt: new Date(),
          type: "age-based",
          currentAge: 25,
          inflationRate: 3,
          initialAmount: 100000,
          monthlyContribution: 500,
          selectedFund: FUNDS[0].id,
          goalAge: 65,
        },
      ],
      newBlankStrategy: () =>
        set((state) => {
          return {
            strategies: [
              ...state.strategies,
              {
                id: uuidv4(),
                name: findNextName(
                  state.strategies.map((s) => s.name),
                  i18n.t("home.newStrategy")
                ),
                createdAt: new Date(),
                type: "age-based",
                currentAge: 25,
                inflationRate: 3,
                initialAmount: 100000,
                monthlyContribution: 500,
                selectedFund: FUNDS[0].id,
                goalAge: 65,
              },
            ],
          };
        }),
      addStrategy: (strategy: Strategy) =>
        set((state) => ({ strategies: [...state.strategies, strategy] })),
      removeStrategy: (id: string) =>
        set((state) => ({
          strategies: state.strategies.filter((strategy) => strategy.id !== id),
        })),
      updateStrategy: (strategy: Strategy) =>
        set((state) => ({
          strategies: state.strategies.map((s) =>
            s.id === strategy.id ? strategy : s
          ),
        })),
      resetStrategies: () => set({ strategies: [] }),
    }),
    { name: STRATEGY_STORE_KEY }
  )
);
