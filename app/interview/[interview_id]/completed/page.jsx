'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { Shield, Clock, Mail, ChevronRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const InterviewCompleted = () => {
  
  useEffect(() => {
    // Function for continuous premium confetti bursts
    const fireConfetti = () => {
      const count = 40;
      const defaults = {
        origin: { y: 0.7 },
        spread: 360,
        ticks: 70,
        gravity: 0.8,
        decay: 0.95,
        startVelocity: 20,
        shapes: ['circle'],
      };

      confetti({
        ...defaults,
        particleCount: count,
        scalar: 1.2,
        colors: ['#007AFF', '#5856D6', '#34C759']
      });
    };

    // Initial blast
    fireConfetti();

    // Repeat every 3 seconds indefinitely
    const interval = setInterval(fireConfetti, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-6 py-12 font-sans selection:bg-blue-100 overflow-hidden relative">
      
      {/* Background depth layers */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[130px] opacity-70"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-purple-50 rounded-full blur-[130px] opacity-70"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-[520px] w-full bg-white/70 backdrop-blur-3xl p-12 rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.04)] border border-white/50 relative z-10 text-center"
      >
        {/* Larger Prominent Logo */}
        <div className="flex justify-center mb-12">
          <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3 }}
          >
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={140} // Increased size
              height={140} 
              className="object-contain" 
              priority
            />
          </motion.div>
        </div>

        {/* Success Icon Animation */}
        <div className="relative mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#34C759] mb-10 shadow-[0_12px_28px_rgba(52,199,89,0.35)]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          >
            <Check className="h-10 w-10 text-white stroke-[3.5px]" />
          </motion.div>
        </div>

        <h1 className="text-[36px] font-bold text-[#1D1D1F] tracking-tight leading-tight mb-4">
          All Done.
        </h1>
        <p className="text-[19px] text-[#86868B] font-medium leading-relaxed mb-12 px-4">
          Your interview has been securely submitted to the <span className="text-[#1D1D1F]">Review Team</span>.
        </p>

        {/* Apple List Style */}
        <div className="space-y-4 mb-12 text-left">
          <InfoRow 
            icon={<Shield className="w-5 h-5 text-blue-600" />} 
            title="Secure Storage" 
            desc="Responses are end-to-end encrypted."
          />
          <InfoRow 
            icon={<Clock className="w-5 h-5 text-purple-600" />} 
            title="Processing" 
            desc="Expect feedback within 3 business days."
          />
          <InfoRow 
            icon={<Mail className="w-5 h-5 text-green-600" />} 
            title="Email Updates" 
            desc="Notifications will be sent to your inbox."
          />
        </div>

        {/* Action / Footer Box */}
        <div className="bg-[#F5F5F7] rounded-[28px] p-7 border border-[#D2D2D7]/40">
          <p className="text-[15px] text-[#1D1D1F] font-semibold mb-1">
            Task Successfully Completed
          </p>
          <p className="text-[14px] text-[#86868B]">
            You may safely exit the portal now.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// Reusable Sub-component for rows
const InfoRow = ({ icon, title, desc }) => (
  <div className="flex items-center justify-between p-5 bg-white/40 rounded-[24px] border border-white hover:bg-white/60 transition-all cursor-default group shadow-sm">
    <div className="flex items-center gap-5">
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-[16px] font-semibold text-[#1D1D1F]">{title}</h3>
        <p className="text-[14px] text-[#86868B]">{desc}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-[#C1C1C6] group-hover:translate-x-1 transition-transform" />
  </div>
);

export default InterviewCompleted;