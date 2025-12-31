"use client"
import { Phone, File as FileIcon, ArrowRight, Loader2, Key, RefreshCw } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/services/supabaseClient'
import { motion } from 'framer-motion'

function CreateOptions() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaCode, setCaptchaCode] = useState('')
  const [userCaptchaInput, setUserCaptchaInput] = useState('')
  const router = useRouter()

  // Generate a random 6-character alphanumeric CAPTCHA
  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserCaptchaInput(""); // Reset input on new captcha
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleStart = async () => {
    if (!code.trim()) {
      toast.error('Please enter an interview code.')
      return
    }

    if (userCaptchaInput.toUpperCase() !== captchaCode) {
      toast.error('CAPTCHA verification failed. Please try again.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('interviews')
      .select('interview_id')
      .eq('interview_id', code.trim())
      .single()

    setLoading(false)

    if (error || !data) {
      toast.error('Invalid interview code. Please try again.')
      generateCaptcha(); // Refresh captcha on failure
      return
    }

    toast.success('Redirecting to your interview...')

    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || ''
    const redirectUrl = `${baseUrl}/${code.trim()}`

    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl
    } else {
      router.push(redirectUrl)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto p-4">

      {/* --- Interview Code Card --- */}
      <motion.div
        whileHover={{ y: -5 }}
        className="group relative bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-[28px] p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5 overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#F5F5F7] rounded-2xl text-[#0071E3] transition-colors group-hover:bg-[#0071E3] group-hover:text-white">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">Interview Code</h2>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-widest">Entry Key Required</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste UUID Code"
              className="h-14 rounded-2xl border-gray-200 bg-[#F5F5F7]/50 px-5 text-[15px] font-medium focus:bg-white focus:ring-1 focus:ring-[#0071E3] transition-all placeholder:text-gray-400 shadow-inner"
            />
          </div>

          {/* --- CAPTCHA SECTION --- */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">Human Verification</label>
               <button 
                onClick={generateCaptcha} 
                className="text-[#0071E3] hover:rotate-180 transition-transform duration-500"
                title="Refresh CAPTCHA"
               >
                 <RefreshCw size={14} />
               </button>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 h-12 bg-slate-900 rounded-xl flex items-center justify-center select-none overflow-hidden relative border border-slate-800">
                 {/* Visual Noise for Captcha */}
                 <div className="absolute inset-0 opacity-20 pointer-events-none" 
                      style={{backgroundImage: 'radial-gradient(#0071E3 1px, transparent 0)', backgroundSize: '4px 4px'}}></div>
                 <span className="text-white font-black italic tracking-[0.4em] text-lg skew-x-12 line-through decoration-[#0071E3]/50">
                    {captchaCode}
                 </span>
              </div>
              
              <Input
                value={userCaptchaInput}
                onChange={(e) => setUserCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Type Code"
                maxLength={6}
                className="w-1/3 h-12 rounded-xl border-gray-200 bg-white text-center font-bold tracking-widest focus:ring-1 focus:ring-[#0071E3]"
              />
            </div>
          </div>

          <p className="text-[#86868B] text-[13px] font-medium leading-relaxed px-1">
            Standard 36-character UUID provided by your hiring manager.
          </p>

          <Button
            onClick={handleStart}
            disabled={loading || userCaptchaInput.length < 6}
            className="w-full h-14 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-base shadow-lg shadow-blue-500/20 active:scale-95 transition-all mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                Confirm Access <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* --- Upload CV Card --- */}
      <Link href={'/candidate/upload-cv'} className="block">
        <motion.div
          whileHover={{ y: -5 }}
          className="group h-full bg-white border border-gray-200 rounded-[28px] p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-[#F5F5F7] rounded-2xl text-[#1D1D1F] transition-colors group-hover:bg-[#1D1D1F] group-hover:text-white">
                <FileIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">Upload Resume</h2>
                <p className="text-xs font-semibold text-[#86868B] uppercase tracking-widest">Profile Engine</p>
              </div>
            </div>

            <p className="text-[#86868B] text-base leading-relaxed font-medium">
              Upload your{" "}
              <span className="relative text-[#0071E3] font-semibold group cursor-pointer">
                resume
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#0071E3] transition-all duration-300 group-hover:w-full"></span>
              </span>{" "}
              to make it visible to{" "}
              <span className="relative text-[#0071E3] font-semibold group cursor-pointer">
                recruiters
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#0071E3] transition-all duration-300 group-hover:w-full"></span>
              </span>.
            </p>
          </div>

          <div className="mt-12 flex items-center text-[#0066CC] font-bold text-sm hover:underline">
            Go to upload portal <ChevronSmallRight />
          </div>
        </motion.div>
      </Link>
    </div>
  )
}

const ChevronSmallRight = () => (
  <svg className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
  </svg>
)

export default CreateOptions;