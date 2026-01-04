'use client';
import React, { useState, useEffect } from 'react';
import {
  Users,
  BarChart3,
  Calendar,
  TrendingUp,
  Eye,
  UserPlus,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInterviews: 0,
    totalCandidates: 0,
    recentSignups: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, description: 'Registered users', icon: Users, color: 'text-blue-500' },
    { title: 'Total Interviews', value: stats.totalInterviews, description: 'Created interviews', icon: BarChart3, color: 'text-green-500' },
    { title: 'Total Candidates', value: stats.totalCandidates, description: 'Participants', icon: Calendar, color: 'text-purple-500' },
    { title: 'Recent Signups', value: stats.recentSignups, description: 'Last 7 days', icon: UserPlus, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] p-6 md:p-12 font-sans selection:bg-blue-100">
      {/* Apple-Style Header */}
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F]">Dashboard</h1>
            <p className="text-lg font-medium text-[#86868B]">Platform activity at a glance.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/users">
              <Button variant="outline" className="rounded-full bg-white/80 border-[#D2D2D7] hover:bg-white text-[#0066CC] px-6 h-10 shadow-sm transition-all active:scale-95 font-medium">
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/interviews">
              <Button className="rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white px-6 h-10 shadow-sm transition-all active:scale-95 font-medium">
                View Interviews
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-[24px] hover:shadow-md transition-all duration-500 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[13px] uppercase tracking-wider font-semibold text-[#86868B]">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter">
                {loading ? (
                  <div className="h-10 w-24 bg-gray-200/50 rounded-lg animate-pulse"></div>
                ) : (
                  stat.value.toLocaleString()
                )}
              </div>
              <p className="text-[14px] text-[#86868B] mt-1 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions / Featured Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-none shadow-sm rounded-[28px] p-4 group hover:bg-[#FBFBFC] transition-colors overflow-hidden">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Users className="w-6 h-6 text-[#0071E3]" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Users</CardTitle>
            <CardDescription className="text-md text-[#86868B] leading-snug">
              Review registered users and their detailed activity statistics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users" className="inline-flex items-center text-[#0066CC] font-semibold text-lg hover:gap-3 transition-all">
              Manage accounts <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-[28px] p-4 group hover:bg-[#FBFBFC] transition-colors overflow-hidden">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <BarChart3 className="w-6 h-6 text-[#5E5CE6]" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Analytics</CardTitle>
            <CardDescription className="text-md text-[#86868B] leading-snug">
              Comprehensive metrics on interview success and candidate performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/interviews" className="inline-flex items-center text-[#0066CC] font-semibold text-lg hover:gap-3 transition-all">
              Review metrics <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Status Bar */}
      {loading && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-full shadow-2xl border border-white/20">
          <Loader2 className="w-4 h-4 animate-spin text-[#0071E3]" />
          <span className="text-sm text-[#1D1D1F] font-semibold tracking-tight">Updating Dashboard...</span>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;