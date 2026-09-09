/**
 * グリッドを描画する
 */
export function renderGrid(
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

  // キャンバスの中心を基準点に移動
  ctx.save()
  ctx.translate(
    canvasWidth / 2 + props.dotSize,
    canvasHeight / 2 + props.dotSize,
  )

  // グリッドを描画
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
      const x = (colIndex - grid.length / 2) * dotSize
      const y = (rowIndex - grid.length / 2) * dotSize

      ctx.fillStyle =
        grid[rowIndex][colIndex] !== null ? "darkgray" : "lightgray"

      ctx.fillRect(x, y, 4, 4)
    }
  }

  ctx.restore()
}
