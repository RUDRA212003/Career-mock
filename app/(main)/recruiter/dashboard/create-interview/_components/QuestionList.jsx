"use client";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Loader2Icon, PlusIcon, Trash2Icon, Sparkles, CreditCard, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/services/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

function QuestionList({ formData, onCreateLink }) {
  const [loading, setLoading] = useState(true);
  const [questionList, setQuestionList] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("behavioral");
  const { user, updateUserCredits } = useUser();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (formData && !hasCalled.current) {
      GenerateQuestionList();
    }
  }, [formData]);

  const GenerateQuestionList = async () => {
    setLoading(true);
    hasCalled.current = true;
    try {
      const result = await axios.post("/api/ai-model", { ...formData });
      const rawContent = result?.data?.content || result?.data?.Content;
      if (!rawContent) {
        toast.error("Invalid response format");
        return;
      }
      const match = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (!match || !match[1]) {
        toast.error("Failed to extract questions");
        return;
      }
      const parsedData = JSON.parse(match[1].trim());
      setQuestionList(parsedData);
    } catch (e) {
      toast.error("AI Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setQuestionList(prev => ({
      ...prev,
      interviewQuestions: [...prev.interviewQuestions, { question: newQuestion, type: newQuestionType }]
    }));
    setNewQuestion("");
    toast.success("Question added");
  };

  const handleDeleteQuestion = (index) => {
    setQuestionList(prev => {
      const updated = [...prev.interviewQuestions];
      updated.splice(index, 1);
      return { ...prev, interviewQuestions: updated };
    });
    toast.success("Question removed");
  };

  const onFinish = async () => {
    setSaveLoading(true);
    const interview_id = uuidv4();
    try {
      const currentCredits = user?.credits || 0;
      if (currentCredits <= 0) {
        toast.error("Insufficient credits");
        setSaveLoading(false);
        return;
      }

      const creditUpdateResult = await updateUserCredits(currentCredits - 1);
      if (!creditUpdateResult.success) {
        toast.error("Credit deduction failed");
        setSaveLoading(false);
        return;
      }

      const { error } = await supabase.from("interviews").insert([{
        interview_id,
        userEmail: user?.email,
        jobposition: formData.jobPosition,
        jobdescription: formData.jobDescription,
        duration: formData.duration,
        type: formData.type,
        questionlist: questionList,
      }]);

      if (error) throw error;

      onCreateLink(interview_id);
      toast.success("Interview published successfully");
    } catch (e) {
      toast.error("Failed to save interview");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-6"
          >
            <div className="relative">
              <Loader2Icon className="animate-spin w-12 h-12 text-[#0071E3] opacity-20" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#0071E3] animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Crafting Assessment</h2>
              <p className="text-[#86868B] max-w-sm">Our AI is analyzing the role requirements to generate personalized questions.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && questionList?.interviewQuestions && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          
          {/* Header & Credits */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F5F5F7] pb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Review Questions</h2>
              <p className="text-[#86868B]">Edit or add custom questions before finalizing.</p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-md border border-[#D2D2D7]/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="p-2 bg-blue-50 rounded-xl text-[#0071E3]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Available Credits</p>
                <p className="text-lg font-bold text-[#1D1D1F]">{user?.credits || 0} <span className="text-sm font-normal text-[#86868B]">(-1 per link)</span></p>
              </div>
            </div>
          </div>

          {/* Add Question Field */}
          <div className="bg-[#F5F5F7]/50 rounded-[24px] p-6 border border-white space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#86868B] flex items-center gap-2">
              <PlusIcon className="w-4 h-4" /> Add Custom Entry
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your own question here..."
                className="flex-1 h-12 rounded-xl bg-white border-none shadow-sm focus-visible:ring-1 focus-visible:ring-[#0071E3]"
              />
              <select
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value)}
                className="h-12 px-4 rounded-xl bg-white border-none shadow-sm text-sm font-medium focus:ring-1 focus:ring-[#0071E3] outline-none"
              >
                <option value="behavioral">Behavioral</option>
                <option value="technical">Technical</option>
                <option value="situational">Situational</option>
              </select>
              <Button onClick={handleAddQuestion} className="h-12 px-6 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                Add
              </Button>
            </div>
          </div>

          {/* Question Cards */}
          <div className="grid gap-4">
            {questionList.interviewQuestions.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={index}
                className="group relative bg-white border border-[#D2D2D7]/30 rounded-[22px] p-6 transition-all hover:shadow-xl hover:shadow-black/5"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                      {item.type}
                    </span>
                    <p className="text-lg font-semibold leading-tight text-[#1D1D1F]">
                      {item.question}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-[#FF3B30] hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2Icon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col items-center gap-4 pt-10 border-t border-[#F5F5F7]">
            <Button
              onClick={onFinish}
              disabled={saveLoading || (user?.credits || 0) <= 0}
              className="w-full sm:w-auto min-w-[300px] h-14 rounded-full bg-[#1D1D1F] text-white font-bold text-lg hover:bg-black shadow-xl active:scale-95 transition-all disabled:opacity-30"
            >
              {saveLoading ? (
                <Loader2Icon className="animate-spin w-5 h-5" />
              ) : (
                <span className="flex items-center gap-2">
                  Generate Link & Finalize <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </Button>
            {(user?.credits || 0) <= 0 && (
              <p className="text-[#FF3B30] text-xs font-bold uppercase tracking-widest animate-pulse">
                Insufficient Credits to finish
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default QuestionList;