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
  priority: number;
  language: string;
  keywords: string[] | null;
  tags: string[] | null;
  embedding_status: string;
  created_at: string;
  updated_at: string;
}

// Custom Markdown-to-HTML Renderer Utility
export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Escape HTML to prevent XSS
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* -> <em>text</em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Code blocks: ```code``` -> pre/code
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-secondary p-3 rounded-xl text-xs font-mono my-2 border border-border overflow-x-auto text-foreground"><code>$1</code></pre>');

  // Inline code: `code` -> code
  html = html.replace(/`(.*?)`/g, '<code class="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono border border-border text-foreground">$1</code>');

  // Links: [text](url) -> anchor tag
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">$1</a>');

  // Parse lines for Headings, Lists, etc.
  const lines = html.split('\n');
  let inList = false;
  let inOrderedList = false;
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith('### ')) {
      return `<h3 class="text-sm font-bold text-foreground mt-4 mb-2">${trimmed.slice(4)}</h3>`;
    }
    if (trimmed.startsWith('## ')) {
      return `<h2 class="text-base font-bold text-foreground mt-5 mb-2">${trimmed.slice(3)}</h2>`;
    }
    if (trimmed.startsWith('# ')) {
      return `<h1 class="text-lg font-extrabold text-foreground mt-6 mb-3">${trimmed.slice(2)}</h1>`;
    }

    // Horizontal rule
    if (trimmed === '---') {
      return '<hr class="border-border my-4" />';
    }

    // Bullet lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listContent = trimmed.slice(2);
      let prefix = '';
      if (!inList) {
        prefix = '<ul class="list-disc pl-5 my-2 flex flex-col gap-1 text-muted text-xs">';
        inList = true;
      }
      return `${prefix}<li>${listContent}</li>`;
    } else if (inList && trimmed === '') {
      inList = false;
      return '</ul>';
    }

    // Ordered lists
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      const listContent = olMatch[2];
      let prefix = '';
      if (!inOrderedList) {
        prefix = '<ol class="list-decimal pl-5 my-2 flex flex-col gap-1 text-muted text-xs">';
        inOrderedList = true;
      }
      return `${prefix}<li>${listContent}</li>`;
    } else if (inOrderedList && trimmed === '') {
      inOrderedList = false;
      return '</ol>';
    }

    return line;
  });

  let result = processedLines.join('\n');
  if (inList) result += '</ul>';
  if (inOrderedList) result += '</ol>';

  // Standard line-break handling
  return result
    .replace(/\n/g, '<br />')
    .replace(/<\/ul><br \/>/g, '</ul>')
    .replace(/<\/ol><br \/>/g, '</ol>')
    .replace(/<\/pre><br \/>/g, '</pre>')
    .replace(/<\/h3><br \/>/g, '</h3>')
    .replace(/<\/h2><br \/>/g, '</h2>')
    .replace(/<\/h1><br \/>/g, '</h1>')
    .replace(/<hr class="border-border my-4" \/><br \/>/g, '<hr class="border-border my-4" />');
}

// Markdown Rich Text Editor Component
interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  id: string;
}

