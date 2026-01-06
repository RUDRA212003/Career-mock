"use client";

import { useUser } from "@/app/provider";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/services/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Sparkles, LayoutDashboard, UserCircle, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

function WelcomeContainer() {
  const { user } = useUser();
  const [userData, setUserData] = useState({
    name: user?.name || "User",
    picture: user?.picture || null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchLatestUserData = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      const { data: userRecord, error } = await supabase
        .from("users")
        .select("name, picture")
        .eq("email", user.email)
        .single();

      if (userRecord && !error) {
        setUserData({
          name: userRecord.name || user.email.split("@")[0],
          picture: userRecord.picture,
        });
      }
    } catch (err) {
      console.error("Failed to fetch user metadata:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLatestUserData();
  }, [fetchLatestUserData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white/70 backdrop-blur-md p-5 md:p-6 rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden flex justify-between items-center"
    >
      {/* --- Optimized Background Glow --- */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.12, 0.05],
          x: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-[60px] pointer-events-none"
      />

      {/* --- Left Content --- */}
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-800">
            Welcome back,{" "}
            <motion.span
              animate={{ color: ["#2563eb", "#7c3aed", "#2563eb"] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="capitalize"
            >
              {isLoading ? "..." : userData.name}
            </motion.span>
          </h2>
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
          </motion.div>
        </div>

        <p className="text-slate-500 text-xs md:text-sm font-medium opacity-90">
          Ready for your next AI-powered career move?
        </p>
      </div>

      {/* --- Right Section --- */}
      <div className="relative z-10 flex items-center gap-2 md:gap-4">
        {/* Avatar with subtle animation */}
        <div className="relative group">
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition duration-500"
          />
          <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 shrink-0">
            {userData.picture ? (
              <Image
                src={userData.picture}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold uppercase">
                {userData.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* --- Mobile Dropdown Menu --- */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                <Menu className="w-5 h-5 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 mt-2 p-1.5 rounded-2xl shadow-xl border-slate-100">
              <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer gap-2" asChild>
                <Link href="/candidate/dashboard">
                  <LayoutDashboard className="w-4 h-4 text-slate-500" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer gap-2" asChild>
                <Link href="/candidate/interviews">
                  <Briefcase className="w-4 h-4 text-slate-500" /> My Interviews
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer gap-2" asChild>
                <Link href="/candidate/profile">
                  <UserCircle className="w-4 h-4 text-slate-500" /> Account Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

export default WelcomeContainer;