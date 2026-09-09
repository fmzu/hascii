import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { getPostsFn } from "~/server/functions/get-posts"
import { getCurrentUserFn } from "~/server/functions/get-current-user"
import { DotPreviewCanvas } from "~/components/dot-preview-canvas"
import { MainHeader } from "~/components/main-header"

export const Route = createFileRoute("/")({
  loader: async () => {
    const [posts, user] = await Promise.all([getPostsFn(), getCurrentUserFn()])
    return { posts, user }
  },
  component: HomePage,
})

function HomePage() {
  const { posts, user } = Route.useLoaderData()

  return (
    <>
      <MainHeader isAuthenticated={user !== null} />
      <div className="container px-8 pb-4">
        <Link to="/dot">
          <Button>{"描いてみる"}</Button>
        </Link>
      </div>
      <main className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-16 px-8 pb-8 container">
        {posts.map((post) => (
          <Link key={post.id} to="/posts/$post" params={{ post: post.id }}>
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
