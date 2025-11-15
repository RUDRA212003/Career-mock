"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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

import { SideBarOptions } from "@/services/Constants";
import { LogOutIcon, Plus, MessageCircle, Send, X } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { UserAuth } from "@/context/AuthContext";

// 🔊 ONLINE SOUND URLs (NO PUBLIC FOLDER REQUIRED)
const sendSound =
  typeof Audio !== "undefined"
    ? new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_0b8fa6badd.mp3")
    : null;

const receiveSound =
  typeof Audio !== "undefined"
    ? new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_0b8fa6badd.mp3")
    : null;

export function AppSidebar() {
  const router = useRouter();
  const path = usePathname();
  const { signOut } = UserAuth();

  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey! 👋 How can I assist you today?" },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [isHovering, setIsHovering] = useState(false); 
  const [showButton, setShowButton] = useState(false); // New state to control animation

  const chatEndRef = useRef(null);

  // Trigger button visibility and initial pop-in animation after mount
  useEffect(() => {
    setShowButton(true);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // SMART "keyword to answer" matching
  const helpMap = [
    {
      keywords: ["create", "interview", "new"],
      reply:
        "To create a new interview, click Create New Interview. Fill job details, duration, questions → copy share link to send to candidates.",
    },
    {
      keywords: ["feedback", "results", "candidate", "score"],
      reply:
        "Go to Scheduled Interview → open any job card → scroll to see transcripts, AI feedback, and evaluation.",
    },
    {
      keywords: ["ai", "evaluate", "analysis", "grok"],
      reply:
        "AI converts audio to text using VAPI → sends to Grok AI → evaluates the answer based on job description and returns JSON feedback.",
    },
    {
      keywords: ["profile", "update", "edit"],
      reply:
        "You can update your full name and profile photo in Profile Settings.",
    },
    {
      keywords: ["password", "change", "security"],
      reply:
        "Open Profile → scroll to Security → enter a new password. (Google login users cannot change password)",
    },
    {
      keywords: ["picture", "photo", "avatar"],
      reply: "Go to Profile → click Change Picture → upload new image.",
    },
  ];

  // BOT reply with sound + typing animation
  const botReply = (text) => {
    setTyping(true);

    setTimeout(() => {
      receiveSound?.play();
      setMessages((prev) => [...prev, { sender: "bot", text }]);
      setTyping(false);
    }, 1200);
  };

  // Process user message
  const handleUserMessage = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    sendSound?.play();

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");

    // Find best matching answer
    const found = helpMap.find((map) =>
      map.keywords.some((word) => userText.toLowerCase().includes(word))
    );

    if (found) botReply(found.reply);
    else
      botReply(
        "I didn't quite understand 🤔 Please choose a Quick Help option below."
      );
  };

  return (
    <>
      {/* =================== SIDEBAR =================== */}
      <Sidebar>
        <SidebarHeader className="flex items-center justify-center py-4 px-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={120}
            className="object-contain"
          />
        </SidebarHeader>

        <div className="px-4">
          <Button
            className="w-full"
            onClick={() =>
              router.push("/recruiter/dashboard/create-interview")
            }
          >
            <Plus className="mr-2" /> Create New Interview
          </Button>
        </div>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {SideBarOptions.map((option, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={option.path}
                      className={`flex items-center gap-3 p-3 rounded-md ${
                        path === option.path
                          ? "bg-blue-50 text-primary"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <option.icon className="w-5 h-5" />
                      <span className="font-medium">{option.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <Button
            className="w-full"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            <LogOutIcon className="mr-2" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* =================== CHAT BUTTON CONTAINER =================== */}
      <div 
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        
        {/* HOVER TOOLTIP (AI Assistant Help) */}
        {isHovering && (
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 whitespace-nowrap">
            <div 
                className="bg-white text-gray-800 text-sm font-medium p-2 pr-4 rounded-xl shadow-lg border border-gray-200 relative"
                // WhatsApp-like bubble shape using a pseudo-element for the triangle tail (clipPath)
                style={{ clipPath: 'polygon(0 0, 95% 0, 95% 50%, 100% 50%, 95% 100%, 0 100%)' }}
            >
              AI Assistant Help
            </div>
          </div>
        )}

        {/* CHAT BUTTON (WhatsApp Green + Pop Animation) */}
        <button
          onClick={() => setOpenChat(true)}
          // Uses animate-bounce once on load for a pop effect, then resets.
          // The scale-0 is removed, and we let CSS handle the initial appearance with a small "jiggle".
          className={`
            bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl 
            transition-all duration-300 hover:scale-110
            ${showButton ? 'animate-bounce-once' : ''}
          `}
        >
          {/* Custom class definition for 'animate-bounce-once' if needed, otherwise 'animate-bounce' works multiple times.
              To ensure it runs only once, we rely on the component mounting and the class being applied. 
              If 'animate-bounce-once' is not defined, use 'animate-bounce' and clear it in useEffect (complex).
              For simplicity and robustness, we use a simple scale-in transition here: 
          */}
          <style jsx global>{`
            /* Define a temporary style for the initial scale-in effect */
            .initial-scale-in {
              animation: scale-up 0.4s ease-out forwards;
            }
            @keyframes scale-up {
              0% { transform: scale(0); }
              100% { transform: scale(1); }
            }
          `}</style>
          <div className={`w-6 h-6 ${showButton ? 'initial-scale-in' : ''}`}>
             <MessageCircle className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* =================== CHAT POPUP =================== */}
      {openChat && (
        <div>
          {/* BACKDROP: Added backdrop-blur-sm and a semi-transparent black background */}
          <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" 
            onClick={() => setOpenChat(false)}
          />

          {/* CHAT WINDOW */}
          <div
            className="
              fixed bottom-20 right-6 z-50
              w-80 sm:w-[420px] 
              bg-white/80 backdrop-blur-xl
              border border-gray-200 shadow-xl
              rounded-2xl animate-slideUp
              flex flex-col
              max-h-[600px] 
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER (WhatsApp Green Header) */}
            <div className="flex justify-between items-center p-3 bg-green-600 text-white">
              <div className="flex items-center gap-2">
                {/* Back/Close button */}
                <X className="cursor-pointer h-5 w-5" onClick={() => setOpenChat(false)} />
                
                {/* Profile Picture Placeholder */}
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                
                {/* Name and Status */}
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">AI Assistant</span>
                    <span className="text-xs text-green-100">online</span>
                </div>
              </div>
            </div>

            {/* MESSAGES (WhatsApp Chat Wallpaper Background) */}
            <div 
              className="flex-1 p-4 overflow-y-auto space-y-2"
              style={{ backgroundColor: "#ECE5DD" }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg max-w-[80%] text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "ml-auto bg-[#DCF8C6] text-gray-900 rounded-bl-xl rounded-tr-xl relative"
                      : "mr-auto bg-white text-gray-900 rounded-br-xl rounded-tr-xl relative"
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {typing && (
                <div className="bg-white p-2.5 rounded-br-xl rounded-tr-xl w-16 flex gap-1 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-gray-500 animate-bounce"></span>
                  <span className="h-2 w-2 rounded-full bg-gray-500 animate-bounce delay-150"></span>
                  <span className="h-2 w-2 rounded-full bg-gray-500 animate-bounce delay-300"></span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* QUICK HELP (Styled as suggestions) */}
            <div className="p-3 border-t bg-gray-50 max-h-[160px] overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">Quick Help Suggestions</p>

              <div className="grid gap-2">
                {helpMap.map((opt, i) => (
                  <button
                    key={i}
                    className="p-2 border rounded-full bg-white hover:bg-gray-100 text-xs text-center border-gray-300"
                    onClick={() => botReply(opt.reply)}
                  >
                    {opt.reply.split(".")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT (Rounded Input Field and Circular Send Button) */}
            <div className="p-2 flex gap-1 bg-gray-100">
              <input
                className="flex-1 border-none bg-white rounded-full px-4 py-2 text-sm shadow-md focus:ring-green-500 focus:border-green-500"
                placeholder="Message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUserMessage()}
              />

              {/* Send Button (Circular, WhatsApp Green) */}
              <button 
                onClick={handleUserMessage}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-md flex items-center justify-center w-10 h-10"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AppSidebar;