import { nesColorKeys } from "~/utils/nes-color-keys"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

type Props = {
  colors: Map<string, string>
  colorId: string
  setColorId: (colorId: string) => void
}

export const NesColorPalette = (props: Props) => {
  return (
    <div className="grid grid-cols-4">
      {nesColorKeys.map((color) => (
        <div key={color} className="flex">
          <Button
            className={cn(
              "w-full h-8 p-0",
              props.colorId === color ? "border-4 border-white" : "",
            )}
            key={color}
            variant={"default"}
            onClick={() => props.setColorId(color)}
            style={{ backgroundColor: props.colors.get(color) }}
          />
        </div>
      ))}
    </div>
  )
}
