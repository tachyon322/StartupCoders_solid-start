import { Show, createEffect, onCleanup, onMount, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { cn } from "~/lib/utils";

export interface ToastProps {
  visible: boolean;
  onClose: () => void;
  children: any;
  variant?: "success" | "error" | "warning" | "info";
  duration?: number; // Duration in ms
  class?: string;
}

export function Toast(props: ToastProps) {
  // Only render on client
  if (isServer) {
    return null;
  }
  
  // Auto-hide toast after duration
  createEffect(() => {
    if (props.visible && props.duration) {
      const timeout = setTimeout(() => {
        props.onClose();
      }, props.duration);
      
      onCleanup(() => clearTimeout(timeout));
    }
  });
  
  // Handle variant styling
  const getVariantStyles = () => {
    switch (props.variant) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-white border-gray-200 text-gray-800";
    }
  };

  return (
    <Show when={props.visible}>
      <div
        class={cn(
          "fixed top-4 right-4 z-50 max-w-md shadow-lg rounded-md border p-4 transition-all duration-300 transform",
          "animate-in slide-in-from-top-5",
          getVariantStyles(),
          props.class
        )}
        role="alert"
      >
        <div class="flex items-start">
          <div class="flex-grow">
            {props.children}
          </div>
          <button
            onClick={props.onClose}
            class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </Show>
  );
}