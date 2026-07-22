import { useNavigate, useSearchParams } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { client } from "~/lib/client"
import { resolveCallbackUrl } from "~/utils/resolve-callback-url"

export default function Route() {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const callbackUrl = resolveCallbackUrl(searchParams.get("callbackUrl"))

  const [loginId, setLoginId] = useState("")

  const [password, setPassword] = useState("")

  const mutation = useMutation({
    async mutationFn() {
      const resp = await client.users.$post({
        json: {
          email: loginId,
          password: password,
        },
      })
      const json = await resp.json()
      return json
    },
  })

  const onSubmit = () => {
    const result = mutation.mutate()
    if (result === null) {
      return
    }
    navigate(`/sign/in?callbackUrl=${encodeURIComponent(callbackUrl)}`)
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
          value={loginId}
          onChange={(event) => {
            setLoginId(event.target.value)
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
          disabled={!loginId || !password}
          type={"submit"}
          className="w-full"
        >
          {"登録する"}
        </Button>
      </form>
    </div>
  )
}
