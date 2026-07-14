'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

const mockChats = [
  {
    id: 'chat-1',
    phone: '+91 98765 43210',
    name: 'Aarav Mehta',
    lastMsg: 'Where is the center located?',
    time: '10:45 AM',
    unread: false,
    history: [
      { text: 'Hari Om! Welcome to Amrit Yoga. How can I help you?', direction: 'outgoing' },
      { text: 'Where is the center located?', direction: 'incoming' },
    ],
  },
  {
    id: 'chat-2',
    phone: '+91 99999 88888',
    name: 'John Doe',
    lastMsg: 'Do you offer therapeutic yoga for lower back pain?',
    time: 'Yesterday',
    unread: true,
    history: [
      { text: 'Hello, I want to join classes.', direction: 'incoming' },
      {
        text: 'Great! We offer Hatha Yoga, Power Yoga, and Therapeutic sessions. First trial session is free. Which one interests you?',
        direction: 'outgoing',
      },
      { text: 'Do you offer therapeutic yoga for lower back pain?', direction: 'incoming' },
    ],
  },
];

export default function ChatViewer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState(mockChats);
  const [selectedChatId, setSelectedChatId] = useState('chat-1');
  const [typedMessage, setTypedMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const activeChat = chats.find((c) => c.id === selectedChatId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChat) return;

    // Append outgoing message
    const updatedChats = chats.map((c) => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMsg: typedMessage,
          time: 'Just now',
          history: [...c.history, { text: typedMessage, direction: 'outgoing' }],
        };
      }
      return c;
    });

    setChats(updatedChats);
    toast(`Message sent successfully to ${activeChat.name}!`, 'success');
    setTypedMessage('');
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6 w-full overflow-hidden">
      {/* LEFT CHATS LIST */}
      <Card className="w-80 flex flex-col p-4 overflow-hidden h-full">
        <h3 className="font-bold text-foreground text-base border-b border-border pb-3 mb-3">
          Conversations
        </h3>

        {loading ? (
          <div className="space-y-4 flex-1 overflow-y-auto">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
            {chats.map((chat) => {
              const isSelected = chat.id === selectedChatId;
              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full p-3 rounded-2xl flex flex-col gap-1 text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card/40 border-transparent hover:border-border'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold text-xs truncate max-w-[70%] text-foreground">
                      {chat.name}
                    </span>
                    <span
                      className={`text-[9px] ${isSelected ? 'text-primary-foreground/70' : 'text-muted'}`}
                    >
                      {chat.time}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] truncate max-w-full leading-none mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted'}`}
                  >
                    {chat.lastMsg}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* RIGHT CHAT WINDOW */}
      <Card className="flex-1 flex flex-col justify-between p-4 overflow-hidden h-full">
        {activeChat ? (
          <>
            {/* Header info */}
            <div className="flex items-center gap-3 border-b border-border pb-3 mb-3 shrink-0">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {activeChat.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-none text-foreground">
                  {activeChat.name}
                </span>
                <span className="text-[10px] text-muted mt-1">{activeChat.phone}</span>
              </div>
            </div>

            {/* Chats list */}
            {loading ? (
              <div className="flex-1 space-y-4 py-4 overflow-y-auto">
                <Skeleton className="h-10 w-2/3 self-start rounded-tl-none" />
                <Skeleton className="h-10 w-1/2 self-end rounded-tr-none" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2 px-1 pr-2">
                {activeChat.history.map((msg, idx) => {
                  const isIncoming = msg.direction === 'incoming';
                  return (
                    <div
                      key={idx}
                      className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm border ${
                        isIncoming
                          ? 'self-start bg-card border-border rounded-tl-none text-foreground'
                          : 'self-end bg-primary text-primary-foreground border-primary rounded-tr-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Input typing box */}
            <form
              onSubmit={handleSend}
              className="flex gap-2 border-t border-border pt-3 shrink-0"
            >
              <input
                type="text"
                placeholder="Type a manual WhatsApp message response..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 h-10 rounded-full border border-border bg-background px-4 text-xs focus:outline-none text-foreground"
              />
              <button
                type="submit"
                className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-colors shadow-md cursor-pointer"
              >
                Send Direct
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted font-medium">
            Select a conversation to view chat logs.
          </div>
        )}
      </Card>
    </div>
  );
}
