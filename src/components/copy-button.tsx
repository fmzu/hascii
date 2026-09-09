import type { EditorCell } from "~/types/editor-cell"
import { Button } from "~/components/ui/button"
import { toast } from "sonner"

type Props = {
  toStringFromGrid: (grid: EditorCell[][]) => string
  grid: EditorCell[][]
}

export const CopyButton = (props: Props) => {
  return (
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
  )
}
