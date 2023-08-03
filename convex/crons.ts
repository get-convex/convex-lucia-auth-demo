import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { getAuth } from "./lucia";

const crons = cronJobs();

crons.daily(
  "clear stale sessions and keys",
  { hourUTC: 8, minuteUTC: 0 },
  internal.crons.clearStaleSessionsAndKeys
);

export const clearStaleSessionsAndKeys = internalMutation(async (ctx) => {
  const sessions = await ctx.db.query("sessions").collect();
  for (const session of sessions) {
    await getAuth(ctx.db).deleteDeadUserSessions(session.user_id);
  }
});

export default crons;
