import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'
import { db, sql } from "@/db"
import { sessionMembers, sessions } from "@/db/schema"
import { normalizeSessionCode } from "@/lib/session-model"

async function generateUniqueCode() {
  const code = nanoid(5).toUpperCase()

  const existing = await db
    .select()
    .from(sessions)
    .where(eq(sessions.code, code))
    .limit(1)

  if (existing.length > 0) return generateUniqueCode()
  return code
}

function normalizeNickname(nickname?: string) {
  const trimmedNickname = nickname?.trim()
  return trimmedNickname && trimmedNickname.length > 0 ? trimmedNickname : "Host"
}

export async function createSession(topic: string, hostNickname?: string) {
  const code = await generateUniqueCode()
  const nickname = normalizeNickname(hostNickname)

  const [session] = await db.insert(sessions).values({
    code,
    topic,
  }).returning({
    id: sessions.id,
    code: sessions.code,
  })

  const [member] = await db.insert(sessionMembers).values({
    sessionId: session.id,
    nickname,
    isHost: true,
  }).returning({
    id: sessionMembers.id,
  })

  return { code: session.code, memberId: member.id, nickname }
}

export async function joinSession(
  code: string,
  memberId: string,
  nickname: string,
) {
  const normalizedCode = normalizeSessionCode(code)

  const rows = (await sql`
    WITH ins AS (
      INSERT INTO session_members (id, session_id, nickname, is_host)
      SELECT ${memberId}::uuid, s.id, ${nickname}, false
      FROM sessions s
      WHERE s.code = ${normalizedCode}
      RETURNING id
    )
    SELECT txid_current()::text AS txid FROM ins
  `) as Array<{ txid: string }>

  if (rows.length === 0) {
    throw new Error("Session not found")
  }

  return { txid: Number(rows[0].txid) }
}

export async function addSessionOption(
  code: string,
  optionId: string,
  createdByMemberId: string,
  label: string,
) {
  const normalizedCode = normalizeSessionCode(code)

  const rows = (await sql`
    WITH ins AS (
      INSERT INTO session_options (id, session_id, created_by_member_id, label)
      SELECT ${optionId}::uuid, s.id, ${createdByMemberId}::uuid, ${label}
      FROM sessions s
      WHERE s.code = ${normalizedCode}
      RETURNING id
    )
    SELECT txid_current()::text AS txid FROM ins
  `) as Array<{ txid: string }>

  if (rows.length === 0) {
    throw new Error("Session not found")
  }

  return { txid: Number(rows[0].txid) }
}

export async function updateSessionState(
  code: string,
  status: string,
  chosenOptionId?: string | null,
) {
  const normalizedCode = normalizeSessionCode(code)

  const rows = (await sql`
    WITH upd AS (
      UPDATE sessions
      SET status = ${status},
          chosen_option_id = ${chosenOptionId ?? null},
          updated_at = now()
      WHERE code = ${normalizedCode}
      RETURNING id
    )
    SELECT txid_current()::text AS txid FROM upd
  `) as Array<{ txid: string }>

  if (rows.length === 0) {
    throw new Error("Session not found")
  }

  return { txid: Number(rows[0].txid) }
}