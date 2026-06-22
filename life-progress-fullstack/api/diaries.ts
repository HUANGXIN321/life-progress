import { promises as fs } from 'fs';
import path from 'path';

let data: any[] | null = null;

async function ensureData() {
  if (data !== null) return data;
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'diaries.json'), 'utf-8');
    data = JSON.parse(raw);
  } catch {
    data = [];
  }
  return data;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const items = await ensureData();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(items);
  } else if (req.method === 'POST') {
    const body = req.body;
    const items = await ensureData();
    const newItem = {
      id: Date.now().toString(),
      userId: body.userId || '',
      title: body.title || '',
      content: body.content || '',
      mood: body.mood || 'happy',
      date: body.date || new Date().toISOString().split('T')[0],
      images: body.images || [],
      videos: body.videos || [],
      audios: body.audios || [],
      createdAt: new Date().toISOString()
    };
    items.push(newItem);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(201).json(newItem);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(405).json({ error: 'Method not allowed' });
  }
}
