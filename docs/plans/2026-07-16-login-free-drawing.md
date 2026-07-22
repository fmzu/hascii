# ログイン不要お絵かき & 匿名閲覧 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ログイン不要で `/dot` エディタに入って描き・共有URLを匿名閲覧でき、投稿はログイン時のみ促し、非公開投稿の一覧漏れを塞ぐ。

**Architecture:** プライバシーに関わる判定（一覧表示可否・詳細閲覧可否・callbackURL 安全化・PNG レイアウト計算）はすべて 1 関数 1 ファイルの純関数に切り出し `bun test` で単体テストする。API ハンドラと React コンポーネントは薄いラッパとして純関数を呼ぶ。認証はミドルウェア `verifyAuth()` を外し、`getAuthUser()` で「任意ログイン」に切り替える。

**Tech Stack:** TypeScript / Cloudflare Workers / Hono + Drizzle(D1) / React Router v7 / @hono/auth-js(Credentials) / @tanstack/react-query / Bun / Biome / bun:test

## Global Constraints

- パッケージマネージャは Bun。テストは `bun test`（`bun:test`）。
- Lint/Format は Biome。セミコロンは asNeeded、インデントはスペース、行末 LF（`biome.json` 準拠）。
- 1 関数 1 ファイル。React コンポーネントは 1 コンポーネント 1 ファイル。
- DB スキーマ変更なし（`posts.userId` は notNull のまま）。匿名投稿は非対応。
- 文言の呼び分け: サーバーへ公開する操作＝「投稿」、ローカルへ出す操作＝「エクスポート」。「保存」はボタン名に使わない（PNG保存の語のみ例外的に許可）。
- エディタ内アクションの並びは `[エクスポート ▾] [投稿]`（投稿を右端）。
- コミット物に着想元ゲーム等への言及を書かない。
- 実装順序は仕様書どおり: ④ → ③ → ① → ② → ⑤。
- API 純関数は `~` エイリアスを使わずインラインの構造型を引数に取る（`bun test` の解決を単純に保つため）。

---

## Task 1: ④ 非公開漏れ修正 + テスト基盤（最優先・プライバシーバグ）

一覧 API `GET /posts` が全件返しており、非公開・削除済み投稿が漏れている。表示可否判定を純関数に切り出して単体テストし、ハンドラで `.filter()` する。あわせてルート `package.json` に `test` スクリプトを追加する。

**Files:**
- Modify: `package.json`（ルート）
- Create: `api/lib/is-listable-post.ts`
- Create: `api/lib/__tests__/is-listable-post.test.ts`
- Modify: `api/interface/routes/posts.ts:65-77`（GET ハンドラ）

**Interfaces:**
- Produces: `isListablePost(post: { isPublic: boolean; isDeleted: boolean }): boolean`

- [ ] **Step 1: ルート `package.json` に test スクリプトを追加**

`package.json` の `scripts` を以下にする（`format` は既存のまま残す）:

```json
  "scripts": {
    "dev": "concurrently 'bun run --cwd api dev' 'bun run --cwd ui dev'",
    "format": "biome check --write --unsafe .",
    "test": "bun test"
  },
```

- [ ] **Step 2: 既存テストが動くことを確認**

Run: `cd /Users/f/hascii && bun test`
Expected: PASS（`ui/app/utils/__tests__/to-dots-from-string.test.ts` と `ui/app/lib/__tests__/utils.test.ts` が緑）

- [ ] **Step 3: 失敗するテストを書く**

Create `api/lib/__tests__/is-listable-post.test.ts`:

```ts
import { it, expect } from "bun:test"
import { isListablePost } from "../is-listable-post"

it("公開かつ未削除なら true", () => {
  expect(isListablePost({ isPublic: true, isDeleted: false })).toBe(true)
})

it("非公開なら false", () => {
  expect(isListablePost({ isPublic: false, isDeleted: false })).toBe(false)
})

it("削除済みなら false", () => {
  expect(isListablePost({ isPublic: true, isDeleted: true })).toBe(false)
})

it("非公開かつ削除済みなら false", () => {
  expect(isListablePost({ isPublic: false, isDeleted: true })).toBe(false)
})
```

- [ ] **Step 4: テストが失敗することを確認**

Run: `cd /Users/f/hascii && bun test api/lib/__tests__/is-listable-post.test.ts`
Expected: FAIL（`Cannot find module '../is-listable-post'`）

- [ ] **Step 5: 純関数を実装**

Create `api/lib/is-listable-post.ts`:

