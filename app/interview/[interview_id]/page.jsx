'use client';
import React, { useEffect, useState, useContext, useRef } from 'react';
import Image from 'next/image';
import { 
  Clock, Mic, Video, CheckCircle, ChevronRight, 
  ShieldCheck, Lock, Maximize, AlertCircle, MonitorOff, Smartphone, UserX
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { InterviewDataContext } from '@/context/InterviewDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/app/provider';

// MASTER CONFIGURATION
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
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Custom Login Redirect States
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Security States
  const [isFullScreen, setIsFullScreen] = useState(DEBUG_MODE);
  const [deviceAuthorized, setDeviceAuthorized] = useState(true);

  /* -------------------------------------------------------------------------- */
  /* SECURITY: DEVICE, FULLSCREEN & RIGHT CLICK ENFORCEMENT                    */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const checkDevice = () => {
      if (DEBUG_MODE) return;
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const isTouchDevice = navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;

      if (isMobileUA || (isTouchDevice && isSmallScreen)) {
        setDeviceAuthorized(false);
      } else {
        setDeviceAuthorized(true);
      }
    };

    if (!DEBUG_MODE) {
      const handleFullScreenChange = () => {
        const isFull = !!document.fullscreenElement;
        setIsFullScreen(isFull);
        if (!isFull) {
          toast.warning("Assessment Paused", { description: "Return to fullscreen to continue." });
        }
      };

      const handleContextMenu = (e) => {
        e.preventDefault();
        toast.error("Right-click is disabled for security.");
      };

      document.addEventListener('fullscreenchange', handleFullScreenChange);
      window.addEventListener('contextmenu', handleContextMenu);
      checkDevice();
      window.addEventListener('resize', checkDevice);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullScreenChange);
        window.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener('resize', checkDevice);
      };
    }
  }, []);

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  /* -------------------------------------------------------------------------- */
  /* AUTH CHECK WITH 5-SECOND MESSAGE                                           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setShowAuthWarning(true);
        // Wait for 5 seconds before redirecting
        setTimeout(() => {
          router.push("/login");
        }, 5000);
        return;
      }
      setAccessDenied(false);
    };
    checkAccess();
  }, [router]);

  useEffect(() => {
    if (user) {
      setUserName(user.name || '');
      setUserEmail(user.email || '');
    }
  }, [user]);

  /* -------------------------------------------------------------------------- */
  /* DATA FETCHING                                                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (interview_id) GetInterviewDetails();
  }, [interview_id]);

  const GetInterviewDetails = async () => {
    setLoading(true);
    try {
      const { data: Interviews, error } = await supabase
        .from("interviews")
        .select('interview_id, "userEmail", jobposition, jobdescription, duration, type, questionlist')
        .eq("interview_id", interview_id);

      if (error) throw error;
      if (!Interviews?.length) throw new Error("No interview found");

      const data = Interviews[0];
      setInterviewData({
        userEmail: data.userEmail,
        jobPosition: data.jobposition,
        jobDescription: data.jobdescription,
        duration: data.duration,
        type: data.type,
        questionList: data.questionlist,
      });
    } catch (error) {
      toast.error(error.message || "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  const onJoinInterview = async () => {
    if (!deviceAuthorized && !DEBUG_MODE) {
      toast.error("Please use a Laptop or Desktop.");
      return;
    }
    if (!userName.trim() || userName.trim().split(" ").length < 2) {
      toast.warning("Provide your full name (First and Last)");
      return;
    }
    if (!isFullScreen && !DEBUG_MODE) {
      toast.error("Must be in fullscreen mode to start.");
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      
      {/* 1. AUTHENTICATION REDIRECT MESSAGE (5 SECONDS) */}
      <AnimatePresence>
        {showAuthWarning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-white flex flex-col items-center justify-center p-10 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="max-w-md bg-white p-8 rounded-[32px] shadow-2xl border border-blue-50"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserX className="text-blue-600 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Please login as candidate. Currently we don't have your data. Please login as the candidate.
              </p>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }} animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="bg-blue-600 h-full"
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase mt-2">Redirecting in 5 seconds...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. DEVICE PROTECTION OVERLAY */}
      <AnimatePresence>
        {!deviceAuthorized && !DEBUG_MODE && !showAuthWarning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="max-w-md">
              <Smartphone className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Device Restricted</h2>
              <p className="text-gray-600 mb-8">Please use a Laptop or Desktop to continue.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FULLSCREEN OVERLAY */}
      <AnimatePresence>
        {!DEBUG_MODE && deviceAuthorized && !isFullScreen && !showAuthWarning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[500] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 max-w-md">
                <Maximize className="text-indigo-600 w-12 h-12 mx-auto mb-6 animate-pulse" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Freeze</h2>
                <Button onClick={enterFullScreen} className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-xl">Return to Session</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN UI CONTENT */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-4xl w-full z-10 ${showAuthWarning ? 'blur-md' : ''}`}
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 border border-gray-200">
            <Image src="/logo.png" alt="Logo" width={48} height={48} priority />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Secure Gateway</h1>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest">Career Mock AI Assessment</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 px-8 py-6 text-white flex justify-between items-center">
            <div>
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Position</p>
              <h2 className="text-xl font-bold tracking-tight">{interviewData?.jobPosition || 'Loading...'}</h2>
            </div>
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
               <Clock size={16} className="text-indigo-200" />
               <span className="text-sm font-bold">{interviewData?.duration || '30'} Min Session</span>
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
                  <Input 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:ring-2 focus:ring-indigo-500 text-lg font-medium"
                    placeholder="Enter your legal name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-widest mb-2 block ml-1">Identity (Verified)</label>
                  <div className="h-14 flex items-center px-4 bg-gray-100 rounded-2xl text-gray-500 font-medium">
                    <ShieldCheck className="mr-2 text-indigo-500" size={18} />
                    {userEmail || 'Verification pending...'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertCircle size={14} className="text-indigo-500" />
                  Security Protocol
                </h4>
                <ul className="space-y-3 text-xs font-bold text-gray-600">
                  <li className="flex items-center gap-3"><CheckCircle size={14} className="text-green-500" />Laptops / Desktops only</li>
                  <li className="flex items-center gap-3"><CheckCircle size={14} className="text-green-500" />No right-click / inspection</li>
                  <li className="flex items-center gap-3"><CheckCircle size={14} className="text-green-500" />Fullscreen mode required</li>
                  <li className="flex items-center gap-3"><CheckCircle size={14} className="text-green-500" />Mic & Camera access required</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={onJoinInterview} 
              disabled={loading || showAuthWarning}
              className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              {loading ? "Syncing..." : "Start Secure Session"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Interview;