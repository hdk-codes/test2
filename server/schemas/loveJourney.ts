export default {
  name: 'loveJourney',
  title: 'Love Journey',
  type: 'document',
  fields: [
    {
      name: 'memories',
      title: 'Memories',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            },
            {
              name: 'date',
              title: 'Date',
              type: 'datetime',
            },
          ],
        },
      ],
    },
    {
      name: 'quotes',
      title: 'Love Quotes',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'specialMoments',
      title: 'Special Moments',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'timeline',
      title: 'Timeline Events',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Event Title',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Event Description',
              type: 'text',
            },
            {
              name: 'date',
              title: 'Event Date',
              type: 'datetime',
            },
            {
              name: 'image',
              title: 'Event Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            },
          ],
        },
      ],
    },
  ],
};
