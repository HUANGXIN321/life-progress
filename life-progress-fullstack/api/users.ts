import { promises as fs } from 'fs';
import path from 'path';

// 内存存储：模块级全局变量，首次请求时从 data 目录加载初始数据
let data: any[] | null = null;

async function ensureData() {
  if (data !== null) return data;
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'users.json'), 'utf-8');
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
    const { id, username, nickname, avatar } = body;

    if (!id) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(400).json({ error: '缺少用户 id' });
      return;
    }

    const items = await ensureData();
    const existingUser = items.find((item: any) => item.id === id);

    if (existingUser) {
      // 更新已有用户的 nickname 和 avatar
      if (nickname !== undefined) existingUser.nickname = nickname;
      if (avatar !== undefined) existingUser.avatar = avatar;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json(existingUser);
      return;
    }

    // 新增用户
    const newUser = {
      id,
      username: username || '',
      nickname: nickname || '用户',
      avatar: avatar || '',
      createdAt: new Date().toISOString()
    };
    items.push(newUser);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(201).json(newUser);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(405).json({ error: 'Method not allowed' });
  }
}
