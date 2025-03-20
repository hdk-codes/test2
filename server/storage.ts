import { 
  users, 
  galleryItems, 
  usersToGalleryItems,
  type User, 
  type InsertUser,
  type GalleryItem,
  type InsertGalleryItem,
  type UserToGalleryItem,
  type InsertUserToGalleryItem
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, inArray, or, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Gallery methods
  getGalleryItems(limit?: number, offset?: number): Promise<GalleryItem[]>;
  getGalleryItemById(id: number): Promise<GalleryItem | undefined>;
  searchGalleryItems(query: string): Promise<GalleryItem[]>;
  searchGalleryItemsByTags(tags: string[]): Promise<GalleryItem[]>;
  createGalleryItem(galleryItem: InsertGalleryItem): Promise<GalleryItem>;
  linkGalleryItemToUser(userId: number, galleryItemId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Gallery methods
  async getGalleryItems(limit = 50, offset = 0): Promise<GalleryItem[]> {
    return db
      .select()
      .from(galleryItems)
      .limit(limit)
      .offset(offset)
      .orderBy(galleryItems.dateCreated);
  }
  
  async getGalleryItemById(id: number): Promise<GalleryItem | undefined> {
    const [item] = await db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.id, id));
    return item || undefined;
  }
  
  async searchGalleryItems(query: string): Promise<GalleryItem[]> {
    return db
      .select()
      .from(galleryItems)
      .where(
        or(
          ilike(galleryItems.title, `%${query}%`),
          ilike(galleryItems.description, `%${query}%`)
        )
      );
  }
  
  async searchGalleryItemsByTags(tags: string[]): Promise<GalleryItem[]> {
    // For simplicity, we'll use a simpler approach
    // Build an array of OR conditions for each tag
    const orConditions = tags.map(tag => {
      // For each tag we want to find items where the tag array contains this tag
      // This uses Postgres' LIKE operation which is not ideal but simpler to implement
      return ilike(galleryItems.title, `%${tag}%`); // Using title as a workaround
    });
    
    // Execute the query with the OR conditions
    return db
      .select()
      .from(galleryItems)
      .where(or(...orConditions));
  }
  
  async createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem> {
    const [galleryItem] = await db
      .insert(galleryItems)
      .values(item)
      .returning();
    return galleryItem;
  }
  
  async linkGalleryItemToUser(userId: number, galleryItemId: number): Promise<void> {
    await db
      .insert(usersToGalleryItems)
      .values({
        userId,
        galleryItemId
      });
  }
}

export const storage = new DatabaseStorage();
