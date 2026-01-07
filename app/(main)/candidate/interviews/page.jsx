'use client';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Calendar, Timer, Loader2, AlertCircle } from 'lucide-react';
import moment from 'moment';

export default function CandidateInterviews() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) fetchCandidateInterviews();
  }, [user]);

  const fetchCandidateInterviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interview_results')
        .select(`
          id,
          completed_at,
          conversation_transcript,
          interviews (
            jobposition,
            duration
          )
        `)
        .eq('email', user.email)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setInterviews(data || []);
    } catch (err) {
      console.error("Error fetching scores:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Targets the schema: content -> feedback -> overallScore
   * Also averages 'rating' categories as a fallback.
   */
  const getFinalScore = (result) => {
    let data = result.conversation_transcript;
    if (!data) return null;

    // Recursive parsing to handle stringified JSON and markdown fences
    const deepParse = (input) => {
      if (typeof input !== 'string') return input;
      try {
        const cleaned = input.replace(/```json|```/gi, "").trim();
        const parsed = JSON.parse(cleaned);
        return typeof parsed === 'string' ? deepParse(parsed) : parsed;
      } catch (e) {
        const start = input.indexOf('{');
        const end = input.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          try { return JSON.parse(input.slice(start, end + 1)); }
          catch (e2) { return null; }
        }
        return null;
      }
    };

    const parsedData = deepParse(data);
    if (!parsedData) return null;

    // Use the content.feedback path from your provided sample
    const target = parsedData?.content?.feedback || parsedData?.feedback || parsedData;

    // Priority 1: Direct overallScore
    if (typeof target?.overallScore === 'number') {
      return target.overallScore;
    }

    // Priority 2: Average individual rating categories
    const ratings = target?.rating || target?.Rating;
    if (ratings && typeof ratings === 'object') {
      const values = Object.values(ratings)
        .map(v => typeof v === 'string' ? parseInt(v) : v)
        .filter(v => typeof v === 'number' && !isNaN(v));
      
      if (values.length > 0) {
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }
    }

    return null;
  };

  const getScoreStyle = (score) => {
    if (!score) return 'text-slate-400 border-slate-200 bg-slate-50';
    if (score >= 8) return 'text-emerald-600 border-emerald-200 bg-emerald-50';
    if (score >= 5) return 'text-amber-600 border-amber-200 bg-amber-50';
    return 'text-rose-600 border-rose-200 bg-rose-50';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <Loader2 className="animate-spin mb-4 text-indigo-600" size={32} />
      <p className="font-medium animate-pulse">Syncing performance data...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Interview Performance</h1>
        <p className="text-slate-500 mt-2">Track your scores and review your session history.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interviews.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
            <AlertCircle className="mx-auto w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium">No results recorded yet.</p>
          </div>
        ) : (
          interviews.map((result) => {
            const score = getFinalScore(result);
            
            return (
              <Card key={result.id} className="group border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300 bg-white">
                <CardContent className="p-0">
                  <div className="p-6 flex items-center justify-between gap-4">
                    
                    <div className="flex flex-col gap-2 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                          <Trophy className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg truncate group-hover:text-indigo-600 transition-colors">
                          {result.interviews?.jobposition || 'Assessment'}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {moment(result.completed_at).format('DD MMM YYYY')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5" /> 
                          {result.interviews?.duration || '15m'}
                        </span>
                      </div>
                    </div>

                    <div className={`h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-[1.5rem] border-2 flex flex-col items-center justify-center font-black shadow-sm transition-transform group-hover:scale-105 ${getScoreStyle(score)}`}>
                      <span className="text-2xl md:text-3xl leading-none">{score ?? '--'}</span>
                      <span className="text-[10px] md:text-xs uppercase opacity-60 tracking-tighter mt-1">Avg Score</span>
                    </div>

                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
}