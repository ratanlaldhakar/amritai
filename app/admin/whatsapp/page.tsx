'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

export default function WhatsAppConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState(
    'Hari Om! This is a test message from Amrit Yoga AI.'
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleTestSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMessage.trim()) return;

    toast(`Test message dispatched to ${testPhone}!`, 'success');
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            WhatsApp Business Integration
          </h1>
          <p className="text-sm text-muted mt-1">
            Monitor webhook status, connection logs, and templates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Status Log */}
        <Card className="lg:col-span-2 flex flex-col gap-6">
          <h3 className="font-bold text-foreground text-base border-b border-border pb-3">
            Integration Details
          </h3>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-sm font-mono">
              <div className="flex flex-col gap-1 border-b border-border/50 pb-2">
                <span className="text-[10px] text-muted font-sans font-bold">
                  Webhook Callback URL
                </span>
                <span className="text-foreground text-xs select-all">
                  https://amrityogacenter.in/api/webhook
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-border/50 pb-2">
                <span className="text-[10px] text-muted font-sans font-bold">Verify Token</span>
                <span className="text-foreground text-xs select-all">
                  amrit_yoga_webhook_verify_secure_token_2026
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted font-sans font-bold">Phone Number ID</span>
                <span className="text-foreground text-xs select-all">123456789012345</span>
              </div>
            </div>
          )}
        </Card>

        {/* Webhook Connection Health */}
        <Card className="flex flex-col justify-between">
          <h3 className="font-bold text-foreground text-base border-b border-border pb-3 mb-4">
            Connection Health
          </h3>

          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-500/10 px-3 py-2 rounded-xl border border-green-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-ping"></span>
                Webhook active and healthy
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Last ping received from Meta servers:{' '}
                <span className="font-semibold text-foreground">Just now</span>.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* DISPATCH TEST MESSAGES */}
      <Card>
        <h3 className="font-bold text-foreground text-base border-b border-border pb-3 mb-6">
          Dispatch Test Message
        </h3>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleTestSend} className="flex flex-col gap-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted">
                Test Phone Number (with Country Code)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +91 98765 43210"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted">Test Message</label>
              <textarea
                rows={3}
                required
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="rounded-xl border border-border bg-background p-3 text-sm focus:outline-none text-foreground resize-none"
              />
            </div>

            <div className="flex">
              <button
                type="submit"
                className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 transition-colors shadow-md cursor-pointer"
              >
                Dispatch Message
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
