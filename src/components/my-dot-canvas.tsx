import { useState } from "react"
import { ReactCanvas } from "~/components/react-canvas"
import { renderCursor } from "~/lib/canvas/render-cursor"
import { renderCursorGrid } from "~/lib/canvas/render-cursor-grid"
import { renderGridGuideline } from "~/lib/canvas/render-grid-guideline"
import { renderGrid } from "~/lib/canvas/render-grid"

type Props = {
  isDrawing: boolean
  grid: (number | null)[][]
  dotSize: number
  /**
   * カーソルのセルの座標（0から15）
   */
  cursorGrid: { x: number; y: number }
  onChange(rowIndex: number, colIndex: number): void
}

/**
 * ドット絵を作成するためのキャンバス
 */
export function DotCanvas(props: Props) {
  const [virtualCursor, setVirtualCursor] = useState({
    /**
     * 仮想のカーソルのx座標
     */
    x: 40,
    y: 40,
  })

  const [cursorPosition, setCursorPosition] = useState({
    /**
     * 実際のカーソルのx座標
     */
    x: 40,
    y: 40,
  })

  const onDraw = (ctx: CanvasRenderingContext2D) => {
    renderGrid(ctx, { dotSize: props.dotSize, grid: props.grid })
    renderCursorGrid(ctx, {
      x: props.cursorGrid.x,
      y: props.cursorGrid.y,
      grid: props.grid,
      dotSize: props.dotSize,
    })
    renderGridGuideline(ctx, { dotSize: props.dotSize, grid: props.grid })
    renderCursor(ctx, {
      x: virtualCursor.x,
      y: virtualCursor.y,
      isDrawing: props.isDrawing,
    })
  }

  const onTouchStart = (canvas: HTMLCanvasElement, x: number, y: number) => {
    setCursorPosition({ x, y })
  }

  const onTouchMove = (canvas: HTMLCanvasElement, x: number, y: number) => {
    onUpdateGrid(canvas)
    setCursorPosition({ x, y })
    const dx = cursorPosition.x - x
    const dy = cursorPosition.y - y
    setVirtualCursor((value) => {
      const x = value.x - dx
      const y = value.y - dy
      if (x < 0 || y < 0) return value
      if (canvas.width < x || canvas.height < y) return value
      return { x, y }
    })
  }

  const onTouchEnd = (canvas: HTMLCanvasElement, x: number, y: number) => {
    // console.log("onTouchEnd", x, y)
  }

  const onUpdateGrid = (canvas: HTMLCanvasElement) => {
    // 1を引いて最も近い偶数に調整
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const dotSize = props.dotSize
    const gridSize = props.grid.length * dotSize
    const offsetX = (canvasWidth - gridSize) / 2 + dotSize / 4
    const offsetY = (canvasHeight - gridSize) / 2 + dotSize / 4
    const gridX = Math.floor((virtualCursor.x - offsetX) / dotSize)
    const gridY = Math.floor((virtualCursor.y - offsetY) / dotSize)
    if (gridX < 0 || gridY < 0) return
    if (props.grid.length <= gridY) return
    if (props.grid.length <= gridX) return
    if (props.cursorGrid.x === gridY && props.cursorGrid.y === gridX) return
    props.onChange(gridY, gridX)
  }

  return (
    <ReactCanvas
      onDraw={onDraw}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    />
  )
}
