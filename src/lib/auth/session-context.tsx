import { getRequestEvent } from "solid-js/web";
import { auth } from "./auth";

export async function useSession() {
  "use server";
  
  const event = getRequestEvent();
  if (!event) return null;
  
  try {
    const session = await auth.api.getSession({
      headers: event.request.headers
    });
    
    return session;
  } catch (error) {
    console.error("Server session error:", error);
    return null;
  }
}