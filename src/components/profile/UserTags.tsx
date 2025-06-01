import { Show, For } from "solid-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface UserTag {
  tag: {
    id: number;
    name: string;
  };
}

interface UserTagsProps {
  tags: UserTag[];
}

export default function UserTags(props: UserTagsProps) {
  return (
    <Card class="w-full">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
          </div>
          Теги и навыки ({props.tags.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Show 
          when={props.tags.length > 0} 
          fallback={
            <div class="text-center py-8 text-gray-500">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-lg font-medium">Теги не добавлены</p>
              <p class="text-sm">Добавьте теги, чтобы показать свои навыки и интересы</p>
            </div>
          }
        >
          <div class="flex flex-wrap gap-2">
            <For each={props.tags}>
              {(userTag) => (
                <Badge 
                  variant="secondary" 
                  class="text-sm px-3 py-1 bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors"
                >
                  {userTag.tag.name}
                </Badge>
              )}
            </For>
          </div>
        </Show>
      </CardContent>
    </Card>
  );
}