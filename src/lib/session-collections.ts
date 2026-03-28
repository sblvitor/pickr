import { snakeCamelMapper } from "@electric-sql/client"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import { createCollection } from "@tanstack/react-db"
import {
  addSessionOptionFn,
  joinSessionFn,
  updateSessionStateFn,
} from "@/server/sessions.functions"
import {
  normalizeSessionCode,
  sessionMemberSchema,
  sessionOptionSchema,
  sessionSchema,
} from "@/lib/session-model"

function createShapeOptions(url: string, code: string) {
  return {
    url,
    params: { code },
    columnMapper: snakeCamelMapper(),
    parser: {
      timestamp: (value: string) => new Date(value),
      timestamptz: (value: string) => new Date(value),
    },
    onError: (error: unknown) => {
      console.error("Electric sync error", error)
      return {}
    },
  }
}

export type SessionCollections = ReturnType<typeof createSessionCollections>

function createSessionCollections(code: string) {
  const normalizedCode = normalizeSessionCode(code)

  const sessionsCollection = createCollection(
    electricCollectionOptions({
      id: `session-${normalizedCode}`,
      schema: sessionSchema,
      getKey: (session) => session.id,
      shapeOptions: createShapeOptions("/api/electric/session", normalizedCode),
      onUpdate: async ({ transaction }) => {
        const session = transaction.mutations[0].modified
        const result = await updateSessionStateFn({
          data: {
            code: normalizedCode,
            status: session.status,
            chosenOptionId: session.chosenOptionId,
          },
        })

        return { txid: result.txid }
      },
    })
  )

  const sessionMembersCollection = createCollection(
    electricCollectionOptions({
      id: `session-members-${normalizedCode}`,
      schema: sessionMemberSchema,
      getKey: (member) => member.id,
      shapeOptions: createShapeOptions(
        "/api/electric/session-members",
        normalizedCode
      ),
      onInsert: async ({ transaction }) => {
        const member = transaction.mutations[0].modified
        const result = await joinSessionFn({
          data: {
            code: normalizedCode,
            memberId: member.id,
            nickname: member.nickname,
          },
        })

        return { txid: result.txid }
      },
    })
  )

  const sessionOptionsCollection = createCollection(
    electricCollectionOptions({
      id: `session-options-${normalizedCode}`,
      schema: sessionOptionSchema,
      getKey: (option) => option.id,
      shapeOptions: createShapeOptions(
        "/api/electric/session-options",
        normalizedCode
      ),
      onInsert: async ({ transaction }) => {
        const option = transaction.mutations[0].modified
        const result = await addSessionOptionFn({
          data: {
            code: normalizedCode,
            optionId: option.id,
            createdByMemberId: option.createdByMemberId ?? "",
            label: option.label,
          },
        })

        return { txid: result.txid }
      },
    })
  )

  return {
    code: normalizedCode,
    sessionsCollection,
    sessionMembersCollection,
    sessionOptionsCollection,
  }
}

const sessionCollectionCache = new Map<string, SessionCollections>()

export function getSessionCollections(code: string) {
  const normalizedCode = normalizeSessionCode(code)

  if (typeof window === "undefined") {
    return createSessionCollections(normalizedCode)
  }

  const cachedCollections = sessionCollectionCache.get(normalizedCode)
  if (cachedCollections) {
    return cachedCollections
  }

  const collections = createSessionCollections(normalizedCode)
  sessionCollectionCache.set(normalizedCode, collections)
  return collections
}
