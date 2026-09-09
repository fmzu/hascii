import { cn } from "~/lib/utils"

type Props = {
  grid: (number | null)[][]
  dotSize: number
}

/**
 * キャンバスのグリッドを表示する
 * なくてもドット絵は描けるが、どこに何を描いているか分かりやすくするために表示する
 * @param props
 * @returns
 */
export function CanvasGrid(props: Props) {
  return (
    <div className={"absolute pointer-events-none"}>
      {props.grid.map((row, rowIndex) => (
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
