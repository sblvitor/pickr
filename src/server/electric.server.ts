import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client"
import { sql } from "@/db"
import { normalizeSessionCode } from "@/lib/session-model"

const EMPTY_SESSION_ID = "00000000-0000-0000-0000-000000000000"

function getElectricBaseUrl() {
  const electricUrl = process.env.ELECTRIC_URL

  if (!electricUrl) {
    throw new Error("ELECTRIC_URL is not set")
  }

  return electricUrl.replace(/\/+$/, "")
}

async function getSessionIdByCode(code: string): Promise<string | null> {
  const rows = (await sql`
    select id
    from sessions
    where code = ${normalizeSessionCode(code)}
    limit 1
  `) as Array<{ id: string }>

  return rows[0]?.id ?? null
}

function copyElectricProtocolParams(requestUrl: URL, targetUrl: URL) {
  requestUrl.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      targetUrl.searchParams.set(key, value)
    }
  })
}

function addElectricAuth(targetUrl: URL) {
  const sourceId = process.env.ELECTRIC_SOURCE_ID
  const secret = process.env.ELECTRIC_SECRET

  if (sourceId && secret) {
    targetUrl.searchParams.set("source_id", sourceId)
    targetUrl.searchParams.set("secret", secret)
  }
}

function setWhereParams(targetUrl: URL, params: Record<string, string>) {
  for (const [key, value] of Object.entries(params)) {
    targetUrl.searchParams.set(`params[${key}]`, value)
  }
}

async function proxyShape(request: Request, targetUrl: URL) {
  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      accept: request.headers.get("accept") ?? "*/*",
      "cache-control": request.headers.get("cache-control") ?? "no-cache",
      "last-event-id": request.headers.get("last-event-id") ?? "",
    },
  })

  const headers = new Headers(response.headers)
  headers.delete("content-encoding")
  headers.delete("content-length")

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export async function proxySessionShape(request: Request) {
  const requestUrl = new URL(request.url)
  const code = normalizeSessionCode(requestUrl.searchParams.get("code") ?? "")
  const targetUrl = new URL(`${getElectricBaseUrl()}/v1/shape`)

  copyElectricProtocolParams(requestUrl, targetUrl)
  addElectricAuth(targetUrl)

  targetUrl.searchParams.set("table", "sessions")
  targetUrl.searchParams.set("where", "code = $1")
  setWhereParams(targetUrl, { 1: code })

  return proxyShape(request, targetUrl)
}

async function proxySessionScopedShape(
  request: Request,
  table: "session_members" | "session_options"
) {
  const requestUrl = new URL(request.url)
  const code = normalizeSessionCode(requestUrl.searchParams.get("code") ?? "")
  const sessionId = await getSessionIdByCode(code)
  const targetUrl = new URL(`${getElectricBaseUrl()}/v1/shape`)

  copyElectricProtocolParams(requestUrl, targetUrl)
  addElectricAuth(targetUrl)

  targetUrl.searchParams.set("table", table)
  targetUrl.searchParams.set("where", "session_id = $1")
  setWhereParams(targetUrl, { 1: sessionId ?? EMPTY_SESSION_ID })

  return proxyShape(request, targetUrl)
}

export function proxySessionMembersShape(request: Request) {
  return proxySessionScopedShape(request, "session_members")
}

export function proxySessionOptionsShape(request: Request) {
  return proxySessionScopedShape(request, "session_options")
}
