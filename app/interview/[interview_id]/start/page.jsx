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

  const [userProfile] = useState({
    picture: null,
    name: interviewInfo?.candidate_name || "Candidate",
  });

  /* -------------------------------------------------------------------------- */
  /* Restore interviewInfo if missing                                           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!interviewInfo && typeof window !== "undefined") {
      const stored = localStorage.getItem("interviewInfo");
      if (stored) {
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
      } else {
        router.replace(`/interview/${interview_id}`);
      }
    }
  }, [interviewInfo, interview_id, setInterviewInfo, router]);

  /* -------------------------------------------------------------------------- */
  /* Start Vapi call automatically                                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (interviewInfo && interviewInfo.jobPosition && vapi && !start) {
      setStart(true);
      startCall();
    }
  }, [interviewInfo, vapi]);

  /* -------------------------------------------------------------------------- */
  /* Start Call Logic (UNCHANGED)                                               */
  /* -------------------------------------------------------------------------- */
  const startCall = async () => {
    const jobPosition = interviewInfo?.jobPosition;
    const questionList =
      interviewInfo?.questionList?.interviewQuestions?.map((q) => q.question) ||
      [];

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi ${interviewInfo.candidate_name}, let's start your interview for ${jobPosition}`,
      transcriber: {
        provider: "deepgram",
        model: "nova-3",
        language: "en-US",
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Ask questions one at a time:\n${questionList}`,
          },
        ],
      },
    };

    vapi.start(assistantOptions);
  };

  /* -------------------------------------------------------------------------- */
  /* VAPI EVENTS (UNCHANGED)                                                     */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!vapi) return;

    vapi.on("message", (msg) => {
      if (msg?.role === "assistant") setSubtitles(msg.content);

      if (msg?.conversation) {
        const filtered = msg.conversation.filter((m) => m.role !== "system");
        conversation.current = JSON.stringify(filtered, null, 2);
      }
    });

    vapi.on("speech-start", () => {
      setIsSpeaking(true);
      setActiveUser(false);
    });

    vapi.on("speech-end", () => {
      setIsSpeaking(false);
      setActiveUser(true);
    });

    vapi.on("call-start", () => {
      toast("Call started");
      setStart(true);
    });

    vapi.on("call-end", () => {
      toast("Call ended. Generating feedback...");
      setIsGeneratingFeedback(true);
      GenerateFeedback();
    });
  }, [vapi]);

  /* -------------------------------------------------------------------------- */
  /* Generate Feedback (UNCHANGED)                                               */
  /* -------------------------------------------------------------------------- */
  const GenerateFeedback = async () => {
    try {
      const result = await axios.post("/api/ai-feedback", {
        conversation: conversation.current,
      });

      let content = result?.data?.content || "";
      content = content.replace("```json", "").replace("```", "").trim();

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { raw: content };
      }

      await supabase.from("interview_results").insert([
        {
          fullname: interviewInfo.candidate_name,
          email: interviewInfo.userEmail,
          interview_id,
          conversation_transcript: parsed,
          completed_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.error("Feedback error:", e);
    }

    localStorage.removeItem("interviewInfo");
    setIsGeneratingFeedback(false);
  };

  /* -------------------------------------------------------------------------- */
  /* End Interview Button (UNCHANGED LOGIC)                                     */
  /* -------------------------------------------------------------------------- */
  const stopInterview = async () => {
    try {
      vapi.stop();
    } catch (e) {
      console.error("Stop error:", e);
    }

    setIsGeneratingFeedback(true);
    await GenerateFeedback();

    router.replace(`/interview/${interview_id}/completed`);
  };

  /* -------------------------------------------------------------------------- */
  /* Google Meet Pulse Animations (UI ONLY)                                      */
  /* -------------------------------------------------------------------------- */
  const pulseStyle = `
    .pulse-ring {
      position: absolute;
      top: -8px;
      left: -8px;
      width: calc(100% + 16px);
      height: calc(100% + 16px);
      border-radius: 50%;
      border: 3px solid rgba(59,130,246,0.6);
      animation: pulse 1.6s infinite ease-out;
      opacity: 0;
    }

    .pulse-ring-purple {
      border-color: rgba(168,85,247,0.6);
    }

    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 0.9; }
      50% { transform: scale(1.15); opacity: 0.4; }
      100% { transform: scale(1.35); opacity: 0; }
    }
  `;

  /* -------------------------------------------------------------------------- */
  /* UI (Only UI improved, NO logic changed)                                     */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style>{pulseStyle}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between mb-8 items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {interviewInfo?.jobPosition} Interview
          </h1>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow">
            <Timer className="text-blue-600" />
            <span className="font-mono text-lg">
              <TimmerComponent start={start} />
            </span>
          </div>
        </header>

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI Panel */}
          <div className="p-6 bg-white border rounded-xl shadow relative flex flex-col items-center">
            <div className="relative">
              {isSpeaking && <div className="pulse-ring"></div>}

              <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden shadow-lg bg-blue-50 border-4 border-white">
                <Image
                  src="/AIR.png"
                  alt="AI"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <h2 className="mt-4 text-lg font-semibold">AI Recruiter</h2>
            <p className="text-sm text-gray-500">Interview Assistant</p>
          </div>

          {/* Candidate Panel */}
          <div className="p-6 bg-white border rounded-xl shadow flex flex-col items-center">
            <div className="relative">
              {activeUser && <div className="pulse-ring pulse-ring-purple"></div>}

              <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden shadow-lg bg-gray-100 border-4 border-white flex items-center justify-center">
                {userProfile.picture ? (
                  <Image
                    src={userProfile.picture}
                    alt="Candidate"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-700">
                    {userProfile.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            <h2 className="mt-4 text-lg font-semibold">{userProfile.name}</h2>
            <p className="text-sm text-gray-500">Candidate</p>
          </div>
        </div>

        {/* Subtitles */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 text-center">
          <p className="text-gray-700 min-h-[40px]">
            {subtitles || (isSpeaking ? "AI is speaking..." : "Waiting...")}
          </p>
        </div>

        {/* End Button */}
        <div className="bg-white rounded-xl p-6 shadow border text-center">
          <AlertConfirmation stopInterview={stopInterview}>
            <button className="px-6 py-3 bg-red-100 text-red-600 rounded-full flex items-center justify-center gap-2 mx-auto">
              <Phone size={20} />
              End Interview
            </button>
          </AlertConfirmation>

          <p className="mt-3 text-gray-500 text-sm">
            {activeUser ? "Your turn to respond..." : "AI is speaking..."}
          </p>
        </div>
      </div>

      {/* Feedback modal */}
      {isGeneratingFeedback && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl text-center shadow-xl">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto" />
            <h2 className="mt-4 text-lg font-semibold">Generating Feedback...</h2>
          </div>
        </div>
      )}
    </div>
  );
}
