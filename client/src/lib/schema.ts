export interface LandingData {
    title: string;
    message: string;
  }
  
  export interface BirthdayCardData {
    _id?: string;
    _type: 'birthdayCard'; // Make this literal type
    title: string;
    messages: Array<{
      _key: string;
      text: string;
      style?: {
        font?: string;
        color?: string;
        size?: number;
      };
    }>;
    images: Array<{
      _key?: string;
      url?: string;
      alt: string;
      caption?: string;
      asset?: {
        _ref: string;
        _type: 'reference';
        url?: string;
      };
    }>;
    background?: string;
    content?: any[];
  }
  
  export interface LoveLetterData {
    title: string;
    content?: any[];
    theme?: {
      primaryColor?: string;
      fontFamily?: string;
      animation?: string;
    };
    effects?: string[];
    letters?: Array<{
      author: 'me' | 'partner';
      content: any[];
      mood?: 'romantic' | 'playful' | 'nostalgic' | 'passionate';
      attachments?: Array<{
        _type: 'file' | 'image' | 'songLink' | 'audioMessage';
        asset?: { url: string; originalFilename?: string };
        platform?: string;
        url?: string;
        title?: string; // For audioMessage
        audioFile?: { asset?: { url: string } };
        caption?: string;
        duration?: number;
      }>;
      reactions?: Array<{ emoji: string; timestamp: string }>;
      createdAt: string;
    }>;
    privacy?: {
      isPrivate: boolean;
      password?: string;
    };
    scheduling?: {
      deliveryDate?: string;
      reminder?: boolean;
    };
    sharedMemories?: Array<{
      date?: string;
      title: string;
      description: string;
      location?: { lat: number; lng: number };
      images?: Array<{ url: string }>;
    }>;
    animations?: {
      openingEffect?: 'fold' | 'fade' | 'butterfly' | 'hearts';
      backgroundEffect?: 'particles' | 'petals' | 'stars' | 'none';
    };
  }

import { defineField, defineType } from "sanity";

// Add missing interface for better TypeScript support


// Updated audio type definition
export const audioType = defineType({
  name: 'audioMessage',
  title: 'Audio Message',
  type: 'object', // Changed from 'file' to 'object'
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'audioFile',
      title: 'Audio File',
      type: 'file',
      options: {
        storeOriginalFilename: true,
        accept: 'audio/*'
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      validation: (Rule) => Rule.min(0)
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'caption',
      media: 'audioFile'
    }
  }
});

export const landingSchema = defineType({
  name: "landing",
  title: "Landing",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
    }),
  ],
});

export const birthdayCardSchema = defineType({
  name: "birthdayCard",
  title: "Birthday Card",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Card Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "messages",
      title: "Messages",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "text",
              title: "Message Text",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "style",
              title: "Text Style",
              type: "object",
              fields: [
                {
                  name: "font",
                  title: "Font",
                  type: "string",
                  options: {
                    list: [
                      { title: 'Dancing Script', value: 'Dancing Script' },
                      { title: 'Lobster', value: 'Lobster' },
                      { title: 'Pacifico', value: 'Pacifico' },
                      { title: 'Arial', value: 'Arial' },
                      { title: 'Montserrat', value: 'Montserrat' },
                      { title: 'Playfair Display', value: 'Playfair Display' },
                    ]
                  },
                },
                {
                  name: "color",
                  title: "Color",
                  type: "string",
                  options: {
                    list: [
                      { title: 'Red', value: '#FF6F61' },
                      { title: 'Pink', value: '#FFB6C1' },
                      { title: 'Yellow', value: '#FFD700' },
                      { title: 'Lavender', value: '#E6E6FA' },
                      { title: 'Purple', value: '#9370DB' },
                      { title: 'Teal', value: '#20B2AA' },
                    ]
                  },
                },
                {
                  name: "size",
                  title: "Size",
                  type: "number",
                  options: {
                    range: {
                      min: 12,
                      max: 36,
                      step: 1,
                    }
                  }
                },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
          options: {
            hotspot: true, // Enable hotspot for better image cropping
          },
        },
      ],
    }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      description: "URL for image or hex code for color",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: 'block' }],
      description: "Main content of the card (optional)",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      readOnly: true,
    }),
  ],
});


