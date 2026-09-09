import { Button } from "~/components/ui/button"

type Props = {
  resizeGrid: (size: number) => void
  rowsCount: number
}

export const AsciiSizeSelectButton = (props: Props) => {
  return (
    <div className="flex space-x-2 overflow-hidden">
      {/* サイズを変更するボタンを追加します */}
      <Button
        onClick={() => props.resizeGrid(8)}
        style={{
          border: props.rowsCount === 8 ? "4px solid white" : "none",
        }}
      >
        {"8x8"}
      </Button>
      <Button
        onClick={() => props.resizeGrid(16)}
        style={{
          border: props.rowsCount === 16 ? "4px solid white" : "none",
        }}
      >
        {"16x16"}
      </Button>
      <Button
        onClick={() => props.resizeGrid(32)}
        style={{
          border: props.rowsCount === 32 ? "4px solid white" : "none",
        }}
      >
        {"32x32"}
      </Button>
      <Button
        onClick={() => props.resizeGrid(64)}
        style={{
          border: props.rowsCount === 64 ? "4px solid white" : "none",
        }}
      >
        {"64x64"}
      </Button>
    </div>
  )
}
