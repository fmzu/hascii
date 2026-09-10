import { it, expect } from "bun:test"
import { parseDotStringToColorGrid } from "../parse-dots-to-color-grid"

const palette = ["#000000", "#FF0000", "#00FF00", "#0000FF"]

it("2x2グリッドをパースできる", () => {
  const grid = parseDotStringToColorGrid("0-1-2-3", palette)
  expect(grid).toEqual([
    ["#000000", "#FF0000"],
    ["#00FF00", "#0000FF"],
  ])
})

it("非数値は透明（null）になる", () => {
  const grid = parseDotStringToColorGrid("0---1", palette)
  expect(grid).toEqual([
    ["#000000", null],
    [null, "#FF0000"],
  ])
})

it("パレット範囲外のインデックスはnull", () => {
  const grid = parseDotStringToColorGrid("0-999-1-2", palette)
  expect(grid).toEqual([
    ["#000000", null],
    ["#FF0000", "#00FF00"],
  ])
})

it("空文字列は空グリッド", () => {
  const grid = parseDotStringToColorGrid("", palette)
  expect(grid).toEqual([])
})
