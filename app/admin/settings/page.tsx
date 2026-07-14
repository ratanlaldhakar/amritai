'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

export default function SettingsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Settings State matching database structures
  const [aiEnabled, setAiEnabled] = useState(true);
  const [primaryModel, setPrimaryModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.3);
  const [monthlyFee, setMonthlyFee] = useState(1500);
  const [quarterlyFee, setQuarterlyFee] = useState(4000);
  const [morningStart, setMorningStart] = useState('06:00');
  const [morningEnd, setMorningEnd] = useState('07:30');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are the friendly, polite, and professional AI Receptionist for "Amrit Yoga Center" Raipur...'
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Settings successfully saved to database!', 'success');
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            AI & Studio Settings
          </h1>
          <p className="text-sm text-muted mt-1">
            Configure models, prompts, pricing, slots, and systems.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* GENERAL CONTROLS */}
          <Card className="flex flex-col gap-6">
            <h3 className="font-bold text-foreground text-base border-b border-border pb-3">
              System Control
            </h3>

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Enable AI Receptionist
                </span>
                <span className="text-xs text-muted mt-1">
                  If disabled, all incoming messages trigger immediate handoffs.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`w-14 h-8 rounded-full transition-all duration-300 relative cursor-pointer ${
                  aiEnabled ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-all duration-300 ${
                    aiEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* STUDIO PARAMETERS (FEES & TIMINGS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fees Configuration */}
            <Card className="flex flex-col gap-4">
              <h3 className="font-bold text-foreground text-base border-b border-border pb-3">
                Membership Fees
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted">Monthly Pass (₹)</label>
                <input
                  type="number"
                  required
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(parseInt(e.target.value))}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted">Quarterly Pass (₹)</label>
                <input
                  type="number"
                  required
                  value={quarterlyFee}
                  onChange={(e) => setQuarterlyFee(parseInt(e.target.value))}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                />
              </div>
            </Card>

            {/* Timings Configuration */}
            <Card className="flex flex-col gap-4">
              <h3 className="font-bold text-foreground text-base border-b border-border pb-3">
                Batch Timings (Morning Hatha)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted">Start Time</label>
                  <input
                    type="time"
                    required
                    value={morningStart}
                    onChange={(e) => setMorningStart(e.target.value)}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted">End Time</label>
                  <input
                    type="time"
                    required
                    value={morningEnd}
                    onChange={(e) => setMorningEnd(e.target.value)}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* AI MODEL SETTINGS & PROMPT EDITOR */}
          <Card className="flex flex-col gap-6">
            <h3 className="font-bold text-foreground text-base border-b border-border pb-3">
              AI Prompt & Model parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted">Primary LLM Model</label>
                <select
                  value={primaryModel}
                  onChange={(e) => setPrimaryModel(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                >
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro</option>
                  <option value="llama3-8b-8192">Llama 3 8B (via Groq)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted">
                  Temperature ({temperature})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="h-10 accent-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted">System Instructions Prompt</label>
              <textarea
                rows={6}
                required
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="rounded-xl border border-border bg-background p-3 text-sm focus:outline-none text-foreground resize-none leading-relaxed"
              />
            </div>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="h-11 px-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 transition-colors shadow-md cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
