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
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredChats = chats.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number.includes(searchQuery)
  );

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const avatarColors = [
    '#00a884', '#53bdeb', '#e67e22', '#e74c3c', '#9b59b6',
    '#1abc9c', '#f39c12', '#3498db', '#e91e63', '#009688',
  ];

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <>
      {/* Scoped WhatsApp styles */}
      <style>{`
        .wa-container {
          height: calc(100vh - 12rem);
          display: flex;
          width: 100%;
          overflow: hidden;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        /* --- Scrollbar --- */
        .wa-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .wa-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .wa-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        .wa-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }

        /* --- Sidebar --- */
        .wa-sidebar {
          width: 360px;
          min-width: 360px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #e0e0e0;
          background: #ffffff;
        }
        .wa-sidebar-header {
          background: #008069;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 56px;
        }
        .wa-sidebar-header h2 {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }
        .wa-search-wrap {
          padding: 8px 12px;
          background: #f0f2f5;
        }
        .wa-search-input {
          width: 100%;
          border: none;
          border-radius: 8px;
          padding: 8px 12px 8px 36px;
          font-size: 13px;
          background: #ffffff;
          outline: none;
          color: #111b21;
        }
        .wa-search-input::placeholder {
          color: #8696a0;
        }
        .wa-search-icon {
          position: absolute;
          left: 24px;
          top: 50%;
          transform: translateY(-50%);
          color: #8696a0;
        }
        .wa-chat-list {
          flex: 1;
          overflow-y: auto;
        }
        .wa-chat-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          gap: 14px;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          transition: background-color 0.15s;
          border-bottom: 1px solid #f0f2f5;
        }
        .wa-chat-item:hover {
          background: #f5f6f6;
        }
        .wa-chat-item.selected {
          background: #f0f2f5;
        }
        .wa-avatar {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 600;
          font-size: 16px;
          position: relative;
        }
        .wa-online-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 12px;
          height: 12px;
          background: #25D366;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .wa-chat-info {
          flex: 1;
          min-width: 0;
        }
        .wa-chat-name {
          font-size: 16px;
          font-weight: 400;
          color: #111b21;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .wa-chat-preview {
          font-size: 13px;
          color: #667781;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }
        .wa-chat-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          min-width: 50px;
        }
        .wa-chat-time {
          font-size: 11px;
          color: #667781;
        }
        .wa-chat-time.unread {
          color: #25D366;
          font-weight: 600;
        }
        .wa-unread-badge {
          background: #25D366;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          min-width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        /* --- Chat Panel --- */
        .wa-chat-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #efeae2;
          position: relative;
        }
        .wa-chat-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.06;
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M20 2a2 2 0 110 4 2 2 0 010-4zm-8 8a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm16 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-8 10a2 2 0 110 4 2 2 0 010-4zm-12 8a1 1 0 110 2 1 1 0 010-2zm24 0a1 1 0 110 2 1 1 0 010-2zm-12 6a1.5 1.5 0 110 3 1.5 1.5 0 010-3z' fill='%23000' fill-opacity='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23p)'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }
        .wa-chat-header {
          background: #008069;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 56px;
          z-index: 1;
        }
        .wa-chat-header-name {
          font-size: 16px;
          font-weight: 500;
          color: #fff;
        }
        .wa-chat-header-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.75);
          margin-top: 1px;
        }
        .wa-chat-header-back {
          display: none;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
          padding: 4px;
          margin-right: 4px;
        }
        .wa-messages-wrap {
          flex: 1;
          overflow-y: auto;
          padding: 20px 60px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          z-index: 1;
        }

        /* --- Bubbles --- */
        .wa-bubble-row {
          display: flex;
          margin-bottom: 2px;
        }
        .wa-bubble-row.incoming {
          justify-content: flex-start;
        }
        .wa-bubble-row.outgoing {
          justify-content: flex-end;
        }
        .wa-bubble {
          max-width: 65%;
          padding: 6px 7px 8px 9px;
          border-radius: 7.5px;
          font-size: 14.2px;
          line-height: 1.4;
          position: relative;
          box-shadow: 0 1px 0.5px rgba(11,20,26,0.13);
          word-wrap: break-word;
        }
        .wa-bubble.incoming {
          background: #ffffff;
          color: #111b21;
          border-top-left-radius: 0;
        }
        .wa-bubble.outgoing {
          background: #d9fdd3;
          color: #111b21;
          border-top-right-radius: 0;
        }
        /* Bubble tails */
        .wa-bubble.incoming::before {
          content: '';
          position: absolute;
          top: 0;
          left: -8px;
          width: 0;
          height: 0;
          border-top: 0px solid transparent;
          border-bottom: 13px solid transparent;
          border-right: 8px solid #ffffff;
        }
        .wa-bubble.outgoing::before {
          content: '';
          position: absolute;
          top: 0;
          right: -8px;
          width: 0;
          height: 0;
          border-top: 0px solid transparent;
          border-bottom: 13px solid transparent;
          border-left: 8px solid #d9fdd3;
        }
        .wa-bubble-text {
          margin-right: 50px;
        }
        .wa-bubble-meta {
          float: right;
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 3px;
          margin-left: 8px;
          position: relative;
          top: 5px;
        }
        .wa-bubble-time {
          font-size: 11px;
          color: #667781;
        }
        .wa-bubble-check {
          color: #53bdeb;
          font-size: 13px;
          letter-spacing: -3px;
          font-weight: 700;
        }

        /* --- Input Bar --- */
        .wa-input-bar {
          background: #f0f2f5;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1;
        }
        .wa-input-emoji {
          background: transparent;
          border: none;
          color: #8696a0;
          cursor: pointer;
          font-size: 22px;
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .wa-input-attach {
          background: transparent;
          border: none;
          color: #8696a0;
          cursor: pointer;
          font-size: 22px;
          padding: 4px;
          display: flex;
          align-items: center;
          transform: rotate(45deg);
        }
        .wa-input-field {
          flex: 1;
          border: none;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          background: #ffffff;
          outline: none;
          color: #111b21;
          min-height: 20px;
        }
        .wa-input-field::placeholder {
          color: #8696a0;
        }
        .wa-send-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #008069;
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          flex-shrink: 0;
        }
        .wa-send-btn:hover {
          background: #017561;
        }

        /* --- Empty State --- */
        .wa-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;
          background: #f0f2f5;
        }
        .wa-empty-icon {
          width: 220px;
          height: 220px;
          margin-bottom: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00a884 0%, #25d366 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.12;
        }
        .wa-empty-title {
          font-size: 28px;
          font-weight: 300;
          color: #41525d;
          margin-bottom: 10px;
        }
        .wa-empty-desc {
          font-size: 14px;
          color: #667781;
          text-align: center;
          max-width: 450px;
          line-height: 1.6;
        }

        /* --- Mobile Responsive --- */
        @media (max-width: 768px) {
          .wa-sidebar {
            width: 100%;
            min-width: 100%;
          }
          .wa-sidebar.hidden-mobile {
            display: none;
          }
          .wa-chat-panel.hidden-mobile {
            display: none;
          }
          .wa-chat-header-back {
            display: flex;
          }
          .wa-messages-wrap {
            padding: 12px 16px;
          }
          .wa-bubble {
            max-width: 85%;
          }
        }
      `}</style>

      <div className="wa-container">
        {/* ========== LEFT SIDEBAR ========== */}
        <div className={`wa-sidebar ${mobileShowChat ? 'hidden-mobile' : ''}`}>
          {/* Sidebar Header */}
          <div className="wa-sidebar-header">
            <h2>Chats</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Status icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 20a8 8 0 100-16 8 8 0 000 16zm0 2C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" fill="rgba(255,255,255,0.85)"/>
              </svg>
              {/* New chat icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2-1.066 2-2.098V4.821c0-1.032-.967-1.646-2-1.646z" fill="rgba(255,255,255,0.85)"/>
              </svg>
              {/* Menu icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6" r="1.5" fill="rgba(255,255,255,0.85)"/>
                <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.85)"/>
                <circle cx="12" cy="18" r="1.5" fill="rgba(255,255,255,0.85)"/>
              </svg>
            </div>
          </div>

          {/* Search Bar */}
          <div className="wa-search-wrap" style={{ position: 'relative' }}>
            <svg className="wa-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
            </svg>
            <input
              className="wa-search-input"
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Chat List */}
          <div className="wa-chat-list wa-scroll">
            {loading ? (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#667781', fontSize: '14px' }}>
                {chats.length === 0 ? 'No WhatsApp chats logged yet.' : 'No chats match your search.'}
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.phone_number === selectedPhone;
                return (
                  <button
                    key={chat.phone_number}
                    onClick={() => {
                      setSelectedPhone(chat.phone_number);
                      setMobileShowChat(true);
                    }}
                    className={`wa-chat-item ${isSelected ? 'selected' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className="wa-avatar"
                      style={{ backgroundColor: getAvatarColor(chat.customer_name) }}
                    >
                      {getInitials(chat.customer_name)}
                      <span className="wa-online-dot" />
                    </div>

                    {/* Info */}
                    <div className="wa-chat-info">
                      <div className="wa-chat-name">{chat.customer_name}</div>
                      <div className="wa-chat-preview">{chat.last_message}</div>
                    </div>

                    {/* Meta */}
                    <div className="wa-chat-meta">
                      <span className={`wa-chat-time ${chat.unread ? 'unread' : ''}`}>
                        {chat.last_timestamp
                          ? new Date(chat.last_timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                      {chat.unread && <span className="wa-unread-badge">1</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ========== RIGHT CHAT PANEL ========== */}
        <div className={`wa-chat-panel ${!mobileShowChat ? 'hidden-mobile' : ''}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="wa-chat-header">
                <button
                  className="wa-chat-header-back"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="Back to chats"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
                  </svg>
                </button>

                <div
                  className="wa-avatar"
                  style={{
                    backgroundColor: getAvatarColor(activeChat.customer_name),
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    fontSize: '14px',
                  }}
                >
                  {getInitials(activeChat.customer_name)}
                </div>

                <div style={{ flex: 1 }}>
                  <div className="wa-chat-header-name">{activeChat.customer_name}</div>
                  <div className="wa-chat-header-sub">
                    +{activeChat.phone_number} · online
                  </div>
                </div>

                {/* Header action icons */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
                    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
                    <circle cx="12" cy="6" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="18" r="1.5"/>
                  </svg>
                </div>
              </div>

              {/* Messages Area */}
              {historyLoading && history.length === 0 ? (
                <div className="wa-messages-wrap wa-scroll" style={{ gap: '12px' }}>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '50%' }}>
                    <Skeleton className="h-12 w-64" />
                  </div>
                  <div style={{ alignSelf: 'flex-end', maxWidth: '50%' }}>
                    <Skeleton className="h-12 w-48" />
                  </div>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '50%' }}>
                    <Skeleton className="h-10 w-56" />
                  </div>
                </div>
              ) : (
                <div className="wa-messages-wrap wa-scroll">
                  {/* Date chip */}
                  {history.length > 0 && (
                    <div style={{
                      alignSelf: 'center',
                      background: '#fff',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '12.5px',
                      color: '#54656f',
                      boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)',
                      marginBottom: '12px',
                    }}>
                      {new Date(history[0].whatsapp_timestamp).toLocaleDateString([], {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  )}

                  {history.map((msg) => {
                    const isIncoming = msg.direction === 'incoming';
                    return (
                      <div key={msg.id} className={`wa-bubble-row ${isIncoming ? 'incoming' : 'outgoing'}`}>
                        <div className={`wa-bubble ${isIncoming ? 'incoming' : 'outgoing'}`}>
                          <span className="wa-bubble-text">{msg.text}</span>
                          <span className="wa-bubble-meta">
                            <span className="wa-bubble-time">
                              {new Date(msg.whatsapp_timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {!isIncoming && (
                              <span className="wa-bubble-check">✓✓</span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* Input Bar */}
              <form onSubmit={handleSend} className="wa-input-bar">
                {/* Emoji button */}
                <button type="button" className="wa-input-emoji" aria-label="Emoji">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                  </svg>
                </button>

                {/* Attach button */}
                <button type="button" className="wa-input-attach" aria-label="Attach">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6h-1.5v9.5a2.5 2.5 0 005 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6H16.5z"/>
                  </svg>
                </button>

                {/* Text input */}
                <input
                  className="wa-input-field"
                  type="text"
                  placeholder="Type a message"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                />

                {/* Send button */}
                <button type="submit" className="wa-send-btn" aria-label="Send message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="wa-empty-state">
              <div className="wa-empty-icon">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="#fff">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.73.46 3.36 1.27 4.77L2 22l5.33-1.24A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.58 0-3.07-.46-4.33-1.24l-.31-.18-3.17.74.78-3.09-.2-.33A7.93 7.93 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <div className="wa-empty-title">Amrit Yoga Center</div>
              <div className="wa-empty-desc">
                Send and receive WhatsApp messages from your customers. Select a conversation from the left panel to view the chat history and respond directly.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
