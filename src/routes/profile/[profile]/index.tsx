import { useParams } from "@solidjs/router";
import { createResource, Show, createSignal, createEffect } from "solid-js";
import { getUser } from "~/data/user";
import { useSession } from "~/lib/auth/session-context";

// Import profile components
import EditableProfileHeader from "~/components/profile/EditableProfileHeader";
import ProfileStats from "~/components/profile/ProfileStats";
import CreatedStartups from "~/components/profile/CreatedStartups";
import ParticipatingStartups from "~/components/profile/ParticipatingStartups";
import UserTags from "~/components/profile/UserTags";
import StartupRequests from "~/components/profile/StartupRequests";
import ProfileSkeleton from "~/components/profile/ProfileSkeleton";
import Header from "~/components/landing/Header";

export default function UserProfile() {
    const params = useParams();
    const session = useSession();
    const [user] = createResource(() => params.profile, getUser);

    // Create reactive signals for user data
    const [userInfo, setUserInfo] = createSignal<any>(null);

    // Update userInfo signal when user data loads
    createEffect(() => {
        if (user()) {
            setUserInfo(user());
        }
    });

    const handleProfileUpdate = async (data: { name?: string; username?: string; description?: string; tags?: any[] }) => {
        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Update the userInfo signal immediately for seamless UI updates
            setUserInfo(prev => ({
                ...prev,
                ...data
            }));
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    return (
        <div class="min-h-screen bg-gray-50">
            <Header session={session} />

            {/* Profile Container */}
            <div class="container mx-auto px-4 py-8 max-w-6xl">
                <Show when={userInfo()} fallback={<ProfileSkeleton />}>
                    <div class="space-y-6">
                        <Show when={userInfo()}>
                            {(userData) => {
                                const currentUser = session()?.data?.user;
                                const isOwner = currentUser?.id === userData().id || currentUser?.username === userData().username;

                                return (
                                    <>
                                        {/* Editable Profile Header */}
                                        <EditableProfileHeader
                                            user={userData()}
                                            isOwner={isOwner}
                                            onSave={handleProfileUpdate}
                                        />

                                        {/* Statistics Overview */}
                                        <ProfileStats
                                            createdStartupsCount={userData().createdStartups?.length || 0}
                                            participatingStartupsCount={userData().participatingStartups?.length || 0}
                                            tagsCount={userData().tags?.length || 0}
                                            requestsCount={userData().receivedStartupRequests?.length || 0}
                                            joinDate={userData().createdAt}
                                        />

                                        {/* Main Content Grid */}
                                        <div class="grid lg:grid-cols-3 gap-6">
                                            {/* Left Column - 2/3 width */}
                                            <div class="lg:col-span-2 space-y-6">
                                                {/* Created Startups */}
                                                <Show when={userData().createdStartups}>
                                                    <CreatedStartups startups={userData().createdStartups || []} />
                                                </Show>

                                                {/* Participating Startups */}
                                                <Show when={userData().participatingStartups}>
                                                    <ParticipatingStartups
                                                        participatingStartups={userData().participatingStartups?.map((startup: any) => ({ startup })) || []}
                                                    />
                                                </Show>
                                            </div>

                                            {/* Right Column - 1/3 width */}
                                            <div class="space-y-6">
                                                {/* User Tags */}
                                                <Show when={userData().tags}>
                                                    <UserTags tags={userData().tags?.map((tag: any) => ({ tag })) || []} />
                                                </Show>

                                                {/* Startup Requests */}
                                                <Show when={userData().receivedStartupRequests}>
                                                    <StartupRequests requests={userData().receivedStartupRequests || []} />
                                                </Show>
                                            </div>
                                        </div>

                                        {/* Empty State for New Users */}
                                        <Show when={
                                            (!userData().createdStartups || userData().createdStartups.length === 0) &&
                                            (!userData().participatingStartups || userData().participatingStartups.length === 0) &&
                                            (!userData().tags || userData().tags.length === 0) &&
                                            (!userData().receivedStartupRequests || userData().receivedStartupRequests.length === 0)
                                        }>
                                            <div class="text-center py-12">
                                                <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                                    <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </div>
                                                <h3 class="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать!</h3>
                                                <p class="text-gray-600 mb-6 max-w-md mx-auto">
                                                    Это ваш профиль. Начните создавать стартапы, участвуйте в проектах и добавляйте теги, чтобы показать свои навыки.
                                                </p>
                                                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                                                    <a
                                                        href="/create"
                                                        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                                    >
                                                        Создать стартап
                                                    </a>
                                                    <a
                                                        href="/find"
                                                        class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                                    >
                                                        Найти проекты
                                                    </a>
                                                </div>
                                            </div>
                                        </Show>
                                    </>
                                );
                            }}
                        </Show>
                    </div>
                </Show>
            </div>
        </div>
    );
}
