"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Coins, Check, Sparkles, Gift, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@/app/provider";
import { motion } from "framer-motion";

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    price: 225, // 249 - 10% approx
    originalPrice: 249,
    popular: false,
    features: ["10 Interview Credits", "Perfect for small teams", "Valid for 6 months", "Email support"],
  },
  {
    id: "professional",
    name: "Professional Pack",
    credits: 25,
    price: 449, // 499 - 10% approx
    originalPrice: 499,
    popular: true,
    features: ["25 Interview Credits", "Best value for money", "Valid for 12 months", "Priority email support", "Bulk interview creation"],
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    credits: 50,
    price: 809, // 899 - 10% approx
    originalPrice: 899,
    popular: false,
    features: ["50 Interview Credits", "Best price per credit", "Valid for 12 months", "Priority support", "Advanced analytics", "Custom integrations"],
  },
];

export default function Billing() {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_xxxxxxx",
        amount: selectedPackage.price * 100,
        currency: "INR",
        name: "Career Mock 2026",
        description: `New Year Offer: ${selectedPackage.name}`,
        order_id: data.id,
        handler: function (response) {
          toast.success(`✅ Payment Successful! Happy New Year 2026!`);
        },
        prefill: { name: user?.name || "Candidate", email: user?.email || "" },
        theme: { color: "#D4AF37" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] py-12 px-4 selection:bg-yellow-100">
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
              <p className="text-gray-500 font-medium">Resolution 2026: Land your dream role with AI</p>
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Internal Registry</p>
              <div className="flex items-center justify-center gap-3 mb-1">
                <Coins className="w-6 h-6 text-yellow-600" />
                <span className="text-4xl font-black text-[#1d1d1f]">{user?.credits || 0}</span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase">Available Credits</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {CREDIT_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="relative group">
              {/* LOOP ANIMATION FOR PROFESSIONAL CARD */}
              {pkg.popular && (
                <div className="absolute -inset-[2px] rounded-[34px] overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400 animate-[spin_3s_linear_infinite] opacity-100" 
                        style={{ width: '200%', height: '200%', left: '-50%', top: '-50%' }} />
                </div>
              )}

              <Card
                className={`relative h-full transition-all duration-300 rounded-[32px] overflow-hidden cursor-pointer ${
                  selectedPackage.id === pkg.id
                    ? "bg-white border-2 border-yellow-600 shadow-2xl scale-[1.02]"
                    : "bg-[#F5F5F7] border-transparent grayscale hover:grayscale-0"
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.popular && (
                  <div className="bg-yellow-600 text-white text-center py-1 text-[10px] font-black uppercase tracking-widest">
                    Top Resolution 2026
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
                        <div className="bg-white rounded-full p-1 shadow-sm">
                          <Check className="w-3 h-3 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 text-center">
                    <div className="text-3xl font-black text-[#1d1d1f]">{pkg.credits}</div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interview Credits</p>
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
                  <h3 className="text-2xl font-black tracking-tight uppercase italic">Summary</h3>
                  <p className="text-gray-400 font-medium">Selected: <span className="text-yellow-500">{selectedPackage.name}</span></p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">₹{selectedPackage.price}</span>
                    <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">All Taxes Incl.</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-yellow-600 hover:bg-yellow-700 text-white font-black uppercase tracking-widest text-lg shadow-lg shadow-yellow-600/20 active:scale-95 transition-all"
                  >
                    {loading ? "Initializing..." : `Pay ₹${selectedPackage.price}`}
                  </Button>
                  <p className="text-[10px] text-gray-500 text-center font-bold uppercase tracking-tighter">
                    Secure 256-bit AES Encryption // Razorpay Secure
                  </p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}