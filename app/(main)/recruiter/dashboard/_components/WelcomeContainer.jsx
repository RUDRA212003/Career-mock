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
import { Menu, LogOut, User } from "lucide-react";
import { SideBarOptions } from "@/services/Constants";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

function WelcomeContainer() {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = UserAuth();

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
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData({
        name: user?.name || user?.email?.split("@")[0] || "User",
        picture: user?.picture,
      });
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border shadow-md flex flex-col sm:flex-row justify-between items-center sm:gap-0 gap-4">
      {/* ✅ Mobile Header Bar */}
      <div className="w-full flex sm:hidden justify-between items-center">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/fav.svg"
            alt="Career Mock Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <h1 className="text-lg font-bold text-blue-700 tracking-tight">
            Career<span className="text-black"> Mock</span>
          </h1>
        </div>

        {/* Right: Avatar + Menu */}
        <div className="flex items-center gap-3">
          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative">
                {userData.picture ? (
                  <Image
                    src={userData.picture}
                    alt="userAvatar"
                    width={40}
                    height={40}
                    className="rounded-full border cursor-pointer hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-[40px] h-[40px] rounded-full bg-blue-100 flex items-center justify-center border cursor-pointer hover:scale-105 transition-transform duration-200">
                    <span className="text-md font-semibold text-blue-600">
                      {userData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-44 mt-2 mr-2">
              <DropdownMenuItem asChild>
                <Link
                  href="/recruiter/profile"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                  router.push("/login");
                }}
                className="flex items-center gap-2 text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hamburger Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-gray-300">
                <Menu size={20} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 mr-2">
              <DropdownMenuItem asChild>
                <Link href="/recruiter/dashboard/create-interview">
                  + Create Interview
                </Link>
              </DropdownMenuItem>

              {SideBarOptions.map((option, index) => (
                <DropdownMenuItem asChild key={index}>
                  <Link href={option.path}>{option.name}</Link>
                </DropdownMenuItem>
              ))}

              <div className="h-px bg-gray-200 my-1"></div>
              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                  router.push("/login");
                }}
                className="flex items-center gap-2 text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ✅ Welcome message (centered on mobile, left on desktop) */}
      <div className="text-center sm:text-left mt-2 sm:mt-0">
        <h2 className="text-lg font-semibold">
          Welcome Back,{" "}
          <span className="text-blue-600 font-bold">{userData.name}</span>
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">
          AI-Driven Interviews, Hassle-Free Hiring
        </p>
      </div>

      {/* ✅ Desktop right section (avatar + menu) */}
      <div className="hidden sm:flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative">
              {userData.picture ? (
                <Image
                  src={userData.picture}
                  alt="userAvatar"
                  width={45}
                  height={45}
                  className="rounded-full border cursor-pointer hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-[45px] h-[45px] rounded-full bg-blue-100 flex items-center justify-center border cursor-pointer hover:scale-105 transition-transform duration-200">
                  <span className="text-lg font-semibold text-blue-600">
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-48 mt-2 mr-2">
            <DropdownMenuItem asChild>
              <Link href="/recruiter/profile" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              className="flex items-center gap-2 text-red-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default WelcomeContainer;
