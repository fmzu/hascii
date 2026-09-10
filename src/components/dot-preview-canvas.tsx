import { toDotsFromString } from "~/utils/to-dots-from-string"
import { xtermColors } from "~/utils/xterm-colors"

type Props = {
  dots: string
}

/**
 * 作成したドット絵を表示して確認するためのキャンバス
 * @param props
 * @returns
 */
export function DotPreviewCanvas(props: Props) {
  const grid = toDotsFromString(props.dots)

  return (
    <div className="h-full bg-white">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex.toString()} className="flex">
          {row.map((cell, colIndex) => (
            <div
              className="w-full flex-1 aspect-[1/1]"
              key={colIndex.toString()}
              style={{
                backgroundColor:
                  cell.color !== null ? xtermColors[cell.color] : "white",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
