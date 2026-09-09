import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { DotEditor } from "~/components/dot-editor"
import { createPostFn } from "~/server/functions/create-post"
import { createEmptyDotCells } from "~/utils/create-empty-dot-cells"

export const Route = createFileRoute("/my/posts/")({
  component: NewPostPage,
})

function NewPostPage() {
  const navigate = useNavigate()

  const [rowsCount] = useState(16)

  const [value, setValue] = useState(createEmptyDotCells(rowsCount))

  const [title, setTitle] = useState("")

  const [description] = useState("")

  const [isPublic, setIsPublic] = useState(false)

  const [pending, setPending] = useState(false)

  const onSubmit = async () => {
    setPending(true)
    const result = await createPostFn({
      data: {
        dots: value.flat().join("-"),
        title: title,
        description: description,
        isPublic: isPublic,
      },
    })
    setPending(false)
    toast("投稿しました")
    navigate({ to: "/my/posts/$post", params: { post: result.postId } })
  }

  const onClearCanvas = () => {
    setValue(createEmptyDotCells(rowsCount))
  }

  return (
    <main className="flex-1 flex flex-col p-2 h-svh gap-2">
      <Card className="flex gap-x-2 p-2">
        <Input
          placeholder={"タイトル"}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
          }}
          disabled={pending}
        />
        <Button
          variant={isPublic ? "destructive" : "secondary"}
          disabled={pending}
          onClick={() => {
            setIsPublic(!isPublic)
          }}
        >
          {isPublic ? <LockKeyholeOpenIcon /> : <LockKeyholeIcon />}
          {isPublic ? "公開" : "非公開"}
        </Button>
        <Button onClick={onSubmit} disabled={pending}>
          {"保存"}
        </Button>
      </Card>
      <div className="flex-1">
        <DotEditor
          value={value}
          rowsCount={rowsCount}
          onChange={setValue}
          onClearCanvas={onClearCanvas}
        />
      </div>
    </main>
  )
}
