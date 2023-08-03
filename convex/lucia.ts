// lucia.ts
import {
  Adapter,
  KeySchema,
  LuciaError,
  SessionSchema,
  UserSchema,
  lucia,
} from "lucia";
import { DatabaseReader, DatabaseWriter } from "./_generated/server";

type SessionId = string;
type UserId = string;
type KeyId = string;

async function getSession(db: DatabaseReader, sessionId: string) {
  return await db
    .query("sessions")
    .withIndex("byId", (q) => q.eq("id", sessionId))
    .first();
}

async function getUser(db: DatabaseReader, userId: string) {
  return await db
    .query("users")
    .withIndex("byId", (q) => q.eq("id", userId))
    .first();
}

async function getKey(db: DatabaseReader, keyId: string) {
  return await db
    .query("auth_keys")
    .withIndex("byId", (q) => q.eq("id", keyId))
    .first();
}

const convexAdapter = (db: DatabaseWriter) => {
  return (luciaError: typeof LuciaError): Adapter => ({
    async getSessionAndUser(
      sessionId: string
    ): Promise<[SessionSchema, UserSchema] | [null, null]> {
      const session = await getSession(db, sessionId);
      if (session === null) {
        return [null, null];
      }
      const user = await getUser(db, session.user_id);
      if (user === null) {
        return [null, null];
      }
      return [session, user];
    },
    async deleteSession(sessionId: SessionId): Promise<void> {
      const session = await getSession(db, sessionId);
      if (session === null) {
        return;
      }
      await db.delete(session._id);
    },
    async deleteSessionsByUserId(userId: UserId): Promise<void> {
      const sessions = await this.getSessionsByUserId(userId);
      await Promise.all(sessions.map((session) => db.delete(session._id)));
    },
    async getSession(sessionId: SessionId): Promise<SessionSchema | null> {
      return await getSession(db, sessionId);
    },
    async getSessionsByUserId(userId: UserId): Promise<SessionSchema[]> {
      return await db
        .query("sessions")
        .withIndex("byUserId", (q) => q.eq("user_id", userId))
        .collect();
    },
    async setSession(session: SessionSchema): Promise<void> {
      const { _id, _creationTime, ...data } = session;
      await db.insert("sessions", data);
    },
    async deleteKeysByUserId(userId: UserId): Promise<void> {
      const keys = await db
        .query("auth_keys")
        .withIndex("byUserId", (q) => q.eq("user_id", userId))
        .collect();
      await Promise.all(keys.map((key) => db.delete(key._id)));
    },
    async deleteKey(keyId: KeyId): Promise<void> {
      const key = await getKey(db, keyId);
      if (key === null) {
        return;
      }
      await db.delete(key._id);
    },
    async deleteUser(userId: UserId): Promise<void> {
      const user = await getUser(db, userId);
      if (user === null) {
        return;
      }
      await db.delete(user._id);
    },
    async getKey(keyId: KeyId): Promise<KeySchema | null> {
      return await getKey(db, keyId);
    },
    async getKeysByUserId(userId: UserId): Promise<KeySchema[]> {
      return await db
        .query("auth_keys")
        .withIndex("byUserId", (q) => q.eq("user_id", userId))
        .collect();
    },
    async getUser(userId: UserId): Promise<UserSchema | null> {
      return await getUser(db, userId);
    },
    async setKey(key: KeySchema): Promise<void> {
      await db.insert("auth_keys", key);
    },
    async setUser(user: UserSchema, key: KeySchema | null): Promise<void> {
      const { _id, _creationTime, ...data } = user;
      await db.insert("users", data);
      if (key !== null) {
        await db.insert("auth_keys", key);
      }
    },
    async updateKey(
      keyId: string,
      partialKey: Partial<KeySchema>
    ): Promise<void> {
      const key = await getKey(db, keyId);
      if (key === null) {
        throw new luciaError("AUTH_INVALID_KEY_ID");
      }
      await db.patch(key._id, partialKey);
    },
    async updateUser(
      userId: string,
      partialUser: Partial<UserSchema>
    ): Promise<void> {
      const user = await getUser(db, userId);
      if (user === null) {
        throw new luciaError("AUTH_INVALID_USER_ID");
      }
      await db.patch(user._id, partialUser);
    },
    async updateSession(
      sessionId: string,
      partialSession: Partial<SessionSchema>
    ): Promise<void> {
      const session = await getSession(db, sessionId);
      if (session === null) {
        throw new luciaError("AUTH_INVALID_SESSION_ID");
      }
      await db.patch(session._id, partialSession);
    },
  });
};

export function getAuth(db: DatabaseReader) {
  return lucia({
    // We cheat to allow queries to use `getAuth`
    adapter: convexAdapter(db as DatabaseWriter),
    env: "DEV", // "PROD" if in prod
    getUserAttributes(user: UserSchema) {
      return {
        _id: user._id,
        _creationTime: user._creationTime,
        email: user.email,
      };
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;
