import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { canViewPost } from "~/server/lib/can-view-post"
import { useAppSession } from "~/server/auth/session"

export const getPostFn = createServerFn({ method: "GET" })
  .validator((data: { postId: string }) => data)
  .handler(async ({ data }) => {
    const db = getRequestDb()

    const post = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, data.postId))
      .get()

    if (post === undefined) {
      throw new Error("Not found")
    }

    let isMine = false
    const session = await useAppSession()
    if (session.data.userId) {
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, session.data.userId))
        .get()
      if (user !== undefined) {
        isMine = post.userId === user.id
      }
    }

    if (!canViewPost(post, isMine)) {
      throw new Error("Not found")
    }

    return { ...post, isMine }
  })
