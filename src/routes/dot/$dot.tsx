import { createFileRoute } from "@tanstack/react-router"
import { DotWorkspace } from "~/components/dot-workspace"
import { getCurrentUserFn } from "~/server/functions/get-current-user"

export const Route = createFileRoute("/dot/$dot")({
  loader: async () => {
    const user = await getCurrentUserFn()
    return { isAuthenticated: user !== null }
  },
  head: ({ params }) => ({
    meta: [
      { title: "HASCII" },
      { property: "og:title", content: "HASCII" },
      { property: "og:description", content: "ドット絵エディタ" },
      { property: "og:image", content: `/ogp/${params.dot}` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DotPage,
})

function DotPage() {
  const { dot } = Route.useParams()
  const { isAuthenticated } = Route.useLoaderData()

  return (
    <main>
      <DotWorkspace code={dot} isAuthenticated={isAuthenticated} />
    </main>
  )
}
