import { Show } from "solid-js";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface ProfileHeaderProps {
  user: any; // Using any for now since the user structure is complex
}

export default function ProfileHeader(props: ProfileHeaderProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card class="w-full mb-6">
      <CardContent class="p-8">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Image */}
          <div class="flex-shrink-0">
            <Show 
              when={props.user.image} 
              fallback={
                <div class="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                  {props.user.name?.charAt(0)?.toUpperCase() || props.user.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              }
            >
              <img 
                src={props.user.image!} 
                alt="Profile" 
                class="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </Show>
          </div>

          {/* Profile Info */}
          <div class="flex-1 min-w-0">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {props.user.name || props.user.username || 'Пользователь'}
                </h1>
                <Show when={props.user.username && props.user.name !== props.user.username}>
                  <p class="text-lg text-gray-600 mb-2">@{props.user.username}</p>
                </Show>
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-gray-600">{props.user.email}</span>
                  <Show when={props.user.emailVerified}>
                    <Badge variant="secondary" class="bg-green-100 text-green-800 border-green-200">
                      ✓ Подтвержден
                    </Badge>
                  </Show>
                </div>
              </div>
              
              <div class="text-right">
                <p class="text-sm text-gray-500">Участник с</p>
                <p class="text-lg font-semibold text-gray-700">{formatDate(props.user.createdAt)}</p>
              </div>
            </div>

            <Show when={props.user.description}>
              <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">О себе</h3>
                <p class="text-gray-700 leading-relaxed">{props.user.description}</p>
              </div>
            </Show>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}