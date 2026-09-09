import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const deleteMyUserFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getRequestDb()

    const userId = context.session.userId
    if (!userId) {
      throw new Error("Unauthorized")
    }

    await db.delete(schema.users).where(eq(schema.users.id, userId))

    return {}
  })
