import { createServerFn } from "@tanstack/react-start"
import { useAppSession } from "~/server/auth/session"

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession()
  await session.clear()
  return {}
})
