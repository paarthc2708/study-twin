import type { ChatMessage, ChatSession } from '../types/domain';

// Mock data shaped after the `ai_chat_sessions` / `ai_chat_messages` Supabase
// tables. Swap generateAssistantReply() for a real model call once that
// integration exists.
export function getChatSessions(): ChatSession[] {
  return [
    { id: 's1', title: 'Quantum Physics help', updatedAt: 'Explaining wave-particle duality...' },
    { id: 's2', title: 'Macroeconomics summary', updatedAt: 'Chapter 4: Fiscal Policy effects...' },
    { id: 's3', title: 'European History 101', updatedAt: 'The French Revolution timeline...' },
    { id: 's4', title: 'React Hooks Deep Dive', updatedAt: 'useEffect vs useLayoutEffect...' },
  ];
}

export function getInitialMessages(): ChatMessage[] {
  return [
    {
      id: 'm1',
      role: 'assistant',
      content:
        "Hello Alex! I've loaded your context for Quantum Physics. What specific area should we focus on? Wave-particle duality is mastered, the Schrödinger Equation needs review, and Heisenberg Uncertainty is unexplored. Would you like me to explain the Schrödinger Equation in simple terms?",
      timestamp: 'Just now',
    },
  ];
}

const CANNED_REPLIES = [
  "Good question — let's break that down step by step. First, think about what you already know about this topic.",
  "Here's a simple way to picture it: imagine the concept as a small system with just a few moving parts.",
  "That connects to what we covered earlier. Want me to generate a quick 3-question check to see if it's clicking?",
];

export function generateAssistantReply(userMessage: string): string {
  const index = userMessage.length % CANNED_REPLIES.length;
  return CANNED_REPLIES[index];
}
