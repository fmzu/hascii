import type { LoaderFunctionArgs } from "react-router"
import { Link, useLoaderData } from "react-router"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { loaderClient } from "~/lib/loader-client"
import { DotPreviewCanvas } from "~/routes/_main._index/components/dot-preview-canvas"
import { MainHeader } from "~/routes/_main/components/main-header"

export async function loader(args: LoaderFunctionArgs) {
  const resp = await loaderClient.posts.$get()

  const posts = await resp.json()

  return posts
}

export default function Route() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <MainHeader />
      <div className="container px-8 pb-4">
        <Link to="/dot">
          <Button>{"描いてみる"}</Button>
        </Link>
      </div>
      <main className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-16 px-8 pb-8 container">
        {data.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <Card className="bg-gray-200 overflow-hidden shadow-md hover:scale-105 duration-100">
              <div className="overflow-hidden rounded-md">
                <DotPreviewCanvas dots={post.dots} />
              </div>
            </Card>
            <div className="pl-4">
              <Card className="bg-gray-100 rounded-t-none rounded-b-sm shadow-md px-2 w-3/5">
                <h1 className="text-xs">{post.title || "\u00A0"}</h1>
              </Card>
            </div>
          </Link>
        ))}
      </main>
    </>
  )
}
