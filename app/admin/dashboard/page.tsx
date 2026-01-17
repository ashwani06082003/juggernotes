'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalDownloads: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: users }, { count: notes }, { data: downloads }, { count: messages }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('notes').select('*', { count: 'exact', head: true }),
        supabase.from('notes').select('downloads'),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      ]);

      const totalDownloads = downloads?.reduce((sum, note) => sum + (note.downloads || 0), 0);

      setStats({
        totalUsers: users || 0,
        totalNotes: notes || 0,
        totalDownloads: totalDownloads || 0,
        totalMessages: messages || 0,
      });
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'blue' },
    { label: 'Total Notes', value: stats.totalNotes, color: 'purple' },
    { label: 'Total Downloads', value: stats.totalDownloads, color: 'green' },
    { label: 'Messages Received', value: stats.totalMessages, color: 'red' },
  ];

  return (
    <div className="space-y-8 px-4 md:px-8 py-6">
      <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ label, value, color }) => (
          <div
            key={label}
            className={clsx(
              `rounded-xl p-6 shadow-sm hover:shadow-md transition`,
              `bg-${color}-50 border border-${color}-200`
            )}
          >
            <p className={clsx(`text-${color}-600 font-semibold text-sm`)}>{label}</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">{value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}