import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { CircleDashed } from "lucide-react"

type Props = {
  onClick: () => void
}

/**
 * キャンバスをクリアするボタン
 * @param props
 * @returns
 */
export const ClearCanvasButton = (props: Props) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={"secondary"} className="w-full space-x-2">
          <CircleDashed className=" w-4 mr-2" />
          {"クリア"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <div className="flex flex-col space-y-2">
          <div>{"本当にクリアしますか？"}</div>
          <div className="flex justify-end space-x-2">
            <AlertDialogAction onClick={props.onClick}>
              {"はい"}
            </AlertDialogAction>
            <AlertDialogCancel>{"いいえ"}</AlertDialogCancel>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
