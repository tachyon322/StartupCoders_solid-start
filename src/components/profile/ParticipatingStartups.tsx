import { Show, For } from "solid-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface ParticipatingStartup {
  startup: {
    id: string;
    name: string;
    description: string;
    websiteUrl: string | null;
    createdAt: Date;
    creatorUser: string;
    tags?: { id: number; name: string; }[];
    creatorId?: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
    };
  };
}

interface ParticipatingStartupsProps {
  participatingStartups: ParticipatingStartup[];
}

export default function ParticipatingStartups(props: ParticipatingStartupsProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card class="w-full">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          Участвует в стартапах ({props.participatingStartups.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Show 
          when={props.participatingStartups.length > 0} 
          fallback={
            <div class="text-center py-8 text-gray-500">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <p class="text-lg font-medium">Пока не участвует в стартапах</p>
              <p class="text-sm">Присоединитесь к интересным проектам</p>
            </div>
          }
        >
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <For each={props.participatingStartups}>
              {(item) => (
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div class="flex justify-between items-start mb-3">
                    <h3 class="font-semibold text-lg text-gray-900 line-clamp-1">{item.startup.name}</h3>
                    <Show when={item.startup.websiteUrl}>
                      <a 
                        href={item.startup.websiteUrl!} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    </Show>
                  </div>
                  
                  <p class="text-gray-600 text-sm mb-3 line-clamp-2">{item.startup.description}</p>
                  
                  <Show when={item.startup.tags && item.startup.tags.length > 0}>
                    <div class="flex flex-wrap gap-1 mb-3">
                      <For each={item.startup.tags!.slice(0, 3)}>
                        {(tag) => (
                          <Badge variant="secondary" class="text-xs">{tag.name}</Badge>
                        )}
                      </For>
                      <Show when={item.startup.tags!.length > 3}>
                        <Badge variant="outline" class="text-xs">+{item.startup.tags!.length - 3}</Badge>
                      </Show>
                    </div>
                  </Show>

                  <div class="flex justify-between items-center">
                    <div class="text-xs text-gray-500">
                      Создан {formatDate(item.startup.createdAt)}
                    </div>
                    <Show when={item.startup.creatorId}>
                      <div class="flex items-center gap-2">
                        <Show 
                          when={item.startup.creatorId!.image} 
                          fallback={
                            <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                              {item.startup.creatorId!.name?.charAt(0) || item.startup.creatorId!.username?.charAt(0) || 'U'}
                            </div>
                          }
                        >
                          <img 
                            src={item.startup.creatorId!.image!} 
                            alt="Creator" 
                            class="w-6 h-6 rounded-full object-cover"
                          />
                        </Show>
                        <span class="text-xs text-gray-600">
                          {item.startup.creatorId!.name || item.startup.creatorId!.username}
                        </span>
                      </div>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </CardContent>
    </Card>
  );
}