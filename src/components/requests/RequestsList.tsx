import { JSX, For, Show, createSignal, createResource, onMount } from "solid-js";
import RequestCard from "./RequestCard";
import { getUserRequests, acceptRequest, rejectRequest } from "~/data/startup";

interface RequestsListProps {
  class?: string;
}

export default function RequestsList(props: RequestsListProps): JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = createSignal(0);
  const [isMounted, setIsMounted] = createSignal(false);
  
  onMount(() => {
    setIsMounted(true);
  });
  
  const [requests] = createResource(
    () => isMounted() && refreshTrigger(),
    async () => {
      if (!isMounted()) return { outgoing: [], incoming: [] };
      try {
        return await getUserRequests();
      } catch (error) {
        console.error("Error fetching requests:", error);
        return { outgoing: [], incoming: [] };
      }
    }
  );

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      // Refresh the requests list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error accepting request:", error);
      // You could add toast notification here
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
      // Refresh the requests list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error rejecting request:", error);
      // You could add toast notification here
    }
  };

  return (
    <div class={`space-y-8 ${props.class || ''}`}>
      {/* Initial loading state */}
      <Show when={!isMounted()}>
        <div class="flex justify-center py-12">
          <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-48 mb-4"></div>
            <div class="h-32 bg-gray-200 rounded mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-48 mb-4"></div>
            <div class="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Show>

      <Show when={isMounted()}>
        {/* Loading state */}
        <Show when={requests.loading}>
          <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </Show>

        {/* Error state */}
        <Show when={requests.error}>
          <div class="text-center py-12">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-red-800 mb-2">Ошибка загрузки</h3>
              <p class="text-red-600">Не удалось загрузить запросы. Попробуйте обновить страницу.</p>
            </div>
          </div>
        </Show>

        {/* Content */}
        <Show when={requests() && !requests.loading}>
        <div class="space-y-8">
          {/* Incoming Requests */}
          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-indigo-950">
                Входящие запросы
              </h2>
              <Show when={requests()?.incoming && requests()!.incoming.length > 0}>
                <span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {requests()!.incoming.length}
                </span>
              </Show>
            </div>

            <Show 
              when={requests()?.incoming && requests()!.incoming.length > 0}
              fallback={
                <div class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <div class="text-gray-400 mb-2">
                    <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H1" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 mb-1">Нет входящих запросов</h3>
                  <p class="text-gray-500">Когда кто-то захочет присоединиться к вашим стартапам, запросы появятся здесь.</p>
                </div>
              }
            >
              <div class="grid gap-4">
                <For each={requests()!.incoming}>
                  {(request) => (
                    <Show when={request}>
                      <RequestCard
                        id={request!.id.toString()}
                        message={request!.message}
                        createdAt={request!.createdAt}
                        startup={request!.startup}
                        requestBy={request!.requestBy}
                        type="incoming"
                        onAccept={handleAcceptRequest}
                        onReject={handleRejectRequest}
                      />
                    </Show>
                  )}
                </For>
              </div>
            </Show>
          </section>

          {/* Outgoing Requests */}
          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-indigo-950">
                Исходящие запросы
              </h2>
              <Show when={requests()?.outgoing && requests()!.outgoing.length > 0}>
                <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {requests()!.outgoing.length}
                </span>
              </Show>
            </div>

            <Show 
              when={requests()?.outgoing && requests()!.outgoing.length > 0}
              fallback={
                <div class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <div class="text-gray-400 mb-2">
                    <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 mb-1">Нет исходящих запросов</h3>
                  <p class="text-gray-500">
                    Вы еще не отправляли запросы на участие в стартапах. 
                    <a href="/find" class="text-indigo-600 hover:text-indigo-800 ml-1">Найти стартапы</a>
                  </p>
                </div>
              }
            >
              <div class="grid gap-4">
                <For each={requests()!.outgoing}>
                  {(request) => (
                    <Show when={request}>
                      <RequestCard
                        id={request!.id.toString()}
                        message={request!.message}
                        createdAt={request!.createdAt}
                        status={request!.status}
                        startup={request!.startup}
                        type="outgoing"
                      />
                    </Show>
                  )}
                </For>
              </div>
            </Show>
          </section>
        </div>
        </Show>
      </Show>
    </div>
  );
}