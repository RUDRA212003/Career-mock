"use client";

import { Video } from "lucide-react";
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
    user && GetInterviewList();
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

    console.log("🔥 Latest Interviews Loaded:", Interviews);

    setInterviewList(Interviews || []);
  };

  const handleInterviewDelete = () => {
    GetInterviewList();
  };

  return (
    <div className="my-5">
      <h2 className="font-bold text-xl sm:text-2xl mb-4 text-gray-800">
        Previously Created Interviews
      </h2>

      {InterviewList?.length === 0 ? (
        <div className="p-6 sm:p-8 flex flex-col items-center gap-3 text-center text-gray-500 bg-white border rounded-xl shadow-sm">
          <Video className="text-primary h-10 w-10" />
          <h2 className="text-base sm:text-lg font-medium">
            You don't have any interviews created
          </h2>
          <Button
            className="cursor-pointer w-full sm:w-auto"
            onClick={() => router.push("/recruiter/dashboard/create-interview")}
          >
            + Create New Interview
          </Button>
        </div>
      ) : (
        <div
          className="
            grid 
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4 sm:gap-5
          "
        >
          {InterviewList.map((interview, index) => (
            <InterviewCard
              interview={interview}
              key={index}
              onDelete={handleInterviewDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default LatestInterviewsList;
