import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityClient } from '@sanity/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { z } from 'zod';

const configSchema = z.object({
  projectId: z.string(),
  dataset: z.string(),
  apiVersion: z.string(),
  useCdn: z.boolean(),
});

const config = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'fallback-id',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
  token: import.meta.env.VITE_SANITY_API_TOKEN,
};

// Temporary auth token management
const TEMP_AUTH_KEY = 'skJhuNd6Fcl0iJJyBiSxn8jz0hwrPjVEjtVLIh6tkrfKrUZIr8N3tmdVDMXozepcOkKQ5BYpULt2ZIc7vxwjjS9Gduo3M2W8kBKGaUfYYY6AJlRfyFnTPZjgASvP4wgF9Km2UxThEFUHrzctsa3ubL8RbWfDXVZWsfeNwq61PguMj6wsH2py';

export const getTempAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TEMP_AUTH_KEY);
};

export const setTempAuthToken = (token: string) => {
  localStorage.setItem(TEMP_AUTH_KEY, token);
};

export const client: SanityClient = createClient(configSchema.parse(config));

export const { projectId, dataset } = config; // Export for use elsewhere

const builder = imageUrlBuilder(client);

export const urlForImage = (source: SanityImageSource) => {
  if (!source) return null;
  return builder.image(source).url();
};

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

export const getClient = (usePreview = false) => usePreview ? previewClient : client;
