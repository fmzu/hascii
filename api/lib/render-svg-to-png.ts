import { Resvg, initWasm } from "@resvg/resvg-wasm"
// @ts-ignore — resvg-wasm の index_bg.wasm を直接 import
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm"

let initialized = false

export const renderSvgToPng = async (svg: string): Promise<Uint8Array> => {
  if (!initialized) {
    await initWasm(resvgWasm)
    initialized = true
  }

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  })

  const rendered = resvg.render()
  return rendered.asPng()
}
