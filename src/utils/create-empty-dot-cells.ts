/**
 * グリッドの初期状態を作成する
 * @param rowsCount 行数
 * @returns
 */
export const createEmptyDotCells = (rowsCount: number): (null | number)[][] => {
  return Array.from({ length: rowsCount }, () => {
    return Array.from({ length: rowsCount }, () => {
      return null
    })
  })
}
