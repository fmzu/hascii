import { createServerFn } from "@tanstack/react-start"
import { compareSync } from "bcrypt-ts"
import { eq } from "drizzle-orm"
import { getRequestDb } from "~/server/db/get-request-db"
import { schema } from "~/server/db/schema"
import { useAppSession } from "~/server/auth/session"

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const db = getRequestDb()

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.email))
      .get()

    if (user === undefined) {
      return { error: "メールアドレスまたはパスワードが正しくありません" }
    }

    const valid = compareSync(data.password, user.hashedPassword)
    if (!valid) {
      return { error: "メールアドレスまたはパスワードが正しくありません" }
    }

    const session = await useAppSession()
    await session.update({ userId: user.id, email: user.email })

    return {}
  })
