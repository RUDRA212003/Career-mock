'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        toast.error('Failed to complete sign in');
        console.error('Session error:', error);
        setLoading(false);
        router.push('/login');
        return;
      }

      const user = session.user;
      const email = user.email;

      // 🔹 Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, role, banned')
        .eq('email', email)
        .single();

      // Ignore "not found" error
      if (fetchError && fetchError.code !== 'PGRST116') {
        toast.error('Error fetching user profile');
        console.error(fetchError);
        setLoading(false);
        router.push('/login');
        return;
      }

      // 🔒 Banned user
      if (existingUser?.banned) {
        await supabase.auth.signOut();
        toast.error('Your account has been banned.');
        setLoading(false);
        router.push('/login');
        return;
      }

      let finalRole = 'candidate';

      // 🆕 New user
      if (!existingUser) {
        const savedRole = localStorage.getItem('pending_role') || 'candidate';
        finalRole = savedRole;

        const { error: insertError } = await supabase.from('users').insert([
          {
            email: user.email,
            name: user.user_metadata?.full_name || 'No Name',
            role: savedRole,
          },
        ]);

        if (insertError && insertError.code !== '23505') {
          toast.error('Failed to create user profile');
          console.error(insertError);
          setLoading(false);
          router.push('/login');
          return;
        }

        toast.success('Profile created successfully');
      } else {
        finalRole = existingUser.role;
      }

      localStorage.removeItem('pending_role');
      setLoading(false);

      // ✅ CORRECT REDIRECTS (Option 1)
      if (finalRole === 'recruiter') {
        router.push('/main/recruiter/dashboard');
      } else {
        router.push('/main/candidate/dashboard');
      }
    };

    handleAuthRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finalizing login, please wait...</p>
        </div>
      </div>
    );
  }

  return null;
}
