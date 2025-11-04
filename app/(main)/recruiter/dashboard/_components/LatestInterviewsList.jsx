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
      .select("*, interview_results(*)")
      .eq("userEmail", user?.email)
      .order("id", { ascending: false })
      .limit(6);

    if (error) console.error("Error fetching interviews:", error);
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

      {/* Empty State */}
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
            grid-cols-1               /* ✅ 1 column on small phones */
            sm:grid-cols-2            /* ✅ 2 columns on tablets */
            lg:grid-cols-3            /* ✅ 3 columns on large screens */
            gap-4 sm:gap-5            /* ✅ Balanced spacing */
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
