import { Show, For } from "solid-js";
import StartupCard from "./StartupCard";
import StartupSkeleton from "./StartupSkeleton";

interface StartupListProps {
  startupsResource: any; // Resource returned from createResource
  mounted: boolean;
}

export default function StartupList(props: StartupListProps) {
  return (
    <Show
      when={props.mounted && !props.startupsResource.loading}
      fallback={
        <Show when={props.mounted} fallback={<div class="h-64"></div>}>
          <StartupSkeleton />
        </Show>
      }
    >
      <Show
        when={props.startupsResource()?.startups?.length > 0}
        fallback={<p>Стартапов не найдено.</p>}
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={props.startupsResource()?.startups || []}>
            {(startup) => <StartupCard {...startup} />}
          </For>
        </div>
      </Show>
    </Show>
  );
}