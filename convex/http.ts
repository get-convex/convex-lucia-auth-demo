import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/signIn",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const data = await request.formData();
    validateAuthRequest(request);
    const sessionId = await ctx.runMutation(internal.users.signIn, {
      sessionId: null,
      email: data.get("email") as string,
      password: data.get("password") as string,
    });
    return new Response(sessionId, {
      status: 200,
      // CORS headers
      headers: new Headers({
        // We took care of validation above
        "Access-Control-Allow-Origin": "*",
        Vary: "origin",
      }),
    });
  }),
});

// Define additional routes
http.route({
  path: "/signUp",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const data = await request.formData();
    validateAuthRequest(request);
    const sessionId = await ctx.runMutation(internal.users.signUp, {
      sessionId: null,
      email: data.get("email") as string,
      password: data.get("password") as string,
    });
    return new Response(sessionId, {
      status: 200,
      // CORS headers
      headers: new Headers({
        // We took care of validation above
        "Access-Control-Allow-Origin": "*",
        Vary: "origin",
      }),
    });
  }),
});

// To prevent CSRF (fishing) attacks,
// we need to make sure that only allowed
// origins can acquire a session ID.
// This is similar to Lucia's built-in CSRF protection,
// but allows configuring a different domain.
function validateAuthRequest(request: Request) {
  if (request.method === null) {
    throw new Error("AUTH_INVALID_REQUEST");
  }
  if (request.url === null) {
    throw new Error("AUTH_INVALID_REQUEST");
  }
  if (
    request.method.toUpperCase() !== "GET" &&
    request.method.toUpperCase() !== "HEAD"
  ) {
    const requestOrigin = request.headers.get("origin");
    if (!requestOrigin) {
      throw new Error("AUTH_INVALID_REQUEST");
    }
    try {
      if (!isAllowedUrl(requestOrigin)) {
        throw new Error("AUTH_INVALID_REQUEST");
      }
    } catch {
      // failed to parse url
      throw new Error("AUTH_INVALID_REQUEST");
    }
  }
}

export const isAllowedUrl = (requestOrigin: string) => {
  const incomingHostname = new URL(requestOrigin).hostname;
  return allowedHosts().includes(incomingHostname);
};

function allowedHosts() {
  const allowed = ["localhost"];
  if (process.env.HOSTNAME !== undefined && process.env.HOSTNAME !== "") {
    allowed.push(process.env.HOSTNAME);
  }
  return allowed;
}

export default http;
