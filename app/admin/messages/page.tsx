'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

interface Chat {
  phone_number: string;
  customer_name: string;
  last_message: string;
  last_timestamp: string;
  unread: boolean;
}

interface MessageHistory {
  id: string;
  phone_number: string;
  customer_name: string;
  text: string;
  direction: 'incoming' | 'outgoing';
  whatsapp_timestamp: string;
}

export default function ChatViewer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [history, setHistory] = useState<MessageHistory[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = useCallback(
    async (silent = false) => {
      try {
        const res = await fetch('/api/admin/chats');
        const data = await res.json();
        if (data.success) {
          setChats(data.chats);
          if (!selectedPhone && data.chats.length > 0) {
            setSelectedPhone(data.chats[0].phone_number);
          }
        }
      } catch {
        // Ignored
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [selectedPhone]
  );

  const fetchHistory = useCallback(async (phone: string, silent = false) => {
    if (!silent) setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/chats?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch {
      // Ignored
    } finally {
      if (!silent) setHistoryLoading(false);
    }
  }, []);

  // Poll chats and current active chat history every 4 seconds for real-time updates
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChats();
    }, 0);

    const interval = setInterval(() => {
      fetchChats(true);
      if (selectedPhone) {
        fetchHistory(selectedPhone, true);
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [selectedPhone, fetchChats, fetchHistory]);

  // Load history whenever selected chat changes
  useEffect(() => {
    if (selectedPhone) {
      const timer = setTimeout(() => {
        fetchHistory(selectedPhone);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedPhone, fetchHistory]);

  // Scroll to bottom when history changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedPhone) return;

    const messageText = typedMessage;
    setTypedMessage('');

    try {
      const res = await fetch('/api/admin/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedPhone,
          text: messageText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Message sent successfully via WhatsApp!', 'success');
        // Refresh local thread
        fetchHistory(selectedPhone, true);
        fetchChats(true);
      } else {
        toast(data.error || 'Failed to send WhatsApp message', 'error');
      }
    } catch {
      toast('Network error sending WhatsApp message', 'error');
    }
  };

  const activeChat = chats.find((c) => c.phone_number === selectedPhone);

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
        ) : chats.length === 0 ? (
          <div className="py-6 text-center text-muted font-medium">
            No WhatsApp chats logged yet.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
            {chats.map((chat) => {
              const isSelected = chat.phone_number === selectedPhone;
              return (
                <button
                  key={chat.phone_number}
                  onClick={() => setSelectedPhone(chat.phone_number)}
                  className={`w-full p-3 rounded-2xl flex flex-col gap-1 text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card/40 border-transparent hover:border-border'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold text-xs truncate max-w-[70%] text-foreground">
                      {chat.customer_name}
                    </span>
                    <span
                      className={`text-[9px] ${isSelected ? 'text-primary-foreground/70' : 'text-muted'}`}
                    >
                      {chat.last_timestamp
                        ? new Date(chat.last_timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] truncate max-w-full leading-none mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted'}`}
                  >
                    {chat.last_message}
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
                {activeChat.customer_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-none text-foreground">
                  {activeChat.customer_name}
                </span>
                <span className="text-[10px] text-muted mt-1">+{activeChat.phone_number}</span>
              </div>
            </div>

            {/* Chats list */}
            {historyLoading && history.length === 0 ? (
              <div className="flex-1 space-y-4 py-4 overflow-y-auto">
                <Skeleton className="h-10 w-2/3 self-start rounded-tl-none" />
                <Skeleton className="h-10 w-1/2 self-end rounded-tr-none" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2 px-1 pr-2">
                {history.map((msg) => {
                  const isIncoming = msg.direction === 'incoming';
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm border ${
                        isIncoming
                          ? 'self-start bg-card border-border rounded-tl-none text-foreground'
                          : 'self-end bg-primary text-primary-foreground border-primary rounded-tr-none'
                      }`}
                    >
                      <div>{msg.text}</div>
                      <div className={`text-[8px] text-right mt-1 opacity-70`}>
                        {new Date(msg.whatsapp_timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Input typing box */}
            <form onSubmit={handleSend} className="flex gap-2 border-t border-border pt-3 shrink-0">
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
