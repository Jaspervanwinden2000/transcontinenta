import { NextRequest } from 'next/server';
import { listConversations, getStats, getDailyStats, getTotalMessages } from '@/lib/conversations';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Bearer ', '');
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'stats') {
    const stats = getStats();
    const totalMessages = getTotalMessages();
    return Response.json({ ...stats, totalMessages });
  }

  if (action === 'daily') {
    const daily = getDailyStats(7);
    return Response.json(daily);
  }

  if (action === 'knowledge') {
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));
    const fileData = files.map(file => {
      const content = fs.readFileSync(path.join(knowledgeDir, file), 'utf-8');
      return { name: file, content, size: content.length };
    });
    return Response.json(fileData);
  }

  const conversations = listConversations(100);
  return Response.json(conversations);
}
