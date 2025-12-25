"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Maintenance() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f5f5f7] text-[#1d1d1f] px-6 text-center overflow-hidden relative">
      
      {/* 🌀 Background Ambient Motion */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] z-0"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10"
      >
        {/* 🚀 Looping Float Animation for Logo */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/logo.png" alt="Logo" width={100} height={100} className="mb-8 mx-auto drop-shadow-2xl" />
        </motion.div>

        <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4">
          Improving Your <br /> 
          <span className="bg-gradient-to-r from-[#0071e3] to-[#5e5ce6] bg-clip-text text-transparent">Career Partner</span>
        </h1>

        <p className="text-xl text-[#636366] max-w-xl mx-auto leading-relaxed mb-8">
          We’re polishing the platform to serve you better. While we work on the code, 
          don’t let your momentum fade.
        </p>

        {/* 🔥 Motivational Message */}
        <div className="bg-white/50 backdrop-blur-md border border-white p-6 rounded-[24px] shadow-sm max-w-md mx-auto mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0071e3] mb-2">Daily Challenge</p>
          <p className="text-[#1d1d1f] italic font-medium text-lg">
            "The site is down, but the mirror is always up. Stand tall, practice your introduction, and master your eye contact today."
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="px-6 py-2 bg-[#1d1d1f] text-white rounded-full text-sm font-medium shadow-lg">
            Status: <span className="text-blue-400 animate-pulse">Upgrading Engines</span>
          </div>
          
          <p className="text-sm text-[#86868b]">
            Need urgent help? Reach out at: <br />
            <a href="mailto:rudreshmanjunath15@gmail.com" className="text-[#0071e3] font-semibold hover:underline">
              rudreshmanjunath15@gmail.com
            </a>
          </p>
        </div>
      </motion.div>

      {/* 🎭 Bottom Looping Marquee */}
      <div className="absolute bottom-10 w-full overflow-hidden whitespace-nowrap opacity-30 pointer-events-none">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 text-4xl font-black text-gray-300 uppercase italic"
        >
          <span>Practice makes perfect</span>
          <span>Believe in yourself</span>
          <span>Master the interview</span>
          <span>Stay hungry stay foolish</span>
          <span>Your time is now</span>
        </motion.div>
      </div>
    </div>
  );
}