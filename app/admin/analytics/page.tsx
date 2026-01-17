'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';

export default function AnalyticsDashboard() {
  const [topNotes, setTopNotes] = useState<{ subject: string; main_heading: string; downloads: number }[]>([]);
  const [dailyDownloads, setDailyDownloads] = useState<{ date: string; downloads: number }[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<{ name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);

    // ✅ Top downloaded notes with subject
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('subject, main_heading, downloads')
      .order('downloads', { ascending: false })
      .limit(5);

    if (notesError) console.error('Notes fetch error:', notesError);
    setTopNotes((notes || []).map(n => ({
      subject: n.subject || 'Unknown',
      main_heading: n.main_heading || 'Untitled',
      downloads: Number(n.downloads) || 0,
    })));

    // ✅ Daily downloads (mocked)
    const mockDownloads = [
      { date: 'Oct 20', downloads: 12 },
      { date: 'Oct 21', downloads: 18 },
      { date: 'Oct 22', downloads: 9 },
      { date: 'Oct 23', downloads: 22 },
      { date: 'Oct 24', downloads: 15 },
    ];
    setDailyDownloads(mockDownloads);

    // ✅ Inactive users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('name, email, created_at');

    if (usersError) console.error('Users fetch error:', usersError);

    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);

    const inactive = (users || []).filter(u => {
      const last = u.created_at ? new Date(u.created_at) : null;
      return !last || last < threshold;
    });

    setInactiveUsers(inactive.map(u => ({
      name: u.name || 'Unnamed',
      email: u.email || 'unknown@example.com',
    })));

    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

//   useEffect(() => {
//   const interval = setInterval(() => {
//     fetchAnalytics();
//   }, 3000); // every 3 seconds

//   return () => clearInterval(interval);
// }, []); for refershing the page every 3 seconds

  useEffect(() => {
    const notesSub = supabase
      .channel('realtime-notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, fetchAnalytics)
      .subscribe();

    const usersSub = supabase
      .channel('realtime-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(notesSub);
      supabase.removeChannel(usersSub);
    };
  }, []);

  return (
    <div className="space-y-10 px-4 md:px-8 py-6">
      <h1 className="text-2xl font-bold text-blue-700">Download & Traffic Analytics</h1>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Top Notes */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Top Downloaded Notes</h2>
            {topNotes.length === 0 ? (
              <p className="text-sm text-gray-400">No downloads yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topNotes}>
                  <XAxis dataKey="main_heading" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const note = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-300 rounded shadow p-2 text-sm">
                            <p><strong>Subject:</strong> {note.subject}</p>
                            <p><strong>Downloads:</strong> {note.downloads}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="downloads" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Daily Downloads */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Daily Downloads</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyDownloads}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="downloads" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Inactive Users */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Inactive Users (30+ days)</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {inactiveUsers.length === 0 ? (
                <li className="text-gray-400">No inactive users 🎉</li>
              ) : (
                inactiveUsers.map((u, i) => (
                  <li key={`${u.email}-${i}`}>
                    {u.name} — <span className="text-gray-500">{u.email}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}