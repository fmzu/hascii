import { env } from "cloudflare:workers"
import { getDb } from "~/server/db/client"

export const getRequestDb = () => {
  return getDb(env.DB)
}
