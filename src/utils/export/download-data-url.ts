/**
 * dataURL をファイルとしてダウンロードさせる（ブラウザ専用）
 */
export const downloadDataUrl = (dataUrl: string, fileName: string): void => {
  const anchor = document.createElement("a")
  anchor.href = dataUrl
  anchor.download = fileName
  anchor.click()
}
