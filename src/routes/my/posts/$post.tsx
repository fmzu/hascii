import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { LockKeyholeOpenIcon, LockKeyholeIcon, TrashIcon } from "lucide-react"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { DotEditor } from "~/components/dot-editor"
import { getPostFn } from "~/server/functions/get-post"
import { updatePostFn } from "~/server/functions/update-post"
import { createEmptyDotCells } from "~/utils/create-empty-dot-cells"
import { toDotsFromText } from "~/utils/to-dots-from-text"

export const Route = createFileRoute("/my/posts/$post")({
  loader: ({ params }) => getPostFn({ data: { postId: params.post } }),
  component: EditPostPage,
})

function EditPostPage() {
  const post = Route.useLoaderData()
  const { post: postId } = Route.useParams()

  const [rowsCount] = useState(16)

  const [title, setTitle] = useState(post.title ?? "")

  const [description] = useState(post.description ?? "")

  const [isPublic, setIsPublic] = useState(post.isPublic)

  const [value, setValue] = useState(() => toDotsFromText(post.dots))

  const [pending, setPending] = useState(false)

  useEffect(() => {
    setValue(toDotsFromText(post.dots))
    setTitle(post.title ?? "")
    setIsPublic(post.isPublic)
  }, [post])

  const onSubmit = async () => {
    setPending(true)
    await updatePostFn({
      data: {
        postId,
        dots: value.flat().join("-"),
        title: title,
        description: description,
        isPublic: isPublic,
      },
    })
    setPending(false)
    toast("更新しました")
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
          variant={"destructive"}
          disabled={pending}
          onClick={() => {
            alert("未実装")
          }}
        >
          {<TrashIcon />}
        </Button>
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
