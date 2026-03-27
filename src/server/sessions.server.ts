import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm';
import { db } from "@/db";
import { sessionMembers, sessions } from "@/db/schema";

async function generateUniqueCode() {
  const code = nanoid(5).toUpperCase()

  const existing =  await db
    .select()
    .from(sessions)
    .where(eq(sessions.code, code))
    .limit(1)

  if(existing.length > 0) return generateUniqueCode()
  return code 
}

function normalizeNickname(nickname?: string) {
  const trimmedNickname = nickname?.trim()
  return trimmedNickname && trimmedNickname.length > 0 ? trimmedNickname : "Host"
}

export async function createSession(topic: string, hostNickname?: string) {
  const code = await generateUniqueCode()
  const [session] = await db.insert(sessions).values({
    code,
    topic
  }).returning({
    id: sessions.id,
    code: sessions.code,
  })

  await db.insert(sessionMembers).values({
    sessionId: session.id,
    nickname: normalizeNickname(hostNickname),
    isHost: true,
  })

  return { code: session.code }
}