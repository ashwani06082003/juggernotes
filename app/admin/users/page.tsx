'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AdminUserDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'new' | 'pending'>('all');
  const [newPassword, setNewPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'suspend' | null>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [banReason, setBanReason] = useState('');
  const [modalStep, setModalStep] = useState<'confirm' | 'reason' | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) console.error('Error fetching users:', error.message);
      else setUsers(data || []);
      setLoading(false);
    })();
  }, []);

  const updateUser = async (id: string, updates: any, successMsg?: string) => {
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (error) alert(`${successMsg || 'Update'} failed.`);
    else {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
      if (successMsg) alert(successMsg);
    }
    resetModals();
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) alert('Delete failed.');
    else setUsers((prev) => prev.filter((u) => u.id !== id));
    resetModals();
  };

  const resetModals = () => {
    setConfirmAction(null);
    setTargetUser(null);
    setBanReason('');
    setModalStep(null);
  };

  const handleSuspendConfirmed = () => {
    if (!banReason.trim()) return alert('Please enter a valid ban reason.');
    updateUser(targetUser.id, { status: 'banned', ban_reason: banReason }, 'User suspended.');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filters = ['all', 'active', 'banned', 'new', 'pending'] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 px-4 md:px-8 py-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-3xl font-bold text-blue-700">Admin User Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize ${filter === f ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg bg-white/80 backdrop-blur-md">

        <div className="mb-6 flex items-center gap-3 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search users by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 bg-white shadow-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div> 

        <table className="min-w-full">
          <thead className="bg-gray-50 text-gray-700 text-sm font-medium">
            <tr>
              {['Name', 'Email', 'Joined', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-6 text-center text-gray-500">Loading...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="py-6 text-center text-gray-500">No users found.</td></tr>
            ) : (
              filteredUsers.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border-t hover:bg-blue-50/40">
                  <td className="px-6 py-3 font-medium">{u.name}</td>
                  <td className="px-6 py-3 text-gray-600">{u.email}</td>
                  <td className="px-6 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${u.status === 'banned' ? 'bg-red-100 text-red-700' : u.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-3 space-x-2 text-sm">
                    {u.status === 'banned' ? (
                      <button onClick={() => updateUser(u.id, { status: 'active' }, 'User unbanned.')} className="text-green-600 hover:underline">Unban</button>
                    ) : (
                      <button onClick={() => { setConfirmAction('suspend'); setTargetUser(u); setModalStep('confirm'); }} className="text-yellow-600 hover:underline">Suspend</button>
                    )}
                    <button onClick={() => { setConfirmAction('delete'); setTargetUser(u); }} className="text-red-600 hover:underline">Delete</button>
                    {u.status === 'pending' && <button onClick={() => updateUser(u.id, { status: 'active' }, 'User approved.')} className="text-green-600 hover:underline">Approve</button>}
                    <button onClick={() => setSelectedUser(u)} className="text-blue-600 hover:underline">Reset</button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="mt-8 max-w-xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Reset Password for {selectedUser.name}</h2>
          <input type="text" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border px-3 py-2 rounded-md text-sm mb-3 focus:ring-2 focus:ring-blue-500" />
          <button onClick={() => updateUser(selectedUser.id, { password: newPassword }, 'Password updated!')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Reset Password</button>
        </div>
      )}

      {confirmAction === 'delete' && targetUser && (
        <ConfirmModal
          title="Delete this user?"
          email={targetUser.email}
          onYes={() => deleteUser(targetUser.id)}
          onNo={resetModals}
          yesColor="red"
        />
      )}

      {confirmAction === 'suspend' && targetUser && modalStep === 'confirm' && (
        <ConfirmModal
          title="Suspend this user?"
          email={targetUser.email}
          onYes={() => setModalStep('reason')}
          onNo={resetModals}
          yesColor="yellow"
        />
      )}

      {confirmAction === 'suspend' && targetUser && modalStep === 'reason' && (
        <ReasonModal
          value={banReason}
          onChange={setBanReason}
          onConfirm={handleSuspendConfirmed}
          onCancel={resetModals}
        />
      )}
    </motion.div>
  );
}

const ConfirmModal = ({ title, email, onYes, onNo, yesColor }: any) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full text-center space-y-4">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-600">{email}</p>
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={onYes} className={`px-4 py-2 bg-${yesColor}-600 text-white rounded hover:bg-${yesColor}-700`}>Yes</button>
        <button onClick={onNo} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">No</button>
      </div>
    </div>
  </div>
);

const ReasonModal = ({ value, onChange, onConfirm, onCancel }: any) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full text-center space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Enter Ban Reason</h2>
      <input type="text" placeholder="Reason for suspension" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={onConfirm} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Confirm Suspend</button>
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
      </div>
    </div>
  </div>
);
