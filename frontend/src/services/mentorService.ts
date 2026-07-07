import { supabase } from '../lib/supabaseClient';
import { getMentorReply, type ChatHistoryEntry } from './aiService';
import type { ChatMessage, ChatSession } from '../types/domain';

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .select('id, title, preview, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as { id: string; title: string; preview: string | null; updated_at: string }[]).map((row) => ({
    id: row.id,
    title: row.title,
    updatedAt: row.preview ?? 'No messages yet',
  }));
}

export async function createSession(userId: string): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .insert({ user_id: userId, title: 'New Session' })
    .select('id, title')
    .single();
  if (error) throw error;
  return { id: data.id, title: data.title, updatedAt: 'No messages yet' };
}

export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .select('id, role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as { id: string; role: 'user' | 'assistant'; content: string; created_at: string }[]).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: formatTimestamp(row.created_at),
  }));
}

export async function sendMessage(
  sessionId: string,
  content: string,
  history: ChatHistoryEntry[],
  twinEnabled: boolean,
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage | null }> {
  const now = new Date().toISOString();
  const { data: userRow, error: userError } = await supabase
    .from('ai_chat_messages')
    .insert({ session_id: sessionId, role: 'user', content })
    .select('id, created_at')
    .single();
  if (userError) throw userError;

  const userMessage: ChatMessage = { id: userRow.id, role: 'user', content, timestamp: formatTimestamp(userRow.created_at) };

  await supabase
    .from('ai_chat_sessions')
    .update({ preview: content.slice(0, 120), updated_at: now })
    .eq('id', sessionId);

  if (!twinEnabled) {
    return { userMessage, assistantMessage: null };
  }

  const reply = await getMentorReply(content, history);
  const { data: assistantRow, error: assistantError } = await supabase
    .from('ai_chat_messages')
    .insert({ session_id: sessionId, role: 'assistant', content: reply })
    .select('id, created_at')
    .single();
  if (assistantError) throw assistantError;

  const assistantMessage: ChatMessage = {
    id: assistantRow.id,
    role: 'assistant',
    content: reply,
    timestamp: formatTimestamp(assistantRow.created_at),
  };

  return { userMessage, assistantMessage };
}
