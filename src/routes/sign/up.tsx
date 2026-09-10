import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { createUserFn } from "~/server/functions/create-user"
import { resolveCallbackUrl } from "~/utils/resolve-callback-url"

export const Route = createFileRoute("/sign/up")({
  validateSearch: (search: Record<string, unknown>) => ({
    callbackUrl: (search.callbackUrl as string) || "/",
  }),
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()
  const { callbackUrl } = Route.useSearch()
  const resolved = resolveCallbackUrl(callbackUrl)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  const onSubmit = async () => {
    setPending(true)
    await createUserFn({ data: { email, password } })
    setPending(false)
    navigate({
      to: "/sign/in",
      search: { callbackUrl: resolved },
    })
  }

  return (
    <div className={"mx-auto max-w-xs space-y-4 p-4 pt-40"}>
      <h1>{"新しいアカウント"}</h1>
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <Input
          type={"email"}
          placeholder="メールアドレス"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
          }}
        />
        <Input
          type={"password"}
          placeholder="パスワード"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
          }}
        />
        <Button
          disabled={!email || !password || pending}
          type={"submit"}
          className="w-full"
        >
          {"登録する"}
        </Button>
      </form>
    </div>
  )
}
