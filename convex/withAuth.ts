import { ObjectType, PropertyValidators, v } from "convex/values";
import { Session } from "lucia";
import {
  query as convexQuery,
  mutation as convexMutation,
  internalQuery as convexInternalQuery,
  internalMutation as convexInternalMutation,
  QueryCtx,
  MutationCtx,
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
    handler: async (ctx, args) => {
      const auth = getAuth(ctx.db);
      const session = await getValidSession(auth, (args as any).sessionId);
      return handler({ ...ctx, session }, args as any);
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
    handler: async (ctx, args) => {
      const auth = getAuth(ctx.db);
      const session = await getValidSession(auth, (args as any).sessionId);
      return handler({ ...ctx, session, auth }, args as any);
    },
  });
}

export function internalQuery<ArgsValidator extends PropertyValidators, Output>(
  args: ArgsValidator,
  handler: (
    ctx: Omit<QueryCtx, "auth"> & { auth: Auth; session: Session | null },
    args: ObjectType<ArgsValidator>
  ) => Output
) {
  return convexInternalQuery({
    args: { ...args, sessionId: v.union(v.null(), v.string()) },
    handler: async (ctx, args) => {
      const auth = getAuth(ctx.db);
      const session = await getValidSession(auth, (args as any).sessionId);
      return handler({ ...ctx, session, auth }, args as any);
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
    handler: async (ctx, args) => {
      const auth = getAuth(ctx.db);
      const session = await getValidSession(auth, (args as any).sessionId);
      return handler({ ...ctx, session, auth }, args as any);
    },
  });
}

async function getValidSession(auth: Auth, sessionId: string | null) {
  if (sessionId === null) {
    return null;
  }
  try {
    const session = (await auth.getSession(sessionId)) as Session | null;
    if (session === null) {
      return null;
    }
    return session.state === "idle" ? null : session;
  } catch (error) {
    // Invalid session ID
    return null;
  }
}
