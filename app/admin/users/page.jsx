'use client';
import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Ban,
  ArrowLeft,
  Trash2,
  Loader2, // Added missing import
  CreditCard
} from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import moment from 'moment';
import { useRouter } from 'next/navigation';

function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showBanned, setShowBanned] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    totalInterviews: 0,
    totalCandidates: 0,
    recentSignups: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, sortBy, sortOrder, showBanned]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;

      const { count: interviewCount } = await supabase
        .from('Interviews')
        .select('*', { count: 'exact', head: true });

      const { count: candidateCount } = await supabase
        .from('interview_results')
        .select('*', { count: 'exact', head: true });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUsers = data.filter(u => new Date(u.created_at) >= sevenDaysAgo);
      const banned = data.filter(u => u.banned).length;
      const active = data.filter(u => !u.banned).length;

      setStats({
        totalUsers: data.length,
        activeUsers: active,
        bannedUsers: banned,
        totalInterviews: interviewCount || 0,
        totalCandidates: candidateCount || 0,
        recentSignups: recentUsers.length,
      });

      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users.filter(u => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBanned = showBanned || !u.banned;
      return matchesSearch && matchesBanned;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    setFilteredUsers(filtered);
  };

  const exportUsersToCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error('No users to export');
      return;
    }

    const csvHeader = [['Name', 'Email', 'Created Date', 'Credits', 'Status']];
    const csvRows = filteredUsers.map(u => [
      u.name || 'N/A',
      u.email || 'N/A',
      moment(u.created_at).format('YYYY-MM-DD HH:mm:ss'),
      u.credits || 0,
      u.banned ? 'Banned' : 'Active'
    ]);
    const csvData = [...csvHeader, ...csvRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users_${moment().format('YYYY-MM-DD_HH-mm')}.csv`);
    link.click();
    toast.success('Users exported successfully ✅');
  };

  const banUser = async (id, status) => {
    try {
      const { error } = await supabase.from('users').update({ banned: status }).eq('id', id);
      if (error) throw error;
      toast.success(status ? 'User banned' : 'User unbanned');
      fetchUsers();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (id) => {
    try {
      await supabase.from('users').delete().eq('id', id);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const updateCredits = async (id, newCredits) => {
    try {
      const { error } = await supabase.from('users').update({ credits: newCredits }).eq('id', id);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === id ? { ...u, credits: newCredits } : u));
      toast.success('Credits updated');
    } catch {
      toast.error('Failed to update credits');
    }
  };

  const handleSendMail = (email, username, credits) => {
    const subject = encodeURIComponent('Greetings from Career Mock!');
    const body = encodeURIComponent(
      `Hello ${username || 'User'},\n\n` +
      `Your current credit balance is ${credits}.\n\n` +
      `Best,\nCareer Mock Team`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100">
      {/* Apple-Style Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold tracking-tight">User Management</h1>
          </div>
          <Button 
            onClick={exportUsersToCSV} 
            className="rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white px-5 h-9 font-medium shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Horizontal Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {Object.entries({
            'Total': stats.totalUsers,
            'Active': stats.activeUsers,
            'Banned': stats.bannedUsers,
            'Interviews': stats.totalInterviews,
            'Candidates': stats.totalCandidates,
            'New (7d)': stats.recentSignups,
          }).map(([title, value]) => (
            <div key={title} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D2D2D7]/50">
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white rounded-2xl border-[#D2D2D7] focus:ring-[#0071E3] focus:border-[#0071E3] transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 px-4 rounded-2xl border border-[#D2D2D7] bg-white text-sm font-medium focus:ring-2 ring-blue-50 outline-none cursor-pointer"
            >
              <option value="created_at">Date Created</option>
              <option value="name">Name</option>
              <option value="credits">Credits</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-12 px-5 rounded-2xl border-[#D2D2D7] bg-white font-medium hover:bg-gray-50 shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
            <Button
              variant={showBanned ? 'default' : 'outline'}
              onClick={() => setShowBanned(!showBanned)}
              className={`h-12 px-5 rounded-2xl font-medium transition-all ${
                showBanned 
                ? 'bg-[#FF3B30] text-white hover:bg-[#D70015]' 
                : 'border-[#D2D2D7] bg-white text-[#FF3B30]'
              }`}
            >
              <Ban className="w-4 h-4 mr-2" /> {showBanned ? 'Hide Banned' : 'Show Banned'}
            </Button>
          </div>
        </div>

        {/* User List Pane */}
        <Card className="rounded-[28px] border-none shadow-sm overflow-hidden bg-white/70 backdrop-blur-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0071E3]" />
                <p className="text-[#86868B] font-medium tracking-tight">Updating users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 text-[#86868B] font-medium">No records found.</div>
            ) : (
              <div className="divide-y divide-[#D2D2D7]/50">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] font-bold text-lg">
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-[#1D1D1F]">{u.name || 'Anonymous User'}</h3>
                        <p className="text-sm text-[#86868B] font-medium">{u.email}</p>
                        <p className="text-[11px] text-[#A1A1A6] font-semibold uppercase tracking-wider">
                          Joined {moment(u.created_at).format('MMM DD, YYYY')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      {/* Credits Control Card */}
                      <div className="flex items-center bg-[#F5F5F7] rounded-full px-2 py-1 border border-[#D2D2D7]/30">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-full text-[#1D1D1F]"
                          onClick={() => updateCredits(u.id, Math.max((u.credits ?? 0) - 1, 0))}
                        >
                          -
                        </Button>
                        <div className="px-3 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-[#86868B] uppercase leading-none">Credits</span>
                          <span className="text-sm font-bold">{u.credits ?? 0}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-full text-[#1D1D1F]"
                          onClick={() => updateCredits(u.id, (u.credits ?? 0) + 1)}
                        >
                          +
                        </Button>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold ${
                          u.banned 
                          ? 'bg-[#FF3B30]/10 text-[#FF3B30]' 
                          : 'bg-[#34C759]/10 text-[#34C759]'
                        }`}>
                          {u.banned ? 'Banned' : 'Active'}
                        </span>
                        
                        <div className="h-6 w-[1px] bg-[#D2D2D7]" />

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-[#0066CC]"
                          onClick={() => handleSendMail(u.email, u.name, u.credits ?? 0)}
                        >
                          <Mail className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`rounded-full ${u.banned ? 'text-[#34C759]' : 'text-[#FF9500]'}`}
                          onClick={() => banUser(u.id, !u.banned)}
                        >
                          <Ban className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-[#FF3B30] hover:bg-red-50"
                          onClick={() => { if(window.confirm('Delete this user?')) deleteUser(u.id); }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default UserManagement;