import { useNavigate } from '@solidjs/router'
import Header from '~/components/landing/Header';
import { useSession } from '~/lib/auth/session-context';
import StartupForm from '~/components/create/StartupForm';
import { createEffect, Show } from 'solid-js';

export default function CreatePage() {
    const session = useSession();
    const navigate = useNavigate();

    createEffect(() => {
        // Check if user is authenticated
        const isAuthenticated = session()?.data?.user || session()?.user;
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
        }
    });

    return (
        <div class="min-h-screen bg-gray-50">
            <Header session={session} />

            <main class="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
                <div class="mb-6 md:mb-10 text-center px-4">
                    <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-indigo-950">
                        Создать идею для стартапа
                    </h1>
                    <p class="mt-2 md:mt-3 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                        Поделитесь своей идеей с сообществом и найдите талантливых разработчиков и дизайнеров для сотрудничества
                    </p>
                </div>

                <Show
                    when={session()?.data?.user || session()?.user}
                    fallback={
                        <div class="bg-white shadow-sm rounded-lg p-6 md:p-8 border border-gray-100 text-center">
                            <p class="text-gray-600">Загрузка...</p>
                        </div>
                    }
                >
                    <div class="bg-white shadow-sm rounded-lg p-4 sm:p-6 md:p-8 border border-gray-100">
                        <StartupForm session={session} />
                    </div>
                </Show>

                <div class="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-500 px-4">
                    <p>Ваш стартап будет виден всем пользователям. Будьте конкретны и четки в своей идее, чтобы привлечь правильных людей.</p>
                </div>
            </main>
        </div>
    );
}
