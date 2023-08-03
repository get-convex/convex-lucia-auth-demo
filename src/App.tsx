import { api } from "../convex/_generated/api";
import "./App.css";
import { useMutation, useQuery } from "./convex";
import { useSetSessionId } from "./SessionProvider";

function App() {
  const setSessionId = useSetSessionId();
  const user = useQuery(api.data.user, {});
  const signIn = useMutation(api.data.signIn);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const sessionId = await signIn({
      email: data.get("email") as string,
      password: data.get("password") as string,
    });
    setSessionId(sessionId);
  };
  return user === undefined ? (
    <div></div>
  ) : user == null ? (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Email</label>
      <input name="email" id="email" autoComplete="off" />
      <br />
      <label htmlFor="password">Password</label>
      <input type="password" name="password" id="password" />
      <br />
      <input type="submit" value="Sign up or sign in" />
    </form>
  ) : (
    <div>
      <h1>Welcome {user.email}</h1>
      <button
        onClick={() => {
          setSessionId(null);
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default App;
