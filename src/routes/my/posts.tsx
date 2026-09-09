import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { Suspense } from "react"
import { HomeIcon, LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "~/components/ui/sidebar"
import { getMyPostsFn } from "~/server/functions/get-my-posts"

export const Route = createFileRoute("/my/posts")({
  loader: () => getMyPostsFn(),
  component: MyPostsLayout,
})

function MyPostsLayout() {
  const posts = Route.useLoaderData()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/">
                  <SidebarMenuButton asChild>
                    <span className="flex">
                      <HomeIcon />
                      <span>{"ホーム"}</span>
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>{"作品"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {posts.map((post) => (
                  <SidebarMenuItem key={post.id}>
                    <Link
                      to="/my/posts/$post"
                      params={{ post: post.id }}
                    >
                      <SidebarMenuButton asChild>
                        <span className="flex">
                          {post.isPublic ? (
                            <LockKeyholeOpenIcon />
                          ) : (
                            <LockKeyholeIcon />
                          )}
                          {post.title}
                        </span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </SidebarProvider>
  )
}
