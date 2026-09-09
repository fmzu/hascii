import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { xtermColors } from "~/utils/xterm-colors"

type Props = {
  colorIndex: number | null
  setColorId: (colorId: number) => void
}

/**
 * ドット絵用のカラーパレット
 * @param props
 * @returns
 */
export const DotXtermColorPalette = (props: Props) => {
  return (
    <div className="w-full grid grid-cols-8 gap-2">
      {xtermColors.slice(0, 16).map((color) => (
        <Button
          key={color}
          className={cn(
            "flex-1 w-full p-2 overflow-hidden transition-all",
            props.colorIndex !== null && xtermColors[props.colorIndex] === color
              ? "p-1"
              : "p-2",
          )}
          variant={
            props.colorIndex !== null && xtermColors[props.colorIndex] === color
              ? "default"
              : "outline"
          }
          onClick={() => {
            props.setColorId(xtermColors.findIndex((c) => c === color))
          }}
        >
          <div
            className={cn("h-full w-full rounded-sm")}
            style={{ backgroundColor: color }}
          />
        </Button>
      ))}
    </div>
  )
}
