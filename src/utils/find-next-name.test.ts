import { test, expect } from "bun:test";
import { findNextName } from "./find-next-name";

test("should return first name when array is empty", () => {
  const result = findNextName([], "Item");
  expect(result).toBe("Item 1");
});

test("should return next sequential name when all previous exist", () => {
  const result = findNextName(["Item 1", "Item 2"], "Item");
  expect(result).toBe("Item 3");
});

test("should return next number after max when gap exists", () => {
  const result = findNextName(["Item 1", "Item 3"], "Item");
  expect(result).toBe("Item 4");
});

test("should return next number after max when gap in middle", () => {
  const result = findNextName(["Item 1", "Item 2", "Item 4", "Item 5"], "Item");
  expect(result).toBe("Item 6");
});

test("should return next number after max with multiple gaps", () => {
  const result = findNextName(["Item 1", "Item 3", "Item 5"], "Item");
  expect(result).toBe("Item 6");
});

test("should work with different prefixes", () => {
  const result = findNextName(["Task 1", "Task 2"], "Task");
  expect(result).toBe("Task 3");
});

test("should handle names with different prefixes", () => {
  const result = findNextName(["Item 1", "Task 1", "Item 2"], "Item");
  expect(result).toBe("Item 3");
});

test("should handle names without matching prefix", () => {
  const result = findNextName(["Task 1", "Task 5", "Task 10"], "Item");
  expect(result).toBe("Item 11");
});

test("should return next number when all numbers up to length are taken", () => {
  const result = findNextName(["Item 1", "Item 2", "Item 3"], "Item");
  expect(result).toBe("Item 4");
});

test("should handle large arrays efficiently", () => {
  const names = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
  const result = findNextName(names, "Item");
  expect(result).toBe("Item 101");
});

test("should handle arrays with gaps at the end", () => {
  const names = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);
  // Remove Item 25 to create a gap
  names.splice(24, 1);
  const result = findNextName(names, "Item");
  expect(result).toBe("Item 51");
});

test("should handle empty prefix", () => {
  const result = findNextName([" 1", " 2"], "");
  expect(result).toBe(" 3");
});

test("should handle prefix with spaces", () => {
  const result = findNextName(["My Item 1", "My Item 2"], "My Item");
  expect(result).toBe("My Item 3");
});

test("should be case sensitive", () => {
  const result = findNextName(["item 1", "ITEM 2"], "item");
  expect(result).toBe("item 3");
});
