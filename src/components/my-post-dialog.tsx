import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { DotPreviewCanvas } from "~/components/dot-preview-canvas"

type Props = {
  onSubmit: () => void
  dots: string
  title: string
  setTitle: (title: string) => void
  description: string
  setDescription: (description: string) => void
  isPublic: boolean
  setIsPublic: (isPublic: boolean) => void
}

export function PostDialog(props: Props) {
  const toggleIsPublic = () => {
    props.setIsPublic(!props.isPublic)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{"保存"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"作品"}</DialogTitle>
        </DialogHeader>
        <Card className="bg-gray-200 overflow-hidden shadow-md">
          <div className="overflow-hidden rounded-md">
            <DotPreviewCanvas dots={props.dots} />
          </div>
        </Card>
        <div>
          <p>{"作品のタイトル"}</p>
          <Input
            type="text"
            placeholder="作品のタイトル"
            value={props.title}
            onChange={(e) => {
              props.setTitle(e.target.value)
            }}
          />
        </div>
        <div>
          <p>{"作品の詳細"}</p>
          <Textarea
            placeholder="作品の詳細"
            value={props.description}
            onChange={(e) => {
              props.setDescription(e.target.value)
            }}
          />
        </div>
        <div>
          <p>{"作品の公開"}</p>
          <div className="flex gap-x-4 items-center">
            <Switch id="isPublic" onClick={toggleIsPublic} />
            <p className="text-sm">{"作品を公開する"}</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              props.onSubmit()
            }}
            className="w-full"
          >
            {"保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
