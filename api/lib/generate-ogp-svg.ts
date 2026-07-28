const OGP_WIDTH = 1200
const OGP_HEIGHT = 630

export const generateOgpSvg = (
  colorGrid: (string | null)[][],
): string => {
  const rows = colorGrid.length
  const cols = rows === 0 ? 0 : colorGrid[0].length
  const gridSize = Math.max(rows, cols)

  const scale = gridSize === 0 ? 1 : Math.floor(OGP_HEIGHT / gridSize)
  const artWidth = cols * scale
  const artHeight = rows * scale
  const offsetX = Math.floor((OGP_WIDTH - artWidth) / 2)
  const offsetY = Math.floor((OGP_HEIGHT - artHeight) / 2)

  const rects: string[] = []

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = colorGrid[y][x]
      if (color === null) {
        continue
      }
      rects.push(
        `<rect x="${offsetX + x * scale}" y="${offsetY + y * scale}" width="${scale}" height="${scale}" fill="${color}"/>`,
      )
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OGP_WIDTH}" height="${OGP_HEIGHT}">`,
    `<rect width="${OGP_WIDTH}" height="${OGP_HEIGHT}" fill="#ffffff"/>`,
    ...rects,
    "</svg>",
  ].join("")
}
