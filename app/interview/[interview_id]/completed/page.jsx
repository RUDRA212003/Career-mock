'use client';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const InterviewCompleted = () => {
  const audioRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Audio Logic: Attempt to play sound and handle browser restrictions
    const playSuccessSound = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.5;
          await audioRef.current.play();
          // Once it plays, we don't need the backup listener anymore
          window.removeEventListener('click', playSuccessSound);
          window.removeEventListener('touchstart', playSuccessSound);
        } catch (err) {
          console.log("Autoplay blocked. Sound will play upon user interaction.");
        }
      }
    };

    // Try playing after a short delay
    const timeoutId = setTimeout(playSuccessSound, 800);

    // Backup: Play sound when user touches or clicks anywhere
    window.addEventListener('click', playSuccessSound);
    window.addEventListener('touchstart', playSuccessSound);

    // 2. Continuous Confetti Blast (Indefinite)
    const interval = setInterval(function() {
      // Left Cannon
      confetti({ 
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#34C759', '#007AFF', '#FFFFFF']
      });
      // Right Cannon
      confetti({ 
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#34C759', '#007AFF', '#FFFFFF']
      });
    }, 200);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
      window.removeEventListener('click', playSuccessSound);
      window.removeEventListener('touchstart', playSuccessSound);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center px-6 py-12 font-sans overflow-hidden relative">
      {/* Audio File - Ensure this is in /public/success.mp3 */}
      <audio ref={audioRef} src="/success.mp3" preload="auto" />

      {/* Immersive Background Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] bg-emerald-600/10 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-[480px] w-full relative z-10"
      >
        {/* Success Card */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative">
          
          {/* Main Success Icon with Pulse Rings */}
          <div className="flex justify-center mb-8 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.1, 1] }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }} 
              className="relative z-20 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-[0_0_50px_rgba(52,199,89,0.4)]"
            >
              <CheckCircle2 className="h-12 w-12 text-white stroke-[2.5px]" />
            </motion.div>
            
            {/* Blast Ripple Effect */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="absolute top-0 h-24 w-24 rounded-full border border-emerald-500/30"
              />
            ))}
          </div>

          <div className="text-center mb-10">
            <h1 className="text-white text-4xl font-bold tracking-tight mb-4 leading-tight">
              Interview <br/> Successfully Completed
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed px-4">
              Great job! Your responses have been securely transmitted to our team.
            </p>
          </div>

          {/* Key Information Grid */}
          <div className="grid gap-4 mb-10">
            <div className="flex items-center gap-4 p-5 rounded-[24px] bg-white/[0.04] border border-white/5">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-[15px] font-semibold mb-0.5">Secure Submission</p>
                <p className="text-gray-500 text-xs">End-to-end encrypted</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-[24px] bg-white/[0.04] border border-white/5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-[15px] font-semibold mb-0.5">Estimated Review</p>
                <p className="text-gray-500 text-xs">Results within 72 hours</p>
              </div>
            </div>
          </div>

          {/* Navigation Button */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/candidate/interviews')}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl"
          >
            Return Home
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Footer Brand */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-col items-center gap-4 opacity-50"
        >
          <div className="flex items-center gap-3 ">
            <Image src="/logo.png" alt="Logo" width={150} height={150} />
            <span className="text-white text-xs font-medium tracking-widest uppercase">Portal v2.0</span>
          </div>
          <p className="text-gray-600 text-[11px]">Secure Connection Established</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InterviewCompleted;