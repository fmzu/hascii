import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { ClearCanvasButton } from "~/components/clear-canvas-button"
import { EraserButton } from "~/components/eraser-button"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { DotEditCanvas } from "~/components/dot-edit-canvas"
import { DotXtermColorPalette } from "~/components/dot-xterm-color-palette"
import { getPostFn } from "~/server/functions/get-post"
import { updatePostFn } from "~/server/functions/update-post"
import { createEmptyDotCells } from "~/utils/create-empty-dot-cells"
import { toDotsFromText } from "~/utils/to-dots-from-text"

export const Route = createFileRoute("/posts/$post/edit")({
  loader: ({ params }) => getPostFn({ data: { postId: params.post } }),
  component: PostEditPage,
})

function PostEditPage() {
  const post = Route.useLoaderData()
  const { post: postId } = Route.useParams()

  const [rowsCount] = useState(16)

  const [grid, setGrid] = useState(() => toDotsFromText(post.dots))

  const [dotSize] = useState(16)

  const [colorIndex, setColorIndex] = useState<number | null>(1)

  const [eraserMode, setEraserMode] = useState(false)

  const [isSpacePressed, setIsSpacePressed] = useState(false)

  const [title, setTitle] = useState(post.title ?? "")

  const [description, setDescription] = useState(post.description ?? "")

  const [pending, setPending] = useState(false)

  const onDraw = (rowIndex: number, colIndex: number) => {
    if (!eraserMode && colorIndex === null) return
    const newGrid = [...grid]
    newGrid[rowIndex][colIndex] = eraserMode ? null : colorIndex
    setGrid(newGrid)
  }

  const onClearCanvas = () => {
    setGrid(createEmptyDotCells(rowsCount))
  }

  const onSubmit = async () => {
    setPending(true)
    await updatePostFn({
      data: {
        postId,
        dots: grid.flat().join("-"),
        title: title,
        description: description,
        isPublic: post.isPublic,
      },
    })
    setPending(false)
    toast("更新しました")
  }

  const onMouseDown = () => {
    setIsSpacePressed(true)
  }

  const onMouseUp = () => {
    setIsSpacePressed(false)
  }

  return (
    <>
      <div className="flex justify-between items-center container p-8">
        <div className="text-xl font-bold">{"HASCII"}</div>
        <Button onClick={onSubmit} disabled={pending}>
          {"保存"}
        </Button>
      </div>
      <main className="flex flex-col gap-2 max-w-screen-sm container py-8 h-custom-main">
        <div className="p-4 justify-center flex items-center flex-1">
          <Card className="overflow-hidden">
            <DotEditCanvas
              grid={grid}
              onClick={onDraw}
              dotSize={dotSize}
              isSpacePressed={isSpacePressed}
              onPressSpace={setIsSpacePressed}
            />
          </Card>
        </div>
        <DotXtermColorPalette
          colorIndex={colorIndex}
          setColorId={(index) => {
            setColorIndex(index)
            setEraserMode(false)
          }}
        />
        <div className="flex space-x-2">
          <EraserButton
            isActive={eraserMode}
            onChange={(value) => {
              setEraserMode(value)
              setColorIndex(null)
            }}
          />
          <ClearCanvasButton onClick={onClearCanvas} />
        </div>
        <Button
          className="sm:hidden"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {"塗る"}
        </Button>
      </main>
    </>
  )
}
