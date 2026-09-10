import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const getMyPostsFn = createServerFn({ method: "GET" })
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
      throw new Error("User not found")
    }

    const posts = await db.query.posts.findMany({
      where: eq(schema.posts.userId, user.id),
      orderBy: desc(schema.posts.createdAt),
    })

    return posts.map((post) => ({ isMine: true as const, ...post }))
  })
