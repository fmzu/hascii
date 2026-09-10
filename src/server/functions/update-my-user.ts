import { createServerFn } from "@tanstack/react-start"
import { genSaltSync, hashSync } from "bcrypt-ts"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const updateMyUserFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { password: string }) => data)
  .handler(async ({ context, data }) => {
    const db = getRequestDb()

    const userId = context.session.userId
    if (!userId) {
      throw new Error("Unauthorized")
    }

    const salt = genSaltSync(10)
    const hashedPassword = hashSync(data.password, salt)

    await db
      .update(schema.users)
      .set({ hashedPassword })
      .where(eq(schema.users.id, userId))

    return {}
  })
