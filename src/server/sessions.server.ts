import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm';
import { db } from "@/db";
import { sessions } from "@/db/schema";

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

export async function createSession(topic: string) {
  const code = await generateUniqueCode()
  await db.insert(sessions).values({
    code,
    topic
  })
  return { code }
}