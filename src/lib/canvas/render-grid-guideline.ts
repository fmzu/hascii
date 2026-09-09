import { xtermColors } from "~/utils/xterm-colors"

export function renderGridGuideline(
  ctx: CanvasRenderingContext2D,
  props: {
    dotSize: number
    grid: (number | null)[][]
  },
) {
  const dotSize = props.dotSize
  const grid = props.grid

  const canvasWidth = ctx.canvas.width
  const canvasHeight = ctx.canvas.height

  const gridSize = grid.length * dotSize
  const offsetX = (canvasWidth - gridSize) / 2
  const offsetY = (canvasHeight - gridSize) / 2

  for (const [rowIndex, row] of grid.entries()) {
    for (const [colIndex, colorIndex] of row.entries()) {
      if (colorIndex === null) continue
      ctx.fillStyle = xtermColors[colorIndex]
      ctx.fillRect(
        offsetX + colIndex * dotSize + dotSize / 2,
        offsetY + rowIndex * dotSize + dotSize / 2,
        dotSize,
        dotSize,
      )
    }
  }
}
