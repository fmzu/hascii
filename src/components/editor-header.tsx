import type { EditorCell } from "~/types/editor-cell"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { toast } from "sonner"

type Props = {
  toStringFromGrid: (grid: EditorCell[][]) => string
  grid: EditorCell[][]
}

export const EditorHeader = (props: Props) => {
  return (
    <div className="flex space-x-2 overflow-hidden">
      <Card className="flex-1 overflow-hidden items-center">
        <pre
          className="whitespace-nowrap overflow-hidden h-full px-1"
          style={{ lineHeight: "2.5rem" }}
        >
          {props.toStringFromGrid(props.grid)}
        </pre>
      </Card>
      <Button
        onClick={() => {
          navigator.clipboard.writeText(
            `https://editor-beige.vercel.app/${props.toStringFromGrid(
              props.grid,
            )}`,
          )
          toast("コピーしました")
        }}
      >
        {"コピー"}
      </Button>
    </div>
  )
}
