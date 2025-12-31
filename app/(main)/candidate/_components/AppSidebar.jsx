"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SideBarCondidate } from "@/services/Constants";
import { LogOut, ChevronRight } from "lucide-react";
import { UserAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export function AppSidebar() {
  const router = useRouter();
  const path = usePathname();
  const { signOut } = UserAuth();

  return (
    <Sidebar className="border-r border-[#D2D2D7]/50 bg-[#F5F5F7]/80 backdrop-blur-xl">
      {/* Apple Style Header */}
      <SidebarHeader className="flex items-center justify-center py-10 px-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative transition-all duration-500 cursor-pointer"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={85}
            height={85}
            className="w-[85px] object-contain drop-shadow-sm"
            priority
          />
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarMenu className="gap-1.5">
            {SideBarCondidate.map((option, index) => {
              const isActive = path === option.path;
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    className={`relative h-11 rounded-[10px] transition-all duration-200 group ${
                      isActive 
                      ? "bg-[#0071E3] text-white shadow-sm" 
                      : "text-[#1D1D1F] hover:bg-[#E8E8ED]"
                    }`}
                  >
                    <Link href={option.path} className="flex items-center px-3 gap-3">
                      <div className={`p-1 rounded-md transition-colors ${isActive ? "text-white" : "text-[#0071E3]"}`}>
                        <option.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      
                      <span className={`text-[14px] flex-grow font-medium tracking-tight ${isActive ? "font-semibold" : "font-medium text-[#1D1D1F]"}`}>
                        {option.name}
                      </span>

                      {isActive && (
                        <motion.div initial={{ x: -5, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            <ChevronRight className="w-4 h-4 opacity-70" />
                        </motion.div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="space-y-4">
          {/* Identity Protection Status */}
          <div className="flex items-center gap-2 px-2 opacity-50">
             <div className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
             <span className="text-[11px] font-semibold text-[#1D1D1F] uppercase tracking-wider">Secure Session</span>
          </div>

          <Button
            variant="ghost"
            className="w-full h-11 rounded-[10px] text-[#FF3B30] hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] font-semibold text-sm transition-all active:scale-[0.98] border border-transparent hover:border-[#FF3B30]/20"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;