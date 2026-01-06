'use client';
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Added for the close button
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { Download, Mail, CheckCircle2, XCircle, AlertCircle, FileText, Star, X } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

function CandidateFeedbackDialog({ candidate }) {
  const [downloadingCV, setDownloadingCV] = useState(false);
  const [cvAvailable, setCvAvailable] = useState(false);
  const [cvFilePath, setCvFilePath] = useState(null);
  const [candidatePicture, setCandidatePicture] = useState(null);

  // --- DATA NORMALIZATION LOGIC ---
  const _raw = candidate?.conversation_transcript ?? candidate?.feedback ?? null;
  let parsed = _raw;
  if (parsed && typeof parsed === 'object' && parsed.content) parsed = parsed.content;

  if (typeof parsed === 'string') {
    const fenceMatch = parsed.match(/```(?:json)?\n([\s\S]*?)```/i);
    const jsonCandidate = fenceMatch ? fenceMatch[1] : parsed;
    try {
      parsed = JSON.parse(jsonCandidate);
    } catch (e) {
      const firstBrace = jsonCandidate.indexOf('{');
      const lastBrace = jsonCandidate.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        try { parsed = JSON.parse(jsonCandidate.slice(firstBrace, lastBrace + 1)); }
        catch (e2) { parsed = { raw: jsonCandidate }; }
      } else parsed = { raw: jsonCandidate };
    }
  }

  const feedback = parsed?.feedback ?? parsed?.conversation_transcript?.feedback ?? parsed ?? {};
  const rating = feedback?.rating || { TechnicalSkills: 0, Communication: 0, ProblemSolving: 0, Experience: 0 };
  const summaryText = feedback?.summary || feedback?.summery || "";
  const summaryArray = Array.isArray(summaryText) ? summaryText : typeof summaryText === "string" ? summaryText.split("\n").filter(l => l.trim()) : [];
  
  const ratings = Object.values(rating).filter((val) => typeof val === "number");
  const overallScore = ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
  const isRecommended = !feedback?.recommendation?.toLowerCase().includes("not") && !feedback?.recommendation?.toLowerCase().includes("reject");

  // --- EMAIL GENERATION LOGIC ---
  const handleEmailAction = (type) => {
    const email = candidate?.email || "";
    const name = candidate?.fullname || "Candidate";
    let subject = "";
    let body = "";

    const skillsSummary = Object.entries(rating)
      .map(([skill, score]) => `${skill.replace(/([A-Z])/g, " $1").trim()}: ${score}/10`)
      .join("%0D%0A"); // URL encoded newline

    if (type === "selected") {
      subject = `Interview Update: Moving Forward - ${name}`;
      body = `Hi ${name},%0D%0A%0D%0AThank you for participating in the interview. We were impressed with your performance, particularly your overall score of ${overallScore}/10.%0D%0A%0D%0AAssessment Breakdown:%0D%0A${skillsSummary}%0D%0A%0D%0AWe would like to invite you to the next stage of our hiring process. Our team will reach out shortly with details.%0D%0A%0D%0ABest regards.`;
    } else if (type === "rejected") {
      subject = `Application Update - ${name}`;
      body = `Hi ${name},%0D%0A%0D%0AThank you for your interest in the position. While we appreciated the opportunity to speak with you, we have decided to move forward with other candidates at this time.%0D%0A%0D%0AWe wish you the best in your career search.%0D%0A%0D%0ARegards.`;
    } else if (type === "reevaluate") {
      subject = `Follow-up: Additional Evaluation Requested - ${name}`;
      body = `Hi ${name},%0D%0A%0D%0AWe are currently reviewing your interview results. We would like to schedule a brief follow-up session to further discuss your experience in specific areas.%0D%0A%0D%0APlease let us know your availability for a 15-minute call.%0D%0A%0D%0ABest.`;
    }

    toast.info(`Opening mail client...`);
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  // --- FETCHING & DOWNLOAD LOGIC ---
  useEffect(() => {
    if (candidate?.email) {
      const fetchCandidateCV = async () => {
        const { data: userData } = await supabase.from('users').select('cv_file_path, picture').eq('email', candidate.email).single();
        if (userData?.cv_file_path) { setCvFilePath(userData.cv_file_path); setCvAvailable(true); }
        if (userData?.picture) setCandidatePicture(userData.picture);
      };
      fetchCandidateCV();
    }
  }, [candidate?.email]);

  const downloadCV = async () => {
    setDownloadingCV(true);
    try {
      const { data, error } = await supabase.storage.from('cv-uploads').download(cvFilePath);
      if (error) throw error;
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidate?.fullname || 'candidate'}_CV.pdf`;
      link.click();
      toast.success('CV downloaded successfully!');
    } catch (error) { toast.error('Failed to download CV'); }
    finally { setDownloadingCV(false); }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 font-semibold shadow-sm">
          View Report
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
        {/* Header Banner */}
        <div className="bg-slate-900 p-8 text-white relative">
          {/* Custom Close Button */}
          <DialogClose className="absolute right-6 top-6 rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors">
            <X className="h-5 w-5 text-white" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                {candidatePicture ? (
                  <Image src={candidatePicture} alt="pfp" width={80} height={80} className="rounded-3xl object-cover ring-4 ring-slate-800" />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-2xl font-bold ring-4 ring-slate-800">
                    {candidate?.fullname?.[0]}
                  </div>
                )}
                <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-full shadow-lg ${isRecommended ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                   {isRecommended ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
                </div>
              </div>
              <div>
                <DialogTitle className="text-3xl font-extrabold tracking-tight">{candidate?.fullname}</DialogTitle>
                <div className="flex items-center gap-2 text-slate-400 mt-1 font-medium">
                  <Mail className="w-4 h-4" /> {candidate?.email}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Overall Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-indigo-400">{overallScore}</span>
                <span className="text-slate-500 font-bold">/10</span>
              </div>
            </div>
          </div>
        </div>

        <DialogDescription asChild>
          <div className="p-8 max-h-[70vh] overflow-y-auto space-y-10 bg-white">
            
            {/* Action Bar */}
            <div className="flex flex-wrap gap-3">
              {cvAvailable && (
                <Button onClick={downloadCV} disabled={downloadingCV} variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none">
                  <Download className="w-4 h-4 mr-2" /> {downloadingCV ? 'Processing...' : 'Download Resume'}
                </Button>
              )}
              <Button variant="outline" className="rounded-full border-slate-200">
                <FileText className="w-4 h-4 mr-2 text-slate-400" /> Internal Notes
              </Button>
            </div>

            {/* Skills Grid */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Skills Competency
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {Object.entries(rating).map(([skill, score]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                      <span className="capitalize">{skill.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className={`${score >= 8 ? 'text-emerald-600' : score >= 5 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {score}/10
                      </span>
                    </div>
                    <Progress value={score * 10} className="h-2 rounded-full bg-slate-100 shadow-inner" />
                  </div>
                ))}
              </div>
            </section>

            <Separator className="bg-slate-100" />

            {/* AI Analysis Summary */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">AI Performance Analysis</h3>
              <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 relative">
                <div className="absolute top-4 left-4 text-indigo-200 text-6xl font-serif leading-none opacity-50 select-none">“</div>
                <div className="space-y-4 relative z-10">
                  {summaryArray.length > 0 ? (
                    summaryArray.map((line, idx) => (
                      <p key={idx} className="text-slate-600 leading-relaxed text-[15px] italic font-medium">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No summary analysis generated.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Recommendation & Actions */}
            <section className={`p-1 rounded-[2.5rem] ${isRecommended ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-rose-500/5 border border-rose-500/20'}`}>
              <div className="p-8 flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    {isRecommended ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertCircle className="w-6 h-6 text-rose-500" />}
                    <h3 className={`text-2xl font-black tracking-tight ${isRecommended ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {feedback?.recommendation || "Pending Recommendation"}
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {feedback?.RecommendationMessage || "The AI analysis suggests proceeding with the following steps based on technical merit."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 min-w-[240px]">
                  <Button onClick={() => handleEmailAction("selected")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-200/50 h-12">
                    Send "Moving Forward" Email
                  </Button>
                  <Button onClick={() => handleEmailAction("rejected")} variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl h-12">
                    Send Rejection Email
                  </Button>
                  <Button onClick={() => handleEmailAction("reevaluate")} variant="ghost" className="text-slate-500 hover:bg-slate-100 rounded-2xl h-12 font-bold">
                    Request Re-evaluation
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export default CandidateFeedbackDialog;