'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function RecruiterLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.log('No recruiter session found → redirecting to login');
        toast.error('Please log in to continue.');
        router.push('/login');
        return;
      }

      // Optional: Restrict access to only recruiter users
      if (!data.user.email?.includes('@recruiter')) {
        toast.error('Unauthorized access');
        router.push('/');
        return;
      }

      setUser(data.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth state changes (logout/login)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Recruiter Navigation or Sidebar can go here */}
      {children}
    </div>
  );
}
