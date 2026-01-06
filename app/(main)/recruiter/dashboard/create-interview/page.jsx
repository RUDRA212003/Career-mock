'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coins, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import FormContainer from './_components/FormContainer';
import QuestionList from './_components/QuestionList';
import { toast } from 'sonner';
import InterviewLink from './_components/InterviewLink';
import { useUser } from '@/app/provider';

function CreateInterview() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [interviewId, setInterviewId] = useState();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.credits <= 0) {
      toast.error("You don't have enough credits to create an interview");
      router.push('/recruiter/billing');
    }
  }, [user, router]);

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev, 
      [field]: value
    }));
  };

  const onGoToNext = () => {
    if (user?.credits <= 0) {
      toast.error("Please purchase credits to create an interview");
      router.push('/recruiter/billing');
      return;
    }

    let missingField = '';
    if (!formData.jobPosition) missingField = 'Job Position';
    else if (!formData.jobDescription) missingField = 'Job Description';
    else if (!formData.duration) missingField = 'Duration';
    else if (!formData.type) missingField = 'Interview Type';

    if (missingField) {
      toast.error(`${missingField} is required`);
      return;
    }
    
    setStep(step + 1);
  };

  const onCreateLink = async (interview_id) => {
    setLoading(true);
    if (user?.credits <= 0) {
      toast.error("Please purchase credits to create an interview");
      router.push('/recruiter/billing');
      setLoading(false);
      return;
    }

    try {
      setInterviewId(interview_id);
      setStep(step + 1);
    } catch (error) {
      toast.error("Failed to create interview link");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]/30 pb-10">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#F5F5F7] px-5 py-4 flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1D1D1F]" />
        </button>
        <div>
          <h2 className="font-bold text-lg text-[#1D1D1F]">New Interview</h2>
          <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Step {step} of 3</p>
        </div>
      </div>

      <div className="px-5 md:px-24 lg:px-44 xl:px-56 pt-6">
        {/* Credits Card - Mobile Optimized */}
        {user && (
          <div className="mb-6 bg-white border border-[#0071E3]/10 rounded-2xl p-4 shadow-sm shadow-blue-500/5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#0071E3]/10 rounded-xl flex items-center justify-center">
                  <Coins className="w-5 h-5 text-[#0071E3]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#86868B] uppercase">Balance</p>
                  <p className="text-xl font-black text-[#1D1D1F] leading-none">{user.credits || 0} <span className="text-[10px] font-bold text-[#86868B]">CR</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#86868B] uppercase">Cost</p>
                <p className="text-sm font-bold text-[#0071E3]">1 Credit</p>
              </div>
            </div>

            {user.credits <= 2 && (
              <div className="mt-4 pt-3 border-t border-[#F5F5F7] flex items-center gap-2 text-[11px] font-medium text-amber-600">
                <AlertCircle size={14} />
                <span>
                  {user.credits === 0 
                    ? "Out of credits. Refill to continue."
                    : `${user.credits} credit remaining.`
                  }
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Modern Progress Bar */}
        <div className="mb-8">
            <Progress value={step * 33.33} className="h-1.5 w-full bg-[#E8E8ED]" />
        </div>
        
        {/* Animated Step Container */}
        <div className="transition-all duration-300">
            {step === 1 && (
              <FormContainer
                onHandleInputChange={onHandleInputChange} 
                GoToNext={onGoToNext}
              />
            )}
            
            {step === 2 && (
              <QuestionList 
                formData={formData} 
                onCreateLink={onCreateLink}
                loading={loading}
              />
            )}
            
            {step === 3 && (
              <InterviewLink 
                interview_id={interviewId}
                formData={formData} 
              />
            )}
        </div>
      </div>
    </div>
  );
}

export default CreateInterview;