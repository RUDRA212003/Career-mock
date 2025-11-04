'use client';
import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import moment from 'moment';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

function InterviewAnalytics() {
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    filterAndSortInterviews();
  }, [interviews, searchTerm, sortBy, sortOrder]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const interviewsWithStats = await Promise.all(
        (data || []).map(async (interview) => {
          const { data: results } = await supabase
            .from('interview_results')
            .select('*')
            .eq('interview_id', interview.interview_id);

          const completed = results?.filter((r) => r.status === 'completed') || [];
          const totalDuration = completed.reduce((s, r) => s + (r.duration || 0), 0);
          const avgScore =
            completed.length > 0
              ? completed.reduce((s, r) => s + (r.score || 0), 0) / completed.length
              : 0;

          return {
            ...interview,
            candidateCount: results?.length || 0,
            completedCount: completed.length,
            totalDuration,
            avgScore: Math.round(avgScore * 100) / 100,
          };
        })
      );

      setInterviews(interviewsWithStats);
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortInterviews = () => {
    let filtered = interviews.filter((i) => {
      const title = i.jobposition || i.jobdescription || 'Untitled';
      const email = i.userEmail || i.email || '';
      return (
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy],
        bValue = b[sortBy];
      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredInterviews(filtered);
  };

  const exportInterviewsToCSV = () => {
    const csv = [
      ['Title', 'Creator', 'Created Date', 'Candidates', 'Completed', 'Avg Score', 'Duration (min)', 'Status'],
      ...filteredInterviews.map((i) => [
        i.jobposition || i.title || 'N/A',
        i.userEmail || i.email || 'N/A',
        moment(i.created_at).format('YYYY-MM-DD HH:mm'),
        i.candidateCount,
        i.completedCount,
        i.avgScore,
        Math.round(i.totalDuration / 60),
        i.candidateCount > 0 ? 'Active' : 'No Candidates',
      ]),
    ]
      .map((r) => r.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `interviews-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    toast.success('Exported interviews successfully ✅');
  };

  const getStatusColor = (i) =>
    i.completedCount > 0
      ? 'text-green-600 bg-green-50 border border-green-200'
      : i.candidateCount > 0
      ? 'text-blue-600 bg-blue-50 border border-blue-200'
      : 'text-gray-600 bg-gray-50 border border-gray-200';

  const getStatusText = (i) =>
    i.completedCount > 0 ? 'Completed' : i.candidateCount > 0 ? 'In Progress' : 'No Candidates';

  const confirmDeleteInterview = async () => {
    try {
      await supabase.from('interview_results').delete().eq('interview_id', deletingId);
      await supabase.from('interviews').delete().eq('interview_id', deletingId);
      toast.success('Interview deleted');
      fetchInterviews();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setShowDeleteAlert(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Interview Analytics</h1>
            <p className="text-blue-100 mt-1">
              Monitor interview performance and candidate results
            </p>
          </div>
          <Button
            onClick={exportInterviewsToCSV}
            className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
          >
            <Download className="w-4 h-4 mr-2" /> Export Data
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { title: 'Total Interviews', value: interviews.length, icon: BarChart3 },
          {
            title: 'Candidates',
            value: interviews.reduce((s, i) => s + i.candidateCount, 0),
            icon: Users,
          },
          {
            title: 'Completed',
            value: interviews.reduce((s, i) => s + i.completedCount, 0),
            icon: CheckCircle,
          },
          {
            title: 'Avg Score',
            value:
              interviews.length > 0
                ? Math.round(
                    (interviews.reduce((s, i) => s + i.avgScore, 0) / interviews.length) * 100
                  ) / 100
                : 0,
            icon: Clock,
          },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-300 border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">Total {stat.title.toLowerCase()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Search className="w-5 h-5 text-blue-600" />
            Search & Filter
          </CardTitle>
          <CardDescription>Find specific interviews or sort results</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by title or email..."
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
              <option value="title">Title</option>
              <option value="candidateCount">Candidates</option>
              <option value="avgScore">Score</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-sm"
            >
              <Filter className="w-4 h-4 mr-1" />
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-3">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return
          </Button>
          <CardTitle className="text-lg font-semibold text-gray-800">
            All Interviews ({filteredInterviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-6">Loading interviews...</p>
          ) : filteredInterviews.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No interviews found.</p>
          ) : (
            <div className="space-y-3">
              {filteredInterviews.map((i) => (
                <div
                  key={i.interview_id}
                  className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:shadow-md hover:bg-blue-50 transition"
                >
                  <Link
                    href={`/admin/interviews/${i.interview_id}`}
                    className="flex items-start sm:items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        {i.jobposition || 'Untitled'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {moment(i.created_at).format('MMM DD, YYYY')} ·{' '}
                        {i.userEmail || 'Unknown'}
                      </p>
                    </div>
                  </Link>
                  <div className="flex flex-wrap gap-3 sm:justify-end mt-3 sm:mt-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(i)}`}
                    >
                      {getStatusText(i)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDeletingId(i.interview_id);
                        setShowDeleteAlert(true);
                      }}
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteInterview}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InterviewAnalytics;
