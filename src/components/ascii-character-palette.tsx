import { AsciiCharacters } from "~/utils/ascii-characters"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

type Props = {
  char: string | null
  setChar: (colorId: string) => void
}

/**
 * アスキーアート用文字パレット
 * @param props
 * @returns
 */
export const AsciiCharacterPalette = (props: Props) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-8">
        {AsciiCharacters.map((char) => (
          <div key={char} className="flex">
            <Button
              className={cn(
                "w-full h-8 p-0",
                props.char !== null &&
                  props.char !== undefined &&
                  props.char === char
                  ? "border-4 border-white"
                  : "",
              )}
              variant={"ghost"}
              onClick={() => {
                props.setChar(char)
              }}
            >
              {char}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
