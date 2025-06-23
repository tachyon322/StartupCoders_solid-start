import { createSignal, mergeProps, Show } from "solid-js";
import UserDropdown from "../ui/UserDropdown";
import { A } from "@solidjs/router";

type HeaderProps = {
  session: any;
}

export default function Header(props: HeaderProps) {
  const merged = mergeProps({ session: null }, props.session);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = createSignal(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header class="bg-indigo-950 text-white sticky top-0 z-40">
        <div class="container mx-auto px-4 max-w-6xl">
          <div class="flex items-center justify-between py-3 md:py-4 relative">
            {/* Logo */}
            <div class="flex items-center">
              <a
                href={merged.data ? "/find" : "/"}
                class="text-xl md:text-2xl font-bold flex items-baseline logo"
              >
                <span class="text-indigo-300">Startup</span>
                <span>Coders</span>
                <span class="text-indigo-300 text-xs md:text-sm ml-1">.ru</span>
              </a>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav class="hidden md:flex items-center space-x-6 lg:space-x-10 absolute left-1/2 transform -translate-x-1/2">
              <a
                href="/find"
                class="hover:text-indigo-300 transition-colors text-sm lg:text-base"
              >
                Найти
              </a>
              <a
                href="/donate"
                class="hover:text-indigo-300 transition-colors text-sm lg:text-base"
              >
                Помочь сайту
              </a>
              <a
                href="/about"
                class="hover:text-indigo-300 transition-colors text-sm lg:text-base"
              >
                О нас
              </a>
            </nav>

            {/* Desktop Auth/User */}
            <Show
              when={merged.data}
              fallback={
                <div class="hidden md:flex items-center space-x-4">
                  <A
                    class="text-indigo-300 hover:text-white py-2 text-left transition-colors text-sm lg:text-base"
                    href="/login"
                  >
                    Войти
                  </A>
                  <A
                    class="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-all text-sm lg:text-base"
                    href="/login"
                  >
                    Регистрация
                  </A>
                </div>
              }
            >
              <div class="items-center hidden md:flex">
                <UserDropdown session={merged.data} />
              </div>
            </Show>

            {/* Mobile Controls */}
            <div class="md:hidden flex items-center gap-2">
              <Show when={merged.data}>
                <UserDropdown session={merged.data} />
              </Show>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen())}
                class="text-white p-2 -mr-2 focus:outline-none focus:bg-indigo-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Show
                  when={isMenuOpen()}
                  fallback={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Show>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <Show when={isMenuOpen()}>
            <div class="md:hidden py-4 border-t border-indigo-800 absolute top-full left-0 right-0 bg-indigo-950 shadow-lg">
              <nav class="flex flex-col px-4">
                <a
                  href="/find"
                  class="py-3 px-2 hover:bg-indigo-800 hover:text-indigo-300 transition-colors rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Найти
                </a>
                <a
                  href="/donate"
                  class="py-3 px-2 hover:bg-indigo-800 hover:text-indigo-300 transition-colors rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Помочь сайту
                </a>
                <a
                  href="/about"
                  class="py-3 px-2 hover:bg-indigo-800 hover:text-indigo-300 transition-colors rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  О нас
                </a>
              </nav>

              {/* Mobile auth buttons for non-logged in users */}
              <Show when={!merged.data}>
                <div class="mt-4 px-4 pb-2 flex flex-col gap-2">
                  <A
                    class="text-indigo-300 hover:text-white py-3 px-4 text-center transition-colors border border-indigo-600 rounded-lg hover:bg-indigo-800"
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Войти
                  </A>
                  <A
                    class="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-lg transition-all text-center"
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Регистрация
                  </A>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </header>
    </>
  );
}
