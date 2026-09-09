import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
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
import { client } from "~/lib/client"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dots: string
}

export const PostDialog = (props: Props) => {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")

  const [isPublic, setIsPublic] = useState(false)

  const mutation = useMutation({
    async mutationFn() {
      const resp = await client.posts.$post({
        json: {
          dots: props.dots,
          title: title,
          description: "",
          isPublic: isPublic,
        },
      })
      return await resp.json()
    },
  })

  const onSubmit = async () => {
    const result = await mutation.mutateAsync()
    toast("投稿しました")
    navigate(`/my/posts/${result.postId}`)
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
            disabled={mutation.isPending}
          />
          <Button
            variant={isPublic ? "destructive" : "secondary"}
            disabled={mutation.isPending}
            onClick={() => setIsPublic(!isPublic)}
          >
            {isPublic ? <LockKeyholeOpenIcon /> : <LockKeyholeIcon />}
            {isPublic ? "公開" : "非公開"}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={mutation.isPending}>
            {"投稿"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
