import { v } from "convex/values";
import { query, mutation } from "./withAuth";
import { Id } from "./_generated/dataModel";

export const get = query({}, async (ctx) => {
  return ctx.session?.user;
});

export const signIn = mutation(
  {
    email: v.string(),
    password: v.string(),
  },
  async (ctx, { email, password }) => {
    const key = await ctx.auth.useKey("password", email, password);
    const session = await ctx.auth.createSession({
      userId: key.userId,
      attributes: {
        // These will be filled out by Convex
        _id: "" as Id<"sessions">,
        _creationTime: 0,
      },
    });
    return session.sessionId;
  }
);

export const signUp = mutation(
  {
    email: v.string(),
    password: v.string(),
  },
  async (ctx, { email, password }) => {
    const user = await ctx.auth.createUser({
      key: {
        password: password,
        providerId: "password",
        providerUserId: email,
      },
      attributes: {
        email,
        // These will be filled out by Convex
        _id: "" as Id<"users">,
        _creationTime: 0,
      },
    });
    const session = await ctx.auth.createSession({
      userId: user.userId,
      attributes: {
        // These will be filled out by Convex
        _id: "" as Id<"sessions">,
        _creationTime: 0,
      },
    });
    return session.sessionId;
  }
);
