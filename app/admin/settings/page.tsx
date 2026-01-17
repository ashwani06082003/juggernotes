'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminSettings() {
  const [admin, setAdmin] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchAdmin = async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching admin:', error.message);
      } else {
        setAdmin(data);
        setEmail(data.email);
        setPassword(data.password);
        setTwoFactor(data.two_factor_enabled);
      }
    };

    fetchAdmin();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('admins')
      .update({
        email,
        password,
        two_factor_enabled: twoFactor,
      })
      .eq('id', admin.id);

    if (error) {
      setStatus('❗ Failed to update settings.');
    } else {
      setStatus('✅ Settings updated successfully.');
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-8 py-6">
      <h1 className="text-2xl font-bold text-blue-700">Admin Settings</h1>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-5 max-w-xl w-full">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={twoFactor}
            onChange={(e) => setTwoFactor(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">Enable 2-Step Login</label>
        </div>

        <button
          onClick={handleSave}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Save Changes
        </button>

        {status && (
          <p
            className={`text-sm font-medium ${
              status.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}