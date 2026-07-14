'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { TableSkeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

const initialInquiries = [
  {
    id: '1',
    phone_number: '+91 99999 88888',
    customer_name: 'John Doe',
    message: 'Do you offer therapeutic yoga for lower back pain?',
    status: 'pending',
    created_at: '2026-07-14T22:00:00Z',
  },
  {
    id: '2',
    phone_number: '+91 88888 77777',
    customer_name: 'Amit Sharma',
    message: 'Can I pay monthly instead of quarterly fees?',
    status: 'pending',
    created_at: '2026-07-14T21:30:00Z',
  },
  {
    id: '3',
    phone_number: '+91 77777 66666',
    customer_name: 'Sarah Connor',
    message: 'Is there a trial class for children?',
    status: 'resolved',
    created_at: '2026-07-14T19:00:00Z',
  },
];

export default function LeadsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleResolve = (id: string, name: string) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'resolved' as const } : item))
    );
    toast(`Inquiry for ${name} marked as resolved!`, 'success');
  };

  const filtered = inquiries.filter((item) => filter === 'all' || item.status === filter);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Leads & Inquiries
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage coordinator handoffs, customer queries, and conversions.
          </p>
        </div>
      </div>

      {/* LEAD FUNNEL PIPELINE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider text-muted">
            Total Leads
          </span>
          <span className="text-3xl font-bold tracking-tight text-foreground">42</span>
          <span className="text-xs text-muted mt-1.5">Acquired via WhatsApp receptionist</span>
        </Card>
        <Card className="flex flex-col gap-2 border-primary/20 bg-primary/5">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider text-primary">
            Trial Booked
          </span>
          <span className="text-3xl font-bold tracking-tight text-primary">18</span>
          <span className="text-xs text-primary/70 mt-1.5">Scheduled this week</span>
        </Card>
        <Card className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider text-muted">
            Converted Members
          </span>
          <span className="text-3xl font-bold tracking-tight text-foreground">12</span>
          <span className="text-xs text-muted mt-1.5">42.8% active conversion rate</span>
        </Card>
      </div>

      {/* FILTER BUTTONS */}
      <Card className="py-4 px-6 flex justify-between items-center">
        <div className="flex gap-2">
          {(['pending', 'resolved', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`h-9 px-4 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted border-border hover:bg-secondary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* INQUIRIES LIST */}
      <Card>
        <h3 className="font-bold text-foreground text-base mb-6 border-b border-border pb-3">
          Handoff List
        </h3>

        {loading ? (
          <TableSkeleton rows={3} cols={5} />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold">
                  <th className="pb-3 pr-4 font-semibold">Customer</th>
                  <th className="pb-3 px-4 font-semibold">Phone</th>
                  <th className="pb-3 px-4 font-semibold">Escalated Question</th>
                  <th className="pb-3 px-4 font-semibold">Status</th>
                  <th className="pb-3 pl-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-4 pr-4 font-semibold text-foreground">
                      {item.customer_name}
                    </td>
                    <td className="py-4 px-4 font-mono text-muted text-xs">{item.phone_number}</td>
                    <td className="py-4 px-4 text-muted max-w-sm whitespace-pre-wrap">
                      {item.message}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      {item.status === 'pending' ? (
                        <button
                          onClick={() => handleResolve(item.id, item.customer_name || 'Customer')}
                          className="h-8 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-colors shadow-sm cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-xs text-muted font-medium">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted font-medium">
                      No inquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
