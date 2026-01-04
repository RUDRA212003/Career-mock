"use client";
import Image from "next/image";
import { LoginForm } from "../../components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left section with login form */}
      <div className="flex flex-col gap-6 p-8 md:p-12 lg:p-16 bg-white dark:bg-gray-900">
        {/* Logo and title */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/fav.svg"
            alt="Career Mock Logo"
            width={60}
            height={60}
            className="w-14 h-14"
          />
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
            Career Mock
          </h1>
        </div>

        {/* Login form centered */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-center text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Welcome Back
            </h2>
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right section with video */}
      <div className="relative hidden lg:block overflow-hidden">
        <video
          src="/greet-vid.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
