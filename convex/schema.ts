import { defineSchema, defineTable } from "convex/server";
import { Validator, v } from "convex/values";

export default defineSchema({
  ...authTables({
    user: { email: v.string() },
    session: {},
  }),
});

function authTables<
  UserFields extends Record<string, Validator<any, any, any>>,
  SchemaFields extends Record<string, Validator<any, any, any>>
>({ user, session }: { user: UserFields; session: SchemaFields }) {
  return {
    users: defineTable({
      ...user,
      id: v.string(),
    }).index("byId", ["id"]),
    sessions: defineTable({
      ...session,
      id: v.string(),
      user_id: v.string(),
      active_expires: v.float64(),
      idle_expires: v.float64(),
    })
      .index("byId", ["id" as any])
      .index("byUserId", ["user_id" as any]),
    auth_keys: defineTable({
      id: v.string(),
      hashed_password: v.union(v.string(), v.null()),
      user_id: v.string(),
    })
      .index("byId", ["id"])
      .index("byUserId", ["user_id"]),
  };
}
