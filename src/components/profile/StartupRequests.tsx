import { Show, For } from "solid-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface StartupRequest {
  startupRequest: {
    id: number;
    message: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
    updatedAt: Date;
  };
}

interface StartupRequestsProps {
  requests: StartupRequest[];
}

export default function StartupRequests(props: StartupRequestsProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "pending":
        return { text: "В ожидании", variant: "outline" as const, class: "text-yellow-600 border-yellow-300" };
      case "approved":
        return { text: "Одобрено", variant: "default" as const, class: "bg-green-500 text-white" };
      case "rejected":
        return { text: "Отклонено", variant: "destructive" as const, class: "bg-red-500 text-white" };
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    if (diffInDays < 7) return `${diffInDays} дн. назад`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} нед. назад`;
    return `${Math.floor(diffInDays / 30)} мес. назад`;
  };

  return (
    <Card class="w-full">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <div class="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
          </div>
          Заявки на стартапы ({props.requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Show 
          when={props.requests.length > 0} 
          fallback={
            <div class="text-center py-8 text-gray-500">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
              <p class="text-lg font-medium">Нет заявок на стартапы</p>
              <p class="text-sm">Здесь будут отображаться ваши заявки на участие в стартапах</p>
            </div>
          }
        >
          <div class="space-y-4">
            <For each={props.requests}>
              {(request) => (
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-2">
                      <Badge variant="outline" class="text-xs">
                        Заявка #{request.startupRequest.id}
                      </Badge>
                      <Badge
                        variant={getStatusBadge(request.startupRequest.status).variant}
                        class={`text-xs ${getStatusBadge(request.startupRequest.status).class}`}
                      >
                        {getStatusBadge(request.startupRequest.status).text}
                      </Badge>
                    </div>
                  </div>
                  
                  <div class="bg-gray-50 rounded-lg p-3">
                    <h4 class="font-medium text-gray-900 mb-2">Сообщение:</h4>
                    <p class="text-gray-700 text-sm leading-relaxed">
                      {request.startupRequest.message}
                    </p>
                  </div>
                  
                  <Show when={request.startupRequest.updatedAt !== request.startupRequest.createdAt}>
                    <div class="mt-2 text-xs text-gray-500">
                      Обновлено: {formatDate(request.startupRequest.updatedAt)}
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </CardContent>
    </Card>
  );
}