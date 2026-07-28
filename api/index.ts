import { authHandler, initAuthConfig } from "@hono/auth-js"
import { cors } from "hono/cors"
import { authConfig } from "~/interface/auth-config"
import { apiFactory } from "~/interface/api-factory"
import * as myPosts from "~/interface/routes/my-posts"
import * as myUser from "~/interface/routes/my-user"
import * as ogp from "~/interface/routes/ogp"
import * as postLike from "~/interface/routes/post-like"
import * as postLikes from "~/interface/routes/post-likes"
import * as post from "~/interface/routes/post"
import * as posts from "~/interface/routes/posts"
import * as user from "~/interface/routes/user"
import * as users from "~/interface/routes/users"

export default apiFactory
  .createApp()
  .use(
    "/*",
    cors({
      credentials: true,
      origin(origin, c) {
        return c.env.SITE_BASE_URL === origin ? origin : null
      },
    }),
  )
  .use("*", initAuthConfig(authConfig))
  .use("/auth/*", authHandler())
  .get("/my/user", ...myUser.GET)
  .put("/my/user", ...myUser.PUT)
  .delete("/my/user", ...myUser.DELETE)
  .get("/my/posts", ...myPosts.GET)
  .post("/posts", ...posts.POST)
  .get("/posts", ...posts.GET)
  .get("/posts/:post", ...post.GET)
  .put("/posts/:post", ...post.PUT)
  .delete("/posts/:post", ...post.DELETE)
  .post("/posts/:post/likes", ...postLikes.POST)
  .get("/posts/:post/likes", ...postLikes.GET)
  .delete("/posts/:post/likes/:like", ...postLike.DELETE)
  .get("/users", ...users.GET)
  .post("/users", ...users.POST)
  .get("/user/:user", ...user.GET)
  .get("/ogp/:dots", ...ogp.GET)
