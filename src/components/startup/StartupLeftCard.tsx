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
            <Card class="w-full h-full">
            <Show when={props.startup} fallback={
                <div class="p-4 md:p-6">
                    <div class="animate-pulse">
                        <div class="h-6 bg-gray-200 rounded mb-2"></div>
                        <div class="h-4 bg-gray-200 rounded mb-4"></div>
                        <div class="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            }>
                <CardHeader class="p-4 md:p-6 space-y-2">
                    <CardTitle class="text-lg md:text-xl font-semibold break-words">
                        <h1>{props.startup!.name}</h1>
                    </CardTitle>
                </CardHeader>
                <CardContent class="p-4 md:p-6 pt-0 md:pt-0 space-y-4 md:space-y-6">
                    <div>
                        <h4 class="font-semibold mb-2 text-base md:text-lg">Описание</h4>
                        <p class="text-sm md:text-base text-gray-600 break-words whitespace-pre-wrap">
                            {props.startup!.description}
                        </p>
                    </div>

                    <Show when={props.startup!.tags.length > 0}>
                        <div>
                            <h4 class="font-semibold mb-2 text-base md:text-lg">Теги</h4>
                            <div class="flex flex-wrap gap-1.5 md:gap-2">
                                <For each={props.startup!.tags}>
                                    {(tag) => (
                                        <Badge
                                            variant="secondary"
                                            class="text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5"
                                        >
                                            {tag.name}
                                        </Badge>
                                    )}
                                </For>
                            </div>
                        </div>
                    </Show>

                    <Show when={props.startup!.images.length > 0}>
                        <div>
                            <h4 class="font-semibold mb-2 text-base md:text-lg">Изображения</h4>
                            <div class="grid grid-cols-2 gap-2 md:gap-3">
                                <For each={props.startup!.images.slice(0, 4)}>
                                    {(image) => (
                                        <div class="relative aspect-square overflow-hidden rounded-lg">
                                            <img
                                                src={image.url}
                                                alt="Startup image"
                                                class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity touch-manipulation"
                                                onClick={() => openLightbox(image.url)}
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    </Show>
                </CardContent>
                <CardFooter class="p-4 md:p-6 pt-0 md:pt-0">
                    <div class="text-xs md:text-sm text-gray-500">
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
