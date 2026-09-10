export function renderCursor(
  ctx: CanvasRenderingContext2D,
  props: {
    x: number
    y: number
    isDrawing: boolean
  },
) {
  ctx.fillStyle = props.isDrawing ? "lightblue" : "blue"

  ctx.lineWidth = props.isDrawing ? 3 : 2

  ctx.beginPath()
  ctx.moveTo(props.x - 2, props.y + 10) // 左上
  ctx.lineTo(props.x + 10, props.y + 10) // 右上
  ctx.lineTo(props.x + 10, props.y - 2) // 右下
  ctx.lineTo(props.x - 2, props.y - 2) // 左下
  ctx.closePath() // 左上に戻る
  ctx.stroke()

  if (props.isDrawing) {
    ctx.fillRect(props.x, props.y, 8, 8)
  }

  if (props.isDrawing === false) {
    ctx.fillStyle = "black"
    ctx.fillRect(props.x + 2, props.y + 2, 4, 4)
  }
}
