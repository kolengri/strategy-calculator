import { create } from "zustand";

type StrategyType = "age-based" | "goal-based";

type StrategyBase = {
  id: string;
  name: string;
  createdAt: Date;
  type: StrategyType;
};

export type AgeBasedStrategy = StrategyBase & {
  type: "age-based";
  age: number;
};

export type GoalBasedStrategy = StrategyBase & {
  type: "goal-based";
  goal: number;
};

export type Strategy = AgeBasedStrategy | GoalBasedStrategy;

type StrategyStore = {
  strategies: Strategy[];
  addStrategy: (strategy: Strategy) => void;
  removeStrategy: (id: string) => void;
  updateStrategy: (id: string, strategy: Strategy) => void;
  resetStrategies: () => void;
};

export const useStrategyStore = create<StrategyStore>((set) => ({
  strategies: [],
  addStrategy: (strategy: Strategy) =>
    set((state) => ({ strategies: [...state.strategies, strategy] })),
  removeStrategy: (id: string) =>
    set((state) => ({
      strategies: state.strategies.filter((strategy) => strategy.id !== id),
    })),
  updateStrategy: (id: string, strategy: Strategy) =>
    set((state) => ({
      strategies: state.strategies.map((s) => (s.id === id ? strategy : s)),
    })),
  resetStrategies: () => set({ strategies: [] }),
}));
