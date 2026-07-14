'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

const initialFaqs = [
  {
    id: '1',
    category: 'general',
    question: 'Where is Amrit Yoga Center located?',
    answer:
      'Amrit Yoga Center is located at E-168, Sector 2, Devendra Nagar, Raipur, Chhattisgarh 492004.',
    is_published: true,
  },
  {
    id: '2',
    category: 'pricing',
    question: 'What is the monthly subscription fee?',
    answer:
      'The monthly fee is ₹1,500. We also offer quarterly passes for ₹4,000 and annual passes for ₹12,000.',
    is_published: true,
  },
  {
    id: '3',
    category: 'classes',
    question: 'What are the Hatha Yoga timings?',
    answer: 'Daily morning slot: 6:00 AM - 7:30 AM. Evening slot: 5:30 PM - 7:00 PM.',
    is_published: true,
  },
];

export default function FAQManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingFaq, setEditingFaq] = useState<(typeof initialFaqs)[0] | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({
    category: 'general',
    question: '',
    answer: '',
    is_published: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;

    const id = Math.random().toString(36).substring(2, 9);
    setFaqs((prev) => [...prev, { id, ...newFaq }]);
    toast('FAQ created successfully!', 'success');
    setNewFaq({ category: 'general', question: '', answer: '', is_published: true });
    setIsAdding(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    setFaqs((prev) => prev.map((f) => (f.id === editingFaq.id ? editingFaq : f)));
    toast('FAQ updated successfully!', 'success');
    setEditingFaq(null);
  };

  const handleDelete = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast('FAQ deleted successfully!', 'warning');
  };

  const filtered = faqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions (FAQs)
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage rules, FAQ entries, and AI knowledge blocks.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer"
        >
          Add New FAQ
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <Card className="py-4 px-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-xs relative">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-full border border-border bg-background px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
          {['all', 'general', 'pricing', 'classes'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`h-9 px-4 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted border-border hover:bg-secondary'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* FAQ ITEMS LIST */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          filtered.map((faq) => (
            <Card key={faq.id} className="flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                    {faq.category}
                  </span>
                  <h4 className="font-bold text-sm text-foreground">{faq.question}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingFaq({ ...faq })}
                    className="h-7 px-3 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="h-7 px-3 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted leading-6">{faq.answer}</p>
            </Card>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <Card className="py-12 text-center text-muted font-medium">
            No FAQ items found matching your filter.
          </Card>
        )}
      </div>

      {/* CREATE MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card/95 border border-border backdrop-blur-md rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-3 mb-4">
              Add FAQ
            </h3>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Category</label>
                <select
                  value={newFaq.category}
                  onChange={(e) => setNewFaq((prev) => ({ ...prev, category: e.target.value }))}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                >
                  <option value="general">General</option>
                  <option value="pricing">Pricing</option>
                  <option value="classes">Classes</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Do you provide yoga mats?"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq((prev) => ({ ...prev, question: e.target.value }))}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Answer</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Yes, we provide sanitised yoga mats..."
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq((prev) => ({ ...prev, answer: e.target.value }))}
                  className="rounded-xl border border-border bg-background p-3 text-sm focus:outline-none text-foreground resize-none"
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 transition-colors shadow-md cursor-pointer"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 h-10 rounded-full border border-border text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card/95 border border-border backdrop-blur-md rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-3 mb-4">
              Edit FAQ
            </h3>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Category</label>
                <select
                  value={editingFaq.category}
                  onChange={(e) =>
                    setEditingFaq((prev) => (prev ? { ...prev, category: e.target.value } : null))
                  }
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                >
                  <option value="general">General</option>
                  <option value="pricing">Pricing</option>
                  <option value="classes">Classes</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Question</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question}
                  onChange={(e) =>
                    setEditingFaq((prev) => (prev ? { ...prev, question: e.target.value } : null))
                  }
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer}
                  onChange={(e) =>
                    setEditingFaq((prev) => (prev ? { ...prev, answer: e.target.value } : null))
                  }
                  className="rounded-xl border border-border bg-background p-3 text-sm focus:outline-none text-foreground resize-none"
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 transition-colors shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="flex-1 h-10 rounded-full border border-border text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
