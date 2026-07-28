import { useParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { Award } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { client } from "~/lib/client"
import { loaderClient } from "~/lib/loader-client"
import { DotPreviewCanvas } from "~/routes/_main._index/components/dot-preview-canvas"
import { SettingsCard } from "~/routes/_main.posts.$post._index/components/settings-card"
import { MainHeader } from "~/routes/_main/components/main-header"
import type { Route } from "./+types/route"

type PostDetail = {
  title: string | null
  description: string | null
  dots: string
}

/**
 * サーバーサイドで投稿データを取得する
 * OGPクローラーはJavaScriptを実行しないため、meta タグをSSRで出力するために必要
 */
export async function loader({
  params,
}: Route.LoaderArgs): Promise<PostDetail> {
  const postId = params.post

  if (postId === undefined) {
    throw new Response("Not Found", { status: 404 })
  }

  const resp = await loaderClient.posts[":post"].$get({
    param: { post: postId },
  })

  if (!resp.ok) {
    throw new Response("Not Found", { status: 404 })
  }

  return await resp.json()
}

export function meta({ data }: Route.MetaArgs) {
  const apiUrl = import.meta.env.VITE_API_URL
  const title = data?.title ?? "HASCII"
  const description = data?.description || "HASCII"
  const ogpImage = data?.dots ? `${apiUrl}/ogp/${data.dots}` : ""

  return [
    { title },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogpImage },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]
}

export default function Route() {
  /**
   * パラメータから投稿IDを取得する
   * パラメータには投稿IDの文字列のみが入る（型定義）
   */
  const params = useParams<"post">()

  const postId = params.post
  /**
   * パラメータが投稿をもっていない場合はエラーを返す
   */
  if (postId === undefined) {
    throw new Error("Post not found")
  }

  const postData = useQuery({
    queryKey: ["posts", postId],
    async queryFn() {
      const resp = await client.posts[":post"].$get({
        param: { post: postId },
      })

      const post = await resp.json()

      return post
    },
  })

  // const likeData = useSuspenseQuery({
  //   queryKey: ["like"],
  //   async queryFn() {
  //     const resp = await client.posts[":post"].likes.$post({
  //       param: { post: postId },
  //     })

  //     const like = await resp.json()

  //     return like
  //   },
  // })

  const [isActive, setIsActive] = useState(false)

  const toggleActive = () => {
    setIsActive(!isActive)
    // likeData.refetch()
  }

  if (postData.data === null) {
    return null
  }

  if (postData.data === undefined) {
    return null
  }

  return (
    <>
      <MainHeader />
      <main className="px-8 sm:p-8 lg:p-16 container space-y-16">
        <div className="flex justify-center items-center">
          <div className="w-full max-w-sm flex flex-col gap-y-8">
            <Card className="bg-gray-200 overflow-hidden shadow-xl w-full">
              <DotPreviewCanvas dots={postData.data.dots} />
            </Card>
            <div className="px-16">
              <Card className="space-y-2 bg-white shadow-md p-4">
                <div className="flex items-center space-x-2 justify-between">
                  <h1 className="text-lg font-bold">{postData.data.title}</h1>
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
                <p className="text-sm opacity-80">
                  {postData.data.description}
                </p>
              </Card>
            </div>
          </div>
        </div>
        {postData.data.isMine && <SettingsCard postId={postId} />}
      </main>
    </>
  )
}
