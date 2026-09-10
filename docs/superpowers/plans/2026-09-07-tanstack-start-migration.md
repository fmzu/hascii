# TanStack Start 移行 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** hascii のモノレポ（ui/ + api/）を廃止し、TanStack Start で単一 Cloudflare Worker に統合する

**Architecture:** TanStack Start（TanStack Router + Vite + Cloudflare Workers）でフルスタックアプリを構築。既存の Hono API ルートは `createServerFn` に変換し、React Router v7 のページは TanStack Router のファイルベースルーティングに移植する。認証は TanStack Start の `useSession` + `bcrypt-ts` で再実装。

**Tech Stack:** TanStack Start, TanStack Router, Drizzle ORM, Cloudflare Workers (D1), bcrypt-ts, valibot, shadcn/ui, Tailwind CSS, Biome

**Spec:** `docs/designs/2026-09-07-tanstack-start-migration.md`

## Global Constraints

- ランタイム: Cloudflare Workers（`nodejs_compat` フラグ必須）
- DB: Cloudflare D1（既存の `hascii` データベースをそのまま使用、database_id: `2731348d-c159-4b97-8d7d-e06dd4050bb8`）
- パッケージマネージャ: Bun
- Lint/Format: Biome
- 一関数一ファイルの原則に従う
- テストは Bun test で実行（`bun test`）
- 既存の DB データ・マイグレーションには手を加えない

---

### Task 1: プロジェクト初期化

**Files:**
- Create: `vite.config.ts`（ルート直下、新規）
- Create: `wrangler.jsonc`（ルート直下、新規）
- Create: `tsconfig.json`（ルート直下、新規）
- Create: `src/router.tsx`
- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx`（仮のトップページ）
- Create: `src/styles.css`
- Modify: `package.json`（依存の入れ替え）
- Delete: `ui/`（全体）
- Delete: `api/`（全体）
- Delete: `bunfig.toml`
- Delete: 旧 `wrangler.toml`（`ui/wrangler.toml`, `api/wrangler.toml`）

**Interfaces:**
- Produces: TanStack Start が `bun run dev` で起動し、`/` で仮のページが表示される状態

- [ ] **Step 1: 旧コードのバックアップブランチを作成**

```bash
cd /Users/f/hascii
git checkout -b backup/pre-tanstack-migration
git push origin backup/pre-tanstack-migration
git checkout main
git checkout -b feat/tanstack-start-migration
```

- [ ] **Step 2: 旧 ui/ と api/ のソースを一時退避**

```bash
mkdir -p /tmp/hascii-backup
cp -r ui /tmp/hascii-backup/ui
cp -r api /tmp/hascii-backup/api
```

- [ ] **Step 3: 旧ファイルを削除**

`ui/`、`api/`、`bunfig.toml` を削除する。`docs/`、`public/`、`.github/`、`biome.json`、`.gitignore` は残す。

```bash
rm -rf ui api bunfig.toml bun.lock node_modules
```

- [ ] **Step 4: package.json を書き換え**

```json
{
  "name": "hascii",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build && tsc --noEmit",
    "preview": "vite preview",
    "deploy": "bun run build && wrangler deploy",
    "format": "biome check --write --unsafe .",
    "test": "bun test",
    "cf-typegen": "wrangler types"
  },
  "dependencies": {
    "@tanstack/react-router": "^1",
    "@tanstack/react-start": "^1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "drizzle-orm": "^0.38.3",
    "bcrypt-ts": "^5.0.3",
    "valibot": "^1.0.0-beta.11",
    "@resvg/resvg-wasm": "^2.6.2",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-toggle": "^1.1.1",
    "@radix-ui/react-toggle-group": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.471.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "^1",
    "@cloudflare/workers-types": "^4.20250109.0",
    "@types/react": "^19.0.4",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.30.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.7.3",
    "vite": "^6.0.7",
    "wrangler": "^3.101.0"
  }
}
```

- [ ] **Step 5: wrangler.jsonc を作成**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "hascii",
  "compatibility_date": "2025-09-02",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "hascii",
      "database_id": "2731348d-c159-4b97-8d7d-e06dd4050bb8"
    }
  ]
}
```

- [ ] **Step 6: vite.config.ts を作成**

```typescript
import { cloudflare } from "@cloudflare/vite-plugin"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    react(),
  ],
  resolve: { alias: { "~": "/src" } },
})
```