```ts
type ListablePostInput = {
  isPublic: boolean
  isDeleted: boolean
}

/**
 * 一覧に表示してよい投稿かどうかを判定する
 * 公開かつ未削除のときだけ true
 */
export const isListablePost = (post: ListablePostInput): boolean => {
  return post.isPublic === true && post.isDeleted === false
}
```

- [ ] **Step 6: テストが通ることを確認**

Run: `cd /Users/f/hascii && bun test api/lib/__tests__/is-listable-post.test.ts`
Expected: PASS（4 件）

- [ ] **Step 7: GET /posts ハンドラでフィルタを適用**

`api/interface/routes/posts.ts` の GET ハンドラ（65-77 行）を次に置き換える。ファイル先頭の import 群に `import { isListablePost } from "~/lib/is-listable-post"` を追加する（POST ハンドラ・他 import は変更しない）:

```ts
/**
 * たくさんの投稿を取得する
 */
export const GET = apiFactory.createHandlers(async (c) => {
  const db = drizzle(c.env.DB, { schema })

  const posts = await db.select().from(schema.posts)

  const postsJson = posts.filter(isListablePost).map((post) => {
    return {
      ...post,
    }
  })

  return c.json(postsJson)
})
```

- [ ] **Step 8: 型チェックと Biome を確認**

Run: `cd /Users/f/hascii && bunx biome check api/lib/is-listable-post.ts api/interface/routes/posts.ts`
Expected: エラーなし（必要なら `bunx biome check --write` で整形）

- [ ] **Step 9: コミット**

```bash
cd /Users/f/hascii
git add package.json api/lib/is-listable-post.ts api/lib/__tests__/is-listable-post.test.ts api/interface/routes/posts.ts
git commit -m "fix: 一覧APIから非公開・削除済み投稿を除外する"
```

---

## Task 2: ③ 詳細の匿名閲覧開放（非公開は所有者以外へ 404）

`GET /posts/:post` から `verifyAuth()` を外し、`getAuthUser()` で任意ログインにする。閲覧可否は純関数 `canViewPost` に切り出して単体テストする。非公開かつ非所有者は存在を漏らさないため 404。PUT/DELETE は変更しない。

**Files:**
- Create: `api/lib/can-view-post.ts`
- Create: `api/lib/__tests__/can-view-post.test.ts`
- Modify: `api/interface/routes/post.ts:1-61`（import と GET ハンドラのみ。PUT/DELETE は不変）

**Interfaces:**
- Consumes: `getAuthUser(c): Promise<AuthUser | null>`（`@hono/auth-js`）
- Produces: `canViewPost(post: { isPublic: boolean }, isMine: boolean): boolean`

- [ ] **Step 1: 失敗するテストを書く**

Create `api/lib/__tests__/can-view-post.test.ts`:

```ts
import { it, expect } from "bun:test"
import { canViewPost } from "../can-view-post"

it("公開投稿は他人でも閲覧できる", () => {
  expect(canViewPost({ isPublic: true }, false)).toBe(true)
})

it("公開投稿は所有者でも閲覧できる", () => {
  expect(canViewPost({ isPublic: true }, true)).toBe(true)
})

it("非公開投稿は所有者だけ閲覧できる", () => {
  expect(canViewPost({ isPublic: false }, true)).toBe(true)
})

it("非公開投稿は他人からは閲覧できない", () => {
  expect(canViewPost({ isPublic: false }, false)).toBe(false)
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `cd /Users/f/hascii && bun test api/lib/__tests__/can-view-post.test.ts`
Expected: FAIL（`Cannot find module '../can-view-post'`）

- [ ] **Step 3: 純関数を実装**

Create `api/lib/can-view-post.ts`:

```ts
type ViewablePostInput = {
  isPublic: boolean
}

/**
 * 投稿の詳細を閲覧してよいかどうかを判定する
 * 公開投稿は誰でも、非公開投稿は所有者だけ閲覧できる
 */
