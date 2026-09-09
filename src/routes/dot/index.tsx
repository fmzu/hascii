import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/dot/")({
  loader: () => {
    throw redirect({ to: "/dot/$dot", params: { dot: "-".repeat(63) } })
  },
})
