'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FcGoogle } from 'react-icons/fc';

export default function GoogleButton({ mode }: { mode: 'signup' | 'login' }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback?mode=${mode}`;

    console.log(`Redirecting to: ${redirectTo}`);

    const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});

    if (error) {
      console.error('Google login failed:', error.message);
      alert('Google login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className={`mt-4 w-full flex items-center justify-center gap-3 py-2 rounded-full font-semibold shadow-sm transition ${
        loading
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
      }`}
    >
      <FcGoogle size={20} />
      <span>{loading ? 'Redirecting...' : 'Continue with Google'}</span>
    </button>
  );
}