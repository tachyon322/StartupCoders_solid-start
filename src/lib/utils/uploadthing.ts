import {
  generateSolidHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/solid";

import { UploadRouter } from "~/data/uploadthing";

// URL is only needed for server side rendering, or when your router
// is deployed on a different path than `/api/uploadthing`
const url = import.meta.env.VITE_BETTER_AUTH_URL;

export const UploadButton = generateUploadButton<UploadRouter>({ url });
export const UploadDropzone = generateUploadDropzone<UploadRouter>({ url });
export const { createUploadThing } = generateSolidHelpers<UploadRouter>({
  url,
});
