import type { APIEvent } from "@solidjs/start/server";

import { createRouteHandler } from "uploadthing/server";

import { uploadRouter } from "~/data/uploadthing";

const handler = createRouteHandler({
    router: uploadRouter,
    config: {
        token: import.meta.env.VITE_UPLOADTHING_TOKEN,
    }
});

export const GET = (event: APIEvent) => handler(event.request);
export const POST = (event: APIEvent) => handler(event.request);
