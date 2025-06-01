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
      <header class="bg-indigo-950 text-white">
        <div class="container mx-auto px-4 max-w-6xl">
          <div class="flex items-center justify-between py-4 relative">
            <div class="flex items-center">
              <a
                href={merged.data ? "/find" : "/"}
                class="text-2xl font-bold flex items-baseline logo"
              >
                <span class="text-indigo-300">Startup</span>
                <span>Coders</span>
                <span class="text-indigo-300 text-sm ml-1">.ru</span>
              </a>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav class="hidden md:flex items-center space-x-10 absolute left-1/2 transform -translate-x-1/2">
              <a
                href="/find"
                class="hover:text-indigo-300 transition-colors"
              >
                Найти
              </a>
              <a
                href="/donate"
                class="hover:text-indigo-300 transition-colors"
              >
                Помочь сайту
              </a>
              <a
                href="/about"
                class="hover:text-indigo-300 transition-colors"
              >
                О нас
              </a>
            </nav>

            <Show
              when={merged.data}
              fallback={
                <div class="hidden md:flex items-center space-x-4">
                  <A
                    class="text-indigo-300 hover:text-white py-2 w-full text-left transition-colors"
                    href="/login"
                  >
                    Войти
                  </A>
                  <A
                    class="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-all"
                    href="/login"
                  >
                    Регистрация
                  </A>
                </div>
              }
            >
              <div class="items-center hidden md:flex">
                <UserDropdown session={merged.data} />
                {/* {JSON.stringify(merged.data)} */}
              </div>
            </Show>

            {/* Mobile Menu Button */}
            <div class="md:hidden flex gap-3">
              <Show
                when={merged.data}
                fallback={
                  <div class="flex items-center space-x-4">
                    <A
                      class="text-indigo-300 hover:text-white py-2 text-left transition-colors"
                      href="/login"
                    >
                      Войти
                    </A>
                    <A
                      class="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-all"
                      href="/login"
                    >
                      Регистрация
                    </A>
                  </div>
                }
              >
                <div class="flex items-center">
                  <UserDropdown session={merged.session} />
                </div>
              </Show>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen())}
                class="text-white"
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
            <div class="md:hidden py-4 border-t border-indigo-800">
              <nav class="flex flex-col space-y-4">
                <a
                  href="/find"
                  class="hover:text-indigo-300 transition-colors"
                >
                  Найти
                </a>
                <a
                  href="/donate"
                  class="hover:text-indigo-300 transition-colors"
                >
                  Помочь сайту
                </a>
                <a
                  href="/about"
                  class="hover:text-indigo-300 transition-colors"
                >
                  О нас
                </a>
              </nav>

              {/* Mobile user/auth elements */}
              <div class="mt-6 flex flex-col space-y-2">
                <Show
                  when={merged.data}
                  fallback={
                    <div>
                      <button
                        class="text-indigo-300 hover:text-white py-2 w-full text-left transition-colors"
                        onClick={openLoginModal}
                      >
                        Войти
                      </button>
                      <button
                        class="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-all"
                        onClick={openLoginModal}
                      >
                        Регистрация
                      </button>
                    </div>
                  }
                >
                  <div class="flex items-center"></div>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </header>
    </>
  );
}
