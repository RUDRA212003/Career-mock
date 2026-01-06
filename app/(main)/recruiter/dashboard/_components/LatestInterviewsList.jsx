"use client";

import { Video, Plus, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import InterviewCard from "./interviewcard";
import { toast } from "sonner";

function LatestInterviewsList() {
  const router = useRouter();
  const [InterviewList, setInterviewList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (user) GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    const { data: Interviews, error } = await supabase
      .from("interviews")
      .select(`
        id,
        interview_id,
        userEmail,
        jobposition,
        jobdescription,
        duration,
        type,
        questionlist,
        created_at,
        interview_results (*)
      `)
      .eq("userEmail", user?.email)
      .order("id", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load latest interviews");
    }

    setInterviewList(Interviews || []);
  };

  const handleInterviewDelete = () => {
    GetInterviewList();
  };

  return (
    <div className="my-8 px-2 sm:px-0">
      {/* Refined Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse hidden sm:block" />
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
            Recent Interviews
          </h2>
        </div>
        
        {/* Mobile Quick Action - Prevents congestion by moving button to header */}
        {InterviewList?.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600 border-blue-100 bg-blue-50/50 font-bold sm:hidden rounded-xl h-9"
            onClick={() => router.push("/recruiter/dashboard/create-interview")}
          >
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        )}
      </div>

      {InterviewList?.length === 0 ? (
        /* Enhanced Empty State */
        <div className="py-16 px-6 flex flex-col items-center justify-center gap-5 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
          <div className="relative">
            <div className="bg-blue-50 p-5 rounded-[2rem]">
              <Video className="text-blue-600 h-10 w-10" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 text-amber-400 w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Ready to start hiring?
            </h2>
            <p className="text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed">
              You haven't created any interviews yet. Start your first AI-powered session now.
            </p>
          </div>
          
          <Button
            className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 font-bold transition-all active:scale-95"
            onClick={() => router.push("/recruiter/dashboard/create-interview")}
          >
            + Create New Interview
          </Button>
        </div>
      ) : (
        /* Optimized Grid: List layout on tiny phones, cards on larger screens */
        <div
          className="
            grid 
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-5 sm:gap-6
          "
        >
          {InterviewList.map((interview, index) => (
            <InterviewCard
              interview={interview}
              key={interview.id || index}
              onDelete={handleInterviewDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default LatestInterviewsList;