import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"

export const getUserFn = createServerFn({ method: "GET" })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const db = getRequestDb()

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, data.userId))
      .get()

    if (user === undefined) {
      throw new Error("Not found")
    }

    return {
      id: user.id,
      name: user.name,
      avatarIconUrl: user.avatarIconUrl,
    }
  })
