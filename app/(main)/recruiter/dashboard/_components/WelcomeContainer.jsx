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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, PlusCircle, LayoutDashboard } from "lucide-react";
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
        name: userRecord?.name || user?.name || user?.email?.split("@")[0] || "User",
        picture: userRecord?.picture || user?.picture,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm transition-all">
      
      {/* --- Mobile Header Bar (Navigation Style) --- */}
      <div className="flex sm:hidden items-center justify-between mb-5">
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

        <div className="flex items-center gap-2">
          {/* User Avatar Dropdown (Mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none focus:ring-2 ring-blue-500 rounded-full transition-all">
                {userData.picture ? (
                  <Image
                    src={userData.picture}
                    alt="avatar"
                    width={34}
                    height={34}
                    className="rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-2 rounded-xl shadow-xl border-slate-100 p-1">
              <DropdownMenuItem asChild className="rounded-lg py-2.5 cursor-pointer">
                <Link href="/recruiter/profile" className="flex items-center gap-2">
                  <User size={16} /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg py-2.5 cursor-pointer">
                <LogOut size={16} className="mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3-Bar Menu (Mobile) - Now includes Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200">
                <Menu size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl shadow-2xl border-slate-100 p-2">
              <DropdownMenuItem asChild className="rounded-xl py-3 mb-1 font-bold text-blue-600 focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                <Link href="/recruiter/dashboard/create-interview" className="flex items-center gap-3">
                  <PlusCircle size={18} /> + Create Interview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {SideBarOptions.map((option, index) => (
                <DropdownMenuItem asChild key={index} className="rounded-xl py-3 cursor-pointer">
                  <Link href={option.path} className="flex items-center gap-3 text-slate-600">
                    <LayoutDashboard size={18} /> {option.name}
                  </Link>
                </DropdownMenuItem>
              ))}

              {/* Added Logout inside 3-bar menu for mobile */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl py-3 text-red-600 focus:bg-red-50 cursor-pointer font-semibold">
                <LogOut size={18} className="mr-3" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- Welcome Content (Responsive) --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            Welcome Back,{" "}
            <span className="text-blue-600">{userData.name}</span> 👋
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">
            AI-Driven Interviews, Hassle-Free Hiring
          </p>
        </div>

        {/* Desktop Only Avatar Section */}
        <div className="hidden sm:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none hover:scale-105 transition-transform">
                {userData.picture ? (
                  <Image
                    src={userData.picture}
                    alt="userAvatar"
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-white shadow-md ring-1 ring-slate-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-md text-blue-600 font-bold text-lg">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-3 rounded-xl p-2 shadow-xl border-slate-100">
              <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
                <Link href="/recruiter/profile" className="flex items-center gap-2">
                  <User size={16} /> Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg py-2 cursor-pointer">
                <LogOut size={16} className="mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default WelcomeContainer;