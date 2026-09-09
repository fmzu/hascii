import { Link } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { DeleteDialog } from "~/components/delete-dialog"

type Props = {
  postId: string
}

export function SettingsCard(props: Props) {
  return (
    <Card className="bg-border">
      <CardContent className="p-4 space-y-2">
        <p className="text-xs opacity-70">
          {"この項目はあなただけに見えています"}
        </p>
        <div className="space-x-2">
          <Link to="/posts/$post/edit" params={{ post: props.postId }}>
            <Button>{"編集"}</Button>
          </Link>
          <DeleteDialog postId={props.postId} />
        </div>
      </CardContent>
    </Card>
  )
}
