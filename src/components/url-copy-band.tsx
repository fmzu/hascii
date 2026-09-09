import type { EditorCell } from "~/types/editor-cell"
import { Card } from "~/components/ui/card"

type Props = {
  toStringFromGrid: (grid: EditorCell[][]) => string
  grid: EditorCell[][]
}

export const UrlCopyBand = (props: Props) => {
  return (
    <Card className="flex-1 overflow-hidden items-center">
      <pre
        className="whitespace-nowrap overflow-hidden h-full px-1"
        style={{ lineHeight: "2.5rem" }}
      >
        {props.toStringFromGrid(props.grid)}
      </pre>
    </Card>
  )
}
