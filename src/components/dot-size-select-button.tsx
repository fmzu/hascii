import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

type Props = {
  onChange(size: number): void
  value: number
}

export const DotSizeSelectButton = (props: Props) => {
  return (
    <div className="flex space-x-2 overflow-hidden">
      <Select
        value={props.value.toString()}
        onValueChange={(value) => {
          props.onChange(Number.parseInt(value))
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="絵の大きさ" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="8">{"8px"}</SelectItem>
            <SelectItem value="16">{"16px"}</SelectItem>
            <SelectItem value="32">{"32px"}</SelectItem>
            <SelectItem value="64">{"64px"}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
