import { createSignal, Show, For, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { Button } from "./button";
import { createUploadThing } from "~/lib/utils/uploadthing";

interface ImageUploadProps {
  onChange: (urls: { id: string; url: string }[]) => void;
  value: { id: string; url: string }[];
  disabled?: boolean;
}

export function ImageUpload(props: ImageUploadProps) {
  const [isUploading, setIsUploading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let fileInputRef: HTMLInputElement | undefined;

  // Initialize uploadThing client
  const { startUpload } = createUploadThing("imageUploader");

  const removeImage = (indexToRemove: number) => {
    const newValue = [...props.value];
    newValue.splice(indexToRemove, 1);
    props.onChange(newValue);
  };

  // Generate a unique ID (browser-safe)
  const generateId = () => {
    return 'img_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const files = Array.from(input.files);
      const uploadResult = await startUpload(files);

      if (uploadResult) {
        const newImages = uploadResult.map((result) => ({
          id: generateId(),
          url: result.url,
        }));
        props.onChange([...props.value, ...newImages]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setIsUploading(false);
      // Reset the input value so the same file can be uploaded again if needed
      if (fileInputRef) fileInputRef.value = "";
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (props.disabled || isUploading()) return;

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadResult = await startUpload(files);

      if (uploadResult) {
        const newImages = uploadResult.map((result) => ({
          id: generateId(),
          url: result.url,
        }));
        props.onChange([...props.value, ...newImages]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div class="space-y-4">
      <div
        class={`
          border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center
          hover:border-indigo-500 hover:bg-indigo-50 transition-colors
          ${isUploading() || props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onClick={() => !props.disabled && !isUploading() && fileInputRef?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          onChange={handleFileChange}
          disabled={props.disabled || isUploading()}
        />
        
        <div class="flex flex-col items-center justify-center gap-2 text-center">
          {isUploading() ? (
            <div class="flex flex-col items-center">
              <svg
                class="animate-spin h-10 w-10 text-indigo-500 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p class="text-sm text-gray-500">Загрузка...</p>
            </div>
          ) : (
            <>
              <svg class="h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div class="text-sm font-medium">
                Перетащите и отпустите или нажмите для загрузки изображений стартапа
              </div>
              <p class="text-xs text-gray-500">
                Загрузите до 5 изображений (PNG, JPG, WEBP, до 4MB каждое)
              </p>
            </>
          )}
        </div>
      </div>

      <Show when={error()}>
        <div class="text-sm text-red-500 mt-2">
          {error()}
        </div>
      </Show>

      <Show when={props.value && props.value.length > 0}>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          <For each={props.value}>
            {(img, index) => (
              <div class="relative group aspect-square rounded-md overflow-hidden border border-gray-200">
                <img
                  src={img.url}
                  alt={`Startup img ${index() + 1}`}
                  class="object-cover w-full h-full"
                />
                <Button
                  type="button"
                  onClick={() => removeImage(index())}
                  disabled={props.disabled}
                  class="absolute top-1 right-1 p-1 h-auto w-auto bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  size="icon"
                  variant="destructive"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span class="sr-only">Удалить изображение</span>
                </Button>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}