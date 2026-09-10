import { it, expect } from "bun:test"
import { toDotsFromString } from "../to-dots-from-string"
import type { DotCell } from "~/types/dot-cell"

it("should convert a string to a dot grid correctly", () => {
  const input = "1-2-3-4"
  const expected: DotCell[][] = [
    [{ color: 1 }, { color: 2 }],
    [{ color: 3 }, { color: 4 }],
  ]
  expect(toDotsFromString(input)).toEqual(expected)
})

it("should handle empty string input", () => {
  const fn = () => toDotsFromString("")
  expect(fn).toThrowError()
})

it("should handle non-numeric values in the string", () => {
  const input = "1-a-3-4"
  const expected: DotCell[][] = [
    [{ color: 1 }, { color: null }],
    [{ color: 3 }, { color: 4 }],
  ]
  expect(toDotsFromString(input)).toEqual(expected)
})

it("should handle single value input", () => {
  const input = "5"
  const expected: DotCell[][] = [[{ color: 5 }]]
  expect(toDotsFromString(input)).toEqual(expected)
})

it("should handle input with null values", () => {
  const input = "1--3-4"
  const expected: DotCell[][] = [
    [{ color: 1 }, { color: null }],
    [{ color: 3 }, { color: 4 }],
  ]
  expect(toDotsFromString(input)).toEqual(expected)
})
