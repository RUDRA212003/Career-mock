'use client';
import React, { useEffect, useState, useContext } from 'react';
import Image from 'next/image';
import { 
  Clock, CheckCircle, ShieldCheck, Maximize, AlertCircle, Smartphone, UserX
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { InterviewDataContext } from '@/context/InterviewDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/app/provider';

const DEBUG_MODE = false; 

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
  
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(DEBUG_MODE);
  const [deviceAuthorized, setDeviceAuthorized] = useState(true);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showSecurityIcon, setShowSecurityIcon] = useState(false);
  const [tabBreach, setTabBreach] = useState(false);

  useEffect(() => {
    if (DEBUG_MODE) return;

    const checkDevice = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      if (isMobile || window.innerWidth < 1024) setDeviceAuthorized(false);
    };

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        toast.error("Security Breach", { description: "Return to fullscreen immediately." });
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      setMousePos({ x: e.clientX, y: e.clientY });
      setShowSecurityIcon(true);
      toast.error("Action Prohibited", { description: "Security protocols active." });
      setTimeout(() => setShowSecurityIcon(false), 1500);
    };

    const handleKeyDown = (e) => {
      const isDevTools = (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || e.key === 'F12';
      const isSourceView = e.ctrlKey && e.key.toLowerCase() === 'u';
      const isClipboard = e.ctrlKey && ['c', 'v', 'x'].includes(e.key.toLowerCase());

      if (isDevTools || isSourceView || isClipboard) {
        e.preventDefault();
        setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setShowSecurityIcon(true);
        toast.warning("Access Denied", { description: "Keyboard restricted." });
        setTimeout(() => setShowSecurityIcon(false), 1500);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) setTabBreach(true);
    };

    const handleBlur = () => setTabBreach(true);
    const handleFocus = () => setTimeout(() => setTabBreach(false), 3000);

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('resize', checkDevice);
    checkDevice();

    // FIXED: Non-crashing anti-debugger
    const antiDebugger = setInterval(() => {
        const start = Date.now();
        debugger; 
        if (Date.now() - start > 100) {
            console.clear();
        }
    }, 2000);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('resize', checkDevice);
      clearInterval(antiDebugger);
    };
  }, []);

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setShowAuthWarning(true);
        setTimeout(() => router.push("/login"), 5000);
      }
    };
    checkAccess();
  }, [router]);

  useEffect(() => {
    if (user) {
      setUserName(user.name || '');
      setUserEmail(user.email || '');
    }
    if (interview_id) GetInterviewDetails();
  }, [user, interview_id]);

  const GetInterviewDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("interviews").select('*').eq("interview_id", interview_id).single();
      if (error) throw error;
      setInterviewData({
        jobPosition: data.jobposition,
        duration: data.duration,
        questionList: data.questionlist,
      });
    } catch (error) {
      toast.error("Failed to fetch session data");
    } finally {
      setLoading(false);
    }
  };

  const onJoinInterview = () => {
    if (!deviceAuthorized && !DEBUG_MODE) return;
    if (!userName.trim() || userName.trim().split(" ").length < 2) return toast.warning("Legal name required.");
    if (!isFullScreen && !DEBUG_MODE) return;

    const info = {
      candidate_name: userName,
      jobPosition: interviewData?.jobPosition,
      duration: interviewData?.duration,
      userEmail,
      interview_id,
      questionList: interviewData?.questionList,
    };
    setInterviewInfo(info);
    localStorage.setItem('interviewInfo', JSON.stringify(info));
    router.push(`/interview/${interview_id}/start`);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      
      {/* HORROR BREACH OVERLAY */}
      <AnimatePresence>
  {tabBreach && (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md pointer-events-none flex items-center justify-center"
    >
      {/* Heavy Red Pulsing Vignette */}
      <div className="absolute inset-0 border-[24px] border-red-900 animate-pulse shadow-[inset_0_0_200px_rgba(153,27,27,1)]" />
      
      <motion.div 
        // SLOW SWAY: Uses small x movement and very slight rotation
        animate={{ 
          x: [-8, 8, -8],
          rotate: [-1, 1, -1],
          scale: [1, 1.02, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 6, // 4 seconds makes it feel heavy and drifting
          ease: "easeInOut" 
        }}
        className="text-center px-12 py-20 bg-black border-2 border-red-600 rounded-[40px] shadow-[0_0_150px_rgba(220,38,38,0.4)] z-10"
      >
        <motion.div
          animate={{ opacity: [1, 0.8, 1], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <AlertCircle className="w-24 h-24 text-red-600 mx-auto mb-6 drop-shadow-[0_0_25px_rgba(220,38,38,1)]" />
        </motion.div>

        <h2 className="text-7xl font-black text-white tracking-tighter mb-4 uppercase italic">
          VIOLATION
        </h2>
        
        <p className="text-red-600 font-bold text-2xl uppercase tracking-[0.3em] mb-4 animate-pulse">
          TAB SWITCH DETECTED
        </p>
        
        <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
          Your session has been flagged. <br />
          <span className="text-red-500/80 font-black">LOG_ID: {Math.random().toString(36).toUpperCase().substring(7)}</span>
          <br />
          Continuous violations result in immediate termination.
        </p>

        {/* Fake Data Stream Effect */}
        <div className="mt-8 flex items-center justify-center gap-2 overflow-hidden w-full opacity-20">
            <div className="h-[1px] w-full bg-red-600 animate-pulse" />
            <span className="text-[8px] text-red-600 font-mono whitespace-nowrap">UPLOADING_BREACH_REPORT_TO_SERVER</span>
            <div className="h-[1px] w-full bg-red-600 animate-pulse" />
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>  

      {/* FLOATING ICON */}
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

      {/* DEVICE & FULLSCREEN OVERLAYS */}
      <AnimatePresence>
        {!deviceAuthorized && !DEBUG_MODE && (
          <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center text-center p-10">
            <Smartphone className="w-20 h-20 text-gray-200 mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-2">PC Required</h2>
            <p className="text-gray-500">Please use a Laptop or Desktop for this interview.</p>
          </div>
        )}

        {!DEBUG_MODE && deviceAuthorized && !isFullScreen && !tabBreach && (
          <div className="fixed inset-0 z-[500] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center text-center">
            <Maximize className="w-16 h-16 text-indigo-600 mb-6 animate-bounce" />
            <h2 className="text-3xl font-bold mb-4">Security Protocol Active</h2>
            <Button onClick={enterFullScreen} className="h-16 px-12 rounded-2xl bg-indigo-600 text-xl font-bold shadow-2xl text-white">Return to Session</Button>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`max-w-4xl w-full z-10 ${tabBreach ? 'blur-2xl' : ''}`}>
        
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-56 h-56 mb-4 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={400} height={400} className="object-contain" priority />
          </motion.div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Secure Gateway</h1>
          <p className="text-emerald-600 uppercase text-xs font-black tracking-[0.3em] mt-2">Career Mock AI Interview</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
          <div className="bg-indigo-600 p-10 text-white flex justify-between items-center">
            <div>
              <p className="text-indigo-200 text-xs uppercase font-bold tracking-widest mb-1">Target Position</p>
              <h2 className="text-3xl font-bold tracking-tight">{interviewData?.jobPosition || 'Processing...'}</h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3">
              <Clock size={20} />
              <span className="text-lg font-black">{interviewData?.duration || '30'}m Session</span>
            </div>
          </div>

          <div className="p-12 space-y-10">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Candidate Name</label>
                  <Input value={userName} onChange={(e) => setUserName(e.target.value)} className="h-16 rounded-2xl bg-gray-50 border-gray-100 text-xl font-medium" placeholder="First & Last Name" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Identity Status</label>
                  <div className="h-16 flex items-center px-6 bg-green-50 rounded-2xl text-green-700 font-bold border border-green-100">
                    <ShieldCheck className="mr-3 text-green-600" size={24} />
                    Verified: {userEmail || 'Verifying...'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <AlertCircle size={16} /> Security Rules
                </h4>
                <ul className="space-y-4 text-xs font-bold text-gray-600">
                   <li className="flex items-center gap-3 text-green-600"><CheckCircle size={16}/> Copy/Paste Restricted</li>
                   <li className="flex items-center gap-3 text-green-600"><CheckCircle size={16}/> Session Auto-Recording</li>
                   <li className="flex items-center gap-3 text-red-600"><AlertCircle size={16}/> Tab Switch = Disqualification</li>
                </ul>
              </div>
            </div>

            <Button onClick={onJoinInterview} disabled={loading} className="w-full h-20 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-2xl font-black text-white shadow-xl transition-all">
              {loading ? "Establishing Secure Link..." : "Start Official Interview"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Interview;