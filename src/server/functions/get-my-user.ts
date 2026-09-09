import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const getMyUserFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getRequestDb()

    const userId = context.session.userId
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get()

    if (user === undefined) {
      throw new Error("Not found")
    }

    return { ...user }
  })
