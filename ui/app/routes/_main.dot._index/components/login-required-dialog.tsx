import { Link } from "react-router"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  callbackUrl: string
}

export const LoginRequiredDialog = (props: Props) => {
  const query = `?callbackUrl=${encodeURIComponent(props.callbackUrl)}`

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"投稿にはログインが必要です"}</DialogTitle>
          <DialogDescription>
            {"描いた絵はそのままURLに残るので、ログイン後にこの画面へ戻ります。"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Link to={`/sign/up${query}`}>
            <Button variant={"secondary"}>{"新規登録"}</Button>
          </Link>
          <Link to={`/sign/in${query}`}>
            <Button>{"ログイン"}</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
