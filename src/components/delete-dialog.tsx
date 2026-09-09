import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import type { InferRequestType, InferResponseType } from "hono/client"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { client } from "~/lib/client"

type Props = {
  postId: string
}

export function DeleteDialog(props: Props) {
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)

  const closeModal = () => setIsOpen(false)

  const endpoint = client.posts[":post"]

  const mutation = useMutation<
    InferResponseType<typeof endpoint.$delete>,
    Error,
    InferRequestType<typeof endpoint.$delete>
  >({
    async mutationFn(props) {
      const resp = await endpoint.$delete({
        param: props.param,
      })

      return await resp.json()
    },
  })

  const onDelete = async () => {
    await mutation.mutateAsync({
      param: { post: props.postId },
    })
    alert("投稿を削除しました")
    navigate("/")
  }

  return (
    <Dialog>
      <DialogTrigger asChild onClick={openModal}>
        <Button variant={"secondary"}>{"削除"}</Button>
      </DialogTrigger>
      {isOpen && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"確認"}</DialogTitle>
          </DialogHeader>
          <p>{"本当にこの作品を削除しますか？"}</p>
          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant={"secondary"}
                onClick={() => {
                  closeModal()
                }}
              >
                {"とじる"}
              </Button>
              <Button
                type="submit"
                onClick={() => {
                  onDelete()
                  closeModal()
                }}
              >
                {"削除"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
