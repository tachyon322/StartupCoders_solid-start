import { createContext, useContext, createResource, JSX } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { authClient } from "./auth-client";

// Create the session context
const SessionContext = createContext<any>();

// Create the session provider component
export function SessionProvider(props: { children: JSX.Element }) {
  const event = getRequestEvent();

  // Create a resource to fetch the session data
  const [sessionData] = createResource(async () => {
    return await authClient.getSession({
      fetchOptions: {
        headers: event?.request.headers,
      },
    });
  });

  return (
    <SessionContext.Provider value={sessionData}>
      {props.children}
    </SessionContext.Provider>
  );
}

// Create a hook to use the session data
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}