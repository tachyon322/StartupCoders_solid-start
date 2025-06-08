import { JSX, createMemo, createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface StartupCardProps {
  id: string;
  name: string;
  description: string;
  images?: { id: string; url: string }[];
  tags?: { id: number; name: string }[];
  participants?: { id: string; name: string; username?: string | null; image?: string }[];
  createdAt?: Date | string;
  creatorId?: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

export default function StartupCard(props: StartupCardProps): JSX.Element {
  const [creatorImageError, setCreatorImageError] = createSignal(false);
  
  // Create truncated description
  const truncatedDescription = createMemo(() => {
    return props.description.length > 120
      ? `${props.description.substring(0, 120)}...`
      : props.description;
  });

  // Format creation time
  const timeAgo = () => {
    if (props.createdAt) {
      const date = typeof props.createdAt === "string" ? new Date(props.createdAt) : props.createdAt;
      return formatDistanceToNow(date, { addSuffix: true, locale: ru });
    }
    return null;
  };

  return (
    <A href={`/startup/${props.id}`} class="block h-full">
      <div class="bg-white rounded-xs overflow-hidden border border-gray-100 hover:bg-gray-50 transition-all duration-200 h-full flex flex-col">
        <div class="relative h-48 bg-gray-100">
          {props.images && props.images.length > 0 ? (
            <>
              <img
                src={props.images[0].url}
                alt={props.name}
                class="absolute inset-0 w-full h-full object-cover"
              />
              
              {props.images.length > 1 && (
                <div class="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                  +{props.images.length - 1}
                </div>
              )}
            </>
          ) : (
            <div class="flex items-center justify-center h-full bg-indigo-50 text-indigo-300">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-20 w-20" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="1.5" 
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
                />
              </svg>
            </div>
          )}
        </div>
        
        <div class="p-4 flex flex-col flex-grow">
          <div class="flex items-start justify-between">
            <h3 class="text-lg font-semibold text-indigo-950 truncate">
              {props.name}
            </h3>
          </div>
          
          <p class="mt-2 text-sm text-gray-600 line-clamp-3 flex-grow">
            {truncatedDescription()}
          </p>
          
          {props.tags && props.tags.length > 0 && (
            <div class="mt-3 flex flex-wrap gap-1">
              {props.tags.slice(0, 3).map(tag => (
                <span
                  class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                >
                  {tag.name}
                </span>
              ))}
              {props.tags.length > 3 && (
                <span class="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full">
                  +{props.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between">
              {props.creatorId && (
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 rounded-full bg-indigo-100 overflow-hidden">
                    {props.creatorId.image && !creatorImageError() ? (
                      <img
                        src={props.creatorId.image}
                        alt={props.creatorId.name || 'Creator'}
                        class="w-full h-full object-cover"
                        onError={() => setCreatorImageError(true)}
                      />
                    ) : (
                      <div class="flex items-center justify-center w-full h-full text-indigo-500 text-xs font-bold">
                        {props.creatorId.name ? props.creatorId.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">от</span>{" "}
                    <span class="font-medium text-indigo-600">
                      {props.creatorId.username || props.creatorId.id || 'Аноним'}
                    </span>
                  </div>
                </div>
              )}
              
              {props.participants && (
                <div class="flex items-center gap-1 text-sm text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>
                    {props.participants.length > 1
                      ? `${props.participants.length} участников`
                      : 'Ищет участников'}
                  </span>
                </div>
              )}
            </div>
            
            {timeAgo() && (
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                <span>Создан {timeAgo()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </A>
  );
}
