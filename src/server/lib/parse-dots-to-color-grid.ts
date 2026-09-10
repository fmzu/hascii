export const parseDotStringToColorGrid = (
  dots: string,
  palette: string[],
): (string | null)[][] => {
  if (dots === "") {
    return []
  }

  const tokens = dots.split("-")
  const size = Math.floor(Math.sqrt(tokens.length))

  if (size === 0) {
    return []
  }

  const grid: (string | null)[][] = []

  for (let y = 0; y < size; y++) {
    const row: (string | null)[] = []
    for (let x = 0; x < size; x++) {
      const index = Number.parseInt(tokens[y * size + x], 10)
      if (Number.isNaN(index) || index < 0 || index >= palette.length) {
        row.push(null)
      } else {
        row.push(palette[index])
      }
    }
    grid.push(row)
  }

  return grid
}
