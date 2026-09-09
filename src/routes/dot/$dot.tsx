import { createFileRoute } from "@tanstack/react-router"
import { DotWorkspace } from "~/components/dot-workspace"
import { getCurrentUserFn } from "~/server/functions/get-current-user"

export const Route = createFileRoute("/dot/$dot")({
  loader: async () => {
    const user = await getCurrentUserFn()
    return { isAuthenticated: user !== null }
  },
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
