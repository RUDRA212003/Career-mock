"use client";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import { Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/interviewcard";
import { useRouter } from "next/navigation";

function ScheduledInterview() {
  const { user } = useUser();
  const router = useRouter();
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
  .from("interviews")
  .select(`
    id,
    jobposition,
    duration,
    interview_id,
    userEmail,
    interview_results:interview_results_interview_id_fkey (
      email,
      conversation_transcript,
      completed_at
    )
  `)
  .eq("userEmail", user?.email)
  .order("id", { ascending: false });


      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      console.log("Fetched data:", data);
      setInterviewList(data || []);
    } catch (err) {
      console.error("Error fetching interviews:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl mb-4">Interview List with Feedback</h2>

      {loading ? (
        <div className="text-gray-500 text-center">Loading interviews...</div>
      ) : interviewList?.length === 0 ? (
        <div className="p-5 flex flex-col items-center gap-3 text-center text-gray-500 bg-white border rounded-xl shadow-sm">
          <Video className="text-primary h-10 w-10" />
          <h2 className="text-base">You don’t have any interviews created</h2>
          <Button
            className="cursor-pointer"
            onClick={() =>
              router.push("/recruiter/dashboard/create-interview")
            }
          >
            + Create New Interview
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {interviewList.map((interview, index) => (
            <InterviewCard
              interview={interview}
              key={index}
              viewDetail={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScheduledInterview;
