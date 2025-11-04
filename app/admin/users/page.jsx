'use client';
import React, { useEffect, useState } from 'react';
import {
  Users, Search, Filter, Download, Mail, Ban, ArrowLeft
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
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setFilteredUsers(filtered);
  };

  // Export CSV
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

  const getStatusColor = (u) =>
    u.banned ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200';

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

  const handleSendMail = (email, username, credits) => {
    const subject = encodeURIComponent('Greetings from Career Mock!');
    const body = encodeURIComponent(
      `Hello ${username || 'User'},\n\n` +
      `We hope you're doing great! 👋\n\n` +
      `Your current credit balance is *${credits}*.\n` +
      `Top up your credits here:\nhttps://career-mock.vercel.app/recruiter/billing\n\n` +
      `Best,\nCareer Mock Team 💼`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-blue-100 mt-1">Manage and monitor all registered users</p>
          </div>
          <Button
            onClick={exportUsersToCSV}
            className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
          >
            <Download className="w-4 h-4 mr-2" /> Export Users
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries({
          'Total Users': stats.totalUsers,
          'Active Users': stats.activeUsers,
          'Banned Users': stats.bannedUsers,
          'Interviews': stats.totalInterviews,
          'Candidates': stats.totalCandidates,
          'Recent Signups': stats.recentSignups,
        }).map(([title, value]) => (
          <Card
            key={title}
            className="hover:shadow-lg transition-all duration-300 border border-gray-200"
          >
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Search className="w-5 h-5 text-blue-600" />
            Search & Filter Users
          </CardTitle>
          <CardDescription>Find users or filter by status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="created_at">Created Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-sm"
            >
              <Filter className="w-4 h-4 mr-1" /> {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </Button>
            <Button
              variant={showBanned ? 'default' : 'outline'}
              onClick={() => setShowBanned(!showBanned)}
              className={`${showBanned ? 'bg-red-600 hover:bg-red-700 text-white' : ''} text-sm`}
            >
              <Ban className="w-4 h-4 mr-1" /> {showBanned ? 'Hide Banned' : 'Show Banned'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-3">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
          </Button>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage users and take actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-6 text-gray-500">No users found.</p>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:shadow-md hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-700 font-semibold">
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{u.name}</h3>
                      <p className="text-sm text-gray-500">{u.email}</p>
                      <p className="text-xs text-gray-400">
                        Joined {moment(u.created_at).format('MMM DD, YYYY')}
                      </p>
                      <p className="text-xs text-blue-600 font-semibold">
                        Credits: {u.credits ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleSendMail(u.email, u.name, u.credits ?? 0)}
                    >
                      <Mail className="w-4 h-4 mr-1" /> Notify
                    </Button>
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(
                        u
                      )}`}
                    >
                      {u.banned ? 'Banned' : 'Active'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => banUser(u.id, !u.banned)}
                      className="text-xs"
                    >
                      {u.banned ? 'Unban' : 'Ban'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteUser(u.id)}
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserManagement;
