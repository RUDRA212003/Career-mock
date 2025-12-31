"use client"
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { InterviewType } from "@/services/Constants";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowRight, RefreshCw, ShieldCheck, Briefcase, Clock, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function FormContainer({ onHandleInputChange, GoToNext }) {
  const [interviewType, setInterviewType] = useState([]);
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");

  const generateCaptcha = () => {
    const chars = "0123456789ABCDEF";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (interviewType) {
      onHandleInputChange("type", interviewType);
    }
  }, [interviewType]);

  const AddInterviewType = (name) => {
    const exists = interviewType.includes(name);
    if (!exists) {
      setInterviewType((prev) => [...prev, name]);
    } else {
      setInterviewType(interviewType.filter((item) => item !== name));
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-[#D2D2D7]/50 rounded-[28px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden">
      
      {/* --- Progress Header --- */}
      <div className="px-8 py-6 border-b border-[#F5F5F7] flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0071E3] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Briefcase size={20} />
            </div>
            <div>
                <h1 className="text-lg font-semibold tracking-tight">Setup Interview</h1>
                <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-widest">AI Assessment Engine</p>
            </div>
        </div>
      </div>

      <div className="p-8 space-y-10">
        
        {/* Job Position Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#86868B]">
            <Target size={16} />
            <label className="text-xs font-bold uppercase tracking-widest">Job Position</label>
          </div>
          <Input
            placeholder="e.g. Senior Frontend Developer"
            className="h-12 border-none bg-[#F5F5F7] rounded-xl px-4 text-base placeholder:text-[#86868B]/50 focus-visible:ring-1 focus-visible:ring-[#0071E3] transition-all"
            onChange={(event) => onHandleInputChange("jobPosition", event.target.value)}
          />
        </section>

        {/* Job Description Section */}
        <section className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-[#86868B] ml-1 flex items-center gap-2">
            Description & Skills
          </label>
          <Textarea
            placeholder="Paste technical requirements or job summary..."
            className="min-h-[160px] border-none bg-[#F5F5F7] rounded-2xl p-4 text-base focus-visible:ring-1 focus-visible:ring-[#0071E3] transition-all"
            onChange={(event) => onHandleInputChange("jobDescription", event.target.value)}
          />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Duration */}
            <section className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-[#86868B] ml-1 flex items-center gap-2">
                    <Clock size={14} /> Duration
                </label>
                <Select onValueChange={(value) => onHandleInputChange("duration", value)}>
                    <SelectTrigger className="h-12 border-none bg-[#F5F5F7] rounded-xl px-4">
                        <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#D2D2D7]/30">
                        <SelectItem value="15 Min">15 Minutes</SelectItem>
                        <SelectItem value="30 Min">30 Minutes</SelectItem>
                        <SelectItem value="60 Min">1 Hour</SelectItem>
                    </SelectContent>
                </Select>
            </section>

            {/* Type */}
            <section className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-[#86868B] ml-1">Assessment Style</label>
                <div className="flex flex-wrap gap-2">
                    {InterviewType.map((type, index) => (
                        <button
                            key={index}
                            onClick={() => AddInterviewType(type.name)}
                            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95 ${
                                interviewType.includes(type.name)
                                ? "bg-[#0071E3] text-white"
                                : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]"
                            }`}
                        >
                            {type.name}
                        </button>
                    ))}
                </div>
            </section>
        </div>

        {/* --- Apple Style CAPTCHA --- */}
        <div className="bg-[#F5F5F7] p-6 rounded-[24px] space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#34C759]">
                    <ShieldCheck size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Verification</span>
                </div>
                <button onClick={generateCaptcha} className="text-[#0071E3] hover:opacity-70 transition-opacity">
                    <RefreshCw size={14} />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-12 w-28 bg-white rounded-lg border border-[#D2D2D7]/50 flex items-center justify-center select-none shadow-sm">
                    <span className="text-lg font-bold tracking-[0.3em] text-[#1D1D1F] italic blur-[0.5px]">
                        {captchaCode}
                    </span>
                </div>
                <Input
                    placeholder="Enter Code"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                    className="h-12 flex-1 border-none bg-white rounded-lg px-4 font-bold tracking-widest text-center"
                />
            </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4">
            <Button
                onClick={() => GoToNext()}
                disabled={userInput !== captchaCode}
                className="w-full h-14 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-full font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
            >
                Confirm & Generate <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-[11px] text-[#86868B] font-medium mt-4 tracking-tight">
                Designed for professional recruitment standards.
            </p>
        </div>
      </div>
    </div>
  );
}

export default FormContainer;