import { createMiddleware } from "@tanstack/react-start"
import { useAppSession } from "~/server/auth/session"

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const session = await useAppSession()
    if (!session.data.userId) {
      throw new Error("Unauthorized")
    }
    return next({ context: { session: session.data } })
  },
)
