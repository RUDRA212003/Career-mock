"use client";

import React, { useState, useEffect } from "react"; // Fixed: Combined imports
import { ArrowLeft, Coins, Check, Sparkles, Gift, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@/app/provider";
import { supabase } from "@/services/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    price: 225,
    originalPrice: 249,
    popular: false,
    features: ["10 Interview Credits", "Perfect for small teams", "Valid for 6 months", "Email support"],
  },
  {
    id: "professional",
    name: "Professional Pack",
    credits: 25,
    price: 449,
    originalPrice: 499,
    popular: true,
    features: ["25 Interview Credits", "Best value for money", "Valid for 12 months", "Priority email support", "Bulk interview creation"],
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    credits: 50,
    price: 809,
    originalPrice: 899,
    popular: false,
    features: ["50 Interview Credits", "Best price per credit", "Valid for 12 months", "Priority support", "Advanced analytics", "Custom integrations"],
  },
];

export default function Billing() {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { user, setUser } = useUser();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fireSuccessConfetti = () => {
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#D4AF37", "#FFD700", "#000000"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#D4AF37", "#FFD700", "#000000"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedPackage.price }),
      });
      const data = await res.json();
      if (!data.id) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: selectedPackage.price * 100,
        currency: "INR",
        name: "Career Mock 2026",
        description: `New Year Offer: ${selectedPackage.name}`,
        order_id: data.id,
        handler: async function (response) {
          try {
            const newCredits = (user?.credits || 0) + (selectedPackage?.credits || 0);

            const { data: updated, error } = await supabase
              .from("users")
              .update({ credits: newCredits })
              .eq("email", user?.email)
              .select()
              .single();

            if (error) throw error;

            setUser(updated);
            setShowSuccess(true);
            fireSuccessConfetti();
            toast.success("Credits updated successfully!");
          } catch (err) {
            console.error("DB Update Error:", err);
            toast.error("Payment successful but credits failed to update. Please contact support.");
          }
        },
        prefill: { name: user?.name || "Candidate", email: user?.email || "" },
        theme: { color: "#D4AF37" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment initialization failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] py-12 px-4 selection:bg-yellow-100 relative overflow-hidden">
      
      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="max-w-md w-full"
            >
              <div className="relative mb-8 flex justify-center">
                <div className="w-32 h-32 bg-yellow-50 rounded-full flex items-center justify-center border-2 border-yellow-200">
                  <Sparkles className="w-16 h-16 text-yellow-600" />
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto bg-yellow-400 rounded-full animate-ping opacity-20" />
              </div>

              <h2 className="text-5xl font-black tracking-tighter mb-4 italic uppercase">
                {selectedPackage.credits} <span className="text-yellow-600">Credits</span> Added
              </h2>
              
              <div className="bg-[#F5F5F7] rounded-[32px] p-8 mb-8 border border-gray-100">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4">Transaction Successful</p>
                <p className="text-lg font-medium text-gray-700 leading-relaxed">
                  Your credits are now active. Enjoy your interviews and land that dream role!
                </p>
              </div>

              <Button
                onClick={() => setShowSuccess(false)}
                className="w-full h-16 rounded-2xl bg-black text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
              >
                Start Interviewing
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                New Year <span className="text-yellow-600">Credits</span>
              </h1>
              <p className="text-gray-500 font-medium">Resolution 2026: Success is a choice</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <Gift className="text-yellow-600 w-6 h-6 animate-bounce" />
            <span className="font-bold text-yellow-800 uppercase tracking-tight text-sm">
              2+0+2+6 Offer: 10% Extra Off Applied
            </span>
          </div>
        </div>

        {/* Current Credits Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-12 max-w-sm mx-auto border-none bg-[#F5F5F7] rounded-[32px] shadow-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Available Balance</p>
              <div className="flex items-center justify-center gap-3 mb-1">
                <Coins className="w-6 h-6 text-yellow-600" />
                <span className="text-4xl font-black text-[#1d1d1f]">{user?.credits || 0}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {CREDIT_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="relative group">
              {pkg.popular && (
                <div className="absolute -inset-[2px] rounded-[34px] overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400 animate-[spin_4s_linear_infinite]" 
                        style={{ width: '200%', height: '200%', left: '-50%', top: '-50%' }} />
                </div>
              )}

              <Card
                className={`relative h-full transition-all duration-300 rounded-[32px] overflow-hidden cursor-pointer ${
                  selectedPackage.id === pkg.id
                    ? "bg-white border-2 border-yellow-600 shadow-2xl scale-[1.02]"
                    : "bg-[#F5F5F7] border-transparent hover:bg-gray-100"
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.popular && (
                  <div className="bg-yellow-600 text-white text-center py-1 text-[10px] font-black uppercase tracking-widest">
                    Best Value 2026
                  </div>
                )}
                
                <CardHeader className="text-center pt-8">
                  <p className="text-xs font-black uppercase tracking-widest text-yellow-600 mb-2">{pkg.name}</p>
                  <CardTitle className="text-5xl font-black tracking-tighter">₹{pkg.price}</CardTitle>
                  <p className="text-gray-400 line-through text-sm font-bold">₹{pkg.originalPrice}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 text-center">
                    <div className="text-3xl font-black text-[#1d1d1f]">{pkg.credits}</div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interviews</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Summary & Checkout */}
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-[40px] border-none bg-black text-white p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap size={150} fill="white" />
             </div>
             
             <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight uppercase italic text-yellow-500">Checkout</h3>
                  <p className="text-gray-400 font-medium">{selectedPackage.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">₹{selectedPackage.price}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-yellow-600 hover:bg-yellow-700 text-white font-black uppercase tracking-widest text-lg transition-all"
                  >
                    {loading ? "Processing..." : `Pay Now`}
                  </Button>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}