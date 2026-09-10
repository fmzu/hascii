import { createServerFn } from "@tanstack/react-start"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"

export const getUsersFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = getRequestDb()

    const users = await db.select().from(schema.users)

    return users.map((user) => ({
      id: user.id,
      name: user.name,
    }))
  },
)