function MarkdownEditor({ value, onChange, id }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById(id) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  return (
    <div className="border border-border rounded-2xl bg-background overflow-hidden flex flex-col shadow-inner">
      {/* Toolbar & Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-secondary/40 px-3 py-2 gap-2">
        {/* Formatting Actions */}
        {activeTab === 'write' ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => insertText('**', '**')}
              className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-xs font-bold text-foreground transition-colors cursor-pointer"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertText('*', '*')}
              className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-xs italic text-foreground transition-colors cursor-pointer"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertText('### ')}
              className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Heading 3"
            >
              H3
            </button>
            <span className="w-px h-4 bg-border my-auto mx-1" />
            <button
              type="button"
              onClick={() => insertText('- ')}
              className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Bullet List"
            >
              •
            </button>
            <button
              type="button"
              onClick={() => insertText('1. ')}
              className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Numbered List"
            >
              1.
            </button>
            <button
              type="button"
              onClick={() => insertText('[', '](url)')}
              className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Insert Link"
            >
              🔗
            </button>
            <button
              type="button"
              onClick={() => insertText('```\n', '\n```')}
              className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Code Block"
            >
              &lt;&gt;
            </button>
          </div>
        ) : (
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground px-2 py-1">
            Verified Knowledge Preview
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-secondary/80 p-0.5 rounded-xl border border-border/80">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'write'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor Input / Viewer */}
      <div className="flex-1 min-h-[160px] flex">
        {activeTab === 'write' ? (
          <textarea
            id={id}
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your answer... support formatted details, lists, bold notes, and links here."
            className="w-full p-4 text-sm bg-background border-0 focus:outline-none focus:ring-0 text-foreground resize-y font-sans leading-relaxed"
          />
        ) : (
          <div className="w-full p-4 text-xs overflow-y-auto leading-relaxed bg-secondary/10 max-h-[300px]">
            {value.trim() ? (
              <div
                className="prose dark:prose-invert font-sans"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
              />
            ) : (
              <p className="text-muted italic">Write some answer text to see a live preview...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// MAIN PAGE COMPONENT
export default function FAQManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingFaq, setEditingFaq] = useState<(Omit<FAQ, 'keywords' | 'tags'> & { keywords: string; tags: string }) | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({
    category: 'general',
    question: '',
    answer: '',
    is_published: true,
    priority: 0,
    language: 'hinglish',
    keywords: '',
    tags: '',
  });

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs);
      }
    } catch {
      toast('Failed to load knowledge base items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast('Question and Answer are required', 'error');
      return;
    }

    try {
      const payload = {
        ...newFaq,
        keywords: newFaq.keywords ? newFaq.keywords.split(',').map((k) => k.trim()).filter(Boolean) : null,
        tags: newFaq.tags ? newFaq.tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
      };

      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast('Knowledge Base FAQ created!', 'success');
        setNewFaq({
          category: 'general',
          question: '',
          answer: '',
          is_published: true,
          priority: 0,
          language: 'hinglish',
          keywords: '',
          tags: '',
        });
        setIsAdding(false);
        fetchFaqs();
      } else {
        toast(data.error || 'Failed to create entry', 'error');
      }
    } catch {
      toast('Network error creating FAQ', 'error');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question.trim() || !editingFaq.answer.trim()) return;

    try {
      const payload = {
        ...editingFaq,
        keywords: editingFaq.keywords ? editingFaq.keywords.split(',').map((k) => k.trim()).filter(Boolean) : null,
        tags: editingFaq.tags ? editingFaq.tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
      };

      const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast('Knowledge Base FAQ updated successfully!', 'success');
        setEditingFaq(null);
        fetchFaqs();
      } else {
        toast(data.error || 'Failed to update entry', 'error');
      }
    } catch {
      toast('Network error updating FAQ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ entry?')) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast('Knowledge Base FAQ deleted!', 'success');
        fetchFaqs();
      } else {
        toast(data.error || 'Failed to delete entry', 'error');
      }
    } catch {
      toast('Network error deleting FAQ', 'error');
    }
  };

  const handleTogglePublish = async (faq: FAQ) => {
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...faq,
          is_published: !faq.is_published,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast(
          faq.is_published
            ? 'FAQ disabled (AI will not retrieve this info)'
            : 'FAQ enabled (AI will now retrieve this info)',
          'success'
        );
        fetchFaqs();
      }
    } catch {
      toast('Network error toggling state', 'error');
    }
  };

  const filtered = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()) ||
      faq.category.toLowerCase().includes(search.toLowerCase()) ||
      (faq.keywords && faq.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()))) ||
      (faq.tags && faq.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'general', 'pricing', 'classes', 'location', 'teachers'];

  const getCategoryCount = (cat: string) => {
    if (cat === 'all') return faqs.length;
    return faqs.filter((f) => f.category === cat).length;
  };

  const getPriorityBadgeStyles = (priority: number) => {
    if (priority >= 8) {
      return 'bg-amber-500/10 text-amber-600 border border-amber-500/25';
    }
    if (priority >= 4) {
      return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25';
    }
    return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20';
  };

  return (
    <div className="flex flex-col gap-8 w-full relative">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-card/65 backdrop-blur-md p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            AI Knowledge Base
          </h1>
          <p className="text-sm text-muted mt-1 font-medium">
            Manage verified information, keywords, languages, and priorities used by the AI receptionist.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md active:scale-98 hover:shadow-primary/20 cursor-pointer w-full sm:w-auto"
        >
          + Add FAQ Entry
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-border/85 bg-card/40 backdrop-blur-md">
        <div className="w-full md:max-w-xs relative">
          <input
            type="text"
            placeholder="Search verified knowledge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-2xl border border-border bg-background/80 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted/70"
          />
          <span className="absolute left-3.5 top-3.5 text-muted text-sm">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3 text-xs bg-secondary/80 hover:bg-secondary p-1 rounded-full text-muted transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Selector */}
        <div className="flex gap-2 flex-wrap justify-end w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`h-9 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background/90 text-muted border-border hover:bg-secondary hover:text-foreground'
              }`}
            >
              <span className="capitalize">{cat}</span>
              <span
                className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                  filterCategory === cat
                    ? 'bg-primary-foreground/25 text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {getCategoryCount(cat)}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* FAQS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-44 w-full rounded-3xl" />
            <Skeleton className="h-44 w-full rounded-3xl" />
          </>
        ) : filtered.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 py-16 text-center text-muted font-bold bg-card/65 backdrop-blur-md rounded-3xl border border-border/80">
            <span className="text-3xl block mb-2">🤷‍♂️</span>
            No verified knowledge entries found.
          </div>
        ) : (
          filtered.map((faq) => (
            <Card
              key={faq.id}
              className={`flex flex-col gap-4 border transition-all duration-300 hover:shadow-lg rounded-3xl bg-card/65 ${
                faq.is_published ? 'border-border/85' : 'border-zinc-200 opacity-75 dark:border-zinc-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center border-b border-border/80 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-wider bg-primary/10 text-primary border border-primary/20 uppercase">
                    {faq.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                    🌐 {faq.language}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase ${getPriorityBadgeStyles(faq.priority)}`}>
                    Priority: {faq.priority}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(faq)}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase cursor-pointer border transition-all ${
                      faq.is_published
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800'
                    }`}
                    title={faq.is_published ? 'Click to Disable' : 'Click to Enable'}
                  >
                    {faq.is_published ? '🟢 Active' : '⚪ Disabled'}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setEditingFaq({
                        ...faq,
                        keywords: faq.keywords ? faq.keywords.join(', ') : '',
                        tags: faq.tags ? faq.tags.join(', ') : '',
                      })
                    }
                    className="text-xs font-bold text-primary hover:underline cursor-pointer transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 flex flex-col gap-2">
                <h4 className="font-extrabold text-foreground text-sm leading-snug">
                  {faq.question}
                </h4>
                <div
                  className="text-xs text-muted leading-relaxed font-normal mt-1 prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(faq.answer) }}
                />

                {/* Keywords & Tags display */}
                {(faq.keywords || faq.tags) && (
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-border/50">
                    {faq.keywords && faq.keywords.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-extrabold text-muted uppercase">Keywords:</span>
                        {faq.keywords.map((k, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[9px] font-medium border border-border">
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                    {faq.tags && faq.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-extrabold text-muted uppercase">Tags:</span>
                        {faq.tags.map((t, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-primary/5 text-primary text-[9px] font-bold border border-primary/10">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="font-extrabold text-xl text-foreground border-b border-border pb-3 mb-4">
              Create Knowledge Base FAQ
            </h3>

            <form onSubmit={handleCreate} className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-sans">Category</label>
                  <select
                    value={newFaq.category}
                    onChange={(e) => setNewFaq((prev) => ({ ...prev, category: e.target.value }))}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                  >
                    <option value="general">General</option>
                    <option value="pricing">Pricing</option>
                    <option value="classes">Classes</option>
                    <option value="location">Location</option>
                    <option value="teachers">Teachers</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Language</label>
                  <select
                    value={newFaq.language}
                    onChange={(e) => setNewFaq((prev) => ({ ...prev, language: e.target.value }))}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                  >
                    <option value="hinglish">Hinglish</option>
                    <option value="hi">Hindi</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority Weight</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newFaq.priority}
                    onChange={(e) =>
                      setNewFaq((prev) => ({ ...prev, priority: Math.max(0, parseInt(e.target.value) || 0) }))
                    }
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What are the yoga fees? / फीस कितनी है?"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq((prev) => ({ ...prev, question: e.target.value }))}
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Keywords (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. fee, price, cost"
                    value={newFaq.keywords}
                    onChange={(e) => setNewFaq((prev) => ({ ...prev, keywords: e.target.value }))}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. billing, pricing"
                    value={newFaq.tags}
                    onChange={(e) => setNewFaq((prev) => ({ ...prev, tags: e.target.value }))}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Answer (Rich Text / Markdown)</label>
                <MarkdownEditor
                  id="new-faq-editor"
                  value={newFaq.answer}
                  onChange={(val) => setNewFaq((prev) => ({ ...prev, answer: val }))}
                />
                <p className="text-[10px] text-muted font-medium mt-1">
                  💡 Hint: Use the editor toolbar to add bold notes, bullet points, headers, or web links.
                </p>
              </div>

              <div className="flex items-center gap-2.5 mt-2 bg-secondary/50 p-3 rounded-2xl border border-border/80">
                <input
                  type="checkbox"
                  id="new-publish"
                  checked={newFaq.is_published}
                  onChange={(e) =>
                    setNewFaq((prev) => ({ ...prev, is_published: e.target.checked }))
                  }
                  className="rounded border-border text-primary focus:ring-primary cursor-pointer h-4 w-4"
                />
                <label
                  htmlFor="new-publish"
                  className="text-xs font-bold text-muted-foreground select-none cursor-pointer"
                >
                  Verify & Enable Immediately (Available to AI Receptionist)
                </label>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-xs font-bold hover:bg-secondary cursor-pointer text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  Create FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="font-extrabold text-xl text-foreground border-b border-border pb-3 mb-4">
              Edit Knowledge Base FAQ
            </h3>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                  <select
                    value={editingFaq.category}
                    onChange={(e) =>
                      setEditingFaq((prev) => (prev ? { ...prev, category: e.target.value } : null))
                    }
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                  >
                    <option value="general">General</option>
                    <option value="pricing">Pricing</option>
                    <option value="classes">Classes</option>
                    <option value="location">Location</option>
                    <option value="teachers">Teachers</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Language</label>
                  <select
                    value={editingFaq.language}
                    onChange={(e) =>
                      setEditingFaq((prev) => (prev ? { ...prev, language: e.target.value } : null))
                    }
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground cursor-pointer"
                  >
                    <option value="hinglish">Hinglish</option>
                    <option value="hi">Hindi</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority Weight</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingFaq.priority}
                    onChange={(e) =>
                      setEditingFaq((prev) =>
                        prev ? { ...prev, priority: Math.max(0, parseInt(e.target.value) || 0) } : null
                      )
                    }
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question}
                  onChange={(e) =>
                    setEditingFaq((prev) => (prev ? { ...prev, question: e.target.value } : null))
                  }
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={editingFaq.keywords}
                    onChange={(e) =>
                      setEditingFaq((prev) => (prev ? { ...prev, keywords: e.target.value } : null))
                    }
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editingFaq.tags}
                    onChange={(e) =>
                      setEditingFaq((prev) => (prev ? { ...prev, tags: e.target.value } : null))
                    }
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Answer (Rich Text / Markdown)</label>
                <MarkdownEditor
                  id="edit-faq-editor"
                  value={editingFaq.answer}
                  onChange={(val) => setEditingFaq((prev) => (prev ? { ...prev, answer: val } : null))}
                />
                <p className="text-[10px] text-muted font-medium mt-1">
                  💡 Hint: Use the editor toolbar to add bold notes, bullet points, headers, or web links.
                </p>
              </div>

              <div className="flex items-center gap-2.5 mt-2 bg-secondary/50 p-3 rounded-2xl border border-border/80">
                <input
                  type="checkbox"
                  id="edit-publish"
                  checked={editingFaq.is_published}
                  onChange={(e) =>
                    setEditingFaq((prev) => (prev ? { ...prev, is_published: e.target.checked } : null))
                  }
                  className="rounded border-border text-primary focus:ring-primary cursor-pointer h-4 w-4"
                />
                <label
                  htmlFor="edit-publish"
                  className="text-xs font-bold text-muted-foreground select-none cursor-pointer"
                >
                  Verify & Enable FAQ (Available to AI Receptionist)
                </label>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="flex-1 h-11 rounded-xl border border-border text-xs font-bold hover:bg-secondary cursor-pointer text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 shadow-md active:scale-98 transition-all cursor-pointer"
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
