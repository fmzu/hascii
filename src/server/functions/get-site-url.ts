import { createServerFn } from "@tanstack/react-start"
import { getRequestUrl } from "@tanstack/react-start/server"

export const getSiteUrlFn = createServerFn({ method: "GET" }).handler(() => {
  return getRequestUrl().origin
})
