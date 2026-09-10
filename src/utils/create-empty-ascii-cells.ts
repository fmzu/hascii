/**
 * グリッドの初期状態を作成する
 * string | null, string | null: [文字, 色]
 * @param rowsCount 行数
 * @returns
 */
export const createEmptyAsciiCells = (
  rowsCount: number,
): [string | null, number | null][][] => {
  return Array.from({ length: rowsCount }, () => {
    return Array.from({ length: rowsCount * 2 }, () => {
      return [null, null] as const
    })
  })
}
