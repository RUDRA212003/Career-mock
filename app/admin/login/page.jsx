'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, ScanFace } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import Image from 'next/image';

function AdminLogin() {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [islandState, setIslandState] = useState('idle'); // idle, loading, error, locked

  // Lockout Timer
  useEffect(() => {
    let timer;
    if (lockoutTimer > 0) {
      setIslandState('locked');
      timer = setInterval(() => setLockoutTimer((prev) => prev - 1), 1000);
    } else if (lockoutTimer === 0 && islandState === 'locked') {
      setIslandState('idle');
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setLoading(true);
    setIslandState('loading');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setIslandState('error');
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        // Shake effect trigger
        setTimeout(() => setIslandState('idle'), 500);

        if (newAttempts >= 3) {
          setLockoutTimer(30);
          setFailedAttempts(0);
        } else {
          toast.error(`Attempt ${newAttempts}/3 failed`);
        }
        return;
      }

      if (data.user.email.includes('@admin') || data.user.email.includes('@superadmin')) {
        setIslandState('success');
        toast.success('Access Granted');
        setTimeout(() => router.push('/admin'), 800);
      } else {
        await supabase.auth.signOut();
        setIslandState('error');
        toast.error('Unauthorized');
      }
    } catch (err) {
      setIslandState('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* --- iPhone Lock Screen --- */}
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] } }}
            onClick={() => setIsUnlocked(true)}
            className="fixed inset-0 z-[100] bg-gradient-to-b from-[#1a1a2e] to-black flex flex-col items-center justify-between py-24 cursor-pointer"
          >
            <div className="text-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Lock className="w-8 h-8 text-white/80 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-white text-7xl font-light tracking-tighter">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h2>
              <p className="text-blue-400/60 mt-4 tracking-widest text-sm uppercase">Tap to Unlock</p>
            </div>
            <div className="w-32 h-1.5 bg-white/20 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- iPhone Chassis --- */}
      <div className="relative w-full max-w-[400px] h-[820px] bg-[#121212] rounded-[60px] border-[10px] border-[#2a2a2a] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center px-8">
        
        {/* --- DYNAMIC ISLAND CORE --- */}
        <div className="pt-4 w-full flex justify-center sticky top-0 z-50">
          <motion.div
            layout
            initial={{ width: 120, height: 35 }}
            animate={{ 
              width: islandState === 'idle' ? 120 : (islandState === 'loading' ? 220 : 320),
              height: islandState === 'locked' ? 80 : 35,
              x: islandState === 'error' ? [0, -10, 10, -10, 10, 0] : 0,
              backgroundColor: islandState === 'locked' ? '#7f1d1d' : '#000',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex items-center justify-center relative overflow-hidden shadow-2xl"
            style={{ borderRadius: 40 }}
          >
            <AnimatePresence mode="wait">
              {islandState === 'loading' && (
                <motion.div key="L" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                  <ScanFace className="w-5 h-5 text-blue-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">FaceID Scanning</span>
                </motion.div>
              )}
              {islandState === 'locked' && (
                <motion.div key="T" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-red-200 uppercase tracking-tighter">Security Lockout</span>
                  <span className="text-xl font-black text-white">{lockoutTimer}s</span>
                </motion.div>
              )}
              {islandState === 'idle' && (
                <motion.div key="I" className="w-2 h-2 bg-white/10 rounded-full blur-sm" />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* --- Content --- */}
        <div className="mt-20 w-full text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">Admin</h1>
          <p className="text-gray-500 font-medium text-sm">System Authorization Required</p>
        </div>

        <form onSubmit={handleLogin} className="w-full mt-12 space-y-5">
          <div className="space-y-3">
            <div className="bg-[#1c1c1e] rounded-2xl p-1 px-4 flex items-center gap-3 border border-transparent focus-within:border-blue-600 transition-all">
              <Mail className="text-gray-500 w-5 h-5" />
              <input 
                type="email" 
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full py-4 text-white outline-none placeholder:text-gray-600 text-lg"
              />
            </div>
            <div className="bg-[#1c1c1e] rounded-2xl p-1 px-4 flex items-center gap-3 border border-transparent focus-within:border-blue-600 transition-all">
              <Lock className="text-gray-500 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Security Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent w-full py-4 text-white outline-none placeholder:text-gray-600 text-lg"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="text-gray-500 w-5 h-5" /> : <Eye className="text-gray-500 w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || lockoutTimer > 0}
            className="w-full h-16 bg-white text-black hover:bg-gray-200 rounded-[2rem] font-bold text-xl transition-all active:scale-[0.97]"
          >
            {loading ? "Initializing..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-8 text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">
          Encrypted Admin Terminal
        </p>

        {/* Home Bar */}
        <div className="mt-auto mb-4 w-36 h-1.5 bg-white/10 rounded-full" />
      </div>
    </div>
  );
}

export default AdminLogin;