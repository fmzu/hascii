import { it, expect } from "bun:test"
import { generateOgpSvg } from "../generate-ogp-svg"

it("SVGのルート要素が正しいサイズ", () => {
  const grid = [["#FF0000"]]
  const svg = generateOgpSvg(grid)
  expect(svg).toContain('width="1200"')
  expect(svg).toContain('height="630"')
  expect(svg).toContain("xmlns")
})

it("白背景の矩形が含まれる", () => {
  const grid = [["#FF0000"]]
  const svg = generateOgpSvg(grid)
  expect(svg).toContain('fill="#ffffff"')
})

it("色付きセルがrectとして描画される", () => {
  const grid = [
    ["#FF0000", null],
    [null, "#00FF00"],
  ]
  const svg = generateOgpSvg(grid)
  expect(svg).toContain('fill="#FF0000"')
  expect(svg).toContain('fill="#00FF00"')
})

it("nullセルはrectを生成しない", () => {
  const grid = [[null]]
  const svg = generateOgpSvg(grid)
  const rectCount = (svg.match(/<rect /g) || []).length
  expect(rectCount).toBe(1) // 背景のみ
})

it("8x8グリッドで正しいスケールと中央配置", () => {
  const grid = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => "#000000"),
  )
  const svg = generateOgpSvg(grid)
  // scale = floor(630 / 8) = 78, art = 78*8 = 624
  // offsetX = (1200 - 624) / 2 = 288
  // offsetY = (630 - 624) / 2 = 3
  expect(svg).toContain('x="288"')
  expect(svg).toContain('y="3"')
  expect(svg).toContain('width="78"')
  expect(svg).toContain('height="78"')
})
