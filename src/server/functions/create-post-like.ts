import { createServerFn } from "@tanstack/react-start"
import { and, eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const createPostLikeFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { postId: string }) => data)
  .handler(async ({ context, data }) => {
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
      throw new Error("Unauthorized")
    }

    const existing = await db
      .select()
      .from(schema.likes)
      .where(
        and(
          eq(schema.likes.userId, user.id),
          eq(schema.likes.postId, data.postId),
        ),
      )
      .get()

    if (existing !== undefined) {
      await db
        .update(schema.likes)
        .set({ isDeleted: true })
        .where(eq(schema.likes.id, existing.id))
    }

    return {}
  })
