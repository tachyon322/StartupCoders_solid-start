import { createSignal, Show, onMount, onCleanup } from "solid-js";

interface LightboxProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  alt?: string;
}

export default function Lightbox(props: LightboxProps) {
  let dialogRef: HTMLDivElement | undefined;

  // Handle escape key press
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      props.onClose();
    }
  };

  // Handle click outside image
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === dialogRef) {
      props.onClose();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <Show when={props.isOpen}>
      <div
        ref={dialogRef}
        class="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div class="relative max-w-4xl max-h-[90vh] p-4">
          {/* Close button */}
          <button
            onClick={props.onClose}
            class="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all"
            aria-label="Close lightbox"
          >
            ×
          </button>
          
          {/* Image */}
          <img
            src={props.imageUrl}
            alt={props.alt || "Lightbox image"}
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </Show>
  );
}

// Hook for managing lightbox state
export function createLightbox() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [currentImage, setCurrentImage] = createSignal("");

  const openLightbox = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsOpen(true);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setCurrentImage("");
    // Restore body scroll
    document.body.style.overflow = "auto";
  };

  return {
    isOpen,
    currentImage,
    openLightbox,
    closeLightbox,
  };
}