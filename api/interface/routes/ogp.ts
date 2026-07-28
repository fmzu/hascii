import { vValidator } from "@hono/valibot-validator"
import { object, string } from "valibot"
import { apiFactory } from "~/interface/api-factory"
import { generateOgpSvg } from "~/lib/generate-ogp-svg"
import { parseDotStringToColorGrid } from "~/lib/parse-dots-to-color-grid"
import { renderSvgToPng } from "~/lib/render-svg-to-png"
import { xtermColors } from "~/lib/xterm-colors"

/**
 * ドット文字列からOGP画像（PNG）を生成する
 * Cloudflare Cache API でレスポンスをキャッシュする
 */
export const GET = apiFactory.createHandlers(
  vValidator("param", object({ dots: string() })),
  async (c) => {
    const dots = c.req.param("dots")

    const cacheKey = new Request(c.req.url)
    const cache = caches.default

    const cached = await cache.match(cacheKey)
    if (cached) {
      return cached
    }

    const colorGrid = parseDotStringToColorGrid(dots, xtermColors)
    const svg = generateOgpSvg(colorGrid)
    const png = await renderSvgToPng(svg)

    const response = new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })

    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()))

    return response
  },
)
