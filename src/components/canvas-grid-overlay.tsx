import { cn } from "~/lib/utils"
import { createEmptyDotCells } from "~/utils/create-empty-dot-cells"

type Props = {
  rowsCount: number
  dotSize: number
}

export function CanvasGridOverlay(props: Props) {
  const grid = createEmptyDotCells(props.rowsCount)

  return (
    <div className={"absolute pointer-events-none"}>
      {grid.map((row, rowIndex) => (
        <div key={rowIndex.toString()} className="flex">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex.toString()}
              className={cn("border")}
              style={{
                minWidth: `${props.dotSize}px`,
                height: `${props.dotSize}px`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
