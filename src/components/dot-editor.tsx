import { useState } from "react"
import { Card } from "~/components/ui/card"
import { EraserButton } from "~/components/eraser-button"
import { ClearCanvasButton } from "~/components/clear-canvas-button"
import { Button } from "~/components/ui/button"
import { useSpaceKey } from "~/hooks/use-space-key"
import { DotCanvas } from "~/components/my-dot-canvas"
import { DotXtermColorPalette } from "~/components/dot-xterm-color-palette"
import { Separator } from "~/components/ui/separator"

type Props = {
  value: (null | number)[][]
  rowsCount: number
  onChange(value: (null | number)[][]): void
  onClearCanvas(): void
}

export function DotEditor(props: Props) {
  const [cursorGrid, setCursorGrid] = useState({
    /**
     * カーソルのセルの座標（0から15）
     */
    x: 0,
    y: 0,
  })

  const [dotSize, setDotSize] = useState(16)

  const [colorIndex, setColorIndex] = useState<number | null>(1)

  const [isEraserMode, setEraserMode] = useState(false)

  const [isDrawing, setDrawingState] = useState(false)

  /**
   * 値を更新する
   */
  const onUpdateValue = () => {
    const rowIndex = cursorGrid.x
    const colIndex = cursorGrid.y
    const newGrid = [...props.value]
    newGrid[rowIndex][colIndex] = isEraserMode ? null : colorIndex
    props.onChange(newGrid)
  }

  /**
   * カーソルの行列を更新する
   */
  const onChangeCursor = (x: number, y: number) => {
    setCursorGrid({ x: x, y: y })
    // カーソルの座標が更新された後に塗る
    if (isDrawing === false) return
    setTimeout(() => {
      onUpdateValue()
    })
  }

  const onEnableDrawMode = () => {
    setDrawingState(true)
    onUpdateValue()
  }

  const onDisableDrawMode = () => {
    setDrawingState(false)
  }

  const isSpaceKey = useSpaceKey({
    onKeyDown: onEnableDrawMode,
    onKeyUp: onDisableDrawMode,
  })

  return (
    <Card className="h-full w-full flex flex-col p-2">
      <div className="flex-1 w-full overflow-hidden">
        <div className="overflow-hidden h-full">
          <DotCanvas
            isDrawing={isDrawing}
            grid={props.value}
            cursorGrid={cursorGrid}
            onChange={onChangeCursor}
            dotSize={dotSize}
          />
        </div>
      </div>
      <Separator />
      <div className="w-full flex flex-col lg:flex-row pt-2 gap-2 items-start">
        <Card className="flex-1 w-full lg:max-w-96 p-2">
          <DotXtermColorPalette
            colorIndex={colorIndex}
            setColorId={(colorIndex) => {
              setColorIndex(colorIndex)
              setEraserMode(false)
            }}
          />
        </Card>
        <Card className="flex-1 w-full h-full p-2 flex flex-col gap-2">
          <Button
            variant={isSpaceKey ? "default" : "secondary"}
            onTouchStart={onEnableDrawMode}
            onTouchEnd={onDisableDrawMode}
            onTouchCancel={onDisableDrawMode}
            onMouseDown={onEnableDrawMode}
            onMouseUp={onDisableDrawMode}
            onMouseLeave={onDisableDrawMode}
          >
            {"塗る（スペース）"}
          </Button>
          <div className="flex gap-x-2">
            <div className="flex-1">
              <EraserButton
                isActive={isEraserMode}
                onChange={(value) => {
                  setEraserMode(value)
                }}
              />
            </div>
            <div className="flex-1">
              <ClearCanvasButton onClick={props.onClearCanvas} />
            </div>
          </div>
        </Card>
      </div>
    </Card>
  )
}
