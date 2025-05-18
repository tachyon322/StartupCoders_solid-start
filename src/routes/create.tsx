import { useNavigate } from '@solidjs/router'
import Header from '~/components/landing/Header';
import { useSession } from '~/lib/auth/session-context';
import StartupForm from '~/components/create/StartupForm';

const Page = () => {
    const session = useSession();
    const navigate = useNavigate();

    return (
        <div class="min-h-screen bg-gray-50">
            <Header session={session} />

            <main class="container mx-auto px-4 py-10 max-w-6xl relative">
                <div class="mb-10 text-center">
                    <h1 class="text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
                        Создать идею для стартапа
                    </h1>
                    <p class="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                        Поделитесь своей идеей с сообществом и найдите талантливых разработчиков и дизайнеров для сотрудничества
                    </p>
                </div>

                <div class="bg-white shadow-sm rounded-lg p-6 md:p-8 border border-gray-100">
                    <StartupForm  />
                </div>

                <div class="mt-8 text-center text-sm text-gray-500">
                    <p>Ваш стартап будет виден всем пользователям. Будьте конкретны и четки в своей идее, чтобы привлечь правильных людей.</p>
                </div>
            </main>
        </div>
    );
};

export default Page;