import type { PngLayout } from "~/utils/export/to-png-layout"

/**
 * PNG レイアウトを canvas に描画して dataURL を返す（ブラウザ専用）
 */
export const renderPngDataUrl = (layout: PngLayout): string => {
  const canvas = document.createElement("canvas")
  canvas.width = layout.width
  canvas.height = layout.height

  const context = canvas.getContext("2d")
  if (context === null) {
    throw new Error("canvas の 2d コンテキストを取得できませんでした")
  }

  context.fillStyle = layout.background
  context.fillRect(0, 0, layout.width, layout.height)

  for (const rect of layout.rects) {
    context.fillStyle = rect.color
    context.fillRect(rect.x, rect.y, rect.size, rect.size)
  }

  return canvas.toDataURL("image/png")
}
