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
  ChevronRight,
  Loader2,
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

          // Helper to extract a numeric score (0-10) from a result record.
          const extractScore = (r) => {
            if (typeof r.score === 'number' && !isNaN(r.score)) return r.score;
            try {
              const raw = r.conversation_transcript;
              const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
              const fb = parsed?.feedback || parsed || {};
              if (typeof fb.overallScore === 'number') return fb.overallScore;
              if (typeof fb.score === 'number') return fb.score;
              if (fb.rating && typeof fb.rating === 'object') {
                const vals = Object.values(fb.rating).filter((v) => typeof v === 'number');
                if (vals.length) return vals.reduce((a, b) => a + b, 0) / vals.length;
              }
            } catch (e) {
              // ignore parse errors
            }
            return 0;
          };

          const totalScore = completed.reduce((s, r) => s + extractScore(r), 0);
          // Convert average (0-10) to percent (0-100) for list display
          const avgScore = completed.length > 0 ? (totalScore / completed.length) * 10 : 0;

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
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
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

  const getStatusStyle = (i) =>
    i.completedCount > 0
      ? 'bg-[#34C759]/10 text-[#34C759]'
      : i.candidateCount > 0
      ? 'bg-[#0071E3]/10 text-[#0071E3]'
      : 'bg-[#86868B]/10 text-[#86868B]';

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
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100">
      {/* Apple-Style Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold tracking-tight">Interview Analytics</h1>
          </div>
          <Button 
            onClick={exportInterviewsToCSV} 
            className="rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white px-5 h-9 font-medium shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Horizontal Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { title: 'Total Sessions', value: interviews.length, icon: BarChart3, color: 'text-[#0071E3]' },
            { title: 'Candidates', value: interviews.reduce((s, i) => s + i.candidateCount, 0), icon: Users, color: 'text-[#5E5CE6]' },
            { title: 'Completed', value: interviews.reduce((s, i) => s + i.completedCount, 0), icon: CheckCircle, color: 'text-[#34C759]' },
            { title: 'Avg Score', value: interviews.length > 0 ? (interviews.reduce((s, i) => s + i.avgScore, 0) / interviews.length).toFixed(1) : 0, icon: Clock, color: 'text-[#FF9500]' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-[#D2D2D7]/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider">{stat.title}</p>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] w-4 h-4" />
            <Input
              placeholder="Search by title or email..."
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
              <option value="jobposition">Job Title</option>
              <option value="candidateCount">Candidates</option>
              <option value="avgScore">Average Score</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-12 px-5 rounded-2xl border-[#D2D2D7] bg-white font-medium hover:bg-gray-50 shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
        </div>

        {/* Interview List Pane */}
        <Card className="rounded-[28px] border-none shadow-sm overflow-hidden bg-white/70 backdrop-blur-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0071E3]" />
                <p className="text-[#86868B] font-medium tracking-tight">Updating analytics...</p>
              </div>
            ) : filteredInterviews.length === 0 ? (
              <div className="text-center py-20 text-[#86868B] font-medium">No analytics found.</div>
            ) : (
              <div className="divide-y divide-[#D2D2D7]/50">
                {filteredInterviews.map((i) => (
                  <div key={i.interview_id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/40 transition-colors">
                    <Link 
                      href={`/admin/interviews/${i.interview_id}`}
                      className="flex items-center gap-5 flex-grow group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#E5E5EA] flex items-center justify-center text-[#0071E3]">
                        <BarChart3 className="w-7 h-7" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-lg text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                          {i.jobposition || 'Untitled Session'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[#86868B] font-medium">
                          <span>{i.userEmail || 'Unknown'}</span>
                          <span className="w-1 h-1 rounded-full bg-[#D2D2D7]" />
                          <span>{moment(i.created_at).format('MMM DD, YYYY')}</span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                      <div className="flex flex-col items-center lg:items-end">
                        <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Avg Score</span>
                        <span className="text-lg font-bold">{i.avgScore || 0}%</span>
                      </div>
                      
                      <div className="flex flex-col items-center lg:items-end">
                        <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Candidates</span>
                        <span className="text-lg font-bold">{i.candidateCount}</span>
                      </div>

                      <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold ${getStatusStyle(i)}`}>
                        {getStatusText(i)}
                      </span>
                      
                      <div className="h-6 w-[1px] bg-[#D2D2D7] hidden lg:block" />

                      <div className="flex items-center gap-2">
                        <Link href={`/admin/interviews/${i.interview_id}`}>
                          <Button variant="ghost" size="icon" className="rounded-full text-[#0071E3]">
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-[#FF3B30] hover:bg-[#FF3B30]/10"
                          onClick={() => {
                            setDeletingId(i.interview_id);
                            setShowDeleteAlert(true);
                          }}
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

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="rounded-[32px] border-none p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-center">Delete Interview?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-[#86868B] text-md pt-2">
              This will permanently remove this interview session and all candidate results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel className="rounded-full h-12 font-semibold border-[#D2D2D7] flex-grow">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteInterview}
              className="rounded-full h-12 font-semibold bg-[#FF3B30] hover:bg-[#D70015] text-white flex-grow"
            >
              Delete Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InterviewAnalytics;