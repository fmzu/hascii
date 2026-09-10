import { createFileRoute } from "@tanstack/react-router"
import { parseDotStringToColorGrid } from "~/server/lib/parse-dots-to-color-grid"
import { generateOgpSvg } from "~/server/lib/generate-ogp-svg"
import { renderSvgToPng } from "~/server/lib/render-svg-to-png"
import { xtermColors } from "~/server/lib/xterm-colors"

export const Route = createFileRoute("/ogp/$dots")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const colorGrid = parseDotStringToColorGrid(params.dots, xtermColors)
        const svg = generateOgpSvg(colorGrid)
        const png = await renderSvgToPng(svg)

        return new Response(new Uint8Array(png), {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
      },
    },
  },
})
