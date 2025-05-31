import { Match, Show, Switch } from "solid-js";
import StartupCard from "./StartupCard";

interface StartupListProps {
  startupsResource: any; // Resource returned from createResource
}

export default function StartupList(props: StartupListProps) {
  return (
    <Show
      when={props.startupsResource.state === "ready"}
      fallback={<p>Загрузка...</p>}
    >
      <Switch>
        <Match when={Array.isArray(props.startupsResource()?.startups) && props.startupsResource()!.startups.length > 0}>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {props.startupsResource()!.startups.map((startup: any) => (
              <StartupCard {...startup} />
            ))}
          </div>
        </Match>
        <Match when={true}>
          <p>Стартапов не найдено.</p>
        </Match>
      </Switch>
    </Show>
  );
}