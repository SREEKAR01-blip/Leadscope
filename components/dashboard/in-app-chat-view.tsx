'use client';

import { useState } from 'react';
import { MessageSquare, Send, Search, Circle } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function InAppChatView() {
  const { messages } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id ?? null);
  const [input, setInput] = useState('');

  const selected = messages.find((m) => m.id === selectedId);
  const conversations = messages.reduce((acc, msg) => {
    const key = msg.sender_role === 'admin' ? msg.sender_name : msg.sender_name;
    if (!acc.find((c) => c.name === key)) {
      acc.push({ id: msg.id, name: key, role: msg.sender_role, preview: msg.preview, sent_at: msg.sent_at, read: msg.read });
    }
    return acc;
  }, [] as { id: string; name: string; role: string; preview: string; sent_at: string; read: boolean }[]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <MessageSquare className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">In-App Chat</h1>
          <p className="text-xs text-slate-500">Communicate with freelancers and support</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  'flex w-full items-start gap-3 border-b border-slate-50 p-3 text-left transition-colors hover:bg-slate-50',
                  selectedId === c.id && 'bg-blue-50/50'
                )}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-xs font-semibold text-white">
                  {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                    {!c.read && <Circle className="h-2 w-2 flex-shrink-0 fill-blue-500 text-blue-500" />}
                  </div>
                  <p className="truncate text-xs text-slate-500">{c.preview}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-xs font-semibold text-white">
                  {selected.sender_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selected.sender_name}</p>
                  <p className="text-xs text-slate-500">{selected.recipient_name}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="mx-auto max-w-2xl space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-xs font-semibold text-white">
                      {selected.sender_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-white p-3.5 shadow-sm">
                      <p className="text-sm leading-relaxed text-slate-700">{selected.body}</p>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        {new Date(selected.sent_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white p-4">
                <div className="mx-auto flex max-w-2xl items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
