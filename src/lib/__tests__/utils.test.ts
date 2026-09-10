import { cn } from "../utils"
import { it, expect } from "bun:test"

it("should merge class names correctly", () => {
  expect(cn("class1", "class2")).toBe("class1 class2")
})

it("should handle conditional class names", () => {
  expect(cn("class1", false && "class2", "class3")).toBe("class1 class3")
})

it("should merge Tailwind classes correctly", () => {
  expect(cn("p-2", "p-4")).toBe("p-4")
})

it("should handle empty inputs", () => {
  expect(cn()).toBe("")
})

it("should handle undefined and null inputs", () => {
  expect(cn("class1", undefined, null, "class2")).toBe("class1 class2")
})
