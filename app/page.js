"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Briefcase, Bot, Sparkles, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function CareerMockLanding() {
  const router = useRouter();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const teamMembers = [
    {
      name: "RUDRESH M",
      usn: "(1KI22CS098)",
      role: "FULL STACK DEVELOPER",
      photo: "/team/rudresh.jpg",
      linkedin: "https://www.linkedin.com/in/rudresh-manjunath21/",
      github: "https://github.com/RUDRA212003",
    },
    {
      name: "SHIVAKUMAR SHIDDHALINGESH PARADDI",
      usn: "(1KI22CS102)",
      role: "FRONT END DEVELOPER",
      photo: "/team/shivakumar.jpg",
      linkedin: "https://www.linkedin.com/in/shivakumar-paraddi-8359b825a/",
      github: "https://github.com/shivakumar",
    },
    {
      name: "PRATHIBHA B R",
      usn: "(1KI22CS085)",
      role: "DATABASE DESIGNER",
      photo: "/team/prathibha.jpg",
      linkedin: "https://www.linkedin.com/in/prathibha-br/",
      github: "https://github.com/prathibha",
    },
    {
      name: "RUCHITHA S S",
      usn: "(1KI22CS097)",
      role: "BACKEND DEVELOPER",
      photo: "/team/ruchitha.jpg",
      linkedin: "https://www.linkedin.com/in/ruchitha-sankappa/",
      github: "https://github.com/ruchitha",
    },
  ];

  const companies = [
    "/clientLogos/eeshanya.png",
    "/clientLogos/Google.png",
    "/clientLogos/hrh.jpeg",
    "/clientLogos/tata.png",
    "/clientLogos/techmahindra.png",
    "/clientLogos/teleperformance.png",
    "/clientLogos/Wipro.svg",
  ];

  const reviews = [
    {
      name: "Ananya Rao",
      role: "Candidate",
      text: "Career Mock helped me overcome interview anxiety. The AI feedback felt like a real recruiter’s review!",
      rating: 5,
    },
    {
      name: "Rahul Mehta",
      role: "Recruiter",
      text: "I found strong candidates through mock interviews here — it saves hours of pre-screening.",
      rating: 4,
    },
    {
      name: "Priya Sharma",
      role: "Candidate",
      text: "The detailed performance analysis after every session is incredible. I finally cracked my dream job!",
      rating: 5,
    },
    {
      name: "Arjun Patel",
      role: "Recruiter",
      text: "This platform is a gem! Candidates come well-prepared, making hiring smoother than ever.",
      rating: 5,
    },
    {
      name: "Neha Verma",
      role: "Candidate",
      text: "Loved the realistic questions and tone guidance. Feels like a live HR interview experience.",
      rating: 4,
    },
    {
      name: "Sanjay Kumar",
      role: "Recruiter",
      text: "I can quickly assess communication and confidence levels. Great tool for early-stage hiring.",
      rating: 5,
    },
  ];

  const scrollToFeatures = () => {
    document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 text-gray-900 scroll-smooth">
      {/* ====== Hero Section ====== */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 px-6 overflow-hidden">
        {/* 🔹 Logo */}
        <div className="mb-6 z-10">
          <Image
            src="/logo.png"
            alt="Career Mock Logo"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-6xl font-extrabold leading-tight relative z-10"
        >
          Ace Your Interviews with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Career Mock
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg text-gray-600 max-w-2xl"
        >
          Practice, analyze, and improve with AI-driven mock interviews that help you build real confidence and get job-ready.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex gap-4 pointer-events-auto z-10"
        >
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white group px-8 py-6 text-lg"
            onClick={() => router.push("/login")}
          >
            Start Recruiting
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            onClick={scrollToFeatures}
            variant="outline"
            className="rounded-full px-6 py-3 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
          >
            Learn More
          </Button>
        </motion.div>
      </section>

      {/* ====== Features Section ====== */}
      <section id="features-section" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800"
          >
            Everything You Need to Crack Interviews
          </motion.h2>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: <Bot className="w-8 h-8 text-indigo-600" />,
                title: "AI-Powered Feedback",
                desc: "Get instant feedback on your answers from AI — improve clarity, tone, and technical accuracy.",
              },
              {
                icon: <Briefcase className="w-8 h-8 text-indigo-600" />,
                title: "Real Job Scenarios",
                desc: "Simulate real interview rounds for top companies and roles that match your field.",
              },
              {
                icon: <Sparkles className="w-8 h-8 text-indigo-600" />,
                title: "Career Insights",
                desc: "Discover strengths and areas to grow with detailed analytics after every mock session.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl shadow-sm border hover:shadow-md bg-gradient-to-br from-indigo-50 to-white text-left"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Company Section ====== */}
      <section className="py-20 bg-gradient-to-b from-indigo-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800 mb-12"
          >
            Our Hiring Partners
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 items-center justify-center mb-16">
            {companies.map((logo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <Image
                  src={logo}
                  alt={`Company ${i}`}
                  width={130}
                  height={130}
                  className="object-contain grayscale hover:grayscale-0 transition duration-300"
                />
              </motion.div>
            ))}
          </div>

          {/* ====== Reviews Section ====== */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800 mb-12"
          >
            What People Say About Us
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-white border shadow-sm hover:shadow-md text-left"
              >
                <div className="flex items-center mb-3">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-3 italic">“{review.text}”</p>
                <h4 className="font-semibold text-gray-800">{review.name}</h4>
                <p className="text-sm text-indigo-600">{review.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Meet My Team Section ====== */}
      <section className="py-20 bg-gradient-to-b from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800 mb-12"
          >
            Meet My Team
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-center">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border shadow-sm hover:shadow-md transition"
              >
                <div className="w-28 h-28 mb-4 relative">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={112}
                    height={112}
                    className="rounded-full object-cover border-4 border-indigo-200"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                <p className="text-sm text-indigo-600 font-medium">{member.usn}</p>
                <p className="text-sm text-gray-500 mt-1">{member.role}</p>
                <div className="flex gap-4 mt-4 justify-center">
                  <Link href={member.linkedin} target="_blank">
                    <FaLinkedin className="text-blue-600 w-6 h-6 hover:scale-110 transition-transform" />
                  </Link>
                  <Link href={member.github} target="_blank">
                    <FaGithub className="text-gray-800 w-6 h-6 hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Footer ====== */}

      <footer className="py-10 bg-white border-t text-center text-gray-600 text-sm relative">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-indigo-600">Career Mock</span> — AI Interview & Career Growth Platform.
          <br /> All rights reserved.
        </p>

        {/* 🔹 Privacy Policy Button */}
        <div className="mt-4">
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 text-sm underline"
          >
            Privacy Policy
          </button>
        </div>

        {/* 🔹 Small Login as Admin button */}
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={() => router.push("/admin")}
            className="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
          >
            Login as Admin
          </Button>
        </div>

        {/* ===== Privacy Policy Modal ===== */}
        <Dialog open={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white max-w-3xl mx-auto rounded-lg shadow-lg p-8 overflow-y-auto max-h-[80vh] text-left">
              <Dialog.Title className="text-2xl font-semibold text-indigo-600 mb-4">
                Privacy Policy
              </Dialog.Title>

              <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                <p>
                  At <strong>Career Mock</strong>, your privacy and data security are our highest priority.
                  This policy describes how we collect, use, and protect your information while you use our
                  platform and integrated services.
                </p>

                <h3 className="font-semibold text-gray-900">1. Data Storage and Authentication</h3>
                <p>
                  We use <strong>Supabase</strong> for secure authentication, database management, and file storage.
                  All user information — including email, name, and interview data — is stored in Supabase
                  using industry-grade encryption. Only authorized users can access or modify their personal data.
                </p>

                <h3 className="font-semibold text-gray-900">2. AI Services</h3>
                <p>
                  Our AI interview feedback is powered by <strong>Groq’s Llama-3.1-8B-Instant</strong> model.
                  Your interview answers may be processed by this model temporarily to generate analytical feedback,
                  but no personal information is stored or reused by the AI. We ensure compliance with data-processing
                  and confidentiality standards.
                </p>

                <h3 className="font-semibold text-gray-900">3. Payment Processing</h3>
                <p>
                  We integrate with <strong>Razorpay</strong> for handling all payments securely.
                  We do not store or access your card details. Razorpay independently encrypts
                  and processes payment data according to PCI-DSS standards.
                  By using our payment services, you also agree to <a href="https://razorpay.com/terms/" target="_blank" className="text-indigo-600 underline">Razorpay’s Terms & Conditions</a>.
                </p>

                <h3 className="font-semibold text-gray-900">4. Data Usage and Sharing</h3>
                <p>
                  We collect limited user data to enhance your interview experience and performance analytics.
                  None of your personal information is ever sold or shared with third parties for marketing.
                  Data may be used internally to improve platform reliability and AI accuracy.
                </p>

                <h3 className="font-semibold text-gray-900">5. Third-Party APIs</h3>
                <p>
                  We may use additional third-party APIs such as <strong>Vapi AI</strong> to deliver real-time audio/video
                  mock interviews. These services are bound by their own privacy agreements, but we only
                  send minimal necessary data (such as session tokens and voice data) to ensure functionality.
                </p>

                <h3 className="font-semibold text-gray-900">6. Anti-Spam and Communication Policy</h3>
                <p>
                  We respect your inbox. <strong>Career Mock never sends spam or promotional emails</strong> without your explicit consent.
                  You may receive emails only for account verification, password resets, interview feedback,
                  or important service updates. You can unsubscribe anytime.
                </p>

                <h3 className="font-semibold text-gray-900">7. Cookies and Tracking</h3>
                <p>
                  We use minimal cookies to maintain user sessions and improve website experience.
                  No advertising or third-party tracking cookies are used.
                </p>

                <h3 className="font-semibold text-gray-900">8. User Rights</h3>
                <p>
                  You have the right to request access, modification, or deletion of your personal data.
                  Contact our support if you wish to delete your account and associated information.
                </p>

                <h3 className="font-semibold text-gray-900">9. Policy Updates</h3>
                <p>
                  This Privacy Policy may be updated periodically to reflect new features or compliance requirements.
                  Updates will be posted on this page with the revised effective date.
                </p>

                <p className="mt-6 text-gray-600">
                  Last updated: <strong>{new Date().toLocaleDateString()}</strong>
                </p>
              </div>

              <div className="mt-6 text-right">
                <Button onClick={() => setIsPrivacyOpen(false)} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Close
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </footer>
    </main>
  );
}
