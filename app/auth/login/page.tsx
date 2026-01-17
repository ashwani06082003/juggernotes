"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GoogleButton from '@/components/GoogleButton';

export const dynamic = "force-dynamic";

function LoginInner() {
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Automatically hide alert after a few seconds
  useEffect(() => {
    if (status) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Handle query params (already/banned)
  useEffect(() => {
    const already = searchParams.get('already');
    const banned = searchParams.get('banned');
    const reason = searchParams.get('reason');

    if (already === 'true') {
      setShowNotice(true);
      setStatus('ℹ️ You’re already registered. Please log in.');
    }

    if (banned === 'true' && reason) {
      const decodedReason = decodeURIComponent(reason);
      const message = [
        '🚫 Access Denied.',
        'Your account has been restricted due to:',
        `"${decodedReason}".`,
        'If you believe this is a mistake, please contact support.'
      ].join(' ');
      setShowNotice(true);
      setStatus(message);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return setStatus('❗ Please enter a valid email address.');
    }
    if (!trimmedPassword) {
      return setStatus('❗ Password cannot be empty.');
    }

    try {
      if (role === 'user') {
        const { data: userRecord, error: statusError } = await supabase
          .from('users')
          .select('status, ban_reason, provider')
          .eq('email', trimmedEmail)
          .single();

        if (statusError || !userRecord) {
          return setStatus('❗ Unable to verify your account. Please try signing up.');
        }
        if (userRecord.provider === 'google') {
          return setStatus('🔐 This account uses Google authentication. Please log in using the Google button below.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (userRecord.status === 'banned') {
          const reason = userRecord.ban_reason?.trim() || 'a violation of our terms of service';
          const message = [
            '🚫 Access Denied.',
            'Your account has been restricted due to:',
            `"${reason}".`,
            'If you believe this is a mistake, please contact support.'
          ].join(' ');
          return setStatus(message);
        }

        if (error) {
          console.error('Auth login error:', error.message);
          if (error.message.includes('Invalid login credentials')) {
            return setStatus('❗ Invalid email or password.');
          }
          if (error.message.includes('Email not confirmed')) {
            return setStatus('📧 Please confirm your email before logging in.');
          }
          if (error.message.includes('Bad Request') || error.message.includes('invalid')) {
            return setStatus('❗ Invalid or self-made email. Please use a valid Gmail or work email.');
          }
          if (error.message.includes('User not found')) {
            return setStatus('❗ This email is not registered. Please sign up first.');
          }
          return setStatus('❗ Login failed. Please try again.');
        }

        setStatus('✅ Welcome back!');
        router.refresh();
        router.push('/');
      } else {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', trimmedEmail)
          .eq('password', trimmedPassword)
          .single();

        if (error || !data) {
          return setStatus('❗ Invalid admin credentials.');
        }

        setStatus('✅ Admin access granted.');
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      setStatus('❗ Unexpected error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl animate-pulse delay-200" />
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-200 relative z-10">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-8 tracking-tight">
          Welcome!
        </h1>

        {showAlert && (
          <div
            className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-semibold px-4 py-2 rounded-lg border z-50 ${
              status.startsWith('✅')
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-red-50 text-red-700 border-red-300'
            }`}
          >
            {status}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setRole('user')}
            className={`px-6 py-2 rounded-full font-semibold transition duration-300 ${
              role === 'user'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-6 py-2 rounded-full font-semibold transition duration-300 ${
              role === 'admin'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Admin
          </button>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg text-gray-800 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
              placeholder="Email"
              required
            />
            <label className="absolute left-4 top-2 text-sm text-gray-700 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg text-gray-800 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
              placeholder="Password"
              required
            />
            <label className="absolute left-4 top-2 text-sm text-gray-700 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
              Password
            </label>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
          >
            Login as {role === 'user' ? 'User' : 'Admin'}
          </button>
        </div>

        {role === 'user' && (
          <div className="pt-4">
            <GoogleButton mode="login" />
          </div>
        )}

        {role === 'user' && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Don’t have an account?{' '}
            <span
              onClick={() => router.push('/auth/signup')}
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              Sign up now
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginInner />
    </Suspense>
  );
}
