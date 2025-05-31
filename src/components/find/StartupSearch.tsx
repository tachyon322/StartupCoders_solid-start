import { createSignal, createEffect, For, Show } from "solid-js";
import { useSearchParams, useNavigate } from "@solidjs/router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "~/components/ui/label";

// SVG Icons components
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-4 w-4"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-4 w-4"
  >
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
);

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-4 w-4"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-3 w-3"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

interface Tag {
  id: number;
  name: string;
}

interface StartupSearchProps {
  availableTags: Tag[];
}

export default function StartupSearch(props: StartupSearchProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract and handle search parameters properly
  const queryParam = searchParams.q as string | undefined;
  const tagsParam = searchParams.tags as string | undefined;
  
  const [searchQuery, setSearchQuery] = createSignal(queryParam || "");
  const [selectedTagIds, setSelectedTagIds] = createSignal<number[]>(
    tagsParam
      ? tagsParam.split(",").map(id => parseInt(id, 10))
      : []
  );
  const [tagSearchQuery, setTagSearchQuery] = createSignal("");
  const [isPopoverOpen, setIsPopoverOpen] = createSignal(false);
  
  // Ref for the trigger button
  let triggerRef: HTMLButtonElement | undefined;

  // Get the selected tag objects for displaying tags
  const selectedTags = () => props.availableTags.filter(tag => 
    selectedTagIds().includes(tag.id)
  );

  // Filter tags based on search query
  const filteredTags = () => {
    if (!tagSearchQuery().trim()) return props.availableTags;
    
    return props.availableTags.filter(tag => 
      tag.name.toLowerCase().includes(tagSearchQuery().toLowerCase())
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Only add search query if not empty
    if (searchQuery().trim()) {
      params.set("q", searchQuery().trim());
    }
    
    // Only add tags if any are selected
    if (selectedTagIds().length > 0) {
      params.set("tags", selectedTagIds().join(","));
    }
    
    // Always reset to page 1 when searching
    params.set("page", "1");
    
    navigate(`/find?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedTagIds([]);
    navigate("/find");
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const removeTag = (tagId: number) => {
    setSelectedTagIds(prev => prev.filter(id => id !== tagId));
  };

  // Submit on Enter key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  return (
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-2">
        <div class="relative flex-grow">
          <Input
            type="text"
            placeholder="Поиск по названию стартапа..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            class="pl-10 pr-10"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
          <Show when={searchQuery()}>
            <button
              onClick={() => setSearchQuery("")}
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XIcon />
            </button>
          </Show>
        </div>

        <div class="flex gap-2">
          <Popover>
            <PopoverTrigger
              ref={(el) => triggerRef = el}
              class="gap-2 bg-white hover:bg-gray-50 border-gray-200 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border h-10 px-4 py-2"
              onClick={() => setIsPopoverOpen(!isPopoverOpen())}
            >
              <div class="text-indigo-500">
                <FilterIcon />
              </div>
              <span class="text-gray-700">Фильтры</span>
              <Show when={selectedTagIds().length > 0}>
                <Badge
                  variant="secondary"
                  class="ml-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                >
                  {selectedTagIds().length}
                </Badge>
              </Show>
            </PopoverTrigger>
            <Show when={isPopoverOpen()}>
              <PopoverContent
                class="w-72 p-4 border border-gray-200 shadow-lg"
                align="end"
                triggerRef={triggerRef}
                onClickOutside={() => setIsPopoverOpen(false)}
              >
                <div class="space-y-3">
                  <h3 class="font-medium text-gray-800 pb-2 border-b border-gray-100">Теги</h3>
                  
                  {/* Tag search input */}
                  <div class="relative">
                    <Input
                      type="text"
                      placeholder="Поиск тегов..."
                      value={tagSearchQuery()}
                      onInput={(e) => setTagSearchQuery(e.currentTarget.value)}
                      class="pl-8 text-sm"
                    />
                    <div class="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <SearchIcon />
                    </div>
                    <Show when={tagSearchQuery()}>
                      <button
                        onClick={() => setTagSearchQuery("")}
                        class="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XIcon />
                      </button>
                    </Show>
                  </div>
                  
                  <div class="max-h-64 overflow-auto pr-2">
                    <Show when={filteredTags().length > 0} fallback={
                      <div class="py-4 text-center text-sm text-gray-500">
                        {tagSearchQuery() ? (
                          <>
                            По запросу <span class="font-medium">"{tagSearchQuery()}"</span> ничего не найдено
                          </>
                        ) : (
                          <>Нет доступных тегов</>
                        )}
                      </div>
                    }>
                      <div class="grid grid-cols-1 gap-2">
                        <For each={filteredTags()}>
                          {(tag) => (
                            <div 
                              class={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                                selectedTagIds().includes(tag.id) 
                                  ? 'bg-indigo-50 text-indigo-800' 
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => handleTagToggle(tag.id)}
                            >
                              <div 
                                class={`h-4 w-4 rounded flex items-center justify-center border ${
                                  selectedTagIds().includes(tag.id)
                                    ? 'bg-indigo-600 border-indigo-600' 
                                    : 'border-gray-300'
                                }`}
                              >
                                <Show when={selectedTagIds().includes(tag.id)}>
                                  <div class="text-white">
                                    <CheckIcon />
                                  </div>
                                </Show>
                              </div>
                              <Label class="cursor-pointer text-sm flex-grow">
                                {tag.name}
                              </Label>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                  
                  <div class="flex justify-between pt-2 mt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTagIds([])}
                      class="text-xs text-gray-600 hover:text-gray-900"
                      disabled={selectedTagIds().length === 0}
                    >
                      Очистить все
                    </Button>
                    <Button
                      size="sm" 
                      onClick={() => {
                        handleSearch();
                        closePopover();
                      }}
                      class="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Применить
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Show>
          </Popover>

          <Button 
            onClick={handleSearch}
            variant={"secondary"}
          >
            Поиск
          </Button>
        </div>
      </div>

      {/* Display selected tags */}
      <Show when={selectedTags().length > 0}>
        <div class="flex flex-wrap gap-2">
          <For each={selectedTags()}>
            {(tag) => (
              <Badge 
                variant="secondary"
                class="flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-1"
              >
                {tag.name}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag.id);
                  }}
                  class="ml-1 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                >
                  <XIcon />
                </button>
              </Badge>
            )}
          </For>
          <Show when={selectedTags().length > 0 || searchQuery()}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearSearch}
              class="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Сбросить всё
            </Button>
          </Show>
        </div>
      </Show>
    </div>
  );
}