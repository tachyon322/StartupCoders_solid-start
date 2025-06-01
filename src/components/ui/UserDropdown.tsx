import { authClient } from "~/lib/auth/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { A } from "@solidjs/router";

interface UserDropdownProps {
  session: any;
}

const handleSignOut = async () => {
  const response = await authClient.signOut().
  then(() => {
    window.location.href = "/login";
  });
  console.log(response);
};

export default function UserDropdown(props: UserDropdownProps) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-300 cursor-pointer">
          <img
            src={props.session?.user?.image || ""}
            alt="User"
            class="w-full h-full object-cover"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="bg-white border-0 shadow-lg rounded-lg">
        <DropdownMenuLabel>{props.session?.user?.name || "User"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="hover:bg-gray-100 cursor-pointer">
          <A href={`/profile/${props.session.user.username || props.session.user.id}`} class="w-full block">Профиль</A>
        </DropdownMenuItem>
        <DropdownMenuItem class="hover:bg-gray-100 cursor-pointer">
          <a href="/settings" class="w-full block">Настройки</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="hover:bg-gray-100 cursor-pointer text-red-500" onClick={handleSignOut}>
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
