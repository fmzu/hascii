import { createFileRoute } from "@tanstack/react-router"
import { AsciiWorkspace } from "~/components/ascii-workspace"

export const Route = createFileRoute("/ascii")({
  component: AsciiPage,
})

function AsciiPage() {
  return (
    <main>
      <AsciiWorkspace />
    </main>
  )
}
