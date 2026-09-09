import type { EditorCell } from "~/types/editor-cell"

/**
 * 文字列をグリッドに変換する
 * @param text
 * @returns
 */
export const toGridFromString = (text: string): EditorCell[][] => {
  const colors = text.split("-")
  const grid: EditorCell[][] = []

  // ドットの数を計算します
  const dotsCount = colors.length

  // ドットの数から行の数を計算します
  const rowsCount = Math.sqrt(dotsCount)

  for (let i = 0; i < rowsCount; i++) {
    const row: EditorCell[] = []
    for (let j = 0; j < rowsCount; j++) {
      row.push({ color: colors[i * rowsCount + j] || null })
    }
    grid.push(row)
  }

  return grid
}
