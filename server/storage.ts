import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  limit, 
  orderBy, 
  startAt 
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  User, 
  InsertUser,
  GalleryItem,
  InsertGalleryItem
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getGalleryItems(limit?: number, offset?: number): Promise<GalleryItem[]>;
  getGalleryItemById(id: string): Promise<GalleryItem | undefined>;
  searchGalleryItems(query: string): Promise<GalleryItem[]>;
  searchGalleryItemsByTags(tags: string[]): Promise<GalleryItem[]>;
  createGalleryItem(galleryItem: InsertGalleryItem): Promise<GalleryItem>;
  linkGalleryItemToUser(userId: string, galleryItemId: string): Promise<void>;
}

export class FirebaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? undefined : querySnapshot.docs[0].data() as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const docRef = await addDoc(collection(db, 'users'), user);
    return { id: docRef.id, ...user } as User;
  }

  async getGalleryItems(limit = 50, offset = 0): Promise<GalleryItem[]> {
    const q = query(
      collection(db, 'gallery'),
      orderBy('dateCreated'),
      limit(limit)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
  }

  async getGalleryItemById(id: string): Promise<GalleryItem | undefined> {
    const docRef = doc(db, 'gallery', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as GalleryItem : undefined;
  }

  async searchGalleryItems(searchQuery: string): Promise<GalleryItem[]> {
    const q = query(
      collection(db, 'gallery'),
      where('title', '>=', searchQuery),
      where('title', '<=', searchQuery + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
  }

  async searchGalleryItemsByTags(tags: string[]): Promise<GalleryItem[]> {
    const q = query(
      collection(db, 'gallery'),
      where('tags', 'array-contains-any', tags)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
  }

  async createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem> {
    const docRef = await addDoc(collection(db, 'gallery'), item);
    return { id: docRef.id, ...item } as GalleryItem;
  }

  async linkGalleryItemToUser(userId: string, galleryItemId: string): Promise<void> {
    await addDoc(collection(db, 'user_gallery_links'), {
      userId,
      galleryItemId,
      dateLinked: new Date()
    });
  }
}

export const storage = new FirebaseStorage();