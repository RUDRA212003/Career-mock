'use client';
import React, { useEffect, useState, useContext, useRef } from 'react';
import Image from 'next/image';
import { 
  Clock, Mic, Video, CheckCircle, ChevronRight, 
  ShieldCheck, Globe, Lock, Unlock, Activity, Info, Maximize, Monitor, Smartphone
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { InterviewDataContext } from '@/context/InterviewDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/app/provider';

function Interview() {
  const params = useParams();
  const interview_id = params?.interview_id;
  const router = useRouter();
  const { user } = useUser();
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);

  const [interviewData, setInterviewData] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSystem, setCheckingSystem] = useState(false);
  const [checks, setChecks] = useState({ mic: false, cam: false, internet: false });
  const [mouseMsg, setMouseMsg] = useState({ x: 0, y: 0, visible: false, text: "" });

  // Security States
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [deviceAuthorized, setDeviceAuthorized] = useState(true);

  /* -------------------------------------------------------------------------- */
  /* SECURITY: DEVICE & FULLSCREEN ENFORCEMENT                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      
      // Laptop/Desktop usually have width > 1024. Most tablets/phones are smaller.
      const isSmallScreen = window.innerWidth < 1024;

      if (isMobile || isSmallScreen) {
        setDeviceAuthorized(false);
      } else {
        setDeviceAuthorized(true);
      }
    };

    const handleFullScreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);
      if (!isFull && deviceAuthorized) {
        toast.warning("Assessment Paused", { description: "Please remain in fullscreen mode." });
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      setMouseMsg({ x: e.clientX, y: e.clientY, visible: true, text: "Focus on the Goal" });
      setTimeout(() => setMouseMsg(prev => ({ ...prev, visible: false })), 1500);
    };

    // Initial Checks
    checkDevice();
    window.addEventListener('resize', checkDevice);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('resize', checkDevice);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [deviceAuthorized]);

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  /* -------------------------------------------------------------------------- */
  /* DATA FETCHING                                                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (interview_id) GetInterviewDetails();
  }, [interview_id]);

  useEffect(() => {
    if (user) {
      setUserName(user.name || '');
      setUserEmail(user.email || '');
    }
  }, [user]);

  const GetInterviewDetails = async () => {
    setLoading(true);
    try {
      const { data: Interviews, error } = await supabase
        .from("interviews")
        .select('interview_id, "userEmail", jobposition, jobdescription, duration, type, questionlist')
        .eq("interview_id", interview_id);

      if (error) throw error;
      if (Interviews && Interviews.length > 0) {
        const data = Interviews[0];
        setInterviewData({
          userEmail: data.useremail,
          jobPosition: data.jobposition,
          duration: data.duration,
          questionList: data.questionlist,
        });
      }
    } catch (error) {
      toast.error("Security handshake failed");
    } finally {
      setLoading(false);
    }
  };

  const runSystemCheck = async () => {
    setCheckingSystem(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (stream) {
        setChecks(prev => ({ ...prev, mic: true, cam: true }));
        stream.getTracks().forEach(track => track.stop());
      }
      if (navigator.onLine) setChecks(prev => ({ ...prev, internet: true }));
    } catch (err) {
      toast.error("Hardware access required to proceed");
    } finally {
      setCheckingSystem(false);
    }
  };

  const isReady = checks.mic && checks.cam && checks.internet && userName.trim().split(" ").length >= 2;

  const onJoinInterview = async () => {
    if (!deviceAuthorized) {
        toast.error("Mobile devices are strictly prohibited");
        return;
    }
    if (!isReady || !isFullScreen) {
        if(!isFullScreen) toast.error("Must be in Fullscreen mode");
        return;
    }
    const info = {
      ...interviewInfo,
      candidate_name: userName,
      jobPosition: interviewData?.jobPosition,
      duration: interviewData?.duration,
      userEmail: userEmail,
      interview_id: interview_id,
      questionList: interviewData?.questionList,
    };
    setInterviewInfo(info);
    localStorage.setItem('interviewInfo', JSON.stringify(info));
    router.push(`/interview/${interview_id}/start`);
  };

  return (
    <div className="h-screen w-full bg-[#F5F5F7] text-[#1D1D1F] overflow-hidden flex flex-col items-center justify-center p-6 select-none font-sans relative">
      
      {/* 1. DEVICE PROTECTION OVERLAY */}
      <AnimatePresence>
        {!deviceAuthorized && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-[#F5F5F7] flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="bg-white p-12 rounded-[40px] shadow-2xl max-w-lg border border-red-100">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="text-red-500 w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Mobile Access Blocked</h2>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                  For security and technical compliance, this AI interview can <b>only</b> be taken on a <b>Laptop or Desktop Computer</b>. 
                </p>
                <div className="flex items-center justify-center gap-2 text-red-600 font-semibold bg-red-50 py-3 rounded-2xl">
                    <Monitor size={20} />
                    <span>Switch to a computer to continue</span>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FULLSCREEN LOCK OVERLAY */}
      <AnimatePresence>
        {deviceAuthorized && !isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 max-w-md">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Maximize className="text-blue-600 w-10 h-10 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Fullscreen Required</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  To ensure a secure and fair interview environment, this session can only be conducted in fullscreen mode.
                </p>
                <Button 
                    onClick={enterFullScreen}
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-200"
                >
                    Return to Session
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mouse Message */}
      <AnimatePresence>
        {mouseMsg.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1, y: -20 }} exit={{ opacity: 0 }}
            style={{ left: mouseMsg.x, top: mouseMsg.y, position: 'fixed' }}
            className="z-[100] pointer-events-none bg-white shadow-2xl px-4 py-2 rounded-full border border-gray-100 text-blue-600 font-bold text-sm whitespace-nowrap"
          >
            {mouseMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        
        {/* LEFT PANEL */}
        <div className="flex flex-col justify-center space-y-10">
          <div className="space-y-6">
            <motion.div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200/50 p-2 overflow-hidden">
                <Image src="/logo.png" alt="Logo" width={50} height={50} className="object-contain" />
              </div>
              <div className="h-10 w-[1px] bg-gray-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Secure Gateway</span>
            </motion.div>

            <h1 className="text-5xl font-semibold tracking-tight text-[#1D1D1F] leading-tight">
              Gateway to <br /> <span className="text-blue-600 font-bold italic">Success.</span>
            </h1>
            <p className="text-gray-500 text-lg font-medium">Verify your profile and hardware to enter the chamber.</p>
          </div>

          <div className="space-y-6 max-w-sm">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Candidate Name</label>
              <Input 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)}
                className="bg-white/60 backdrop-blur-md border-gray-200 h-14 rounded-2xl text-lg focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                placeholder="Full Name Required"
              />
            </div>

            <div className="bg-white/40 backdrop-blur-sm p-5 rounded-2xl border border-gray-200/50 flex items-center justify-between">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ID Verified</label>
                <p className="text-gray-600 font-medium text-sm">{userEmail}</p>
              </div>
              <Lock size={16} className="text-gray-300" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: DIAGNOSTICS */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[48px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">Hardware Handshake</h2>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[10px] font-bold text-blue-600 uppercase">Live Ping</span>
              </div>
            </div>

            <div className="space-y-3">
              <CheckRow label="Audio Interface" active={checks.mic} />
              <CheckRow label="Visual Presence" active={checks.cam} />
              <CheckRow label="Network Stability" active={checks.internet} />
            </div>

            <Button 
              onClick={runSystemCheck}
              disabled={checkingSystem}
              className="w-full h-14 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-2xl transition-all border border-gray-100 shadow-sm"
            >
              {checkingSystem ? "Analyzing Hardware..." : "Run Diagnostics"}
            </Button>
          </div>

          <div className="pt-10">
            <Button 
              onClick={onJoinInterview}
              disabled={!isReady}
              className={`w-full h-16 rounded-[24px] text-lg font-bold transition-all duration-500 ${
                isReady 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {isReady ? <Unlock size={20} className="animate-bounce" /> : <Lock size={20} />}
                Enter Interview Chamber
              </div>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-8 opacity-40">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Protocol Secure AI Channel // 0.2.4</span>
      </div>
    </div>
  );
}

function CheckRow({ label, active }) {
  return (
    <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 ${
      active ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'
    }`}>
      <span className={`text-[13px] font-bold uppercase tracking-widest ${active ? 'text-green-700' : 'text-gray-400'}`}>
        {label}
      </span>
      {active ? (
        <CheckCircle size={18} className="text-green-600" />
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
      )}
    </div>
  );
}

export default Interview;