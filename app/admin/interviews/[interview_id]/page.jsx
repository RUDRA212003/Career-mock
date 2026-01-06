'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, XCircle, Calendar, Mail, FileText, Loader2, CheckCircle2 } from 'lucide-react';
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
    try {
      // 1. Fetch the main interview metadata
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

      // 2. Fetch candidate results
      const { data: resultsData } = await supabase
        .from('interview_results')
        .select('*')
        .eq('interview_id', interviewId)
        .order('completed_at', { ascending: false });

      setInterview(interviewData);
      setResults(resultsData || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#F5F5F7]">
        <Loader2 className="animate-spin h-10 w-10 text-[#0071E3]" />
        <p className="text-[#86868B] font-medium tracking-tight">Loading session analytics...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6 bg-[#F5F5F7]">
        <XCircle className="w-16 h-16 text-[#FF3B30] mb-6 opacity-80" />
        <h2 className="text-3xl font-bold mb-4 text-[#1D1D1F]">Interview Not Found</h2>
        <Button onClick={() => router.push('/dashboard')} variant="outline" className="rounded-full px-8 h-12 border-[#D2D2D7]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] selection:bg-blue-100">
      {/* Full Screen Layout Container */}
      <div className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12">
        
        {/* Top Navigation */}
        <nav className="mb-8">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center text-[#0066CC] font-semibold text-lg hover:underline transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" /> 
            Back to Dashboard
          </button>
        </nav>

        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <Card className="lg:col-span-3 rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-20 h-20 rounded-[24px] bg-[#F5F5F7] flex items-center justify-center text-[#0071E3] shrink-0">
                  <Users className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1D1D1F] capitalize">
                      {interview.jobposition || 'Untitled Position'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 mt-4 text-[#86868B] font-medium text-lg">
                      <span className="flex items-center gap-2"><Mail className="w-5 h-5" /> {interview.userEmail}</span>
                      <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /> {moment(interview.created_at).format('MMMM DD, YYYY')}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#F2F2F7]">
                    <h4 className="text-[11px] font-bold text-[#A1A1A6] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Role Description
                    </h4>
                    <p className="text-lg leading-relaxed text-[#424245] max-w-4xl">
                      {interview.jobdescription || 'No description provided.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="lg:col-span-1 rounded-[32px] border-none shadow-sm bg-[#0071E3] text-white p-8 flex flex-col justify-center items-center text-center">
            <p className="text-white/70 font-bold uppercase text-xs tracking-[0.15em] mb-2">Total Participants</p>
            <span className="text-8xl font-black tracking-tighter leading-none">{results.length}</span>
            <div className="mt-6 px-6 py-2 bg-white/10 rounded-full text-sm font-semibold backdrop-blur-md">
              Active Session
            </div>
          </Card>
        </div>

        {/* Candidate Performance Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-3xl font-bold tracking-tight">Candidate Performance</h3>
            <div className="text-[#86868B] font-semibold bg-white px-4 py-2 rounded-full shadow-sm">
              Showing {results.length} results
            </div>
          </div>
          
          {results.length === 0 ? (
            <div className="bg-white rounded-[32px] p-24 text-center shadow-sm">
              <p className="text-[#86868B] font-medium text-xl italic">No candidates have completed this interview yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
              {results.map((result) => {
                // --- ROBUST DATA EXTRACTION LOGIC ---
                let score = 0;
                let summary = "No automated summary generated for this candidate.";
                let recommendation = "N/A";

                try {
                  const rawData = result.conversation_transcript;
                  const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                  
                  // Look for feedback nested or at root
                  const feedback = parsed?.feedback || parsed || {};
                  
                  // Flexible keys for Score and Summary
                  score = feedback?.overallScore ?? feedback?.score ?? feedback?.rating?.overall ?? 0;
                  summary = feedback?.summary || feedback?.analysis || summary;
                  recommendation = result.recommendations || feedback?.Recommendation || feedback?.recommendation || "N/A";
                } catch (e) {
                  console.error("JSON Error:", e);
                }

                const isRecommended = recommendation.toLowerCase().includes('yes') || recommendation.toLowerCase().includes('recommended');

                return (
                  <Card key={result.id} className="rounded-[32px] border-none shadow-sm bg-white flex flex-col transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
                    <div className="p-8 flex-1">
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] font-bold text-xl border-2 border-white shadow-inner">
                            {result.fullname?.charAt(0) || 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xl font-bold text-[#1D1D1F] truncate">
                              {result.fullname || 'Unknown'}
                            </h4>
                            <p className="text-sm text-[#86868B] font-medium truncate">{result.email}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-4xl font-black text-[#0071E3] tracking-tighter">
                            {score}<span className="text-lg text-[#86868B] ml-0.5 font-bold">/10</span>
                          </div>
                          <p className="text-[10px] font-black text-[#A1A1A6] uppercase tracking-[0.1em]">AI Score</p>
                        </div>
                      </div>

                      <div className="p-5 bg-[#F5F5F7] rounded-[24px] border border-[#E5E5EA] min-h-[120px]">
                        <h5 className="text-[10px] font-black text-[#A1A1A6] uppercase tracking-widest mb-2">Analysis Summary</h5>
                        <p className="text-[15px] leading-relaxed text-[#424245] line-clamp-5">
                          {summary}
                        </p>
                      </div>
                    </div>

                    <div className="px-8 py-6 bg-[#FAFAFA] border-t border-[#F2F2F7] flex items-center justify-between mt-auto">
                      <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black tracking-tight ${
                        isRecommended 
                          ? 'bg-[#34C759]/10 text-[#34C759]' 
                          : recommendation === 'N/A' 
                            ? 'bg-gray-100 text-gray-500' 
                            : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                      }`}>
                        {isRecommended && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {recommendation}
                      </div>
                      <span className="text-[11px] font-bold text-[#A1A1A6] uppercase tracking-wide">
                        {moment(result.completed_at).fromNow()}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}