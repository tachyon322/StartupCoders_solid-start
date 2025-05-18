import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { cn } from "~/lib/utils";

export interface Tag {
  id?: number;
  name: string;
}

interface TagInputProps {
  existingTags: Tag[];
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  disabled?: boolean;
  class?: string;
  placeholder?: string;
}

export function TagInput(props: TagInputProps) {
  
  const [inputValue, setInputValue] = createSignal("");
  const [suggestions, setSuggestions] = createSignal<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;
  let suggestionRef: HTMLDivElement | undefined;

  // Filter suggestions based on input value
  createEffect(() => {
    if (inputValue().trim() && props.existingTags && props.existingTags.length > 0) {
      const filtered = props.existingTags.filter(
        tag =>
          tag.name.toLowerCase().includes(inputValue().toLowerCase()) &&
          !props.selectedTags.some(selected => selected.name.toLowerCase() === tag.name.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  });

  // Handle click outside to close suggestions
  const handleClickOutside = (event: MouseEvent) => {
    if (
      suggestionRef && 
      !suggestionRef.contains(event.target as Node) && 
      inputRef && !inputRef.contains(event.target as Node)
    ) {
      setShowSuggestions(false);
    }
  };

  createEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));
  });

  const addTag = (tag: Tag) => {
    // Check if tag already exists in selectedTags
    if (!props.selectedTags.some(t => t.name.toLowerCase() === tag.name.toLowerCase())) {
      props.onChange([...props.selectedTags, tag]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef?.focus();
  };

  const removeTag = (index: number) => {
    props.onChange(props.selectedTags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && inputValue().trim()) {
      e.preventDefault();
      
      // Check if the tag already exists in the suggestions
      const existingTag = props.existingTags.find(
        tag => tag.name.toLowerCase() === inputValue().toLowerCase()
      );
      
      if (existingTag) {
        addTag(existingTag);
      } else {
        // Create a new tag
        addTag({ name: inputValue().trim() });
      }
    } else if (e.key === "Backspace" && !inputValue() && props.selectedTags.length > 0) {
      removeTag(props.selectedTags.length - 1);
    }
  };

  return (
    <div class={cn("relative", props.class)}>
      <div 
        class={cn(
          "flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-10",
          props.disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-text",
          "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1"
        )}
        onClick={() => inputRef?.focus()}
      >
        <For each={props.selectedTags}>
          {(tag, index) => (
            <div 
              class={cn(
                "flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-indigo-100 text-indigo-800",
                tag.id ? "" : "border border-dashed border-indigo-300"
              )}
            >
              {!tag.id && (
                <svg class="w-3 h-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              )}
              {tag.name}
              {!props.disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(index());
                  }}
                  class="text-indigo-500 hover:text-indigo-700"
                >
                  <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </For>
        <input
          ref={inputRef}
          type="text"
          value={inputValue()}
          disabled={props.disabled}
          onInput={(e) => {
            setInputValue(e.currentTarget.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={props.selectedTags.length === 0 ? props.placeholder || "Add tags..." : ""}
          class="flex-grow outline-none text-sm bg-transparent min-w-20"
        />
      </div>

      <Show when={showSuggestions() && suggestions().length > 0 && !props.disabled}>
        <div
          ref={suggestionRef}
          class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <div class="p-2 text-xs text-gray-500 border-b">
            Существующие теги (нажмите чтобы выбрать)
          </div>
          <For each={suggestions()}>
            {(tag) => (
              <div
                onClick={() => addTag(tag)}
                class="flex items-center justify-between px-3 py-2 hover:bg-indigo-50 cursor-pointer"
              >
                <span>{tag.name}</span>
                <svg class="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={showSuggestions() && inputValue().trim() && suggestions().length === 0 && !props.disabled}>
        <div 
          ref={suggestionRef}
          class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
        >
          <div
            onClick={() => addTag({ name: inputValue().trim() })}
            class="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 cursor-pointer"
          >
            <svg class="w-4 h-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create new tag "{inputValue()}"</span>
          </div>
        </div>
      </Show>
    </div>
  );
}