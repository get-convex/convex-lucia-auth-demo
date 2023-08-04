import { ConvexProvider, ConvexReactClient } from "convex/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SessionProvider } from "./SessionProvider";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SessionProvider>
      <ConvexProvider client={convex}>
        <App />
        <div>
          Built on{" "}
          <a href="https://convex.dev" target="_blank">
            Convex
          </a>
          , source on{" "}
          <a
            href="https://github.com/get-convex/convex-lucia-auth-demo"
            target="_blank"
          >
            Github
          </a>
        </div>
      </ConvexProvider>
    </SessionProvider>
  </React.StrictMode>
);
