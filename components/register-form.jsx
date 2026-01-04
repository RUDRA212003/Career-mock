'use client';
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/services/supabaseClient";
import { Mail, Lock, User2Icon, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function RegisterForm() {
  const { signUpNewUser } = UserAuth();
  const router = useRouter();

  const emailRef = useRef();
  const nameRef = useRef();
  const passwordRef = useRef();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    const email = emailRef.current?.value.trim();
    const name = nameRef.current?.value.trim();
    const password = passwordRef.current?.value;

    if (!email || !name || !password || !role) {
      toast.error("Please fill in all fields including the role.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signUpNewUser(email, password, { name, role });
      if (result.success) {
        toast.success("Account created! Redirecting...");
        router.push("/login");
      } else {
        setError(result.error);
        toast.error(result.error || "Email already exists.");
      }
    } catch (err) {
      toast.error("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const SignUpWithGoogle = async () => {
    if (!role) {
      toast.error("Please select a role first");
      return;
    }
    localStorage.setItem("pending_role", role);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error("Google sign-up failed: " + error.message);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">
            Create Account
          </h1>
          <p className="text-[15px] text-[#86868b]">
            Join the ecosystem of professional growth.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name" className="text-[13px] font-medium ml-1 text-[#1d1d1f]">Full Name</Label>
              <div className="relative">
                <User2Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] w-[18px] h-[18px]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  ref={nameRef}
                  className="pl-11 h-12 bg-[#f5f5f7] border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-black/5 transition-all text-[15px]"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium ml-1 text-[#1d1d1f]">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] w-[18px] h-[18px]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@apple.com"
                  ref={emailRef}
                  className="pl-11 h-12 bg-[#f5f5f7] border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-black/5 transition-all text-[15px]"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium ml-1 text-[#1d1d1f]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] w-[18px] h-[18px]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  ref={passwordRef}
                  className="pl-11 h-12 bg-[#f5f5f7] border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-black/5 transition-all text-[15px]"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="role" className="text-[13px] font-medium ml-1 text-[#1d1d1f]">Register as</Label>
              <Select onValueChange={setRole} value={role}>
                <SelectTrigger className="w-full h-12 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black/5 text-[15px] px-4">
                  <SelectValue placeholder="Select your path" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="candidate" className="rounded-xl cursor-pointer py-3">Candidate</SelectItem>
                  <SelectItem value="recruiter" className="rounded-xl cursor-pointer py-3">Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl text-[15px] font-medium transition-all duration-300 shadow-lg shadow-blue-500/20 mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering
              </span>
            ) : (
              <span className="flex items-center gap-1">Continue <ChevronRight className="w-4 h-4" /></span>
            )}
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#d2d2d7]/50" />
          </div>
          <span className="relative z-10 bg-white px-4 text-[12px] font-medium text-[#86868b] uppercase tracking-widest">
            Or
          </span>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 rounded-2xl border-[#d2d2d7] hover:bg-[#f5f5f7] transition-all duration-300 text-[15px] font-medium flex items-center justify-center gap-3" 
          onClick={SignUpWithGoogle}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Register with Google
        </Button>

        <p className="text-center text-[14px] text-[#86868b] mt-2">
          Already have an account?{" "}
          <a href="/login" className="text-[#0071e3] hover:underline font-medium decoration-2 underline-offset-4">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}