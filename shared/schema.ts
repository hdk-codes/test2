
import { z } from "zod";

export const userSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const mediaTypeSchema = z.enum(['image', 'video']);

export const insertGalleryItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  mediaUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  mediaType: mediaTypeSchema,
  tags: z.array(z.string()).optional().default([]),
  metadata: z.record(z.any()).optional().default({})
});

export const galleryItemSchema = insertGalleryItemSchema.extend({
  id: z.string(),
  dateCreated: z.date()
});

export type User = z.infer<typeof userSchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type MediaType = z.infer<typeof mediaTypeSchema>;
