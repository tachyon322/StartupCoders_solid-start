
import { useParams } from "@solidjs/router";
import { createResource, Show, For } from "solid-js";
import { getUser } from "~/data/user";

export default function UserProfile() {
    const params = useParams();
    const [user] = createResource(() => params.profile, getUser);

    return (
        <div class="container mx-auto p-4">
            <Show when={user()} fallback={<div>Loading...</div>}>
                <div class="">
                    {JSON.stringify(user())}
                </div>
            </Show>
        </div>
    );
}
