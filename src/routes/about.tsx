import { Title } from "@solidjs/meta";
import { authClient } from "~/lib/auth-client";
import { getRequestEvent } from "solid-js/web";
import { createResource } from "solid-js";

const handleSignIn = async () => {
  const response = await authClient.signIn.social({ provider: "github" });
  console.log(response);
};

const handleSignOut = async () => {
  const response = await authClient.signOut();
  console.log(response);
};

export default function About() {
  const event = getRequestEvent();
  
  const [sessionData] = createResource(async () => {
    return await authClient.getSession({
      fetchOptions: {
        headers: event?.request.headers
      }
    });
  });

  return (
    <main>
      <Title>About</Title>
      <button
        class="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => handleSignIn()}
      >
        Sign in with Github
      </button>
      <p>Session: {JSON.stringify(sessionData()?.data)}</p>
      <p>Error: {JSON.stringify(sessionData()?.error)}</p>

      <button
        class="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => handleSignOut()}
      >
        Sign out
      </button>
    </main>
  );
}
