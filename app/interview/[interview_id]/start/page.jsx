"use client";

import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Phone, Timer, AlertCircle, Maximize, ShieldCheck } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useState, useRef } from "react";
import AlertConfirmation from "./_components/AlertConfirmation";
import axios from "axios";
import TimmerComponent from "./_components/TimmerComponent";
import { getVapiClient } from "@/lib/vapiconfig";
import { supabase } from "@/services/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

  // Security States
  const [tabBreach, setTabBreach] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showSecurityIcon, setShowSecurityIcon] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);

  const conversation = useRef(null);
  const transcriptBuffer = useRef([]); 
  const hasStartedRef = useRef(false);
  const videoRef = useRef(null);

  const userProfile = {
    name: interviewInfo?.candidate_name || "Candidate",
  };

  /* -------------------------------------------------------------------------- */
  /* MASTER SECURITY ENGINE                                                     */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    // 1. Fullscreen Enforcement
    const handleFullScreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);
      if (!isFull) {
        toast.error("Security Breach", { description: "Return to fullscreen immediately." });
      }
    };

    // 2. Right Click Protection
    const handleContextMenu = (e) => {
      e.preventDefault();
      setMousePos({ x: e.clientX, y: e.clientY });
      setShowSecurityIcon(true);
      toast.error("Action Prohibited", { description: "Security protocols active." });
      setTimeout(() => setShowSecurityIcon(false), 1500);
    };

    // 3. Keyboard Protection (F12, Ctrl+Shift+I, etc)
    const handleKeyDown = (e) => {
      const isDevTools = (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || e.key === 'F12';
      const isSourceView = e.ctrlKey && e.key.toLowerCase() === 'u';
      const isClipboard = e.ctrlKey && ['c', 'v', 'x'].includes(e.key.toLowerCase());

      if (isDevTools || isSourceView || isClipboard) {
        e.preventDefault();
        setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setShowSecurityIcon(true);
        toast.warning("Access Denied", { description: "Restricted shortcut." });
        setTimeout(() => setShowSecurityIcon(false), 1500);
      }
    };

    // 4. Tab Switch Horror Detection
    const handleVisibilityChange = () => {
      if (document.hidden) setTabBreach(true);
    };
    const handleBlur = () => setTabBreach(true);
    const handleFocus = () => setTimeout(() => setTabBreach(false), 3000);

    // 5. Anti-Debugger
    const antiDebugger = setInterval(() => {
        const start = Date.now();
        debugger; 
        if (Date.now() - start > 100) console.clear();
    }, 2000);

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      clearInterval(antiDebugger);
    };
  }, []);

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
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
  /* Camera                                                                     */
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
  /* Start Call                                                                 */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!interviewInfo || !interviewInfo.jobPosition || !vapi) return;
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;
    startCall();
  }, [interviewInfo, vapi]);

  const startCall = async () => {
    if (!vapi || vapi?.call?.status === "active") return;
    const jobPosition = interviewInfo.jobPosition;
    const questionList = interviewInfo?.questionList?.interviewQuestions?.map((q) => q.question) || [];

    try {
      await vapi.start({
        name: "AI Recruiter",
        firstMessage: `Hi ${interviewInfo.candidate_name}, let's start your interview for ${jobPosition}. Are you ready?`,
        transcriber: { provider: "deepgram", model: "nova-3", language: "en-US" },
        voice: { provider: "vapi", voiceId: "Neha" },
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `
  PERSONA:
  You are "Neha", a professional, friendly, but firm Recruiter at a top-tier firm. 
  Your tone should be encouraging and natural, but you NEVER cross the line into helping the candidate with answers.

  INTERVIEW ARCHITECTURE:
  1. THE OPENING: Start by welcoming the candidate. Your first question MUST always be: "To start off, could you tell me a little bit about yourself and your professional background?"
  2. THE APPRECIATION: After their introduction, acknowledge it warmly (e.g., "That’s a great background," or "It’s a pleasure to meet someone with your experience").
  3. THE TRANSITION: Say something like, "Moving forward, I have a specific set of questions prepared to understand your fit for the ${jobPosition} role. Let’s dive in."
  4. THE CORE QUESTIONS: Proceed to ask these questions one-by-one: \n${questionList.join("\n")}

  STRICT OPERATIONAL GUARDRAILS:
  - NO CHEATING: If they ask for answers, hints, or logic help, say: "I'd love to help, but since this is a formal assessment, I can't provide any answers or hints. I'm sure you'll do great on your own! Let's continue."
  - NO MID-INTERVIEW FEEDBACK: If they ask how they are doing, say: "I’m making notes as we go! Our review team will reach out with the final feedback once the session is processed. Shall we move to the next one?"
  - NATURAL ACKNOWLEDGMENT: Between questions, use varied phrases like "Got it," "Thanks for sharing that," "Interesting point," or "That makes sense."
  - STAY ON TRACK: If they try to chat about unrelated topics, politely steer them back: "That’s interesting, but to respect your time, let’s stick to the interview questions. Ready for the next one?"
`
            }
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
        transcriptBuffer.current.push({ role: msg.role, content: msg.content });
      }
      if (msg?.role === "assistant") setSubtitles(msg.content);
      if (msg?.conversation) {
        conversation.current = JSON.stringify(msg.conversation.filter((m) => m.role !== "system"), null, 2);
      }
    };

    vapi.on("message", onMessage);
    vapi.on("speech-start", () => { setIsSpeaking(true); setActiveUser(false); });
    vapi.on("speech-end", () => { setIsSpeaking(false); setActiveUser(true); });
    vapi.on("call-start", () => { toast.success("Interview started"); setStart(true); });
    vapi.on("call-end", () => {
      toast("Interview ended. Generating feedback...");
      setIsGeneratingFeedback(true);
      GenerateFeedback();
    });

    return () => vapi.removeAllListeners();
  }, [vapi]);

  const GenerateFeedback = async () => {
    try {
      const payloadConversation = conversation.current || JSON.stringify(transcriptBuffer.current, null, 2);
      const result = await axios.post("/api/ai-feedback", { conversation: payloadConversation });
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 select-none relative overflow-hidden">
      
      {/* 1. HORROR BREACH OVERLAY */}
      <AnimatePresence>
        {tabBreach && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md pointer-events-none flex items-center justify-center"
          >
            <div className="absolute inset-0 border-[24px] border-red-900 animate-pulse shadow-[inset_0_0_200px_rgba(153,27,27,1)]" />
            <motion.div 
              animate={{ x: [-8, 8, -8], rotate: [-1, 1, -1], scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-center px-12 py-20 bg-black border-2 border-red-600 rounded-[40px] shadow-[0_0_150px_rgba(220,38,38,0.4)] z-10"
            >
              <AlertCircle className="w-24 h-24 text-red-600 mx-auto mb-6 drop-shadow-[0_0_25px_rgba(220,38,38,1)]" />
              <h2 className="text-7xl font-black text-white tracking-tighter mb-4 uppercase italic">VIOLATION</h2>
              <p className="text-red-600 font-bold text-2xl uppercase tracking-[0.3em] mb-4 animate-pulse">TAB SWITCH DETECTED</p>
              <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                Incident logged. Your session has been flagged.<br />
                Continuous violations result in immediate termination.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FLOATING SECURITY ICON */}
      <AnimatePresence>
        {showSecurityIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', left: mousePos.x, top: mousePos.y, zIndex: 9999, pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}
          >
            <Image src="/fav.svg" alt="Deny" width={100} height={100} className="drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FULLSCREEN ENFORCEMENT OVERLAY */}
      {!isFullScreen && !tabBreach && (
        <div className="fixed inset-0 z-[500] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center text-center">
          <Maximize className="w-16 h-16 text-indigo-600 mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold mb-4">Security Protocol Active</h2>
          <button onClick={enterFullScreen} className="h-16 px-12 rounded-2xl bg-indigo-600 text-xl font-bold shadow-2xl text-white">Return to Session</button>
        </div>
      )}

      <div className={`max-w-6xl mx-auto transition-all duration-500 ${tabBreach ? 'blur-2xl' : ''}`}>
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
          {/* AI Side */}
          <div className="bg-white p-6 rounded-xl shadow text-center flex flex-col items-center">
            <Image src="/AIR.png" alt="AI" width={96} height={96} />
            <p className="mt-2 font-semibold">AI Recruiter</p>
            <p className="text-sm text-gray-500">
              {isSpeaking ? "Speaking..." : "Listening"}
            </p>
            <VoiceWave active={isSpeaking} />
          </div>

          {/* Candidate Side */}
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
          <button className="mx-auto flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors">
            <Phone size={20} />
            End Interview
          </button>
        </AlertConfirmation>
      </div>

      {isGeneratingFeedback && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[20000]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="font-bold text-gray-700 uppercase tracking-widest text-sm">Generating Feedback...</p>
          </div>
        </div>
      )}
    </div>
  );
}