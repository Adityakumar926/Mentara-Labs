import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { studentApi } from "@/api/services";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { 
  ArrowUpRight, Play, Timer, Atom, PenTool, Sparkles, ChevronRight, ChevronLeft,
  Globe, BookOpen, GraduationCap, Award, Library, Compass, X, Menu,
  Dna, Sigma, Code2, LineChart, Globe2, BookText, Check, Quote,
  Github, Twitter, Linkedin, Youtube, Star, BarChart3, Layers, FlaskConical,
  Presentation, Zap, Navigation, Brain, Search, Mic, Bot, MessageSquare, ShieldCheck
} from "lucide-react";

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
        .font-display {
          font-family: 'Outfit', 'Space Grotesk', sans-serif;
        }
        .font-mono-label {
          font-family: 'Space Grotesk', monospace;
        }
        .bg-grid {
          background-size: 30px 30px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-blob {
          animation: blob 12s infinite alternate ease-in-out;
        }
        @keyframes ping-glow {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 12px currentColor; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        .animate-ping-glow {
          animation: ping-glow 2.5s infinite ease-in-out;
        }
        @keyframes header-rgb {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .header-gradient-text {
          background: linear-gradient(90deg, #22d3ee, #34d399, #a855f7, #22d3ee);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: header-rgb 4s linear infinite;
        }
        @keyframes torch-move {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(70px); }
        }
        @keyframes shadow-scale {
          0%, 100% { transform: scaleY(0.7) scaleX(1); opacity: 0.4; }
          50% { transform: scaleY(1.9) scaleX(1.4); opacity: 0.95; }
        }
        @keyframes beam-stretch {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(0.7) translateX(30px); }
        }
      `}</style>

      <main className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
        <Header />
        <Hero />
        <FeaturesBento />
        <VirtualClassroomShowcase />
        <ProductDetails />
        <Pricing />
        <SubjectsGrid />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}

/* ── 1. HEADER ── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV_LINKS = [
    { label: "Home", href: "#" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Subjects", href: "#subjects" },
  ];

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 h-16" : "bg-transparent h-20"
      } flex items-center`}
    >
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 w-full flex items-center justify-between">
        <a href="#" data-testid="brand-logo" className="flex items-center gap-3 group">
          <img src="/mentara-new.png" alt="Mentara Labs Logo" className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="font-display font-bold text-[26px] tracking-tight header-gradient-text">Mentara Labs</span>
        </a>

        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className="px-3.5 py-2 text-[13px] font-medium text-zinc-400 hover:text-white transition-colors rounded-md"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            data-testid="header-signin"
            className="hidden sm:inline text-[13px] font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            data-testid="header-cta"
            className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.45)] transition-shadow duration-300"
          >
            Get Started
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-zinc-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            data-testid="mobile-nav"
            className="absolute top-full inset-x-0 border-t border-white/5 bg-zinc-950/95 backdrop-blur-2xl py-4 shadow-xl md:hidden"
          >
            <div className="px-6 flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm text-zinc-300 hover:text-cyan-400 font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <hr className="border-white/5 my-2" />
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-zinc-300 hover:text-cyan-400 font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── 2. HERO (Matching User Screenshot media_1787852283925.png) ── */
function Hero() {
  return (
    <section data-testid="hero-section" className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-zinc-950 min-h-[580px] lg:min-h-[640px] flex items-center">
      {/* Background Video - Darkened for High Contrast */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <video
          src="/product_video_final_clean_v2.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.08] opacity-75"
        >
          <source src="/product_video_final_clean_v2.mp4" type="video/mp4" />
        </video>
        
        {/* Darkening Gradient Mask Layer for High Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-zinc-950/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-zinc-950/40 z-10" />
      </div>

      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 relative z-20 w-full">
        <div className="max-w-3xl">
          {/* Single Unified Hero Banner (Moved Upwards) */}
          <div className="mb-6 inline-flex flex-wrap items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/35 bg-zinc-950/90 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.18)] transition-all hover:border-cyan-400/60" data-testid="hero-unified-banner">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="font-mono-label text-[10.5px] uppercase tracking-[0.2em] font-extrabold text-cyan-300">
              BUILT FOR CAMBRIDGE PRIMARY
            </span>
            <span className="text-zinc-500 font-bold">•</span>
            <span className="font-mono-label text-[10.5px] uppercase tracking-[0.18em] font-bold text-zinc-200">
              DESKTOP & TABLET FIRST
            </span>
            <span className="text-zinc-500 font-bold">•</span>
            <span className="font-mono-label text-[10.5px] uppercase tracking-[0.16em] font-semibold text-emerald-400">
              REDUCED MOBILE ADDICTION
            </span>
          </div>

          {/* Main Hero Heading with High-Contrast Punchy 4-Color Gradient */}
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.96] tracking-tighter">
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Everything you need to teach and learn{" "}
            </span>
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
              Cambridge Primary.
            </span>
          </h1>

          {/* Body Subtext */}
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-300 max-w-2xl font-medium">
            Mentara Labs equips Cambridge Primary students with interactive 3D simulations,
            digital worksheets, and practical exam prep built to boost understanding and confidence.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              data-testid="hero-cta-primary"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-semibold text-sm hover:shadow-[0_0_40px_rgba(34,211,238,0.45)] transition-shadow duration-300"
            >
              Start Free Trial
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href="#features"
              data-testid="hero-cta-secondary"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 bg-zinc-900/80 backdrop-blur-md text-zinc-200 font-medium text-sm hover:border-white/30 hover:bg-zinc-900 transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400" />
              Explore Features
            </a>
          </div>

          {/* Stats Row */}
          <div className="mt-7 grid grid-cols-3 gap-6 max-w-md border-t border-white/10 pt-4">
            {[
              { stat: "500+", label: "Active learners" },
              { stat: "98%", label: "Syllabus Pass Rate" },
              { stat: "240+", label: "Interactive Labs" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-white">{s.stat}</div>
                <div className="text-xs text-zinc-400 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



/* ── ULTRA-SENSITIVE SCIENTIFIC 3D TILT HOVER CARD ── */
function Card3DTilt({ children, hoverBorder = "hover:border-cyan-500/60 hover:shadow-[0_30px_70px_rgba(6,182,212,0.35)]", accentGlow = "rgba(6, 182, 212, 0.45)" }) {
  const cardRef = React.useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [shadowPos, setShadowPos] = useState({ x: 0, y: 20 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized position (-0.5 to 0.5) from center
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    // Highly sensitive & scientific 26-degree 3D tilt formula
    const targetRotX = -normY * 26;
    const targetRotY = normX * 26;
    
    setRotateX(targetRotX);
    setRotateY(targetRotY);

    // Dynamic physical shadow casting opposite to mouse cursor position
    setShadowPos({
      x: -normX * 35,
      y: 22 + Math.abs(normY) * 20,
    });

    setGlarePos({ 
      x: (x / rect.width) * 100, 
      y: (y / rect.height) * 100, 
      opacity: 0.5 
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
    setShadowPos({ x: 0, y: 15 });
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
          scale: isHovered ? 1.04 : 1,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 20, mass: 0.4 }}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: isHovered 
            ? `${shadowPos.x}px ${shadowPos.y}px 50px rgba(0, 0, 0, 0.8), 0 0 35px ${accentGlow}`
            : "0 15px 35px rgba(0, 0, 0, 0.5)",
        }}
        className={`relative flex flex-col justify-between h-full rounded-3xl border border-zinc-800/80 bg-zinc-950 overflow-hidden transition-colors duration-200 ${hoverBorder}`}
      >
        {/* Dynamic Specular Light Glare Reflection */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-200 rounded-3xl"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 70%)`,
          }}
        />

        {/* 3D Reflection Rim Light */}
        <div 
          className="pointer-events-none absolute inset-0 z-20 rounded-3xl transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            border: "1px solid rgba(255, 255, 255, 0.18)",
          }}
        />
        
        {/* 3D Multi-Layer Parallax Depth */}
        <div style={{ transform: "translateZ(35px)", transformStyle: "preserve-3d" }} className="flex flex-col justify-between h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ── 3D DRAMATIC CIRCULAR ARC SCROLL-UNFOLD CARD WRAPPER ── */
function Card3DScrollArc({ index, totalCards = 4, children, scrollProgress }) {
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
      className="relative py-10 lg:py-14 bg-zinc-950 border-t border-white/5 [perspective:1400px] overflow-hidden"
    >
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
          <span className="font-mono-label text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 inline-block mb-3">
            · Platform Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Platform <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="mt-3 text-zinc-400 text-base sm:text-lg">
            Everything students need for Cambridge Primary success, all in one connected environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch [transform-style:preserve-3d]">
          
          {/* Card 1: 3D Science Simulations (Teal Header) */}
          <Card3DScrollArc index={0} scrollProgress={smoothProgress}>
            <Card3DTilt hoverBorder="hover:border-emerald-500/50 hover:shadow-[0_20px_50px_rgba(52,211,153,0.25)]">
              <div className="p-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg" style={{ transform: "translateZ(30px)" }}>
                  <Atom className="h-6 w-6 text-emerald-300" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-zinc-950/80 border border-emerald-400/30 text-emerald-300 font-mono-label text-xs font-bold" style={{ transform: "translateZ(30px)" }}>
                  Interactive Lab
                </span>
              </div>

              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                    3D Science<br />Simulations
                  </h3>
                  <p className="mt-4 text-sm text-zinc-300 leading-relaxed font-normal">
                    Interactive 3D physics & optics labs (Light & Shadows, Reflection, Forces) with live slider controls and shadow math calculations.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-zinc-900/90" style={{ transform: "translateZ(25px)" }}>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-300 mb-2 font-semibold">
                    <span>Torch: <strong className="text-cyan-400">{torchPos.toFixed(1)}m</strong></span>
                    <span>Shadow: <strong className="text-emerald-400">{Math.round(torchPos * 18)}cm</strong></span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={torchPos}
                    onChange={(e) => setTorchPos(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </Card3DTilt>
          </Card3DScrollArc>

          {/* Card 2: Gogo AI Voice Agent (Purple Header) */}
          <Card3DScrollArc index={1} scrollProgress={smoothProgress}>
            <Card3DTilt hoverBorder="hover:border-purple-500/50 hover:shadow-[0_20px_50px_rgba(168,85,247,0.25)]">
              <div className="p-6 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-500 flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg" style={{ transform: "translateZ(30px)" }}>
                  <Bot className="h-6 w-6 text-purple-300" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-zinc-950/80 border border-purple-400/30 text-purple-300 font-mono-label text-xs font-bold" style={{ transform: "translateZ(30px)" }}>
                  Voice Tutor
                </span>
              </div>

              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                    Gogo AI Voice Agent
                  </h3>
                  <p className="mt-4 text-sm text-zinc-300 leading-relaxed font-normal">
                    Real-time Socratic voice assistant guiding Cambridge Primary students step-by-step through science and math concepts.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-zinc-900/90 flex items-center justify-between" style={{ transform: "translateZ(25px)" }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-xs font-mono text-white font-semibold">Voice Active</span>
                  </div>
                  <div className="flex items-end gap-1 h-5">
                    {[12, 20, 16, 24, 14, 18].map((h, i) => (
                      <motion.span
                        key={i}
                        className="w-1 bg-purple-400 rounded-full"
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
            <Card3DTilt hoverBorder="hover:border-sky-500/50 hover:shadow-[0_20px_50px_rgba(56,189,248,0.25)]">
              <div className="p-6 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg" style={{ transform: "translateZ(30px)" }}>
                  <GraduationCap className="h-6 w-6 text-sky-300" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-zinc-950/80 border border-sky-400/30 text-sky-300 font-mono-label text-xs font-bold" style={{ transform: "translateZ(30px)" }}>
                  Stage 1–5
                </span>
              </div>

              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                    Checkpoint Exams
                  </h3>
                  <p className="mt-4 text-sm text-zinc-300 leading-relaxed font-normal">
                    Timed Cambridge Primary Checkpoint paper simulator with auto-graded MCQs and instant score breakdown.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-zinc-900/90 flex items-center justify-between text-xs font-mono" style={{ transform: "translateZ(25px)" }}>
                  <span className="text-zinc-300">Timer: <strong className="text-cyan-400">45:00</strong></span>
                  <span className="text-emerald-400 font-bold">Auto-Graded</span>
                </div>
              </div>
            </Card3DTilt>
          </Card3DScrollArc>

          {/* Card 4: Digital Worksheets (Orange Header) */}
          <Card3DScrollArc index={3} scrollProgress={smoothProgress}>
            <Card3DTilt hoverBorder="hover:border-amber-500/50 hover:shadow-[0_20px_50px_rgba(245,158,11,0.25)]">
              <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg" style={{ transform: "translateZ(30px)" }}>
                  <PenTool className="h-6 w-6 text-amber-300" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-zinc-950/80 border border-amber-400/30 text-amber-300 font-mono-label text-xs font-bold" style={{ transform: "translateZ(30px)" }}>
                  Digital Canvas
                </span>
              </div>

              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                    Digital Worksheets
                  </h3>
                  <p className="mt-4 text-sm text-zinc-300 leading-relaxed font-normal">
                    On-screen drawing canvas tools for solving geometry problems, measuring angles, and labeling science diagrams.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-zinc-900/90 flex items-center justify-between text-xs font-mono" style={{ transform: "translateZ(25px)" }}>
                  <span className="text-zinc-300">Drawing Tool</span>
                  <span className="text-amber-400 font-bold">Angle Mode: 45°</span>
                </div>
              </div>
            </Card3DTilt>
          </Card3DScrollArc>

        </div>
      </div>
    </section>
  );
}

/* ── 4.5. VIRTUAL CLASSROOM AUTO SLIDESHOW SHOWCASE (cam1, dashboard, feature Images) ── */
function VirtualClassroomShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const SHOWCASE_ITEMS = [
    {
      id: "cam1",
      tag: "Cambridge Primary",
      badgeText: "· Live Interface",
      title: "Interactive Learning",
      description: "Empower young minds with interactive lessons, 3D science labs, and drawing worksheets built for Cambridge Primary Stage 1 to 6.",
      image: "/cam1.webp",
      alt: "Cambridge Primary Interactive Learning Suite",
      accentColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      glowColor: "from-cyan-500/20 via-teal-500/10 to-transparent",
      barGrad: "from-cyan-400 to-teal-400",
      icon: Atom
    },
    {
      id: "dashboard",
      tag: "Student Dashboard",
      badgeText: "· Growth & Analytics",
      title: "Real-Time Growth & Insights",
      description: "Track study streaks, complete drawable activities, monitor checkpoint progress, and learn alongside GOGO AI Tutor 24/7.",
      image: "/dashboard.webp",
      alt: "Student Dashboard & AI Analytics",
      accentColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      glowColor: "from-purple-500/20 via-indigo-500/10 to-transparent",
      barGrad: "from-purple-400 to-indigo-400",
      icon: Bot
    },
    {
      id: "feature",
      tag: "Curriculum Excellence",
      badgeText: "· Platform Suite",
      title: "Curriculum-Aligned Framework",
      description: "Take a look inside the modern teacher learning suite built specifically for Cambridge Primary Stage 1 to 6.",
      image: "/feature.webp",
      alt: "Curriculum Aligned Suite Features",
      accentColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      glowColor: "from-emerald-500/20 via-teal-500/10 to-transparent",
      barGrad: "from-emerald-400 to-teal-400",
      icon: GraduationCap
    }
  ];

  // Guaranteed 5-Second Auto-Play Loop (Runs continuously every 5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % SHOWCASE_ITEMS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [SHOWCASE_ITEMS.length]);

  const currentItem = SHOWCASE_ITEMS[activeIndex];

  return (
    <section 
      id="virtual-classroom" 
      data-testid="virtual-classroom-section" 
      className="relative py-10 lg:py-14 bg-zinc-950 border-t border-white/5 overflow-hidden"
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[850px] bg-gradient-to-r ${currentItem.glowColor} blur-[160px] pointer-events-none transition-all duration-700 -z-10`} />

      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="font-mono-label text-xs uppercase tracking-[0.24em] text-cyan-400 font-bold">
              · Live Interface
            </span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight text-white">
            Explore the <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Virtual Classroom</span>
          </h2>

          <p className="mt-4 text-zinc-400 text-base sm:text-lg leading-relaxed font-medium">
            Take a look inside the modern teacher learning suite built specifically for Cambridge curriculums.
          </p>
        </div>

        {/* Tab Buttons Navigation */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {SHOWCASE_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative flex items-center gap-2.5 px-5 py-3 rounded-2xl font-mono-label text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? `${item.accentColor} shadow-xl scale-105 border`
                      : "bg-white/[0.03] border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.tag}</span>

                  {/* Active Indicator Pulse */}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 5-Second Active Progress Bar Ticker */}
          <div className="flex items-center gap-2">
            {SHOWCASE_ITEMS.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Select ${item.tag}`}
                  className="h-1.5 rounded-full overflow-hidden transition-all duration-500 bg-zinc-800"
                  style={{ width: isActive ? "36px" : "8px" }}
                >
                  {isActive && (
                    <motion.div
                      key={activeIndex}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className={`h-full bg-gradient-to-r ${item.barGrad}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Display Panel: Left Info + Right Image Showcase */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column Text Details */}
          <div className="lg:col-span-5 relative min-h-[260px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="inline-block">
                  <span className={`px-3.5 py-1 rounded-full text-xs font-mono-label font-bold border ${currentItem.accentColor}`}>
                    {currentItem.badgeText}
                  </span>
                </div>

                <h3 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                  {currentItem.title}
                </h3>

                <p className="text-zinc-300 text-base sm:text-lg leading-relaxed font-medium">
                  {currentItem.description}
                </p>

                <div className="pt-4">
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-bold text-sm hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all"
                  >
                    Explore Curriculum <ArrowUpRight className="h-4 w-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Glassmorphic Image Frame with Sliding Track */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl border border-white/15 bg-zinc-950/90 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden group">
              
              {/* Browser Window Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02] mb-3 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/90" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/90" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/90" />
                  <span className="text-[10px] font-mono text-zinc-500 ml-2 font-semibold">Mentara Classroom Suite</span>
                </div>
                <span className="font-mono-label text-[10px] uppercase tracking-widest text-cyan-300 font-bold">
                  {currentItem.tag}
                </span>
              </div>

              {/* Display Image Container with Sliding Horizontal Track */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-inner">
                <motion.div
                  className="flex w-full h-full"
                  animate={{ x: `-${activeIndex * 100}%` }}
                  transition={{ type: "spring", stiffness: 180, damping: 24 }}
                >
                  {SHOWCASE_ITEMS.map((item) => (
                    <div key={item.id} className="w-full h-full shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ))}
                </motion.div>
              </div>

            </div>
          </div>

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
    <section data-testid="journey-section" className="relative py-8 lg:py-10 bg-zinc-950 border-y border-white/5">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-400">
            · Learning journey
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tighter mt-3 leading-[1.05] text-white">
            From first lesson to exam day — in four deliberate steps.
          </h2>
          <p className="text-zinc-400 mt-5 leading-relaxed">
            Our methodology is built on years of working with top-scoring Cambridge international students.
            No fluff, no filler.
          </p>
        </div>

        <div className="lg:col-span-8 relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/40 via-emerald-500/30 to-transparent pointer-events-none" />

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
                <div className="absolute left-0 top-1 h-10 w-10 rounded-full border border-cyan-500/30 bg-zinc-950 grid place-items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 animate-ping-glow" />
                </div>
                <div className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-bold">
                  Step {s.n}
                </div>
                <h3 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-white mt-1">
                  {s.title}
                </h3>
                <p className="text-zinc-400 mt-3 max-w-lg leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 6. SUBJECTS GRID ── */
/* ── 6. SUBJECTS GRID (Tactile 3D Material Design matching media_1787856582952.png) ── */
function SubjectsGrid() {
  const SUBJECTS = [
    {
      id: "math",
      name: "Mathematics",
      subtitle: "Numbers • Logic • Problem Solving",
      topics: 24,
      watermark: "π",
      borderGlow: "hover:border-blue-400/60 hover:shadow-[0_25px_60px_rgba(37,99,235,0.35)]",
      waveGrad: "from-blue-600/30 via-blue-500/10 to-transparent",
      iconGrad: "from-blue-500 via-blue-700 to-blue-950",
      watermarkColor: "text-blue-400/25",
      icon: (
        <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="2" width="16" height="20" rx="3" strokeWidth="2" />
          <line x1="8" y1="6" x2="16" y2="6" strokeWidth="2" />
          <line x1="16" y1="14" x2="16" y2="18" strokeWidth="2" />
          <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: "science",
      name: "Science",
      subtitle: "Thinking Scientifically • Living Things • Forces • Earth & Space",
      topics: 28,
      watermark: "⚛",
      borderGlow: "hover:border-teal-400/60 hover:shadow-[0_25px_60px_rgba(20,184,166,0.35)]",
      waveGrad: "from-teal-600/30 via-emerald-500/10 to-transparent",
      iconGrad: "from-teal-500 via-teal-700 to-teal-950",
      watermarkColor: "text-teal-400/25",
      icon: (
        <svg className="w-7 h-7 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.785 2.87l1.7 3.4a2 2 0 001.785 1.11h9.4a2 2 0 001.785-1.11l1.7-3.4a2 2 0 00-.357-2.562zM12 3v9" />
        </svg>
      )
    },
    {
      id: "english",
      name: "English",
      subtitle: "Grammar • Reading • Composition",
      topics: 20,
      watermark: "Aa",
      borderGlow: "hover:border-purple-400/60 hover:shadow-[0_25px_60px_rgba(147,51,234,0.35)]",
      waveGrad: "from-purple-600/30 via-indigo-500/10 to-transparent",
      iconGrad: "from-purple-500 via-purple-700 to-purple-950",
      watermarkColor: "text-purple-400/25",
      icon: (
        <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: "global",
      name: "Global Perspectives",
      subtitle: "Culture • Geography • Citizenship",
      topics: 18,
      watermark: "🌐",
      borderGlow: "hover:border-sky-400/60 hover:shadow-[0_25px_60px_rgba(14,165,233,0.35)]",
      waveGrad: "from-sky-600/30 via-cyan-500/10 to-transparent",
      iconGrad: "from-sky-500 via-sky-700 to-sky-950",
      watermarkColor: "text-sky-400/25",
      icon: (
        <svg className="w-7 h-7 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
        </svg>
      )
    }
  ];

  return (
    <section id="subjects" data-testid="subjects-section" className="relative py-10 lg:py-14 bg-zinc-950 border-t border-white/5">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
          <div className="max-w-xl">
            <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-400 font-bold px-3.5 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 inline-block mb-3">
              · Subjects
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Syllabus-Aligned <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Subjects</span>
            </h2>
          </div>
          <p className="text-zinc-400 text-sm sm:text-base max-w-md font-medium leading-relaxed">
            Interactive 3D labs, drawing worksheets and auto-graded mock checkpoint papers tailored to Cambridge Primary Stage 1 to 6.
          </p>
        </div>

        {/* 3D Material Subject Cards Grid (4 in a single row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {SUBJECTS.map((s) => (
            <motion.div
              key={s.id}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              data-testid={`subject-card-${s.id}`}
              className={`group relative rounded-[24px] border border-white/12 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black p-5 sm:p-6 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.15),_0_20px_40px_-12px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden transition-all duration-300 cursor-pointer ${s.borderGlow}`}
            >
              {/* Corner Translucent Glass Wave Overlay */}
              <div className={`absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl ${s.waveGrad} rounded-tl-[90px] pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-70`} />

              {/* Subject 3D Watermark Icon in Corner */}
              <div className={`absolute -bottom-1 right-3 font-serif font-black text-6xl sm:text-7xl select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(56,189,248,0.2)] ${s.watermarkColor}`}>
                {s.watermark}
              </div>

              {/* Card Content Row */}
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                
                {/* Top Row: 3D Tactile Icon + Top Right Arrow */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  
                  {/* 3D Tactile Icon Badge Container */}
                  <div className={`h-12 w-12 rounded-[16px] bg-gradient-to-br ${s.iconGrad} p-0.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.4),_0_8px_16px_rgba(0,0,0,0.7)] flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-300`}>
                    <div className="h-full w-full rounded-[13px] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                      {s.icon}
                    </div>
                  </div>

                  {/* Top-Right Arrow Action Button */}
                  <div className="h-9 w-9 rounded-full border border-white/15 bg-white/10 group-hover:bg-cyan-400 group-hover:text-zinc-950 group-hover:border-cyan-300 flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),_0_6px_14px_rgba(0,0,0,0.5)] transition-all duration-300">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* Middle Row: Title & Subtitle */}
                <div className="mb-5">
                  <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight leading-snug group-hover:text-cyan-300 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-zinc-400 text-[11px] sm:text-xs font-medium mt-1.5 leading-relaxed tracking-wide">
                    {s.subtitle}
                  </p>
                </div>

                {/* Bottom Row: Tactile Glass Topic Badge Pill */}
                <div className="inline-flex items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/12 bg-white/[0.06] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_6px_14px_rgba(0,0,0,0.5)]">
                    <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-mono-label text-[11px] font-bold text-zinc-100 tracking-wider">
                      {s.topics} Topics
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
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
      quote: "Fractions used to be such a struggle for my son every single evening. Seeing them visually on Mentara changed everything for him. He actually enjoys practicing now and got great marks in his checkpoints!",
      name: "Aanya Sharma",
      role: "Parent of Stage 5 Student",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    },
    {
      quote: "The mock exams are so close to the actual paper format. My daughter walked into her Checkpoint exam feeling totally calm and ready to go.",
      name: "Marcus Hale",
      role: "Parent of Stage 6 Student",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    },
    {
      quote: "The 3D science labs are so cool because I can move things around to see how shadows change. It makes studying way easier than reading a boring textbook!",
      name: "Liang Wei",
      role: "Stage 5 Cambridge Learner",
      img: "https://images.pexels.com/photos/8085257/pexels-photo-8085257.jpeg?auto=compress&cs=tinysrgb&w=250",
    },
  ];

  return (
    <section id="testimonials" data-testid="testimonials-section" className="relative py-12 lg:py-16 bg-zinc-950 border-y border-white/5">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-10">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-400 font-bold px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 inline-block mb-3">
            · Student Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Results That Speak Louder Than <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Marketing Copy</span>
          </h2>
        </div>

        {/* Simple 3-Card Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIAL_DATA.map((t, i) => (
            <div
              key={i}
              data-testid={`testimonial-${i}`}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-7 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star key={starIdx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-zinc-200 leading-relaxed text-[15px] font-medium">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-8 flex items-center gap-3.5 pt-5 border-t border-white/10">
                <div className="relative h-11 w-11 rounded-full overflow-hidden border border-white/20 bg-zinc-900 shrink-0">
                  <img src={t.img} alt={t.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {t.name}
                  </div>
                  <div className="font-mono-label text-[11px] text-zinc-400 font-semibold mt-0.5">
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
    <section id="pricing" data-testid="pricing-section" className="relative pt-4 pb-8 bg-zinc-950/20">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mb-6">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-emerald-400">
            · Pricing
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mt-3 leading-[1.05] text-white">
            Premium learning,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              honestly priced.
            </span>
          </h2>
          <p className="text-zinc-400 mt-5 text-lg">No hidden fees. Built for learners and teachers alike.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-6 items-stretch">
          {PLANS.map((p) => (
            <div
              key={p.id}
              data-testid={`plan-${p.id}`}
              className={`relative rounded-3xl border p-5 sm:p-6 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between ${
                p.highlight
                  ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/[0.08] via-zinc-900/60 to-emerald-500/[0.08] shadow-[0_0_50px_-15px_rgba(34,211,238,0.35)]"
                  : p.id === "teacher"
                  ? "border-violet-500/30 bg-gradient-to-br from-violet-500/[0.06] via-zinc-900/60 to-purple-500/[0.05] hover:border-violet-400/40"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              {/* Badge */}
              {p.badge && (
                <div className="absolute -top-3.5 left-6 px-3.5 py-1 rounded-full text-[9.5px] font-mono-label uppercase tracking-[0.2em] bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-black shadow-md">
                  {p.badge}
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className={`font-mono-label text-xs uppercase tracking-[0.24em] font-black ${
                    p.highlight ? "text-cyan-400" : p.id === "teacher" ? "text-violet-400" : "text-zinc-400"
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
                        <span className="text-xs line-through text-zinc-500 font-semibold">{p.originalPrice}</span>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                          {p.discountBadge}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10.5px] text-zinc-500 font-mono-label uppercase tracking-wider font-bold">Standard Access</span>
                    )}
                  </div>

                  {/* Main Price display */}
                  <div className="flex items-baseline gap-2">
                    <span className={`font-display text-4xl sm:text-5xl font-black tracking-tight ${
                      p.highlight
                        ? "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                        : p.id === "teacher"
                        ? "bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"
                        : "text-white"
                    }`}>
                      {p.price}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">{p.sub}</span>
                  </div>

                  {/* Savings pill row */}
                  <div className="h-6 flex items-center pt-0.5">
                    {p.savingsAmount ? (
                      <div className={`text-[11px] font-semibold flex items-center gap-1 rounded-full py-0.5 px-2.5 border ${
                        p.highlight
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-violet-400 bg-violet-500/10 border-violet-500/20"
                      }`}>
                        <span>🎉 You save {p.savingsAmount} instantly</span>
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold text-zinc-400 rounded-full py-0.5 px-2.5 border border-white/5 bg-white/[0.02]">
                        ✓ Free forever
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-400 mt-3 leading-relaxed min-h-[36px]">{p.description}</p>

                {/* Divider */}
                <div className={`my-3.5 h-px w-full ${
                  p.highlight ? "bg-cyan-500/20" : p.id === "teacher" ? "bg-violet-500/20" : "bg-white/10"
                }`} />

                {/* Features Checklist */}
                <ul className="space-y-2.5 pb-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        p.highlight 
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" 
                          : p.id === "teacher" 
                          ? "bg-purple-500/10 text-violet-400 border border-purple-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="font-medium leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Pinned CTA Button */}
              <div className="pt-3 border-t border-white/5 mt-auto">
                <Link
                  to="/register"
                  data-testid={`plan-cta-${p.id}`}
                  className={`inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 ${
                    p.highlight
                      ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:scale-[1.01]"
                      : p.id === "teacher"
                      ? "bg-gradient-to-r from-violet-500/30 to-purple-500/30 border border-violet-500/50 text-violet-200 hover:bg-violet-500/40 hover:border-violet-400/80 hover:text-white"
                      : "border border-white/20 text-white bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/40"
                  }`}
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
    <section id="faq" data-testid="faq-section" className="relative py-12 lg:py-14 bg-zinc-950 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-400">
            · Frequently asked
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter mt-3 leading-[1.05] text-white">
            Questions, answered.
          </h2>
        </div>

        <div className="space-y-3">
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
      className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-xl px-5 hover:border-cyan-500/30 transition-colors"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left font-display font-semibold text-base text-white py-5"
      >
        <span>{q}</span>
        <ChevronRight className={`h-4 w-4 text-cyan-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="text-zinc-400 leading-relaxed text-[14.5px] pb-5">
          {a}
        </div>
      )}
    </div>
  );
}

/* ── 10. FOOTER ── */
function Footer() {
  const COLS = [
    { title: "Platform", links: ["Simulations", "Worksheets", "Auto Exams", "Analytics"] },
    { title: "Curriculum", links: ["Cambridge Primary Science", "Cambridge Primary Math", "Cambridge Primary English", "Cambridge Global Perspectives"] },
    { title: "Company", links: ["About", "Educators", "Careers", "Press"] },
    { title: "Resources", links: ["Blog", "Help center", "Status", "Changelog"] },
  ];

  return (
    <footer data-testid="site-footer" className="relative pt-8 pb-6 bg-black border-t border-white/5 overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[60%] bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 relative">
        {/* Links grid */}
        <div className="grid lg:grid-cols-12 gap-10 pb-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <img src="/mentara-new.png" alt="Mentara Labs Logo" className="h-9 w-9 object-contain" />
              <span className="font-display font-bold text-[18px] tracking-tight header-gradient-text">Mentara Labs</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs font-semibold">
              The premium learning operating system for global curricula. Built by educators, examiners and engineers.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Linkedin, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  data-testid={`social-${i}`}
                  aria-label="social"
                  className="h-9 w-9 rounded-full border border-white/10 grid place-items-center text-zinc-500 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {COLS.map((c) => (
              <div key={c.title}>
                <div className="font-mono-label text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-4 font-bold">
                  {c.title}
                </div>
                <ul className="space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-zinc-300 hover:text-cyan-400 transition-colors font-semibold">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="font-mono-label text-[10px] uppercase tracking-[0.22em] text-zinc-600 font-bold">
            © 2026 Mentara Labs · All rights reserved
          </div>
          <div className="flex items-center gap-5 text-[12px] text-zinc-500 font-semibold">
            <a href="#" className="hover:text-zinc-300">Privacy</a>
            <a href="#" className="hover:text-zinc-300">Terms</a>
            <a href="#" className="hover:text-zinc-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── 11. INTERACTIVE APPS SHOWCASE ── */
function Showcase() {
  const [activeTab, setActiveTab] = useState(0);

  const SLIDES = [
    {
      tabLabel: "Cambridge Primary",
      title: "Cambridge Primary Excellence",
      badge: "Curriculum-Aligned Framework",
      desc: "Empower young minds with interactive lessons, 3D science labs, and drawing worksheets built for Cambridge Primary Stage 1 to 6.",
      img: "/cam1.webp",
      color: "from-cyan-500/20 via-blue-600/10 to-transparent",
      accent: "text-cyan-400",
      btnText: "Explore Curriculum →"
    },
    {
      tabLabel: "Interactive Learning",
      title: "Modern Interactive Classroom",
      badge: "Next-Gen Virtual Suite",
      desc: "Transform lessons into rich digital experiences with interactive whiteboards, live simulations, and auto-submitted checkpoint practice.",
      img: "/feature.webp",
      color: "from-emerald-500/20 via-teal-600/10 to-transparent",
      accent: "text-emerald-400",
      btnText: "Explore Features →"
    },
    {
      tabLabel: "Student Dashboard",
      title: "Smart Student & Teacher Hub",
      badge: "Real-Time Growth & Insights",
      desc: "Track study streaks, complete drawable activities, monitor checkpoint progress, and learn alongside GOGO AI Tutor 24/7.",
      img: "/dashboard.png",
      color: "from-violet-500/20 via-purple-600/10 to-transparent",
      accent: "text-violet-400",
      btnText: "View Dashboard →"
    }
  ];

  // Smooth Auto-sliding effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [SLIDES.length]);

  return (
    <section className="py-8 bg-zinc-950/40 relative border-b border-white/5">
      <div className="absolute inset-0 -z-10 bg-grid opacity-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-400">
            · Live Interface
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-3 text-white">
            Explore the Virtual Classroom
          </h2>
          <p className="text-zinc-400 mt-4 text-sm sm:text-base">
            Take a look inside the modern teacher learning suite built specifically for Cambridge curriculums.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.tabLabel}
              onClick={() => setActiveTab(idx)}
              className={`relative px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                activeTab === idx
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {activeTab === idx && (
                <motion.div
                  layoutId="activeShowcaseTab"
                  className="absolute inset-0 bg-white/10 border border-white/20 rounded-full shadow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{slide.tabLabel}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Display Panel */}
        <div className="grid lg:grid-cols-12 gap-8 items-center bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
          <motion.div 
            key={`glow-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-br ${SLIDES[activeTab].color} blur-3xl -z-10`} 
          />

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="lg:col-span-12 grid lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left panel: Info */}
              <div className="lg:col-span-4 flex flex-col justify-center">
                <span className={`font-mono-label text-[9px] uppercase tracking-[0.2em] ${SLIDES[activeTab].accent} font-bold mb-2`}>
                  {SLIDES[activeTab].badge}
                </span>
                <h3 className="font-display text-2xl font-bold text-white mb-4">
                  {SLIDES[activeTab].title}
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                  {SLIDES[activeTab].desc}
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-cyan-400 transition-colors w-fit"
                >
                  {SLIDES[activeTab].btnText}
                </Link>
              </div>

              {/* Right panel: Showcase Image */}
              <div className="lg:col-span-8">
                <div className="relative w-full aspect-[16/10] max-h-[480px] rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 shadow-2xl flex items-center justify-center">
                  <img
                    src={SLIDES[activeTab].img}
                    alt={SLIDES[activeTab].title}
                    className={`w-full h-full transition-all duration-500 ${
                      SLIDES[activeTab].img === "/feature.webp"
                        ? "object-contain bg-zinc-950/90 p-4"
                        : "object-cover object-top"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
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
            Mentara Labs brings the complete Cambridge Primary suite onto one smart, interactive platform built for both educators and students.
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