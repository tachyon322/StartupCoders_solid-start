import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "@fontsource/inter"
import "./app.css";
import { SessionProvider } from "./lib/auth/session-context";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>StartupCoders</Title>
          <SessionProvider>
            <Suspense>{props.children}</Suspense>
          </SessionProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