- [ ] **Step 7: tsconfig.json を作成**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": { "~/*": ["./src/*"] }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 8: src/router.tsx を作成**

```tsx
import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })
  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

- [ ] **Step 9: src/routes/__root.tsx を作成**

```tsx
import { Meta, Scripts } from "@tanstack/react-start"
import { Outlet, createRootRoute } from "@tanstack/react-router"

export const Route = createRootRoute({
  component: RootLayout,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
  }),
})

function RootLayout() {
  return (
    <html lang="ja">
      <head>
        <Meta />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 10: src/routes/index.tsx を作成（仮トップページ）**

```tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  return <h1>{"hascii"}</h1>
}
```

- [ ] **Step 11: src/styles.css を旧 ui/app/root.css からコピー**

```bash
cp /tmp/hascii-backup/ui/app/root.css src/styles.css
```

- [ ] **Step 12: bun install して dev サーバー起動を確認**

```bash
bun install
bun run dev
```

ブラウザで `http://localhost:5173`（ポートは起動ログで確認）にアクセスし、「hascii」が表示されることを確認する。

- [ ] **Step 13: コミット**

```bash
git add -A
git commit -m "feat: TanStack Start プロジェクト初期化（旧 ui/api 削除）"
```

---

### Task 2: DB 層・サーバーライブラリ移植

**Files:**
- Create: `src/server/db/schema.ts`
- Create: `src/server/db/client.ts`
- Create: `drizzle.schema.ts`（ルート直下）
- Create: `drizzle.config.ts`
- Create: `drizzle.config.local.ts`
- Create: `src/server/lib/can-view-post.ts`
- Create: `src/server/lib/is-listable-post.ts`
- Create: `src/server/lib/generate-ogp-svg.ts`
- Create: `src/server/lib/render-svg-to-png.ts`
- Create: `src/server/lib/parse-dots-to-color-grid.ts`
- Create: `src/server/lib/xterm-colors.ts`
- Create: `src/server/lib/__tests__/can-view-post.test.ts`
- Create: `src/server/lib/__tests__/is-listable-post.test.ts`
- Create: `src/server/lib/__tests__/generate-ogp-svg.test.ts`
- Create: `src/server/lib/__tests__/parse-dots-to-color-grid.test.ts`
- Create: `src/server/lib/__tests__/xterm-colors.test.ts`

**Interfaces:**
- Produces: `getDb(env: Env): DrizzleD1Database` — D1 バインディングから Drizzle インスタンスを返す
- Produces: `schema` — Drizzle スキーマ（posts, users, likes テーブル定義）
- Produces: `canViewPost(post, isMine): boolean`
- Produces: `isListablePost(post): boolean`
- Produces: `generateOgpSvg(colorGrid): string`
- Produces: `renderSvgToPng(svg): Promise<Uint8Array>`
- Produces: `parseDotStringToColorGrid(dots, palette): (string|null)[][]`
- Produces: `xtermColors: string[]`

- [ ] **Step 1: drizzle.schema.ts をバックアップからコピー**

```bash
cp /tmp/hascii-backup/api/drizzle.schema.ts drizzle.schema.ts
```

ファイルの内容は変更なし。既存の `posts`, `users`, `likes` テーブルと各 `relations` 定義がそのまま入る。

- [ ] **Step 2: drizzle.config.ts と drizzle.config.local.ts をコピー**

```bash
cp /tmp/hascii-backup/api/drizzle.config.ts drizzle.config.ts
cp /tmp/hascii-backup/api/drizzle.config.local.ts drizzle.config.local.ts
```

- [ ] **Step 3: src/server/db/schema.ts を作成**

```typescript
export * as schema from "../../../drizzle.schema"
```

- [ ] **Step 4: src/server/db/client.ts を作成**

```typescript
import { drizzle } from "drizzle-orm/d1"
import { schema } from "~/server/db/schema"

export const getDb = (d1: D1Database) => {
  return drizzle(d1, { schema })
}
```

- [ ] **Step 5: サーバーライブラリをバックアップからコピー**

```bash
mkdir -p src/server/lib/__tests__
cp /tmp/hascii-backup/api/lib/can-view-post.ts src/server/lib/
cp /tmp/hascii-backup/api/lib/is-listable-post.ts src/server/lib/
cp /tmp/hascii-backup/api/lib/generate-ogp-svg.ts src/server/lib/
cp /tmp/hascii-backup/api/lib/render-svg-to-png.ts src/server/lib/
cp /tmp/hascii-backup/api/lib/parse-dots-to-color-grid.ts src/server/lib/
cp /tmp/hascii-backup/api/lib/xterm-colors.ts src/server/lib/
```

これらのファイルは外部依存が `@resvg/resvg-wasm` のみ（`render-svg-to-png.ts`）で、ロジックの変更は不要。

- [ ] **Step 6: テストをバックアップからコピー**

```bash
cp /tmp/hascii-backup/api/lib/__tests__/can-view-post.test.ts src/server/lib/__tests__/
cp /tmp/hascii-backup/api/lib/__tests__/is-listable-post.test.ts src/server/lib/__tests__/
cp /tmp/hascii-backup/api/lib/__tests__/generate-ogp-svg.test.ts src/server/lib/__tests__/
cp /tmp/hascii-backup/api/lib/__tests__/parse-dots-to-color-grid.test.ts src/server/lib/__tests__/
cp /tmp/hascii-backup/api/lib/__tests__/xterm-colors.test.ts src/server/lib/__tests__/
```

- [ ] **Step 7: テストのインポートパスを修正**

各テストファイルのインポートパスを旧 `~/lib/...` から `~/server/lib/...` に変更する。例:

```typescript
// Before
import { canViewPost } from "~/lib/can-view-post"
// After
import { canViewPost } from "~/server/lib/can-view-post"
```

全テストファイルで同様に修正。

- [ ] **Step 8: テスト実行**

```bash
bun test
```

全テストが PASS することを確認。

- [ ] **Step 9: コミット**

```bash
git add -A
git commit -m "feat: DB層とサーバーライブラリを移植"
```

---

### Task 3: 認証（セッション・ミドルウェア・ログイン・登録）

**Files:**
- Create: `src/server/auth/session.ts`
- Create: `src/server/auth/middleware.ts`
- Create: `src/server/functions/login.ts`
- Create: `src/server/functions/logout.ts`
- Create: `src/server/functions/create-user.ts`
- Create: `src/server/functions/get-current-user.ts`

**Interfaces:**
- Consumes: `getDb(d1)` from Task 2, `schema` from Task 2
- Produces: `useAppSession()` — 現在のセッションを取得・更新するヘルパー
- Produces: `authMiddleware` — `createMiddleware()` で定義。認証済みなら `{ session: { userId, email } }` を context に付与、未認証なら throw
- Produces: `loginFn(data: { email, password }): Promise<{ error?: string }>` — ログインサーバー関数
- Produces: `logoutFn(): Promise<void>` — ログアウトサーバー関数
- Produces: `createUserFn(data: { email, password }): Promise<{}>` — ユーザー登録サーバー関数
- Produces: `getCurrentUserFn(): Promise<User | null>` — 現在のログインユーザーを取得

- [ ] **Step 1: src/server/auth/session.ts を作成**

```typescript
import { useSession } from "@tanstack/react-start/server"

type SessionData = {
  userId: string
  email: string
}

export const useAppSession = () => {
  return useSession<SessionData>({
    password:
      process.env.AUTH_SECRET ??
      "fallback-secret-at-least-32-characters-long!!",
  })
}
```

- [ ] **Step 2: src/server/auth/middleware.ts を作成**

```typescript
import { createMiddleware } from "@tanstack/react-start"
import { useAppSession } from "~/server/auth/session"

export const authMiddleware = createMiddleware().server(async () => {
  const session = await useAppSession()
  if (!session.data.userId) {
    throw new Error("Unauthorized")
  }
  return { session: session.data }
})
```

- [ ] **Step 3: src/server/functions/login.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { compareSync } from "bcrypt-ts"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { useAppSession } from "~/server/auth/session"

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb((globalThis as any).__env__.DB)

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
```

注意: Cloudflare Workers での D1 バインディング取得方法は、TanStack Start + Cloudflare plugin の env アクセス方法に依存する。`getRequestEvent` や `getEvent` が使える場合はそちらを使う。実装時に TanStack Start の Cloudflare 連携ドキュメントで最新の取得方法を確認すること。

- [ ] **Step 4: src/server/functions/logout.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { useAppSession } from "~/server/auth/session"

export const logoutFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const session = await useAppSession()
    await session.clear()
    return {}
  },
)
```

- [ ] **Step 5: src/server/functions/create-user.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { genSaltSync, hashSync } from "bcrypt-ts"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"

export const createUserFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb((globalThis as any).__env__.DB)

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
```

- [ ] **Step 6: src/server/functions/get-current-user.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { useAppSession } from "~/server/auth/session"

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()
    if (!session.data.userId) {
      return null
    }

    const db = getDb((globalThis as any).__env__.DB)
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.data.userId))
      .get()

    if (user === undefined) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarIconUrl: user.avatarIconUrl,
    }
  },
)
```

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat: 認証（セッション・ミドルウェア・ログイン・登録）を実装"
```

---

### Task 4: サーバー関数移植（投稿 CRUD）

**Files:**
- Create: `src/server/functions/get-posts.ts`
- Create: `src/server/functions/get-post.ts`
- Create: `src/server/functions/create-post.ts`
- Create: `src/server/functions/update-post.ts`
- Create: `src/server/functions/delete-post.ts`
- Create: `src/server/functions/get-my-posts.ts`

**Interfaces:**
- Consumes: `getDb(d1)`, `schema`, `authMiddleware`, `canViewPost`, `isListablePost` from Tasks 2-3
- Produces: `getPostsFn(): Promise<Post[]>` — 公開・未削除の投稿一覧を返す
- Produces: `getPostFn(data: { postId }): Promise<Post & { isMine }>` — 単一投稿を返す（非公開は所有者のみ）
- Produces: `createPostFn(data: { dots, title, description, isPublic }): Promise<{ postId }>` — 認証必須
- Produces: `updatePostFn(data: { postId, dots, title, description, isPublic }): Promise<{}>` — 認証必須
- Produces: `deletePostFn(data: { postId }): Promise<{}>` — 認証必須
- Produces: `getMyPostsFn(): Promise<Post[]>` — 認証必須、自分の全投稿

- [ ] **Step 1: src/server/functions/get-posts.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { isListablePost } from "~/server/lib/is-listable-post"

export const getPostsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = getDb((globalThis as any).__env__.DB)

    const posts = await db.select().from(schema.posts)

    return posts.filter(isListablePost).map((post) => ({
      ...post,
    }))
  },
)
```

- [ ] **Step 2: src/server/functions/get-post.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { canViewPost } from "~/server/lib/can-view-post"
import { useAppSession } from "~/server/auth/session"

export const getPostFn = createServerFn({ method: "GET" })
  .validator((data: { postId: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb((globalThis as any).__env__.DB)

    const post = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, data.postId))
      .get()

    if (post === undefined) {
      throw new Error("Not found")
    }

    let isMine = false
    const session = await useAppSession()
    if (session.data.userId) {
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, session.data.userId))
        .get()
      if (user !== undefined) {
        isMine = post.userId === user.id
      }
    }

    if (!canViewPost(post, isMine)) {
      throw new Error("Not found")
    }

    return { ...post, isMine }
  })
```

- [ ] **Step 3: src/server/functions/create-post.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const createPostFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      dots: string
      title: string
      description: string
      isPublic: boolean
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const db = getDb((globalThis as any).__env__.DB)

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, context.session.userId))
      .get()

    if (user === undefined) {
      throw new Error("Unauthorized")
    }

    const postId = crypto.randomUUID()

    await db.insert(schema.posts).values({
      id: postId,
      userId: user.id,
      name: crypto.randomUUID(),
      dots: data.dots,
      title: data.title,
      description: data.description,
      regulation: "DEFAULT",
      isPublic: data.isPublic,
    })

    return { postId }
  })
```

- [ ] **Step 4: src/server/functions/update-post.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const updatePostFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      postId: string
      dots: string
      title: string
      description: string
      isPublic: boolean
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const db = getDb((globalThis as any).__env__.DB)

    await db
      .update(schema.posts)
      .set({
        dots: data.dots,
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
      })
      .where(eq(schema.posts.id, data.postId))

    return {}
  })
```

- [ ] **Step 5: src/server/functions/delete-post.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const deletePostFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { postId: string }) => data)
  .handler(async ({ context, data }) => {
    const db = getDb((globalThis as any).__env__.DB)

    await db.delete(schema.posts).where(eq(schema.posts.id, data.postId))

    return {}
  })
```

- [ ] **Step 6: src/server/functions/get-my-posts.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const getMyPostsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb((globalThis as any).__env__.DB)

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, context.session.userId))
      .get()

    if (user === undefined) {
      throw new Error("User not found")
    }

    const posts = await db.query.posts.findMany({
      where: eq(schema.posts.userId, user.id),
      orderBy: desc(schema.posts.createdAt),
    })

    return posts.map((post) => ({ isMine: true as const, ...post }))
  })
```

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat: 投稿 CRUD サーバー関数を移植"
```

---

### Task 5: サーバー関数移植（ユーザー・いいね・その他）

**Files:**
- Create: `src/server/functions/get-users.ts`
- Create: `src/server/functions/get-user.ts`
- Create: `src/server/functions/get-my-user.ts`
- Create: `src/server/functions/update-my-user.ts`
- Create: `src/server/functions/delete-my-user.ts`
- Create: `src/server/functions/get-post-likes.ts`
- Create: `src/server/functions/create-post-like.ts`
- Create: `src/server/functions/delete-post-like.ts`

**Interfaces:**
- Consumes: `getDb(d1)`, `schema`, `authMiddleware` from Tasks 2-3
- Produces: `getUsersFn(): Promise<{ id, name }[]>`
- Produces: `getUserFn(data: { userId }): Promise<{ id, name, avatarIconUrl }>`
- Produces: `getMyUserFn(): Promise<User>` — 認証必須
- Produces: `updateMyUserFn(data: { password }): Promise<{}>` — 認証必須
- Produces: `deleteMyUserFn(data: { userId }): Promise<{}>` — 認証必須
- Produces: `getPostLikesFn(data: { postId }): Promise<{}>`
- Produces: `createPostLikeFn(data: { postId }): Promise<{}>` — 認証必須
- Produces: `deletePostLikeFn(data: { postId, likeId }): Promise<{}>`

- [ ] **Step 1: src/server/functions/get-users.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"

export const getUsersFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = getDb((globalThis as any).__env__.DB)

    const users = await db.select().from(schema.users)

    return users.map((user) => ({
      id: user.id,
      name: user.name,
    }))
  },
)
```

- [ ] **Step 2: src/server/functions/get-user.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"

export const getUserFn = createServerFn({ method: "GET" })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb((globalThis as any).__env__.DB)

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
```

- [ ] **Step 3: src/server/functions/get-my-user.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const getMyUserFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb((globalThis as any).__env__.DB)

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, context.session.userId),
    })

    if (user === undefined) {
      throw new Error("Not found")
    }

    return { ...user }
  })
```

- [ ] **Step 4: src/server/functions/update-my-user.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { genSaltSync, hashSync } from "bcrypt-ts"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const updateMyUserFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { password: string }) => data)
  .handler(async ({ context, data }) => {
    const db = getDb((globalThis as any).__env__.DB)

    const salt = genSaltSync(10)
    const hashedPassword = hashSync(data.password, salt)

    await db
      .update(schema.users)
      .set({ hashedPassword })
      .where(eq(schema.users.id, context.session.userId))

    return {}
  })
```

- [ ] **Step 5: src/server/functions/delete-my-user.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const deleteMyUserFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { userId: string }) => data)
  .handler(async ({ context, data }) => {
    const db = getDb((globalThis as any).__env__.DB)

    await db.delete(schema.users).where(eq(schema.users.id, data.userId))

    return {}
  })
```

- [ ] **Step 6: src/server/functions/get-post-likes.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"

export const getPostLikesFn = createServerFn({ method: "GET" })
  .validator((data: { postId: string }) => data)
  .handler(async () => {
    return {}
  })
```

- [ ] **Step 7: src/server/functions/create-post-like.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { and, eq } from "drizzle-orm"
import { getDb } from "~/server/db/client"
import { schema } from "~/server/db/schema"
import { authMiddleware } from "~/server/auth/middleware"

export const createPostLikeFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { postId: string }) => data)
  .handler(async ({ context, data }) => {
    const db = getDb((globalThis as any).__env__.DB)

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, context.session.userId))
      .get()

    if (user === undefined) {
      throw new Error("Unauthorized")
    }

    const existing = await db
      .select()
      .from(schema.likes)
      .where(
        and(
          eq(schema.likes.userId, user.id),
          eq(schema.likes.postId, data.postId),
        ),
      )
      .get()

    if (existing !== undefined) {
      await db
        .update(schema.likes)
        .set({ isDeleted: true })
        .where(eq(schema.likes.id, existing.id))
    }

    return {}
  })
```

- [ ] **Step 8: src/server/functions/delete-post-like.ts を作成**

```typescript
import { createServerFn } from "@tanstack/react-start"

export const deletePostLikeFn = createServerFn({ method: "POST" })
  .validator((data: { postId: string; likeId: string }) => data)
  .handler(async () => {
    return {}
  })
```

- [ ] **Step 9: コミット**

```bash
git add -A
git commit -m "feat: ユーザー・いいねサーバー関数を移植"
```

---

### Task 6: UI コンポーネント・ユーティリティ・スタイル移植

**Files:**
- Create: `src/components/ui/` — shadcn/ui コンポーネント群（バックアップからコピー）
- Create: `src/components/` — カスタムコンポーネント（バックアップからコピー）
- Create: `src/utils/` — ユーティリティ関数（バックアップからコピー）
- Create: `src/hooks/` — カスタムフック（バックアップからコピー）
- Create: `src/types/` — 型定義（バックアップからコピー）
- Create: `src/lib/` — クライアント側ユーティリティ（utils.ts 等）
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `components.json`
- Create: `src/utils/__tests__/resolve-callback-url.test.ts`
- Create: `src/utils/__tests__/to-dots-from-string.test.ts`
- Create: `src/utils/export/__tests__/to-png-layout.test.ts`

**Interfaces:**
- Produces: shadcn/ui 全コンポーネント、カスタムコンポーネント、ユーティリティ関数が `~/components/`, `~/utils/`, `~/hooks/`, `~/types/`, `~/lib/` からインポート可能な状態

- [ ] **Step 1: Tailwind 設定ファイルをコピー**

```bash
cp /tmp/hascii-backup/ui/tailwind.config.ts tailwind.config.ts
cp /tmp/hascii-backup/ui/components.json components.json
```

`tailwind.config.ts` の `content` パスを `./src/**/*.{ts,tsx}` に修正する。
`components.json` の `aliases.components` を `~/components` に、`aliases.utils` を `~/lib/utils` に修正する。

postcss.config.js を作成:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 2: shadcn/ui コンポーネントをコピー**

```bash
mkdir -p src/components/ui
cp /tmp/hascii-backup/ui/app/components/ui/*.tsx src/components/ui/
```

- [ ] **Step 3: カスタムコンポーネントをコピー**

```bash
cp /tmp/hascii-backup/ui/app/components/ascii-*.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/canvas-*.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/clear-canvas-button.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/copy-button.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/current-colors.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/dot-size-select-button.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/editor-header.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/eraser-button.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/nes-color-palette.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/react-canvas.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/url-copy-band.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/xterm-color-palette.tsx src/components/
cp /tmp/hascii-backup/ui/app/components/xterm-color-slider.tsx src/components/
```

- [ ] **Step 4: ユーティリティ・フック・型定義をコピー**

```bash
mkdir -p src/utils/export/__tests__ src/utils/__tests__ src/hooks src/types src/lib/canvas
cp /tmp/hascii-backup/ui/app/utils/*.ts src/utils/
cp /tmp/hascii-backup/ui/app/utils/*.tsx src/utils/
cp /tmp/hascii-backup/ui/app/utils/__tests__/*.ts src/utils/__tests__/
cp /tmp/hascii-backup/ui/app/utils/export/*.ts src/utils/export/
cp /tmp/hascii-backup/ui/app/utils/export/__tests__/*.ts src/utils/export/__tests__/
cp /tmp/hascii-backup/ui/app/hooks/*.ts src/hooks/
cp /tmp/hascii-backup/ui/app/hooks/*.tsx src/hooks/
cp /tmp/hascii-backup/ui/app/types/*.ts src/types/
cp /tmp/hascii-backup/ui/app/lib/utils.ts src/lib/
cp /tmp/hascii-backup/ui/app/lib/canvas/*.ts src/lib/canvas/
```

- [ ] **Step 5: インポートパスの修正**

全ファイルのインポートパスを確認。旧 `~/routes/...` からのインポート（ルートコンポーネント間の依存）は、コンポーネントが `~/components/` に移動したことに合わせて修正する。`react-router` からのインポート（`Link`, `useNavigate`, `useParams` 等）はまだ修正しない（Task 7 で対応）。

- [ ] **Step 6: テスト実行**

```bash
bun test
```

ユーティリティのテスト（`resolve-callback-url`, `to-dots-from-string`, `to-png-layout`）と Task 2 のサーバーライブラリテストが全て PASS することを確認。

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat: UIコンポーネント・ユーティリティ・スタイルを移植"
```

---

### Task 7: ページルート移植

**Files:**
- Modify: `src/routes/__root.tsx`（Toaster、CSS import 追加）
- Create: `src/routes/index.tsx`（トップページ本実装）
- Create: `src/routes/dot/index.tsx`
- Create: `src/routes/dot/$dot.tsx`
- Create: `src/routes/dots/$code.tsx`
- Create: `src/routes/posts/$post/index.tsx`
- Create: `src/routes/posts/$post/edit.tsx`
- Create: `src/routes/my/posts/index.tsx`
- Create: `src/routes/my/posts/$post.tsx`
- Create: `src/routes/my/posts.tsx`（レイアウト）
- Create: `src/routes/my.tsx`（認証ガード）
- Create: `src/routes/sign/in.tsx`
- Create: `src/routes/sign/up.tsx`
- Create: `src/routes/users/$user.tsx`
- Create: `src/routes/ascii.tsx`
- Create: `src/routes/map.tsx`
- Create: `src/components/main-header.tsx`（旧 `_main/components/main-header.tsx`）
- Create: 各ルート固有コンポーネント

**Interfaces:**
- Consumes: 全サーバー関数（Tasks 3-5）、全コンポーネント（Task 6）

ページルートの移植は以下のパターンで機械的に行う。各ページで:
1. `react-router` → `@tanstack/react-router` のインポートに差し替え
2. `Link` → TanStack Router の `Link`
3. `useNavigate` → TanStack Router の `useNavigate`
4. `useParams` → `Route.useParams()`
5. `useLoaderData` → `Route.useLoaderData()`
6. `loader` 関数 → `createFileRoute` の `loader` オプション内でサーバー関数呼び出し
7. `useQuery` / `useMutation`（React Query）→ サーバー関数を直接呼ぶか、必要に応じてローダー/ミューテーション

- [ ] **Step 1: src/routes/__root.tsx を更新（CSS + Toaster）**

```tsx
import { Meta, Scripts } from "@tanstack/react-start"
import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Toaster } from "~/components/ui/sonner"
import "~/styles.css"

export const Route = createRootRoute({
  component: RootLayout,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
  }),
})

function RootLayout() {
  return (
    <html lang="ja">
      <head>
        <Meta />
      </head>
      <body>
        <Outlet />
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: src/components/main-header.tsx を移植**

旧 `ui/app/routes/_main/components/main-header.tsx` をコピーし:
- `react-router` の `Link` → `@tanstack/react-router` の `Link`
- `@hono/auth-js/react` の `useSession` → `getCurrentUserFn` をサーバー関数で呼ぶか、親ルートの loader から context で渡す

- [ ] **Step 3: src/routes/index.tsx を本実装**

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { getPostsFn } from "~/server/functions/get-posts"
import { DotPreviewCanvas } from "~/components/dot-preview-canvas"
import { MainHeader } from "~/components/main-header"

export const Route = createFileRoute("/")({
  loader: () => getPostsFn(),
  component: HomePage,
})

function HomePage() {
  const posts = Route.useLoaderData()

  return (
    <>
      <MainHeader />
      <div className="container px-8 pb-4">
        <Link to="/dot">
          <Button>{"描いてみる"}</Button>
        </Link>
      </div>
      <main className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-16 px-8 pb-8 container">
        {posts.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <Card className="bg-gray-200 overflow-hidden shadow-md hover:scale-105 duration-100">
              <div className="overflow-hidden rounded-md">
                <DotPreviewCanvas dots={post.dots} />
              </div>
            </Card>
            <div className="pl-4">
              <Card className="bg-gray-100 rounded-t-none rounded-b-sm shadow-md px-2 w-3/5">
                <h1 className="text-xs">{post.title || " "}</h1>
              </Card>
            </div>
          </Link>
        ))}
      </main>
    </>
  )
}
```

- [ ] **Step 4: 残りの全ページルートを移植**

以下の各ファイルを、上記のパターン（react-router → TanStack Router、useQuery → loader/サーバー関数）で機械的に書き換える。バックアップからコピーして修正する方式:

- `src/routes/dot/index.tsx` — リダイレクトロジック
- `src/routes/dot/$dot.tsx` — DotWorkspace を表示
- `src/routes/dots/$code.tsx` — DotWorkspace を表示
- `src/routes/posts/$post/index.tsx` — 投稿詳細（loader で `getPostFn`、OGP meta）
- `src/routes/posts/$post/edit.tsx` — 投稿編集
- `src/routes/my.tsx` — 認証ガード（`getCurrentUserFn` でチェック）
- `src/routes/my/posts.tsx` — サイドバーレイアウト（`getMyPostsFn` でサイドバー）
- `src/routes/my/posts/index.tsx` — 新規投稿エディタ
- `src/routes/my/posts/$post.tsx` — 投稿編集
- `src/routes/sign/in.tsx` — ログイン（`loginFn` を呼ぶ）
- `src/routes/sign/up.tsx` — 登録（`createUserFn` を呼ぶ）
- `src/routes/users/$user.tsx` — ユーザーページ
- `src/routes/ascii.tsx` — ASCII エディタ
- `src/routes/map.tsx` — 空ページ

各ページの移植時の変更点は共通:
- `import { Link, useNavigate, useParams, useLoaderData } from "react-router"` → `import { Link, useNavigate, createFileRoute } from "@tanstack/react-router"`
- `useQuery({ queryFn: () => client.xxx.$get() })` → ローダー内で対応するサーバー関数を呼び出し
- `useMutation({ mutationFn: () => client.xxx.$post() })` → サーバー関数を直接呼び出し（`useState` + `try/catch` で管理、または TanStack Router の action パターン）
- `import { signIn } from "@hono/auth-js/react"` → `loginFn` を呼び出し
- `import { useSession } from "@hono/auth-js/react"` → `getCurrentUserFn` で認証状態を取得
- `DotPreviewCanvas` は `~/routes/_main._index/components/` から `~/components/` に移動済み

**sign/in.tsx の具体例（ログインページ）:**

```tsx
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { toast } from "sonner"
import { loginFn } from "~/server/functions/login"
import { resolveCallbackUrl } from "~/utils/resolve-callback-url"

export const Route = createFileRoute("/sign/in")({
  component: SignInPage,
  validateSearch: (search: Record<string, unknown>) => ({
    callbackUrl: (search.callbackUrl as string) || "/",
  }),
})

function SignInPage() {
  const navigate = useNavigate()
  const { callbackUrl } = Route.useSearch()
  const resolved = resolveCallbackUrl(callbackUrl)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  const onSubmit = async () => {
    setPending(true)
    const result = await loginFn({ data: { email, password } })
    setPending(false)
    if (result.error) {
      toast(result.error)
      return
    }
    navigate({ to: resolved })
  }

  return (
    <div className="mx-auto max-w-xs space-y-4 p-4 pt-40">
      <h1 className="font-bold">{"HASCII"}</h1>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <Input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button disabled={!email || !password || pending} type="submit" className="w-full">
          {"ログイン"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: ルート固有コンポーネントを移植**

旧 `ui/app/routes/*/components/` 内のコンポーネントを適切な場所に移動:

- `_main._index/components/dot-preview-canvas.tsx` → `src/components/dot-preview-canvas.tsx`
- `_main.dot._index/components/dot-workspace.tsx` → `src/components/dot-workspace.tsx`
- `_main.dot._index/components/dot-canvas.tsx` → `src/components/dot-canvas.tsx`
- `_main.dot._index/components/export-menu.tsx` → `src/components/export-menu.tsx`
- `_main.dot._index/components/login-required-dialog.tsx` → `src/components/login-required-dialog.tsx`
- `_main.dot._index/components/post-dialog.tsx` → `src/components/post-dialog.tsx`
- `_main.posts.$post._index/components/delete-dialog.tsx` → `src/components/delete-dialog.tsx`
- `_main.posts.$post._index/components/settings-card.tsx` → `src/components/settings-card.tsx`
- `_main.posts.$post.edit/components/dot-edit-canvas.tsx` → `src/components/dot-edit-canvas.tsx`
- `_main/components/avatar-popover.tsx` → `src/components/avatar-popover.tsx`
- `my.posts._index/components/dot-editor.tsx` → `src/components/dot-editor.tsx`
- `my.posts._index/components/dot-xterm-color-palette.tsx` → `src/components/dot-xterm-color-palette.tsx`
- `my.posts._index/components/new-header.tsx` → `src/components/new-header.tsx`
- `my.posts._index/components/post-dialog.tsx` → `src/components/my-post-dialog.tsx`（名前衝突回避）

各コンポーネントの `react-router` インポートと `hono/client` 呼び出しを書き換え。

- [ ] **Step 6: 旧 client.ts / loader-client.ts を削除確認**

これらは hono/client に依存しており、不要になる。対応するサーバー関数への置き換えが全て完了していることを確認。

- [ ] **Step 7: dev サーバーで全ページの表示を確認**

```bash
bun run dev
```

以下を手動確認:
- `/` — トップページ（投稿一覧はDBがローカルにないため空でOK、エラーにならないこと）
- `/dot` → `/dot/---...` にリダイレクト
- `/sign/in` — ログインフォーム表示
- `/sign/up` — 登録フォーム表示
- `/ascii` — ASCII エディタ表示

- [ ] **Step 8: コミット**

```bash
git add -A
git commit -m "feat: 全ページルートを TanStack Router に移植"
```

---

### Task 8: OGP サーバールート + CI/CD + 最終確認

**Files:**
- Create: `src/routes/ogp/$dots.tsx`（サーバールート: PNG を返す）
- Modify: `.github/workflows/deploy.yml`
- Delete: 不要になったファイルの最終クリーンアップ

**Interfaces:**
- Consumes: `parseDotStringToColorGrid`, `generateOgpSvg`, `renderSvgToPng`, `xtermColors` from Task 2

- [ ] **Step 1: src/routes/ogp/$dots.tsx を作成（OGP サーバールート）**

OGP はブラウザではなく外部クローラーが叩くので、HTMLページではなく PNG バイナリを返すサーバールートとして実装する:

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { parseDotStringToColorGrid } from "~/server/lib/parse-dots-to-color-grid"
import { generateOgpSvg } from "~/server/lib/generate-ogp-svg"
import { renderSvgToPng } from "~/server/lib/render-svg-to-png"
import { xtermColors } from "~/server/lib/xterm-colors"

export const Route = createFileRoute("/ogp/$dots")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const colorGrid = parseDotStringToColorGrid(params.dots, xtermColors)
        const svg = generateOgpSvg(colorGrid)
        const png = await renderSvgToPng(svg)

        return new Response(png, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
      },
    },
  },
})
```

