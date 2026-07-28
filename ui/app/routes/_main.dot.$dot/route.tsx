import { DotWorkspace } from "~/routes/_main.dot._index/components/dot-workspace"
import type { Route } from "./+types/route"

export function meta({ params }: Route.MetaArgs) {
  const apiUrl = import.meta.env.VITE_API_URL
  const dots = params.dot ?? ""
  const ogpImage = `${apiUrl}/ogp/${dots}`

  return [
    { title: "HASCII" },
    { property: "og:title", content: "HASCII" },
    { property: "og:description", content: "ドット絵エディタ" },
    { property: "og:image", content: ogpImage },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]
}

type Props = {
  params: {
    code: string
  }
}

export default function DotCodePage(props: Props) {
  return (
    <main>
      <DotWorkspace code={props.params.code} />
    </main>
  )
}
