export type MediaType = 'image' | 'video';

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  mediaUrl: string;
  mediaType: MediaType;
  date: string; // ISO string
}