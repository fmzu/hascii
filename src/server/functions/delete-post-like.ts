import { createServerFn } from "@tanstack/react-start"

export const deletePostLikeFn = createServerFn({ method: "POST" })
  .validator((data: { postId: string; likeId: string }) => data)
  .handler(async () => {
    return {}
  })
