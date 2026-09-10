import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { toast } from "sonner"
import { loginFn } from "~/server/functions/login"
import { resolveCallbackUrl } from "~/utils/resolve-callback-url"

export const Route = createFileRoute("/sign/in")({
  validateSearch: (search: Record<string, unknown>) => ({
    callbackUrl: (search.callbackUrl as string) || "/",
  }),
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const { callbackUrl } = Route.useSearch()
  const resolved = resolveCallbackUrl(callbackUrl)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  const onSubmit = async () => {
    setPending(true)
    const result = await loginFn({ data: { email, password } })
    setPending(false)
    if ("error" in result && result.error) {
      toast(result.error)
      return
    }
    navigate({ to: resolved })
  }

  return (
    <div className={"mx-auto max-w-xs space-y-4 p-4 pt-40"}>
      <h1 className="font-bold">{"HASCII"}</h1>
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <Input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button
          disabled={!email || !password || pending}
          type="submit"
          className="w-full"
        >
          {"ログイン"}
        </Button>
      </form>
    </div>
  )
}
