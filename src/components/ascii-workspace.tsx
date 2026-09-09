import { AsciiCanvas } from "~/components/ascii-canvas"
import { AsciiCharacterPalette } from "~/components/ascii-character-palette"
import { CanvasSizeSelectButton } from "~/components/canvas-size-select-button"
import { ClearCanvasButton } from "~/components/clear-canvas-button"
import { DotSizeSelectButton } from "~/components/dot-size-select-button"
import { EraserButton } from "~/components/eraser-button"
import { XtermColorPalette } from "~/components/xterm-color-palette"
import { createEmptyAsciiCells } from "~/utils/create-empty-ascii-cells"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Separator } from "@radix-ui/react-separator"
import { useState } from "react"

type Props = {
  code?: string
}

export const AsciiWorkspace = (props: Props) => {
  const [rowsCount, setRowsCount] = useState(8)

  // ドットの大きさを管理するための状態を作成します
  const [dotSize, setDotSize] = useState(64)

  const [grid, setGrid] = useState(createEmptyAsciiCells(rowsCount))

  const [char, setChar] = useState<string | null>("a")

  const [colorIndex, setColorIndex] = useState<number | null>(1)

  const onDraw = (rowIndex: number, colIndex: number) => {
    if (!eraserMode && colorIndex === null) return
    const newGrid = [...grid]
    newGrid[rowIndex][colIndex][0] = eraserMode ? null : char
    newGrid[rowIndex][colIndex][1] = eraserMode ? null : colorIndex
    setGrid(newGrid)
  }

  const usedColors = new Set(grid.flat().map((cell) => cell[1]))

  const [eraserMode, setEraserMode] = useState(false)

  const onClearCanvas = () => {
    setGrid(createEmptyAsciiCells(rowsCount))
  }

  /**
   * キャンバスのサイズを変更する
   * @param size
   */
  const onResizeCanvas = (size: number) => {
    setRowsCount(size)
    setGrid(createEmptyAsciiCells(size))
  }

  const onResizeDotSize = (size: number) => {
    setDotSize(size)
  }

  return (
    <div>
      <div className="flex p-4 gap-x-4 overflow-hidden w-full h-main">
        <div className="flex-1 overflow-hidden h-full">
          <AsciiCanvas grid={grid} onClick={onDraw} dotSize={dotSize} />
        </div>
        <div className="w-80 flex flex-col gap-y-2">
          <div className="flex space-x-2">
            <CanvasSizeSelectButton
              onChange={onResizeCanvas}
              value={rowsCount}
            />
            <DotSizeSelectButton onChange={onResizeDotSize} value={dotSize} />
          </div>
          <div className="flex space-x-2">
            {/* 消しゴムモードのトグルボタンを追加します */}
            <EraserButton
              isActive={eraserMode}
              onChange={(eraserMode) => {
                setEraserMode(eraserMode)
                setColorIndex(null)
              }}
            />
            {/* クリアボタンを追加します */}
            <ClearCanvasButton onClick={onClearCanvas} />
          </div>
          <div>
            <Tabs defaultValue="color-palette" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="color-palette">{"色"}</TabsTrigger>
                <TabsTrigger value="character">{"文字"}</TabsTrigger>
              </TabsList>
              <TabsContent value="color-palette">
                <XtermColorPalette
                  colorIndex={colorIndex}
                  setColorId={(colorIndex) => {
                    setColorIndex(colorIndex)
                    setEraserMode(false)
                  }}
                />
              </TabsContent>
              <TabsContent value="character">
                <AsciiCharacterPalette
                  char={char}
                  setChar={(char) => {
                    setChar(char)
                    setEraserMode(false)
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
          {/* <CurrentColors
          colorKeys={nesColorKeys}
          usedColors={usedColors}
          setColorId={setColorIndex}
          colors={nesColors}
        /> */}
        </div>
      </div>
      <Separator />
    </div>
  )
}
