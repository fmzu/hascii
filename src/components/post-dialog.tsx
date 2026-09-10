import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { createPostFn } from "~/server/functions/create-post"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dots: string
}

export const PostDialog = (props: Props) => {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")

  const [isPublic, setIsPublic] = useState(false)

  const [pending, setPending] = useState(false)

  const onSubmit = async () => {
    setPending(true)
    const result = await createPostFn({
      data: { dots: props.dots, title: title, description: "", isPublic },
    })
    setPending(false)
    toast("投稿しました")
    navigate({ to: "/my/posts/$post", params: { post: result.postId } })
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"投稿する"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-y-2">
          <Input
            placeholder={"タイトル"}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={pending}
          />
          <Button
            variant={isPublic ? "destructive" : "secondary"}
            disabled={pending}
            onClick={() => setIsPublic(!isPublic)}
          >
            {isPublic ? <LockKeyholeOpenIcon /> : <LockKeyholeIcon />}
            {isPublic ? "公開" : "非公開"}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={pending}>
            {"投稿"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
