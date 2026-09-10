import { Card } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import type { EditorCell } from "~/types/editor-cell"

type Props = {
  grid: EditorCell[][]
  onClick: (rowIndex: number, colIndex: number) => void
  dotSize: number
  colors: Map<string, string>
}

export const DotCanvas = (props: Props) => {
  return (
    <Card className="overflow-scroll h-full">
      {props.grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <button
              key={colIndex}
              type="button"
              onClick={() => props.onClick(rowIndex, colIndex)}
              className={cn("border")}
              style={{
                minWidth: `${props.dotSize}px`,
                height: `${props.dotSize}px`,
                backgroundColor:
                  cell.color !== null ? props.colors.get(cell.color) : "white",
              }}
            />
          ))}
        </div>
      ))}
    </Card>
  )
}
