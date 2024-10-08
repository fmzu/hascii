import { WorkerEntrypoint } from "cloudflare:workers"
import { api } from "~/interface/api"
import type { Env } from "~/worker-configuration"

export type Api = typeof api

export default class extends WorkerEntrypoint<Env> {
  fetch(request: Request) {
    return api.fetch(request, this.env)
  }
}
