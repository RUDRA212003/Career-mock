"use client";
import { motion } from "framer-motion";
import { Bug, Mail, Sparkles, RefreshCcw } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen w-full bg-[#fbfbfd] flex flex-col lg:flex-row items-center justify-center p-6 lg:p-0 font-sans overflow-x-hidden">
      
      {/* 🎥 Video Section (Left / Top) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center lg:h-screen bg-[#f5f5f7] lg:bg-transparent">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white shadow-blue-100/50"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/maintanance.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Subtle Scanning Overlay */}
          <motion.div 
            animate={{ y: [-500, 500] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent z-10"
          />
        </motion.div>
      </div>

      {/* 📝 Content Section (Right / Bottom) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left p-8 lg:p-20">
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-md"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-8">
            <RefreshCcw size={14} className="text-blue-600 animate-spin-slow" />
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
              Optimization in Progress
            </span>
          </div>

          <h1 className="text-4xl lg:text-7xl font-bold tracking-tight text-[#1d1d1f] mb-6 leading-[1.05]">
            Site Under <br />
            <span className="text-blue-600 underline underline-offset-8 decoration-blue-100">Maintenance</span>
          </h1>

          <p className="text-lg lg:text-xl text-[#636366] mb-10 leading-relaxed font-medium">
            We are currently <span className="text-[#1d1d1f] font-bold">removing errors and bugs</span> from the core system. Please coordinate with us while we polish the experience.
          </p>

          {/* Mirror Motivation Block */}
          <div className="relative p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm mb-12 group transition-all hover:shadow-md">
            <div className="absolute -top-3 -left-3 bg-yellow-400 p-2 rounded-xl text-white shadow-lg">
              <Sparkles size={18} />
            </div>
            <p className="text-lg italic font-medium text-[#1d1d1f] leading-relaxed">
              "We're debugging our code; you should be debugging your pitch. Stand tall in front of a mirror and practice your introduction today."
            </p>
          </div>

          {/* Contact Footer */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Bug size={20} />
              </div>
              <span className="text-sm font-semibold text-[#1d1d1f]">Critical stability and bug removal active.</span>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Mail size={20} />
              </div>
              <a href="mailto:rudreshmanjunath15@gmail.com" className="text-blue-600 font-bold hover:underline transition-all">
                rudreshmanjunath15@gmail.com
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tailwind Custom Keyframes */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}