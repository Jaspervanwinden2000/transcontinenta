import { NextRequest } from 'next/server';
import { streamChat } from '@/lib/claude';
import { buildSystemPrompt } from '@/lib/systemPrompt';
import { createConversation, addMessage, getConversation, updateConversationTitle } from '@/lib/conversations';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, conversationId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const convId = conversationId || uuidv4();
    const existingConv = getConversation(convId);

    if (!existingConv) {
      const firstUserMessage = messages.find((m: { role: string; content: string }) => m.role === 'user');
      const title = firstUserMessage
        ? firstUserMessage.content.substring(0, 60) + (firstUserMessage.content.length > 60 ? '...' : '')
        : 'Nieuw gesprek';
      createConversation(convId, title);
    }

    const lastUserMessage = [...messages].reverse().find((m: { role: string; content: string }) => m.role === 'user');
    if (lastUserMessage) {
      addMessage(convId, {
        id: uuidv4(),
        role: 'user',
        content: lastUserMessage.content,
      });
    }

    const systemPrompt = buildSystemPrompt();
    const stream = await streamChat(messages, systemPrompt);

    const [streamForResponse, streamForSaving] = stream.tee();

    (async () => {
      const decoder = new TextDecoder();
      let fullResponse = '';
      const reader = streamForSaving.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
        }
        fullResponse += decoder.decode();

        if (fullResponse) {
          addMessage(convId, {
            id: uuidv4(),
            role: 'assistant',
            content: fullResponse,
          });

          const conv = getConversation(convId);
          if (conv && conv.title === 'Nieuw gesprek' && conv.message_count <= 2) {
            const firstUserMsg = messages.find((m: { role: string; content: string }) => m.role === 'user');
            if (firstUserMsg) {
              updateConversationTitle(convId, firstUserMsg.content.substring(0, 60));
            }
          }
        }
      } catch {
        // Ignore save errors
      }
    })();

    return new Response(streamForResponse, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Conversation-Id': convId,
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
