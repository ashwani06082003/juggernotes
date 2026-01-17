'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');

  const [form, setForm] = useState({
    mobile: '',
    city: '',
    state: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      setError('User not found. Please log in again.');
      setLoading(false);
      return;
    }

    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: uid,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        downloads: 0,
        status: 'active',
        country: 'India',
        created_at: new Date().toISOString(),
        mobile: form.mobile,
        city: form.city,
        state: form.state,
        provider: 'google',
      },
      { onConflict: 'email' }
    );

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-16 px-6 py-8 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to JuggerNotes 👋</h2>
      <p className="text-sm text-gray-500 mb-6">
        Just a few more details to complete your profile.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <input
            type="text"
            placeholder="Enter your mobile number"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            className="w-full px-4 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            placeholder="Your city"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            placeholder="Your state"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Set Password</label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-semibold rounded-md ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading onboarding...</div>}>
      <OnboardingForm />
    </Suspense>
  );
}
