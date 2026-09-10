import { createServerFn } from "@tanstack/react-start"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { isListablePost } from "~/server/lib/is-listable-post"

export const getPostsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = getRequestDb()

    const posts = await db.select().from(schema.posts)

    return posts.filter(isListablePost).map((post) => ({
      ...post,
    }))
  },
)
