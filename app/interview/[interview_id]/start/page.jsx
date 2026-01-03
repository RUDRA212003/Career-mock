"use client";

import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Phone, Timer } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useState, useRef } from "react";
import AlertConfirmation from "./_components/AlertConfirmation";
import axios from "axios";
import TimmerComponent from "./_components/TimmerComponent";
import { getVapiClient } from "@/lib/vapiconfig";
import { supabase } from "@/services/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/* Voice Wave UI                                                              */
/* -------------------------------------------------------------------------- */
const VoiceWave = ({ active }) => (
  <div className="flex justify-center gap-1 mt-3 h-6">
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`w-1 rounded bg-blue-500 ${
          active ? "animate-wave" : "h-1"
        }`}
        style={{ animationDelay: `${i * 0.12}s` }}
      />
    ))}
  </div>
);

export default function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const vapi = getVapiClient();
  const { interview_id } = useParams();
  const router = useRouter();

  const [activeUser, setActiveUser] = useState(false);
  const [start, setStart] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const conversation = useRef(null);
  const transcriptBuffer = useRef([]); // 🔥 FIX: always collect transcript
  const hasStartedRef = useRef(false);
  const videoRef = useRef(null);

  const userProfile = {
    name: interviewInfo?.candidate_name || "Candidate",
  };

  /* -------------------------------------------------------------------------- */
  /* Restore interview info                                                     */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!interviewInfo && typeof window !== "undefined") {
      const stored = localStorage.getItem("interviewInfo");
      if (!stored) return router.replace(`/interview/${interview_id}`);

      try {
        const parsed = JSON.parse(stored);
        if (parsed?.interview_id === interview_id) {
          setInterviewInfo(parsed);
        } else {
          localStorage.removeItem("interviewInfo");
          router.replace(`/interview/${interview_id}`);
        }
      } catch {
        localStorage.removeItem("interviewInfo");
        router.replace(`/interview/${interview_id}`);
      }
    }
  }, [interviewInfo, interview_id, router, setInterviewInfo]);

  /* -------------------------------------------------------------------------- */
  /* Fullscreen on start                                                        */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (start) {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
    }
  }, [start]);

  /* -------------------------------------------------------------------------- */
  /* Disable right click + inspect                                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const blockContext = (e) => e.preventDefault();
    const blockKeys = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Camera (UI only)                                                           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    let stream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Start call ONCE                                                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!interviewInfo || !interviewInfo.jobPosition || !vapi) return;
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;
    startCall();
  }, [interviewInfo, vapi]);

  /* -------------------------------------------------------------------------- */
  /* Start VAPI Call (UNCHANGED LOGIC)                                          */
  /* -------------------------------------------------------------------------- */
  const startCall = async () => {
    if (!vapi || vapi?.call?.status === "active") return;

    const jobPosition = interviewInfo.jobPosition;
    const questionList =
      interviewInfo?.questionList?.interviewQuestions?.map((q) => q.question) ||
      [];

    try {
      await vapi.start({
        name: "AI Recruiter",
        firstMessage: `Hi ${interviewInfo.candidate_name}, let's start your interview for ${jobPosition}`,
        transcriber: {
          provider: "deepgram",
          model: "nova-3",
          language: "en-US",
        },
        voice: {
          provider: "vapi",
          voiceId: "Neha",
        },
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Ask one question at a time:\n${questionList.join("\n")}`,
            },
          ],
        },
      });
    } catch (err) {
      console.error("Vapi start error:", err);
      toast.error("Failed to start interview");
    }
  };

  /* -------------------------------------------------------------------------- */
  /* VAPI Events                                                                */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!vapi) return;

    const onMessage = (msg) => {
      if (msg?.role === "assistant" || msg?.role === "user") {
        transcriptBuffer.current.push({
          role: msg.role,
          content: msg.content,
        });
      }

      if (msg?.role === "assistant") setSubtitles(msg.content);

      if (msg?.conversation) {
        conversation.current = JSON.stringify(
          msg.conversation.filter((m) => m.role !== "system"),
          null,
          2
        );
      }
    };

    vapi.on("message", onMessage);
    vapi.on("speech-start", () => {
      setIsSpeaking(true);
      setActiveUser(false);
    });
    vapi.on("speech-end", () => {
      setIsSpeaking(false);
      setActiveUser(true);
    });
    vapi.on("call-start", () => {
      toast.success("Interview started");
      setStart(true);
    });
    vapi.on("call-end", () => {
      toast("Interview ended. Generating feedback...");
      setIsGeneratingFeedback(true);
      GenerateFeedback();
    });

    return () => vapi.removeAllListeners();
  }, [vapi]);

  /* -------------------------------------------------------------------------- */
  /* Feedback (FIXED)                                                           */
  /* -------------------------------------------------------------------------- */
  const GenerateFeedback = async () => {
    try {
      const payloadConversation =
        conversation.current ||
        JSON.stringify(transcriptBuffer.current, null, 2);

      const result = await axios.post("/api/ai-feedback", {
        conversation: payloadConversation,
      });

      await supabase.from("interview_results").insert([
        {
          fullname: interviewInfo.candidate_name,
          email: interviewInfo.userEmail || "candidate@example.com",
          interview_id,
          conversation_transcript: result.data,
          completed_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.error("Feedback error:", e);
    } finally {
      localStorage.removeItem("interviewInfo");
      router.replace(`/interview/${interview_id}/completed`);
    }
  };

  const stopInterview = () => vapi?.stop();

  /* -------------------------------------------------------------------------- */
  /* UI                                                                         */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between mb-8 items-center">
          <h1 className="text-2xl font-bold">
            {interviewInfo?.jobPosition} Interview
          </h1>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded shadow">
            <Timer />
            <TimmerComponent start={start} />
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* AI */}
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <Image src="/AIR.png" alt="AI" width={96} height={96} />
            <p className="mt-2 font-semibold">AI Recruiter</p>
            <p className="text-sm text-gray-500">
              {isSpeaking ? "Speaking..." : "Listening"}
            </p>
            <VoiceWave active={isSpeaking} />
          </div>

          {/* Candidate */}
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-36 h-36 rounded-full object-cover mx-auto border"
            />
            <p className="mt-3 font-semibold">{userProfile.name}</p>
            <p className="text-sm text-gray-500">
              {activeUser ? "Your turn" : "Waiting"}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow text-center mb-6 min-h-[80px]">
          <p className="text-lg font-medium">
            {subtitles || "Waiting for response..."}
          </p>
        </div>

        <AlertConfirmation stopInterview={stopInterview}>
          <button className="mx-auto flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-full">
            <Phone size={20} />
            End Interview
          </button>
        </AlertConfirmation>
      </div>

      {isGeneratingFeedback && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            Generating Feedback...
          </div>
        </div>
      )}
    </div>
  );
}
