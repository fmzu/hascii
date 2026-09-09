import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Award } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { DotPreviewCanvas } from "~/components/dot-preview-canvas"
import { SettingsCard } from "~/components/settings-card"
import { MainHeader } from "~/components/main-header"
import { getPostFn } from "~/server/functions/get-post"
import { getCurrentUserFn } from "~/server/functions/get-current-user"

export const Route = createFileRoute("/posts/$post/")({
  loader: async ({ params }) => {
    const [post, user] = await Promise.all([
      getPostFn({ data: { postId: params.post } }),
      getCurrentUserFn(),
    ])
    return { post, user }
  },
  head: ({ loaderData }) => {
    const title = loaderData?.post.title ?? "HASCII"
    const description = loaderData?.post.description || "HASCII"
    const ogpImage = loaderData?.post.dots ? `/ogp/${loaderData.post.dots}` : ""

    return {
      meta: [
        { title },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogpImage },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    }
  },
  component: PostDetailPage,
})

function PostDetailPage() {
  const { post, user } = Route.useLoaderData()
  const { post: postId } = Route.useParams()
  const [isActive, setIsActive] = useState(false)

  const toggleActive = () => {
    setIsActive(!isActive)
  }

  return (
    <>
      <MainHeader isAuthenticated={user !== null} />
      <main className="px-8 sm:p-8 lg:p-16 container space-y-16">
        <div className="flex justify-center items-center">
          <div className="w-full max-w-sm flex flex-col gap-y-8">
            <Card className="bg-gray-200 overflow-hidden shadow-xl w-full">
              <DotPreviewCanvas dots={post.dots} />
            </Card>
            <div className="px-16">
              <Card className="space-y-2 bg-white shadow-md p-4">
                <div className="flex items-center space-x-2 justify-between">
                  <h1 className="text-lg font-bold">{post.title}</h1>
                  <Button
                    variant={"secondary"}
                    onClick={toggleActive}
                    className={isActive ? "active" : ""}
                  >
                    <Award
                      className={isActive ? "w-4" : ""}
                      color={isActive ? "#000" : "#fbbf24"}
                    />
                  </Button>
                </div>
                <Separator />
                <p className="text-sm opacity-80">{post.description}</p>
              </Card>
            </div>
          </div>
        </div>
        {post.isMine && <SettingsCard postId={postId} />}
      </main>
    </>
  )
}
