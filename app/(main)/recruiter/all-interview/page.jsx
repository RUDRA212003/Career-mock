"use client";

import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import { Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/interviewcard";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function AllInterview() {
  const router = useRouter();
  const { user } = useUser();
  const [InterviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      GetInterviewList();
    }
  }, [user?.email]);

  const GetInterviewList = async () => {
    try {
      setLoading(true);
      console.log("Fetching interviews for:", user?.email);

      // 🔹 Simple fetch without relationship join
      const { data, error } = await supabase
        .from("interviews") // ✅ make sure this matches your actual table name
        .select("*")
        .eq("userEmail", user?.email)
        .order("id", { ascending: false });

      if (error) {
        console.error("❌ Supabase Error:", error);
        toast.error("Failed to fetch interviews: " + error.message);
        return;
      }

      console.log("✅ Interviews fetched:", data);
      setInterviewList(data || []);
    } catch (err) {
      console.error("❌ Error fetching interviews:", err);
      toast.error("Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-5">
      <h2 className="font-bold text-2xl mb-4">Previously Created Interviews</h2>

      {loading ? (
        <div className="p-5 text-center text-gray-500 bg-white border rounded-xl shadow-sm">
          Loading interviews...
        </div>
      ) : InterviewList?.length === 0 ? (
        <div className="p-5 flex flex-col items-center gap-3 text-center text-gray-500 bg-white border rounded-xl shadow-sm">
          <Video className="text-primary h-10 w-10" />
          <h2 className="text-base">You don't have any interviews created</h2>
          <Button
            className="cursor-pointer"
            onClick={() => router.push("/dashboard/create-interview")}
          >
            + Create New Interview
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {InterviewList.map((interview, index) => (
            <InterviewCard interview={interview} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AllInterview;
