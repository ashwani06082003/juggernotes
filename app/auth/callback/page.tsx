'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // ✅ keep this only

function AuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  useEffect(() => {
    const handleAuth = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (!sessionData?.session || sessionError) {
        router.push('/auth/login');
        return;
      }

      const user = sessionData.session.user;

      const { data: existingUser } = await supabase
        .from('users')
        .select('id, status, ban_reason')
        .eq('email', user.email)
        .single();

      if (existingUser?.status === 'banned') {
        const reason = existingUser.ban_reason?.trim() || 'a violation of our terms of service';
        await supabase.auth.signOut();
        const encodedReason = encodeURIComponent(reason);
        router.push(`/auth/login?banned=true&reason=${encodedReason}`);
        return;
      }

      if (existingUser) {
        if (mode === 'signup') {
          router.push('/auth/login?already=true');
        } else {
          router.push('/');
        }
      } else {
        await supabase.from('users').insert({
          email: user.email,
          name: user.user_metadata?.name || '',
          provider: 'google',
          status: 'active',
          downloads: 0,
        });

        router.push(`/onboarding?uid=${user.id}`);
      }
    };

    handleAuth();
  }, [router, mode]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Redirecting...</div>}>
      <AuthHandler />
    </Suspense>
  );
}