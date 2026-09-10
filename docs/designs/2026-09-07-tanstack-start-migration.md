# hascii: TanStack Start 移行設計書

## 概要

モノレポ（`ui/` React Router v7 + `api/` Hono）を廃止し、TanStack Start で単一の Cloudflare Worker に統合する。

## 動機

- デプロイが 2 Worker に分かれており管理コストが高い
- CORS 設定が必要で、設定ミスによるセキュリティリスクがある
- 環境変数・D1バインディングを 2 箇所で管理している
- フロントとバックが別 Worker のため、認証Cookie のクロスオリジン設定が複雑

## 移行方針

Hono をミドルウェアとして残すのではなく、**全面的に TanStack Start に書き換える**。理由：

- Hono を残すと移行コストを払うのに TanStack Start の利点（型安全な RPC、ローダー統合）を得られない
- 依存ライブラリが減り、メンテナンス負荷が下がる

## 消えるもの

| 依存 | 理由 |
|------|------|
| `hono` / `@hono/auth-js` / `@hono/valibot-validator` | サーバー関数に置き換え |
| `@auth/core` | TanStack Start セッション管理に置き換え |
| `react-router` / `@react-router/*` | TanStack Router に置き換え |
| `@tanstack/react-query` | TanStack Start ローダーが代替 |
| `concurrently` | dev サーバーが 1 つになるため不要 |
| CORS 設定 | 同一 Worker のため不要 |

## 残すもの

| 依存 | 理由 |
|------|------|
| `drizzle-orm` / `drizzle-kit` | DB アクセス層。変更不要 |
| `bcrypt-ts` | パスワードハッシュ。変更不要 |
| `valibot` | バリデーション。サーバー関数の validator で使える |
| `shadcn/ui` + Radix + Tailwind | UIコンポーネント。そのまま移動 |
| `lucide-react` | アイコン。変更不要 |
| `@resvg/resvg-wasm` | OGP の SVG→PNG 変換。変更不要 |

## プロジェクト構造

```
hascii/
  src/
    routes/                  ← ページ（TanStack Router ファイルベース）
      __root.tsx             ← ルートレイアウト（html, body, providers）
      index.tsx              ← トップページ
      dot/
        index.tsx            ← /dot（エディタ）
        $dot.tsx             ← /dot/:dot
      dots/
        $code.tsx            ← /dots/:code
      posts/
        $post/
          index.tsx          ← /posts/:post
          edit.tsx           ← /posts/:post/edit
      my/
        posts/
          index.tsx          ← /my/posts
          $post.tsx          ← /my/posts/:post
      sign/
        in.tsx               ← /sign/in
        up.tsx               ← /sign/up
      users/
        $user.tsx            ← /users/:user
      map.tsx                ← /map
      ascii.tsx              ← /ascii
    server/                  ← サーバーロジック
      functions/             ← createServerFn で定義
        get-posts.ts
        get-post.ts
        create-post.ts
        update-post.ts
        delete-post.ts
        get-my-posts.ts
        get-my-user.ts
        update-my-user.ts
        delete-my-user.ts
        get-post-likes.ts
        create-post-like.ts
        delete-post-like.ts
        get-users.ts
        create-user.ts
        get-user.ts
        get-ogp.ts
        login.ts
        logout.ts
      db/
        schema.ts            ← Drizzle スキーマ（既存のまま）
        client.ts            ← D1 から drizzle インスタンスを生成
      auth/
        session.ts           ← useAppSession（TanStack Start セッション）
        middleware.ts        ← authMiddleware（認証必須のサーバー関数用）
      lib/                   ← 既存の純関数を移動
        can-view-post.ts
        is-listable-post.ts
        generate-ogp-svg.ts
        render-svg-to-png.ts
        parse-dots-to-color-grid.ts
        xterm-colors.ts
    components/              ← UI コンポーネント（既存の ui/app/components/ を移動）
      ui/                    ← shadcn/ui
      ...
    hooks/                   ← カスタムフック
    utils/                   ← ユーティリティ関数
    types/                   ← 型定義
    lib/                     ← クライアント側ユーティリティ
    router.tsx               ← TanStack Router 設定
    start.ts                 ← TanStack Start 設定
    routeTree.gen.ts         ← 自動生成
    styles.css               ← グローバルCSS
  drizzle/                   ← マイグレーションファイル
  public/                    ← 静的アセット
  vite.config.ts
  wrangler.jsonc
  package.json
  tsconfig.json
  biome.json
```

## API 層の変換

### Hono ルート → サーバー関数 対応表

| Hono ルート | サーバー関数 | 認証 |
|-------------|-------------|------|
| `GET /posts` | `getPosts` | 不要 |
| `GET /posts/:post` | `getPost` | 不要（非公開は所有者のみ） |
| `POST /posts` | `createPost` | 必須 |
| `PUT /posts/:post` | `updatePost` | 必須 |
| `DELETE /posts/:post` | `deletePost` | 必須 |
| `GET /posts/:post/likes` | `getPostLikes` | 不要 |
| `POST /posts/:post/likes` | `createPostLike` | 必須 |
| `DELETE /posts/:post/likes/:like` | `deletePostLike` | 必須 |
| `GET /my/user` | `getMyUser` | 必須 |
| `PUT /my/user` | `updateMyUser` | 必須 |
| `DELETE /my/user` | `deleteMyUser` | 必須 |
| `GET /my/posts` | `getMyPosts` | 必須 |
| `GET /users` | `getUsers` | 不要 |
| `POST /users` | `createUser` | 不要（新規登録） |
| `GET /user/:user` | `getUser` | 不要 |
| `GET /ogp/:dots` | `getOgp` | 不要 |

