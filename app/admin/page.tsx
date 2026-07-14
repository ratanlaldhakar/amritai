'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: 'Total Students',
      value: '142',
      change: '+8% this month',
      icon: '👥',
      color: 'text-primary',
    },
    {
      title: 'Pending Leads',
      value: '18',
      change: '4 handoffs waiting',
      icon: '⚡',
      color: 'text-amber-500',
    },
    {
      title: 'Messages Today',
      value: '294',
      change: '99.1% AI Handled',
      icon: '💬',
      color: 'text-sky-500',
    },
    {
      title: 'Trial Conversion',
      value: '64.5%',
      change: '+4.2% vs last week',
      icon: '📈',
      color: 'text-emerald-500',
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Page Title & Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Overview</h1>
          <p className="text-sm text-muted mt-1">
            Real-time stats and metrics for Amrit Yoga Raipur.
          </p>
        </div>
        <button className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer">
          Refresh Analytics
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : (
              <div className="flex flex-col justify-between h-full gap-4">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-muted">{stat.title}</span>
                  <span className={`text-xl ${stat.color}`}>{stat.icon}</span>
                </div>
                <div>
                  <span className="text-3xl font-bold tracking-tight text-foreground block">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted mt-1.5 block font-medium">{stat.change}</span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* CHARTS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly messages graph card */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
            <div>
              <h3 className="font-bold text-foreground text-base">Weekly Chat Volume</h3>
              <p className="text-xs text-muted mt-0.5">Incoming customer conversations per day.</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              7 Days Active
            </span>
          </div>

          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="h-48 w-full flex items-end justify-between px-2 pt-6 relative">
              {/* Simple beautiful SVG chart lines/bars to avoid bundle bloat */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-6 border-b border-border">
                <div className="border-t border-dashed border-muted w-full h-0"></div>
                <div className="border-t border-dashed border-muted w-full h-0"></div>
                <div className="border-t border-dashed border-muted w-full h-0"></div>
              </div>
              {[
                { day: 'Mon', val: 75, height: 'h-[75%]' },
                { day: 'Tue', val: 85, height: 'h-[85%]' },
                { day: 'Wed', val: 50, height: 'h-[50%]' },
                { day: 'Thu', val: 95, height: 'h-[95%]' },
                { day: 'Fri', val: 65, height: 'h-[65%]' },
                { day: 'Sat', val: 40, height: 'h-[40%]' },
                { day: 'Sun', val: 20, height: 'h-[20%]' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group z-10">
                  <div
                    className={`w-8 bg-primary rounded-t-lg transition-all duration-500 shadow-sm relative ${bar.height} hover:bg-primary/80`}
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-zinc-950 text-white text-[10px] px-1.5 py-0.5 rounded shadow z-50 transition-all font-mono font-bold">
                      {bar.val}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-muted mt-1">{bar.day}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* System Connections and parameters */}
        <Card className="flex flex-col justify-between">
          <div className="border-b border-border pb-4 mb-4">
            <h3 className="font-bold text-foreground text-base">Service Status</h3>
            <p className="text-xs text-muted mt-0.5">Integrations connectivity check.</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-sm font-semibold text-foreground">WhatsApp Cloud API</span>
                <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-sm font-semibold text-foreground">Supabase Database</span>
                <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-sm font-semibold text-foreground">Gemini LLM (Flash)</span>
                <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">Groq LLM (Fallback)</span>
                <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  Ready
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* RECENT PENDING INQUIRIES ESCALATIONS */}
      <Card>
        <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
          <div>
            <h3 className="font-bold text-foreground text-base">Recent Handoff Inquiries</h3>
            <p className="text-xs text-muted mt-0.5">
              Leads awaiting manual follow-up from coordinators.
            </p>
          </div>
          <span className="text-xs text-muted font-bold hover:underline cursor-pointer">
            View All
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold">
                  <th className="pb-3 pr-4 font-semibold">Customer</th>
                  <th className="pb-3 px-4 font-semibold">Phone</th>
                  <th className="pb-3 px-4 font-semibold">Inquiry Message</th>
                  <th className="pb-3 px-4 font-semibold">Triggered</th>
                  <th className="pb-3 pl-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: 'John Doe',
                    phone: '+91 99999 88888',
                    msg: 'Do you offer therapeutic yoga for lower back pain?',
                    date: '12 min ago',
                  },
                  {
                    name: 'Amit Sharma',
                    phone: '+91 88888 77777',
                    msg: 'Can I pay monthly instead of quarterly fees?',
                    date: '45 min ago',
                  },
                ].map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-3.5 pr-4 font-semibold text-foreground">{item.name}</td>
                    <td className="py-3.5 px-4 font-mono text-muted text-xs">{item.phone}</td>
                    <td className="py-3.5 px-4 text-muted max-w-xs truncate">{item.msg}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-muted">{item.date}</td>
                    <td className="py-3.5 pl-4 text-right">
                      <button className="h-7 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
                        Follow Up
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
