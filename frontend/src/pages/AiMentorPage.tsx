import { useState, type KeyboardEvent } from 'react';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { getChatSessions, getInitialMessages, generateAssistantReply } from '../services/mentorService';
import type { ChatMessage } from '../types/domain';

const QUICK_ACTIONS = [
  { label: 'Explain', icon: 'menu_book', colorClass: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white' },
  { label: 'Summarize', icon: 'short_text', colorClass: 'bg-tertiary/10 text-tertiary border-tertiary/20 hover:bg-tertiary hover:text-white' },
  { label: 'Generate Quiz', icon: 'assignment', colorClass: 'bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20 hover:bg-on-surface-variant hover:text-white' },
  { label: 'Flashcards', icon: 'style', colorClass: 'bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20 hover:bg-on-surface-variant hover:text-white' },
];

const SUGGESTIONS = [
  { title: 'Concept Check', prompt: 'Help me study for my Biology exam tomorrow' },
  { title: 'Document Analysis', prompt: 'Summarize this PDF and highlight key terms' },
  { title: 'Active Recall', prompt: 'Generate a quiz based on my lecture notes' },
  { title: 'Quick Ref', prompt: 'Create 10 flashcards for Organic Chemistry' },
];

export function AiMentorPage() {
  const [sessions] = useState(() => getChatSessions());
  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id);
  const [messages, setMessages] = useState<ChatMessage[]>(() => getInitialMessages());
  const [draft, setDraft] = useState('');
  const [twinEnabled, setTwinEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsThinking(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: generateAssistantReply(text),
          timestamp: 'Just now',
        },
      ]);
      setIsThinking(false);
    }, 600);
  }

  function handleKeyPress(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') sendMessage();
  }

  function handleNewSession() {
    setMessages(getInitialMessages());
    setDraft('');
  }

  return (
    <div className="flex flex-1 min-h-0 bg-surface relative">
      <div className="ai-glow absolute top-0 left-1/4" />
      <div className="ai-glow absolute bottom-0 right-1/4" />

      <section className="w-80 flex flex-col border-r border-outline-variant/30 bg-surface-container-low/40 backdrop-blur-sm z-10">
        <div className="p-lg">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-sm py-md px-lg bg-primary-container text-on-primary-container rounded-xl font-label-sm text-label-sm hover:opacity-90 transition-all shadow-sm"
          >
            <MaterialIcon name="add" />
            New Session
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-md space-y-md pb-lg">
          <p className="px-sm font-label-sm text-label-sm text-outline uppercase tracking-wider text-[10px]">Recent Learning</p>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`p-md rounded-lg cursor-pointer transition-all ${
                session.id === activeSessionId ? 'bg-white/60 border border-white/50 shadow-sm' : 'hover:bg-white/40'
              }`}
            >
              <div className="flex items-center gap-sm mb-xs">
                <MaterialIcon name="science" className="text-[18px] text-primary" />
                <p className="font-label-sm text-label-sm font-semibold truncate">{session.title}</p>
              </div>
              <p className="text-[12px] text-on-surface-variant line-clamp-1">{session.updatedAt}</p>
            </div>
          ))}
        </div>
        <div className="p-lg bg-surface-container-low">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-label-sm">Usage</span>
            <span className="text-[11px]">85%</span>
          </div>
          <div className="w-full h-1 bg-outline-variant/30 rounded-full mt-sm overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '85%' }} />
          </div>
          <p className="text-[10px] text-center mt-md text-on-surface-variant">Upgrade for unlimited AI insights</p>
        </div>
      </section>

      <section className="flex-1 flex flex-col h-full relative min-w-0">
        <header className="h-16 flex items-center justify-between px-xl bg-white/40 backdrop-blur-md border-b border-white/30 z-20">
          <div className="flex items-center gap-md">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <MaterialIcon name="psychology" className="text-on-primary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <h2 className="font-headline-md text-[18px] font-bold">AI Study Mentor</h2>
          </div>
          <div className="flex items-center gap-md">
            <button className="p-sm rounded-lg hover:bg-surface-container transition-colors">
              <MaterialIcon name="share" />
            </button>
            <button className="p-sm rounded-lg hover:bg-surface-container transition-colors">
              <MaterialIcon name="more_vert" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-xl py-xl space-y-xl pb-32">
          {messages.length <= 1 && (
            <div className="max-w-2xl mx-auto text-center py-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-lg">
                <MaterialIcon name="auto_awesome" className="text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }} />
              </div>
              <h3 className="font-headline-md text-headline-md font-bold mb-sm">How can I help you study today?</h3>
              <p className="text-on-surface-variant mb-xl">
                Your StudyTwin AI is ready to explain complex topics, quiz you, or summarize your notes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-left">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.title}
                    onClick={() => setDraft(suggestion.prompt)}
                    className="glass-card p-md rounded-xl hover:border-primary/40 transition-all text-left"
                  >
                    <p className="font-label-sm text-label-sm font-bold text-primary mb-xs">{suggestion.title}</p>
                    <p className="text-[13px] text-on-surface-variant">"{suggestion.prompt}"</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) =>
            message.role === 'assistant' ? (
              <div key={message.id} className="flex gap-lg items-start max-w-4xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MaterialIcon name="smart_toy" className="text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                </div>
                <div className="glass-card p-lg rounded-2xl rounded-tl-none space-y-md">
                  <p className="text-on-surface leading-relaxed">{message.content}</p>
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex gap-lg items-start justify-end">
                <div className="bg-primary/5 border border-primary/20 p-lg rounded-2xl rounded-tr-none max-w-2xl">
                  <p className="text-on-surface">{message.content}</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-primary/10 flex-shrink-0 bg-primary-container flex items-center justify-center">
                  <MaterialIcon name="person" className="text-on-primary-container" />
                </div>
              </div>
            ),
          )}

          {isThinking && (
            <div className="flex gap-lg items-start max-w-4xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center flex-shrink-0 shadow-sm">
                <MaterialIcon name="smart_toy" className="text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }} />
              </div>
              <div className="glass-card p-lg rounded-2xl rounded-tl-none">
                <p className="text-on-surface-variant italic">Thinking…</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-lg bg-gradient-to-t from-surface via-surface/90 to-transparent">
            <div className="max-w-4xl mx-auto space-y-md">
              <div className="flex flex-wrap gap-sm justify-center">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setDraft((prev) => (prev ? `${action.label}: ${prev}` : `${action.label}: `))}
                    className={`px-md py-unit border rounded-full font-label-sm text-label-sm transition-all flex items-center gap-xs ${action.colorClass}`}
                  >
                    <MaterialIcon name={action.icon} className="text-[16px]" />
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="glass-card rounded-2xl p-sm flex items-center gap-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <button className="p-md text-outline hover:text-primary transition-colors">
                  <MaterialIcon name="attach_file" />
                </button>
                <input
                  className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/60 px-sm"
                  placeholder="Ask your StudyTwin AI anything..."
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <div className="flex items-center gap-sm pr-sm">
                  <button
                    type="button"
                    onClick={() => setTwinEnabled((prev) => !prev)}
                    className={`flex items-center gap-xs px-md py-xs rounded-lg cursor-pointer transition-all ${
                      twinEnabled ? 'bg-surface-container' : 'bg-surface-container-low border border-outline-variant/30'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${twinEnabled ? 'bg-primary animate-pulse' : 'bg-outline'}`} />
                    <span className={`text-[12px] font-bold ${twinEnabled ? 'text-primary' : 'text-outline'}`}>
                      {twinEnabled ? 'TWIN ON' : 'TWIN OFF'}
                    </span>
                  </button>
                  <button
                    onClick={sendMessage}
                    className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-container transition-all shadow-md"
                  >
                    <MaterialIcon name="arrow_upward" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-center text-outline/60">StudyTwin AI can make mistakes. Verify important information.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
