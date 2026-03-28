import { createFileRoute } from "@tanstack/react-router"
import { proxySessionMembersShape } from "@/server/electric.server"

export const Route = createFileRoute("/api/electric/session-members")({
  server: {
    handlers: {
      GET: ({ request }) => proxySessionMembersShape(request),
    },
  },
})