### サーバー関数のパターン

認証不要:
```typescript
export const getPosts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb()
    // 既存のクエリロジックをそのまま移植
  })
```

認証必須:
```typescript
export const createPost = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data) => v.parse(createPostSchema, data))
  .handler(async ({ context, data }) => {
    const db = getDb()
    // context.session.userId が使える
  })
```

## 認証

### セッション管理

TanStack Start の `useSession` を使う。

```typescript
// src/server/auth/session.ts
import { useSession } from '@tanstack/react-start/server'

export function useAppSession() {
  return useSession({
    password: process.env.AUTH_SECRET, // 既存の AUTH_SECRET をそのまま使用
  })
}
```

### ログイン・登録

サーバー関数として実装。既存の bcrypt-ts によるパスワード検証ロジックはそのまま。

### 認証ミドルウェア

```typescript
// src/server/auth/middleware.ts
import { createMiddleware } from '@tanstack/react-start'

export const authMiddleware = createMiddleware().server(async () => {
  const session = await useAppSession()
  if (!session.data.userId) {
    throw new Error('Unauthorized')
  }
  return { session: session.data }
})
```

### 既存ユーザーへの影響

セッション形式が Auth.js → TanStack Start に変わるため、移行後に全ユーザーが再ログインが必要。DB 上のアカウント・パスワードは変更なし。

## ルート変換

### React Router v7 → TanStack Router 対応表

| React Router パス | TanStack Router ファイル |
|-------------------|------------------------|
| `_main._index/route.tsx` | `routes/index.tsx` |
| `_main.dot._index/route.tsx` | `routes/dot/index.tsx` |
| `_main.dot.$dot/route.tsx` | `routes/dot/$dot.tsx` |
| `_main.dots.$code/route.tsx` | `routes/dots/$code.tsx` |
| `_main.posts.$post._index/route.tsx` | `routes/posts/$post/index.tsx` |
| `_main.posts.$post.edit/route.tsx` | `routes/posts/$post/edit.tsx` |
| `_main.users.$user/route.tsx` | `routes/users/$user.tsx` |
| `_main.ascii/route.tsx` | `routes/ascii.tsx` |
| `_main.map/route.tsx` | `routes/map.tsx` |
| `my.posts._index/route.tsx` | `routes/my/posts/index.tsx` |
| `my.posts.$post._index/route.tsx` | `routes/my/posts/$post.tsx` |
| `sign.in/route.tsx` | `routes/sign/in.tsx` |
| `sign.up/route.tsx` | `routes/sign/up.tsx` |

### レイアウト

現在の `_main/route.tsx`（ヘッダー付きレイアウト）は `__root.tsx` またはレイアウトルートに移行。

### データ取得

React Query の `useQuery` + hono/client → TanStack Router の `loader` + サーバー関数に置き換え。

```typescript
// Before
export default function PostPage() {
  const { data } = useQuery({ queryKey: ['post', id], queryFn: () => client.posts[':post'].$get(...) })
}

// After
export const Route = createFileRoute('/posts/$post/')({
  loader: ({ params }) => getPost({ data: { postId: params.post } }),
  component: PostPage,
})

function PostPage() {
  const data = Route.useLoaderData()
}
```

## デプロイ構成

### wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "hascii",
  "compatibility_date": "2025-09-02",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "d1_databases": [{
    "binding": "DB",
    "database_name": "hascii",
    "database_id": "2731348d-c159-4b97-8d7d-e06dd4050bb8"
  }]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(),
  ],
})
```

### CI/CD

```yaml
jobs:
  check:
    steps:
      - run: bun install
      - run: bun test
      - run: bunx tsc --noEmit
  deploy:
    steps:
      - run: bun install
      - run: bun run build
      - uses: cloudflare/wrangler-action@v3
        with:
          command: deploy
```

2 Worker → 1 Worker になるため、CI が大幅にシンプルになる。

### 移行後の削除

- Cloudflare ダッシュボードから `hascii-api` Worker を削除
- DNS / カスタムドメインの設定があれば統合

## OGP

`GET /ogp/:dots` は現在 API Worker でSVG→PNG変換を行っている。移行後はサーバールート（server route）として実装し、`Response` オブジェクトで PNG バイナリを返す。`@resvg/resvg-wasm` と既存の `generate-ogp-svg` / `render-svg-to-png` はそのまま使用。

## テスト

### 移行対象のテスト

- `api/lib/__tests__/` の純関数テスト → `src/server/lib/__tests__/` に移動（ロジック変更なし）
- `ui/app/utils/__tests__/` のユーティリティテスト → `src/utils/__tests__/` に移動（ロジック変更なし）
- `ui/app/lib/__tests__/` → `src/lib/__tests__/` に移動

### 追加すべきテスト

- 認証サーバー関数（ログイン成功/失敗、セッション検証）

## 実装順序

1. TanStack Start プロジェクト初期化（vite.config, wrangler, package.json）
2. DB 層移植（Drizzle スキーマ、クライアント）
3. 認証（セッション、ミドルウェア、ログイン/登録）
4. サーバー関数移植（全 API ルート）
5. テスト移植・実行
6. ページ移植（ルート、コンポーネント、レイアウト）
7. shadcn/ui・スタイル移植
8. OGP サーバールート
9. CI/CD 更新
10. 動作確認・デプロイ
