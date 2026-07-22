import { redirect } from "react-router"

export function loader() {
  return redirect(`/dot/${"-".repeat(63)}`)
}
