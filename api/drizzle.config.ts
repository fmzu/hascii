import type { Config } from "drizzle-kit"

export default {
  dialect: "sqlite",
  schema: "drizzle.schema.ts",
  out: "migrations",
  driver: "d1-http",
  dbCredentials: {
    accountId: "account-id",
    databaseId: "database-id",
    token: "token",
  },
} satisfies Config
