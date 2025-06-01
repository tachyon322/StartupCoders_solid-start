import { APIEvent } from "@solidjs/start/server";
import { updateUserDescription, updateUserName, updateUserTags } from "~/data/user";
import { auth } from "~/lib/auth/auth";

interface UpdateProfileRequest {
  name?: string;
  description?: string;
  tags?: { id: number; name: string }[];
}

export async function POST(event: APIEvent) {
  try {
    const session = await auth.api.getSession({
      headers: event.request.headers
    });
    
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body: UpdateProfileRequest = await event.request.json();
    const userId = session.user.id;

    // Update name if provided
    if (body.name !== undefined) {
      await updateUserName(userId, body.name);
    }

    // Update description if provided
    if (body.description !== undefined) {
      await updateUserDescription(userId, body.description);
    }

    // Update tags if provided
    if (body.tags !== undefined) {
      await updateUserTags(userId, body.tags);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}