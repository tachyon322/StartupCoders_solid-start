import { Show, createSignal, For, createResource } from "solid-js";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { TagInput, Tag } from "~/components/ui/tag-input";
import { getAllTags } from "~/data/user";

// Function to fetch all available tags from the server
async function fetchTags() {
  "use server";
  const tags = await getAllTags();
  return tags;
}

interface EditableProfileHeaderProps {
  user: any;
  isOwner: boolean; // Whether the current user can edit this profile
  onSave: (data: { name?: string; username?: string; description?: string; tags?: Tag[] }) => Promise<void>;
}

export default function EditableProfileHeader(props: EditableProfileHeaderProps) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [editName, setEditName] = createSignal(props.user.name || "");
  const [editUsername, setEditUsername] = createSignal(props.user.username || "");
  const [editDescription, setEditDescription] = createSignal(props.user.description || "");
  const [editTags, setEditTags] = createSignal<Tag[]>(props.user.tags || []);
  const [isSaving, setIsSaving] = createSignal(false);

  // Create a resource to fetch tags data from the server
  const [allTags] = createResource(fetchTags);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await props.onSave({
        name: editName(),
        username: editUsername(),
        description: editDescription(),
        tags: editTags()
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(props.user.name || "");
    setEditUsername(props.user.username || "");
    setEditDescription(props.user.description || "");
    setEditTags(props.user.tags || []);
    setIsEditing(false);
  };

  return (
    <Card class="w-full">
      <CardHeader class="pb-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Профиль пользователя</h2>
          <Show when={props.isOwner}>
            <Show when={!isEditing()}>
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Редактировать
              </Button>
            </Show>
          </Show>
        </div>
      </CardHeader>
      
      <CardContent class="space-y-6">
        {/* Profile Image and Basic Info */}
        <div class="flex flex-col sm:flex-row items-start gap-6">
          {/* Profile Image */}
          <div class="flex-shrink-0">
            <Show 
              when={props.user.image} 
              fallback={
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                  {props.user.name?.charAt(0)?.toUpperCase() || props.user.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              }
            >
              <img 
                src={props.user.image!} 
                alt="Profile" 
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-white shadow-lg"
              />
            </Show>
          </div>

          {/* Basic Info */}
          <div class="flex-1 min-w-0 space-y-3">
            {/* Name and Username */}
            <div class="space-y-2">
              <Show when={!isEditing()}>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
                  {props.user.name || props.user.username || 'Пользователь'}
                </h1>
                <Show when={props.user.username && props.user.name !== props.user.username}>
                  <p class="text-lg text-gray-600">@{props.user.username}</p>
                </Show>
              </Show>
              
              <Show when={isEditing()}>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                    <Input
                      value={editName()}
                      onInput={(e) => setEditName(e.currentTarget.value)}
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                      <Input
                        value={editUsername()}
                        onInput={(e) => setEditUsername(e.currentTarget.value)}
                        placeholder="username"
                        class="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <p class="text-xs text-gray-500">
                  Имя пользователя должно быть уникальным и может содержать только буквы, цифры и подчеркивания
                </p>
              </Show>
            </div>

            {/* Email */}
            <div class="flex items-center gap-3">
              <span class="text-gray-600">{props.user.email}</span>
            </div>

            {/* Join Date */}
            <div class="text-sm text-gray-500">
              Участник с {formatDate(props.user.createdAt)}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div class="space-y-3">
          <h3 class="text-lg font-semibold text-gray-900">О себе</h3>
          <Show when={!isEditing()}>
            <Show 
              when={props.user.description} 
              fallback={
                <p class="text-gray-500 italic">Описание не добавлено</p>
              }
            >
              <div class="p-4 bg-gray-100 rounded-lg">
                <p class="text-gray-700 leading-relaxed">{props.user.description}</p>
              </div>
            </Show>
          </Show>
          
          <Show when={isEditing()}>
            <Textarea
              value={editDescription()}
              onInput={(e) => setEditDescription(e.currentTarget.value)}
              placeholder="Расскажите о себе..."
              rows={4}
              class="resize-none"
            />
          </Show>
        </div>

        {/* Tags Section */}
        <div class="space-y-3">
          <h3 class="text-lg font-semibold text-gray-900">Навыки и теги</h3>
          <Show when={!isEditing()}>
            <Show 
              when={props.user.tags && props.user.tags.length > 0} 
              fallback={
                <p class="text-gray-500 italic">Теги не добавлены</p>
              }
            >
              <div class="flex flex-wrap gap-2">
                <For each={props.user.tags}>
                  {(tag) => (
                    <Badge variant="secondary" class="bg-purple-100 text-purple-800 border-purple-200">
                      {tag.name}
                    </Badge>
                  )}
                </For>
              </div>
            </Show>
          </Show>

          <Show when={isEditing()}>
            <Show
              when={!allTags.error}
              fallback={
                <div class="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                  Ошибка при загрузке тегов. Попробуйте перезагрузить страницу.
                </div>
              }
            >
              <TagInput
                existingTags={allTags() || []}
                selectedTags={editTags()}
                onChange={setEditTags}
                disabled={allTags.loading}
                placeholder={allTags.loading ? "Загрузка тегов..." : "Введите теги..."}
              />
            </Show>
            <p class="text-sm text-gray-500">
              Добавьте теги навыков и технологий, чтобы другие пользователи могли найти вас
            </p>
          </Show>
        </div>

        {/* Action Buttons */}
        <Show when={props.isOwner && isEditing()}>
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <Button 
              onClick={handleSave} 
              disabled={isSaving()}
              variant={"secondary"}
            >
              <Show when={isSaving()}>
                <div class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </Show>
              {isSaving() ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            <Button onClick={handleCancel} variant="default">
              Отмена
            </Button>
          </div>
        </Show>
      </CardContent>
    </Card>
  );
}