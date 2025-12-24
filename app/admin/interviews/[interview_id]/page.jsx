'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, XCircle, Calendar, Mail, FileText, ChevronRight, Loader2 } from 'lucide-react';
import moment from 'moment';

export default function InterviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params?.interview_id;
  const [interview, setInterview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (interviewId) fetchDetails();
  }, [interviewId]);

  const fetchDetails = async () => {
    setLoading(true);
    const { data: interviewData, error: interviewError } = await supabase
      .from('interviews')
      .select('*')
      .eq('interview_id', interviewId)
      .single();

    if (interviewError || !interviewData) {
      setInterview(null);
      setLoading(false);
      return;
    }

    const { data: resultsData, error: resultsError } = await supabase
      .from('interview_results')
      .select('*')
      .eq('interview_id', interviewId);

    setInterview(interviewData);
    setResults(resultsData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-[#0071E3]" />
        <p className="text-[#86868B] font-medium tracking-tight">Loading details...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-24 px-6">
        <XCircle className="w-16 h-16 text-[#FF3B30] mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl font-bold tracking-tight mb-4 text-[#1D1D1F]">Interview Not Found</h2>
        <p className="text-[#86868B] mb-8 max-w-md mx-auto">The session you are looking for might have been removed or the link is incorrect.</p>
        <Button onClick={() => router.back()} variant="outline" className="rounded-full px-8 h-12 border-[#D2D2D7] font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1024px] mx-auto p-6 md:p-12 bg-[#F5F5F7] min-h-screen text-[#1D1D1F] font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="mb-10">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-[#0066CC] font-semibold text-lg hover:gap-2 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
      </nav>

      {/* Main Header Card */}
      <Card className="rounded-[28px] border-none shadow-sm bg-white overflow-hidden mb-12">
        <CardHeader className="p-8 md:p-12 pb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#0071E3]">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-4xl font-bold tracking-tight mb-2">
                  {interview.jobposition || 'Untitled Interview'}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-[#86868B] font-medium">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {interview.userEmail}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D2D2D7]" />
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {moment(interview.created_at).format('MMM DD, YYYY')}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#F5F5F7] px-6 py-4 rounded-2xl text-center md:text-right">
              <p className="text-[12px] font-bold text-[#86868B] uppercase tracking-wider mb-1">Participants</p>
              <p className="text-3xl font-bold tracking-tight">{results.length}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 md:p-12 pt-0 space-y-8">
          <div className="h-[1px] bg-[#D2D2D7]/50 w-full" />
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" /> Job Description
              </h4>
              <p className="text-lg leading-relaxed text-[#424245]">
                {interview.jobdescription || 'No description provided.'}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
                Internal Reference
              </h4>
              <code className="block bg-[#F5F5F7] p-4 rounded-xl text-sm font-mono text-[#1D1D1F]">
                {interview.interview_id}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Results Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold tracking-tight px-2">Candidate Results</h3>
        
        {results.length === 0 ? (
          <div className="bg-white rounded-[28px] p-16 text-center shadow-sm">
            <p className="text-[#86868B] font-medium text-lg">No candidates have participated yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => {
              let feedback = null;
              try {
                feedback = result.conversation_transcript?.feedback
                  ? result.conversation_transcript.feedback
                  : JSON.parse(result.conversation_transcript)?.feedback;
              } catch {
                feedback = null;
              }

              const ratings = feedback?.rating || {};
              const summary = feedback?.summary || '';
              const recommendation = feedback?.Recommendation || '';
              const recommendationMsg = feedback?.RecommendationMessage || '';

              const ratingValues = Object.values(ratings).filter((val) => typeof val === 'number');
              const avgScore = ratingValues.length
                ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
                : 'N/A';

              return (
                <Card key={result.id} className="rounded-[28px] border-none shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] font-bold text-xl">
                          {result.fullname?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#1D1D1F]">
                            {result.fullname || 'Unknown Candidate'}
                          </h3>
                          <p className="text-[#86868B] font-medium">{result.email || 'No email provided'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center md:items-end">
                        <span className="text-[64px] font-bold tracking-tighter leading-none text-[#0071E3]">
                          {avgScore}<span className="text-2xl text-[#86868B] tracking-normal">%</span>
                        </span>
                        <span className="text-[12px] font-bold text-[#86868B] uppercase tracking-wider mt-1">Match Score</span>
                      </div>
                    </div>

                    {summary && (
                      <div className="mb-8 p-6 bg-[#F5F5F7] rounded-2xl">
                        <h4 className="text-[13px] font-bold text-[#86868B] uppercase tracking-widest mb-3">AI Analysis Summary</h4>
                        <p className="text-[16px] leading-relaxed text-[#424245]">
                          {summary}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-[#D2D2D7]/50">
                      {recommendation && (
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-5 py-2 rounded-full text-[13px] font-bold tracking-tight ${
                            recommendation.toLowerCase().includes('recommended')
                              ? 'bg-[#34C759]/10 text-[#34C759]'
                              : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                          }`}>
                            {recommendation}
                          </span>
                          {recommendationMsg && (
                            <span className="text-[#86868B] text-sm font-medium">{recommendationMsg}</span>
                          )}
                        </div>
                      )}
                      <div className="text-[12px] font-medium text-[#A1A1A6] italic uppercase tracking-wider">
                        Session: {result.completed_at ? moment(result.completed_at).format('MMM DD, YYYY [at] HH:mm') : 'Draft'}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}