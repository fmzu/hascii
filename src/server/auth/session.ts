import { useSession } from "@tanstack/react-start/server"

type SessionData = {
  userId: string
  email: string
}

export const useAppSession = () => {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is required")
  }

  return useSession<SessionData>({ password: secret })
}
