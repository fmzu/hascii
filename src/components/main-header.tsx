import { Link } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"
import { AvatarPopover } from "~/components/avatar-popover"

type Props = {
  isAuthenticated: boolean
}

export function MainHeader(props: Props) {
  return (
    <header className="flex justify-between items-center container p-8">
      <Link to="/">
        <div className="text-xl font-bold">{"HASCII"}</div>
      </Link>
      {!props.isAuthenticated ? (
        <div className="flex gap-x-4">
          <Link to="/dot">
            <Button variant={"secondary"}>{"作成"}</Button>
          </Link>
          <Link to="/sign/up" search={{ callbackUrl: "/" }}>
            <Button>{"新規登録"}</Button>
          </Link>
          <Link to="/sign/in" search={{ callbackUrl: "/" }}>
            <Button>{"ログイン"}</Button>
          </Link>
        </div>
      ) : (
        <div className="flex gap-x-4">
          <Link to="/my/posts">
            <Button variant={"secondary"}>{"作成"}</Button>
          </Link>
          <AvatarPopover />
        </div>
      )}
    </header>
  )
}
