import { useState } from "react";
import { useSetSessionId } from "./SessionProvider";
import { useMutation } from "./withAuth";
import { api } from "../convex/_generated/api";

export function LoginForm() {
  const setSessionId = useSetSessionId();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const signIn = useMutation(api.users.signIn);
  const signUp = useMutation(api.users.signUp);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const sessionId = await (flow === "signIn" ? signIn : signUp)({
        email: (data.get("email") as string | null) ?? "",
        password: (data.get("password") as string | null) ?? "",
      });
      setSessionId(sessionId);
    } catch {
      alert(
        flow === "signIn" ? "Invalid email or password" : "Email already in use"
      );
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Email</label>
      <input name="email" id="email" />
      <label htmlFor="password">Password</label>
      <input type="password" name="password" id="password" />
      {flow === "signIn" ? (
        <input type="submit" value="Sign in" />
      ) : (
        <input type="submit" value="Sign up" />
      )}
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
    </form>
  );
}
