'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileEdit,
  FileText,
  BarChart2,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Notes', path: '/admin/notes', icon: FileText },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  { label: 'Blog', path: '/admin/blog', icon: FileEdit },
  { label: 'Feedback', path: '/admin/feedback', icon: MessageSquare },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900 font-[Inter]">
      {/* Sidebar */}
      <aside className="md:w-64 w-full md:h-auto h-fit bg-white/80 backdrop-blur-md border-b md:border-r border-blue-100 shadow-xl flex flex-col rounded-none md:rounded-tr-3xl md:rounded-br-3xl overflow-hidden">
        <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Panel</h1>
          <p className="text-sm opacity-90">Manage your platform</p>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={label}
              href={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium ${
                pathname === path
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md scale-[1.02]'
                  : 'text-gray-700 hover:bg-blue-100/60 hover:text-blue-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-100">
          <a href="/auth/login">
            <button className="w-full flex items-center justify-center gap-2 text-gray-700 font-semibold hover:text-red-600 transition">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </a>
        </div>
      </aside>

      {/* Main Section */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-blue-100 flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-blue-700 tracking-tight">
            {navItems.find((item) => item.path === pathname)?.label || 'Admin'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Hello, Admin</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-white/50 backdrop-blur-sm rounded-tl-3xl">
          <div className="animate-fadeIn">{children}</div>
        </div>
      </main>
    </div>
  );
}