import { drizzle } from "drizzle-orm/d1"
import { schema } from "~/server/db/schema"

export const getDb = (d1: D1Database) => {
  return drizzle(d1, { schema })
}
