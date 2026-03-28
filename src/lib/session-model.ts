import { z } from "zod"

export const sessionStatusValues = [
  "open",
  "deciding",
  "chosen",
  "closed",
] as const

const dateField = z.union([z.string(), z.date()]).transform((value) => {
  return typeof value === "string" ? new Date(value) : value
})

export const sessionStatusSchema = z.enum(sessionStatusValues)

export const sessionSchema = z.object({
  id: z.uuid(),
  code: z.string().min(1),
  topic: z.string().min(1),
  status: sessionStatusSchema,
  chosenOptionId: z.string().uuid().nullable(),
  createdAt: dateField,
  updatedAt: dateField,
})

export const sessionMemberSchema = z.object({
  id: z.uuid(),
  sessionId: z.uuid(),
  nickname: z.string().min(1),
  isHost: z.boolean(),
  createdAt: dateField,
})

export const sessionOptionSchema = z.object({
  id: z.uuid(),
  sessionId: z.uuid(),
  createdByMemberId: z.uuid().nullable(),
  label: z.string().min(1),
  createdAt: dateField,
})

export const createSessionInputSchema = z.object({
  topic: z.string().trim().min(1).max(120),
  hostNickname: z.string().trim().min(1).max(40).optional(),
})

export const joinSessionInputSchema = z.object({
  code: z.string().trim().min(1).max(16),
  memberId: z.uuid(),
  nickname: z.string().trim().min(1).max(40),
})

export const addSessionOptionInputSchema = z.object({
  code: z.string().trim().min(1).max(16),
  optionId: z.uuid(),
  createdByMemberId: z.uuid(),
  label: z.string().trim().min(1).max(120),
})

export const updateSessionStateInputSchema = z.object({
  code: z.string().trim().min(1).max(16),
  status: sessionStatusSchema,
  chosenOptionId: z.uuid().nullable().optional(),
})

export type SessionStatus = z.infer<typeof sessionStatusSchema>
export type Session = z.infer<typeof sessionSchema>
export type SessionMember = z.infer<typeof sessionMemberSchema>
export type SessionOption = z.infer<typeof sessionOptionSchema>
export type CreateSessionInput = z.infer<typeof createSessionInputSchema>
export type JoinSessionInput = z.infer<typeof joinSessionInputSchema>
export type AddSessionOptionInput = z.infer<typeof addSessionOptionInputSchema>
export type UpdateSessionStateInput = z.infer<
  typeof updateSessionStateInputSchema
>

export function normalizeSessionCode(code: string) {
  return code.trim().toUpperCase()
}
