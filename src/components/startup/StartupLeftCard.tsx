import { Show, For } from "solid-js";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "~/components/ui/card"
import { Badge } from "~/components/ui/badge";
import Lightbox, { createLightbox } from "~/components/ui/lightbox";

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

interface StartupLeftCardProps {
    width?: number;
    height?: number;
    startup?: StartupData;
}

export default function StartupLeftCard(props: StartupLeftCardProps) {
    const { isOpen, currentImage, openLightbox, closeLightbox } = createLightbox();

    return (
        <>
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
                    <CardTitle class="text-lg font-semibold"><h1>{props.startup!.name}</h1></CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div>
                        <h4 class="font-semibold mb-2">Описание</h4>
                        <p class="text-gray-600">{props.startup!.description}</p>
                    </div>

                    <Show when={props.startup!.tags.length > 0}>
                        <div>
                            <h4 class="font-semibold mb-2">Теги</h4>
                            <div class="flex flex-wrap gap-2">
                                <For each={props.startup!.tags}>
                                    {(tag) => <Badge variant="secondary">{tag.name}</Badge>}
                                </For>
                            </div>
                        </div>
                    </Show>

                    <Show when={props.startup!.images.length > 0}>
                        <div>
                            <h4 class="font-semibold mb-2">Изображения</h4>
                            <div class="grid grid-cols-2 gap-2">
                                <For each={props.startup!.images.slice(0, 4)}>
                                    {(image) => (
                                        <img
                                            src={image.url}
                                            alt="Startup image"
                                            class="w-full h-48 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => openLightbox(image.url)}
                                        />
                                    )}
                                </For>
                            </div>
                        </div>
                    </Show>
                </CardContent>
                <CardFooter>
                    <div class="text-sm text-gray-500">
                        Создано {new Date(props.startup!.createdAt).toLocaleDateString()}
                    </div>
                </CardFooter>
            </Show>
        </Card>
        
        <Lightbox
            isOpen={isOpen()}
            imageUrl={currentImage()}
            onClose={closeLightbox}
            alt="Startup image"
        />
        </>
    )
}
