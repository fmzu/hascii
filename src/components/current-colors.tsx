import { Button } from "~/components/ui/button"

type Props = {
  colorKeys: string[]
  usedColors: Set<string | null>
  setColorId: (colorId: string) => void
  colors: Map<string, string>
}

export const CurrentColors = (props: Props) => {
  return (
    <div className="flex flex-wrap space-x-2">
      {props.colorKeys
        .filter((colorKey) => props.usedColors.has(colorKey))
        .map((colorKey) => (
          <div key={colorKey} className="flex items-center gap-2">
            <Button
              className="gap-x-2 items-center"
              variant={"outline"}
              onClick={() => props.setColorId(colorKey)}
              style={{ backgroundColor: "gray" }}
            >
              <div
                className="w-4 h-4"
                style={{ backgroundColor: props.colors.get(colorKey) }}
              />
              {colorKey}
            </Button>
          </div>
        ))}
    </div>
  )
}
