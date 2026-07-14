'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  is_published: boolean;
}

export default function FAQManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({
    category: 'general',
    question: '',
    answer: '',
    is_published: true,
  });

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFaqs();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;

    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFaq),
      });
      const data = await res.json();
      if (data.success) {
        toast('FAQ created successfully!', 'success');
        setNewFaq({ category: 'general', question: '', answer: '', is_published: true });
        setIsAdding(false);
        fetchFaqs();
      } else {
        toast(data.error || 'Failed to create FAQ', 'error');
      }
    } catch {
      toast('Network error creating FAQ', 'error');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    try {
      const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFaq),
      });
      const data = await res.json();
      if (data.success) {
        toast('FAQ updated successfully!', 'success');
        setEditingFaq(null);
        fetchFaqs();
      } else {
        toast(data.error || 'Failed to update FAQ', 'error');
      }
    } catch {
      toast('Network error updating FAQ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast('FAQ deleted successfully!', 'success');
        fetchFaqs();
      } else {
        toast(data.error || 'Failed to delete FAQ', 'error');
      }
    } catch {
      toast('Network error deleting FAQ', 'error');
    }
  };

  const filtered = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'general', 'pricing', 'classes', 'location', 'teachers'];

  return (
    <div className="flex flex-col gap-8 w-full relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            AI Knowledge base (FAQs)
          </h1>
          <p className="text-sm text-muted mt-1">
            Maintain questions and answers for your AI receptionist to answer customer requests.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer"
        >
          Add New FAQ
        </button>
      </div>

      {/* FILTER BAR */}
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

        <div className="flex gap-2.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`h-9 px-4 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted border-border hover:bg-secondary'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </Card>

      {/* FAQS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-muted font-medium bg-card rounded-3xl border border-border">
            No FAQs found matching your criteria.
          </div>
        ) : (
          filtered.map((faq) => (
            <Card key={faq.id} className="flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                    {faq.category}
                  </span>
                  {!faq.is_published && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200 uppercase">
                      Draft
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingFaq({ ...faq })}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">{faq.question}</h4>
                <p className="text-xs text-muted leading-relaxed mt-2 whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </div>
            </Card>
          ))
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted">Category</label>
                <select
                  value={newFaq.category}
                  onChange={(e) => setNewFaq((prev) => ({ ...prev, category: e.target.value }))}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                >
                  <option value="general">General</option>
                  <option value="pricing">Pricing</option>
                  <option value="classes">Classes</option>
                  <option value="location">Location</option>
                  <option value="teachers">Teachers</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
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

              <div className="flex flex-col gap-1.5">
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

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="new-publish"
                  checked={newFaq.is_published}
                  onChange={(e) =>
                    setNewFaq((prev) => ({ ...prev, is_published: e.target.checked }))
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label
                  htmlFor="new-publish"
                  className="text-xs font-semibold text-muted select-none"
                >
                  Publish immediately (available to AI Receptionist)
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-secondary cursor-pointer text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 shadow-md cursor-pointer"
                >
                  Create
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
              <div className="flex flex-col gap-1.5">
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
                  <option value="location">Location</option>
                  <option value="teachers">Teachers</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
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

              <div className="flex flex-col gap-1.5">
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

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="edit-publish"
                  checked={editingFaq.is_published}
                  onChange={(e) =>
                    setEditingFaq((prev) =>
                      prev ? { ...prev, is_published: e.target.checked } : null
                    )
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label
                  htmlFor="edit-publish"
                  className="text-xs font-semibold text-muted select-none"
                >
                  Publish FAQ (available to AI Receptionist)
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-secondary cursor-pointer text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
