import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const updatePostFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      postId: string
      dots: string
      title: string
      description: string
      isPublic: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    const db = getRequestDb()

    await db
      .update(schema.posts)
      .set({
        dots: data.dots,
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
      })
      .where(eq(schema.posts.id, data.postId))

    return {}
  })
