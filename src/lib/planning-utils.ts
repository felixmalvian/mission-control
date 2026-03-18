import { getOpenClawClient } from './openclaw/client';

// Maximum input length for extractJSON to prevent ReDoS attacks
const MAX_EXTRACT_JSON_LENGTH = 1_000_000; // 1MB

/**
 * Extract JSON from a response that might have markdown code blocks or surrounding text.
 * Handles various formats:
 * - Direct JSON
 * - Markdown code blocks (```json ... ``` or ``` ... ```)
 * - JSON embedded in text (first { to last })
 */
export function extractJSON(text: string): object | null {
  // Security: Prevent ReDoS on massive inputs
  if (text.length > MAX_EXTRACT_JSON_LENGTH) {
    console.warn('[Planning Utils] Input exceeds maximum length for JSON extraction:', text.length);
    return null;
  }

  // First, try direct parse
  try {
    return JSON.parse(text.trim());
  } catch {
    // Continue to other methods
  }

  // Try to extract from markdown code block (```json ... ``` or ``` ... ```)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue
    }
  }

  // Try to find JSON object in the text (first { to last })
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {
      // Continue
    }
  }

  return null;
}

/**
 * Get messages from OpenClaw API for a given session.
 * Returns assistant messages with text content extracted.
 */
export async function getMessagesFromOpenClaw(
  sessionKey: string
): Promise<Array<{ role: string; content: string }>> {
  try {
    console.log('[Planning Utils] Fetching messages for session:', sessionKey);
    const client = getOpenClawClient();
    if (!client.isConnected()) {
      console.log('[Planning Utils] Connecting to OpenClaw...');
      await client.connect();
    }

    // Use chat.history API to get session messages
    const result = await client.call<{
      messages: Array<{
        role: string;
        content: Array<{ type: string; text?: string }>;
      }>;
    }>('chat.history', {
      sessionKey,
      limit: 50,
    });

    console.log('[Planning Utils] chat.history returned', result.messages?.length || 0, 'messages');

    const messages: Array<{ role: string; content: string }> = [];

    for (const msg of result.messages || []) {
      console.log('[Planning Utils] Processing message, role:', msg.role, 'content type:', typeof msg.content, 'isArray:', Array.isArray(msg.content));
      if (msg.role === 'assistant') {
        // Handle different content formats
        let text = '';
        if (Array.isArray(msg.content)) {
          const textContent = msg.content.find((c) => c.type === 'text');
          text = textContent?.text || '';
        } else if (typeof msg.content === 'string') {
          text = msg.content;
        }
        
        if (text.trim().length > 0) {
          console.log('[Planning Utils] Found assistant message, length:', text.length);
          messages.push({
            role: 'assistant',
            content: text,
          });
        } else {
          console.log('[Planning Utils] Assistant message has no text content');
        }
      }
    }

    console.log('[Planning Utils] Returning', messages.length, 'assistant messages');
    return messages;
  } catch (err) {
    console.error('[Planning Utils] Failed to get messages from OpenClaw:', err);
    return [];
  }
}
