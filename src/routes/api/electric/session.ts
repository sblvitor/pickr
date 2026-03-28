import { createFileRoute } from "@tanstack/react-router"
import { proxySessionShape } from "@/server/electric.server"

export const Route = createFileRoute("/api/electric/session")({
  server: {
    handlers: {
      GET: ({ request }) => proxySessionShape(request),
    },
  },
})
