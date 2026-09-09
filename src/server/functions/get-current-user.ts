import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { useAppSession } from "~/server/auth/session"

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()
    if (!session.data.userId) {
      return null
    }

    const db = getRequestDb()
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.data.userId))
      .get()

    if (user === undefined) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarIconUrl: user.avatarIconUrl,
    }
  },
)
