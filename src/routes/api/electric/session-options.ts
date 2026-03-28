import { createFileRoute } from "@tanstack/react-router"
import { proxySessionOptionsShape } from "@/server/electric.server"

export const Route = createFileRoute("/api/electric/session-options")({
  server: {
    handlers: {
      GET: ({ request }) => proxySessionOptionsShape(request),
    },
  },
})
