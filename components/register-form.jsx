"use client";

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
import { motion, AnimatePresence } from "framer-motion";

export function RegisterForm() {
  const { signUpNewUser } = UserAuth();
  const router = useRouter();

  const emailRef = useRef(null);
  const nameRef = useRef(null);

  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const [strength, setStrength] = useState({
    score: 0,
    label: "",
    color: "bg-gray-200",
  });

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: "", color: "bg-gray-200" });
      return;
    }

    let score = 0;
    if (password.length > 6) score++;
    if (password.length > 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      setStrength({ score: 33, label: "Easy", color: "bg-[#FF3B30]" });
    } else if (score <= 4) {
      setStrength({ score: 66, label: "Hard", color: "bg-[#FF9500]" });
    } else {
      setStrength({ score: 100, label: "Tough", color: "bg-[#34C759]" });
    }
  }, [password]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    const email = emailRef.current?.value.trim();
    const name = nameRef.current?.value.trim();

    if (!email || !name || !password || !role) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const result = await signUpNewUser(email, password, { name, role });

    if (result.success) {
      toast.success("Account created successfully!");
      router.push("/login");
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-6">
      <form onSubmit={handleSignUp} className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Create Account</h1>
          <p className="text-gray-500">Join the Career Mock ecosystem</p>
        </div>

        <Input ref={nameRef} placeholder="Full Name" />
        <Input ref={emailRef} type="email" placeholder="Email" />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <AnimatePresence>
          {password && (
            <motion.div>
              <div className="h-1 bg-gray-200 rounded">
                <div
                  className={`${strength.color} h-full rounded`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
              <p className="text-xs mt-1">{strength.label}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Register as" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="candidate">Candidate</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
          </SelectContent>
        </Select>

        <Button disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
