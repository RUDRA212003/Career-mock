'use client';
import React, { useState, useEffect } from 'react';
import { Lock, Loader2, ShieldCheck, AlertCircle, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLayout({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const [phase, setPhase] = useState('closed'); // 'closed', 'scanning', 'form'
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // Auto-trigger scanning on mount
  useEffect(() => {
    if (!authorized) {
      const timer = setTimeout(() => setPhase('scanning'), 1000);
      return () => clearTimeout(timer);
    }
  }, [authorized]);

  // Transition from scanning to form
  useEffect(() => {
    if (phase === 'scanning') {
      const timer = setTimeout(() => setPhase('form'), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        toast.success('System Authorized');
        setAuthorized(true);
      } else {
        setError(true);
        toast.error('Access Denied');
        setTimeout(() => setError(false), 500);
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-black">
      <AnimatePresence>
        {!authorized && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            className="fixed inset-0 z-[100] flex flex-col items-center p-4 overflow-hidden"
          >
            {/* Ultra-Blur Background Overlay */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-3xl" />

            {/* --- DYNAMIC ISLAND CORE --- */}
            <motion.div
              layout
              initial={{ width: 120, height: 35, y: 20 }}
              animate={{ 
                width: phase === 'closed' ? 120 : phase === 'scanning' ? 180 : 380,
                height: phase === 'closed' ? 35 : phase === 'scanning' ? 180 : 420,
                y: phase === 'closed' ? 20 : 40,
                x: error ? [0, -10, 10, -10, 10, 0] : 0,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="relative bg-black border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center justify-center"
              style={{ borderRadius: phase === 'form' ? 40 : 100 }}
            >
              <AnimatePresence mode="wait">
                {/* PHASE 1: SCANNING */}
                {phase === 'scanning' && (
                  <motion.div 
                    key="scanning"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative">
                      <ScanFace size={60} className="text-blue-500" />
                      <motion.div 
                        animate={{ y: [0, 60, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]"
                      />
                    </div>
                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                      Face ID Scanning
                    </span>
                  </motion.div>
                )}

                {/* PHASE 2: FORM */}
                {phase === 'form' && (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full p-8 flex flex-col items-center justify-center"
                  >
                    <div className={`p-4 rounded-2xl mb-4 transition-colors duration-500 ${error ? 'bg-red-500/20' : 'bg-white/5'}`}>
                      {loading ? <Loader2 className="w-6 h-6 text-blue-400 animate-spin" /> : <Lock size={24} className={error ? "text-red-400" : "text-white"} />}
                    </div>

                    <h2 className="text-xl font-bold text-white tracking-tight mb-6 uppercase italic">
                      Verify Identity
                    </h2>

                    <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
                      <Input
                        type="password"
                        placeholder="ADMIN CODE"
                        autoFocus
                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-white text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500/50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />

                      <Button 
                        type="submit" 
                        disabled={loading || !password}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-transform active:scale-95"
                      >
                        {loading ? "Verifying..." : "Confirm Access"}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Hint Text */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'form' ? 1 : 0 }}
              className="mt-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest"
            >
              Restricted Area // Authorization Required
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div
        animate={{ 
          filter: authorized ? "blur(0px)" : "blur(20px)",
          scale: authorized ? 1 : 0.95
        }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={!authorized ? 'pointer-events-none select-none h-screen overflow-hidden' : ''}
      >
        {children}
      </motion.div>
    </div>
  );
}