export const canViewPost = (
  post: ViewablePostInput,
  isMine: boolean,
): boolean => {
  return post.isPublic === true || isMine === true
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd /Users/f/hascii && bun test api/lib/__tests__/can-view-post.test.ts`
Expected: PASS（4 件）

- [ ] **Step 5: GET ハンドラを匿名許可に書き換える**

`api/interface/routes/post.ts` の import 行と GET ハンドラ（1-61 行）を置き換える。

先頭 import で `verifyAuth` を `getAuthUser` に差し替え、`canViewPost` を追加する（PUT/DELETE が `verifyAuth` と `boolean` を使うので、それらの import は残す点に注意）:

```ts
import { getAuthUser, verifyAuth } from "@hono/auth-js"
import { vValidator } from "@hono/valibot-validator"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { HTTPException } from "hono/http-exception"
import { boolean, object, string } from "valibot"
import { apiFactory } from "~/interface/api-factory"
import { canViewPost } from "~/lib/can-view-post"
import { schema } from "~/lib/schema"
```

GET ハンドラ本体（`verifyAuth()` を外す）:

```ts
/**
 * 一つの投稿を取得する
 * 匿名でも呼び出せる。非公開投稿は所有者以外へ 404 を返す
 */
export const GET = apiFactory.createHandlers(
  vValidator("param", object({ post: string() })),
  async (c) => {
    const db = drizzle(c.env.DB, { schema })

    const authUser = await getAuthUser(c)

    const authUserEmail = authUser?.token?.email ?? null

    const postId = c.req.param("post")

    const post = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, postId))
      .get()

    if (post === undefined) {
      throw new HTTPException(404, { message: "Not found" })
    }

    let isMine = false

    if (authUserEmail !== null) {
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, authUserEmail))
        .get()

      if (user !== undefined) {
        isMine = post.userId === user.id
      }
    }

    if (canViewPost(post, isMine) === false) {
      throw new HTTPException(404, { message: "Not found" })
    }

    return c.json({ ...post, isMine })
  },
)
```

`PUT`（66 行〜）と `DELETE`（118 行〜）は一切変更しない。

- [ ] **Step 6: 型チェックと Biome を確認**

Run: `cd /Users/f/hascii && bunx biome check api/interface/routes/post.ts api/lib/can-view-post.ts`
Expected: エラーなし（`verifyAuth`/`boolean` が未使用と出た場合のみ、PUT/DELETE がそれらを使っていることを確認。使っているので警告は出ないはず）

- [ ] **Step 7: 手動統合確認（D1 ローカル）**

Run: `cd /Users/f/hascii && bun run --cwd api dev`（別ターミナル）
確認内容:
1. 公開投稿を未ログイン `curl` で GET → 200 と `isMine:false`
2. 非公開投稿を未ログイン `curl` で GET → 404
（未ログイン=Cookie なしの `curl "$API/posts/<id>"`）

- [ ] **Step 8: コミット**

```bash
cd /Users/f/hascii
git add api/lib/can-view-post.ts api/lib/__tests__/can-view-post.test.ts api/interface/routes/post.ts
git commit -m "feat: 投稿詳細を匿名閲覧可能にし非公開は所有者以外へ404"
```

---

## Task 3: ① 導線整備（トップページ「描いてみる」+ ヘッダ「作成」+ /dot リダイレクト修正）

未ログインでもエディタへ入れる導線を作る。あわせて壊れている `/dot` インデックスのリダイレクトを根本修正し、空キャンバスへ確実に飛ぶようにする。

**Files:**
- Modify: `ui/app/routes/_main.dot._index/route.tsx`（リダイレクト loader の修正）
- Modify: `ui/app/routes/_main._index/route.tsx`（「描いてみる」ボタン追加）
- Modify: `ui/app/routes/_main/components/main-header.tsx`（未ログイン時「作成」ボタン追加）

**Interfaces:**
- Consumes: なし（純関数追加なし。UI 変更のみ）

- [ ] **Step 1: /dot インデックスのリダイレクトを修正**

`ui/app/routes/_main.dot._index/route.tsx` を次に置き換える（現状は `export default function loader` かつ return なしで機能していない）。空 8x8 キャンバス = 64 セル = ダッシュ 63 個:

```ts
import { redirect } from "react-router"

