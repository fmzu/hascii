import { useState } from "react"
import { useSession } from "@hono/auth-js/react"
import { CanvasSizeSelectButton } from "~/components/canvas-size-select-button"
import { ClearCanvasButton } from "~/components/clear-canvas-button"
import { CurrentColors } from "~/components/current-colors"
import { DotSizeSelectButton } from "~/components/dot-size-select-button"
import { EditorHeader } from "~/components/editor-header"
import { EraserButton } from "~/components/eraser-button"
import { NesColorPalette } from "~/components/nes-color-palette"
import { Button } from "~/components/ui/button"
import { DotCanvas } from "~/routes/_main.dot._index/components/dot-canvas"
import { ExportMenu } from "~/routes/_main.dot._index/components/export-menu"
import { LoginRequiredDialog } from "~/routes/_main.dot._index/components/login-required-dialog"
import { PostDialog } from "~/routes/_main.dot._index/components/post-dialog"
import { createEmptyGrid } from "~/utils/create-empty-cells"
import { nesColorKeys } from "~/utils/nes-color-keys"
import { nesColors } from "~/utils/nes-colors"
import { toGridFromString } from "~/utils/to-grid-from-string"
import { toStringFromGrid } from "~/utils/to-string-from-grid"

type Props = {
  code?: string
}

export const DotWorkspace = (props: Props) => {
  const [rowsCount, setRowsCount] = useState(8)

  // ドットの大きさを管理するための状態を作成します
  const [dotSize, setDotSize] = useState(32)

  const [grid, setGrid] = useState(
    props.code ? toGridFromString(props.code) : createEmptyGrid(rowsCount),
  )

  const [colorId, setColorId] = useState("00")

  const session = useSession()

  const [isPostOpen, setIsPostOpen] = useState(false)

  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const dots = toStringFromGrid(grid)

  const callbackUrl = `/dot/${dots}`

  const onClickPost = () => {
    if (session.status === "authenticated") {
      setIsPostOpen(true)
      return
    }
    setIsLoginOpen(true)
  }

  const onDraw = (rowIndex: number, colIndex: number) => {
    const newGrid = [...grid]
    // 消しゴムモードが有効なら色をnullに、そうでなければ選択中の色に設定します
    newGrid[rowIndex][colIndex].color = eraserMode ? null : colorId
    setGrid(newGrid)
    // router.replace(`/${toStringFromGrid(newGrid)}`)
  }

  const usedColors = new Set(grid.flat().map((cell) => cell.color))

  const [eraserMode, setEraserMode] = useState(false)

  const onClearCanvas = () => {
    setGrid(createEmptyGrid(rowsCount))
  }

  /**
   * キャンバスのサイズを変更する
   * @param size
   */
  const onResizeCanvas = (size: number) => {
    setRowsCount(size)
    setGrid(createEmptyGrid(size))
  }

  const onResizeDotSize = (size: number) => {
    setDotSize(size)
  }

  return (
    <div className="flex p-4 gap-x-4 overflow-hidden w-full h-svh">
      <div className="flex-1 overflow-hidden h-full">
        <DotCanvas
          grid={grid}
          onClick={onDraw}
          dotSize={dotSize}
          colors={nesColors}
        />
      </div>
      <div className="w-80 flex flex-col gap-y-2">
        <div className="flex justify-end gap-x-2">
          <ExportMenu grid={grid} colors={nesColors} />
          <Button onClick={onClickPost}>{"投稿"}</Button>
        </div>
        <EditorHeader grid={grid} toStringFromGrid={toStringFromGrid} />
        <div className="flex space-x-2">
          <CanvasSizeSelectButton onChange={onResizeCanvas} value={rowsCount} />
          <DotSizeSelectButton onChange={onResizeDotSize} value={dotSize} />
        </div>
        <div className="flex space-x-2">
          <EraserButton isActive={eraserMode} onChange={setEraserMode} />
          <ClearCanvasButton onClick={onClearCanvas} />
        </div>
        <div>
          <NesColorPalette
            colors={nesColors}
            colorId={colorId}
            setColorId={setColorId}
          />
        </div>
        <CurrentColors
          colorKeys={nesColorKeys}
          usedColors={usedColors}
          setColorId={setColorId}
          colors={nesColors}
        />
      </div>
      <PostDialog open={isPostOpen} onOpenChange={setIsPostOpen} dots={dots} />
      <LoginRequiredDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        callbackUrl={callbackUrl}
      />
    </div>
  )
}
