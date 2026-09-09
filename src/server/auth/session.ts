import { useSession } from "@tanstack/react-start/server"

type SessionData = {
  userId: string
  email: string
}

export const useAppSession = () => {
  return useSession<SessionData>({
    password:
      process.env.AUTH_SECRET ??
      "fallback-secret-at-least-32-characters-long!!",
  })
}
