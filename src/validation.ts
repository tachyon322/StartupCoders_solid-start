import { z } from "zod";

// Define Zod schemas for validation
export const nameSchema = z.string()
  .trim()
  .min(1, { message: "Название стратапа обязательно" })
  .min(3, { message: "Название стартапа должно быть не менее 3 символов" });

export const descriptionSchema = z.string()
  .trim()
  .min(1, { message: "Описание обязательно" })
  .min(10, { message: "Описание должно быть не менее 10 символов" });

// Define a schema for the entire form
export const startupFormSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  tags: z.array(z.object({
    id: z.number().optional(),
    name: z.string()
  })).optional(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string().url()
  })).optional(),
});

// Type for the form data based on the schema
export type StartupFormData = z.infer<typeof startupFormSchema>;

// Helper functions to validate individual fields
export function validateCreateStartup(data: {
  name: string;
  description: string;
  tags?: { id?: number; name: string }[];
  images?: { id: string; url: string }[];
}) {
  const result = startupFormSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const formatted = result.error.format();
    return {
      success: false,
      errors: {
        name: formatted.name?._errors[0],
        description: formatted.description?._errors[0],
        tags: formatted.tags?._errors[0]
      }
    };
  }
}