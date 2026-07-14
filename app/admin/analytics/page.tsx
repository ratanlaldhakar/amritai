'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Analytics & Reports
          </h1>
          <p className="text-sm text-muted mt-1">
            Deep-dive metrics, conversion rates, and session trends.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Timings slots */}
        <Card className="flex flex-col justify-between">
          <div className="border-b border-border pb-4 mb-4">
            <h3 className="font-bold text-foreground text-base">Popular Class Slots</h3>
            <p className="text-xs text-muted mt-0.5">Distribution of class enquiries.</p>
          </div>

          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="h-48 w-full flex items-end justify-between px-2 pt-6 relative">
              {[
                { label: '6:00 AM', val: 78, height: 'h-[78%]' },
                { label: '7:30 AM', val: 55, height: 'h-[55%]' },
                { label: '5:30 PM', val: 90, height: 'h-[90%]' },
                { label: '7:00 PM', val: 82, height: 'h-[82%]' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group z-10">
                  <div
                    className={`w-12 bg-primary rounded-t-lg transition-all duration-500 shadow-sm relative ${bar.height} hover:bg-primary/80`}
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-zinc-950 text-white text-[10px] px-1.5 py-0.5 rounded shadow z-50 transition-all font-mono font-bold">
                      {bar.val}%
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-muted mt-1">{bar.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Lead Funnel conversions */}
        <Card className="flex flex-col justify-between">
          <div className="border-b border-border pb-4 mb-4">
            <h3 className="font-bold text-foreground text-base">Conversion Funnel</h3>
            <p className="text-xs text-muted mt-0.5">Leads to active membership conversion.</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-foreground">1. Total Leads</span>
                  <span className="text-muted">100% (42 Leads)</span>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-full"></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-foreground">2. Trials Scheduled</span>
                  <span className="text-muted">42.8% (18 Booked)</span>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-[42.8%]"></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-foreground">3. Active Members</span>
                  <span className="text-muted">28.5% (12 Converted)</span>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-[28.5%]"></div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider text-muted">
            Average response time
          </span>
          <span className="text-3xl font-bold tracking-tight text-foreground">1.8s</span>
          <span className="text-xs text-muted mt-1.5">Meta API & AI combined latency</span>
        </Card>
        <Card className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider text-muted">
            Conversation accuracy
          </span>
          <span className="text-3xl font-bold tracking-tight text-foreground">96.8%</span>
          <span className="text-xs text-muted mt-1.5">Rate of accurate knowledge base answers</span>
        </Card>
        <Card className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider text-muted">
            User retention rate
          </span>
          <span className="text-3xl font-bold tracking-tight text-foreground">88.2%</span>
          <span className="text-xs text-muted mt-1.5">Returning monthly practitioners</span>
        </Card>
      </div>
    </div>
  );
}
