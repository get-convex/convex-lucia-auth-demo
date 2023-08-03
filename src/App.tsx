import { api } from "../convex/_generated/api";
import "./App.css";
import { LoginForm } from "./LoginForm";
import { LogoutButton } from "./LogoutButton";
import { useQuery } from "./withAuth";

function App() {
  const user = useQuery(api.users.get, {});

  return (
    <main>
      <h1>Convex Lucia Auth Example</h1>
      {user === undefined ? (
        <div>Loading...</div>
      ) : user == null ? (
        <LoginForm />
      ) : (
        <div>
          <h2>Welcome {user.email}</h2>
          <LogoutButton />
        </div>
      )}
    </main>
  );
}

export default App;
