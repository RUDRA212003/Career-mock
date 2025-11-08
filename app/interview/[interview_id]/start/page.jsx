"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mic, Phone, Play, Pause, Timer, Volume2, MessageCircle } from "lucide-react";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { getVapiClient } from "@/lib/vapiconfig";
import TimmerComponent from "./_components/TimmerComponent";
import AlertConfirmation from "./_components/AlertConfirmation";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";

function formatTime(date = new Date()) {
  return new Date(date).toLocaleString();
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * Redesigned StartInterview component:
 * - improved layout (hero + two-column content)
 * - live subtitles (interim + final) from VAPI's transcription events
 * - transcript panel with speaker, timestamp and expandable JSON output
 * - safer feedback generation and supabase insert
 *
 * Notes:
 * - This assumes VAPI client emits `transcript` (interim/final) events and `message` events for assistant messages.
 * - If your SDK uses a different event name for transcription (e.g., "transcription", "transcript-update"), adapt below.
 */
export default function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const { interview_id } = useParams();
  const router = useRouter();

  const [vapi, setVapi] = useState(null);
  const [started, setStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // AI speaking
  const [activeUser, setActiveUser] = useState(false); // user speaking
  const [subtitles, setSubtitles] = useState({ text: "", interim: false }); // {text, interim}
  const [transcriptItems, setTranscriptItems] = useState([]); // {role, text, ts}
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [callStateMessage, setCallStateMessage] = useState("");
  const conversationRef = useRef([]); // array of messages (role, content, ts)
  const vapiListenersRef = useRef([]);
  const abortRef = useRef(false);

  // user profile UI
  const [userProfile, setUserProfile] = useState({
    picture: null,
    name: interviewInfo?.candidate_name || "Candidate",
  });

  // Initialize VAPI
  useEffect(() => {
    try {
      const client = getVapiClient();
      if (!client) {
        toast.error("VAPI key missing. Check NEXT_PUBLIC_VAPI_KEY.");
        console.error("VAPI API key missing. Check NEXT_PUBLIC_VAPI_KEY in .env.");
        return;
      }
      setVapi(client);
    } catch (err) {
      console.error("Failed to create VAPI client:", err);
      toast.error("Failed to initialize VAPI client");
    }
  }, []);

  // Restore interviewInfo from localStorage if necessary
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

  // auto-start when ready (keeps previous behavior)
  useEffect(() => {
    if (interviewInfo && vapi && !started) {
      setStarted(true);
      startCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewInfo, vapi]);

  // Attach VAPI event handlers for message, speech events and transcription
  useEffect(() => {
    if (!vapi) return;

    // helper to push to conversation and transcript
    const pushMessage = (role, text, meta = {}) => {
      const item = { role, text, ts: nowIso(), ...meta };
      conversationRef.current.push(item);
      setTranscriptItems((s) => [...s, item]);
    };

    // message (assistant / user text messages)
    const onMessage = (message) => {
      if (!message) return;
      // If assistant sends content, show subtitles as final and push to conversation
      if (message.role === "assistant" && message.content) {
        setSubtitles({ text: message.content, interim: false });
        pushMessage("assistant", message.content);
      }
      // If message contains conversation array (SDK-specific), normalize
      if (message.conversation) {
        const filtered = message.conversation.filter((m) => m.role !== "system");
        filtered.forEach((m) => {
          pushMessage(m.role || "user", m.content || "");
        });
      }
    };

    // speech start/end events
    const onSpeechStart = () => {
      setIsSpeaking(true);
      setActiveUser(false);
      setCallStateMessage("AI speaking");
    };
    const onSpeechEnd = () => {
      setIsSpeaking(false);
      setActiveUser(true);
      setCallStateMessage("Your turn");
    };

    // transcription event: most VAPI wrappers emit interim/final transcript events.
    // This example listens to "transcript" and expects payload { text, is_final, role? }
    // If your VAPI client emits a different event name or payload, adapt here.
    const onTranscript = (payload) => {
      if (!payload) return;
      // payload example: { text: "I worked at...", is_final: false, speaker: "user" }
      const text = payload.text ?? payload.transcript ?? "";
      const isFinal = Boolean(payload.is_final || payload.final);
      // show interim subtitles while user speaks
      setSubtitles({ text, interim: !isFinal });

      if (isFinal && text.trim()) {
        // push final transcript as a user message
        const speaker = payload.speaker || "user";
        const item = { role: speaker, text, ts: nowIso(), raw: payload };
        conversationRef.current.push(item);
        setTranscriptItems((s) => [...s, item]);
        // clear interim subtitle after a moment
        setTimeout(() => setSubtitles({ text: "", interim: false }), 400);
      }
    };

    // register
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    // Many VAPI wrappers use "transcript" or "transcription" — try both safe listeners.
    vapi.on("transcript", onTranscript);
    vapi.on("transcription", onTranscript);

    // Keep record for cleanup
    vapiListenersRef.current = [
      ["message", onMessage],
      ["speech-start", onSpeechStart],
      ["speech-end", onSpeechEnd],
      ["transcript", onTranscript],
      ["transcription", onTranscript],
    ];

    // call start listeners if needed
    vapi.on("call-start", () => {
      setCallStateMessage("Call started");
      toast.success("Call started");
    });
    vapi.on("call-end", () => {
      setCallStateMessage("Call ended — generating feedback");
      toast("Call ended. Generating feedback...");
      setIsGeneratingFeedback(true);
      GenerateFeedback();
    });

    return () => {
      // cleanup listeners
      try {
        vapiListenersRef.current.forEach(([event, fn]) => vapi.off(event, fn));
      } catch (e) {
        // ignore cleanup errors
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vapi]);

  // Build assistant options and start call
  const startCall = async () => {
    if (!vapi || !interviewInfo) return;
    abortRef.current = false;
    setTranscriptItems([]);
    conversationRef.current = [];

    const questionList =
      interviewInfo?.questionList?.interviewQuestions?.map((q) => q?.question) || [];

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi ${interviewInfo?.candidate_name}, welcome — we'll ask a few questions about the ${interviewInfo?.jobPosition}. Ready?`,
      transcriber: {
        provider: "deepgram",
        model: "nova-3",
        language: "en-US",
        // recommend receiving interim results from the provider:
        interim_results: true,
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
Ask one question at a time, wait for the candidate to finish, keep tone friendly and professional.
Limit question length; after ~5-7 questions, wrap up and thank the candidate.
Candidate: ${interviewInfo?.candidate_name}
Position: ${interviewInfo?.jobPosition}
Questions: ${JSON.stringify(questionList).slice(0, 2000)}
`.trim(),
          },
        ],
      },
      // optional metadata sent to VAPI - helpful for debugging / logs
      metadata: {
        interview_id: interview_id,
        candidate_name: interviewInfo?.candidate_name,
      },
    };

    try {
      setCallStateMessage("Connecting to AI...");
      vapi.start(assistantOptions);
    } catch (err) {
      console.error("startCall error:", err);
      toast.error("Failed to start interview");
      setCallStateMessage("Failed to start");
    }
  };

  // Stop/pause actions
  const stopInterview = async () => {
    try {
      vapi?.stop();
      setCallStateMessage("Stopping...");
    } catch (err) {
      console.error("stop error:", err);
      toast.error("Failed to stop interview");
    }
  };

  const pauseInterview = async () => {
    try {
      // If vapi supports pause, call it; otherwise stop speech synthesis only
      if (vapi?.pause) {
        vapi.pause();
        setCallStateMessage("Paused");
      } else {
        // fallback: stop TTS (SDK specific)
        vapi?.stop();
        setCallStateMessage("Paused (fallback)");
      }
    } catch (err) {
      console.error("pause error:", err);
    }
  };

  const resumeInterview = async () => {
    try {
      if (vapi?.resume) {
        vapi.resume();
        setCallStateMessage("Resumed");
      } else {
        // easiest path: restart a new call with same options is possible but complex;
        // for now inform user.
        toast("Resume not supported by SDK.");
      }
    } catch (err) {
      console.error("resume error:", err);
    }
  };

  // Generate feedback and store results
  const GenerateFeedback = async () => {
    if (!interviewInfo || conversationRef.current.length === 0) {
      toast.error("Interview data missing. Restart interview.");
      router.replace(`/interview/${interview_id}`);
      return;
    }

    setIsGeneratingFeedback(true);
    try {
      // send conversation array to server endpoint for analysis
      const resp = await axios.post("/api/ai-feedback", {
        conversation: conversationRef.current,
        jobPosition: interviewInfo?.jobPosition,
        candidateName: interviewInfo?.candidate_name,
      });

      let content = resp?.data?.content ?? "";
      // sometimes the response includes markdown/json fences
      content = content.replace(/```json|```/g, "").trim();

      // Attempt to extract JSON body
      const jsonMatch = content.match(/\{[\s\S]*\}$/);
      let parsed;
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        // if no strict JSON, attempt to parse resp.data directly
        parsed = resp?.data ?? { raw: content };
      }

      // store to supabase. store conversation transcript as JSON
      const { error: insertError } = await supabase.from("interview_results").insert([
        {
          fullname: interviewInfo?.candidate_name,
          email: interviewInfo?.userEmail,
          interview_id,
          conversation_transcript: conversationRef.current,
          feedback: parsed,
          recommendations: parsed.recommendations || "Not provided",
          completed_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      toast.success("Feedback generated and saved!");
      localStorage.removeItem("interviewInfo");
      router.replace(`/interview/${interview_id}/completed`);
    } catch (err) {
      console.error("GenerateFeedback error:", err);
      toast.error("Failed to generate feedback");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // keyboard shortcuts (Space toggles stop/resume; Enter ends)
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!isSpeaking) {
          // do nothing: Space toggles mic? Here we just show a toast for now
          toast("Space pressed — (customize to toggle mic)");
        } else {
          // if AI speaking, pause
          pauseInterview();
        }
      }
      if (e.code === "Enter") {
        e.preventDefault();
        // End interview
        stopInterview();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSpeaking]);

  // UI small helpers
  const lastTranscript = transcriptItems[transcriptItems.length - 1];
  const interimSubtitle = subtitles.interim ? subtitles.text : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header / Hero */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
              AI Interview Session — <span className="text-indigo-600">{interviewInfo?.jobPosition || "Position"}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">Friendly, accessible interview UI with live voice subtitles.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white border px-4 py-2 rounded-lg shadow-sm flex items-center gap-3">
              <Timer className="text-indigo-600" />
              <div className="text-sm font-mono text-slate-700">
                <TimmerComponent start={started} />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={startCall}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                aria-label="Start interview"
              >
                <Play size={16} /> Start
              </button>

              <AlertConfirmation stopInterview={stopInterview}>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border">
                  <Phone size={16} /> End
                </button>
              </AlertConfirmation>
            </div>
          </div>
        </header>

        {/* Main grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: AI + Candidate Cards */}
          <section className="lg:col-span-1 space-y-6">
            {/* AI Recruiter */}
            <div className={`bg-white rounded-2xl p-6 shadow border ${isSpeaking ? "ring-2 ring-indigo-100 border-indigo-200" : "border-slate-100"}`}>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border-4 border-white shadow">
                  <Image src="/AIR.png" alt="AI Recruiter" width={80} height={80} />
                  {isSpeaking && <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full animate-pulse" aria-hidden />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">AI Recruiter</h3>
                  <p className="text-sm text-slate-500">Conducting the interview</p>
                  <div className="mt-2 text-xs text-slate-400">Status: <span className="font-medium text-slate-700">{callStateMessage || (isSpeaking ? "Speaking" : "Idle")}</span></div>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Volume2 size={16} /><strong>Voice:</strong> playht / jennifer
                </div>
                <div className="mt-2 text-xs text-slate-400">Transcript & subtitle support enabled</div>
              </div>
            </div>

            {/* Candidate */}
            <div className={`bg-white rounded-2xl p-6 shadow border ${activeUser ? "ring-2 ring-pink-100 border-pink-200" : "border-slate-100"}`}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center text-2xl font-bold text-slate-600 shadow">
                  {userProfile.picture ? (
                    <Image src={userProfile.picture} alt={userProfile.name} width={80} height={80} />
                  ) : (
                    userProfile.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{userProfile.name}</h3>
                  <p className="text-sm text-slate-500">Candidate</p>
                  <div className="mt-2 text-xs text-slate-400">Active: <span className="font-medium text-slate-700">{activeUser ? "Yes" : "No"}</span></div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => toast("Open candidate profile (implement)")}
                  className="text-sm text-indigo-600 hover:underline inline-flex items-center gap-2"
                >
                  < size={14} /> View profile
                </button>
              </div>
            </div>

            {/* Live subtitle bar */}
            <div className="bg-white rounded-xl p-4 shadow border border-slate-100">
              <div className="text-xs text-slate-400 mb-2">Live subtitles</div>
              <div
                className={`min-h-[48px] rounded-md px-3 py-2 flex items-center justify-center text-center ${
                  subtitles.interim ? "bg-yellow-50 border border-yellow-100 text-yellow-800" : "bg-slate-50 text-slate-700"
                }`}
                role="status"
                aria-live="polite"
              >
                {subtitles.text ? (
                  <p className={`text-sm ${subtitles.interim ? "italic" : "font-medium"}`}>
                    {subtitles.text}
                    {subtitles.interim && <span className="ml-2 text-xs opacity-70">…</span>}
                  </p>
                ) : (
                  <span className="text-sm text-slate-400">{isSpeaking ? "AI speaking..." : "Waiting for audio..."}</span>
                )}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">Tip: interim subtitles show while candidate speaks; final lines appear in the transcript panel.</div>
            </div>
          </section>

          {/* Middle: Transcript / Controls (large) */}
          <section className="lg:col-span-2 grid grid-rows-[auto,1fr] gap-6">
            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => (isSpeaking ? pauseInterview() : resumeInterview())}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-50 border hover:bg-slate-100"
                  aria-pressed={isSpeaking}
                >
                  {isSpeaking ? <Pause size={16} /> : <Play size={16} />} {isSpeaking ? "Pause" : "Resume"}
                </button>

                <AlertConfirmation stopInterview={stopInterview}>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-50 text-red-700 border hover:bg-red-100">
                    <Phone size={16} /> End Interview
                  </button>
                </AlertConfirmation>

                <button
                  onClick={() => {
                    // quick export transcript as JSON file
                    const blob = new Blob([JSON.stringify(conversationRef.current, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${interviewInfo?.candidate_name || "interview"}-transcript.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border hover:bg-slate-50"
                >
                  Export Transcript
                </button>
              </div>

              <div className="text-sm text-slate-500">
                <strong className="text-slate-800">{transcriptItems.length}</strong> transcript lines • Last:{" "}
                <span className="font-mono text-slate-600 text-xs">{lastTranscript ? new Date(lastTranscript.ts).toLocaleTimeString() : "-"}</span>
              </div>
            </div>

            {/* Transcript panel */}
            <div className="bg-white rounded-2xl p-4 shadow border overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-800">Transcript</h4>
                <div className="text-xs text-slate-400">Realtime conversation log</div>
              </div>

              <div className="h-[420px] overflow-auto rounded-md border border-slate-100 p-3 bg-slate-50">
                {transcriptItems.length === 0 ? (
                  <div className="text-center text-slate-400 py-12">Transcript will appear here as the interview proceeds.</div>
                ) : (
                  <ul className="space-y-3">
                    {transcriptItems.map((it, i) => (
                      <li key={i} className="p-3 bg-white rounded-lg shadow-sm border">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${it.role === "assistant" ? "bg-indigo-50 text-indigo-600" : "bg-pink-50 text-pink-600"}`}>
                                {it.role?.charAt(0)?.toUpperCase()}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-slate-800">
                                  {it.role === "assistant" ? "AI Recruiter" : it.role === "user" ? userProfile.name : it.role}
                                </div>
                                <div className="text-[12px] text-slate-400">{new Date(it.ts).toLocaleTimeString()}</div>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{it.text}</div>
                          </div>
                          <div className="text-xs text-slate-400 text-right">
                            {it.raw ? <div className="italic">auto</div> : <div>manually</div>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* Footer small controls / overlay */}
        <footer className="max-w-7xl mx-auto">
          <div className="text-center text-xs text-slate-400">
            Built with VAPI • Make sure your <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_VAPI_KEY</code> and transcriber credentials are configured.
          </div>
        </footer>
      </div>

      {/* Generating feedback modal */}
      {isGeneratingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-800">Generating feedback</h3>
            <p className="mt-2 text-sm text-slate-500">We are analyzing responses and saving results. This may take a short moment.</p>
          </div>
        </div>
      )}
    </div>
  );
}
