import { useEffect, useState } from "react"

type Props = {
  onKeyDown(): void
  onKeyUp(): void
}

export function useSpaceKey(props: Props) {
  const [isActive, setActive] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        // スクロール防止
        event.preventDefault()
        props.onKeyDown()
        setActive(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        props.onKeyUp()
        setActive(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [props.onKeyUp, props.onKeyDown])

  return isActive
}
