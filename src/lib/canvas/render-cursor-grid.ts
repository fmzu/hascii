export function renderCursorGrid(
  ctx: CanvasRenderingContext2D,
  props: {
    x: number
    y: number
    dotSize: number
    grid: (number | null)[][]
  },
) {
  const dotSize = props.dotSize
  const grid = props.grid

  const canvasWidth = ctx.canvas.width
  const canvasHeight = ctx.canvas.height

  // キャンバスの中心を基準点に移動
  ctx.save()

  ctx.translate(
    canvasWidth / 2 + props.dotSize,
    canvasHeight / 2 + props.dotSize,
  )

  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
      const x = (colIndex - grid.length / 2) * dotSize - dotSize / 2 - 2
      const y = (rowIndex - grid.length / 2) * dotSize - dotSize / 2 - 2
      if (rowIndex !== props.x || colIndex !== props.y) continue

      ctx.fillStyle = "lightgray"

      ctx.fillRect(x, y, props.dotSize + 4, props.dotSize + 4)
    }
  }

  ctx.restore()
}
