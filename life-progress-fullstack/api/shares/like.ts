import { promises as fs } from 'fs';
import path from 'path';

// 内存存储：模块级全局变量，首次请求时从 data 目录加载初始数据
let data: any[] | null = null;

async function ensureData() {
  if (data !== null) return data;
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'shares.json'), 'utf-8');
    data = JSON.parse(raw);
  } catch {
    data = [];
  }
  return data;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const body = req.body;
    const { shareId } = body;

    if (!shareId) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(400).json({ error: '缺少 shareId' });
      return;
    }

    const items = await ensureData();
    const share = items.find((item: any) => item.id === shareId);

    if (!share) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(404).json({ error: '分享不存在' });
      return;
    }

    share.likes = (share.likes || 0) + 1;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ likes: share.likes });
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(405).json({ error: 'Method not allowed' });
  }
}
