import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Gallery-related schemas
export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  mediaUrl: text("media_url").notNull(), // URL to the media file
  thumbnailUrl: text("thumbnail_url"), // Optional thumbnail
  mediaType: text("media_type").notNull(), // image, video
  tags: text("tags").array(), // Array of tags for searching
  dateCreated: timestamp("date_created").defaultNow().notNull(),
  metadata: jsonb("metadata"), // For storing additional data like dimensions, location, etc.
});

export const usersToGalleryItems = pgTable("users_to_gallery_items", {
  userId: integer("user_id").notNull().references(() => users.id),
  galleryItemId: integer("gallery_item_id").notNull().references(() => galleryItems.id),
});

// Relations
export const galleryItemsRelations = relations(galleryItems, ({ many }) => ({
  usersConnection: many(usersToGalleryItems),
}));

export const usersRelations = relations(users, ({ many }) => ({
  galleryItemsConnection: many(usersToGalleryItems),
}));

export const usersToGalleryItemsRelations = relations(usersToGalleryItems, ({ one }) => ({
  user: one(users, {
    fields: [usersToGalleryItems.userId],
    references: [users.id],
  }),
  galleryItem: one(galleryItems, {
    fields: [usersToGalleryItems.galleryItemId],
    references: [galleryItems.id],
  }),
}));

// Insert schemas
export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({
  id: true,
  dateCreated: true,
});

export const insertUsersToGalleryItemsSchema = createInsertSchema(usersToGalleryItems);

// Types
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertUserToGalleryItem = z.infer<typeof insertUsersToGalleryItemsSchema>;
export type UserToGalleryItem = typeof usersToGalleryItems.$inferSelect;
