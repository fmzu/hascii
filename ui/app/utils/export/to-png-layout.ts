import type { EditorCell } from "~/types/editor-cell"

export type PngRect = {
  x: number
  y: number
  size: number
  color: string
}

export type PngLayout = {
  width: number
  height: number
  background: string
  rects: PngRect[]
}

/**
 * グリッドを PNG 描画用のレイアウト（純データ）へ変換する
 * 色のないセル・色マップに無い色は rects に含めない（背景で塗られる）
 */
export const toPngLayout = (
  grid: EditorCell[][],
  colors: Map<string, string>,
  scale: number,
  background = "#ffffff",
): PngLayout => {
  const rows = grid.length
  const cols = rows === 0 ? 0 : grid[0].length
  const rects: PngRect[] = []

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const colorId = grid[y][x].color
      if (colorId === null) {
        continue
      }
      const hex = colors.get(colorId)
      if (hex === undefined) {
        continue
      }
      rects.push({ x: x * scale, y: y * scale, size: scale, color: hex })
    }
  }

  return {
    width: cols * scale,
    height: rows * scale,
    background,
    rects,
  }
}
