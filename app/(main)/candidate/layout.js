'use client';
import React, { useEffect, useState } from 'react';
import DashboardProvider from './provider';
import WelcomeContainer from './dashboard/_components/WelcomeContainer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function DashboardLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        toast.error('Please log in to continue.');
        router.replace('/login'); // Redirect to login if not authenticated
        return;
      }

      setLoading(false);
    };

    checkAuth();

    // Listen for logout events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [router]);

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
    <DashboardProvider>
      <div className="p-10 w-full space-y-6">
        <WelcomeContainer />
        {children}
      </div>
      <SpeedInsights />
    </DashboardProvider>
  );
}

export default DashboardLayout;
