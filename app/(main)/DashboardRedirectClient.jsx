"use client";

import { UserAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirectClient() {
  const { userProfile } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userProfile) return;

    if (userProfile.role === "recruiter") {
      router.replace("/recruiter/dashboard");
    } else if (userProfile.role === "candidate") {
      router.replace("/candidate/dashboard");
    }
  }, [userProfile, router]);

  return null;
}
