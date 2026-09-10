import { it, expect } from "bun:test"
import { resolveCallbackUrl } from "../resolve-callback-url"

it("null はフォールバックを返す", () => {
  expect(resolveCallbackUrl(null)).toBe("/")
})

it("アプリ内の相対パスはそのまま返す", () => {
  expect(resolveCallbackUrl("/dot/1-2-3-4")).toBe("/dot/1-2-3-4")
})

it("プロトコル相対URLはフォールバック", () => {
  expect(resolveCallbackUrl("//evil.com")).toBe("/")
})

it("絶対URLはフォールバック", () => {
  expect(resolveCallbackUrl("https://evil.com")).toBe("/")
})

it("バックスラッシュ始まりはフォールバック", () => {
  expect(resolveCallbackUrl("/\\evil.com")).toBe("/")
})

it("スキームを含む値はフォールバック", () => {
  expect(resolveCallbackUrl("javascript:alert(1)")).toBe("/")
})

it("フォールバックは差し替えできる", () => {
  expect(resolveCallbackUrl(null, "/dot")).toBe("/dot")
})
