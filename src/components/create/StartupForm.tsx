import { Tag, TagInput } from "../ui/tag-input";
import { createSignal, Show } from "solid-js";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { validateCreateStartup } from "~/validation";
import { Button } from "../ui/button";
import { UploadButton } from "~/lib/utils/uploadthing";

const mockData = {
  tags: [
    {
      id: 1,
      name: "Frontend",
    },
    {
      id: 2,
      name: "Backend",
    },
    {
      id: 3,
      name: "Mobile",
    },
    {
      id: 4,
      name: "Design",
    },
    {
      id: 5,
      name: "DevOps",
    },
    {
      id: 6,
      name: "Product",
    },
    {
      id: 7,
      name: "Marketing",
    },
  ]
}

export default function StartupForm() {
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [selectedTags, setSelectedTags] = createSignal<Tag[]>([]);
  const [images, setImages] = createSignal<{ id: string; url: string }[]>([]);
  const [errors, setErrors] = createSignal<{ name?: string; description?: string; tags?: string }>({});


  // Handle form submission
  function handleSubmit() {
    console.log("Submit button clicked");

    // Create form data object
    const formData = {
      name: name(),
      description: description(),
      tags: selectedTags(),
      images: images() || []
    };

    // Validate the entire form using Zod
    const validationResult = validateCreateStartup(formData);

    if (validationResult.success) {
      // Form is valid, proceed with submission
      console.log("Успех! форма обработана", validationResult.data);
      alert("Form submitted! Check console for data.");
    } else {
      // Form has errors, update the errors state
      // Ensure we're passing a valid object to setErrors
      setErrors({
        name: validationResult.errors?.name,
        description: validationResult.errors?.description,
        tags: validationResult.errors?.tags
      });
      console.log("Ошибка валидации формы!", validationResult.errors);
    }
  }

  return (
    <div class="w-full max-w-3xl mx-auto">
      <div class="space-y-6">
        <div class="space-y-2">
          <Label for="name">Название стартапа</Label>
          <Input
            id="name"
            type="text"
            value={name()}
            onInput={(e) => setName(e.target.value)}
            placeholder="StartupCoders"
          />
          <Show when={errors().name}>
            <p class="text-sm text-red-500">{errors().name}</p>
          </Show>
        </div>

        <div class="space-y-2">
          <Label for="description">Описание</Label>
          <Textarea
            id="description"
            value={description()}
            onInput={(e) => setDescription(e.target.value)}
            placeholder="Веб-сайт для разработчиков"
            rows={4}
          />
          <Show when={errors().description}>
            <p class="text-sm text-red-500">{errors().description}</p>
          </Show>
        </div>

        <div class="space-y-2">
          <Label for="tags">Теги</Label>
          <TagInput
            existingTags={mockData.tags}
            selectedTags={selectedTags()}
            onChange={setSelectedTags}
            disabled={false}
            class={errors().tags ? "border-red-500" : ""}
            placeholder="Введите теги..."
          />
          <Show when={!errors().tags}>
            <p class="text-sm text-muted-foreground mt-1">
              Добавьте теги технологий которые вы используете, чтобы помочь другим пользователям найти вас
            </p>
          </Show>
          <Show when={errors().tags}>
            <p class="text-sm text-red-500">{errors().tags}</p>
          </Show>
        </div>

        <div class="space-y-2">
          <Label for="images">Изображения</Label>
          <UploadButton endpoint="imageUploader" />
          <p class="text-sm text-muted-foreground mt-1">
            Добавьте изображения, чтобы показать макеты или идеи (необязательно)
          </p>
        </div>

        {/* Regular HTML button for testing */}
        <Button
          type="button"
          variant={"secondary"}
          onClick={handleSubmit}
        >
          Создать
        </Button>
      </div>
    </div>
  );
}
