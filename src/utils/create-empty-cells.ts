import type { EditorCell } from "~/types/editor-cell"

/**
 * グリッドの初期状態を作成する
 * @param rowsCount 行数
 * @returns
 */
export const createEmptyGrid = (rowsCount: number): EditorCell[][] => {
  return Array.from({ length: rowsCount }, () => {
    return Array.from({ length: rowsCount }, () => {
      return { color: null }
    })
  })
}
