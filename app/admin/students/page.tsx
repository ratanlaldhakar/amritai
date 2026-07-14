'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { TableSkeleton } from '@/components/skeleton';
import { useToast } from '@/components/toast';

interface StudentState {
  id: string;
  phone_number: string;
  name: string;
  status: string;
  trial_date: string | null;
  batch_id: string | null;
  notes: string | null;
}

// Mock students data matching DB Student model
const initialStudents: StudentState[] = [
  {
    id: '1',
    phone_number: '+91 98765 43210',
    name: 'Aarav Mehta',
    status: 'active',
    trial_date: null,
    batch_id: 'batch-1',
    notes: 'Prefers morning slots.',
  },
  {
    id: '2',
    phone_number: '+91 99999 88888',
    name: 'John Doe',
    status: 'trial_booked',
    trial_date: '2026-07-20T10:00:00Z',
    batch_id: null,
    notes: 'Trial scheduled for next Monday.',
  },
  {
    id: '3',
    phone_number: '+91 88888 77777',
    name: 'Amit Sharma',
    status: 'lead',
    trial_date: null,
    batch_id: null,
    notes: 'Inquired about therapeutic classes.',
  },
  {
    id: '4',
    phone_number: '+91 77777 66666',
    name: 'Neha Gupta',
    status: 'inactive',
    trial_date: null,
    batch_id: 'batch-2',
    notes: 'On leave for 2 weeks.',
  },
];

const mockBatches = [
  { id: 'batch-1', name: 'Morning Hatha Flow (6:00 AM)' },
  { id: 'batch-2', name: 'Evening Power Vinyasa (7:00 PM)' },
];

export default function StudentsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentState[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingStudent, setEditingStudent] = useState<StudentState | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setStudents((prev) => prev.map((s) => (s.id === editingStudent.id ? editingStudent : s)));
    toast(`Successfully updated student profile for ${editingStudent.name}`, 'success');
    setEditingStudent(null);
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) || s.phone_number.includes(search);
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8 w-full relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Students</h1>
          <p className="text-sm text-muted mt-1">
            Manage practitioners, registrations, and batch details.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <Card className="py-4 px-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-xs relative">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-full border border-border bg-background px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-full border border-border bg-background px-4 text-sm focus:outline-none text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="trial_booked">Trial Booked</option>
            <option value="lead">Leads</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* STUDENTS TABLE */}
      <Card>
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold">
                  <th className="pb-3 pr-4 font-semibold">Name</th>
                  <th className="pb-3 px-4 font-semibold">Phone</th>
                  <th className="pb-3 px-4 font-semibold">Status</th>
                  <th className="pb-3 px-4 font-semibold">Batch</th>
                  <th className="pb-3 pl-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => {
                  const batchName =
                    mockBatches.find((b) => b.id === student.batch_id)?.name || 'Not Assigned';

                  const statusBadges = {
                    active:
                      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                    trial_booked:
                      'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
                    lead: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                    inactive: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
                  };

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors"
                    >
                      <td className="py-4 pr-4 font-semibold text-foreground">{student.name}</td>
                      <td className="py-4 px-4 font-mono text-muted text-xs">
                        {student.phone_number}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadges[student.status as keyof typeof statusBadges]}`}
                        >
                          {student.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted text-xs font-semibold">{batchName}</td>
                      <td className="py-4 pl-4 text-right">
                        <button
                          onClick={() => setEditingStudent({ ...student })}
                          className="h-8 px-3 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer text-foreground"
                        >
                          Edit Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted font-medium">
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* EDIT DRAWER PANEL (Glassmorphism Slide Over) */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-card/90 border-l border-border backdrop-blur-lg shadow-2xl p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h2 className="text-xl font-bold text-foreground">Edit Student Profile</h2>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-xs hover:bg-secondary cursor-pointer text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) =>
                      setEditingStudent((prev) => (prev ? { ...prev, name: e.target.value } : null))
                    }
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    disabled
                    value={editingStudent.phone_number}
                    className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-muted cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted">Status</label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) =>
                      setEditingStudent((prev) =>
                        prev ? { ...prev, status: e.target.value as any } : null
                      )
                    }
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                  >
                    <option value="lead">Lead</option>
                    <option value="trial_booked">Trial Booked</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted">Class Batch Slot</label>
                  <select
                    value={editingStudent.batch_id || ''}
                    onChange={(e) =>
                      setEditingStudent((prev) =>
                        prev ? { ...prev, batch_id: e.target.value || null } : null
                      )
                    }
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none text-foreground"
                  >
                    <option value="">Not Assigned</option>
                    {mockBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted">Notes</label>
                  <textarea
                    rows={3}
                    value={editingStudent.notes || ''}
                    onChange={(e) =>
                      setEditingStudent((prev) =>
                        prev ? { ...prev, notes: e.target.value } : null
                      )
                    }
                    className="rounded-xl border border-border bg-background p-3 text-sm focus:outline-none text-foreground resize-none"
                  />
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 transition-colors shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="flex-1 h-10 rounded-full border border-border text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
