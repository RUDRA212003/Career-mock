'use client';
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/services/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export function RegisterForm() {
  const { signUpNewUser } = UserAuth();
  const router = useRouter();

  const emailRef = useRef();
  const nameRef = useRef();
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Password Strength State
  const [strength, setStrength] = useState({ score: 0, label: "", color: "bg-gray-200" });

  useEffect(() => {
    evaluatePassword(password);
  }, [password]);

  const evaluatePassword = (val) => {
    if (!val) {
      setStrength({ score: 0, label: "", color: "bg-gray-200" });
      return;
    }
    let score = 0;
    if (val.length > 6) score++;
    if (val.length > 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 2) {
      setStrength({ score: 33, label: "Easy", color: "bg-[#FF3B30]" }); // Apple Red
    } else if (score <= 4) {
      setStrength({ score: 66, label: "Hard", color: "bg-[#FF9500]" }); // Apple Orange
    } else {
      setStrength({ score: 100, label: "Tough", color: "bg-[#34C759]" }); // Apple Green
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const email = emailRef.current?.value.trim();
    const name = nameRef.current?.value.trim();

    if (!email || !name || !password || !role) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUpNewUser(email, password, { name, role });
      if (result.success) {
        toast.success("Account created! Redirecting...");
        router.push("/login");
      } else {
        toast.error(result.error || "Signup failed.");
      }
    } catch (err) {
      toast.error("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-6 md:p-0">
      <form onSubmit={handleSignUp} className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[32px] font-semibold tracking-tight text-[#1d1d1f]">
            Create Account
          </h1>
          <p className="text-[17px] text-[#86868b] leading-tight">
            Join the Career Mock ecosystem.
          </p>
        </div>

        <div className="grid gap-4">
          <Input
            type="text"
            placeholder="Full Name"
            ref={nameRef}
            className="h-[52px] rounded-xl border-gray-300 bg-[#f5f5f7] focus:bg-white transition-all duration-300 text-[17px]"
          />

          <Input
            type="email"
            placeholder="Email"
            ref={emailRef}
            className="h-[52px] rounded-xl border-gray-300 bg-[#f5f5f7] focus:bg-white transition-all duration-300 text-[17px]"
          />

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[52px] rounded-xl border-gray-300 bg-[#f5f5f7] focus:bg-white transition-all duration-300 text-[17px]"
            />
            
            {/* 🔋 Apple Style Password Strength Bar */}
            <AnimatePresence>
              {password && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-1 pt-1"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868b]">
                      Security Level
                    </span>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${strength.label === 'Easy' ? 'text-[#FF3B30]' : strength.label === 'Hard' ? 'text-[#FF9500]' : 'text-[#34C759]'}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-[4px] w-full bg-[#E5E5EA] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.score}%` }}
                      className={`h-full transition-colors duration-500 ${strength.color}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Select onValueChange={setRole} value={role}>
            <SelectTrigger className="h-[52px] rounded-xl border-gray-300 bg-[#f5f5f7] focus:bg-white text-[17px]">
              <SelectValue placeholder="Register as" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="candidate">Candidate</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            className="h-[52px] w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-[17px] font-medium transition-all active:scale-[0.98] mt-4 shadow-sm"
            disabled={loading}
          >
            {loading ? "Initializing..." : "Create Career ID"}
          </Button>
        </div>
      </form>

      <div className="mt-10 text-center">
        <p className="text-[15px] text-[#1d1d1f]">
          Already have an account?{" "}
          <a href="/login" className="text-[#0066cc] hover:underline font-medium">
            Login.
          </a>
        </p>
      </div>
    </div>
  );
}