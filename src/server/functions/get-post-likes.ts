import { createServerFn } from "@tanstack/react-start"

export const getPostLikesFn = createServerFn({ method: "GET" })
  .validator((data: { postId: string }) => data)
  .handler(async () => {
    return {}
  })
