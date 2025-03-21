import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityClient } from '@sanity/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
const config = {
  projectId: 'grt0al70', // From Sanity Dashboard
  dataset: 'production',
  apiVersion: '2025-03-20', // Lock to today’s date for latest features
  token: 'skJhuNd6Fcl0iJJyBiSxn8jz0hwrPjVEjtVLIh6tkrfKrUZIr8N3tmdVDMXozepcOkKQ5BYpULt2ZIc7vxwjjS9Gduo3M2W8kBKGaUfYYY6AJlRfyFnTPZjgASvP4wgF9Km2UxThEFUHrzctsa3ubL8RbWfDXVZWsfeNwq61PguMj6wsH2py', // Editor token with write access
  useCdn: false, // CDN for faster reads; set false for real-time
};
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