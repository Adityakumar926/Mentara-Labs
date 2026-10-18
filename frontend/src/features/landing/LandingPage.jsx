import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { studentApi } from "@/api/services";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { 
  ArrowUpRight, ArrowRight, Play, Timer, Atom, PenTool, Sparkles, ChevronRight, ChevronLeft,
  Globe, BookOpen, GraduationCap, Award, Library, Compass, X, Menu,
  Dna, Sigma, Code2, LineChart, Globe2, BookText, Check, Quote,
  Instagram, Linkedin, Youtube, Star, BarChart3, Layers, FlaskConical,
  Presentation, Zap, Navigation, Brain, Search, Mic, Bot, MessageSquare, ShieldCheck
} from "lucide-react";

import LaptopScrollShowcase from "./LaptopScrollShowcase";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();


  // Redirect already-authenticated users
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : user.role === "teacher" ? "/courses" : "/student/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      <style>{`
        .font-doodle {
          font-family: 'Fredoka', 'Quicksand', 'Outfit', sans-serif;
        }
        .font-display {
          font-family: 'Fredoka', 'Outfit', sans-serif;
        }
        .font-mono-label {
          font-family: 'Space Grotesk', monospace;
        }
        /* Pastel Neumorphism & Soft Clay Classes */
        .neu-flat {
          background: #FAFBFD;
          box-shadow: 10px 10px 24px rgba(210, 218, 235, 0.55), -10px -10px 24px rgba(255, 255, 255, 0.95);
        }
        .neu-card {
          background: #FFFFFF;
          box-shadow: 8px 12px 28px rgba(195, 207, 230, 0.35), -6px -6px 20px rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        .neu-card-soft {
          background: linear-gradient(145deg, #FFFFFF, #F6F8FD);
          box-shadow: 12px 14px 30px rgba(200, 212, 236, 0.4), -8px -8px 24px rgba(255, 255, 255, 0.95);
        }
        .neu-pill {
          box-shadow: 4px 6px 14px rgba(200, 212, 236, 0.35), -4px -4px 12px rgba(255, 255, 255, 0.9);
        }
        .neu-inset {
          box-shadow: inset 4px 4px 8px rgba(205, 216, 238, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.85);
        }
        .clay-pill {
          border-radius: 9999px;
          box-shadow: 0 10px 20px rgba(129, 140, 248, 0.22), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -3px 4px rgba(79, 70, 229, 0.15);
        }
        .clay-badge {
          box-shadow: 0 4px 10px rgba(148, 163, 184, 0.15), inset 0 2px 3px rgba(255, 255, 255, 0.8), inset 0 -2px 3px rgba(0, 0, 0, 0.04);
        }
        .bg-grid-light {
          background-size: 36px 36px;
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          56% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-blob {
          animation: blob 12s infinite alternate ease-in-out;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        @keyframes logo-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-live-logo-gradient {
          background: linear-gradient(
            120deg,
            #8b5cf6 0%,
            #6366f1 22%,
            #38bdf8 50%,
            #06b6d4 75%,
            #a855f7 100%
          );
          background-size: 250% 250%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: logo-gradient-shift 4.5s ease-in-out infinite;
        }
      `}</style>

      <main className="relative min-h-screen bg-[#F4F6FC] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-800">
        <Header />
        <Hero />
        <FeaturesBento />
        <LaptopScrollShowcase />
        <Pricing />
        <SubjectsGrid />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}

/* ── 1. HEADER (Neumorphic Floating Pill Navbar with Molecule Dissolve Effect) ── */
function Header() {
  const [activeTab, setActiveTab] = useState("Home");
  const [open, setOpen] = useState(false);
  const [isDissolved, setIsDissolved] = useState(false);

  const pillRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const lastScrolledRef = useRef(false);

  const NAV_LINKS = [
    { label: "Home", href: "#" },
    { label: "Features", href: "#features" },
    { label: "Price", href: "#pricing" },
    { label: "Subject", href: "#subjects" },
    { label: "Review", href: "#testimonials" },
  ];

  // Molecular Disintegration Animation on Scroll Down
  const triggerDisintegration = () => {
    const pill = pillRef.current;
    const canvas = canvasRef.current;
    if (!pill || !canvas) return;

    const rect = pill.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pillCenterX = rect.left + rect.width / 2;
    const pillCenterY = rect.top + rect.height / 2;

    const newParticles = [];
    const count = 190; // Density of small molecule dots

    for (let i = 0; i < count; i++) {
      const x = rect.left + 12 + Math.random() * (rect.width - 24);
      const y = rect.top + 4 + Math.random() * (rect.height - 8);

      const dx = x - pillCenterX;
      const dy = y - pillCenterY;
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
      const speed = Math.random() * 3.6 + 1.2;

      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.6),
        vy: Math.sin(angle) * speed * 0.6 - Math.random() * 1.6, // gentle upward molecular drift
        size: Math.random() * 2.8 + 1.2, // fine molecule dots (1.2px - 4px)
        alpha: 1.0,
        decay: Math.random() * 0.018 + 0.012, // dissolves over ~50-80 frames
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: (Math.random() - 0.5) * 0.16,
        color: [
          "rgba(255, 255, 255,",   // pure white
          "rgba(244, 246, 252,",   // ceramic pearl
          "rgba(56, 189, 248,",    // cyan atom
          "rgba(147, 197, 253,",   // light sky blue
          "rgba(99, 102, 241,",    // brand indigo
          "rgba(30, 41, 59,",      // subtle text dust
        ][Math.floor(Math.random() * 6)],
      });
    }

    particlesRef.current = newParticles;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.vx *= 0.965;
        p.vy *= 0.965;
        p.vy -= 0.025; // upward evaporation
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * Math.max(0.2, p.alpha), 0, Math.PI * 2);
          ctx.fillStyle = `${p.color} ${Math.max(0, p.alpha)})`;
          ctx.shadowColor = "rgba(56, 189, 248, 0.45)";
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.restore();
        }
      }

      if (alive) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  };

  // Re-assembling Convergence Animation on Scroll Up (Exact Reverse Molecule Effect)
  const triggerReassemble = () => {
    const pill = pillRef.current;
    const canvas = canvasRef.current;
    if (!pill || !canvas) return;

    const rect = pill.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pillCenterX = rect.left + rect.width / 2;
    const pillCenterY = rect.top + rect.height / 2;

    const newParticles = [];
    const count = 190; // Matching 190 molecule density

    for (let i = 0; i < count; i++) {
      // Final target point on the pill capsule
      const targetX = rect.left + 12 + Math.random() * (rect.width - 24);
      const targetY = rect.top + 4 + Math.random() * (rect.height - 8);

      // Starting point scattered out in the air (the reverse of evaporation)
      const dx = targetX - pillCenterX;
      const dy = targetY - pillCenterY;
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
      const dist = Math.random() * 85 + 40;

      const startX = targetX + Math.cos(angle) * dist;
      const startY = targetY + Math.sin(angle) * dist - (Math.random() * 35 + 10);

      newParticles.push({
        x: startX,
        y: startY,
        startX,
        startY,
        targetX,
        targetY,
        progress: 0,
        speed: Math.random() * 0.035 + 0.025, // converges in ~35 frames (~500ms)
        size: Math.random() * 2.8 + 1.2,
        alpha: 0,
        color: [
          "rgba(255, 255, 255,",
          "rgba(244, 246, 252,",
          "rgba(56, 189, 248,",
          "rgba(147, 197, 253,",
          "rgba(99, 102, 241,",
          "rgba(30, 41, 59,",
        ][Math.floor(Math.random() * 6)],
      });
    }

    particlesRef.current = newParticles;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.progress >= 1) continue;

        p.progress = Math.min(1, p.progress + p.speed);

        // Smooth cubic ease-out convergence curve
        const t = p.progress;
        const ease = 1 - Math.pow(1 - t, 3);

        p.x = p.startX + (p.targetX - p.startX) * ease;
        p.y = p.startY + (p.targetY - p.startY) * ease;

        // Fades in, stays bright, then snaps seamlessly into the solid pill
        if (t < 0.25) {
          p.alpha = t / 0.25;
        } else if (t > 0.85) {
          p.alpha = (1 - t) / 0.15;
        } else {
          p.alpha = 1.0;
        }

        if (p.progress < 1) {
          alive = true;
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color} ${Math.max(0, p.alpha)})`;
          ctx.shadowColor = "rgba(56, 189, 248, 0.5)";
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.restore();
        }
      }

      if (alive) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  };

  // Scroll listener: Dissolve on scroll down, Reassemble on scroll up
  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      // 1. At very top of page: always ensure visible
      if (currentY < 35) {
        if (lastScrolledRef.current) {
          lastScrolledRef.current = false;
          setIsDissolved(false);
          triggerReassemble();
        }
      }
      // 2. Scrolling down past 60px: dissolve into molecules
      else if (delta > 8 && currentY > 60) {
        if (!lastScrolledRef.current) {
          lastScrolledRef.current = true;
          setIsDissolved(true);
          triggerDisintegration();
        }
      }
      // 3. Scrolling up: reassemble with reverse molecular effect
      else if (delta < -8) {
        if (lastScrolledRef.current) {
          lastScrolledRef.current = false;
          setIsDissolved(false);
          triggerReassemble();
        }
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <>
      {/* Particle Canvas Layer for Molecule Disintegration */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]" />

      {/* Top-Left Brand Logo (Clean text and logo, no border or background) */}
      <div className="fixed top-4 sm:top-5 left-4 sm:left-8 lg:left-12 z-50 pointer-events-none">
        <a
          href="#"
          data-testid="brand-logo"
          className="pointer-events-auto inline-flex items-center gap-2.5"
        >
          <img
            src="/mentara-new.png"
            alt="Mentara Learning Logo"
            className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
          />
          <span className="font-display font-doodle font-bold text-lg sm:text-xl tracking-tight whitespace-nowrap animate-live-logo-gradient">
            Mentara Learning
          </span>
        </a>
      </div>

      {/* Floating Center Navbar */}
      <header className="fixed top-4 sm:top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
        {/* Floating Neumorphic Capsule Bar with Smooth Disappearing Effect */}
        <div
          ref={pillRef}
          data-testid="site-header"
          className={`pointer-events-auto flex items-center justify-between gap-2 sm:gap-3 md:gap-5 px-2.5 sm:px-3 py-1.5 rounded-full select-none backdrop-blur-2xl transition-all duration-500 shadow-md ${
            isDissolved
              ? "opacity-0 scale-95 -translate-y-3 blur-[6px] pointer-events-none"
              : "opacity-100 scale-100 translate-y-0 blur-0 pointer-events-auto"
          }`}
          style={{
            backgroundColor: "rgba(244, 245, 249, 0.94)",
            border: "1px solid rgba(255, 255, 255, 0.9)",
            boxShadow:
              "0 14px 38px -4px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 1)",
          }}
        >
          {/* Navigation Links (Starts directly with Home, About...) */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveTab(item.label)}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`relative px-3 sm:px-4 py-1 text-xs sm:text-[13px] transition-all duration-200 rounded-full ${
                    isActive
                      ? "font-semibold text-slate-800"
                      : "font-medium text-slate-500 hover:text-slate-800 hover:bg-black/[0.02]"
                  }`}
                >
                  {/* Active Soft Elevated Pill Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-full bg-white border border-white/80 shadow-[0_4px_14px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)]"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action / Sign In */}
          <div className="flex items-center gap-1.5">
            <Link
              to="/login"
              data-testid="header-signin"
              className="hidden lg:inline-flex px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              data-testid="header-cta"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
            >
              <span>Get Started</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setOpen(!open)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {open && !isDissolved && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              data-testid="mobile-nav"
              className="pointer-events-auto absolute top-full mt-3 w-[92vw] max-w-sm rounded-3xl p-4 shadow-2xl backdrop-blur-2xl border border-white/80 md:hidden"
              style={{
                backgroundColor: "rgba(244, 245, 249, 0.97)",
                boxShadow: "0 20px 45px -8px rgba(15, 23, 42, 0.15)",
              }}
            >
              <div className="flex flex-col gap-1.5">
                {NAV_LINKS.map((item) => {
                  const isActive = activeTab === item.label;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => {
                        setActiveTab(item.label);
                        setOpen(false);
                      }}
                      className={`px-4 py-2.5 rounded-2xl text-sm transition-all ${
                        isActive
                          ? "bg-white font-semibold text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
                <hr className="border-slate-200/80 my-1.5" />
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

/* ── 2. HERO (Soft Minimalism + Pastel Neumorphism + Playful 3D Clay Illustrations) ── */
function Hero() {
  return (
    <section 
      data-testid="hero-section" 
      className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-16 overflow-hidden flex items-center min-h-[640px] lg:min-h-[720px] bg-[#FAF9F6]"
    >
      {/* ── HERO ARTWORK: Complete uncropped fit with cute reading robot in blue sky landscape ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-end justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-bottom"
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, black 90%, rgba(0,0,0,0.6) 96%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 90%, rgba(0,0,0,0.6) 96%, transparent 100%)",
          }}
        >
          <source src="/v1.mp4" type="video/mp4" />
        </video>
        {/* Crisp background view with minimal localized fade behind the text for readability */}
        <div 
          className="absolute inset-0" 
          style={{
            background: "linear-gradient(to right, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.35) 30%, transparent 60%)",
          }}
        />

        {/* Subtle, soft natural blend at bottom of Hero (reduced whiteness) */}
        <div 
          className="absolute inset-x-0 bottom-0 h-32 sm:h-44 pointer-events-none z-10"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 30%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 30%, black 100%)",
            background: "linear-gradient(to bottom, transparent 0%, rgba(240, 248, 252, 0.12) 50%, rgba(235, 246, 250, 0.28) 100%)",
          }}
        />
      </div>



      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── LEFT COLUMN: Hero Headline & Value Props (Remains in exact position) ── */}
          <div className="lg:col-span-6 xl:col-span-6">
            
            {/* Soft Neumorphic Pill Badge */}
            <div 
              className="mb-5 sm:mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full neu-pill border border-white/80 bg-white/90" 
              data-testid="hero-unified-banner"
            >
              <span 
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #FFFFFF, #38BDF8)",
                  boxShadow: "0 2px 4px rgba(56, 189, 248, 0.4)",
                }}
              />
              <span className="font-mono-label text-[10.5px] uppercase tracking-[0.16em] font-semibold text-slate-700">
                BUILT FOR CAMBRIDGE PRIMARY
              </span>
            </div>

            {/* Main Headline in Doodle Rounded Font */}
            <h1 className="font-doodle text-4xl sm:text-5xl lg:text-[58px] xl:text-[64px] font-bold tracking-tight text-slate-800 leading-[1.12]">
              Everything you need<br />
              to teach and learn<br />
              <span className="bg-gradient-to-r from-sky-400/95 via-indigo-400/95 to-purple-500/95 bg-clip-text text-transparent">
                Cambridge Primary.
              </span>
            </h1>

            {/* Subtitle Paragraph */}
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600/90 max-w-xl font-normal">
              Interactive Virtual Labs, digital worksheets and practical exam preparation designed for curious learners.
            </p>

            {/* CTA Buttons (Clay Button + Neumorphic Secondary) */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <Link
                to="/register"
                data-testid="hero-cta-primary"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #C084FC 100%)",
                  boxShadow: "0 10px 24px rgba(129, 140, 248, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.45), inset 0 -3px 4px rgba(79, 70, 229, 0.2)",
                }}
              >
                <span>Explore MentP</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href="#features"
                data-testid="hero-cta-secondary"
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full neu-pill bg-white/95 text-slate-700 font-medium text-sm hover:bg-white transition-all border border-white"
              >
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #64748B, #334155)",
                    boxShadow: "0 2px 6px rgba(51, 65, 85, 0.3)",
                  }}
                >
                  <Play className="h-2.5 w-2.5 fill-white text-white ml-0.5" />
                </div>
                <span>Explore Features</span>
              </a>
            </div>

            {/* Micro Feature Highlights Row (Clay Badges) */}
            <div className="mt-10 pt-7 border-t border-slate-200/50 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <div 
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%)",
                    boxShadow: "4px 6px 14px rgba(196, 181, 253, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 1)",
                  }}
                >
                  <Layers className="w-4 h-4 text-purple-600/90" />
                </div>
                <span>Interactive<br className="hidden sm:block" /> Simulations</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <div 
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)",
                    boxShadow: "4px 6px 14px rgba(186, 230, 253, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 1)",
                  }}
                >
                  <BookOpen className="w-4 h-4 text-sky-600/90" />
                </div>
                <span>Printable<br className="hidden sm:block" /> Worksheets</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <div 
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, #F0FDFA 100%)",
                    boxShadow: "4px 6px 14px rgba(153, 246, 228, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 1)",
                  }}
                >
                  <BarChart3 className="w-4 h-4 text-teal-600/90" />
                </div>
                <span>Progress<br className="hidden sm:block" /> Tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <div 
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%)",
                    boxShadow: "4px 6px 14px rgba(253, 230, 138, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 1)",
                  }}
                >
                  <GraduationCap className="w-4 h-4 text-amber-600/90" />
                </div>
                <span>For Students<br className="hidden sm:block" /> & Teachers</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Kept Empty as Requested ── */}
          <div className="lg:col-span-6 xl:col-span-6" />

        </div>
      </div>
    </section>
  );
}



/* ── ULTRA-SENSITIVE SCIENTIFIC 3D TILT HOVER CARD ── */
function Card3DTilt({ children, hoverBorder = "hover:border-cyan-300", accentGlow = "rgba(165, 243, 252, 0.4)" }) {
  const cardRef = React.useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [shadowPos, setShadowPos] = useState({ x: 0, y: 14 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized position (-0.5 to 0.5) from center
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    // Gentle & smooth 3D tilt formula
    const targetRotX = -normY * 18;
    const targetRotY = normX * 18;
    
    setRotateX(targetRotX);
    setRotateY(targetRotY);

    // Dynamic physical shadow casting opposite to mouse cursor position
    setShadowPos({
      x: -normX * 24,
      y: 16 + Math.abs(normY) * 12,
    });

    setGlarePos({ 
      x: (x / rect.width) * 100, 
      y: (y / rect.height) * 100, 
      opacity: 0.45 
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
    setShadowPos({ x: 0, y: 12 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="[perspective:1200px] h-full py-2 cursor-pointer"
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 22, mass: 0.4 }}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: isHovered 
            ? `${shadowPos.x}px ${shadowPos.y}px 28px rgba(15, 23, 42, 0.12), 0 0 16px ${accentGlow}`
            : "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
        }}
        className={`relative flex flex-col justify-between h-full rounded-[26px] border border-slate-200/80 bg-white overflow-hidden transition-colors duration-200 ${hoverBorder}`}
      >
        {/* Dynamic Specular Light Glare Reflection */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-200 rounded-[26px]"
          style={{
            opacity: glarePos.opacity * 0.4,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
          }}
        />
        
        {/* 3D Multi-Layer Parallax Depth */}
        <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="flex flex-col justify-between h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ── 3D DRAMATIC CIRCULAR ARC SCROLL-UNFOLD CARD WRAPPER ── */
function Card3DScrollArc({ index, totalCards = 4, children, scrollProgress }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Dramatic 3D semicircle arc calculation
  const offset = index - (totalCards - 1) / 2;
  const initialRotY = offset * 34;
  const initialRotZ = offset * 10;
  const initialY = Math.pow(Math.abs(offset), 1.5) * 32;
  const initialZ = -Math.pow(Math.abs(offset), 1.5) * 75;

  // Delayed range [0.15, 0.85] so user sees 3D arc unfolding right in view
  const rotateY = useTransform(scrollProgress, [0.15, 0.85], [initialRotY, 0]);
  const rotateZ = useTransform(scrollProgress, [0.15, 0.85], [initialRotZ, 0]);
  const translateY = useTransform(scrollProgress, [0.15, 0.85], [initialY, 0]);
  const translateZ = useTransform(scrollProgress, [0.15, 0.85], [initialZ, 0]);
  const opacity = useTransform(scrollProgress, [0.1, 0.45], [0.3, 1]);

  if (isMobile) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <motion.div
      style={{
        rotateY,
        rotateZ,
        translateY,
        translateZ,
        opacity,
        transformStyle: "preserve-3d",
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

/* ── 4. FEATURES BENTO (Matching User Screenshot media_1787853829963.png) ── */
function FeaturesBento() {
  const [torchPos, setTorchPos] = useState(1.0);
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 50%", "center 30%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 20,
    mass: 0.6,
  });

  return (
    <section 
      ref={sectionRef} 
      id="features" 
      data-testid="features-section" 
      className="relative pt-8 pb-10 sm:py-14 lg:py-20 bg-[#FAF9F6] [perspective:1400px] overflow-hidden"
    >
      {/* ── BACKGROUND IMAGE (img_2): Platform Features Section ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/img_2.png"
          alt="Platform Features Background"
          className="w-full h-full object-cover object-center"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 4%, black 10%, black 86%, rgba(0,0,0,0.4) 95%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 4%, black 10%, black 86%, rgba(0,0,0,0.4) 95%, transparent 100%)",
          }}
        />
        {/* Subtle, soft natural blend at top of Features (reduced whiteness) */}
        <div 
          className="absolute inset-x-0 top-0 h-32 sm:h-44 pointer-events-none z-10"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            maskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.2) 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.2) 70%, transparent 100%)",
            background: "linear-gradient(to bottom, rgba(235, 246, 250, 0.28) 0%, rgba(240, 248, 252, 0.12) 50%, transparent 100%)",
          }}
        />

        {/* Subtle, soft natural blend at bottom of Features (reduced whiteness) */}
        <div 
          className="absolute inset-x-0 bottom-0 h-32 sm:h-44 pointer-events-none z-10"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 30%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 30%, black 100%)",
            background: "linear-gradient(to bottom, transparent 0%, rgba(244, 246, 252, 0.12) 50%, rgba(244, 246, 252, 0.3) 100%)",
          }}
        />
      </div>

      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="font-mono-label text-[10.5px] uppercase tracking-[0.24em] text-cyan-700 font-semibold px-4 py-1.5 rounded-full neu-pill bg-[#FAFBFD] border border-white/90 inline-block mb-3.5">
            · PLATFORM FEATURES
          </span>
          <h2 className="font-display font-doodle text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-800">
            Platform <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="mt-2.5 sm:mt-3 text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Everything students need for Cambridge Primary success, all in one connected environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch [transform-style:preserve-3d]">
          
          {/* Card 1: 3D Science Simulations (Teal Header) */}
          <Card3DScrollArc index={0} scrollProgress={smoothProgress}>
            <Card3DTilt hoverBorder="hover:border-emerald-200">
              <div 
                className="p-6 flex items-center justify-between"
                style={{
                  background: "linear-gradient(135deg, #A7F3D0 0%, #5EEAD4 50%, #67E8F9 100%)",
                  boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -2px 4px rgba(13, 148, 136, 0.2)",
                }}
              >
                <div 
                  className="h-12 w-12 rounded-2xl flex items-center justify-center" 
                  style={{ 
                    transform: "translateZ(30px)",
                    background: "radial-gradient(circle at 35% 30%, #FFFFFF, #D1FAE5)",
                    boxShadow: "0 6px 14px rgba(16, 185, 129, 0.2), inset 1px 1px 2px #FFFFFF",
                  }}
                >
                  <Atom className="h-6 w-6 text-emerald-700" />
                </div>
                <span 
                  className="px-3.5 py-1 rounded-full text-emerald-800 font-mono-label text-xs font-bold" 
                  style={{ 
                    transform: "translateZ(30px)",
                    background: "rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.15)",
                  }}
                >
                  Interactive Lab
                </span>
              </div>

              <div className="p-6 flex flex-col justify-between h-full bg-white/95">
                <div>
                  <h3 className="font-display font-doodle text-2xl font-bold text-slate-800 tracking-tight">
                    3D Science<br />Simulations
                  </h3>
                  <p className="mt-3.5 text-sm text-slate-600 leading-relaxed font-normal">
                    Interactive 3D physics & optics labs (Light & Shadows, Reflection, Forces) with live slider controls and shadow math calculations.
                  </p>
                </div>

                <div 
                  className="mt-6 p-4 rounded-2xl neu-inset bg-[#F8FAFD] border border-white" 
                  style={{ transform: "translateZ(25px)" }}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-700 mb-2 font-medium">
                    <span>Torch: <strong className="text-cyan-700">{torchPos.toFixed(1)}m</strong></span>
                    <span>Shadow: <strong className="text-emerald-700">{Math.round(torchPos * 18)}cm</strong></span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={torchPos}
                    onChange={(e) => setTorchPos(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </Card3DTilt>
          </Card3DScrollArc>

          {/* Card 2: Gogo AI Voice Agent (Purple Header) */}
          <Card3DScrollArc index={1} scrollProgress={smoothProgress}>
            <Card3DTilt hoverBorder="hover:border-purple-200">
              <div 
                className="p-6 flex items-center justify-between"
                style={{
                  background: "linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 50%, #E9D5FF 100%)",
                  boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -2px 4px rgba(109, 40, 217, 0.2)",
                }}
              >
                <div 
                  className="h-12 w-12 rounded-2xl flex items-center justify-center" 
                  style={{ 
                    transform: "translateZ(30px)",
                    background: "radial-gradient(circle at 35% 30%, #FFFFFF, #EDE9FE)",
                    boxShadow: "0 6px 14px rgba(124, 58, 237, 0.2), inset 1px 1px 2px #FFFFFF",
                  }}
                >
                  <Bot className="h-6 w-6 text-purple-700" />
                </div>
                <span 
                  className="px-3.5 py-1 rounded-full text-purple-800 font-mono-label text-xs font-bold" 
                  style={{ 
                    transform: "translateZ(30px)",
                    background: "rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 2px 6px rgba(124, 58, 237, 0.15)",
                  }}
                >
                  Voice Tutor
                </span>
              </div>

              <div className="p-6 flex flex-col justify-between h-full bg-white/95">
                <div>
                  <h3 className="font-display font-doodle text-2xl font-bold text-slate-800 tracking-tight">
                    Gogo AI Voice Agent
                  </h3>
                  <p className="mt-3.5 text-sm text-slate-600 leading-relaxed font-normal">
                    Real-time Socratic voice assistant guiding Cambridge Primary students step-by-step through science and math concepts.
                  </p>
                </div>

                <div 
                  className="mt-6 p-4 rounded-2xl neu-inset bg-[#F8FAFD] border border-white flex items-center justify-between" 
                  style={{ transform: "translateZ(25px)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-xs font-mono text-slate-700 font-medium">Voice Active</span>
                  </div>
                  <div className="flex items-end gap-1 h-5">
                    {[12, 20, 16, 24, 14, 18].map((h, i) => (
                      <motion.span
                        key={i}
                        className="w-1 bg-purple-500 rounded-full"
                        animate={{ height: [8, h, 8] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card3DTilt>
          </Card3DScrollArc>

          {/* Card 3: Checkpoint Exams (Blue Header) */}
          <Card3DScrollArc index={2} scrollProgress={smoothProgress}>
            <Card3DTilt hoverBorder="hover:border-sky-200">
              <div 
                className="p-6 flex items-center justify-between"
                style={{
                  background: "linear-gradient(135deg, #BAE6FD 0%, #93C5FD 50%, #BFDBFE 100%)",
                  boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -2px 4px rgba(37, 99, 235, 0.2)",
                }}
              >
                <div 
                  className="h-12 w-12 rounded-2xl flex items-center justify-center" 
                  style={{ 
                    transform: "translateZ(30px)",
                    background: "radial-gradient(circle at 35% 30%, #FFFFFF, #E0F2FE)",
                    boxShadow: "0 6px 14px rgba(37, 99, 235, 0.2), inset 1px 1px 2px #FFFFFF",
                  }}
                >
                  <GraduationCap className="h-6 w-6 text-sky-700" />
                </div>
                <span 
                  className="px-3.5 py-1 rounded-full text-sky-800 font-mono-label text-xs font-bold" 
                  style={{ 
                    transform: "translateZ(30px)",
                    background: "rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.15)",
                  }}
                >
                  Stage 1–5
                </span>
              </div>

              <div className="p-6 flex flex-col justify-between h-full bg-white/95">
                <div>
                  <h3 className="font-display font-doodle text-2xl font-bold text-slate-800 tracking-tight">
                    Checkpoint Exams
                  </h3>
                  <p className="mt-3.5 text-sm text-slate-600 leading-relaxed font-normal">
                    Timed Cambridge Primary Checkpoint paper simulator with auto-graded MCQs and instant score breakdown.
                  </p>
                </div>

                <div 
                  className="mt-6 p-4 rounded-2xl neu-inset bg-[#F8FAFD] border border-white flex items-center justify-between text-xs font-mono" 
                  style={{ transform: "translateZ(25px)" }}
                >
                  <span className="text-slate-700">Timer: <strong className="text-sky-700">45:00</strong></span>
                  <span className="text-emerald-700 font-semibold">Auto-Graded</span>
                </div>
              </div>
            </Card3DTilt>
          </Card3DScrollArc>

          {/* Card 4: Digital Worksheets (Orange Header) */}
          <Card3DScrollArc index={3} scrollProgress={smoothProgress}>
            <Card3DTilt hoverBorder="hover:border-amber-200">
              <div 
                className="p-6 flex items-center justify-between"
                style={{
                  background: "linear-gradient(135deg, #FED7AA 0%, #FDBA74 50%, #FDE047 100%)",
                  boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -2px 4px rgba(217, 119, 6, 0.2)",
                }}
              >
                <div 
                  className="h-12 w-12 rounded-2xl flex items-center justify-center" 
                  style={{ 
                    transform: "translateZ(30px)",
                    background: "radial-gradient(circle at 35% 30%, #FFFFFF, #FFEDD5)",
                    boxShadow: "0 6px 14px rgba(217, 119, 6, 0.2), inset 1px 1px 2px #FFFFFF",
                  }}
                >
                  <PenTool className="h-6 w-6 text-amber-700" />
                </div>
                <span 
                  className="px-3.5 py-1 rounded-full text-amber-900 font-mono-label text-xs font-bold" 
                  style={{ 
                    transform: "translateZ(30px)",
                    background: "rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 2px 6px rgba(217, 119, 6, 0.15)",
                  }}
                >
                  Digital Canvas
                </span>
              </div>

              <div className="p-6 flex flex-col justify-between h-full bg-white/95">
                <div>
                  <h3 className="font-display font-doodle text-2xl font-bold text-slate-800 tracking-tight">
                    Digital Worksheets
                  </h3>
                  <p className="mt-3.5 text-sm text-slate-600 leading-relaxed font-normal">
                    On-screen drawing canvas tools for solving geometry problems, measuring angles, and labeling science diagrams.
                  </p>
                </div>

                <div 
                  className="mt-6 p-4 rounded-2xl neu-inset bg-[#F8FAFD] border border-white flex items-center justify-between text-xs font-mono" 
                  style={{ transform: "translateZ(25px)" }}
                >
                  <span className="text-slate-700">Drawing Tool</span>
                  <span className="text-amber-700 font-semibold">Angle Mode: 45°</span>
                </div>
              </div>
            </Card3DTilt>
          </Card3DScrollArc>

        </div>
      </div>
    </section>
  );
}



function BentoCard({ className = "", tag, tagColor, title, description, icon, children, testid }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-testid={testid}
      className={`group relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-6 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${className}`}
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-emerald-500/0 group-hover:from-cyan-500/10 group-hover:to-emerald-500/10 transition-opacity pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className={`font-mono-label text-[10px] uppercase tracking-[0.22em] ${tagColor} font-bold`}>{tag}</span>
          {icon}
        </div>
        <h3 className="font-display font-bold text-xl lg:text-2xl tracking-tight text-white mt-4 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{description}</p>
        {children}
      </div>
    </motion.div>
  );
}

function MockTimer({ label, time, pct, color }) {
  const bgGrad = color === "cyan" ? "from-cyan-400 to-emerald-400" : "from-emerald-400 to-cyan-400";
  const iconColor = color === "cyan" ? "text-cyan-400" : "text-emerald-400";
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Timer className={`h-3.5 w-3.5 ${iconColor}`} />
        <span className="font-mono-label text-[9px] uppercase tracking-wider text-zinc-500 font-bold">{label}</span>
      </div>
      <div className="font-display font-bold text-[13px] sm:text-sm tabular-nums text-white">{time}</div>
      <div className="h-1 rounded-full bg-zinc-800 mt-2 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${bgGrad}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── 5. LEARNING JOURNEY ── */
function LearningJourney() {
  const STEPS = [
    {
      n: "01",
      title: "Pick your grade level.",
      body: "Choose your Cambridge Primary grade. We unlock the exact syllabus you need.",
    },
    {
      n: "02",
      title: "Learn with simulations.",
      body: "Read syllabus-matched notes, then explore the concept in a live, interactive simulation.",
    },
    {
      n: "03",
      title: "Practice with draw worksheets.",
      body: "Annotate diagrams, sketch graphs, attempt structured questions — just like the real paper.",
    },
    {
      n: "04",
      title: "Sit a timed exam.",
      body: "Take an auto-marked past paper under exam conditions. Get a syllabus-mapped breakdown.",
    },
  ];

  return (
    <section data-testid="journey-section" className="relative py-12 lg:py-16 bg-[#F8FAFC] border-y border-slate-200/80">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-600 font-bold px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-50 inline-block mb-3">
            · Learning journey
          </span>
          <h2 className="font-display font-doodle text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-3 leading-[1.05] text-slate-900">
            From first lesson to exam day — in four deliberate steps.
          </h2>
          <p className="text-slate-600 mt-5 leading-relaxed">
            Our methodology is built on years of working with top-scoring Cambridge international students.
            No fluff, no filler.
          </p>
        </div>

        <div className="lg:col-span-8 relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/40 via-purple-500/30 to-transparent pointer-events-none" />

          <div className="space-y-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                data-testid={`journey-step-${s.n}`}
                className="relative pl-16 animate-section-reveal"
              >
                <div className="absolute left-0 top-1 h-10 w-10 rounded-full border border-cyan-500/40 bg-white shadow-sm grid place-items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 animate-ping-glow" />
                </div>
                <div className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold">
                  Step {s.n}
                </div>
                <h3 className="font-display font-doodle text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                  {s.title}
                </h3>
                <p className="text-slate-600 mt-3 max-w-lg leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 6. SUBJECTS GRID ── */
function SubjectCard3DTilt({
  children,
  borderGlow = "",
}) {
  const cardRef = React.useRef(null);

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    // Controlled smooth mouse tilt
    setRotateX(-normY * 14);
    setRotateY(normX * 14);

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.45,
    });

    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-full cursor-pointer [perspective:1200px]"
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.025 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 22,
          mass: 0.5,
        }}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: isHovered
            ? "12px 18px 36px rgba(195, 207, 230, 0.5), -10px -10px 24px rgba(255, 255, 255, 0.95)"
            : "8px 12px 28px rgba(200, 212, 236, 0.35), -8px -8px 24px rgba(255, 255, 255, 0.95)",
        }}
        className={`
          group
          relative
          flex
          flex-col
          justify-between
          h-full
          min-h-[440px]
          overflow-hidden
          rounded-[28px]
          border
          border-white/80
          bg-gradient-to-b
          from-white
          to-[#F8FAFD]
          p-6
          transition-colors
          duration-300
          ${borderGlow}
        `}
      >
        {/* SPECULAR LIGHT GLARE OVERLAY */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-200 rounded-[28px]"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 70%)`,
          }}
        />

        {/* CLAY INNER BEVEL HIGHLIGHT */}
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-[28px]"
          style={{
            boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -2px 3px rgba(203, 213, 225, 0.25)",
          }}
        />

        {/* 3D PARALLAX CONTENT CONTAINER */}
        <div
          style={{
            transform: "translateZ(30px)",
            transformStyle: "preserve-3d",
          }}
          className="relative z-40 flex flex-col justify-between h-full"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function SubjectsGrid() {
  const SUBJECTS = [
    {
      id: "math",
      name: "Mathematics",
      subtitle: "Number • Geometry & Measure • Statistics & Probability",
      topics: 10,
      borderGlow: "hover:border-blue-300",
      iconBoxBg: "bg-blue-100/70 border-white text-blue-700 shadow-sm",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="2" width="16" height="20" rx="3" strokeWidth="2" />
          <line x1="8" y1="6" x2="16" y2="6" strokeWidth="2" />
          <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
      center3D: (
        <div className="relative w-full h-44 flex items-center justify-center">
          {/* 3D Clay Pedestal */}
          <div 
            className="absolute bottom-2 w-36 h-12 rounded-[100%] [transform:rotateX(68deg)] flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, #E0F2FE 0%, #BAE6FD 100%)",
              boxShadow: "0 8px 16px rgba(186, 230, 253, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.9)",
              border: "1.5px solid rgba(255, 255, 255, 0.8)",
            }}
          >
            <div className="w-24 h-8 rounded-[100%] bg-sky-200/50" />
          </div>
          {/* Floating 3D Clay Pi Symbol */}
          <motion.div
            animate={{ y: [-5, 5, -5], rotateY: [-6, 6, -6] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 text-6xl sm:text-7xl font-serif font-black flex items-center justify-center"
            style={{
              color: "#3B82F6",
              filter: "drop-shadow(0 6px 12px rgba(59, 130, 246, 0.25))",
              textShadow: "1px 1px 0 #93C5FD, 2px 2px 0 #60A5FA, 3px 3px 6px rgba(37, 99, 235, 0.3)",
            }}
          >
            π
          </motion.div>
        </div>
      )
    },
    {
      id: "science",
      name: "Science",
      subtitle: "Biology • Chemistry • Physics • Earth & Space",
      topics: 11,
      borderGlow: "hover:border-emerald-300",
      iconBoxBg: "bg-emerald-100/70 border-white text-emerald-700 shadow-sm",
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.785 2.87l1.7 3.4a2 2 0 001.785 1.11h9.4a2 2 0 001.785-1.11l1.7-3.4a2 2 0 00-.357-2.562zM12 3v9" />
        </svg>
      ),
      center3D: (
        <div className="relative w-full h-44 flex items-center justify-center">
          {/* 3D Clay Pedestal */}
          <div 
            className="absolute bottom-2 w-36 h-12 rounded-[100%] [transform:rotateX(68deg)] flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, #D1FAE5 0%, #A7F3D0 100%)",
              boxShadow: "0 8px 16px rgba(167, 243, 208, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.9)",
              border: "1.5px solid rgba(255, 255, 255, 0.8)",
            }}
          >
            <div className="w-24 h-8 rounded-[100%] bg-teal-200/50" />
          </div>
          {/* Floating 3D Beaker */}
          <motion.div
            animate={{ y: [-6, 4, -6] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center"
            style={{ filter: "drop-shadow(0 6px 12px rgba(16, 185, 129, 0.25))" }}
          >
            <svg className="w-24 h-28 text-emerald-500" viewBox="0 0 100 120" fill="none">
              <path d="M40 10 H60 V40 L85 90 A10 10 0 0 1 76 105 H24 A10 10 0 0 1 15 90 L40 40 Z" stroke="#10B981" strokeWidth="3.5" fill="rgba(16, 185, 129, 0.12)" />
              <path d="M24 75 Q 50 68, 76 75 L 78 92 A 5 5 0 0 1 73 98 H 27 A 5 5 0 0 1 22 92 Z" fill="url(#emeraldClayGrad)" opacity="0.9" />
              <circle cx="42" cy="62" r="3" fill="#34D399" className="animate-ping" />
              <circle cx="58" cy="52" r="2" fill="#6EE7B7" />
              <defs>
                <linearGradient id="emeraldClayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      )
    },
    {
      id: "english",
      name: "English",
      subtitle: "Reading • Writing • Speaking & Listening",
      topics: 16,
      borderGlow: "hover:border-purple-300",
      iconBoxBg: "bg-purple-100/70 border-white text-purple-700 shadow-sm",
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      center3D: (
        <div className="relative w-full h-44 flex items-center justify-center">
          {/* 3D Clay Pedestal */}
          <div 
            className="absolute bottom-2 w-36 h-12 rounded-[100%] [transform:rotateX(68deg)] flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, #EDE9FE 0%, #DDD6FE 100%)",
              boxShadow: "0 8px 16px rgba(221, 214, 254, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.9)",
              border: "1.5px solid rgba(255, 255, 255, 0.8)",
            }}
          >
            <div className="w-24 h-8 rounded-[100%] bg-violet-200/50" />
          </div>
          {/* Floating 3D "Aa" Text */}
          <motion.div
            animate={{ y: [-5, 5, -5], rotateY: [6, -6, 6] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 text-6xl sm:text-7xl font-display font-black flex items-center justify-center tracking-tighter"
            style={{
              color: "#8B5CF6",
              filter: "drop-shadow(0 6px 12px rgba(139, 92, 246, 0.25))",
              textShadow: "1px 1px 0 #C4B5FD, 2px 2px 0 #A78BFA, 3px 3px 6px rgba(109, 40, 217, 0.3)",
            }}
          >
            Aa
          </motion.div>
        </div>
      )
    },
    {
      id: "global",
      name: "Global Perspectives",
      subtitle: "Research • Analysis • Evaluation • Reflection",
      topics: 6,
      borderGlow: "hover:border-cyan-300",
      iconBoxBg: "bg-cyan-100/70 border-white text-cyan-700 shadow-sm",
      icon: (
        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 014-9z" />
        </svg>
      ),
      center3D: (
        <div className="relative w-full h-44 flex items-center justify-center">
          {/* 3D Clay Pedestal */}
          <div 
            className="absolute bottom-2 w-36 h-12 rounded-[100%] [transform:rotateX(68deg)] flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, #CFFAFE 0%, #A5F3FC 100%)",
              boxShadow: "0 8px 16px rgba(165, 243, 252, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.9)",
              border: "1.5px solid rgba(255, 255, 255, 0.8)",
            }}
          >
            <div className="w-24 h-8 rounded-[100%] bg-sky-200/50" />
          </div>
          {/* Floating 3D Globe */}
          <motion.div
            animate={{ y: [-5, 4, -5], rotate: 360 }}
            transition={{ y: { duration: 3.8, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 25, repeat: Infinity, ease: "linear" } }}
            className="relative z-10 flex items-center justify-center"
            style={{ filter: "drop-shadow(0 6px 12px rgba(6, 182, 212, 0.25))" }}
          >
            <svg className="w-24 h-24 text-cyan-500" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="42" stroke="#06B6D4" strokeWidth="3" fill="rgba(6, 182, 212, 0.12)" />
              <ellipse cx="50" cy="50" rx="42" ry="16" stroke="#06B6D4" strokeWidth="2" />
              <ellipse cx="50" cy="50" rx="16" ry="42" stroke="#06B6D4" strokeWidth="2" />
              <line x1="8" y1="50" x2="92" y2="50" stroke="#06B6D4" strokeWidth="2.5" />
              <path d="M 28 32 C 38 25, 45 35, 42 45 C 35 48, 26 42, 28 32 Z" fill="#22D3EE" />
              <path d="M 58 55 C 68 50, 78 58, 72 70 C 62 72, 58 64, 58 55 Z" fill="#22D3EE" />
            </svg>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <section id="subjects" data-testid="subjects-section" className="relative py-14 lg:py-20 bg-[#F4F6FC] border-t border-slate-200/50">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="font-mono-label text-[10.5px] uppercase tracking-[0.24em] text-cyan-700 font-semibold px-4 py-1.5 rounded-full neu-pill bg-[#FAFBFD] border border-white/90 inline-block mb-3.5">
            · CURRICULUM SUBJECTS
          </span>
          <h2 className="font-display font-doodle text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-800">
            Syllabus Aligned <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Subjects</span>
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Carefully crafted Cambridge Primary pathways with hands-on simulations.
          </p>
        </div>

        {/* 4-Column Soft Neumorphic Subject Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBJECTS.map((s) => (
            <SubjectCard3DTilt key={s.id} borderGlow={s.borderGlow}>
              <div className="flex items-center justify-between">
                <div 
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center ${s.iconBoxBg}`}
                  style={{
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 3px 6px rgba(0,0,0,0.04)"
                  }}
                >
                  {s.icon}
                </div>
                <div className="h-9 w-9 rounded-full neu-pill bg-[#FAFBFD] border border-white group-hover:bg-cyan-500 group-hover:text-white flex items-center justify-center text-slate-500 transition-all duration-300">
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>

              <div className="my-2 flex items-center justify-center">
                {s.center3D}
              </div>

              <div className="pt-3 border-t border-slate-200/50">
                <h3 className="font-display font-doodle font-bold text-2xl text-slate-800 tracking-tight leading-tight group-hover:text-cyan-700 transition-colors">
                  {s.name}
                </h3>
                <p className="text-slate-600 text-xs font-normal mt-1.5 leading-relaxed line-clamp-2">
                  {s.subtitle}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-inset bg-[#F8FAFD] border border-white text-slate-700">
                    <BarChart3 className="h-3.5 w-3.5 text-cyan-600" />
                    <span className="font-mono text-xs font-semibold tracking-wider">
                      {s.topics} Topics
                    </span>
                  </div>
                </div>
              </div>
            </SubjectCard3DTilt>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 7. TESTIMONIALS (Clean 3-Card Grid Layout) ── */
function Testimonials() {
  const TESTIMONIAL_DATA = [
    {
      quote: "The Platform is really intractive and as a teacher from this platform i am able to make classrooms also.",
      name: "Shruti Mishra",
      role: "Cambridge science teacher, ALLENHOUSE PUBLIC SCHOOL",
      img: "/shruti_mishra.png",
    },
    {
      quote: "The mock test was really helpful and i personaly like the simulations provided in this platform.",
      name: "Abhinandan Srivastava",
      role: "Parent",
      img: "/abhinandan_srivastava.png",
    },
    {
      quote: "I really like Mentara Learning It makes learning fun and easy. The games and simulations help me understand things better. I enjoy using it for my studies! 😊",
      name: "Janvi Singh",
      role: "Stage 5 Student",
      img: "/janvi_singh.png",
    },
  ];

  return (
    <section id="testimonials" data-testid="testimonials-section" className="relative py-14 lg:py-20 bg-[#F4F6FC] border-y border-slate-200/50">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <span className="font-mono-label text-[10.5px] uppercase tracking-[0.24em] text-cyan-700 font-semibold px-4 py-1.5 rounded-full neu-pill bg-[#FAFBFD] border border-white/90 inline-block mb-3.5">
            · STUDENT STORIES
          </span>
          <h2 className="font-display font-doodle text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-800">
            Results That Speak Louder Than <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Marketing Copy</span>
          </h2>
        </div>

        {/* 3-Card Neumorphic Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIAL_DATA.map((t, i) => (
            <div
              key={i}
              data-testid={`testimonial-${i}`}
              className="group relative rounded-[26px] border border-white/80 neu-card-soft p-7 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5-Star Rating with Soft Amber Clay Tone */}
                <div className="flex items-center gap-1.5 mb-5">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star key={starIdx} className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-xs" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-600 leading-relaxed text-[15px] font-normal">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-8 flex items-center gap-3.5 pt-5 border-t border-slate-200/60">
                <div 
                  className="relative h-11 w-11 rounded-full overflow-hidden shrink-0"
                  style={{
                    boxShadow: "0 4px 10px rgba(148, 163, 184, 0.25), inset 0 2px 3px rgba(255, 255, 255, 0.8)",
                    border: "2px solid #FFFFFF",
                  }}
                >
                  <img src={t.img} alt={t.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="font-display font-doodle font-bold text-sm text-slate-800 group-hover:text-cyan-700 transition-colors">
                    {t.name}
                  </div>
                  <div className="font-mono-label text-[11px] text-slate-500 font-medium mt-0.5">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ── 8. PRICING ── */
function Pricing() {
  const [dynSettings, setDynSettings] = React.useState({
    premium_price: "65",
    premium_currency: "$",
    premium_billing_period: "/ year",
    premium_discount: "40",
    student_premium_price: "39",
    student_premium_discount: "40"
  });

  React.useEffect(() => {
    studentApi.getSettings()
      .then(res => {
        const data = res.data?.data ?? res.data;
        if (data) {
          setDynSettings({
            premium_price: data.premium_price || "65",
            premium_currency: data.premium_currency || "$",
            premium_billing_period: data.premium_billing_period || "/ year",
            premium_discount: data.premium_discount || "40",
            student_premium_price: data.student_premium_price || "39",
            student_premium_discount: data.student_premium_discount || "40"
          });
        }
      })
      .catch(() => {});
  }, []);

  const currency = dynSettings.premium_currency;
  const billingPeriod = dynSettings.premium_billing_period;

  // Teacher pricing
  const teacherOriginal = parseFloat(dynSettings.premium_price) || 0;
  const teacherDiscountPct = parseFloat(dynSettings.premium_discount) || 0;
  const teacherHasDiscount = teacherDiscountPct > 0 && teacherDiscountPct <= 100;
  const teacherDiscounted = teacherHasDiscount ? Math.round(teacherOriginal * (1 - teacherDiscountPct / 100)) : teacherOriginal;
  const teacherSavings = teacherOriginal - teacherDiscounted;

  // Student pricing
  const studentOriginal = parseFloat(dynSettings.student_premium_price) || 0;
  const studentDiscountPct = parseFloat(dynSettings.student_premium_discount) || 0;
  const studentHasDiscount = studentDiscountPct > 0 && studentDiscountPct <= 100;
  const studentDiscounted = studentHasDiscount ? Math.round(studentOriginal * (1 - studentDiscountPct / 100)) : studentOriginal;
  const studentSavings = studentOriginal - studentDiscounted;

  const PLANS = [
    {
      id: "free",
      name: "Free",
      badge: null,
      price: "Free",
      originalPrice: null,
      discountBadge: null,
      savingsAmount: null,
      sub: "Forever",
      description: "Get started with basic access to platform resources.",
      features: [
        "Limited question bank",
        "Limited practice tests",
        "Limited interactive simulations",
        "Explore the platform’s core features",
        "Perfect for getting started",
      ],
      cta: "Start free",
      highlight: false,
    },
    {
      id: "student",
      name: "Student",
      badge: "Most Popular",
      price: `${currency}${studentDiscounted}`,
      originalPrice: studentHasDiscount ? `${currency}${studentOriginal}` : null,
      discountBadge: studentHasDiscount ? `${studentDiscountPct}% OFF` : null,
      savingsAmount: studentHasDiscount ? `${currency}${studentSavings}` : null,
      sub: billingPeriod,
      description: "Everything a serious Cambridge Primary student needs to top their checkpoint tests.",
      features: [
        "Unlimited access to interactive simulations",
        "Complete access to all subjects & learning content",
        "Drawable worksheets with annotation tools",
        "Downloadable notes, worksheets & resources",
        "Student analytics & priority support",
      ],
      cta: "Get started as a student",
      highlight: true,
    },
    {
      id: "teacher",
      name: "Teacher",
      badge: null,
      price: `${currency}${teacherDiscounted}`,
      originalPrice: teacherHasDiscount ? `${currency}${teacherOriginal}` : null,
      discountBadge: teacherHasDiscount ? `${teacherDiscountPct}% OFF` : null,
      savingsAmount: teacherHasDiscount ? `${currency}${teacherSavings}` : null,
      sub: billingPeriod,
      description: "Equip your classroom with interactive teaching tools, drawable explanations, and real-time simulators.",
      features: [
        "Complete access to all subjects & teaching content",
        "Interactive digital whiteboard",
        "Unlimited access to interactive simulations",
        "Teacher dashboard with student analytics",
        "Cambridge teaching resources & pedagogy guides",
        "Teaching support materials and classroom strategies",
      ],
      cta: "Get started as a teacher",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" data-testid="pricing-section" className="relative z-20 pt-12 sm:pt-16 pb-16 bg-[#F4F6FC] border-t border-slate-200/50">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mb-10">
          <span className="font-mono-label text-[10.5px] uppercase tracking-[0.24em] text-emerald-700 font-semibold px-4 py-1.5 rounded-full neu-pill bg-[#FAFBFD] border border-white/90 inline-block mb-3.5">
            · PRICING PLANS
          </span>
          <h2 className="font-display font-doodle text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-1 leading-[1.05] text-slate-800">
            Premium learning,{" "}
            <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              honestly priced.
            </span>
          </h2>
          <p className="text-slate-600 mt-2.5 text-base font-normal">No hidden fees. Built for learners and teachers alike.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-6 items-stretch">
          {PLANS.map((p) => (
            <div
              key={p.id}
              data-testid={`plan-${p.id}`}
              className={`relative rounded-[28px] border p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between ${
                p.highlight
                  ? "border-cyan-300 bg-gradient-to-b from-white via-[#F0F7FF] to-white neu-card-soft ring-2 ring-cyan-300/40"
                  : p.id === "teacher"
                  ? "border-white/80 bg-gradient-to-b from-white to-[#FBF9FE] neu-card-soft hover:border-violet-200"
                  : "border-white/80 bg-white neu-card-soft hover:border-slate-200"
              }`}
            >
              {/* Clay Pill Badge */}
              {p.badge && (
                <div 
                  className="absolute -top-3.5 left-6 px-4 py-1 rounded-full text-[9.5px] font-mono-label uppercase tracking-[0.2em] text-white font-bold"
                  style={{
                    background: "radial-gradient(circle at 35% 30%, #38BDF8, #6366F1)",
                    boxShadow: "0 6px 14px rgba(99, 102, 241, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.6), inset 0 -2px 3px rgba(79, 70, 229, 0.2)",
                  }}
                >
                  {p.badge}
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className={`font-mono-label text-xs uppercase tracking-[0.24em] font-bold ${
                    p.highlight ? "text-cyan-700" : p.id === "teacher" ? "text-violet-700" : "text-slate-500"
                  }`}>
                    {p.name}
                  </span>
                </div>

                {/* Price Block */}
                <div className="mt-3 space-y-1">
                  {/* Original price row */}
                  <div className="h-5 flex items-center gap-2">
                    {p.originalPrice ? (
                      <>
                        <span className="text-xs line-through text-slate-400 font-medium">{p.originalPrice}</span>
                        <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                          {p.discountBadge}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10.5px] text-slate-400 font-mono-label uppercase tracking-wider font-semibold">Standard Access</span>
                    )}
                  </div>

                  {/* Main Price display */}
                  <div className="flex items-baseline gap-2">
                    <span className={`font-display font-doodle text-4xl sm:text-5xl font-bold tracking-tight ${
                      p.highlight
                        ? "bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                        : p.id === "teacher"
                        ? "text-violet-800"
                        : "text-slate-800"
                    }`}>
                      {p.price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{p.sub}</span>
                  </div>

                  {/* Savings pill row */}
                  <div className="h-6 flex items-center pt-0.5">
                    {p.savingsAmount ? (
                      <div className={`text-[11px] font-medium flex items-center gap-1 rounded-full py-0.5 px-3 border ${
                        p.highlight
                          ? "text-emerald-700 bg-emerald-50/80 border-emerald-200 shadow-xs"
                          : "text-violet-700 bg-violet-50/80 border-violet-200 shadow-xs"
                      }`}>
                        <span>🎉 You save {p.savingsAmount} instantly</span>
                      </div>
                    ) : (
                      <div className="text-[11px] font-medium text-slate-500 rounded-full py-0.5 px-3 border border-slate-200 bg-slate-50">
                        ✓ Free forever
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed min-h-[36px]">{p.description}</p>

                {/* Divider */}
                <div className={`my-3.5 h-px w-full ${
                  p.highlight ? "bg-cyan-100" : p.id === "teacher" ? "bg-violet-100" : "bg-slate-200/50"
                }`} />

                {/* Features Checklist */}
                <ul className="space-y-2.5 pb-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        p.highlight 
                          ? "bg-cyan-100/70 text-cyan-700 border border-cyan-200" 
                          : p.id === "teacher" 
                          ? "bg-purple-100/70 text-violet-700 border border-purple-200"
                          : "bg-emerald-100/70 text-emerald-700 border border-emerald-200"
                      }`}>
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="font-normal leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Pinned CTA Button */}
              <div className="pt-3 border-t border-slate-200/50 mt-auto">
                <Link
                  to="/register"
                  data-testid={`plan-cta-${p.id}`}
                  className={`inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    p.highlight
                      ? "clay-pill text-white hover:opacity-95"
                      : p.id === "teacher"
                      ? "neu-pill bg-[#FAFBFD] border border-white text-violet-700 hover:bg-violet-50"
                      : "neu-pill bg-[#FAFBFD] border border-white text-slate-700 hover:bg-slate-50"
                  }`}
                  style={p.highlight ? {
                    background: "radial-gradient(circle at 35% 30%, #38BDF8, #6366F1)",
                  } : {}}
                >
                  {p.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ── 9. FAQ ── */
function FAQ() {
  const FAQS = [
    {
      q: "Which curriculum do you support?",
      a: "Today we fully and exclusively support the Cambridge Primary curriculum (Grades 1 to 5) covering Primary Science, Mathematics, and English.",
    },
    {
      q: "Are the simulations syllabus-aligned?",
      a: "Yes. Every simulation is tagged to specific syllabus points. When you study a topic, the relevant simulations surface automatically. Built and verified by examiners.",
    },
    {
      q: "How realistic are the auto-timed exams?",
      a: "We replicate official exam conditions — strict timers, no pause, official paper format, the same command terms. Marking uses a hybrid of pattern-matching for structured answers and rubric-based scoring for long responses.",
    },
    {
      q: "Can I use the draw tools on a tablet?",
      a: "Absolutely. The draw tools are pressure-sensitive on iPad and Apple Pencil, and fully usable on Android with Samsung S-Pen. Mouse drawing on desktop works smoothly too.",
    },
    {
      q: "Is there a free trial?",
      a: "The Explorer plan is free forever with limited access. The Scholar plan includes a 7-day full-access trial — no credit card required.",
    },
    {
      q: "Do teachers and schools have a separate plan?",
      a: "Yes — our Institution plan includes teacher dashboards, classroom rosters, assignment tracking, custom branding and a dedicated success manager. Reach out to sales.",
    },
  ];

  return (
    <section id="faq" data-testid="faq-section" className="relative py-14 lg:py-20 bg-[#F4F6FC] border-t border-slate-200/50">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-mono-label text-[10.5px] uppercase tracking-[0.24em] text-cyan-700 font-semibold px-4 py-1.5 rounded-full neu-pill bg-[#FAFBFD] border border-white/90 inline-block mb-3.5">
            · FREQUENTLY ASKED
          </span>
          <h2 className="font-display font-doodle text-4xl sm:text-5xl font-bold tracking-tighter mt-1 leading-[1.05] text-slate-800">
            Questions, answered.
          </h2>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a, i }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      data-testid={`faq-item-${i}`}
      className="border border-white/80 neu-card-soft rounded-2xl px-6 hover:border-cyan-200 transition-all duration-200"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left font-display font-doodle font-semibold text-base text-slate-800 py-5"
      >
        <span>{q}</span>
        <div className="w-7 h-7 rounded-full neu-pill bg-[#FAFBFD] border border-white flex items-center justify-center shrink-0 ml-3">
          <ChevronRight className={`h-4 w-4 text-cyan-600 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="text-slate-600 leading-relaxed text-[14.5px] pb-5 pt-1 border-t border-slate-100">
          {a}
        </div>
      )}
    </div>
  );
}

function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const COLS = [
    { title: "Platform", links: ["Simulations", "Worksheets", "Auto Exams", "Analytics"] },
    { title: "Curriculum", links: ["Cambridge Primary Science", "Cambridge Primary Math", "Cambridge Primary English", "Cambridge Global Perspectives"] },
    { title: "Company", links: ["About", "Educators", "Careers"] },
    { title: "Resources", links: ["Blog", "Help center"] },
  ];

  return (
    <>
      <footer data-testid="site-footer" className="relative pt-12 pb-8 bg-[#FAFBFD] border-t border-slate-200/50 overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[60%] bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-[1480px] mx-auto px-6 lg:px-12 relative">
          {/* Links grid */}
          <div className="grid lg:grid-cols-12 gap-10 pb-8">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <img src="/mentara-new.png" alt="Mentara Learning Logo" className="h-9 w-9 object-contain" />
                <span className="font-display font-doodle font-bold text-[20px] tracking-tight animate-live-logo-gradient">Mentara Learning</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm font-normal">
                Interactive 3D labs, practice worksheets, and Cambridge Primary tools crafted to help every student learn with joy and confidence.
              </p>
              <div className="flex items-center gap-3 mt-6">
                {[
                  { icon: Instagram, href: "https://www.instagram.com/mentaralabsmentp/?hl=en", label: "Instagram" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                  { icon: Youtube, href: "#", label: "YouTube" },
                ].map(({ icon: Icon, href, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    target={href !== "#" ? "_blank" : undefined}
                    rel={href !== "#" ? "noopener noreferrer" : undefined}
                    data-testid={`social-${i}`}
                    aria-label={label}
                    className="h-9 w-9 rounded-full border border-white neu-pill bg-[#FAFBFD] grid place-items-center text-slate-500 hover:text-cyan-700 hover:border-cyan-200 transition-all"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {COLS.map((c) => (
                <div key={c.title}>
                  <div className="font-mono-label text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-4 font-semibold">
                    {c.title}
                  </div>
                  <ul className="space-y-2.5">
                    {c.links.map((l) => (
                      <li key={l}>
                        <a href="#" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors font-medium">
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="font-mono-label text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">
              © 2026 Mentara Learning · All rights reserved
            </div>
            <div className="flex items-center gap-5 text-[12px] text-slate-500 font-medium">
              <button onClick={() => setActiveModal("privacy")} className="hover:text-slate-800 transition-colors">Privacy Policy</button>
              <button onClick={() => setActiveModal("terms")} className="hover:text-slate-800 transition-colors">Terms of Service</button>
              <button onClick={() => setActiveModal("cookies")} className="hover:text-slate-800 transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Acceptance Banner */}
      <CookieBanner onOpenPolicy={() => setActiveModal("cookies")} />

      {/* Interactive Legal Modal */}
      {activeModal && (
        <LegalModal type={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}

function CookieBanner({ onOpenPolicy }) {
  const [accepted, setAccepted] = useState(() => {
    try {
      const localConsent = localStorage.getItem("mentara_cookie_consent");
      const cookieConsent = document.cookie
        .split("; ")
        .find((row) => row.startsWith("mentara_cookie_consent="));
      if (localConsent || cookieConsent) {
        if (!localConsent && cookieConsent) {
          localStorage.setItem("mentara_cookie_consent", "true");
        }
        if (localConsent && !cookieConsent) {
          document.cookie = "mentara_cookie_consent=true; path=/; max-age=31536000; SameSite=Lax";
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  const saveConsent = (status = "true") => {
    try {
      localStorage.setItem("mentara_cookie_consent", status);
      document.cookie = `mentara_cookie_consent=${status}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.error("Failed to save cookie consent", e);
    }
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-5 right-5 left-5 md:left-auto md:max-w-md z-[90] bg-zinc-950/95 border border-cyan-500/30 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">🍪</span>
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm text-white">We Value Your Privacy</h4>
            <button
              onClick={() => saveConsent("dismissed")}
              className="text-zinc-500 hover:text-zinc-300 p-1 -mr-1 -mt-1 rounded transition-colors cursor-pointer"
              aria-label="Dismiss cookie notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            Mentara Learning uses essential cookies to preserve your login session, progress, and preferences across Cambridge Primary modules.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => saveConsent("true")}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-bold text-xs hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all cursor-pointer"
            >
              Accept Cookies
            </button>
            <button
              onClick={onOpenPolicy}
              className="text-xs text-zinc-400 hover:text-white font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegalModal({ type, onClose }) {
  if (!type) return null;

  const CONTENT = {
    privacy: {
      title: "Privacy Policy",
      updated: "Last updated: August 2026",
      text: (
        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          <p>At Mentara Learning, we take student and user data privacy very seriously. This Privacy Policy explains how we collect, use, and safeguard information when you use our platform.</p>
          <h4 className="font-bold text-white text-base">1. Student Data Protection</h4>
          <p>We strictly adhere to student data protection standards. We do not sell student data, show targeted ads, or share personal information with unauthorized third parties.</p>
          <h4 className="font-bold text-white text-base">2. Information We Collect</h4>
          <p>We collect essential account details (such as email address, name, and role) and learning progress analytics to deliver personalized Cambridge Primary practice.</p>
          <h4 className="font-bold text-white text-base">3. Security & Encryption</h4>
          <p>All transmitted data is protected using industry-standard 256-bit SSL encryption and secure cloud database infrastructure.</p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      updated: "Last updated: August 2026",
      text: (
        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          <p>By accessing or using Mentara Learning, you agree to comply with and be bound by the following terms and conditions of use.</p>
          <h4 className="font-bold text-white text-base">1. Platform Usage & License</h4>
          <p>Mentara Learning grants subscribed students, parents, and teachers a non-exclusive, non-transferable license to access interactive labs, drawing worksheets, and practice resources.</p>
          <h4 className="font-bold text-white text-base">2. Account Responsibility</h4>
          <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
          <h4 className="font-bold text-white text-base">3. Intellectual Property</h4>
          <p>All interactive 3D simulations, Cambridge Primary practice worksheets, and platform software are the exclusive intellectual property of Mentara Learning.</p>
        </div>
      )
    },
    cookies: {
      title: "Cookie Policy",
      updated: "Last updated: August 2026",
      text: (
        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          <p>Mentara Learning uses essential cookies and browser local storage to provide a seamless learning experience.</p>
          <h4 className="font-bold text-white text-base">1. Essential Cookies</h4>
          <p>Necessary for user authentication, session security, and preserving your active learning state across interactive modules.</p>
          <h4 className="font-bold text-white text-base">2. Performance & Preference Cookies</h4>
          <p>Used to remember your preferences (such as audio settings and theme choices) and improve platform load speeds.</p>
          <h4 className="font-bold text-white text-base">3. Managing Cookies</h4>
          <p>You can choose to disable cookies through your browser settings, though certain interactive features may require cookies to function properly.</p>
        </div>
      )
    }
  };

  const item = CONTENT[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-display font-bold text-xl text-white">{item.title}</h3>
            <span className="text-xs text-zinc-500 font-mono-label">{item.updated}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="py-6 overflow-y-auto space-y-4 pr-1">
          {item.text}
        </div>
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}



/* ── 12. INTERACTIVE PRODUCT DETAILS (LAPTOP MOCKUP WITH CONNECTORS) ── */
function ProductDetails() {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [cycleIndex, setCycleIndex] = useState(0);

  const CYCLE_ITEMS = ["curriculum", "worksheets", "simulations", "exams", "papers", "analytics"];

  useEffect(() => {
    if (hoveredItem) return; // Pause cycle on hover
    const timer = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % CYCLE_ITEMS.length);
    }, 4000); // Shift every 4 seconds
    return () => clearInterval(timer);
  }, [hoveredItem]);

  const activeItem = hoveredItem || CYCLE_ITEMS[cycleIndex];

  const FEATURE_ITEMS = [
    {
      id: "curriculum",
      title: "Interactive Board",
      desc: "Write, draw, and explain live with drawing and laser pens.",
      icon: Presentation,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      bdr: "border-cyan-500/30",
      x: 10, y: 70,
      side: "left"
    },
    {
      id: "worksheets",
      title: "Digital Worksheets",
      desc: "Interactive drawable worksheets to practice concepts.",
      icon: PenTool,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      bdr: "border-emerald-500/30",
      x: 10, y: 210,
      side: "left"
    },
    {
      id: "simulations",
      title: "Simulations",
      desc: "Live 3D environments making lessons effective.",
      icon: Atom,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      bdr: "border-indigo-500/30",
      x: 10, y: 350,
      side: "left"
    },
    {
      id: "exams",
      title: "Geometry Tools",
      desc: "Draw angles and measure lengths with virtual rulers and protractors.",
      icon: Compass,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      bdr: "border-rose-500/30",
      x: 410, y: 70,
      side: "right"
    },
    {
      id: "papers",
      title: "Difficulty Levels",
      desc: "Questions aligned with Foundation, Developing, and Secure stages.",
      icon: BarChart3,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      bdr: "border-amber-500/30",
      x: 410, y: 210,
      side: "right"
    },
    {
      id: "analytics",
      title: "Learning Analytics",
      desc: "Granular reporting mapping masteries and velocity.",
      icon: LineChart,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      bdr: "border-violet-500/30",
      x: 410, y: 350,
      side: "right"
    }
  ];

  return (
    <section className="py-8 bg-zinc-950/60 relative border-b border-white/5">
      
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-6">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-400">
            · PLATFORM HIGHLIGHTS
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-3 text-white leading-tight">
            Everything You Need to <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Teach, Learn, Practice & Excel</span>
          </h2>
          <p className="text-zinc-400 mt-4 text-sm sm:text-base max-w-xl mx-auto">
            Mentara Learning brings the complete Cambridge Primary suite onto one smart, interactive platform built for both educators and students.
          </p>
        </div>

        {/* Feature Dashboard Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[580px] bg-zinc-900/10 border border-white/5 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
          
          {/* SVG Connecting Lines Overlay (High-Tech Circuit & Glowing Pulse Effect) */}
          <svg 
            className="absolute inset-0 pointer-events-none z-10 hidden lg:block overflow-visible" 
            viewBox="0 0 1000 500"
            width="100%"
            height="100%"
            style={{ mixBlendMode: 'screen' }}
          >
            <defs>
              {/* Intense Neon Blur Filter */}
              <filter id="cyber-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur1" />
                <feGaussianBlur stdDeviation="8" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              {/* Gradients */}
              <linearGradient id="left-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="right-gradient" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {FEATURE_ITEMS.map((f) => {
              const isActive = activeItem === f.id;
              
              // Calculate side index based on filtered side elements to prevent indexing offsets
              const sideItems = FEATURE_ITEMS.filter(item => item.side === f.side);
              const sideIndex = sideItems.findIndex(item => item.id === f.id);
              
              // Circuit coordinates aligned with card border edges
              const startX = f.side === "left" ? 275 : 725;
              const startY = 80 + sideIndex * 170;
                
              const targetX = f.side === "left" ? 385 : 615;
              const targetY = 250; // Centralized target y to land on center laptop height
              
              // Midpoint offset to draw the circuit orthogonal bend
              const midX = f.side === "left" ? startX + 30 : startX - 30;
              const pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
              
              // Robotic sleek colors: thin cybernetic accents
              const baseColor = f.side === "left" ? "#06b6d4" : "#a855f7";
              const gradientId = f.side === "left" ? "url(#left-gradient)" : "url(#right-gradient)";

              return (
                <g key={f.id} className="transition-all duration-500">
                  {/* Circuit Board Trace Lines (Robotic Slate/Gray Wire style) */}
                  <path
                    d={pathData}
                    stroke={isActive ? baseColor : "rgba(255,255,255,0.06)"}
                    strokeWidth={isActive ? "1.2" : "0.6"}
                    fill="none"
                    className="transition-all duration-300"
                  />

                  {/* Micro Cyber Neon Glow Overlay (Low Opacity for Sleek HUD Aesthetic) */}
                  {isActive && (
                    <>
                      <path
                        d={pathData}
                        stroke={baseColor}
                        strokeWidth="2.2"
                        fill="none"
                        filter="url(#cyber-glow)"
                        opacity="0.35"
                        strokeLinecap="round"
                      />
                      
                      {/* Animated Tiny Data Pulse Point */}
                      <circle r="2.5" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 4px ' + baseColor + ')' }}>
                        <animateMotion
                          path={pathData}
                          dur="3s"
                          repeatCount="indefinite"
                          keyPoints="0;1"
                          keyTimes="0;1"
                        />
                      </circle>
                    </>
                  )}

                  {/* Micro circuit terminal node dot on the laptop screen edge */}
                  <circle
                    cx={targetX}
                    cy={targetY}
                    r={isActive ? 3.5 : 1.5}
                    fill={isActive ? "#ffffff" : "rgba(255,255,255,0.1)"}
                    stroke={baseColor}
                    strokeWidth="1"
                    className="transition-all duration-300"
                    opacity={isActive ? 0.9 : 0.2}
                  />
                  
                  {/* Subtle outer ping ring around active screen terminal node */}
                  {isActive && (
                    <circle
                      cx={targetX}
                      cy={targetY}
                      r="7"
                      fill="none"
                      stroke={baseColor}
                      strokeWidth="0.8"
                      className="animate-ping"
                      opacity="0.3"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Left Column Features */}
          <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
            {FEATURE_ITEMS.filter(f => f.side === "left").map((f) => {
              const Icon = f.icon;
              const isCardActive = activeItem === f.id;
              return (
                <div 
                  key={f.id}
                  onMouseEnter={() => setHoveredItem(f.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isCardActive 
                      ? "bg-white/[0.04] border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.08)] translate-x-2" 
                      : "bg-white/[0.01] border-white/5"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center border shrink-0 transition-all ${isCardActive ? "scale-110 shadow-lg" : ""} ${f.bg} ${f.bdr}`}>
                    <Icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <div>
                    <h4 className={`font-display text-sm font-bold transition-colors ${isCardActive ? "text-cyan-400" : "text-white"}`}>{f.title}</h4>
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Column: Interactive Laptop Diagram with SVG Connecting Lines */}
          <div className="lg:col-span-6 flex justify-center items-center order-1 lg:order-2 py-8 relative">
            
            {/* Laptop Vector Wrap */}
            <div className="w-[310px] sm:w-[410px] md:w-[460px] flex flex-col items-center">
              {/* Screen Body */}
              <div className="w-full aspect-[16/10] bg-zinc-900 rounded-t-2xl p-2.5 border-t border-x border-white/10 shadow-2xl relative">
                {/* Internal Screen Content (Dashboard Simulation Panels) */}
                <div className="w-full h-full bg-zinc-950 rounded-lg overflow-hidden border border-white/5 relative flex">
                  <AnimatePresence mode="wait">
                    {/* Active Curriculum Preview (Interactive Whiteboard Mockup) */}
                    {activeItem === "curriculum" && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#08090d] flex flex-col p-3.5 justify-between z-10"
                      >
                        <div className="text-[7.5px] font-mono font-bold text-cyan-400 tracking-wider">04 · TEACHER INTERACTIVE WHITEBOARD</div>
                        <div className="flex-1 flex flex-col gap-2 mt-2 bg-zinc-950/60 rounded-xl border border-white/5 p-2 relative overflow-hidden">
                          {/* Toolbar overlay */}
                          <div className="absolute left-1.5 top-1.5 flex flex-col gap-1 bg-zinc-900/90 border border-white/10 p-1 rounded z-20">
                            <span className="w-2 h-2 rounded bg-cyan-400" />
                            <span className="w-2 h-2 rounded bg-emerald-400" />
                            <span className="w-2 h-2 rounded bg-white/20" />
                          </div>
                          {/* Board drawing simulator */}
                          <div className="flex-1 flex flex-col justify-center items-center relative">
                            {/* SVG drawing simulation */}
                            <svg className="w-full h-full absolute inset-0 text-cyan-400/80" viewBox="0 0 200 100">
                              <motion.path 
                                d="M 30 50 Q 100 20 170 50" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="1.5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                              />
                              <text x="50" y="80" fill="#a1a1aa" fontSize="7" fontWeight="bold">Concept: Friction & Gravity</text>
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Active Past Papers Preview (Topic & Question Difficulty Levels) */}
                    {activeItem === "papers" && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#08090d] flex flex-col p-3.5 justify-between z-10"
                      >
                        <div className="text-[7.5px] font-mono font-bold text-amber-400 tracking-wider">05 · DIFFICULTY LEVEL ALIGNMENT</div>
                        
                        <div className="flex-1 flex flex-col gap-2 mt-2 bg-zinc-950/60 rounded-xl border border-white/5 p-2.5 overflow-hidden">
                          <div className="flex items-center justify-between border-b border-white/5 pb-1">
                            <span className="text-[8px] font-bold text-white">Syllabus Progress Stages</span>
                            <span className="text-[6.5px] font-semibold text-amber-400">Levels</span>
                          </div>

                          <div className="flex-1 flex flex-col gap-1.5 justify-center">
                            {[
                              { stage: "Foundation Stage", desc: "Core concepts & simple items", badge: "Easy", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                              { stage: "Developing Stage", desc: "Syllabus practice & workflows", badge: "Medium", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                              { stage: "Secure Stage", desc: "Complex problems & checkpoint items", badge: "Hard", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
                            ].map((level, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-1.5 rounded border border-white/5">
                                <div className="flex flex-col">
                                  <span className="text-[7px] text-zinc-300 font-bold leading-none">{level.stage}</span>
                                  <span className="text-[5.5px] text-zinc-500 leading-none mt-0.5">{level.desc}</span>
                                </div>
                                <span className={`text-[5px] px-1 py-0.5 rounded-sm font-bold border ${level.color}`}>
                                  {level.badge}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                  {/* Active Analytics Preview */}
                    {activeItem === "analytics" && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-zinc-950 flex flex-col justify-center items-center p-4 z-10"
                      >
                        <div className="absolute top-2 left-2 text-[7px] font-mono font-bold text-violet-400 tracking-wider">06 · REALTIME LEARNING METRICS</div>
                        <div className="w-[140px] bg-white/[0.01] border border-white/10 rounded-xl p-3 flex gap-2 items-end justify-around h-[70px] shadow-2xl">
                          <motion.div className="w-2.5 bg-violet-500/80 rounded-t" initial={{ height: 0 }} animate={{ height: 28 }} transition={{ duration: 1 }} />
                          <motion.div className="w-2.5 bg-cyan-500/80 rounded-t" initial={{ height: 0 }} animate={{ height: 42 }} transition={{ duration: 1, delay: 0.15 }} />
                          <motion.div className="w-2.5 bg-emerald-500/80 rounded-t" initial={{ height: 0 }} animate={{ height: 35 }} transition={{ duration: 1, delay: 0.3 }} />
                          <motion.div className="w-2.5 bg-rose-500/80 rounded-t" initial={{ height: 0 }} animate={{ height: 18 }} transition={{ duration: 1, delay: 0.45 }} />
                        </div>
                        <span className="text-[7px] text-zinc-500 font-bold mt-2 uppercase tracking-wide">Accuracy & mastery trends</span>
                      </motion.div>
                    )}

                  {/* Active Simulation Preview (Realistic Solar System Orbit Animation) */}
                    {activeItem === "simulations" && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#010103] flex flex-col items-center justify-center z-10 overflow-hidden"
                      >
                        <div className="absolute top-2 left-2 text-[7px] font-mono font-bold text-amber-400 tracking-wider">01 · ACTIVE SOLAR SYSTEM SIMULATOR</div>
                        
                        {/* Interactive Space Container */}
                        <div className="w-[180px] h-[115px] relative flex items-center justify-center">
                          {/* Rich Stars Field */}
                          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:10px_10px]" />
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,#ffffff_1.2px,transparent_1.2px)] bg-[size:24px_24px]" />
                          
                          {/* Sun (Realistic Glowing Core with flares) */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 shadow-[0_0_30px_rgba(253,224,71,0.8),0_0_60px_rgba(245,158,11,0.4)] z-10 absolute flex items-center justify-center">
                            {/* Inner core brightness */}
                            <div className="w-6 h-6 rounded-full bg-white/40 blur-[1px]" />
                          </div>

                          {/* Earth Orbit Ring (Glowing elliptical path) */}
                          <div className="absolute border border-cyan-500/10 rounded-full w-[120px] h-[80px] rotate-[-12deg]" />

                          {/* Earth & Moon System container (revolving around Sun) */}
                          <motion.div 
                            className="absolute w-[120px] h-[80px] rotate-[-12deg] flex items-center"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                          >
                            {/* Earth body (with day/night shadow boundary matching Sun direction) */}
                            <div className="absolute right-0 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] flex items-center justify-center overflow-hidden border border-cyan-400/20">
                              {/* Green continent details */}
                              <div className="absolute -left-1 w-2.5 h-2 bg-emerald-500 rounded-full opacity-60 blur-[0.5px]" />
                              <div className="absolute bottom-0 right-0 w-2 h-1.5 bg-emerald-500 rounded-full opacity-50 blur-[0.5px]" />
                              
                              {/* Night shadow side (overlay) - always faces away from the Sun (left side is illuminated as Earth orbits, but since it revolves inside container, we align the gradient dynamically to point outward) */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/25 to-black/90 pointer-events-none" />
                            </div>

                            {/* Moon System (positioned relative to Earth offset) */}
                            <div className="absolute right-[-6px] w-[28px] h-[28px] flex items-center justify-center">
                              {/* Moon Orbit Ring */}
                              <div className="absolute border border-white/5 rounded-full w-6 h-6" />
                              
                              {/* Moon body container revolving around Earth */}
                              <motion.div 
                                className="absolute w-6 h-6 flex items-center"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                              >
                                {/* Cratered Moon body with shadow overlay */}
                                <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-zinc-300 shadow-[0_0_3px_#fff] flex items-center justify-center overflow-hidden">
                                  {/* Craters */}
                                  <div className="w-[1px] h-[1px] bg-zinc-500 rounded-full absolute top-[1px] left-[1px]" />
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80" />
                                </div>
                              </motion.div>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                  {/* Active Worksheets Preview (Child-Friendly Primary Tracing & Drawing) */}
                    {activeItem === "worksheets" && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0b0c10] flex flex-col z-10 p-3"
                      >
                        <div className="text-[7px] font-mono font-bold text-emerald-400 tracking-wider mb-1.5">02 · PRIMARY MATH WORK SHEET</div>
                        <div className="flex-1 border border-white/5 bg-zinc-950/90 rounded-lg relative overflow-hidden p-2 flex flex-col justify-between">
                          {/* Worksheet ruling/graph helper background */}
                          <div className="absolute inset-0 bg-grid opacity-[0.04] pointer-events-none" />
                          
                          {/* Fun Primary Heading */}
                          <div className="flex justify-between items-center z-10 mb-0.5">
                            <span className="text-[7.5px] font-bold text-zinc-300">Activity: Count and Sum the Stars! 🌟</span>
                            <span className="text-[6px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded-sm border border-emerald-500/20">Stage 1</span>
                          </div>
                          
                          {/* Main drawing display */}
                          <div className="flex-1 relative flex items-center justify-center">
                            <svg viewBox="0 0 120 50" className="w-full h-full">
                              {/* Left star container */}
                              <g fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8">
                                <circle cx="20" cy="22" r="10" />
                                {/* Star 1 */}
                                <polygon points="20,15 22,20 27,20 23,23 25,28 20,25 15,28 17,23 13,20 18,20" fill="#F59E0B" opacity="0.8" />
                              </g>
                              <text x="35" y="25" fill="rgba(255,255,255,0.4)" className="text-[10px] font-bold">+</text>

                              {/* Right stars container */}
                              <g fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8">
                                <circle cx="55" cy="22" r="10" />
                                {/* Stars */}
                                <polygon points="52,16 53,19 56,19 54,21 55,24 52,22 49,24 50,21 48,19 51,19" fill="#10B981" opacity="0.8" />
                                <polygon points="59,22 60,25 63,25 61,27 62,30 59,28 56,30 57,27 55,25 58,25" fill="#3B82F6" opacity="0.8" />
                              </g>
                              <text x="70" y="25" fill="rgba(255,255,255,0.4)" className="text-[10px] font-bold">=</text>

                              {/* Sum Output boxes: 1 + 2 = 3 */}
                              {/* Hand-drawn number 3 */}
                              <motion.path 
                                d="M 85,15 C 92,15 92,20 85,20 C 92,20 92,25 85,25"
                                fill="none" 
                                stroke="#10B981" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              />

                              {/* Hand-drawn correction tick */}
                              <motion.path 
                                d="M 98,18 L 102,23 L 110,13"
                                fill="none" 
                                stroke="#34D399" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 1.8 }}
                              />
                            </svg>

                            {/* Magic crayon marker tracing */}
                            <motion.div 
                              className="absolute w-2.5 h-2.5 pointer-events-none"
                              animate={{ 
                                x: [23, 23, 31, 23],
                                y: [-6, -6, 4, -6]
                              }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full shadow-[0_0_10px_#10B981]" />
                            </motion.div>
                          </div>

                          <div className="flex justify-between items-center text-[5.5px] text-zinc-500 font-semibold border-t border-white/5 pt-1 z-10">
                            <span>Status: Interactive Tracing</span>
                            <span className="text-[#34D399] animate-pulse">Good Job! +10xp</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {/* Active Exams Preview (Geometry Tools Mockup) */}
                    {activeItem === "exams" && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#08090d] flex flex-col p-3.5 justify-between z-10"
                      >
                        <div className="text-[7.5px] font-mono font-bold text-rose-400 tracking-wider">03 · GEOMETRY MATH TOOLS</div>
                        
                        <div className="flex-1 flex flex-col gap-2 mt-2 bg-zinc-950/60 rounded-xl border border-white/5 p-2 relative overflow-hidden flex justify-center items-center">
                          {/* Grid blueprint pattern */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
                          
                          {/* SVG containing the animated ruler and protractor geometry */}
                          <svg className="w-full h-full text-zinc-400 z-10" viewBox="0 0 200 80">
                            {/* Animated Protractor (Arc with degree ticks) */}
                            <g transform="translate(45, 45)">
                              {/* Semisymmetric arc */}
                              <path d="M -30 0 A 30 30 0 0 1 30 0 Z" fill="rgba(244, 63, 94, 0.05)" stroke="rgba(244, 63, 94, 0.3)" strokeWidth="1" />
                              {/* Center dot */}
                              <circle cx="0" cy="0" r="1.5" fill="#f43f5e" />
                              
                              {/* Ticks along the arc */}
                              {[-60, -30, 0, 30, 60].map((angle, idx) => {
                                const rad = (angle * Math.PI) / 180;
                                const x1 = Math.sin(rad) * 27;
                                const y1 = -Math.cos(rad) * 27;
                                const x2 = Math.sin(rad) * 30;
                                const y2 = -Math.cos(rad) * 30;
                                return (
                                  <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(244, 63, 94, 0.4)" strokeWidth="0.8" />
                                );
                              })}

                              {/* Sweeping angle measuring line */}
                              <motion.line 
                                x1="0" y1="0" 
                                animate={{
                                  x2: [0, 21, 0],
                                  y2: [-30, -21, -30]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                stroke="#f43f5e" 
                                strokeWidth="1.5" 
                                strokeDasharray="2 1"
                              />
                              {/* Degree badge */}
                              <motion.g
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity }}
                              >
                                <text x="12" y="-12" fill="#f43f5e" fontSize="7" fontWeight="bold">45°</text>
                              </motion.g>
                            </g>

                            {/* Animated Ruler drawing a line */}
                            <g transform="translate(100, 20)">
                              {/* Ruler body */}
                              <rect x="0" y="25" width="80" height="15" rx="2" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                              {/* Ruler ticks */}
                              {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((tick) => (
                                <line key={tick} x1={tick} y1="25" x2={tick} y2="28" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
                              ))}
                              
                              {/* The line being drawn along the ruler */}
                              <motion.line
                                x1="5" y1="22"
                                animate={{ x2: [5, 75, 5] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                y2="22"
                                stroke="#22d3ee"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                              
                              {/* Pencil point drawing the line */}
                              <motion.polygon
                                points="0,0 -3,-8 3,-8"
                                fill="#22d3ee"
                                animate={{
                                  transform: [
                                    "translate(5px, 20px) rotate(15deg)",
                                    "translate(75px, 20px) rotate(15deg)",
                                    "translate(5px, 20px) rotate(15deg)"
                                  ]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                              />
                            </g>
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
              
              {/* Keyboard Bottom Base */}
              <div className="w-[108%] h-3 bg-zinc-800 border-x border-b border-white/20 rounded-b-xl shadow-xl relative" style={{ perspective: '500px' }}>
                <div className="absolute top-0 inset-x-6 h-0.5 bg-zinc-900" />
                {/* Keypad indent */}
                <div className="absolute top-[2px] left-1/2 transform -translate-x-1/2 w-8 h-1 bg-zinc-900/40 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Right Column Features */}
          <div className="lg:col-span-3 flex flex-col gap-6 order-3">
            {FEATURE_ITEMS.filter(f => f.side === "right").map((f) => {
              const Icon = f.icon;
              const isCardActive = activeItem === f.id;
              return (
                <div 
                  key={f.id}
                  onMouseEnter={() => setHoveredItem(f.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isCardActive 
                      ? "bg-white/[0.04] border-purple-500/30 shadow-[0_0_15px_rgba(157,111,239,0.08)] -translate-x-2" 
                      : "bg-white/[0.01] border-white/5"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center border shrink-0 transition-all ${isCardActive ? "scale-110 shadow-lg" : ""} ${f.bg} ${f.bdr}`}>
                    <Icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <div>
                    <h4 className={`font-display text-sm font-bold transition-colors ${isCardActive ? "text-purple-400" : "text-white"}`}>{f.title}</h4>
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}