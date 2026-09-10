import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { getCurrentUserFn } from "~/server/functions/get-current-user"

export const Route = createFileRoute("/my")({
  beforeLoad: async () => {
    const user = await getCurrentUserFn()
    if (!user) {
      throw redirect({ to: "/sign/in", search: { callbackUrl: "/my" } })
    }
    return { user }
  },
  component: MyLayout,
})

function MyLayout() {
  return <Outlet />
}
