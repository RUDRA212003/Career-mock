'use client';
import React, { useState, useEffect } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLayout({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Set your password here or in .env file
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        toast.success('Access Granted ✅');
        setAuthorized(true);
      } else {
        toast.error('Incorrect Password ❌');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="relative">
      {/* 🔐 Global Popup for ALL /admin pages */}
      {!authorized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white/90 p-8 rounded-2xl shadow-xl border border-gray-200 w-80 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Admin Access Required
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Enter the admin password to view this page.
            </p>
            <Input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" /> Checking...
                </>
              ) : (
                'Unlock Access'
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Blurred background when unauthorized */}
      <div
        className={`transition-all duration-500 ${
          !authorized ? 'blur-sm pointer-events-none select-none' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
