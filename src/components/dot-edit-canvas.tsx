import { useEffect, useState } from "react"
import { cn } from "~/lib/utils"
import { xtermColors } from "~/utils/xterm-colors"

type Props = {
  grid: (number | null)[][]
  onClick: (rowIndex: number, colIndex: number) => void
  dotSize: number
  isSpacePressed: boolean
  onPressSpace: (isSpacePressed: boolean) => void
}
/**
 * 元ある情報からドット絵を修正するキャンバス
 * @param props
 * @returns
 */
export const DotEditCanvas = (props: Props) => {
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        props.onPressSpace(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        props.onPressSpace(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const handleMouseDown = (rowIndex: number, colIndex: number) => {
    setIsMouseDown(true)
    props.onClick(rowIndex, colIndex)
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isMouseDown || props.isSpacePressed) {
      props.onClick(rowIndex, colIndex)
    }
  }

  return (
    <div onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {props.grid.map((row, rowIndex) => (
        <div key={rowIndex.toString()} className="flex">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex.toString()}
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              className={cn("border")}
              style={{
                minWidth: `${props.dotSize}px`,
                height: `${props.dotSize}px`,
                backgroundColor: cell !== null ? xtermColors[cell] : "white",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
