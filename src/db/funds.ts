export type Fund = {
  id: string;
  name: string;
  description: string;
  yearlyReturn: number;
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
  },
  {
    id: "NDX",
    name: "NASDAQ 100",
    description: "NASDAQ 100 Index",
    yearlyReturn: 0.13,
  },
  {
    id: "DJI",
    name: "Dow Jones",
    description: "Dow Jones Industrial Average",
    yearlyReturn: 0.1,
  },
  {
    id: "MSCI",
    name: "MSCI World",
    description: "MSCI World Index",
    yearlyReturn: 0.09,
  },
  {
    id: "FTSE",
    name: "FTSE 100",
    description: "FTSE 100 Index",
    yearlyReturn: 0.08,
  },
  {
    id: "N225",
    name: "Nikkei 225",
    description: "Nikkei 225 Index",
    yearlyReturn: 0.07,
  },
  {
    id: "DAX",
    name: "DAX",
    description: "DAX Index",
    yearlyReturn: 0.08,
  },
  {
    id: "CAC",
    name: "CAC 40",
    description: "CAC 40 Index",
    yearlyReturn: 0.07,
  },
  {
    id: "ASX",
    name: "ASX 200",
    description: "ASX 200 Index",
    yearlyReturn: 0.09,
  },
  {
    id: "TSX",
    name: "TSX Composite",
    description: "S&P/TSX Composite Index",
    yearlyReturn: 0.08,
  },
  {
    id: "BOND",
    name: "Government Bonds",
    description: "10-Year Government Bonds",
    yearlyReturn: 0.04,
  },
  {
    id: "GOLD",
    name: "Gold",
    description: "Gold ETF",
    yearlyReturn: 0.05,
  },
  {
    id: "REIT",
    name: "REIT",
    description: "Real Estate Investment Trust",
    yearlyReturn: 0.1,
  },
  {
    id: "EM",
    name: "Emerging Markets",
    description: "Emerging Markets Index",
    yearlyReturn: 0.12,
  },
  {
    id: "SMALL",
    name: "Small Cap",
    description: "Small Cap Stocks Index",
    yearlyReturn: 0.13,
  },
] as const;
