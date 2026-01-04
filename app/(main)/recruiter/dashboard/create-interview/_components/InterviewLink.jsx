"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Linkedin,
  List,
  Mail,
  Phone,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const InterviewLink = ({ interview_id, formData }) => {
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_HOST_URL?.replace(/\/$/, "") || "";
  const url = `${baseUrl}/${interview_id}`;

  const getInterviewURL = () => url;

  const expiresAt = () => {
    const futureDate = new Date(
      new Date(formData?.created_at || "2025-04-14T19:09:50Z").getTime() +
        30 * 24 * 60 * 60 * 1000
    );
    return futureDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Interview link copied!");
  };

  // ⭐ Unified polished message (same as InterviewCard component)
  const getShareMessage = () => {
    const jobRole = formData?.title || "the role";
    return `Hi, hope you're doing great!

An interview has been scheduled for the position of ${jobRole}. Please ensure you join using the link below:

${url}

Make sure you're well-prepared with the relevant concepts.

Looking forward to your best performance!`;
  };

  // ⭐ Share handler
  const shareVia = (platform) => {
    const message = getShareMessage();
    const emailSubject = `Invitation for ${formData?.title || "Interview"}`;

    let shareUrl = "";

    switch (platform) {
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(
          emailSubject
        )}&body=${encodeURIComponent(message)}`;
        window.location.href = shareUrl;
        break;

      case "linkedin":
        // LinkedIn does NOT support custom message text — only URLs
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        break;

      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          message
        )}`;
        window.open(shareUrl, "_blank");
        break;

      default:
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 sm:gap-10 w-full px-4 sm:px-6 md:px-10 py-6">

      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <video
          src="/check-suc.mp4"
          autoPlay
          muted
          playsInline
          loop={false}
          className="w-14 h-14 sm:w-12 sm:h-12 md:w-16 md:h-16 object-cover rounded-xl overflow-hidden"
        />

        <h2 className="font-bold text-lg sm:text-xl text-gray-800 mt-4">
          Your AI Interview is Ready!
        </h2>
        <p className="mt-2 text-gray-500 text-sm sm:text-base max-w-md">
          Share this link with candidates to start the interview process.
        </p>
      </div>

      {/* Link Card */}
      <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-semibold text-base sm:text-lg text-gray-800">
            Interview Link
          </h2>
          <span className="text-primary bg-blue-50 rounded-full text-xs sm:text-sm px-3 py-1 text-center font-medium">
            Valid for 30 days
          </span>
        </div>

        {/* URL */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5">
          <Input
            value={getInterviewURL()}
            readOnly
            className="text-sm border-gray-300 rounded-full"
          />
          <Button
            onClick={onCopyLink}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full"
          >
            <Copy className="size-4" /> Copy
          </Button>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Details */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-start gap-3 sm:gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
            <Clock className="w-4 h-4 text-blue-600" />
            {formData?.duration || "30 min"}
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
            <List className="w-4 h-4 text-blue-600" />
            {formData?.questList?.length || "10"} Questions
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
            <Calendar className="w-4 h-4 text-blue-600" />
            Valid Till: {expiresAt()}
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="w-full bg-white shadow-lg p-6 sm:p-8 rounded-3xl max-w-2xl">
        <h2 className="font-semibold text-base sm:text-lg mb-4 text-gray-800">
          Share via
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <Button
            variant="outline"
            onClick={() => shareVia("email")}
            className="flex items-center justify-center gap-2 w-full rounded-full"
          >
            <Mail className="w-4 h-4" /> Email
          </Button>
          <Button
            variant="outline"
            onClick={() => shareVia("linkedin")}
            className="flex items-center justify-center gap-2 w-full rounded-full"
          >
            <Linkedin className="w-4 h-4" /> LinkedIn
          </Button>
          <Button
            variant="outline"
            onClick={() => shareVia("whatsapp")}
            className="flex items-center justify-center gap-2 w-full rounded-full"
          >
            <Phone className="w-4 h-4" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-base rounded-full"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <Button
          onClick={() => router.push("/dashboard/create-interview")}
          className="flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-base rounded-full"
        >
          <Plus className="w-4 h-4" /> Create New Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewLink;