export const loveLetterSchema = defineType({
  name: "loveLetter",
  title: "Love Letter",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Love Quote", value: "loveQuote" },
            { title: "Memory", value: "memory" }
          ],
          marks: {
            decorators: [
              { title: "Heart", value: "heart" },
              { title: "Sparkle", value: "sparkle" }
            ],
          }
        },
        {
          type: "image",
          options: { hotspot: true }
        }
      ]
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "object",
      fields: [
        { name: "primaryColor", type: "string" },
        { name: "fontFamily", type: "string" },
        { name: "animation", type: "string" }
      ]
    }),
    defineField({
      name: "effects",
      title: "Special Effects",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Floating Hearts", value: "hearts" },
          { title: "Sparkles", value: "sparkles" },
          { title: "Glowing Text", value: "glow" }
        ]
      }
    }),
    defineField({
      name: "letters",
      title: "Letters Exchange",
      type: "array",
      of: [{
        type: "object",
        fields: [
          {
            name: "author",
            type: "string",
            options: {
              list: ["me", "partner"]
            }
          },
          {
            name: "content",
            type: "array",
            of: [
              {
                type: "block",
                styles: [
                  { title: "Normal", value: "normal" },
                  { title: "Love Quote", value: "loveQuote" },
                  { title: "Memory", value: "memory" },
                  { title: "Poetry", value: "poetry" },
                  { title: "Song Lyrics", value: "lyrics" }
                ],
                marks: {
                  decorators: [
                    { title: "Heart", value: "heart" },
                    { title: "Sparkle", value: "sparkle" },
                    { title: "Kiss", value: "kiss" },
                    { title: "Highlight", value: "highlight" }
                  ],
                }
              },
              {
                type: "image",
                options: { hotspot: true }
              },
              {
                type: 'audioMessage', // Direct reference to audioType
                title: 'Voice Message'
              }
            ]
          },
          {
            name: "mood",
            type: "string",
            options: {
              list: ["romantic", "playful", "nostalgic", "passionate"]
            }
          },
          {
            name: "attachments",
            type: "array",
            of: [
              { type: "file" },
              { type: "image" },
              {
                type: "object",
                name: "songLink",
                fields: [
                  { name: "platform", type: "string" },
                  { name: "url", type: "url" }
                ]
              }
            ]
          },
          {
            name: "reactions",
            type: "array",
            of: [
              {
                type: "object",
                fields: [
                  { name: "emoji", type: "string" },
                  { name: "timestamp", type: "datetime" }
                ]
              }
            ]
          },
          {
            name: "createdAt",
            type: "datetime",
            options: { dateFormat: "YYYY-MM-DD" }
          }
        ]
      }]
    }),
    // Add new fields for enhanced functionality
    defineField({
      name: "privacy",
      title: "Privacy Settings",
      type: "object",
      fields: [
        {
          name: "isPrivate",
          title: "Private Letter",
          type: "boolean",
          description: "Only visible to sender and recipient"
        },
        {
          name: "password",
          title: "Access Password",
          type: "string",
          hidden: ({ parent }) => !parent?.isPrivate
        }
      ]
    }),
    defineField({
      name: "scheduling",
      title: "Letter Scheduling",
      type: "object",
      fields: [
        {
          name: "deliveryDate",
          title: "Scheduled Delivery",
          type: "datetime",
          options: {
            dateFormat: "YYYY-MM-DD",
            timeFormat: "HH:mm",
            timeStep: 15
          }
        },
        {
          name: "reminder",
          title: "Send Reminder",
          type: "boolean"
        }
      ]
    }),
    defineField({
      name: "sharedMemories",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "date", type: "date" },
          { name: "title", type: "string" },
          { name: "description", type: "text" },
          { name: "location", type: "geopoint" },
          { name: "images", type: "array", of: [{ type: "image" }] }
        ]
      }]
    }),
    defineField({
      name: "animations",
      type: "object",
      fields: [
        {
          name: "openingEffect",
          type: "string",
          options: {
            list: ["fold", "fade", "butterfly", "hearts"]
          }
        },
        {
          name: "backgroundEffect",
          type: "string",
          options: {
            list: ["particles", "petals", "stars", "none"]
          }
        }
      ]
    })
  ]
});


// Fix card data creation
const newCard: BirthdayCardData = {
  _type: 'birthdayCard',
  title: 'Happy Birthday, my love! 🎉💕',
  messages: [],
  images: [],
  content: []
};

// Remove reference to undefined cardData
const createNewCard = (data: Partial<BirthdayCardData>): BirthdayCardData => ({
  _type: "birthdayCard",
  title: data.title || 'Happy Birthday, my love! 🎉💕',
  messages: data.messages || [],
  images: data.images || [],
  background: data.background,
  content: data.content || []
});

// Export all schemas
export const schemaTypes = [landingSchema, birthdayCardSchema, loveLetterSchema, audioType];

