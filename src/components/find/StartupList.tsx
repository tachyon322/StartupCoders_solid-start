import { Show, For } from "solid-js";
import StartupCard from "./StartupCard";
import StartupSkeleton from "./StartupSkeleton";

interface StartupListProps {
  startupsResource: any; // Resource returned from createResource
}

export default function StartupList(props: StartupListProps) {
  return (
    <Show
      when={!props.startupsResource.loading && props.startupsResource()}
      fallback={<StartupSkeleton />}
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