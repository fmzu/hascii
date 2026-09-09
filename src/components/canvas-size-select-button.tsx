import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

type Props = {
  onChange: (size: number) => void
  value: number
}

export const CanvasSizeSelectButton = (props: Props) => {
  return (
    <div className="flex space-x-2 overflow-hidden">
      <Select
        value={props.value.toString()}
        onValueChange={(value) => {
          props.onChange(Number.parseInt(value))
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="サイズ選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              value="8"
              onClick={() => {
                props.onChange(8)
              }}
              style={{
                border: props.value === 8 ? "4px solid white" : "none",
              }}
            >
              {"8x8"}
            </SelectItem>
            <SelectItem
              value="16"
              onClick={() => props.onChange(16)}
              style={{
                border: props.value === 16 ? "4px solid white" : "none",
              }}
            >
              {"16x16"}
            </SelectItem>
            <SelectItem
              value="32"
              onClick={() => props.onChange(32)}
              style={{
                border: props.value === 32 ? "4px solid white" : "none",
              }}
            >
              {"32x32"}
            </SelectItem>
            <SelectItem
              value="64"
              onClick={() => props.onChange(64)}
              style={{
                border: props.value === 64 ? "4px solid white" : "none",
              }}
            >
              {"64x64"}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
