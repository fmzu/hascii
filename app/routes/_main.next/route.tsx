import { useState } from "react"
import { DotCanvas } from "./components/dot-canvas"
import { createEmptyDotCells } from "~/utils/create-empty-dot-cells"
import { DotXtermColorPalette } from "./components/dot-xterm-color-palette"
import { Card } from "~/components/ui/card"
import { EraserButton } from "~/components/eraser-button"
import { ClearCanvasButton } from "~/components/clear-canvas-button"

export default function NextPage() {
  const [rowsCount, setRowsCount] = useState(16)

  const [grid, setGrid] = useState(createEmptyDotCells(rowsCount))

  const [dotSize, setDotSize] = useState(16)

  const [colorIndex, setColorIndex] = useState<number | null>(1)

  const [eraserMode, setEraserMode] = useState(false)

  const onDraw = (rowIndex: number, colIndex: number) => {
    if (!eraserMode && colorIndex === null) return
    const newGrid = [...grid]
    newGrid[rowIndex][colIndex] = eraserMode ? null : colorIndex
    setGrid(newGrid)
  }

  const onClearCanvas = () => {
    setGrid(createEmptyDotCells(rowsCount))
  }

  return (
    <main className="flex flex-col gap-2 max-w-screen-sm container py-8">
      <Card className="p-4 justify-center flex bg-border">
        <DotCanvas grid={grid} onClick={onDraw} dotSize={dotSize} />
      </Card>
      <DotXtermColorPalette
        colorIndex={colorIndex}
        setColorId={(colorIndex) => {
          setColorIndex(colorIndex)
          setEraserMode(false)
        }}
      />
      <div className="flex space-x-2">
        <EraserButton
          eraserMode={eraserMode}
          setEraserMode={(eraserMode) => {
            setEraserMode(eraserMode)
            setColorIndex(null)
          }}
        />
        <ClearCanvasButton onClick={onClearCanvas} />
      </div>
    </main>
  )
}
