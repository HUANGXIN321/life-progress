import { promises as fs } from 'fs';
import path from 'path';

// 内存存储：模块级全局变量，首次请求时从 data 目录加载初始数据
let data: any[] | null = null;

async function ensureData() {
  if (data !== null) return data;
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'confessions.json'), 'utf-8');
    data = JSON.parse(raw);
  } catch {
    data = [];
  }
  return data;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const body = req.body;
    const { confessionId, userId, nickname, content } = body;

    if (!confessionId || !content) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(400).json({ error: '缺少必要参数 confessionId 或 content' });
      return;
    }

    const items = await ensureData();
    const confession = items.find((item: any) => item.id === confessionId);

    if (!confession) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(404).json({ error: '倾诉不存在' });
      return;
    }

    const newResponse = {
      id: Date.now().toString(),
      userId: userId || '',
      nickname: nickname || '用户',
      content: content,
      createdAt: new Date().toISOString()
    };

    if (!confession.responses) confession.responses = [];
    confession.responses.push(newResponse);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(201).json(newResponse);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(405).json({ error: 'Method not allowed' });
  }
}
