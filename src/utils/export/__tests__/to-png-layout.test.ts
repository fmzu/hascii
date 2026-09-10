import { it, expect } from "bun:test"
import { toPngLayout } from "../to-png-layout"
import type { EditorCell } from "~/types/editor-cell"

const colors = new Map<string, string>([
  ["00", "#111111"],
  ["01", "#222222"],
])

it("グリッドサイズ×scale の寸法を返す", () => {
  const grid: EditorCell[][] = [
    [{ color: null }, { color: null }],
    [{ color: null }, { color: null }],
  ]
  const layout = toPngLayout(grid, colors, 16)
  expect(layout.width).toBe(32)
  expect(layout.height).toBe(32)
})

it("色つきセルだけを rect にする", () => {
  const grid: EditorCell[][] = [
    [{ color: "00" }, { color: null }],
    [{ color: null }, { color: "01" }],
  ]
  const layout = toPngLayout(grid, colors, 16)
  expect(layout.rects).toEqual([
    { x: 0, y: 0, size: 16, color: "#111111" },
    { x: 16, y: 16, size: 16, color: "#222222" },
  ])
})

it("色マップに無い色は無視する", () => {
  const grid: EditorCell[][] = [[{ color: "ZZ" }]]
  const layout = toPngLayout(grid, colors, 16)
  expect(layout.rects).toEqual([])
})

it("全セル null なら rects は空", () => {
  const grid: EditorCell[][] = [[{ color: null }]]
  const layout = toPngLayout(grid, colors, 8)
  expect(layout.rects).toEqual([])
  expect(layout.width).toBe(8)
})
