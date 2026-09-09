import { createFileRoute } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

export const Route = createFileRoute("/users/$user")({
  component: UserPage,
})

function UserPage() {
  return (
    <main className="px-8 container space-y-8">
      <div className="flex gap-x-4 items-center">
        <Avatar className="w-16 h-16">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>{"CN"}</AvatarFallback>
        </Avatar>
        <h1>{"名前"}</h1>
      </div>
      <p className="font-bold">{"作品"}</p>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-16">
        <div className="bg-gray-400">{"作品並ぶ"}</div>
        <div className="bg-gray-400">{"作品並ぶ"}</div>
        <div className="bg-gray-400">{"作品並ぶ"}</div>
        <div className="bg-gray-400">{"作品並ぶ"}</div>
      </div>
    </main>
  )
}
