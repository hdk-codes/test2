import { SanityDocument } from '@sanity/client';
import { PortableTextBlock } from '@portabletext/types';

export interface LoveLetterTheme {
  primaryColor?: string;
  fontFamily?: string;
  animation?: string;
}

// Type for `content` arrays (both in LoveLetter and LetterContent)
export interface ContentImage {
  _type: 'image';
  asset: {
    url: string;
  };
}

export interface ContentAudioMessage {
  _type: 'audioMessage';
  title: string;
  audioFile: {
    asset: {
      url: string;
    };
  };
  caption?: string;
  description?: string;
  duration?: number;
}

type ContentBlock = PortableTextBlock | ContentImage | ContentAudioMessage;

export interface SharedMemory {
  date?: string;
  title: string;
  description: string;
  location?: {
    lat: number;
    lng: number;
  };
  images?: Array<{
    asset?: {
      url: string;
    };
  }>;
}

export interface LetterContent {
  author: 'me' | 'partner';
  content: ContentBlock[];
  mood?: 'romantic' | 'playful' | 'nostalgic' | 'passionate';
  attachments?: Array<{
    _type: 'file' | 'image' | 'songLink';
    asset?: { 
      url: string;
      originalFilename?: string;
      _type?: string;
      _ref?: string;
    };
    platform?: string;
    url?: string;
  }>;
  reactions?: Array<{ emoji: string; timestamp: string }>;
  createdAt: string;
}

export interface LoveLetter extends Partial<SanityDocument> {
  title: string;
  content?: (PortableTextBlock | ContentImage)[];
  theme?: LoveLetterTheme;
  effects?: string[];
  letters?: LetterContent[];
  privacy?: {
    isPrivate: boolean;
    password?: string;
  };
  scheduling?: {
    deliveryDate?: string;
    reminder?: boolean;
  };
  sharedMemories?: SharedMemory[];
  animations?: {
    openingEffect?: 'fold' | 'fade' | 'butterfly' | 'hearts';
    backgroundEffect?: 'particles' | 'petals' | 'stars' | 'none';
  };
  newMessage?: string;
}