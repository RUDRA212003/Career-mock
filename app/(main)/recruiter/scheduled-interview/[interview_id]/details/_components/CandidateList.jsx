'use client';
import React, { useState, useEffect } from "react";
import moment from "moment";
import CandidateListFeedbackDialog from "./CandidateFeedbackDialog";
import exportToCSV from "@/lib/exportToCSV"; 
import { supabase } from "@/services/supabaseClient";
import Image from "next/image";
import { Download, User, Calendar, Mail, CheckCircle2, Trophy, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

function CandidateList({ candidateList, interviewName }) {
  const [candidatesWithPictures, setCandidatesWithPictures] = useState([]);

  const normalizeFeedback = (candidate) => {
    let raw = candidate?.conversation_transcript ?? candidate?.feedback ?? null;
    if (!raw) return null;
    if (raw && typeof raw === "object" && typeof raw.content === "string") raw = raw.content;

    if (typeof raw === "string") {
      const fenceMatch = raw.match(/```(?:json)?\n([\s\S]*?)```/i);
      const jsonCandidate = fenceMatch ? fenceMatch[1] : raw;
      try {
        raw = JSON.parse(jsonCandidate);
      } catch (e) {
        const firstBrace = jsonCandidate.indexOf('{');
        const lastBrace = jsonCandidate.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          try { raw = JSON.parse(jsonCandidate.slice(firstBrace, lastBrace + 1)); }
          catch (e2) { return null; }
        } else return null;
      }
    }

    if (raw && typeof raw === 'object' && raw.content) raw = raw.content;
    let fb = raw.feedback ?? (raw?.conversation_transcript?.feedback) ?? raw;

    if (fb.summery && !fb.summary) fb.summary = fb.summery;
    if (fb.Recommendation && !fb.recommendation) fb.recommendation = fb.Recommendation;

    if (typeof fb.recommendation === 'string') {
      const r = fb.recommendation.toLowerCase();
      if (r.includes('not') || r.includes('reject')) fb.status = 'Do Not Hire';
      else if (r.includes('further') || r.includes('re-eval')) fb.status = 'Further Evaluation';
      else fb.status = 'Hire';
    } else {
        fb.status = 'Processing';
    }
    return fb;
  };

  const calculateRatingValue = (candidate) => {
    const fb = normalizeFeedback(candidate);
    const rating = fb?.rating;
    if (!rating) return null;
    const values = Object.values(rating).filter(val => typeof val === "number");
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  };

  useEffect(() => {
    const fetchPictures = async () => {
      if (!candidateList?.length) return;
      const withPics = await Promise.all(candidateList.map(async (c) => {
        const { data } = await supabase.from('users').select('picture').eq('email', c.email).single();
        return data?.picture ? { ...c, picture: data.picture } : c;
      }));
      setCandidatesWithPictures(withPics);
    };
    fetchPictures();
  }, [candidateList]);

  return (
    <div className="space-y-6 md:space-y-10 py-4 md:py-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6 md:pb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutGrid className="w-6 h-6 md:w-8 h-8 text-indigo-600" />
            Candidate Pool
          </h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base font-medium">Reviewing {candidateList?.length || 0} active submissions.</p>
        </div>
        <Button 
          onClick={() => exportToCSV(candidateList, interviewName)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-11 shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download Results CSV
        </Button>
      </div>

      {/* Responsive Layout Grid: List on Mobile, Cards on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
        {candidatesWithPictures?.map((candidate, index) => {
          const ratingScore = calculateRatingValue(candidate);
          const feedback = normalizeFeedback(candidate);
          const status = feedback?.status || "Processing";

          return (
            <Card key={index} className="group relative flex flex-col md:rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-lg md:hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 overflow-hidden">
              
              {/* Score Badge - Hidden on very small mobile if desired, or repositioned */}
              <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                <div className={`flex flex-col items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl backdrop-blur-md border shadow-sm font-bold ${
                  ratingScore >= 8 ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' : 
                  ratingScore >= 5 ? 'bg-amber-50/90 border-amber-200 text-amber-700' : 
                  'bg-slate-50/90 border-slate-200 text-slate-700'
                }`}>
                  <span className="text-sm md:text-lg leading-none">{ratingScore ?? "—"}</span>
                  <span className="text-[8px] md:text-[10px] opacity-60">/10</span>
                </div>
              </div>

              <CardContent className="p-4 md:p-8 flex-1">
                {/* Profile Header: Row on Mobile, Column on Desktop */}
                <div className="flex flex-row md:flex-col items-center md:text-center space-x-4 md:space-x-0 md:space-y-4">
                  <div className="relative shrink-0">
                    {candidate?.picture ? (
                      <Image src={candidate.picture} alt="Profile" width={64} height={64} className="md:w-24 md:h-24 rounded-xl md:rounded-[2.5rem] object-cover border-2 md:border-4 border-white shadow-md" />
                    ) : (
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 text-xl md:text-3xl font-bold uppercase">
                        {candidate?.fullname?.[0] || "?"}
                      </div>
                    )}
                    {status === 'Hire' && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 md:border-4 border-white shadow-sm">
                        <Trophy className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 overflow-hidden">
                    <h3 className="text-base md:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {candidate?.fullname || "Anonymous"}
                    </h3>
                    <div className="flex items-center md:justify-center gap-2 text-slate-500 text-xs md:text-sm font-medium">
                      <Mail className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" />
                      <span className="truncate max-w-[140px] md:max-w-[150px]">{candidate?.email}</span>
                    </div>
                    {/* Status badge moved to row on mobile */}
                    <div className="md:hidden mt-1">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                            status === 'Hire' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                            status === 'Do Not Hire' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                            'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                            {status}
                        </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge - Desktop Only */}
                <div className="hidden md:flex mt-6 justify-center">
                  <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border ${
                    status === 'Hire' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                    status === 'Do Not Hire' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                    'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Summary Sneak-peek - Hidden on mobile to keep list clean, or shown as small text */}
                <div className="hidden md:block mt-8 p-4 rounded-2xl bg-slate-50/80 text-slate-600 text-[13px] leading-relaxed italic line-clamp-3">
                  {feedback?.summary || "View report for full analysis."}
                </div>
              </CardContent>

              <CardFooter className="px-4 md:px-8 py-3 md:py-5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-semibold text-slate-400">
                  <Calendar className="w-3.5 md:w-4 h-3.5 md:h-4" />
                  {moment(candidate?.completed_at).format("DD MMM YYYY")}
                </div>
                <CandidateListFeedbackDialog candidate={candidate} />
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default CandidateList;