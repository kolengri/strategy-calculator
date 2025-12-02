/**
 * Type guard to check if an array has only one element
 * @param elements - The array to check
 * @returns True if the array has only one element, false otherwise
 */
export function isOnlyOneElement<T>(elements: readonly T[]): boolean {
  return elements.length === 1;
}
