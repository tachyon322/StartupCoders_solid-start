import { JSX, createSignal, createMemo } from "solid-js";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface RequestCardProps {
  id: string;
  message: string;
  createdAt: Date | string;
  status?: "pending" | "approved" | "rejected";
  startup: {
    id: string;
    name: string;
    tags?: { id: number; name: string }[];
    images?: { id: string; url: string }[];
    creatorId?: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
    };
  };
  requestBy?: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  }[];
  type: "outgoing" | "incoming";
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  isProcessing?: boolean;
}

export default function RequestCard(props: RequestCardProps): JSX.Element {
  const [isLoading, setIsLoading] = createSignal(false);

  // Format creation time
  const timeAgo = createMemo(() => {
    if (!props.createdAt) return null;
    
    try {
      let date: Date;
      
      if (typeof props.createdAt === 'string') {
        if (!props.createdAt.includes('Z') && !props.createdAt.includes('+') && !props.createdAt.includes('-', 10)) {
          date = new Date(props.createdAt + 'Z');
        } else {
          date = new Date(props.createdAt);
        }
      } else {
        date = props.createdAt;
      }
      
      if (isNaN(date.getTime())) return null;
      
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: ru
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  });

  const handleAccept = async () => {
    if (!props.onAccept) return;
    setIsLoading(true);
    try {
      await props.onAccept(props.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!props.onReject) return;
    setIsLoading(true);
    try {
      await props.onReject(props.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card class="hover:shadow-md transition-shadow">
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <CardTitle class="text-lg text-indigo-950">
              {props.startup.name}
            </CardTitle>
            <div class="flex items-center gap-2 mt-2">
              <span class={`px-2 py-1 text-xs rounded-full ${
                props.type === 'outgoing'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {props.type === 'outgoing' ? 'Исходящий запрос' : 'Входящий запрос'}
              </span>
              {props.status && (
                <span class={`px-2 py-1 text-xs rounded-full ${
                  props.status === 'pending'
                    ? 'bg-yellow-50 text-yellow-700'
                    : props.status === 'approved'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {props.status === 'pending' ? 'Ожидает' :
                   props.status === 'approved' ? 'Принят' : 'Отклонен'}
                </span>
              )}
              {timeAgo() && (
                <span class="text-xs text-gray-500">
                  {timeAgo()}
                </span>
              )}
            </div>
          </div>
          
          {props.startup.images && props.startup.images.length > 0 && (
            <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 ml-4">
              <img
                src={props.startup.images[0].url}
                alt={props.startup.name}
                class="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent class="space-y-4">
        {/* Message */}
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-sm text-gray-700">
            "{props.message}"
          </p>
        </div>

        {/* Tags */}
        {props.startup.tags && props.startup.tags.length > 0 && (
          <div class="flex flex-wrap gap-1">
            {props.startup.tags.slice(0, 4).map(tag => (
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                {tag.name}
              </span>
            ))}
            {props.startup.tags.length > 4 && (
              <span class="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full">
                +{props.startup.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Request info */}
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            {props.type === 'outgoing' && props.startup.creatorId && (
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden">
                  {props.startup.creatorId.image ? (
                    <img
                      src={props.startup.creatorId.image}
                      alt={props.startup.creatorId.name || 'Creator'}
                      class="w-full h-full object-cover"
                    />
                  ) : (
                    <div class="flex items-center justify-center w-full h-full text-indigo-500 text-sm font-bold">
                      {props.startup.creatorId.name ? props.startup.creatorId.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div class="text-sm">
                  <span class="text-gray-500">Создатель:</span>{" "}
                  <span class="font-medium text-indigo-600">
                    {props.startup.creatorId.username || props.startup.creatorId.name || 'Аноним'}
                  </span>
                </div>
              </div>
            )}

            {props.type === 'incoming' && props.requestBy && props.requestBy.length > 0 && (
              <div class="flex items-center space-x-2">
                <div class="flex -space-x-2">
                  {props.requestBy.slice(0, 3).map(user => (
                    <div class="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden border-2 border-white">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          class="w-full h-full object-cover"
                        />
                      ) : (
                        <div class="flex items-center justify-center w-full h-full text-indigo-500 text-sm font-bold">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div class="text-sm">
                  <span class="text-gray-500">От:</span>{" "}
                  <span class="font-medium text-indigo-600">
                    {props.requestBy[0].username || props.requestBy[0].name || 'Аноним'}
                    {props.requestBy.length > 1 && ` и еще ${props.requestBy.length - 1}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons for incoming requests */}
          {props.type === 'incoming' && (
            <div class="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={isLoading()}
                class="text-red-600 border-red-200 hover:bg-red-50"
              >
                Отклонить
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAccept}
                disabled={isLoading()}
                class="bg-green-500 hover:bg-green-600"
              >
                Принять
              </Button>
            </div>
          )}
        </div>

        {/* Link to startup */}
        <div class="pt-2 border-t border-gray-100">
          <a
            href={`/startup/${props.startup.id}`}
            class="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Перейти к стартапу →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}