import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import type { EditorCell } from "~/types/editor-cell"
import { downloadDataUrl } from "~/utils/export/download-data-url"
import { renderPngDataUrl } from "~/utils/export/render-png-data-url"
import { toPngLayout } from "~/utils/export/to-png-layout"
import { toStringFromGrid } from "~/utils/to-string-from-grid"

type Props = {
  grid: EditorCell[][]
  colors: Map<string, string>
}

export const ExportMenu = (props: Props) => {
  const onExportPng = () => {
    const layout = toPngLayout(props.grid, props.colors, 16)
    const dataUrl = renderPngDataUrl(layout)
    downloadDataUrl(dataUrl, "hascii.png")
    toast("PNGを保存しました")
  }

  const onCopyString = () => {
    navigator.clipboard.writeText(toStringFromGrid(props.grid))
    toast("ドット文字列をコピーしました")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"secondary"}>{"エクスポート"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={"end"}>
        <DropdownMenuItem onClick={onExportPng}>{"PNG保存"}</DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyString}>
          {"ドット文字列コピー"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
