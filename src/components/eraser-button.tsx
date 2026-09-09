import { Button } from "~/components/ui/button"
import { EraserIcon } from "lucide-react"

type Props = {
  isActive: boolean
  onChange: (eraserMode: boolean) => void
}

export const EraserButton = (props: Props) => {
  return (
    <Button
      className="w-full"
      variant={props.isActive ? "default" : "secondary"}
      onClick={() => props.onChange(!props.isActive)}
    >
      <EraserIcon />
    </Button>
  )
}
