import { createServerFn } from "@tanstack/react-start";
import { createSession } from "./sessions.server";

export const createSessionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { topic: string; hostNickname?: string }) => data)
  .handler(async ({ data }) => {
    return createSession(data.topic, data.hostNickname)
  })