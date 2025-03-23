import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2021-03-25',
});

export async function fetchLoveLetterContent() {
  return client.fetch(`
    *[_type == "loveLetter"][0] {
      title,
      placeholder,
      // Add more fields as needed
    }
  `);
}

export async function fetchLetterContent() {
  try {
    const result = await client.fetch(`
      *[_type == "loveLetter"][0] {
        title,
        letters[] {
          author,
          content[] {
            ...,
            _type,
            style,
            marks,
            children[] {
              ...,
              text,
              marks
            }
          },
          mood,
          attachments[] {
            ...,
            "fileUrl": file.asset->url,
            "imageUrl": image.asset->url
          },
          reactions,
          createdAt
        },
        sharedMemories[] {
          date,
          title,
          description,
          location,
          "images": images[].asset->url
        },
        animations
      }
    `);
    
    if (!result) throw new Error('No content found');
    
    return {
      ...result,
      content: result.content?.map((block: any) => ({
        ...block,
        _type: block._type || 'block',
        style: block.style || 'normal',
        children: block.children?.map((child: any) => ({
          ...child,
          _type: child._type || 'span',
          text: child.text || '',
          marks: child.marks || []
        })) || []
      })) || []
    };
  } catch (error) {
    console.error('Error fetching letter content:', error);
    return {
      title: 'My Dearest Love',
      content: [{
        _type: 'block',
        style: 'normal',
        _key: 'default',
        children: [{
          _type: 'span',
          text: 'Your love letter content here...',
          marks: [],
          _key: 'default_child'
        }]
      }]
    };
  }
}

export async function updateLoveLetterContent(data: any) {
  return client.patch(data._id)
    .set(data)
    .commit();
}

export async function addLetterResponse(letterId: string, response: any) {
  return client.patch(letterId)
    .setIfMissing({ letters: [] })
    .append('letters', [response])
    .commit();
}

export async function addReaction(letterId: string, letterIndex: number, reaction: string) {
  return client.patch(letterId)
    .setIfMissing({ [`letters[${letterIndex}].reactions`]: [] })
    .append(`letters[${letterIndex}].reactions`, [
      { emoji: reaction, timestamp: new Date().toISOString() }
    ])
    .commit();
}

export const loveLetterAPI = {
  getAll: async () => {
    try {
      const result = await client.fetch(`
        *[_type == "loveLetter"][0] {
          _id,
          title,
          content[] {
            ...,
            _type,
            style,
            _key,
            children[] {
              ...,
              _type,
              _key,
              text,
              marks[]
            }
          },
          effects,
          letters[] {
            ...,
            _key,
            content[] {
              ...,
              _type,
              style,
              _key
            }
          },
          theme,
          animations
        }
      `);

      if (!result) {
        return {
          _id: 'default',
          title: 'My Dearest Love',
          content: [{
            _type: 'block',
            style: 'normal',
            _key: 'default',
            children: [{
              _type: 'span',
              text: 'Your precious love letter awaits...',
              _key: 'default_child',
              marks: []
            }]
          }],
          effects: ['hearts', 'sparkles'],
          letters: [],
          theme: { primaryColor: '#FFB6C1', fontFamily: 'Dancing Script' },
          animations: { openingEffect: 'butterfly', backgroundEffect: 'petals' }
        };
      }

      return result;
    } catch (error) {
      console.error('Error fetching love letter:', error);
      throw error;
    }
  },

  create: async (data: any) => {
    return client.create({
      _type: 'loveLetter',
      ...data,
      createdAt: new Date().toISOString()
    });
  },

  update: async (id: string, data: any) => {
    return client.patch(id)
      .set(data)
      .commit();
  },

  delete: async (id: string) => {
    return client.delete(id);
  },

  addResponse: async (letterId: string, response: any) => {
    return client.patch(letterId)
      .setIfMissing({ letters: [] })
      .append('letters', [{ 
        ...response, 
        _key: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }])
      .commit();
  },

  addMemory: async (letterId: string, memory: any) => {
    return client.patch(letterId)
      .setIfMissing({ sharedMemories: [] })
      .append('sharedMemories', [memory])
      .commit();
  }
};

// Add more API functions for other sections
