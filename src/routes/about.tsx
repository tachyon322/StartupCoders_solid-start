import { Title } from "@solidjs/meta";
import { authClient } from "~/lib/auth-client";

const handleSignIn = async () => {
  try {
    await authClient.signIn.social({ provider: "github" });
  } catch (error) {
    console.error("Error signing in with GitHub:", error);
  }
};

export default function About() {
  return (
    <main>
      <Title>About</Title>
      <button
        onClick={handleSignIn}
        class="bg-blue-500 text-white p-2 rounded-md"
      >
        Sign in with Github
      </button>
    </main>
  );
}
