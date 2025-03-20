
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc,
  query, 
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { GalleryItem } from '@shared/schema';

export interface IStorage {
  getUser(id: string): Promise<any>;
  createUser(user: any): Promise<any>;
  getGalleryItems(limit?: number): Promise<GalleryItem[]>;
  getGalleryItemById(id: string): Promise<GalleryItem | null>;
  searchGalleryItems(query: string): Promise<GalleryItem[]>;
  searchGalleryItemsByTags(tags: string[]): Promise<GalleryItem[]>;
  createGalleryItem(item: Omit<GalleryItem, 'id' | 'dateCreated'>): Promise<GalleryItem>;
  linkGalleryItemToUser(userId: string, galleryItemId: string): Promise<void>;
}

export class FirebaseStorage implements IStorage {
  private readonly GALLERY_COLLECTION = 'gallery';
  private readonly USERS_COLLECTION = 'users';
  private readonly USER_LINKS_COLLECTION = 'user_gallery_links';

  async getUser(id: string) {
    const docRef = doc(db, this.USERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async createUser(user: any) {
    const docRef = await addDoc(collection(db, this.USERS_COLLECTION), user);
    return { id: docRef.id, ...user };
  }

  async getGalleryItems(itemLimit = 50): Promise<GalleryItem[]> {
    const q = query(
      collection(db, this.GALLERY_COLLECTION),
      orderBy('dateCreated', 'desc'),
      limit(itemLimit)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: (doc.data().dateCreated as Timestamp).toDate()
    })) as GalleryItem[];
  }

  async getGalleryItemById(id: string): Promise<GalleryItem | null> {
    const docRef = doc(db, this.GALLERY_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
      dateCreated: (docSnap.data().dateCreated as Timestamp).toDate()
    } as GalleryItem;
  }

  async searchGalleryItems(searchQuery: string): Promise<GalleryItem[]> {
    const q = query(
      collection(db, this.GALLERY_COLLECTION),
      where('title', '>=', searchQuery.toLowerCase()),
      where('title', '<=', searchQuery.toLowerCase() + '\uf8ff'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: (doc.data().dateCreated as Timestamp).toDate()
    })) as GalleryItem[];
  }

  async searchGalleryItemsByTags(tags: string[]): Promise<GalleryItem[]> {
    const q = query(
      collection(db, this.GALLERY_COLLECTION),
      where('tags', 'array-contains-any', tags),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: (doc.data().dateCreated as Timestamp).toDate()
    })) as GalleryItem[];
  }

  async createGalleryItem(item: Omit<GalleryItem, 'id' | 'dateCreated'>): Promise<GalleryItem> {
    const docRef = await addDoc(collection(db, this.GALLERY_COLLECTION), {
      ...item,
      dateCreated: Timestamp.now()
    });
    return {
      id: docRef.id,
      ...item,
      dateCreated: new Date()
    };
  }

  async linkGalleryItemToUser(userId: string, galleryItemId: string): Promise<void> {
    await addDoc(collection(db, this.USER_LINKS_COLLECTION), {
      userId,
      galleryItemId,
      dateLinked: Timestamp.now()
    });
  }
}

export const storage = new FirebaseStorage();
