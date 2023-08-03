import { useState } from "react";
import { useSetSessionId } from "./SessionProvider";

const API_URL = import.meta.env.VITE_CONVEX_URL.replace(/.cloud$/, ".site");

export function LoginForm() {
  const setSessionId = useSetSessionId();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `${API_URL}/${flow === "signIn" ? "signIn" : "signUp"}`,
        { body: new FormData(event.currentTarget), method: "POST" }
      );
      const sessionId = await response.text();
      setSessionId(sessionId);
    } catch {
      alert(
        flow === "signIn" ? "Invalid email or password" : "Email already in use"
      );
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Email</label>
      </div>
      <div>
        <input name="email" id="email" autoComplete="off" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
      </div>
      <div>
        <input type="password" name="password" id="password" />
      </div>
      {flow === "signIn" ? (
        <input type="submit" value="Sign in" />
      ) : (
        <input type="submit" value="Sign up" />
      )}
      <div>
        <a
          style={{ cursor: "pointer" }}
          onClick={() => {
            setFlow(flow === "signIn" ? "signUp" : "signIn");
          }}
        >
          {flow === "signIn" ? (
            <>Don't have an account? Sign up</>
          ) : (
            <>Already have an account? Sign in</>
          )}
        </a>
      </div>
    </form>
  );
}
