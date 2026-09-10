import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const createPostFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      dots: string
      title: string
      description: string
      isPublic: boolean
    }) => data,
  )
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

    const postId = crypto.randomUUID()

    await db.insert(schema.posts).values({
      id: postId,
      userId: user.id,
      name: crypto.randomUUID(),
      dots: data.dots,
      title: data.title,
      description: data.description,
      regulation: "DEFAULT",
      isPublic: data.isPublic,
    })

    return { postId }
  })
