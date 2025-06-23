import { Tag, TagInput } from "../ui/tag-input";
import { createSignal, Show, createResource } from "solid-js";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { validateCreateStartup } from "~/validation";
import { Button } from "../ui/button";
import { ImageUpload } from "../ui/image-upload";
import { Toast } from "../ui/toast";
import { getAllTags } from "~/data/user";
import { createStartup as createStartupServer } from "~/data/startup";
import { useNavigate } from "@solidjs/router";

// Function to fetch all available tags from the server
async function fetchTags() {
  "use server";
  const tags = await getAllTags();
  return tags;
}

// Create a server action wrapper for the createStartup function
async function createStartupAction(name: string, description: string, tags: Tag[], images: { id: string; url: string }[], userId: string) {
  "use server";
  try {
    return await createStartupServer(name, description, tags, images, userId);
  } catch (error) {
    console.error("Error in server action:", error);
    throw error;
  }
}

export default function StartupForm(props: { session: any }) {
  const { session } = props;
  const navigate = useNavigate(); // Move useNavigate inside the component
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [selectedTags, setSelectedTags] = createSignal<Tag[]>([]);
  const [isActive, setIsActive] = createSignal(false);

  // Create a resource to fetch tags data from the server
  const [tags] = createResource(fetchTags);
  const [images, setImages] = createSignal<{ id: string; url: string }[]>([]);
  const [errors, setErrors] = createSignal<{ name?: string; description?: string; tags?: string }>({});

  // Toast state management
  const [toastVisible, setToastVisible] = createSignal(false);
  const [toastMessage, setToastMessage] = createSignal("");
  const [toastVariant, setToastVariant] = createSignal<"success" | "error" | "warning" | "info">("info");

  // Helper function to show toast
  const showToast = (message: string, variant: "success" | "error" | "warning" | "info" = "info") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };


  // Handle form submission
  async function handleSubmit() {
    setIsActive(true);

    // Create form data object
    const formData = {
      name: name(),
      description: description(),
      tags: selectedTags(),
      images: images() || [],
    };

    // Validate the entire form using Zod
    const validationResult = validateCreateStartup(formData);

    if (validationResult.success) {
      // Form is valid, proceed with submission
      console.log("Успех! форма обработана", validationResult.data);
      try {
        await createStartupAction(formData.name, formData.description, formData.tags, formData.images, session?.())
          .then(() => {
            setName("");
            setDescription("");
            setSelectedTags([]);
            setImages([]);
            setErrors({});
            setIsActive(false);
            showToast("Стартап успешно создан!", "success");
            navigate("/find"); // Redirect to the find page after creation (since /startups doesn't exist)
        })
        console.log("Стартап успешно создан!");
      }
      catch (error) {
        console.error("Ошибка при создании стартапа:", error);
        setIsActive(false);
        showToast("Ошибка при создании стартапа. Пожалуйста, попробуйте еще раз.", "error");
        setErrors({ name: "Ошибка при создании стартапа. Пожалуйста, попробуйте еще раз." });
      }
    } else {
      // Form has errors, update the errors state
      setIsActive(false);
      // Ensure we're passing a valid object to setErrors
      setErrors({
        name: validationResult.errors?.name,
        description: validationResult.errors?.description,
        tags: validationResult.errors?.tags
      });
      showToast("Пожалуйста, исправьте ошибки в форме", "error");
      console.log("Ошибка валидации формы!", validationResult.errors);
    }
  }

  return (
    <div class="w-full max-w-3xl mx-auto">
      <div class="space-y-4 md:space-y-6">
        <div class="space-y-2">
          <Label for="name" class="text-sm md:text-base font-medium">Название стартапа</Label>
          <Input
            id="name"
            type="text"
            value={name()}
            onInput={(e) => setName(e.target.value)}
            placeholder="StartupCoders"
            class="w-full text-sm md:text-base"
          />
          <Show when={errors().name}>
            <p class="text-xs md:text-sm text-red-500 mt-1">{errors().name}</p>
          </Show>
        </div>

        <div class="space-y-2">
          <Label for="description" class="text-sm md:text-base font-medium">Описание</Label>
          <Textarea
            id="description"
            value={description()}
            onInput={(e) => setDescription(e.target.value)}
            placeholder="Веб-сайт для разработчиков"
            rows={4}
            class="w-full text-sm md:text-base min-h-[100px] md:min-h-[120px]"
          />
          <Show when={errors().description}>
            <p class="text-xs md:text-sm text-red-500 mt-1">{errors().description}</p>
          </Show>
        </div>

        <div class="space-y-2">
          <Label for="tags" class="text-sm md:text-base font-medium">Теги</Label>
          <Show
            when={!tags.error}
            fallback={
              <div class="text-red-500 text-sm mb-2">
                Ошибка при загрузке тегов. Попробуйте перезагрузить страницу.
              </div>
            }
          >
            <TagInput
              existingTags={tags() || []}
              selectedTags={selectedTags()}
              onChange={setSelectedTags}
              disabled={tags.loading}
              class={errors().tags ? "border-red-500" : ""}
              placeholder={tags.loading ? "Загрузка тегов..." : "Введите теги..."}
            />
          </Show>
          <Show when={!errors().tags}>
            <p class="text-xs md:text-sm text-muted-foreground mt-1">
              Добавьте теги технологий которые вы используете, чтобы помочь другим пользователям найти вас
            </p>
          </Show>
          <Show when={errors().tags}>
            <p class="text-xs md:text-sm text-red-500 mt-1">{errors().tags}</p>
          </Show>
        </div>

        <div class="space-y-2">
          <Label for="images" class="text-sm md:text-base font-medium">Изображения</Label>
          <ImageUpload value={images()} onChange={setImages} />
          <p class="text-xs md:text-sm text-muted-foreground mt-1">
            Добавьте изображения, чтобы показать макеты или идеи (необязательно)
          </p>
        </div>

        <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-6 md:mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/find")}
            class="w-full sm:w-auto h-10 md:h-11 text-sm md:text-base"
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant={"secondary"}
            onClick={handleSubmit}
            disabled={isActive()}
            class="w-full sm:w-auto h-10 md:h-11 text-sm md:text-base"
          >
            {isActive() ? "Создание..." : "Создать"}
          </Button>
        </div>
      </div>

      {/* Toast notification */}
      <Toast
        visible={toastVisible()}
        onClose={() => setToastVisible(false)}
        variant={toastVariant()}
        duration={5000}
      >
        {toastMessage()}
      </Toast>
    </div>
  );
}
