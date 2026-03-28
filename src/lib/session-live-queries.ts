import {  eq } from "@tanstack/react-db"
import type {InitialQueryBuilder} from "@tanstack/react-db";
import type { SessionCollections } from "@/lib/session-collections"

export function getSessionSummaryQuery(collections: SessionCollections) {
  return (q: InitialQueryBuilder) =>
    q
      .from({ session: collections.sessionsCollection })
      .leftJoin(
        { option: collections.sessionOptionsCollection },
        ({ session, option }) => eq(session.chosenOptionId, option.id)
      )
      .select(({ session, option }) => ({
        id: session.id,
        code: session.code,
        topic: session.topic,
        status: session.status,
        chosenOptionId: session.chosenOptionId,
        chosenOptionLabel: option.label,
        updatedAt: session.updatedAt,
        createdAt: session.createdAt,
      }))
      .findOne()
}

export function getSessionMembersQuery(collections: SessionCollections) {
  return (q: InitialQueryBuilder) =>
    q
      .from({ member: collections.sessionMembersCollection })
      .orderBy(({ member }) => member.createdAt, "asc")
}

export function getSessionOptionsQuery(collections: SessionCollections) {
  return (q: InitialQueryBuilder) =>
    q
      .from({ option: collections.sessionOptionsCollection })
      .orderBy(({ option }) => option.createdAt, "asc")
}

export function getCurrentMemberQuery(
  collections: SessionCollections,
  memberId: string
) {
  return (q: InitialQueryBuilder) =>
    q
      .from({ member: collections.sessionMembersCollection })
      .where(({ member }) => eq(member.id, memberId))
      .findOne()
}
