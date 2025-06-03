import { Title } from "@solidjs/meta";
import Header from "~/components/landing/Header";
import { useSession } from "~/lib/auth/session-context";
import RequestsList from "~/components/requests/RequestsList";
import { Show } from "solid-js";

export const meta = () => {
  return {
    title: "Мои запросы - Startup Coders",
    description: "Управление запросами на участие в стартапах",
  };
};

export default function Requests() {
  const session = useSession();

  return (
    <>
      <Title>Мои запросы - Startup Coders</Title>
      <div class="min-h-screen bg-gray-50">
        <Header session={session} />
        
        <main class="container mx-auto px-4 py-8 max-w-6xl">
          <Show
            when={session()?.data}
            fallback={
              <div class="text-center py-12">
                <div class="bg-white rounded-lg shadow-sm border p-8">
                  <h1 class="text-2xl font-bold text-indigo-950 mb-4">
                    Войдите в систему
                  </h1>
                  <p class="text-gray-600 mb-6">
                    Для просмотра запросов необходимо войти в систему
                  </p>
                  <p>{JSON.stringify(session()?.data)}</p>
                  <a
                    href="/login"
                    class="inline-flex items-center px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Войти
                  </a>
                </div>
              </div>
            }
          >
            <div class="space-y-6">
              {/* Page Header */}
              <div class="bg-white rounded-lg shadow-sm border p-6">
                <h1 class="text-3xl font-bold text-indigo-950 mb-2">
                  Мои запросы
                </h1>
                <p class="text-gray-600">
                  Управляйте запросами на участие в стартапах. Здесь вы можете видеть запросы, которые отправили вы, и запросы, которые получили ваши стартапы.
                </p>
              </div>

              {/* Requests List */}
              <RequestsList />
            </div>
          </Show>
        </main>
      </div>
    </>
  );
}
