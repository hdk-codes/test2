// pages/api/sanity.ts (Next.js example)
import { createClient } from '@sanity/client';
import type { NextApiRequest, NextApiResponse } from 'next';


const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.body;
  try {
    const data = await client.fetch(query);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}