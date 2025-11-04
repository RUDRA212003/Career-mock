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
import { Menu } from "lucide-react"; // menu icon

function WelcomeContainer() {
  const { user } = useUser();
  const [userData, setUserData] = useState({
    name: user?.name || "User",
    picture: null,
  });

  useEffect(() => {
    if (user?.email) {
      fetchLatestUserData();
    }
  }, [user]);

  const fetchLatestUserData = async () => {
    try {
      const { data: userRecord } = await supabase
        .from("users")
        .select("name, picture")
        .eq("email", user.email)
        .single();

      setUserData({
        name:
          userRecord?.name ||
          user?.name ||
          user?.email?.split("@")[0] ||
          "User",
        picture: userRecord?.picture || user?.picture,
      });

      if (typeof window !== "undefined") {
        const googleProfile = localStorage.getItem("googleProfile");
        if (googleProfile) {
          const { name, picture } = JSON.parse(googleProfile);
          setUserData((prev) => ({
            ...prev,
            name: name || prev.name,
            picture: picture || prev.picture,
          }));
        }
      }
    } catch {
      setUserData({
        name: user?.name || user?.email?.split("@")[0] || "User",
        picture: user?.picture,
      });
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border shadow-md flex justify-between items-center">
      {/* Welcome Text */}
      <div>
        <h2 className="text-lg font-bold">
          Welcome Back,{" "}
          <span className="text-blue-600">{userData.name}</span>
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">
          Your Path to Great Jobs Starts with AI Interviews
        </p>
      </div>

      {/* Right Section (Avatar + Dropdown) */}
      <div className="flex items-center gap-3">
        {/* Avatar - always visible */}
        {userData.picture ? (
          <Image
            src={userData.picture}
            alt="userAvatar"
            width={45}
            height={45}
            className="rounded-full border"
          />
        ) : (
          <div className="w-[45px] h-[45px] rounded-full bg-blue-100 flex items-center justify-center border">
            <span className="text-lg font-semibold text-blue-600">
              {userData.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu size={20} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-44 mr-2">
              <DropdownMenuItem asChild>
                <Link href="/candidate/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/candidate/interviews">Interviews</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/candidate/profile">Profile</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default WelcomeContainer;
