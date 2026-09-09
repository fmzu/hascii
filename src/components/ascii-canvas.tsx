import { Card } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { xtermColors } from "~/utils/xterm-colors"

type Props = {
  grid: [string | null, number | null][][]
  onClick: (rowIndex: number, colIndex: number) => void
  dotSize: number
}
/**
 * アスキーアートのキャンバス
 * @param props
 * @returns
 */
export const AsciiCanvas = (props: Props) => {
  return (
    <Card className="overflow-scroll h-full">
      {props.grid.map((row, rowIndex) => (
        <div key={rowIndex.toString()} className="flex">
          {row.map((cell, colIndex) => (
            <button
              key={colIndex.toString()}
              type="button"
              onClick={() => {
                props.onClick(rowIndex, colIndex)
              }}
              className={cn("border")}
              style={{
                minWidth: `${props.dotSize / 2}px`,
                height: `${props.dotSize}px`,
                color:
                  cell[1] !== null && cell[1] !== undefined
                    ? xtermColors[cell[1]]
                    : "white",
              }}
            >
              {cell[0]}
            </button>
          ))}
        </div>
      ))}
    </Card>
  )
}
