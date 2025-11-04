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

      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: interviewCount } = await supabase
        .from('Interviews')
        .select('*', { count: 'exact', head: true });

      const { count: candidateCount } = await supabase
        .from('interview_results')
        .select('*', { count: 'exact', head: true });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentSignups } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

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
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'Registered users',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Total Interviews',
      value: stats.totalInterviews,
      description: 'Created interviews',
      icon: BarChart3,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      description: 'Interview participants',
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Recent Signups',
      value: stats.recentSignups,
      description: 'Last 7 days',
      icon: UserPlus,
      gradient: 'from-orange-500 to-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">
              Monitor platform activity and manage operations
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/users">
              <Button
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/interviews">
              <Button
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Interviews
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10`}
            ></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} text-white`}
              >
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  stat.value.toLocaleString()
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Users className="w-5 h-5 text-blue-600" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage all registered users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Monitor user activity, manage accounts, and view user statistics
              effortlessly with real-time insights.
            </p>
            <Link href="/admin/users">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Eye className="w-4 h-4 mr-2" />
                View All Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Interview Analytics
            </CardTitle>
            <CardDescription>
              Analyze interview performance and results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Review completed interviews, track performance metrics, and gain
              insights into candidate performance.
            </p>
            <Link href="/admin/interviews">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Loading Spinner (mobile fallback) */}
      {loading && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-lg border">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-700 font-medium">Loading...</span>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
