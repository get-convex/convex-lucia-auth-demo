import "./App.css";
import { useSetSessionId } from "./SessionProvider";

export function LogoutButton() {
  const setSessionId = useSetSessionId();
  return <button onClick={() => setSessionId(null)}>Logout</button>;
}
