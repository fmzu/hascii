import { Link } from "@tanstack/react-router"
import { LogOut, SunMoon, UserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Separator } from "~/components/ui/separator"
import { logoutFn } from "~/server/functions/logout"

export function AvatarPopover() {
  const onLogout = async () => {
    await logoutFn()
    window.location.href = "/"
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>{"CN"}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="flex flex-col gap-y-2">
          <div className="flex space-x-2 items-center justify-center">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>{"CN"}</AvatarFallback>
            </Avatar>
            <p>{"username"}</p>
          </div>
          <Separator />
          <Link to="/">
            <Button className="flex space-x-2 w-full" variant={"ghost"}>
              <UserRound className="w-4 mr-2" />
              {"マイページ"}
            </Button>
          </Link>
          <Separator />
          <Button className="flex space-x-2 w-full" variant={"ghost"}>
            <SunMoon className="w-4 mr-2" />
            {"テーマ"}
          </Button>
          <Separator />
          <Button
            className="flex space-x-2 w-full"
            variant={"ghost"}
            onClick={onLogout}
          >
            <LogOut className="w-4 mr-2" />
            {"ログアウト"}
          </Button>
          <Separator />
        </div>
      </PopoverContent>
    </Popover>
  )
}
