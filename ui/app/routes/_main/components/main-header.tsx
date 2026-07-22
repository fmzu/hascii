import { useSession } from "@hono/auth-js/react"
import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { AvatarPopover } from "~/routes/_main/components/avatar-popover"

export function MainHeader() {
  const session = useSession()

  return (
    <header className="flex justify-between items-center container p-8">
      <Link to={"/"}>
        <div className="text-xl font-bold">{"HASCII"}</div>
      </Link>
      {session.status === "unauthenticated" ? (
        <div className="flex gap-x-4">
          <Link to={"/dot"}>
            <Button variant={"secondary"}>{"作成"}</Button>
          </Link>
          <Link to={"/sign/up"}>
            <Button>{"新規登録"}</Button>
          </Link>
          <Link to={"/sign/in"}>
            <Button>{"ログイン"}</Button>
          </Link>
        </div>
      ) : (
        <div className="flex gap-x-4">
          <Link to={"/my/posts"}>
            <Button variant={"secondary"}>{"作成"}</Button>
          </Link>
          <AvatarPopover />
        </div>
      )}
    </header>
  )
}
