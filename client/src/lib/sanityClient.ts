import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityClient } from '@sanity/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
const config = {
    apiVersion: '2021-03-25', // Use the latest API version
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET,
    token: import.meta.env.VITE_SANITY_TOKEN, // Optional, for authenticated requests
    useCdn: true, // Faster, cached responses
}
export const client: SanityClient = createClient(config);

export const { projectId, dataset } = config; // Export for use elsewhere

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource): string {
  return builder.image(source).url();
}

// Helper to get file URL (for videos)
export function getFileUrl(assetRef: string, projectId: string, dataset: string): string {
  const [_, assetId, extension] = assetRef.split('-');
  const baseUrl = config.useCdn
    ? `https://cdn.sanity.io/files/${projectId}/${dataset}`
    : `https://${projectId}.api.sanity.io/v${config.apiVersion}/files/${dataset}`;
  return `${baseUrl}/${assetId}.${extension}`;
}

// TypeScript interface for GalleryItem
export interface GalleryItem {
    _id: string;
    title: string;
    description?: string;
    tags?: string[];
    date?: string;
    media?: {
      _type: 'file';
      asset: {
        _ref: string;
        _type: 'reference';
      };
      alt?: string;
    };
    mediaType: 'image' | 'video';
    isFavorite?: boolean;
    reactions?: { emoji: string; count: number }[];
    location?: { lat: number; lng: number };
    loveNote?: string;
    views?: number;
    category?: 'milestone' | 'everyday' | 'travel' | 'surprise';
    sharedWith?: string[];
  }