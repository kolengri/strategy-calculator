export type Fund = {
  id: string;
  name: string;
  description: string;
  yearlyReturn: number;
  /** Annual expense ratio (TER) as decimal, e.g., 0.0003 for 0.03% */
  expenseRatio: number;
};

/**
 * Get a fund by its ID
 */
export function getFundById(id: string): Fund | undefined {
  return FUNDS.find((f) => f.id === id);
}

export const FUNDS = [
  {
    id: "SPX",
    name: "S&P 500",
    description: "S&P 500 Index",
    yearlyReturn: 0.11,
    expenseRatio: 0.0003, // 0.03% - typical for VOO/SPY
  },
  {
    id: "NDX",
    name: "NASDAQ 100",
    description: "NASDAQ 100 Index",
    yearlyReturn: 0.13,
    expenseRatio: 0.002, // 0.20% - typical for QQQ
  },
  {
    id: "DJI",
    name: "Dow Jones",
    description: "Dow Jones Industrial Average",
    yearlyReturn: 0.1,
    expenseRatio: 0.0016, // 0.16% - typical for DIA
  },
  {
    id: "MSCI",
    name: "MSCI World",
    description: "MSCI World Index",
    yearlyReturn: 0.09,
    expenseRatio: 0.002, // 0.20%
  },
  {
    id: "FTSE",
    name: "FTSE 100",
    description: "FTSE 100 Index",
    yearlyReturn: 0.08,
    expenseRatio: 0.0007, // 0.07%
  },
  {
    id: "N225",
    name: "Nikkei 225",
    description: "Nikkei 225 Index",
    yearlyReturn: 0.07,
    expenseRatio: 0.0048, // 0.48%
  },
  {
    id: "DAX",
    name: "DAX",
    description: "DAX Index",
    yearlyReturn: 0.08,
    expenseRatio: 0.0016, // 0.16%
  },
  {
    id: "CAC",
    name: "CAC 40",
    description: "CAC 40 Index",
    yearlyReturn: 0.07,
    expenseRatio: 0.0025, // 0.25%
  },
  {
    id: "ASX",
    name: "ASX 200",
    description: "ASX 200 Index",
    yearlyReturn: 0.09,
    expenseRatio: 0.0007, // 0.07%
  },
  {
    id: "TSX",
    name: "TSX Composite",
    description: "S&P/TSX Composite Index",
    yearlyReturn: 0.08,
    expenseRatio: 0.0006, // 0.06%
  },
  {
    id: "BOND",
    name: "Government Bonds",
    description: "10-Year Government Bonds",
    yearlyReturn: 0.04,
    expenseRatio: 0.0003, // 0.03%
  },
  {
    id: "GOLD",
    name: "Gold",
    description: "Gold ETF",
    yearlyReturn: 0.05,
    expenseRatio: 0.004, // 0.40%
  },
  {
    id: "REIT",
    name: "REIT",
    description: "Real Estate Investment Trust",
    yearlyReturn: 0.1,
    expenseRatio: 0.0012, // 0.12%
  },
  {
    id: "EM",
    name: "Emerging Markets",
    description: "Emerging Markets Index",
    yearlyReturn: 0.12,
    expenseRatio: 0.0011, // 0.11%
  },
  {
    id: "SMALL",
    name: "Small Cap",
    description: "Small Cap Stocks Index",
    yearlyReturn: 0.13,
    expenseRatio: 0.0005, // 0.05%
  },
] as const;
