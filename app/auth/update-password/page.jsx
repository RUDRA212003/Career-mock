"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let timer;

    // Listen for recovery event from Supabase
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" || session) {
          setReady(true);
          clearTimeout(timer); // stop timer once ready
        }
      }
    );

    // Timeout after 15 seconds if not ready
    timer = setTimeout(() => {
      setExpired(true);
    }, 15000);

    return () => {
      clearTimeout(timer);
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error("Failed to update password: " + error.message);
    } else {
      toast.success("Password updated! Please login again.");
      window.location.href = "/";
    }
  };

  if (expired && !ready)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-600 dark:text-gray-300 px-4">
        <Image
          src="/logo.png"
          alt="App Logo"
          width={120}
          height={120}
          className="mb-4"
        />
        <h2 className="text-xl font-semibold mb-2">Link Expired</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Your password reset link has expired or is invalid. Please go back to
          the login page and request a new one.
        </p>
        <a
          href="/forgot-password"
          className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Request New Reset Link
        </a>
      </div>
    );

  if (!ready)
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-gray-500 dark:text-gray-300">
        Waiting for recovery session...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Image
        src="/logo.png"
        alt="App Logo"
        width={120}
        height={120}
        priority
        className="mb-6 object-contain"
      />
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set a New Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            Enter a new password to secure your account.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <Input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-base py-2"
            required
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-300"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Back to{" "}
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
