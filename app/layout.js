import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "sonner";
import { AuthContextProvider } from "@/context/AuthContext";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Career Mock",
  description: "AI INTERVIEW PLATFORM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Razorpay checkout script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>

      <body className={`${inter.variable} antialiased`}>
        <Provider>
          <AuthContextProvider>
            {children}
            <Toaster />
          </AuthContextProvider>
        </Provider>
      </body>
    </html>
  );
}
