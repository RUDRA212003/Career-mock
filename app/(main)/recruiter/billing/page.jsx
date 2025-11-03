"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Coins, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@/app/provider";

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    price: 249,
    pricePerCredit: 24.9,
    popular: false,
    features: [
      "10 Interview Credits",
      "Perfect for small teams",
      "Valid for 6 months",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional Pack",
    credits: 25,
    price: 499,
    pricePerCredit: 19.9,
    popular: true,
    features: [
      "25 Interview Credits",
      "Best value for money",
      "Valid for 12 months",
      "Priority email support",
      "Bulk interview creation",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    credits: 50,
    price: 899,
    pricePerCredit: 17.9,
    popular: false,
    features: [
      "50 Interview Credits",
      "Best price per credit",
      "Valid for 12 months",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
    ],
  },
];

export default function Billing() {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // Create order on backend
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedPackage.price }),
      });

      const data = await res.json();

      if (!data.id) throw new Error("Order creation failed");

      // Real Razorpay test checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_xxxxxxx", // your test key
        amount: selectedPackage.price * 100,
        currency: "INR",
        name: "Techie Notes",
        description: `Purchase ${selectedPackage.name}`,
        order_id: data.id,
        handler: function (response) {
          toast.success(`✅ Payment Successful! (${selectedPackage.credits} credits pending update)`);
        },
        prefill: {
          name: user?.name || "Test User",
          email: user?.email || "test@techienotes.com",
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment failed or cancelled!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Interview Credits</h1>
            <p className="text-gray-600 mt-1">Buy credits to create AI-powered interviews</p>
          </div>
        </div>

        {/* Current Credits */}
        {user && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Current Credits</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">{user.credits || 0}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                selectedPackage.id === pkg.id
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : "hover:border-gray-300"
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Coins className="w-6 h-6 text-blue-600" />
                  {pkg.name}
                </CardTitle>
                <div className="text-3xl font-bold text-gray-900">₹{pkg.price}</div>
                <div className="text-sm text-gray-500">
                  ₹{pkg.pricePerCredit.toFixed(2)} per credit
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{pkg.credits}</div>
                  <div className="text-sm text-gray-500">Interview Credits</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchase Button */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Complete Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Selected Package:</span>
                <span className="text-blue-600 font-semibold">{selectedPackage.name}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Credits:</span>
                <span className="text-blue-600 font-semibold">
                  {selectedPackage.credits} credits
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-bold">Total:</span>
                <span className="text-blue-600 font-bold text-lg">₹{selectedPackage.price}</span>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Processing..." : `Buy for ₹${selectedPackage.price}`}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                You are in Razorpay Test Mode — use test card details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
