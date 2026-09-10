import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const deletePostFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { postId: string }) => data)
  .handler(async ({ data }) => {
    const db = getRequestDb()

    await db.delete(schema.posts).where(eq(schema.posts.id, data.postId))

    return {}
  })
