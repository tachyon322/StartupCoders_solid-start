import { Title } from "@solidjs/meta";
import { authClient } from "~/lib/auth-client";
import { getRequestEvent } from "solid-js/web";
import { createResource } from "solid-js";
import Header from "~/components/landing/Header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

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
        headers: event?.request.headers,
      },
    });
  });

  return (
    <main>
      <DropdownMenu >
        <DropdownMenuTrigger>
          <div class="w-10 h-10 ml-10 ">
            <img src={sessionData()?.data?.user.image || ""} alt="user image" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="bg-white border-0">
          <DropdownMenuLabel>{sessionData()?.data?.user.name || "user"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="hover:bg-gray-300">Profile</DropdownMenuItem>
          <DropdownMenuItem class="hover:bg-gray-300">Billing</DropdownMenuItem>
          <DropdownMenuItem class="hover:bg-gray-300">Team</DropdownMenuItem>
          <DropdownMenuItem class="hover:bg-gray-300">Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Header session={sessionData()} />
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
