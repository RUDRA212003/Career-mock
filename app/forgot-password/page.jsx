"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to send email: " + error.message);
    } else {
      toast.success("Check your inbox for the password reset email!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      {/* Big Logo Above Card */}
      <Image
        src="/logo.png"
        alt="App Logo"
        width={120}
        height={120}
        priority
        className="mb-6 object-contain"
      />

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forgot Password?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            Enter your registered email and we’ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-base py-2"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-300"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Remember your password?{" "}
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
