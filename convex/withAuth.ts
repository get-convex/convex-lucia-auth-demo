import { ObjectType, PropertyValidators, v } from "convex/values";
import { Session } from "lucia";
import {
  query as convexQuery,
  mutation as convexMutation,
  internalQuery as convexInternalQuery,
  internalMutation as convexInternalMutation,
  QueryCtx,
  MutationCtx,
  DatabaseWriter,
} from "./_generated/server";
import { Auth, getAuth } from "./lucia";

export function query<ArgsValidator extends PropertyValidators, Output>(
  args: ArgsValidator,
  handler: (
    ctx: QueryCtx & { session: Session | null },
    args: ObjectType<ArgsValidator>
  ) => Output
) {
  return convexQuery({
    args: { ...args, sessionId: v.union(v.null(), v.string()) },
    handler: async (ctx, args: any) => {
      const session = await getValidExistingSession(ctx, args.sessionId);
      return handler({ ...ctx, session }, args);
    },
  });
}

export function internalQuery<ArgsValidator extends PropertyValidators, Output>(
  args: ArgsValidator,
  handler: (
    ctx: Omit<QueryCtx, "auth"> & { session: Session | null },
    args: ObjectType<ArgsValidator>
  ) => Output
) {
  return convexInternalQuery({
    args: { ...args, sessionId: v.union(v.null(), v.string()) },
    handler: async (ctx, args: any) => {
      const session = await getValidExistingSession(ctx, args.sessionId);
      return handler({ ...ctx, session }, args);
    },
  });
}

export function mutation<ArgsValidator extends PropertyValidators, Output>(
  args: ArgsValidator,
  handler: (
    ctx: Omit<MutationCtx, "auth"> & { auth: Auth; session: Session | null },
    args: ObjectType<ArgsValidator>
  ) => Output
) {
  return convexMutation({
    args: { ...args, sessionId: v.union(v.null(), v.string()) },
    handler: async (ctx, args: any) => {
      const auth = getAuth(ctx.db);
      const session = await getValidSessionAndRenew(auth, args.sessionId);
      return handler({ ...ctx, session, auth }, args);
    },
  });
}

export function internalMutation<
  ArgsValidator extends PropertyValidators,
  Output
>(
  args: ArgsValidator,
  handler: (
    ctx: Omit<MutationCtx, "auth"> & { auth: Auth; session: Session | null },
    args: ObjectType<ArgsValidator>
  ) => Output
) {
  return convexInternalMutation({
    args: { ...args, sessionId: v.union(v.null(), v.string()) },
    handler: async (ctx, args: any) => {
      const auth = getAuth(ctx.db);
      const session = await getValidSessionAndRenew(auth, args.sessionId);
      return handler({ ...ctx, session, auth }, args);
    },
  });
}

async function getValidExistingSession(
  ctx: QueryCtx,
  sessionId: string | null
) {
  if (sessionId === null) {
    return null;
  }
  // The cast is OK because we will only expose the existing session
  const auth = getAuth(ctx.db as DatabaseWriter);
  try {
    const session = (await auth.getSession(sessionId)) as Session | null;
    if (session === null || session.state === "idle") {
      return null;
    }
    return session;
  } catch (error) {
    // Invalid session ID
    return null;
  }
}

async function getValidSessionAndRenew(auth: Auth, sessionId: string | null) {
  if (sessionId === null) {
    return null;
  }
  try {
    return await auth.validateSession(sessionId);
  } catch (error) {
    // Invalid session ID
    return null;
  }
}
