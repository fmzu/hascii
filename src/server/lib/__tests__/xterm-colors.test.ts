import { expect, it } from "bun:test"
import { xtermColors } from "../xterm-colors"

it("256色分の配列である", () => {
  expect(xtermColors.length).toBe(256)
})

it("各要素は#で始まるhex色文字列", () => {
  for (const color of xtermColors) {
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
  }
})

it("インデックス0は黒", () => {
  expect(xtermColors[0]).toBe("#000000")
})
