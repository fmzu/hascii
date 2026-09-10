import { createFileRoute } from "@tanstack/react-router"
import { DotWorkspace } from "~/components/dot-workspace"
import { getCurrentUserFn } from "~/server/functions/get-current-user"

export const Route = createFileRoute("/dots/$code")({
  loader: async () => {
    const user = await getCurrentUserFn()
    return { isAuthenticated: user !== null }
  },
  component: DotsCodePage,
})

function DotsCodePage() {
  const { code } = Route.useParams()
  const { isAuthenticated } = Route.useLoaderData()

  return (
    <main>
      <DotWorkspace code={code} isAuthenticated={isAuthenticated} />
    </main>
  )
}
