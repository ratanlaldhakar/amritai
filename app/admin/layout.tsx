'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/toast';

const navItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/students', label: 'Students', icon: '👥' },
  { href: '/admin/leads', label: 'Leads', icon: '⚡' },
  { href: '/admin/messages', label: 'Messages', icon: '💬' },
  { href: '/admin/faqs', label: 'FAQs', icon: '❓' },
  { href: '/admin/settings', label: 'AI Settings', icon: '⚙️' },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: '📱' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Force light mode on load to override any pre-existing browser state
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground font-sans flex transition-colors duration-300">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card/70 backdrop-blur-md transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Logo Brand area */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
            <span className="text-xl font-bold bg-primary text-primary-foreground h-9 w-9 rounded-full flex items-center justify-center shadow-md">
              ॐ
            </span>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-none text-foreground">Amrit Yoga</span>
                <span className="text-[10px] text-muted font-medium mt-1">AI Admin Panel</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-base group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  {isSidebarOpen && <span>{item.label}</span>}

                  {/* Tooltip for collapsed sidebar */}
                  {!isSidebarOpen && (
                    <div className="absolute left-20 scale-0 group-hover:scale-100 bg-zinc-950 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg font-medium transition-all duration-150 whitespace-nowrap pointer-events-none z-40">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Collapse controller */}
          <div className="p-4 border-t border-border flex justify-end">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-xs hover:bg-secondary cursor-pointer text-foreground"
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarOpen ? 'pl-64' : 'pl-20'
          }`}
        >
          {/* TOP HEADER */}
          <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <span className="text-xs text-green-600 flex items-center gap-1.5 font-semibold bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
                System Realtime Connected
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Dark mode toggler */}
              <button
                onClick={toggleDarkMode}
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors shadow-sm cursor-pointer text-foreground"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              {/* Profile Card */}
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  AD
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold leading-none text-foreground">
                    Admin Raipur
                  </span>
                  <span className="text-[10px] text-muted mt-0.5">Coordinator</span>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN PAGE WRAPPER */}
          <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
