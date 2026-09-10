/**
 * 文字列をドット絵に変換する
 * @param text
 * @returns
 */
export const toDotsFromText = (text: string): (number | null)[][] => {
  if (text === "") {
    throw new Error("文字列が空です")
  }

  const texts = text.split("-")

  const grid: (number | null)[][] = []

  // ドットの数を計算します
  const dotsCount = texts.length

  // ドットの数から行の数を計算します
  const rowsCount = Math.sqrt(dotsCount)

  for (let i = 0; i < rowsCount; i++) {
    const row: (number | null)[] = []
    for (let j = 0; j < rowsCount; j++) {
      /**
       * ハイフンで区切った一つ
       */
      const text = texts[i * rowsCount + j]
      row.push(
        Number.isNaN(Number.parseInt(text, 10))
          ? null
          : Number.parseInt(text, 10),
      )
    }
    grid.push(row)
  }

  return grid
}
