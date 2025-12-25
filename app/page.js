"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, Mic, ShieldCheck, 
  BarChart3, Target, Zap, TrendingUp 
} from "lucide-react"; 
import { FaLinkedin, FaGithub } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Dialog } from "@headlessui/react";

// --- IMPORT EXTERNAL MAINTENANCE COMPONENT ---
import Maintenance from "@/components/Maintenance";

// --- Smooth Scroll Reveal (for text, cards, etc.) ---
const ScrollFadeIn = ({ children, delay = 0, duration = 0.8, yOffset = 30 }) => (
  <motion.div
    initial={{ opacity: 0, y: yOffset }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default function CareerMockLanding() {
  const router = useRouter();

  // ==========================================
  // TOGGLE THIS VARIABLE: 
  // true  = Show components/Maintenance.jsx
  // false = Show your actual Landing Page
  // ==========================================
  const isUpdating = true; 

  if (isUpdating) {
    return <Maintenance />;
  }

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const logoScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroBackgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const teamMembers = [
    { name: "RUDRESH M", usn: "(1KI22CS098)", role: "FULL STACK DEVELOPER", photo: "/team/rudresh.jpg", linkedin: "https://www.linkedin.com/in/rudresh-manjunath21/", github: "https://github.com/RUDRA212003" },
    { name: "SHIVAKUMAR S P", usn: "(1KI22CS102)", role: "FRONT END DEVELOPER", photo: "/team/shivakumar.jpg", linkedin: "https://www.linkedin.com/in/shivakumar-paraddi-8359b825a/", github: "https://github.com/shivakumar" },
    { name: "PRATHIBHA B R", usn: "(1KI22CS085)", role: "DATABASE DESIGNER", photo: "/team/prathi.jpg", linkedin: "https://www.linkedin.com/in/prathibha-br/", github: "https://github.com/prathibha" },
    { name: "RUCHITHA S S", usn: "(1KI22CS097)", role: "BACKEND DEVELOPER", photo: "/team/ruchitha.jpg", linkedin: "https://www.linkedin.com/in/ruchitha-sankappa/", github: "https://github.com/ruchitha" },
  ];

  const companies = [
    "/clientLogos/eeshanya.png", "/clientLogos/Google.png", "/clientLogos/hrh.jpeg",
    "/clientLogos/tata.png", "/clientLogos/techmahindra.png", "/clientLogos/teleperformance.png", "/clientLogos/Wipro.svg"
  ];

  return (
    <div className="bg-[#FFFFFF] text-[#1d1d1f] font-sans selection:bg-[#0071e3]/10 antialiased relative">
      
      {/* 🌌 Animated Background Elements */}
      <motion.div 
        style={{ y: heroBackgroundY }}
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <motion.div 
          animate={{ x: [-50, 50], y: [-50, 50], rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-64 h-64 bg-blue-200/30 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [50, -50], y: [50, -50], rotate: [360, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-purple-200/30 rounded-full blur-[120px]" 
        />
      </motion.div>

      {/* 🧭 Top Navigation */}
      <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-[1024px] mx-auto h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={28} height={28} />
            <span className="text-xl font-bold tracking-tight">Career Mock</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-normal text-[#424245]">
            <a href="#features" className="hover:text-[#0071e3] transition-colors">How it works</a>
            <a href="#team" className="hover:text-[#0071e3] transition-colors">Our Team</a>
            <Button 
              onClick={() => router.push("/login")}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-[12px] px-5 py-0 h-8 rounded-full font-medium shadow-md shadow-blue-200/50"
            >
              Start Session
            </Button>
          </div>
        </div>
      </nav>

      {/* 🎬 Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-48 overflow-hidden bg-gradient-to-b from-[#f5f5f7] to-white">
        <div className="max-w-5xl mx-auto text-center px-6">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ scale: logoScale, y: logoY }}
            className="mb-16 flex justify-center perspective-1000"
          >
            <motion.div
              animate={{ rotateY: [0, 15, 0, -15, 0], rotateX: [0, 10, 0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/logo.png"
                alt="Career Mock Logo"
                width={250}
                height={250}
                priority
                className="drop-shadow-[0_25px_60px_rgba(0,0,0,0.15)]"
              />
            </motion.div>
          </motion.div>

          <ScrollFadeIn delay={0.4}>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-8">
              Elevate your career. <br />
              <span className="bg-gradient-to-r from-[#0071e3] to-[#5e5ce6] bg-clip-text text-transparent">Master the interview.</span>
            </h1>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.6}>
            <p className="text-xl md:text-2xl text-[#636366] font-medium max-w-2xl mx-auto mb-12">
              Practice with AI, get instant feedback, and confidently land your next role.
            </p>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.8}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button onClick={() => router.push("/login")} size="lg" className="rounded-full bg-[#1d1d1f] hover:bg-[#000] px-10 h-14 text-lg font-semibold shadow-xl shadow-gray-300/30">
                Start Free Trial
              </Button>
              <Link href="#features" className="text-[19px] text-[#0066cc] hover:underline flex items-center gap-1 font-medium group">
                Explore capabilities <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* 📊 Feature Grid */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <ScrollFadeIn yOffset={50} delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-bold text-center tracking-tight mb-20">
              Intelligent features, <br /> real-world results.
            </h2>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollFadeIn delay={0.2}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="bg-[#fcfcfc] rounded-[32px] p-10 h-[320px] border border-gray-100 flex flex-col justify-between group relative overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <Mic className="text-[#0071e3] w-12 h-12 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-3 tracking-tight">AI Voice Analysis</h3>
                <p className="text-[#636366] leading-relaxed">Refine your tone, pace, and clarity with AI-driven speech insights.</p>
                <TrendingUp size={100} className="absolute bottom-4 right-4 text-blue-100/50 group-hover:rotate-6 transition-transform" />
              </motion.div>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.3}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="bg-[#fcfcfc] rounded-[32px] p-10 h-[320px] border border-gray-100 flex flex-col justify-between group relative overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <Target className="text-purple-600 w-12 h-12 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Role-Specific Drills</h3>
                <p className="text-[#636366] leading-relaxed">Practice scenarios meticulously crafted for your target tech roles.</p>
                <Image src="/logo.png" alt="Card Logo" width={80} height={80} className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity" />
              </motion.div>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.4}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="bg-[#fcfcfc] rounded-[32px] p-10 h-[320px] border border-gray-100 flex flex-col justify-between group relative overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <BarChart3 className="text-green-600 w-12 h-12 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Performance Tracking</h3>
                <p className="text-[#636366] leading-relaxed">Visualize your progress and pinpoint areas for consistent improvement.</p>
                <Zap size={100} className="absolute bottom-4 right-4 text-green-100/50 group-hover:rotate-12 transition-transform" />
              </motion.div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* 🚀 Infinite Looping Marquee */}
      <section className="py-24 border-y border-gray-100 overflow-hidden bg-[#fbfbfd]">
        <ScrollFadeIn yOffset={40} delay={0.1}>
          <p className="text-center text-[12px] font-bold text-[#86868b] mb-12 uppercase tracking-[0.2em]">TRUSTED BY ASPIRANTS AT LEADING COMPANIES</p>
        </ScrollFadeIn>
        <div className="flex relative">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-24 items-center shrink-0"
          >
            {[...companies, ...companies].map((img, i) => (
              <Image key={i} src={img} alt="Partner" width={120} height={50} className="grayscale opacity-50 object-contain hover:opacity-100 transition-opacity duration-500" />
            ))}
          </motion.div>
        </div>
      </section>

      {/* 👥 Team Section */}
      <section id="team" className="py-32 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <ScrollFadeIn yOffset={50} delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-bold text-center tracking-tight mb-20">
              The engineers behind <br /> your success.
            </h2>
          </ScrollFadeIn>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, i) => (
              <ScrollFadeIn key={i} delay={i * 0.15}>
                <motion.div 
                  whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                  className="group flex flex-col p-6 bg-[#fcfcfc] rounded-[32px] border border-gray-100 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="w-full aspect-[3/4] relative rounded-2xl overflow-hidden mb-6 border border-gray-200">
                    <Image 
                      src={member.photo} 
                      alt={member.name} 
                      fill 
                      className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                    />
                  </div>
                  <p className="text-[11px] font-black text-[#0071e3] uppercase tracking-widest mb-1">{member.usn}</p>
                  <h4 className="text-xl font-bold text-[#1d1d1f] mb-1 tracking-tight">{member.name}</h4>
                  <p className="text-[#636366] text-sm font-medium mb-6">{member.role}</p>
                  <div className="flex gap-4">
                    <Link href={member.linkedin} target="_blank" className="text-gray-400 hover:text-[#0077b5] transition-colors"><FaLinkedin size={22} /></Link>
                    <Link href={member.github} target="_blank" className="text-gray-400 hover:text-black transition-colors"><FaGithub size={22} /></Link>
                  </div>
                </motion.div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 🏮 Footer */}
      <footer className="bg-[#f5f5f7] pt-28 pb-12 px-6 border-t border-gray-200">
        <div className="max-w-[1024px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-12 border-b border-gray-200">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <Image src="/logo.png" alt="L" width={24} height={24} />
                <span className="font-bold text-[17px]">Career Mock</span>
              </div>
              <p className="text-[13px] text-[#636366] leading-relaxed">
                Empowering developers with professional-grade interview intelligence. 
                Built with precision to bridge the gap between talent and opportunity.
              </p>
            </div>
            <div className="flex flex-col gap-4 text-[13px] text-[#1d1d1f] font-medium">
               <span className="text-[#86868b] uppercase tracking-widest text-[11px]">Information</span>
               <button onClick={() => setIsPrivacyOpen(true)} className="hover:underline text-left">Privacy Policy</button>
               <Link href="/admin" className="hover:underline">Admin Login</Link>
            </div>
          </div>
          
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-[12px] text-[#86868b] font-medium">
            <p>Copyright © {new Date().getFullYear()} Career Mock. All rights reserved.</p>
            <p className="mt-2 md:mt-0 italic tracking-tight">Designed for the next generation of leaders.</p>
          </div>
        </div>
      </footer>

      {/* 🔐 Privacy Modal */}
      <Dialog open={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} className="relative z-[200]">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white max-w-xl w-full rounded-[30px] p-10 shadow-2xl">
            <Dialog.Title className="text-2xl font-bold mb-6 flex items-center gap-3">
               <ShieldCheck className="text-[#0071e3]" size={28} /> Privacy Protocol
            </Dialog.Title>
            <div className="space-y-6 text-[#424245] text-[14px] leading-relaxed">
              <p>Your session security is our priority. We utilize <strong>Supabase RLS</strong> to ensure your interview data is isolated and encrypted.</p>
              <h4 className="font-bold text-[#1d1d1f]">01. AI Analysis</h4>
              <p>Our integration with Groq allows for high-speed analysis without storing persistent audio data longer than your session requires.</p>
              <h4 className="font-bold text-[#1d1d1f]">02. Secure Payments</h4>
              <p>All financial interactions are handled securely through Razorpay's encrypted gateway.</p>
            </div>
            <Button onClick={() => setIsPrivacyOpen(false)} className="w-full mt-10 bg-[#0071e3] text-white rounded-full h-12 font-semibold shadow-md">Acknowledge</Button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}