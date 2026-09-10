import { createFileRoute } from "@tanstack/react-router"
import { DotWorkspace } from "~/components/dot-workspace"
import { getCurrentUserFn } from "~/server/functions/get-current-user"
import { getSiteUrlFn } from "~/server/functions/get-site-url"

export const Route = createFileRoute("/dot/$dot")({
  loader: async () => {
    const [user, siteUrl] = await Promise.all([
      getCurrentUserFn(),
      getSiteUrlFn(),
    ])
    return { isAuthenticated: user !== null, siteUrl }
  },
  head: ({ params, loaderData }) => ({
    meta: [
      { title: "HASCII" },
      { property: "og:title", content: "HASCII" },
      { property: "og:description", content: "ドット絵エディタ" },
      {
        property: "og:image",
        content: loaderData?.siteUrl
          ? `${loaderData.siteUrl}/ogp/${params.dot}`
          : "",
      },
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
