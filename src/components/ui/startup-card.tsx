import { Show, For } from "solid-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { A } from "@solidjs/router";

interface Startup {
  id: string;
  name: string;
  description: string;
  websiteUrl: string | null;
  createdAt: Date;
  updatedAt?: Date;
  tags?: { id: number; name: string; }[];
  participants?: { id: string; name: string | null; username: string | null; }[];
  creatorId?: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

interface StartupCardProps {
  startups: Startup[];
  type: "created" | "participating";
  title?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export default function StartupCard(props: StartupCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTitle = () => {
    if (props.title) return props.title;
    return props.type === "created" 
      ? `Созданные стартапы (${props.startups.length})`
      : `Участвует в стартапах (${props.startups.length})`;
  };

  const getEmptyStateTitle = () => {
    if (props.emptyStateTitle) return props.emptyStateTitle;
    return props.type === "created" 
      ? "Пока нет созданных стартапов"
      : "Пока не участвует в стартапах";
  };

  const getEmptyStateDescription = () => {
    if (props.emptyStateDescription) return props.emptyStateDescription;
    return props.type === "created" 
      ? "Создайте свой первый стартап, чтобы он появился здесь"
      : "Присоединитесь к интересным проектам";
  };

  const getIconColor = () => {
    return props.type === "created" ? "bg-blue-500" : "bg-green-500";
  };

  const getIcon = () => {
    if (props.type === "created") {
      return (
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
        </svg>
      );
    } else {
      return (
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      );
    }
  };

  const getEmptyStateIcon = () => {
    if (props.type === "created") {
      return (
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      );
    } else {
      return (
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      );
    }
  };

  const renderCard = (startup: Startup) => {
    const cardClass = `border border-gray-200 rounded-lg p-4 transition-all bg-white ${
      props.type === "created" ? "hover:bg-gray-50" : "hover:bg-gray-50"
    }`;

    const cardContent = (
      <>
          <div class="flex justify-between items-start mb-3">
            <h3 class="font-semibold text-lg text-gray-900 line-clamp-1">{startup.name}</h3>
            <Show when={startup.websiteUrl}>
              <a
                href={startup.websiteUrl!}
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
          
          <p class="text-gray-600 text-sm mb-3 line-clamp-2">{startup.description}</p>
          
          <Show when={startup.tags && startup.tags.length > 0}>
            <div class="flex flex-wrap gap-1 mb-3">
              <For each={startup.tags!.slice(0, 3)}>
                {(tag) => (
                  <Badge variant="secondary" class="text-xs">{tag.name}</Badge>
                )}
              </For>
              <Show when={startup.tags!.length > 3}>
                <Badge variant="outline" class="text-xs">+{startup.tags!.length - 3}</Badge>
              </Show>
            </div>
          </Show>

          <div class="flex justify-between items-center text-xs text-gray-500">
            <span>Создан {formatDate(startup.createdAt)}</span>
            
            {/* For created startups, show participants count */}
            <Show when={props.type === "created" && startup.participants && startup.participants.length > 0}>
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <span>{startup.participants!.length}</span>
              </div>
            </Show>

            {/* For participating startups, show creator info */}
            <Show when={props.type === "participating" && startup.creatorId}>
              <div class="flex items-center gap-2">
                <Show
                  when={startup.creatorId!.image}
                  fallback={
                    <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {startup.creatorId!.name?.charAt(0) || startup.creatorId!.username?.charAt(0) || 'U'}
                    </div>
                  }
                >
                  <img
                    src={startup.creatorId!.image!}
                    alt="Creator"
                    class="w-6 h-6 rounded-full object-cover"
                  />
                </Show>
                <span class="text-xs text-gray-600">
                  {startup.creatorId!.name || startup.creatorId!.username}
                </span>
              </div>
            </Show>
          </div>
        </>
      );

    return (
      <A class={cardClass} href={`/startup/${startup.id}`}>
        {cardContent}
      </A>
    );
  };

  return (
    <Card class="w-full">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <div class={`w-6 h-6 ${getIconColor()} rounded-full flex items-center justify-center`}>
            {getIcon()}
          </div>
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Show 
          when={props.startups.length > 0} 
          fallback={
            <div class="text-center py-8 text-gray-500">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                {getEmptyStateIcon()}
              </div>
              <p class="text-lg font-medium">{getEmptyStateTitle()}</p>
              <p class="text-sm">{getEmptyStateDescription()}</p>
            </div>
          }
        >
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <For each={props.startups}>
              {(startup) => renderCard(startup)}
            </For>
          </div>
        </Show>
      </CardContent>
    </Card>
  );
}