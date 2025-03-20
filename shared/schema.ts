
import { z } from "zod";

export const userSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const insertGalleryItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  mediaUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  mediaType: z.string(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

export const galleryItemSchema = insertGalleryItemSchema.extend({
  id: z.number()
});

export type User = z.infer<typeof userSchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
