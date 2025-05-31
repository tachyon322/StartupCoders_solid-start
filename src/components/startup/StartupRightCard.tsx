import { Show, For } from "solid-js";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "~/components/ui/card"
import { Button } from "~/components/ui/button";
import { A } from "@solidjs/router";

interface StartupData {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    creatorUser: string;
    tags: { id: number; name: string; }[];
    images: { id: string; url: string; }[];
    creatorId: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
        description: string | null;
    } | null;
    participants: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    }[];
}

interface StartupRightCardProps {
    width?: number;
    height?: number;
    startup?: StartupData;
}

export default function StartupRightCard(props: StartupRightCardProps) {
    return (
        <Card class="w-full" style={{ width: props.width ? `${props.width}px` : "100%", height: props.height ? `${props.height}px` : "auto" }}>
            <Show when={props.startup} fallback={
                <div class="p-6">
                    <div class="animate-pulse">
                        <div class="h-6 bg-gray-200 rounded mb-2"></div>
                        <div class="h-4 bg-gray-200 rounded mb-4"></div>
                        <div class="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            }>
                <CardHeader class="space-y-2">
                    <Button class="w-full" variant={"secondary"}>Присоединиться</Button>
                    <Button variant="outline" class="w-full">Контакты создателя</Button>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div>
                        <h4 class="font-semibold mb-2">Создатель</h4>
                        <Show when={props.startup!.creatorId} fallback={<p class="text-gray-500">Creator information not available</p>}>
                            <A class="flex items-center gap-2" href={`/profile/${props.startup!.creatorId!.id}`}>
                                <Show when={props.startup!.creatorId!.image} fallback={
                                    <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span class="text-xs text-gray-600 font-semibold">
                                            {props.startup!.creatorId!.name?.[0] || props.startup!.creatorId!.username?.[0] || '?'}
                                        </span>
                                    </div>
                                }>
                                    <img
                                        src={props.startup!.creatorId!.image!}
                                        alt="Creator"
                                        class="w-6 h-6 rounded-full object-cover"
                                    />
                                </Show>
                                <div>
                                    <p class="font-medium">{props.startup!.creatorId!.name || props.startup!.creatorId!.username}</p>
                                    <Show when={props.startup!.creatorId!.description}>
                                        <p class="text-sm text-gray-600">{props.startup!.creatorId!.description}</p>
                                    </Show>
                                </div>
                            </A>
                        </Show>
                    </div>

                    <Show when={props.startup!.participants.length > 0}>
                        <div>
                            <h4 class="font-semibold mb-2">Участники ({props.startup!.participants.length})</h4>
                            <div class="space-y-2 max-h-32 overflow-y-auto">
                                <For each={props.startup!.participants}>
                                    {(participant) => (
                                        <div class="flex items-center space-x-2">
                                            <Show when={participant.image} fallback={
                                                <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                                    <span class="text-xs text-gray-600 font-semibold">
                                                        {participant.name?.[0] || participant.username?.[0] || '?'}
                                                    </span>
                                                </div>
                                            }>
                                                <img
                                                    src={participant.image!}
                                                    alt="Team member"
                                                    class="w-6 h-6 rounded-full object-cover"
                                                />
                                            </Show>
                                            <span class="text-sm">{participant.name || participant.username}</span>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    </Show>
                </CardContent>
            </Show>
        </Card>
    )
}