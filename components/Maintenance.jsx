"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Bug, Mail, Sparkles, RefreshCcw, Gamepad2, X, Bomb } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Maintenance() {
  const [isGameOpen, setIsGameOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-[#fbfbfd] flex flex-col lg:flex-row items-center justify-center overflow-hidden font-sans relative">
      
      {/* 🎥 Video Section */}
      <div className="w-full lg:w-1/2 h-[35vh] lg:h-full flex items-center justify-center bg-[#f5f5f7] lg:bg-transparent">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] lg:w-[460px] lg:h-[460px] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white"
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/maintanance.mp4" type="video/mp4" />
          </video>
        </motion.div>
      </div>

      {/* 📝 Content Section */}
      <div className="w-full lg:w-1/2 h-[65vh] lg:h-full flex flex-col items-center lg:items-start text-center lg:text-left p-8 lg:p-20 justify-center">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md">
          
          <div className="mb-6 flex justify-center lg:justify-start">
            <Image src="/logo.png" alt="Logo" width={140} height={140} className="object-contain" priority />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <RefreshCcw size={14} className="text-blue-600 animate-spin-slow" />
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Removing Bugs</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-[#1d1d1f] mb-4 leading-tight">
            Site Under <br /> <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Maintenance</span>
          </h1>

          <p className="text-lg text-[#636366] mb-8 leading-relaxed font-medium">
            We are removing errors and bugs. Please coordinate while we polish the experience.
          </p>

          <button 
            onClick={() => setIsGameOpen(true)}
            className="group flex items-center gap-3 bg-[#1d1d1f] text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-all mb-8 shadow-xl shadow-blue-100"
          >
            <Gamepad2 size={20} className="group-hover:rotate-12 transition-transform" />
            Play Bug Blast
          </button>

          <div className="flex items-center justify-center lg:justify-start gap-3">
            <Mail className="text-blue-600" size={16} />
            <a href="mailto:rudreshmanjunath15@gmail.com" className="text-xs font-bold text-blue-600 hover:underline">rudreshmanjunath15@gmail.com</a>
          </div>
        </motion.div>
      </div>

      {/* 🚀 GAME MODAL */}
      <AnimatePresence>
        {isGameOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setIsGameOpen(false)}
                className="absolute top-6 right-6 z-[110] bg-gray-100 p-2 rounded-full hover:bg-red-50"
              >
                <X size={24} />
              </button>
              <BugBlastGame />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>
    </div>
  );
}

// --- 🎯 BUG BLAST GAME ---
function BugBlastGame() {
  const [score, setScore] = useState(0);
  const [bugs, setBugs] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const spawnBug = useCallback(() => {
    const id = Date.now();
    const isGood = Math.random() > 0.8; // 20% chance for a "Good" logo
    const newBug = {
      id,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      isGood,
      scale: 0
    };
    setBugs(prev => [...prev, newBug]);

    // Remove bug after 1.5 seconds if not clicked
    setTimeout(() => {
      setBugs(prev => prev.filter(b => b.id !== id));
    }, 1500);
  }, []);

  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        spawnBug();
      }, 600);
    } else if (timeLeft === 0) {
      setGameStarted(false);
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, spawnBug]);

  useEffect(() => {
    let countdown;
    if (gameStarted && timeLeft > 0) {
      countdown = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(countdown);
  }, [gameStarted, timeLeft]);

  const handleBlast = (id, isGood) => {
    setScore(prev => isGood ? prev - 20 : prev + 10);
    setBugs(prev => prev.filter(b => b.id !== id));
  };

  const startFixing = () => {
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
    setBugs([]);
  };

  return (
    <div className="h-[500px] w-full bg-slate-900 relative overflow-hidden cursor-crosshair select-none">
      {/* HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white font-black tracking-widest uppercase text-xs">
          Bugs Squashed: {score}
        </div>
        <div className="bg-red-500 px-4 py-2 rounded-xl text-white font-black text-xs tracking-widest uppercase">
          Time: {timeLeft}s
        </div>
      </div>

      <AnimatePresence>
        {bugs.map(bug => (
          <motion.div
            key={bug.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => handleBlast(bug.id, bug.isGood)}
            style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
            className="absolute p-3 cursor-pointer"
          >
            {bug.isGood ? (
              <div className="relative group">
                <Image src="/fav.svg" alt="logo" width={50} height={50} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                <span className="absolute -top-6 left-0 text-[10px] text-red-400 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 uppercase">Don't Blast!</span>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.2 }} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                <Bug size={48} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {!gameStarted && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
          <Bomb size={64} className="text-indigo-500 mb-6 animate-bounce" />
          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Bug Blast v1.0</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-[250px] font-medium">Click the Red Bugs to clean the code. Avoid blasting the Career Mock Favicon!</p>
          <button 
            onClick={startFixing}
            className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/50 active:scale-95 transition-all"
          >
            {timeLeft === 0 ? "Restart Fix" : "Start Debugging"}
          </button>
          {timeLeft === 0 && <p className="mt-6 text-white font-black text-xl italic uppercase underline decoration-indigo-500">Final Score: {score}</p>}
        </div>
      )}

      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="h-full w-full border-[0.5px] border-white/20 grid grid-cols-12 grid-rows-12" />
      </div>
    </div>
  );
}