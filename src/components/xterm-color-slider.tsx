import { Slider } from "~/components/ui/slider"
import { cn } from "~/lib/utils"

// type Props = {
//   eraserMode: boolean
//   setEraserMode: (eraserMode: boolean) => void
// }

export const XtermColorSlider = () => {
  return (
    <div className="flex flex-col space-y-8 pt-8">
      <div className="flex space-x-8">
        <p>{"赤"}</p>
        <Slider defaultValue={[3]} max={6} step={1} className={cn("w-[60%]")} />
      </div>
      <div className="flex space-x-8">
        <p>{"青"}</p>
        <Slider defaultValue={[3]} max={6} step={1} className={cn("w-[60%]")} />
      </div>
      <div className="flex space-x-8">
        <p>{"黄"}</p>
        <Slider defaultValue={[3]} max={6} step={1} className={cn("w-[60%]")} />
      </div>
    </div>
  )
}