注意: Cloudflare Cache API の `caches.default` を使ったキャッシュは、TanStack Start のサーバールートでのアクセス方法を実装時に確認すること。`Cache-Control` ヘッダーで CDN キャッシュを効かせる方式で代替可能。

- [ ] **Step 2: 投稿詳細ページの OGP meta を更新**

`src/routes/posts/$post/index.tsx` の `head` 関数で、OGP 画像 URL を `/ogp/{dots}` に設定する（旧: `${VITE_API_URL}/ogp/${dots}`、新: 同一オリジンの `/ogp/${dots}`）:

```tsx
export const Route = createFileRoute("/posts/$post/")({
  loader: ({ params }) => getPostFn({ data: { postId: params.post } }),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title ?? "HASCII" },
      { property: "og:title", content: loaderData?.title ?? "HASCII" },
      { property: "og:description", content: loaderData?.description || "HASCII" },
      { property: "og:image", content: loaderData?.dots ? `/ogp/${loaderData.dots}` : "" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostDetailPage,
})
```

同様に `src/routes/dot/$dot.tsx` の OGP meta も `/ogp/${dots}` に更新。

- [ ] **Step 3: .github/workflows/deploy.yml を更新**

```yaml
name: デプロイ

on:
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  check:
    name: チェック
    runs-on: ubuntu-latest
    steps:
      - name: チェックアウト
        uses: actions/checkout@v4
      - name: Bunを有効にする
        uses: oven-sh/setup-bun@v1
      - name: インストール
        run: bun install
      - name: テスト
        run: bun test
  deploy:
    name: デプロイ
    needs: check
    runs-on: ubuntu-latest
    steps:
      - name: チェックアウト
        uses: actions/checkout@v4
      - name: Bunを有効にする
        uses: oven-sh/setup-bun@v1
      - name: インストール
        run: bun install
      - name: ビルド
        run: bun run build
      - name: デプロイ
        uses: cloudflare/wrangler-action@v3
        with:
          packageManager: bun
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
```

