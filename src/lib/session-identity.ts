import { normalizeSessionCode } from "@/lib/session-model"

const STORAGE_KEY = "pickr-session-identities"

export type SessionIdentity = {
  memberId: string
  nickname: string
}

type IdentityMap = Record<string, SessionIdentity | undefined>

function readIdentities(): IdentityMap {
  if (typeof window === "undefined") {
    return {}
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return {}
  }

  try {
    return JSON.parse(rawValue) as IdentityMap
  } catch {
    return {}
  }
}

function writeIdentities(identities: IdentityMap) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identities))
}

export function getSessionIdentity(code: string): SessionIdentity | null {
  const identities = readIdentities()
  return identities[normalizeSessionCode(code)] ?? null
}

export function saveSessionIdentity(code: string, identity: SessionIdentity) {
  const normalizedCode = normalizeSessionCode(code)
  const identities = readIdentities()

  identities[normalizedCode] = identity
  writeIdentities(identities)
}

export function clearSessionIdentity(code: string) {
  const normalizedCode = normalizeSessionCode(code)
  const identities = readIdentities()

  delete identities[normalizedCode]
  writeIdentities(identities)
}
