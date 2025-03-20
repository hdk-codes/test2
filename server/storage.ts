
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where,
  orderBy,
  limitToLast
} from 'firebase/firestore';
import { db } from './firebase';

export interface IStorage {
  getUser(id: string): Promise<any>;
  createUser(user: any): Promise<any>;
  getGalleryItems(limit?: number): Promise<any[]>;
  getGalleryItemById(id: string): Promise<any>;
  searchGalleryItems(query: string): Promise<any[]>;
  searchGalleryItemsByTags(tags: string[]): Promise<any[]>;
  createGalleryItem(item: any): Promise<any>;
  linkGalleryItemToUser(userId: string, galleryItemId: string): Promise<void>;
}

export class FirebaseStorage implements IStorage {
  async getUser(id: string) {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : undefined;
  }

  async createUser(user: any) {
    const docRef = await addDoc(collection(db, 'users'), user);
    return { id: docRef.id, ...user };
  }

  async getGalleryItems(limitCount = 50) {
    const q = query(
      collection(db, 'gallery'),
      orderBy('dateCreated', 'desc'),
      limitToLast(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getGalleryItemById(id: string) {
    const docRef = doc(db, 'gallery', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : undefined;
  }

  async searchGalleryItems(searchQuery: string) {
    const q = query(
      collection(db, 'gallery'),
      where('title', '>=', searchQuery),
      where('title', '<=', searchQuery + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async searchGalleryItemsByTags(tags: string[]) {
    const q = query(
      collection(db, 'gallery'),
      where('tags', 'array-contains-any', tags)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createGalleryItem(item: any) {
    const docRef = await addDoc(collection(db, 'gallery'), {
      ...item,
      dateCreated: new Date()
    });
    return { id: docRef.id, ...item };
  }

  async linkGalleryItemToUser(userId: string, galleryItemId: string) {
    await addDoc(collection(db, 'user_gallery_links'), {
      userId,
      galleryItemId,
      dateLinked: new Date()
    });
  }
}

export const storage = new FirebaseStorage();
