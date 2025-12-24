"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Send, Trash2, MessageCircle } from "lucide-react";
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

function InterviewCard({ interview, viewDetail = false, onDelete }) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const getInterviewUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL?.replace(/\/$/, "");
    return `${baseUrl}/${interview?.interview_id}`;
  };

  const getShareMessage = () => {
    const url = getInterviewUrl();
    return `Hi, hope you're doing great!

An interview has been scheduled for the position of ${interview?.jobposition}. Please ensure you join using the link below:

${url}

Make sure you're well-prepared with the relevant concepts.

Looking forward to your best performance!`;
  };

  const copyLink = async () => {
    try {
      const url = getInterviewUrl();
      await navigator.clipboard.writeText(url);
      toast.success("Interview link copied!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const onSend = () => {
    const subject = encodeURIComponent("AI Recruiter Interview Link");
    const message = encodeURIComponent(getShareMessage());
    window.location.href = `mailto:?subject=${subject}&body=${message}`;
  };

  const sendWhatsApp = () => {
    const encodedMsg = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${encodedMsg}`, "_blank");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await supabase.from("interview_results").delete().eq("interview_id", interview.interview_id);
      await supabase.from("interviews").delete().eq("interview_id", interview.interview_id);

      toast.success("Interview deleted successfully!");
      setShowDeleteAlert(false);
      onDelete && onDelete();
    } catch (err) {
      toast.error("Failed to delete interview.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className="
          p-6 bg-[#f8f9fc] dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-lg 
          hover:shadow-xl transition-all
        "
      >
        {/* Top Details */}
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <span className="h-3 w-3 bg-blue-600 rounded-full mt-1"></span>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {interview?.jobposition}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {moment(interview?.created_at).format("DD MMM YYYY")} • {interview?.duration}
              </p>

              <p className="mt-1 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 w-fit">
                {interview["interview_results"]?.length || 0} candidate(s)
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteAlert(true)}
            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <Trash2 size={18} />
          </Button>
        </div>

        {/* Buttons */}
        {!viewDetail ? (
          <div className="grid grid-cols-3 gap-3 mt-5">
            <Button
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={copyLink}
            >
              <Copy size={16} />
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onSend}
            >
              <Send size={16} className="mr-1" />
              Email
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={sendWhatsApp}
            >
              <MessageCircle size={16} className="mr-1" />
              WhatsApp
            </Button>
          </div>
        ) : (
          <Link
            href={`/recruiter/scheduled-interview/${interview?.interview_id}/details`}
            passHref
            legacyBehavior
          >
            <Button className="w-full mt-5 bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200">
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
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
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default InterviewCard;
