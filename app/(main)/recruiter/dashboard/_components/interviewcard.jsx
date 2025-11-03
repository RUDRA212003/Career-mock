"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Send, Trash2 } from "lucide-react";
import moment from "moment";
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { supabase } from "@/services/supabaseClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";

function InterviewCard({ interview, viewDetail = false, onDelete }) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ useRef without NodeJS type
  const popupTimer = useRef(null);

  const getInterviewUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL?.replace(/\/$/, "");
    return `${baseUrl}/${interview?.interview_id}`;
  };

  const copyLink = async () => {
    try {
      const url = getInterviewUrl();
      await navigator.clipboard.writeText(url);
      toast.success("Interview link copied!");
    } catch (err) {
      toast.error("Failed to copy link");
      console.error("Failed to copy: ", err);
    }
  };

  const onSend = () => {
    const interviewUrl = getInterviewUrl();
    window.location.href = `mailto:?subject=AI Recruiter Interview Link&body=Hi, I would like to schedule an interview with you. Please find the link below:\n\n${interviewUrl}`;
    toast.success("Email opened with pre-filled link!");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error: resultsError } = await supabase
        .from("interview_results")
        .delete()
        .eq("interview_id", interview.interview_id);

      if (resultsError)
        console.error("Error deleting interview results:", resultsError);

      const { error: interviewError } = await supabase
        .from("interviews")
        .delete()
        .eq("interview_id", interview.interview_id);

      if (interviewError) throw interviewError;

      toast.success("Interview deleted successfully!");
      setShowDeleteAlert(false);
      onDelete && onDelete();
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // 🕒 Hover delay for popup
  const handleMouseEnter = () => {
    popupTimer.current = setTimeout(() => setShowPopup(true), 300);
  };

  const handleMouseLeave = () => {
    if (popupTimer.current) clearTimeout(popupTimer.current);
    setShowPopup(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* --- Interview Card --- */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700 w-full overflow-hidden">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="h-3 w-3 bg-blue-500 rounded-full mt-1.5 dark:bg-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {interview?.jobposition}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-300">
                <span>{moment(interview?.created_at).format("DD MMM YYYY")}</span>
                <span>•</span>
                <span>{interview?.duration}</span>
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs sm:text-sm">
                  {interview["interview_results"]?.length || 0} candidate
                  {interview["interview_results"]?.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-200">
              Scheduled
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteAlert(true)}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {!viewDetail ? (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm sm:text-base dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              onClick={copyLink}
            >
              <Copy size={16} className="text-gray-600 dark:text-gray-300" />
              Copy Link
            </Button>
            <Button
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 py-2 text-sm sm:text-base"
              onClick={onSend}
            >
              <Send size={16} className="text-white" />
              Send
            </Button>
          </div>
        ) : (
          <Link
            href={`/recruiter/scheduled-interview/${interview?.interview_id}/details`}
            passHref
            legacyBehavior
          >
            <Button
              as="a"
              className="mt-4 sm:mt-5 w-full gap-2 py-2 text-sm sm:text-base dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              variant="outline"
            >
              View Details
              <ArrowRight className="h-4 w-4 dark:text-gray-300" />
            </Button>
          </Link>
        )}
      </div>

      {/* --- Rectangular Popup Template --- */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 w-[420px] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {interview?.jobposition}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Posted on {moment(interview?.created_at).format("DD MMM YYYY")}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 max-h-24 overflow-y-auto">
                {interview?.jobdescription || "No job description available."}
              </p>

              <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3 text-sm">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Duration: {interview?.duration || "N/A"}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {interview?.type || "Online"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Delete Confirmation Dialog --- */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the interview for{" "}
              <strong>{interview?.jobposition}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Interview"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InterviewCard;
