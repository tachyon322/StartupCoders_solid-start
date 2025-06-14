import { authClient } from "~/lib/auth/auth-client";
import { createSignal, Show, onCleanup, createEffect, onMount } from "solid-js";
import { A } from "@solidjs/router";
import { isServer } from "solid-js/web";

interface UserDropdownProps {
  session: any;
}

export default function UserDropdown(props: UserDropdownProps) {
  const [imageError, setImageError] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      if (!isServer) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen());
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      closeDropdown();
    }
  };

  // Only run client-side effects in the browser
  onMount(() => {
    // Watch for isOpen changes and manage event listeners
    createEffect(() => {
      if (isOpen()) {
        // Add a small delay to prevent immediate closing
        setTimeout(() => {
          document.addEventListener('click', handleClickOutside);
        }, 10);
      } else {
        document.removeEventListener('click', handleClickOutside);
      }
    });
  });

  // Cleanup on unmount (only runs client-side)
  onCleanup(() => {
    if (!isServer) {
      document.removeEventListener('click', handleClickOutside);
    }
  });

  return (
    <div class="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        class="focus:outline-none touch-manipulation p-0 bg-transparent border-none"
        type="button"
        aria-expanded={isOpen()}
        aria-haspopup="true"
      >
        <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-300 cursor-pointer hover:border-indigo-400 transition-colors">
          <Show
            when={props.session?.user?.image && !imageError()}
            fallback={
              <div class="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold select-none">
                {props.session?.user?.name?.[0]?.toUpperCase() || props.session?.user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            }
          >
            <img
              src={props.session.user.image}
              alt="User"
              class="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </Show>
        </div>
      </button>

      <Show when={isOpen()}>
        <div class="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div class="px-4 py-3 border-b border-gray-200">
            <p class="text-sm font-semibold text-gray-700">
              {props.session?.user?.name || "User"}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {props.session?.user?.email}
            </p>
          </div>
          
          <div class="py-1">
            <A
              href={`/profile/${props.session.user.username || props.session.user.id}`}
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={closeDropdown}
            >
              Профиль
            </A>
            <A
              href="/requests"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={closeDropdown}
            >
              Заявки
            </A>
          </div>
          
          <div class="border-t border-gray-200">
            <button
              onClick={handleSignOut}
              class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