export function loader() {
  return redirect(`/dot/${"-".repeat(63)}`)
}
```

- [ ] **Step 2: トップページに「描いてみる」ボタンを追加**

`ui/app/routes/_main._index/route.tsx` に `Button` の import を追加し、`<MainHeader />` の直後・`<main>` の前に導線ブロックを差し込む:

import 追加（既存 import 群の末尾に）:

```ts
import { Button } from "~/components/ui/button"
```

`return (` 内、`<MainHeader />` と `<main ...>` の間に挿入:

```tsx
      <div className="container px-8 pb-4">
        <Link to="/dot">
          <Button>{"描いてみる"}</Button>
        </Link>
      </div>
```

（`Link` は既に import 済み）

- [ ] **Step 3: ヘッダの未ログイン分岐に「作成」ボタンを追加**

`ui/app/routes/_main/components/main-header.tsx` の未ログイン分岐（`session.status === "unauthenticated"` の `<div className="flex gap-x-4">` 内）、`新規登録` リンクの前に追加する。ログイン済み分岐（`/my/posts` への「作成」・`AvatarPopover`）は変更しない:

```tsx
          <Link to={"/dot"}>
            <Button variant={"secondary"}>{"作成"}</Button>
          </Link>
```

- [ ] **Step 4: 型チェックと Biome を確認**

Run: `cd /Users/f/hascii && bun run --cwd ui typecheck && bunx biome check ui/app/routes/_main.dot._index/route.tsx ui/app/routes/_main._index/route.tsx ui/app/routes/_main/components/main-header.tsx`
Expected: エラーなし

- [ ] **Step 5: 手動確認**

Run: `cd /Users/f/hascii && bun run dev`（ポート 3000 が使用中なら先に kill）
確認内容: 未ログインで `/` を開き「描いてみる」押下 → `/dot/---...`（空キャンバス）が開く。ヘッダの「作成」押下でも同様。

- [ ] **Step 6: コミット**

```bash
cd /Users/f/hascii
git add ui/app/routes/_main.dot._index/route.tsx ui/app/routes/_main._index/route.tsx ui/app/routes/_main/components/main-header.tsx
git commit -m "feat: 未ログインでもエディタに入れる導線を追加"
```

---

## Task 4: ② サインイン/サインアップの callbackUrl 対応（オープンリダイレクト防止）

投稿誘導からログインした後、元の `/dot/xxxx` へ戻せるよう `callbackUrl` を受け取る。安全化は純関数 `resolveCallbackUrl` に切り出して単体テストする。

**Files:**
- Create: `ui/app/utils/resolve-callback-url.ts`
- Create: `ui/app/utils/__tests__/resolve-callback-url.test.ts`
- Modify: `ui/app/routes/sign.in/route.tsx`
- Modify: `ui/app/routes/sign.up/route.tsx`

**Interfaces:**
- Produces: `resolveCallbackUrl(raw: string | null, fallback?: string): string`

- [ ] **Step 1: 失敗するテストを書く**

Create `ui/app/utils/__tests__/resolve-callback-url.test.ts`:

```ts
import { it, expect } from "bun:test"
import { resolveCallbackUrl } from "../resolve-callback-url"

it("null はフォールバックを返す", () => {
  expect(resolveCallbackUrl(null)).toBe("/")
})

it("アプリ内の相対パスはそのまま返す", () => {
  expect(resolveCallbackUrl("/dot/1-2-3-4")).toBe("/dot/1-2-3-4")
})

it("プロトコル相対URLはフォールバック", () => {
  expect(resolveCallbackUrl("//evil.com")).toBe("/")
})

it("絶対URLはフォールバック", () => {
  expect(resolveCallbackUrl("https://evil.com")).toBe("/")
})

it("バックスラッシュ始まりはフォールバック", () => {
  expect(resolveCallbackUrl("/\\evil.com")).toBe("/")
})

it("スキームを含む値はフォールバック", () => {
  expect(resolveCallbackUrl("javascript:alert(1)")).toBe("/")
})

it("フォールバックは差し替えできる", () => {
  expect(resolveCallbackUrl(null, "/dot")).toBe("/dot")
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `cd /Users/f/hascii && bun test ui/app/utils/__tests__/resolve-callback-url.test.ts`
Expected: FAIL（`Cannot find module '../resolve-callback-url'`）

- [ ] **Step 3: 純関数を実装**

Create `ui/app/utils/resolve-callback-url.ts`:

```ts
/**
 * callbackUrl クエリを安全なアプリ内パスへ解決する
 * オープンリダイレクトを防ぐため "/" 始まりの相対パスのみ許可する
 * 不正・未指定のときは fallback を返す
 */
export const resolveCallbackUrl = (
  raw: string | null,
  fallback = "/",
): string => {
  if (raw === null) {
    return fallback
  }
  if (raw.startsWith("/") === false) {
    return fallback
  }
  // プロトコル相対 (//host) やバックスラッシュ細工 (/\host) を拒否
  if (raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback
  }
  // スキーム付き (http:, javascript: 等) を拒否
  if (raw.includes(":")) {
    return fallback
  }
  return raw
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd /Users/f/hascii && bun test ui/app/utils/__tests__/resolve-callback-url.test.ts`
Expected: PASS（7 件）

- [ ] **Step 5: サインインで callbackUrl へ戻す**

`ui/app/routes/sign.in/route.tsx` を修正する。`useNavigate` の隣に `useSearchParams` を使い、成功時 `callbackUrl` へ、失敗時は遷移せず toast のみにする。

import を変更:

```ts
import { useNavigate, useSearchParams } from "react-router"
```

その下に `resolveCallbackUrl` の import を追加:

```ts
import { resolveCallbackUrl } from "~/utils/resolve-callback-url"
```

コンポーネント本体、`const navigate = useNavigate()` の直後に追加:

```ts
  const [searchParams] = useSearchParams()

  const callbackUrl = resolveCallbackUrl(searchParams.get("callbackUrl"))
```

`onSubmit` を次に置き換える（失敗時 `navigate("/")` を廃止）:

```ts
  const onSubmit = async () => {
    const result = await mutation.mutateAsync()
    if (result === null) {
      navigate(callbackUrl)
      return
    }
    toast(result)
  }
```

- [ ] **Step 6: サインアップで callbackUrl を引き継ぐ**

`ui/app/routes/sign.up/route.tsx` を修正する。登録成功後 `/sign/in` へ遷移する際に `callbackUrl` を引き継ぐ。

import を変更:

```ts
import { useNavigate, useSearchParams } from "react-router"
```

`resolveCallbackUrl` の import を追加:

```ts
import { resolveCallbackUrl } from "~/utils/resolve-callback-url"
```

`const navigate = useNavigate()` の直後に追加:

```ts
  const [searchParams] = useSearchParams()

  const callbackUrl = resolveCallbackUrl(searchParams.get("callbackUrl"))
```

`onSubmit` を次に置き換える:

```ts
  const onSubmit = () => {
    const result = mutation.mutate()
    if (result === null) {
      return
    }
    navigate(`/sign/in?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }
```

- [ ] **Step 7: 型チェックと Biome を確認**

Run: `cd /Users/f/hascii && bun run --cwd ui typecheck && bunx biome check ui/app/utils/resolve-callback-url.ts ui/app/routes/sign.in/route.tsx ui/app/routes/sign.up/route.tsx`
Expected: エラーなし

- [ ] **Step 8: コミット**

```bash
cd /Users/f/hascii
git add ui/app/utils/resolve-callback-url.ts ui/app/utils/__tests__/resolve-callback-url.test.ts ui/app/routes/sign.in/route.tsx ui/app/routes/sign.up/route.tsx
git commit -m "feat: サインイン/アップのcallbackUrl対応（オープンリダイレクト防止）"
```

---

## Task 5: ② エディタからの投稿ボタン + ログイン誘導ダイアログ

`DotWorkspace` に「投稿」ボタンを追加する。ログイン済みならタイトル・公開設定ダイアログから `POST /posts`、未ログインならログイン誘導ダイアログ（`callbackUrl` 付きリンク）を出す。あわせて現状壊れている import（`toStringFromGrid` / `nesColors` / `nesColorKeys` 未 import）を修正する。

**Files:**
- Create: `ui/app/routes/_main.dot._index/components/post-dialog.tsx`
- Create: `ui/app/routes/_main.dot._index/components/login-required-dialog.tsx`
- Modify: `ui/app/routes/_main.dot._index/components/dot-workspace.tsx`

**Interfaces:**
- Consumes: `client.posts.$post`（`~/lib/client`）、`useSession`（`@hono/auth-js/react`）、`toStringFromGrid`
- Produces:
  - `PostDialog(props: { open: boolean; onOpenChange: (open: boolean) => void; dots: string })`
  - `LoginRequiredDialog(props: { open: boolean; onOpenChange: (open: boolean) => void; callbackUrl: string })`

- [ ] **Step 1: 投稿ダイアログ コンポーネントを作成**

Create `ui/app/routes/_main.dot._index/components/post-dialog.tsx`:

```tsx
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { client } from "~/lib/client"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dots: string
}

export const PostDialog = (props: Props) => {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")

  const [isPublic, setIsPublic] = useState(false)

  const mutation = useMutation({
    async mutationFn() {
      const resp = await client.posts.$post({
        json: {
          dots: props.dots,
          title: title,
          description: "",
          isPublic: isPublic,
        },
      })
      return await resp.json()
    },
  })

  const onSubmit = async () => {
    const result = await mutation.mutateAsync()
    toast("投稿しました")
    navigate(`/my/posts/${result.postId}`)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"投稿する"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-y-2">
          <Input
            placeholder={"タイトル"}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={mutation.isPending}
          />
          <Button
            variant={isPublic ? "destructive" : "secondary"}
            disabled={mutation.isPending}
            onClick={() => setIsPublic(!isPublic)}
          >
            {isPublic ? <LockKeyholeOpenIcon /> : <LockKeyholeIcon />}
            {isPublic ? "公開" : "非公開"}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={mutation.isPending}>
            {"投稿"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: ログイン誘導ダイアログ コンポーネントを作成**

Create `ui/app/routes/_main.dot._index/components/login-required-dialog.tsx`:

```tsx
import { Link } from "react-router"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  callbackUrl: string
}

export const LoginRequiredDialog = (props: Props) => {
  const query = `?callbackUrl=${encodeURIComponent(props.callbackUrl)}`

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"投稿にはログインが必要です"}</DialogTitle>
          <DialogDescription>
            {"描いた絵はそのままURLに残るので、ログイン後にこの画面へ戻ります。"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Link to={`/sign/up${query}`}>
            <Button variant={"secondary"}>{"新規登録"}</Button>
          </Link>
          <Link to={`/sign/in${query}`}>
            <Button>{"ログイン"}</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: DotWorkspace に投稿ボタンを配線し、壊れた import を修正**

`ui/app/routes/_main.dot._index/components/dot-workspace.tsx` を修正する。

(a) import 群に次を追加（既存の未解決参照 `toStringFromGrid` / `nesColors` / `nesColorKeys` を解消）:

```ts
import { useSession } from "@hono/auth-js/react"
import { Button } from "~/components/ui/button"
import { LoginRequiredDialog } from "~/routes/_main.dot._index/components/login-required-dialog"
import { PostDialog } from "~/routes/_main.dot._index/components/post-dialog"
import { nesColorKeys } from "~/utils/nes-color-keys"
import { nesColors } from "~/utils/nes-colors"
import { toStringFromGrid } from "~/utils/to-string-from-grid"
```

（`useState` は既存 import に含まれているので二重 import しないこと）

(b) コンポーネント本体の先頭付近（`const [colorId, setColorId] = useState("00")` の下あたり）に状態と派生値を追加:

```ts
  const session = useSession()

  const [isPostOpen, setIsPostOpen] = useState(false)

  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const dots = toStringFromGrid(grid)

  const callbackUrl = `/dot/${dots}`

  const onClickPost = () => {
    if (session.status === "authenticated") {
      setIsPostOpen(true)
      return
    }
    setIsLoginOpen(true)
  }
```

(c) 右パネル（`<div className="w-80 flex flex-col gap-y-2">`）の先頭、`<EditorHeader ... />` の前にアクションバーを追加する。並びは左にエクスポート枠（Task 6 で `ExportMenu` を差し込む）、右端に投稿:

```tsx
        <div className="flex justify-end gap-x-2">
          {/* Task 6 でここに <ExportMenu grid={grid} colors={nesColors} /> を挿入 */}
          <Button onClick={onClickPost}>{"投稿"}</Button>
        </div>
```

(d) 同コンポーネントの return 直下、ルート要素の閉じタグ直前にダイアログを配置（`</div>` の前）:

```tsx
      <PostDialog open={isPostOpen} onOpenChange={setIsPostOpen} dots={dots} />
      <LoginRequiredDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        callbackUrl={callbackUrl}
      />
```

- [ ] **Step 4: 型チェックと Biome を確認**

Run: `cd /Users/f/hascii && bun run --cwd ui typecheck && bunx biome check ui/app/routes/_main.dot._index/components/dot-workspace.tsx ui/app/routes/_main.dot._index/components/post-dialog.tsx ui/app/routes/_main.dot._index/components/login-required-dialog.tsx`
Expected: エラーなし（特に `toStringFromGrid` / `nesColors` / `nesColorKeys` の未解決参照が消えていること）

- [ ] **Step 5: 手動確認**

Run: `cd /Users/f/hascii && bun run dev`
確認内容:
1. 未ログインで `/dot` を開き「投稿」→ ログイン誘導ダイアログ表示。「ログイン」リンクの遷移先が `/sign/in?callbackUrl=%2Fdot%2F...`。ログイン後に同じ絵の `/dot/...` へ戻る。
2. ログイン済みで「投稿」→ タイトル・公開設定ダイアログから投稿し `/my/posts/:id` へ遷移。

- [ ] **Step 6: コミット**

```bash
cd /Users/f/hascii
git add ui/app/routes/_main.dot._index/components/dot-workspace.tsx ui/app/routes/_main.dot._index/components/post-dialog.tsx ui/app/routes/_main.dot._index/components/login-required-dialog.tsx
git commit -m "feat: エディタに投稿ボタンとログイン誘導ダイアログを追加"
```

---

## Task 6: ⑤ エクスポート（PNG保存 / ドット文字列コピー）

エディタに「エクスポート ▾」ドロップダウンを追加する。出力ロジックは「グリッド → 出力データ」の純関数として 1 関数 1 ファイルで分離し、将来 CSS 形式を追加しやすくする。PNG のピクセル配置計算（純関数）は単体テストし、canvas 描画とダウンロードはブラウザ依存の薄い関数に分ける。

**Files:**
- Create: `ui/app/utils/export/to-png-layout.ts`（純関数）
- Create: `ui/app/utils/export/__tests__/to-png-layout.test.ts`
- Create: `ui/app/utils/export/render-png-data-url.ts`（ブラウザ描画）
- Create: `ui/app/utils/export/download-data-url.ts`（ブラウザDL）
- Create: `ui/app/routes/_main.dot._index/components/export-menu.tsx`
- Modify: `ui/app/routes/_main.dot._index/components/dot-workspace.tsx`（アクションバーに `ExportMenu` を挿入）

**Interfaces:**
- Produces:
  - `type PngRect = { x: number; y: number; size: number; color: string }`
  - `type PngLayout = { width: number; height: number; background: string; rects: PngRect[] }`
  - `toPngLayout(grid, colors, scale, background?): PngLayout`
  - `renderPngDataUrl(layout: PngLayout): string`
  - `downloadDataUrl(dataUrl: string, fileName: string): void`
  - `ExportMenu(props: { grid: EditorCell[][]; colors: Map<string, string> })`
- Consumes: `toStringFromGrid`（ドット文字列コピーで再利用）

- [ ] **Step 1: PNG レイアウトの失敗するテストを書く**

Create `ui/app/utils/export/__tests__/to-png-layout.test.ts`:

```ts
import { it, expect } from "bun:test"
import { toPngLayout } from "../to-png-layout"
import type { EditorCell } from "~/types/editor-cell"

const colors = new Map<string, string>([
  ["00", "#111111"],
  ["01", "#222222"],
])

it("グリッドサイズ×scale の寸法を返す", () => {
  const grid: EditorCell[][] = [
    [{ color: null }, { color: null }],
    [{ color: null }, { color: null }],
  ]
  const layout = toPngLayout(grid, colors, 16)
  expect(layout.width).toBe(32)
  expect(layout.height).toBe(32)
})

it("色つきセルだけを rect にする", () => {
  const grid: EditorCell[][] = [
    [{ color: "00" }, { color: null }],
    [{ color: null }, { color: "01" }],
  ]
  const layout = toPngLayout(grid, colors, 16)
  expect(layout.rects).toEqual([
    { x: 0, y: 0, size: 16, color: "#111111" },
    { x: 16, y: 16, size: 16, color: "#222222" },
  ])
})

it("色マップに無い色は無視する", () => {
  const grid: EditorCell[][] = [[{ color: "ZZ" }]]
  const layout = toPngLayout(grid, colors, 16)
  expect(layout.rects).toEqual([])
})

it("全セル null なら rects は空", () => {
  const grid: EditorCell[][] = [[{ color: null }]]
  const layout = toPngLayout(grid, colors, 8)
  expect(layout.rects).toEqual([])
  expect(layout.width).toBe(8)
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `cd /Users/f/hascii && bun test ui/app/utils/export/__tests__/to-png-layout.test.ts`
Expected: FAIL（`Cannot find module '../to-png-layout'`）

- [ ] **Step 3: PNG レイアウト純関数を実装**

Create `ui/app/utils/export/to-png-layout.ts`:

```ts
import type { EditorCell } from "~/types/editor-cell"

export type PngRect = {
  x: number
  y: number
  size: number
  color: string
}

export type PngLayout = {
  width: number
  height: number
  background: string
  rects: PngRect[]
}

/**
 * グリッドを PNG 描画用のレイアウト（純データ）へ変換する
 * 色のないセル・色マップに無い色は rects に含めない（背景で塗られる）
 */
export const toPngLayout = (
  grid: EditorCell[][],
  colors: Map<string, string>,
  scale: number,
  background = "#ffffff",
): PngLayout => {
  const rows = grid.length
  const cols = rows === 0 ? 0 : grid[0].length
  const rects: PngRect[] = []

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const colorId = grid[y][x].color
      if (colorId === null) {
        continue
      }
      const hex = colors.get(colorId)
      if (hex === undefined) {
        continue
      }
      rects.push({ x: x * scale, y: y * scale, size: scale, color: hex })
    }
  }

  return {
    width: cols * scale,
    height: rows * scale,
    background,
    rects,
  }
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd /Users/f/hascii && bun test ui/app/utils/export/__tests__/to-png-layout.test.ts`
Expected: PASS（4 件）

- [ ] **Step 5: canvas 描画関数を実装（ブラウザ専用・単体テスト対象外）**

Create `ui/app/utils/export/render-png-data-url.ts`:

```ts
import type { PngLayout } from "~/utils/export/to-png-layout"

/**
 * PNG レイアウトを canvas に描画して dataURL を返す（ブラウザ専用）
 */
export const renderPngDataUrl = (layout: PngLayout): string => {
  const canvas = document.createElement("canvas")
  canvas.width = layout.width
  canvas.height = layout.height

  const context = canvas.getContext("2d")
  if (context === null) {
    throw new Error("canvas の 2d コンテキストを取得できませんでした")
  }

  context.fillStyle = layout.background
  context.fillRect(0, 0, layout.width, layout.height)

  for (const rect of layout.rects) {
    context.fillStyle = rect.color
    context.fillRect(rect.x, rect.y, rect.size, rect.size)
  }

  return canvas.toDataURL("image/png")
}
```

- [ ] **Step 6: ダウンロード関数を実装（ブラウザ専用・単体テスト対象外）**

Create `ui/app/utils/export/download-data-url.ts`:

```ts
/**
 * dataURL をファイルとしてダウンロードさせる（ブラウザ専用）
 */
export const downloadDataUrl = (dataUrl: string, fileName: string): void => {
  const anchor = document.createElement("a")
  anchor.href = dataUrl
  anchor.download = fileName
  anchor.click()
}
```

- [ ] **Step 7: エクスポートメニュー コンポーネントを作成**

Create `ui/app/routes/_main.dot._index/components/export-menu.tsx`:

```tsx
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import type { EditorCell } from "~/types/editor-cell"
import { downloadDataUrl } from "~/utils/export/download-data-url"
import { renderPngDataUrl } from "~/utils/export/render-png-data-url"
import { toPngLayout } from "~/utils/export/to-png-layout"
import { toStringFromGrid } from "~/utils/to-string-from-grid"

type Props = {
  grid: EditorCell[][]
  colors: Map<string, string>
}

export const ExportMenu = (props: Props) => {
  const onExportPng = () => {
    const layout = toPngLayout(props.grid, props.colors, 16)
    const dataUrl = renderPngDataUrl(layout)
    downloadDataUrl(dataUrl, "hascii.png")
    toast("PNGを保存しました")
  }

  const onCopyString = () => {
    navigator.clipboard.writeText(toStringFromGrid(props.grid))
    toast("ドット文字列をコピーしました")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"secondary"}>{"エクスポート"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={"end"}>
        <DropdownMenuItem onClick={onExportPng}>{"PNG保存"}</DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyString}>
          {"ドット文字列コピー"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 8: DotWorkspace のアクションバーに ExportMenu を挿入**

`ui/app/routes/_main.dot._index/components/dot-workspace.tsx` の import 群に追加:

```ts
import { ExportMenu } from "~/routes/_main.dot._index/components/export-menu"
```

Task 5 Step 3(c) で置いたアクションバーのコメント行を実体に置き換え、`[エクスポート ▾] [投稿]` の並びにする:

```tsx
        <div className="flex justify-end gap-x-2">
          <ExportMenu grid={grid} colors={nesColors} />
          <Button onClick={onClickPost}>{"投稿"}</Button>
        </div>
```

- [ ] **Step 9: 型チェック・Biome・全テストを確認**

Run: `cd /Users/f/hascii && bun run --cwd ui typecheck && bunx biome check ui/app/utils/export ui/app/routes/_main.dot._index/components/export-menu.tsx ui/app/routes/_main.dot._index/components/dot-workspace.tsx && bun test`
Expected: すべてエラーなし・全テスト PASS

- [ ] **Step 10: 手動確認**

Run: `cd /Users/f/hascii && bun run dev`
確認内容: `/dot` で数ドット塗り「エクスポート ▾」→「PNG保存」で 16px スケールの PNG がダウンロード／「ドット文字列コピー」でクリップボードにドット文字列が入る。

- [ ] **Step 11: コミット**

```bash
cd /Users/f/hascii
git add ui/app/utils/export ui/app/routes/_main.dot._index/components/export-menu.tsx ui/app/routes/_main.dot._index/components/dot-workspace.tsx
git commit -m "feat: エディタにエクスポート（PNG保存/ドット文字列コピー）を追加"
```

---

## 最終確認（全タスク完了後）

- [ ] `cd /Users/f/hascii && bun test` — 全純関数テストが緑（isListablePost 4 / canViewPost 4 / resolveCallbackUrl 7 / toPngLayout 4 + 既存）
- [ ] `bun run --cwd ui typecheck` と `bunx tsc --noEmit`（api）で型エラーなし
- [ ] `bunx biome check .` でエラーなし
- [ ] 手動: 未ログインで描画→投稿→ログイン誘導→ログイン後に同じ絵へ復帰／公開詳細を匿名閲覧できる／非公開詳細は他人に 404／一覧に非公開が出ない／PNG・文字列コピーが機能する

## バックログ（今回やらない）

- CSS 出力形式（`ui/app/utils/export/to-css.ts` を足し `ExportMenu` に項目追加するだけで対応可能な構造にしてある）
- OGP 画像生成 / リミックス / OAuth 移行
