import { verifyAuth } from "@hono/auth-js"
import { vValidator } from "@hono/valibot-validator"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { HTTPException } from "hono/http-exception"
import { boolean, object, string } from "valibot"
import { apiFactory } from "~/interface/api-factory"
import { isListablePost } from "~/lib/is-listable-post"
import { schema } from "~/lib/schema"

/**
 * 投稿を作成する
 */
export const POST = apiFactory.createHandlers(
  verifyAuth(),
  vValidator(
    "json",
    object({
      dots: string(),
      title: string(),
      description: string(),
      isPublic: boolean(),
    }),
  ),
  async (c) => {
    const auth = c.get("authUser")

    const authUserEmail = auth.token?.email ?? null

    if (authUserEmail === null) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    const json = c.req.valid("json")

    const db = drizzle(c.env.DB, { schema })

    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, authUserEmail),
    })

    if (user === undefined) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    const postId = crypto.randomUUID()

    await db.insert(schema.posts).values({
      id: postId,
      userId: user.id,
      name: crypto.randomUUID(),
      dots: json.dots,
      title: json.title,
      description: json.description,
      regulation: "DEFAULT",
      isPublic: json.isPublic,
    })

    return c.json({ postId: postId })
  },
)

/**
 * たくさんの投稿を取得する
 */
export const GET = apiFactory.createHandlers(async (c) => {
  const db = drizzle(c.env.DB, { schema })

  const posts = await db.select().from(schema.posts)

  const postsJson = posts.filter(isListablePost).map((post) => {
    return {
      ...post,
    }
  })

  return c.json(postsJson)
})
