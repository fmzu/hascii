import { createServerFn } from "@tanstack/react-start"
import { genSaltSync, hashSync } from "bcrypt-ts"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"

export const createUserFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const db = getRequestDb()

    const salt = genSaltSync(10)
    const hashedPassword = hashSync(data.password, salt)
    const userId = crypto.randomUUID()

    await db.insert(schema.users).values({
      id: userId,
      email: data.email,
      hashedPassword: hashedPassword,
      login: crypto.randomUUID(),
      name: crypto.randomUUID(),
    })

    return {}
  })
