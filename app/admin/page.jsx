'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, BarChart3, Calendar, UserPlus, Loader2, ChevronRight,
  Wallet, Zap, RefreshCcw, Activity, AlertCircle
} from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInterviews: 0,
    totalCandidates: 0,
    recentSignups: 0,
  });
  
  const [vapiUsage, setVapiUsage] = useState({ totalCost: 0, totalMinutes: 0 });
  const [loading, setLoading] = useState(true);
  const [vapiLoading, setVapiLoading] = useState(false);

  // IMPORTANT: Set this to the total amount of money you have EVER added to Vapi
  // For example, if you topped up $50, put 50.00 here.
  const TOTAL_DEPOSITED = 50.00; 

  useEffect(() => {
    fetchDashboardStats();
    fetchVapiUsage();
  }, []);

  const fetchVapiUsage = async () => {
    try {
      setVapiLoading(true);
      const res = await fetch('/api/admin/vapi-usage');
      const data = await res.json();
      if (data.totalCost !== undefined) {
        setVapiUsage({
          totalCost: data.totalCost,
          totalMinutes: data.totalMinutes
        });
      }
    } catch (error) {
      console.error('Error fetching Vapi usage');
      toast.error("Could not sync Vapi credits");
    } finally {
      setVapiLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: interviewCount } = await supabase.from('Interviews').select('*', { count: 'exact', head: true });
      const { count: candidateCount } = await supabase.from('interview_results').select('*', { count: 'exact', head: true });
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: recentSignups } = await supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalUsers: userCount || 0,
        totalInterviews: interviewCount || 0,
        totalCandidates: candidateCount || 0,
        recentSignups: recentSignups || 0,
      });
    } catch (error) {
      toast.error('Failed to load platform stats');
    } finally {
      setLoading(false);
    }
  };

  // Live Calculation
  const actualRemaining = TOTAL_DEPOSITED - vapiUsage.totalCost;
  const usagePercentage = (vapiUsage.totalCost / TOTAL_DEPOSITED) * 100;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] p-6 md:p-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Admin Hub</h1>
            <p className="text-lg font-medium text-[#86868B]">Real-time AI Interview monitoring.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchVapiUsage} variant="outline" className="rounded-full bg-white border-[#D2D2D7] px-5 h-10 shadow-sm transition-all active:scale-95 font-medium">
              <RefreshCcw className={`w-4 h-4 mr-2 ${vapiLoading ? 'animate-spin' : ''}`} />
              Refresh Credits
            </Button>
            <Link href="/admin/users">
              <Button variant="outline" className="rounded-full bg-white border-[#D2D2D7] px-6 h-10 font-medium">Manage Users</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* VAPI WALLET TRACKER */}
      <div className="max-w-7xl mx-auto mb-10">
        <Card className="bg-white border-none shadow-sm rounded-[32px] overflow-hidden group">
          <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-10">
            
            {/* Balance Group */}
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center transition-transform group-hover:rotate-6">
                <Wallet className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] mb-1">Available Credits</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black tracking-tighter ${actualRemaining < 5 ? 'text-red-500' : 'text-[#1D1D1F]'}`}>
                    ${actualRemaining.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-gray-400 italic">USD</span>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="flex-1 w-full max-w-sm hidden md:block px-4">
               <div className="flex justify-between text-[10px] font-bold mb-2 uppercase text-gray-400 tracking-widest">
                  <span>Usage of ${TOTAL_DEPOSITED} Deposit</span>
                  <span>{usagePercentage.toFixed(1)}% Spent</span>
               </div>
               <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercentage}%` }}
                    className={`h-full transition-all duration-1000 ${usagePercentage > 85 ? 'bg-red-500' : 'bg-orange-500'}`}
                  />
               </div>
            </div>

            {/* Breakdown */}
            <div className="flex items-center gap-10 border-l border-gray-100 pl-4">
               <div className="text-center lg:text-left">
                  <p className="text-[10px] font-bold uppercase text-[#86868B] mb-1">Total Spent</p>
                  <p className="text-2xl font-black text-gray-400">${vapiUsage.totalCost.toFixed(2)}</p>
               </div>
               <div className="text-center lg:text-left">
                  <p className="text-[10px] font-bold uppercase text-[#86868B] mb-1">Airtime</p>
                  <p className="text-2xl font-black text-[#1D1D1F]">{vapiUsage.totalMinutes}m</p>
               </div>
            </div>

            <Link href="https://dashboard.vapi.ai/" target="_blank">
                <Button className="rounded-full bg-black hover:bg-gray-800 text-white px-8 h-14 font-bold shadow-lg transition-all active:scale-95">
                  Top Up API
                </Button>
            </Link>
          </div>

          {actualRemaining < 5 && (
            <div className="bg-red-500 py-2 text-center text-white text-[10px] font-black uppercase tracking-widest">
              Critical Warning: Credits nearly exhausted. Interview sessions may fail.
            </div>
          )}
        </Card>
      </div>

      {/* Primary Platform Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Platform Users" value={stats.totalUsers} icon={Users} color="text-blue-500" loading={loading} description="Total registered accounts" />
        <StatCard title="Active Jobs" value={stats.totalInterviews} icon={BarChart3} color="text-green-500" loading={loading} description="Total interview templates" />
        <StatCard title="Interviews Taken" value={stats.totalCandidates} icon={Activity} color="text-purple-500" loading={loading} description="Candidate submissions" />
        <StatCard title="New Signups" value={stats.recentSignups} icon={UserPlus} color="text-orange-500" loading={loading} description="Past 7 day growth" />
      </div>

      {/* Navigation Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FeaturedCard 
            title="User Database" 
            description="Manage user permissions, monitor credit distribution, and review account security." 
            icon={Users} 
            iconBg="bg-blue-50" 
            iconColor="text-[#0071E3]" 
            href="/admin/users" 
            linkText="View all users" 
        />
        <FeaturedCard 
            title="Interview Logs" 
            description="Analyze candidate performance across various job roles and verify AI scoring accuracy." 
            icon={BarChart3} 
            iconBg="bg-indigo-50" 
            iconColor="text-[#5E5CE6]" 
            href="/admin/interviews" 
            linkText="Open analytics" 
        />
      </div>

      {/* Floating Global Loader */}
      {loading && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-full shadow-2xl border border-white/20">
          <Loader2 className="w-4 h-4 animate-spin text-[#0071E3]" />
          <span className="text-sm text-[#1D1D1F] font-semibold tracking-tight">Syncing Database...</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, loading, description }) {
  return (
    <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-[24px] hover:shadow-md transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#86868B]">{title}</CardTitle>
        <Icon className={`w-5 h-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tighter">
          {loading ? <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg" /> : value.toLocaleString()}
        </div>
        <p className="text-xs text-[#86868B] mt-1 font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}

function FeaturedCard({ title, description, icon: Icon, iconBg, iconColor, href, linkText }) {
  return (
    <Card className="bg-white border-none shadow-sm rounded-[32px] p-6 group hover:bg-[#FBFBFC] transition-colors overflow-hidden">
      <CardHeader>
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
        <CardDescription className="text-[#86868B] leading-snug">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={href} className="inline-flex items-center text-[#0066CC] font-bold text-lg hover:gap-3 transition-all">
          {linkText} <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;