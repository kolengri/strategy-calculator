/**
 * Age-related limits and defaults
 */
export const AGE_LIMITS = {
  MIN: 0,
  MAX: 120,
  DEFAULT_GOAL: 65,
  MAX_INVESTMENT_YEARS: 50,
} as const;

/**
 * Calculation limits
 */
export const CALCULATION_LIMITS = {
  MAX_ITERATIONS: 100,
  MAX_YEARS_TO_GOAL: 100,
} as const;
