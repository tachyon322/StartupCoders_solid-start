import { Show, For, createSignal } from "solid-js";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { requestToParticipate } from "~/data/startup";

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
    isRequestedAccess?: boolean;
    onRequestSent?: () => void;
    session?: any;
}

export default function StartupRightCard(props: StartupRightCardProps) {
    const [isDialogOpen, setIsDialogOpen] = createSignal(false);
    const [message, setMessage] = createSignal("");
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [creatorImageError, setCreatorImageError] = createSignal(false);

    const isRequestedAccess = props.isRequestedAccess || false;
    const width = props.width;
    const height = props.height;
    const joinButton = isRequestedAccess ? "Запрос отправлен" : "Присоединиться";

    const handleJoinClick = () => {
        if (!isRequestedAccess) {
            setIsDialogOpen(true);
            setMessage("");
            setError(null);
        }
    };

    const handleSendRequest = async () => {
        if (!props.startup?.id) {
            setError("Ошибка: стартап не найден");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await requestToParticipate(props.startup.id, message().trim() || "", props.session);
            setIsDialogOpen(false);
            setMessage("");
            props.onRequestSent?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка при отправке запроса");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setMessage("");
        setError(null);
    };

    return (
        <Card class="w-full h-full sticky top-4">
            <Show when={props.startup} fallback={
                <div class="p-4 md:p-6">
                    <div class="animate-pulse">
                        <div class="h-10 bg-gray-200 rounded mb-4"></div>
                        <div class="h-6 bg-gray-200 rounded mb-2"></div>
                        <div class="h-4 bg-gray-200 rounded mb-4"></div>
                        <div class="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            }>
                <CardHeader class="p-4 md:p-6 space-y-2">
                    <Button
                        class="w-full h-12 md:h-10 text-sm md:text-base touch-manipulation"
                        variant={"secondary"}
                        disabled={props.isRequestedAccess}
                        onClick={handleJoinClick}
                    >
                        {joinButton}
                    </Button>
                </CardHeader>
                <CardContent class="p-4 md:p-6 pt-0 md:pt-0 space-y-4 md:space-y-6">
                    <div>
                        <h4 class="font-semibold mb-3 text-base md:text-lg">Создатель</h4>
                        <Show when={props.startup!.creatorId} fallback={
                            <p class="text-sm md:text-base text-gray-500">Информация о создателе недоступна</p>
                        }>
                            <A
                                class="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
                                href={`/profile/${props.startup!.creatorId!.username || props.startup!.creatorId!.id}`}
                            >
                                <Show when={props.startup!.creatorId!.image && !creatorImageError()} fallback={
                                    <div class="w-10 h-10 md:w-8 md:h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span class="text-sm md:text-xs text-gray-600 font-semibold">
                                            {props.startup!.creatorId!.name?.[0]?.toUpperCase() || props.startup!.creatorId!.username?.[0]?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                }>
                                    <img
                                        src={props.startup!.creatorId!.image!}
                                        alt="Creator"
                                        class="w-10 h-10 md:w-8 md:h-8 rounded-full object-cover flex-shrink-0"
                                        onError={() => setCreatorImageError(true)}
                                        loading="lazy"
                                    />
                                </Show>
                                <div class="min-w-0 flex-1">
                                    <p class="font-medium text-sm md:text-base truncate">
                                        {props.startup!.creatorId!.name || props.startup!.creatorId!.username}
                                    </p>
                                    <Show when={props.startup!.creatorId!.description}>
                                        <p class="text-xs md:text-sm text-gray-600 line-clamp-2">
                                            {props.startup!.creatorId!.description}
                                        </p>
                                    </Show>
                                </div>
                            </A>
                        </Show>
                    </div>

                    <Show when={props.startup!.participants.length > 0}>
                        <div>
                            <h4 class="font-semibold mb-3 text-base md:text-lg">
                                Участники ({props.startup!.participants.length})
                            </h4>
                            <div class="space-y-1 max-h-48 md:max-h-32 overflow-y-auto pr-2 -mr-2">
                                <For each={props.startup!.participants}>
                                    {(participant) => {
                                        const [imageError, setImageError] = createSignal(false);
                                        
                                        return (
                                            <A
                                                class="flex items-center gap-3 p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
                                                href={`/profile/${participant.username || participant.id}`}
                                            >
                                                <Show when={participant.image && !imageError()} fallback={
                                                    <div class="w-8 h-8 md:w-6 md:h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span class="text-xs text-gray-600 font-semibold">
                                                            {participant.name?.[0]?.toUpperCase() || participant.username?.[0]?.toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                }>
                                                    <img
                                                        src={participant.image!}
                                                        alt="Team member"
                                                        class="w-8 h-8 md:w-6 md:h-6 rounded-full object-cover flex-shrink-0"
                                                        onError={() => setImageError(true)}
                                                        loading="lazy"
                                                    />
                                                </Show>
                                                <span class="text-sm md:text-sm truncate">
                                                    {participant.name || participant.username}
                                                </span>
                                            </A>
                                        );
                                    }}
                                </For>
                            </div>
                        </div>
                    </Show>
                </CardContent>
            </Show>

            <Dialog open={isDialogOpen()} onOpenChange={setIsDialogOpen}>
                <DialogContent class="w-[calc(100vw-2rem)] max-w-md mx-auto bg-white">
                    <DialogHeader>
                        <DialogTitle class="text-lg md:text-xl">Запрос на участие</DialogTitle>
                        <DialogDescription class="text-sm md:text-base">
                            Расскажите, почему вы хотите присоединиться к этому стартапу (необязательно)
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <Textarea
                                id="message"
                                placeholder="Опишите ваш опыт, навыки и мотивацию для участия в этом проекте..."
                                value={message()}
                                onInput={(e) => setMessage(e.currentTarget.value)}
                                disabled={isSubmitting()}
                                class="min-h-[120px] md:min-h-[100px] text-sm md:text-base resize-none"
                            />
                        </div>
                        
                        <Show when={error()}>
                            <div class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                {error()}
                            </div>
                        </Show>
                    </div>

                    <DialogFooter class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting()}
                            class="w-full sm:w-auto h-12 md:h-10 touch-manipulation"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSendRequest}
                            disabled={isSubmitting()}
                            variant="secondary"
                            class="w-full sm:w-auto h-12 md:h-10 touch-manipulation"
                        >
                            {isSubmitting() ? "Отправка..." : "Отправить запрос"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}