旧 CI の 2 段デプロイ（API + UI）が 1 段に簡素化される。

- [ ] **Step 4: 不要ファイルの最終クリーンアップ**

以下が残っていないことを確認:
- `ui/`, `api/` ディレクトリ
- `bunfig.toml`
- 旧 `wrangler.toml`（`ui/wrangler.toml`, `api/wrangler.toml`）

`/tmp/hascii-backup` が残っているが、プロジェクト外なので放置で問題ない。

- [ ] **Step 5: テスト実行**

```bash
bun test
```

全テストが PASS することを確認。

- [ ] **Step 6: ビルド確認**

```bash
bun run build
```

ビルドがエラーなく完了することを確認。

- [ ] **Step 7: dev サーバーでの最終動作確認**

```bash
bun run dev
```

以下の全ページを手動で確認（ローカル D1 がある場合はフルテスト、ない場合はページ表示のみ）:
- `/` — トップページ
- `/dot` → `/dot/---...` にリダイレクト、エディタが動作
- `/sign/in` — ログインフォーム
- `/sign/up` — 登録フォーム
- `/ascii` — ASCII エディタ
- `/posts/{id}` — 投稿詳細
- `/my/posts` — 認証ガードが機能

- [ ] **Step 8: コミット**

```bash
git add -A
git commit -m "feat: OGPサーバールート・CI/CD更新・最終クリーンアップ"
```

- [ ] **Step 9: spec.md の技術構成を更新**

`docs/spec.md` の「技術構成」セクションを更新:

```markdown
## 技術構成

- 言語: TypeScript
- ランタイム: Cloudflare Workers
- 構成: 単一Worker（TanStack Start）
- DB: Drizzle ORM + Cloudflare D1
- 認証: セッション + bcrypt-ts（Credentials）
- その他: パッケージマネージャは Bun、Lint/Format は Biome
```

- [ ] **Step 10: コミット**

```bash
git add docs/spec.md
git commit -m "docs: spec.md の技術構成を TanStack Start に更新"
```
