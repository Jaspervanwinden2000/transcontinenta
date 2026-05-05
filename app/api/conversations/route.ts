import { NextRequest } from 'next/server';
import { listConversations, getConversation } from '@/lib/conversations';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const conv = getConversation(id);
    if (!conv) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return Response.json(conv);
  }

  const conversations = listConversations();
  return Response.json(conversations);
}
