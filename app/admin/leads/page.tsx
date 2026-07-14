'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { TableSkeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

interface Inquiry {
  id: string;
  phone_number: string;
  customer_name: string;
  message: string;
  status: 'pending' | 'resolved' | 'ignored';
  created_at: string;
}

export default function LeadsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries');
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
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
        toast(`Inquiry for ${name} marked as resolved!`, 'success');
        fetchInquiries();
      } else {
        toast(data.error || 'Failed to resolve inquiry', 'error');
      }
    } catch {
      toast('Network error resolving inquiry', 'error');
    }
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

      {/* TABS FILTER */}
      <div className="flex gap-2.5">
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

      {/* INQUIRIES LIST */}
      <Card>
        <h3 className="font-bold text-foreground text-base mb-6 border-b border-border pb-3">
          Handoff List
        </h3>

        {loading ? (
          <TableSkeleton rows={4} cols={5} />
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
                          onClick={() => handleResolve(item.id, item.customer_name)}
                          className="h-8 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-xs text-muted font-semibold">Handled</span>
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
