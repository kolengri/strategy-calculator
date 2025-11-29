/**
 * Finds the next available name with the given prefix.
 *
 * This function generates a name in the format "{prefix} {number}" and returns
 * the first available name that is not already in the provided names array.
 * It searches sequentially from 1 to names.length, and if all numbers are taken,
 * it returns the next number (names.length + 1).
 *
 * @param names - Array of existing names to check against
 * @param prefix - The prefix to use for the generated name
 * @returns The next available name in the format "{prefix} {number}"
 *
 * @example
 * ```ts
 * findNextName(["Item 1", "Item 2"], "Item")
 * // Returns: "Item 3"
 *
 * findNextName(["Item 1", "Item 3"], "Item")
 * // Returns: "Item 4"
 *
 * findNextName([], "Item")
 * // Returns: "Item 1"
 * ```
 */
export function findNextName(names: string[], prefix: string) {
  const lastNumber = names.reduce((max, name) => {
    const number = parseInt(name.match(/\d+/)?.[0] ?? "0");
    return Math.max(max, number);
  }, 0);
  return `${prefix} ${lastNumber + 1}`;
}
