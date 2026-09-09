import type { EditorCell } from "~/types/editor-cell"

export const toStringFromGrid = (grid: EditorCell[][]): string => {
  return grid.map((row) => row.map((cell) => cell.color).join("-")).join("-")
}
