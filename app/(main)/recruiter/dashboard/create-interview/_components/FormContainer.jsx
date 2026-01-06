"use client";
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
import {
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  Clock,
  Target,
} from "lucide-react";

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
    onHandleInputChange("type", interviewType);
  }, [interviewType]);

  const AddInterviewType = (name) => {
    setInterviewType((prev) =>
      prev.includes(name)
        ? prev.filter((i) => i !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-[#D2D2D7]/50 rounded-[22px] sm:rounded-[28px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden">
      
      {/* Header */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-[#F5F5F7] flex items-center gap-3 bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#0071E3] flex items-center justify-center text-white">
          <Briefcase size={18} />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-semibold">
            Setup Interview
          </h1>
          <p className="text-[10px] sm:text-[11px] font-medium text-[#86868B] uppercase tracking-widest">
            AI Assessment Engine
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">

        {/* Job Position */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[#86868B]">
            <Target size={14} />
            <label className="text-xs font-bold uppercase tracking-widest">
              Job Position
            </label>
          </div>
          <Input
            placeholder="e.g. Senior Frontend Developer"
            className="h-11 sm:h-12 bg-[#F5F5F7] rounded-xl"
            onChange={(e) =>
              onHandleInputChange("jobPosition", e.target.value)
            }
          />
        </section>

        {/* Description */}
        <section className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-[#86868B]">
            Description & Skills
          </label>
          <Textarea
            placeholder="Paste technical requirements or job summary..."
            className="min-h-[140px] sm:min-h-[160px] bg-[#F5F5F7] rounded-2xl"
            onChange={(e) =>
              onHandleInputChange("jobDescription", e.target.value)
            }
          />
        </section>

        {/* Duration + Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Duration */}
          <section className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-[#86868B] flex items-center gap-2">
              <Clock size={14} /> Duration
            </label>
            <Select onValueChange={(v) => onHandleInputChange("duration", v)}>
              <SelectTrigger className="h-11 sm:h-12 bg-[#F5F5F7] rounded-xl">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 Min">15 Minutes</SelectItem>
                <SelectItem value="30 Min">30 Minutes</SelectItem>
                <SelectItem value="60 Min">1 Hour</SelectItem>
              </SelectContent>
            </Select>
          </section>

          {/* Interview Type */}
          <section className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-[#86868B]">
              Assessment Style
            </label>
            <div className="flex flex-wrap gap-2">
              {InterviewType.map((type, index) => (
                <button
                  key={index}
                  onClick={() => AddInterviewType(type.name)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold ${
                    interviewType.includes(type.name)
                      ? "bg-[#0071E3] text-white"
                      : "bg-[#F5F5F7] hover:bg-[#E8E8ED]"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* CAPTCHA */}
        <div className="bg-[#F5F5F7] p-4 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#34C759]">
              <ShieldCheck size={14} />
              <span className="text-[11px] font-bold uppercase">
                Verification
              </span>
            </div>
            <button onClick={generateCaptcha}>
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-12 w-full sm:w-28 bg-white rounded-lg flex items-center justify-center">
              <span className="font-bold tracking-[0.3em] italic">
                {captchaCode}
              </span>
            </div>
            <Input
              placeholder="Enter Code"
              value={userInput}
              onChange={(e) =>
                setUserInput(e.target.value.toUpperCase())
              }
              className="h-12 text-center font-bold tracking-widest"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={GoToNext}
          disabled={userInput !== captchaCode}
          className="w-full h-13 sm:h-14 rounded-full"
        >
          Confirm & Generate <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <p className="text-center text-[11px] text-[#86868B]">
          Designed for professional recruitment standards.
        </p>
      </div>
    </div>
  );
}

export default FormContainer;
