import { relations, sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const posts = sqliteTable("posts", {
  id: text("uuid", { length: 36 }).notNull().unique(),
  name: text("name", { length: 256 }).notNull(),
  userId: text("user_id", { length: 36 }).notNull(),
  dots: text("dots", { length: 1024 }).notNull(),
  regulation: text("regulation", { length: 256 }).notNull(),
  title: text("title", { length: 256 }),
  description: text("description", { length: 256 }),
  /**
   * 公開するかどうか
   */
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  isDeleted: integer("is_deleted", { mode: "boolean" })
    .notNull()
    .default(false),
})

export const postRelations = relations(posts, (fn) => {
  return {
    likes: fn.many(likes),
    user: fn.one(users, { fields: [posts.userId], references: [users.id] }),
  }
})

export const users = sqliteTable("users", {
  id: text("uuid", { length: 36 }).notNull().unique(),
  name: text("name", { length: 256 }).notNull(),
  avatarIconUrl: text("avatar_icon_url", { length: 256 }),
  email: text("email", { length: 256 }).notNull().unique(),
  hashedPassword: text("hashed_password", { length: 256 }).notNull(),
  login: text("login", { length: 256 }).notNull().unique(),
  isDeleted: integer("is_deleted", { mode: "boolean" })
    .notNull()
    .default(false),
})

export const userRelations = relations(users, (fn) => {
  return {
    post: fn.many(posts),
    like: fn.many(likes),
  }
})

export const likes = sqliteTable("likes", {
  id: text("uuid", { length: 256 }).notNull().unique(),
  postId: text("post_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  isDeleted: integer("is_deleted", { mode: "boolean" })
    .notNull()
    .default(false),
})

export const likeRelations = relations(likes, (fn) => {
  return {
    post: fn.one(posts, { fields: [likes.postId], references: [posts.id] }),
    user: fn.one(users, { fields: [likes.userId], references: [users.id] }),
  }
})
