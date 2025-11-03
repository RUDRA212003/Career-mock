"use client";

import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Mic, Phone, Timer } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import AlertConfirmation from "./_components/AlertConfirmation";
import axios from "axios";
import { FEEDBACK_PROMPT } from "@/services/Constants";
import TimmerComponent from "./_components/TimmerComponent";
import { getVapiClient } from "@/lib/vapiconfig";
import { supabase } from "@/services/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const [vapi, setVapi] = useState(null);
  const [activeUser, setActiveUser] = useState(false);
  const [start, setStart] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const conversation = useRef(null);
  const { interview_id } = useParams();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState({
    picture: null,
    name: interviewInfo?.candidate_name || "Candidate",
  });

  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // ✅ Initialize VAPI Client safely
  useEffect(() => {
    try {
      const client = getVapiClient();
      if (!client) {
        toast.error("❌ VAPI API key missing. Please check your .env file.");
        console.error("VAPI API key missing. Check NEXT_PUBLIC_VAPI_KEY in .env.local");
      } else {
        setVapi(client);
      }
    } catch (err) {
      console.error("Failed to initialize Vapi client:", err);
      toast.error("Failed to initialize Vapi client");
    }
  }, []);

  // ✅ Restore interviewInfo if missing
  useEffect(() => {
    if (!interviewInfo && typeof window !== "undefined") {
      const stored = localStorage.getItem("interviewInfo");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.interview_id === interview_id) {
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

  // ✅ Start interview when ready
  useEffect(() => {
    if (interviewInfo && vapi && !start) {
      setStart(true);
      startCall();
    }
  }, [interviewInfo, vapi]);

  const startCall = async () => {
    const jobPosition = interviewInfo?.jobPosition || "Unknown Position";
    const questionList =
      interviewInfo?.questionList?.interviewQuestions?.map((q) => q?.question) || [];

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi ${interviewInfo?.candidate_name}, how are you? Ready for your interview on ${interviewInfo?.jobPosition}?`,
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
            content: `
You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses.
Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey ${interviewInfo?.candidate_name}! Welcome to your ${interviewInfo?.jobPosition} interview. Let's get started!"
Ask one question at a time and wait for their response.
Keep it friendly, short, and natural. Use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"
After 5–7 questions, wrap up the interview positively and thank the candidate.
Questions: ${questionList}
`.trim(),
          },
        ],
      },
    };

    vapi.start(assistantOptions);
  };

  // ✅ Handle VAPI Events
  useEffect(() => {
    if (!vapi) return;

    const handleMessage = (message) => {
      if (message?.role === "assistant" && message?.content) {
        setSubtitles(message.content);
      }
      if (message?.conversation) {
        const filtered = message.conversation.filter((msg) => msg.role !== "system") || "";
        conversation.current = JSON.stringify(filtered, null, 2);
      }
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
      setActiveUser(false);
      toast("AI is speaking...");
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setActiveUser(true);
    };

    vapi.on("message", handleMessage);
    vapi.on("call-start", () => toast("Call started..."));
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-end", () => {
      toast("Call ended. Generating feedback...");
      setIsGeneratingFeedback(true);
      GenerateFeedback();
    });

    return () => {
      vapi.off("message", handleMessage);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
    };
  }, [vapi]);

  // ✅ Feedback Generation
const GenerateFeedback = async () => {
  if (!interviewInfo || !conversation.current) {
    toast.error("Interview data missing. Please restart the interview.");
    router.replace(`/interview/${interview_id}`);
    return;
  }

  try {
    const result = await axios.post("/api/ai-feedback", {
      conversation: conversation.current,
    });

    let content = result?.data?.content || "";
    content = content.replace(/```json|```/g, "").trim();

    // ✅ Extract JSON safely
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in feedback");
    const parsed = JSON.parse(jsonMatch[0]);

    const { error: insertError } = await supabase.from("interview_results").insert([
      {
        fullname: interviewInfo?.candidate_name,
        email: interviewInfo?.userEmail,
        interview_id,
        conversation_transcript: parsed,
        recommendations: "Not recommended",
        completed_at: new Date().toISOString(),
      },
    ]);

    if (insertError) throw insertError;
    toast.success("Feedback generated successfully!");
    localStorage.removeItem("interviewInfo");
    router.replace(`/interview/${interview_id}/completed`);
  } catch (error) {
    console.error("Feedback generation failed:", error);
    toast.error("Failed to generate feedback");
  } finally {
    setIsGeneratingFeedback(false);
  }
};


  const stopInterview = () => {
    vapi?.stop();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {interviewInfo?.jobPosition || "AI"} Interview Session
            </h1>
            <p className="text-gray-600">Powered by AI Interview Assistant</p>
          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <Timer className="text-blue-600" />
            <span className="font-mono text-lg font-semibold text-gray-700">
              <TimmerComponent start={start} />
            </span>
          </div>
        </header>

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI Recruiter */}
          <div
            className={`bg-white rounded-xl p-6 shadow-md border transition-all duration-300 ${
              isSpeaking ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200"
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-75"></div>
                )}
                <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-blue-100">
                  <Image src="/AIR.png" alt="AI Recruiter" width={80} height={80} />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">AI Recruiter</h2>
              <p className="text-sm text-gray-500">Interview HR</p>
            </div>
          </div>

          {/* Candidate */}
          <div
            className={`bg-white rounded-xl p-6 shadow-md border transition-all duration-300 ${
              activeUser ? "border-purple-300 ring-2 ring-purple-100" : "border-gray-200"
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {activeUser && (
                  <div className="absolute inset-0 rounded-full bg-purple-100 animate-ping opacity-75"></div>
                )}
                <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white shadow-md">
                  {userProfile.picture ? (
                    <Image
                      src={userProfile.picture}
                      alt={userProfile.name}
                      width={80}
                      height={80}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{userProfile.name}</h2>
              <p className="text-sm text-gray-500">Candidate</p>
            </div>
          </div>
        </div>

        {/* Subtitles */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200 text-center text-gray-700">
          {subtitles ? `"${subtitles}"` : isSpeaking ? "AI is speaking..." : "Waiting..."}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
          <AlertConfirmation stopInterview={stopInterview}>
            <button className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 shadow-sm transition-all flex items-center gap-2 mx-auto">
              <Phone size={20} />
              <span>End Interview</span>
            </button>
          </AlertConfirmation>
          <p className="text-sm text-gray-500 mt-2">
            {activeUser ? "Please respond..." : "AI is speaking..."}
          </p>
        </div>
      </div>

      {isGeneratingFeedback && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Generating Feedback</h2>
            <p className="text-gray-600">
              Please wait while we analyze your interview...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartInterview;
