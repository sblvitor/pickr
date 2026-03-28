import { createServerFn } from "@tanstack/react-start"
import {
  addSessionOption,
  createSession,
  joinSession,
  updateSessionState,
} from "./sessions.server"

export const createSessionFn = createServerFn({ method: "POST" })
  .inputValidator((data: { topic: string; hostNickname?: string }) => data)
  .handler(async ({ data }) => {
    return createSession(data.topic, data.hostNickname)
  })

export const joinSessionFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { code: string; memberId: string; nickname: string }) => data
  )
  .handler(async ({ data }) => {
    return joinSession(data.code, data.memberId, data.nickname)
  })

export const addSessionOptionFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      code: string
      optionId: string
      createdByMemberId: string
      label: string
    }) => data
  )
  .handler(async ({ data }) => {
    return addSessionOption(
      data.code,
      data.optionId,
      data.createdByMemberId,
      data.label
    )
  })

export const updateSessionStateFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { code: string; status: string; chosenOptionId?: string | null }) =>
      data
  )
  .handler(async ({ data }) => {
    return updateSessionState(data.code, data.status, data.chosenOptionId)
  })