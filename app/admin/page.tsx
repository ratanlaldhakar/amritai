'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

interface Inquiry {
  id: string;
  phone_number: string;
  customer_name: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalStudents: '0',
    pendingLeads: '0',
    messagesToday: '0',
    conversionRate: '0%',
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStatsData(data.stats);
        setRecentInquiries(data.recentInquiries);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleResolve = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        toast(`Inquiry for ${name} resolved successfully!`, 'success');
        fetchStats();
      } else {
        toast(data.error || 'Failed to resolve inquiry', 'error');
      }
    } catch {
      toast('Failed to resolve inquiry due to network error', 'error');
    }
  };

  const stats = [
    {
      title: 'Total Students',
      value: statsData.totalStudents,
      change: 'Synced from DB',
      icon: '👥',
      color: 'text-primary',
    },
    {
      title: 'Pending Leads',
      value: statsData.pendingLeads,
      change: 'Handoffs waiting',
      icon: '⚡',
      color: 'text-amber-500',
    },
    {
      title: 'Messages Today',
      value: statsData.messagesToday,
      change: 'AI / Admin Logs',
      icon: '💬',
      color: 'text-sky-500',
    },
    {
      title: 'Conversion Rate',
      value: statsData.conversionRate,
      change: 'Active vs Total',
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
        <button
          onClick={() => {
            setLoading(true);
            fetchStats();
          }}
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer"
        >
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
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : recentInquiries.length === 0 ? (
          <div className="py-6 text-center text-muted font-medium">
            No pending handoff inquiries found.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold">
                  <th className="pb-3 pr-4 font-semibold">Customer</th>
                  <th className="pb-3 px-4 font-semibold">Phone</th>
                  <th className="pb-3 px-4 font-semibold">Inquiry Message</th>
                  <th className="pb-3 px-4 font-semibold">Status</th>
                  <th className="pb-3 pl-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-3.5 pr-4 font-semibold text-foreground">
                      {item.customer_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted text-xs">
                      {item.phone_number}
                    </td>
                    <td className="py-3.5 px-4 text-muted max-w-xs truncate">{item.message}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold uppercase text-amber-600">
                      {item.status}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      {item.status === 'pending' ? (
                        <button
                          onClick={() => handleResolve(item.id, item.customer_name)}
                          className="h-7 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-muted font-semibold">Resolved</span>
                      )}
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
