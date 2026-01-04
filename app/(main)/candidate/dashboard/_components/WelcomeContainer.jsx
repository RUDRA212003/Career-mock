"use client";

import { useUser } from "@/app/provider";
import React, { useState, useEffect } from "react";
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
import { Menu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function WelcomeContainer() {
  const { user } = useUser();
  const [userData, setUserData] = useState({
    name: user?.name || "User",
    picture: null,
  });

  useEffect(() => {
    if (user?.email) fetchLatestUserData();
  }, [user]);

  const fetchLatestUserData = async () => {
    try {
      const { data: userRecord } = await supabase
        .from("users")
        .select("name, picture")
        .eq("email", user.email)
        .single();

      setUserData({
        name: userRecord?.name || user?.name || user?.email?.split("@")[0] || "User",
        picture: userRecord?.picture || user?.picture,
      });
    } catch {
      setUserData({
        name: user?.name || user?.email?.split("@")[0] || "User",
        picture: user?.picture,
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white/80 backdrop-blur-xl p-6 rounded-[28px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex justify-between items-center"
    >
      {/* --- Looping Background Glow --- */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, 0] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400 rounded-full blur-[80px] pointer-events-none"
      />

      {/* --- Left Content: Text --- */}
      <div className="relative z-10 flex flex-col gap-1">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
            Welcome Back,{" "}
            <motion.span 
              animate={{ color: ["#2563eb", "#9333ea", "#2563eb"] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block"
            >
              {userData.name}
            </motion.span>
          </h2>
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
          </motion.div>
        </motion.div>
        
        <motion.p 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 text-sm font-medium tracking-tight"
        >
          Your Path to Great Jobs Starts with AI Interviews
        </motion.p>
      </div>

      {/* --- Right Section: Avatar --- */}
      <div className="relative z-10 flex items-center gap-4">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          {/* Breathing Aura around Avatar */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-blue-500 rounded-full blur-md"
          />
          
          <div className="relative p-1 bg-white rounded-full border border-slate-100 shadow-sm">
            {userData.picture ? (
              <Image
                src={userData.picture}
                alt="userAvatar"
                width={50}
                height={50}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white uppercase leading-none">
                  {userData.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* --- Mobile Dropdown --- */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                <Menu size={22} className="text-slate-600" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-52 mt-2 p-2 rounded-2xl shadow-xl border-slate-100">
              <DropdownMenuItem className="rounded-xl py-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer" asChild>
                <Link href="/candidate/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer" asChild>
                <Link href="/candidate/interviews">Interviews</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer" asChild>
                <Link href="/candidate/profile">Profile</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

export default WelcomeContainer;