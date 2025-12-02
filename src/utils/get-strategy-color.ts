/**
 * Generate a unique color for each strategy based on its ID
 * Uses a hash function to generate a consistent color from the ID
 */
export function getStrategyColor(strategyId: string): string {
  let hash = 0;
  for (let i = 0; i < strategyId.length; i++) {
    hash = strategyId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash) % 20); // 60-80% saturation
  const lightness = 45 + (Math.abs(hash) % 15); // 45-60% lightness

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
