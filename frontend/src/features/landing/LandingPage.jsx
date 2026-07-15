import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { studentApi } from "@/api/services";
import { 
  ArrowUpRight, Play, Timer, Atom, PenTool, Sparkles, ChevronRight, 
  Globe, BookOpen, GraduationCap, Award, Library, Compass, X, Menu,
  Dna, Sigma, Code2, LineChart, Globe2, BookText, Check, Quote,
  Github, Twitter, Linkedin, Youtube, Star, BarChart3, Layers, FlaskConical,
  Presentation, Zap
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
        <CurriculumStrip />
        <Showcase />
        <ProductDetails />
        <Pricing />
        <FeaturesBento />
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
    { label: "Curriculum", href: "#curriculum" },
    { label: "Features", href: "#features" },
    { label: "Subjects", href: "#subjects" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 h-16" : "bg-transparent h-20"
      } flex items-center`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex items-center justify-between">
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

/* ── 2. HERO ── */
function Hero() {
  const [torchDist, setTorchDist] = useState(1.2);
  const [shadowHt, setShadowHt] = useState(32);

  useEffect(() => {
    let forward = true;
    const timer = setInterval(() => {
      setTorchDist((d) => {
        let next = forward ? d - 0.1 : d + 0.1;
        if (next <= 0.5) { forward = false; next = 0.5; }
        if (next >= 1.5) { forward = true; next = 1.5; }
        // Calculate scientifically accurate shadow height: H_shadow = 18 / distance
        setShadowHt(Math.round(18 / next));
        return parseFloat(next.toFixed(1));
      });
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <section data-testid="hero-section" className="relative pt-20 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-zinc-950">
      {/* Animated background orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-[120px] animate-blob" />
        <div className="absolute top-1/3 right-0 h-[520px] w-[520px] rounded-full bg-emerald-500/15 blur-[140px] animate-blob" style={{ animationDelay: "-4s" }} />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-teal-500/10 blur-[120px] animate-blob" style={{ animationDelay: "-8s" }} />
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Column Info */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md mb-8" data-testid="hero-badge">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="font-mono-label text-[10px] uppercase tracking-[0.22em] text-zinc-300">
              Built for Cambridge Primary
            </span>
          </div>

          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tighter text-white">
            The new operating system for{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Cambridge Primary.
            </span>
          </h1>

          <p className="mt-7 text-lg leading-relaxed text-zinc-400 max-w-xl">
            Mentara Labs delivers premium, institution-grade learning for Cambridge Primary
            students — powered by interactive simulations, drawable worksheets and
            timed exam engines that mirror the real thing.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
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
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md text-zinc-200 font-medium text-sm hover:border-white/25 hover:bg-white/[0.04] transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400" />
              Explore Features
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md border-t border-white/5 pt-8">
            {[
              { stat: "12k+", label: "Active learners" },
              { stat: "98%", label: "Syllabus Pass Rate" },
              { stat: "240+", label: "Interactive Labs" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-white">{s.stat}</div>
                <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column Floating UI Mockups */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-5 relative"
        >
          <div className="relative h-[480px] w-full">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Light & Shadows simulation Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 left-2 right-2 rounded-2xl border border-white/10 bg-zinc-900/65 backdrop-blur-2xl p-5 shadow-2xl"
              data-testid="hero-mock-simulation"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono-label text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  science · light & shadows
                </span>
              </div>
              <div className="relative h-40 rounded-lg bg-zinc-950/80 border border-white/5 overflow-hidden">
                <svg viewBox="0 0 320 180" className="w-full h-full">
                  <defs>
                    <linearGradient id="beam-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[...Array(8)].map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="180" stroke="rgba(255,255,255,0.02)" />
                  ))}
                  {[...Array(5)].map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 40} x2="320" y2={i * 40} stroke="rgba(255,255,255,0.02)" />
                  ))}

                  {/* Ground line */}
                  <line x1="10" y1="130" x2="310" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  
                  {/* Wall line */}
                  <line x1="260" y1="20" x2="260" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

                  {/* Symmetrical Light Beam Cone (stretches from torch to wall, calculated dynamically) */}
                  <polygon fill="url(#beam-grad)">
                    <animate 
                      attributeName="points"
                      values="50,103 260,91 260,130 50,117; 125,103 260,75 260,130 125,117; 50,103 260,91 260,130 50,117"
                      dur="5s"
                      repeatCount="indefinite"
                      keyTimes="0; 0.5; 1"
                      calcMode="spline"
                      keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                    />
                  </polygon>

                  {/* Mathematically Cast Shadow (changes y & height in sync with light angle) */}
                  <rect x="260" fill="rgba(15, 23, 42, 0.85)" rx="1">
                    <animate 
                      attributeName="y"
                      values="91; 75; 91"
                      dur="5s"
                      repeatCount="indefinite"
                      keyTimes="0; 0.5; 1"
                      calcMode="spline"
                      keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                    />
                    <animate 
                      attributeName="height"
                      values="39; 55; 39"
                      dur="5s"
                      repeatCount="indefinite"
                      keyTimes="0; 0.5; 1"
                      calcMode="spline"
                      keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                    />
                    <animate 
                      attributeName="width"
                      values="8; 14; 8"
                      dur="5s"
                      repeatCount="indefinite"
                      keyTimes="0; 0.5; 1"
                      calcMode="spline"
                      keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                    />
                  </rect>

                  {/* Fixed Obstacle Block (Primary science) */}
                  <rect x="160" y="100" width="16" height="30" fill="#f59e0b" rx="3" className="shadow-md" />

                  {/* Torch (Flashlight) translate animation */}
                  <g>
                    <animateTransform 
                      attributeName="transform" 
                      type="translate" 
                      values="0,0; 75,0; 0,0" 
                      dur="5s" 
                      repeatCount="indefinite" 
                      keyTimes="0; 0.5; 1"
                      calcMode="spline"
                      keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                    />
                    <rect x="20" y="104" width="25" height="12" fill="#71717a" rx="2" />
                    <polygon points="45,100 50,96 50,124 45,120" fill="#a1a1aa" />
                    <circle cx="25" cy="110" r="2.5" fill="#f43f5e" />
                  </g>
                </svg>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[
                  { label: "Torch Dist.", value: `${torchDist} m` },
                  { label: "Shadow Ht.", value: `${shadowHt} cm` },
                  { label: "Light Status", value: "Active" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2">
                    <div className="font-mono-label text-[9px] uppercase tracking-wider text-zinc-500">{m.label}</div>
                    <div className="font-display text-xs text-white font-bold mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timer card */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute bottom-4 left-2 w-56 rounded-xl border border-cyan-500/20 bg-zinc-900/80 backdrop-blur-2xl p-4 shadow-[0_0_35px_rgba(34,211,238,0.12)]"
              data-testid="hero-mock-timer"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Timer className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-mono-label text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  Checkpoint Prep · Cambridge Primary
                </span>
              </div>
              <div className="font-display text-2xl font-black tabular-nums text-white">
                01<span className="text-cyan-400">:</span>24<span className="text-cyan-400">:</span>17
              </div>
              <div className="mt-3 h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-cyan-400 to-emerald-400" />
              </div>
            </motion.div>

            {/* Draw tool card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute bottom-4 right-2 w-48 rounded-xl border border-emerald-500/20 bg-zinc-900/80 backdrop-blur-2xl p-4 shadow-[0_0_35px_rgba(52,211,153,0.1)]"
              data-testid="hero-mock-worksheet"
            >
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono-label text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  Draw Tool
                </span>
              </div>
              <svg viewBox="0 0 200 80" className="w-full">
                <path d="M10 50 Q 40 10 70 40 T 130 35 T 190 55" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <text x="10" y="75" fontFamily="monospace" fontSize="8" fill="#71717a">Angle of Incidence = Angle of Reflection</text>
              </svg>
            </motion.div>

            {/* Streak pill */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="absolute -top-3 right-6 px-3.5 py-2 rounded-full border border-white/10 bg-zinc-900/80 backdrop-blur-2xl flex items-center gap-2"
              data-testid="hero-mock-streak"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-mono-label text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                7-Day Streak
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="mt-20 max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-zinc-500 font-semibold">
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-mono-label text-[10px] uppercase tracking-[0.22em]">Trusted by educators worldwide</span>
      </div>
    </section>
  );
}

/* ── 3. CURRICULUM STRIP ── */
function CurriculumStrip() {
  const BADGES = [
    { icon: Globe, label: "Cambridge Primary Science" },
    { icon: GraduationCap, label: "Cambridge Primary Math" },
    { icon: BookOpen, label: "Primary Science Labs" },
    { icon: Compass, label: "Primary Math Labs" },
    { icon: Award, label: "Primary Checkpoint Prep" },
    { icon: Library, label: "Primary English Labs" },
  ];

  return (
    <section id="curriculum" data-testid="curriculum-strip" className="relative py-10 border-y border-white/5 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div className="max-w-md">
            <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-400">
              · Curriculum coverage
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-3 text-white">
              Aligned with the world&apos;s most rigorous frameworks.
            </h2>
          </div>
          <p className="text-sm text-zinc-500 max-w-sm leading-relaxed font-medium">
            Every lesson, simulation and exam paper is mapped directly to the official syllabus
            outcomes — so nothing you study is wasted.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              data-testid={`curriculum-badge-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="group flex items-center gap-2.5 px-4 py-3.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <Icon className="h-4 w-4 text-cyan-400 group-hover:text-emerald-400 transition-colors shrink-0" />
              <span className="text-[12.5px] font-semibold text-zinc-300 tracking-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 4. FEATURES BENTO ── */
function FeaturesBento() {
  return (
    <section id="features" data-testid="features-section" className="relative py-8 lg:py-10 bg-zinc-950/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-emerald-400">
            · The platform
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mt-3 leading-[1.05] text-white">
            Built for how students{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              actually learn.
            </span>
          </h2>
          <p className="text-zinc-400 mt-5 text-lg leading-relaxed">
            Four product pillars, one cohesive learning environment. No more juggling tabs, PDFs
            and broken simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(220px,auto)]">
          {/* Simulations */}
          <BentoCard
            className="md:col-span-2 lg:col-span-2 lg:row-span-2"
            tag="01 · Interactive simulations"
            tagColor="text-cyan-400"
            title="Drag, tweak, explore — built for curiosity."
            description="120+ Cambridge Primary Science & Mathematics interactive models rendered in real time. Drag light sources, adjust variables, watch shadows move, and build genuine intuition."
            testid="feature-simulations"
          >
            <div className="mt-6 relative h-56 rounded-xl border border-white/10 overflow-hidden bg-zinc-950">
              <img
                src="https://images.pexels.com/photos/29067691/pexels-photo-29067691.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Simulation"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="font-mono-label text-[10px] uppercase tracking-[0.18em] text-cyan-400">
                    Live · Primary Science · Light & Shadows
                  </div>
                  <div className="font-display text-lg font-bold text-white mt-1">Shadow Length ⇌ Torch Distance</div>
                </div>
                <div className="px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-mono-label text-[9px] font-bold">
                  RUNNING
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Draw tools */}
          <BentoCard
            tag="02 · Draw tools"
            tagColor="text-emerald-400"
            title="Annotate worksheets like paper."
            description="Sketch diagrams, mark up vectors, highlight equations. Saved automatically."
            icon={<PenTool className="h-5 w-5 text-emerald-400" />}
            testid="feature-drawtools"
          >
            <div className="mt-5 rounded-lg border border-white/10 bg-zinc-950 p-3">
              <svg viewBox="0 0 220 90" className="w-full h-20">
                <path d="M10 70 Q 40 10 80 40 T 160 30 T 215 60" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M10 80 L 215 80" stroke="rgba(255,255,255,0.08)" />
                <circle cx="80" cy="40" r="3" fill="#22d3ee" />
                <text x="88" y="36" fontFamily="monospace" fontSize="8" fill="#a1a1aa">shadow path</text>
              </svg>
              <div className="flex items-center gap-1 mt-2">
                {["#22d3ee", "#34d399", "#f59e0b", "#f43f5e"].map((c) => (
                  <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                ))}
                <div className="ml-auto font-mono-label text-[9px] uppercase tracking-wider text-zinc-500">auto-saved</div>
              </div>
            </div>
          </BentoCard>

          {/* Laser Pointer */}
          <BentoCard
            tag="03 · Student Dashboard"
            tagColor="text-cyan-400"
            title="Everything in one place."
            description="An interactive hub for students to track streaks, study progress, and launch simulations."
            icon={<GraduationCap className="h-5 w-5 text-cyan-400" />}
            testid="feature-studentdashboard"
          >
            <div className="mt-5 rounded-lg border border-white/10 bg-zinc-950 p-4 relative overflow-hidden flex flex-col justify-center h-[120px]">
              {/* Pulsing indicator */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Student Hub</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2 h-[80px]">
                {/* Left Card: Streak */}
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 24 24">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
                    </svg>
                    <span className="text-[8px] font-mono-label text-zinc-400 font-bold">STREAK</span>
                  </div>
                  <div>
                    <div className="text-sm font-display font-black text-white leading-none">5 Days</div>
                    <span className="text-[6.5px] text-zinc-500 font-semibold mt-0.5 block leading-none">Daily Goals Met</span>
                  </div>
                </div>

                {/* Right Card: Progress Circle */}
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-2.5 flex items-center gap-2">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
                      <motion.circle 
                        cx="16" cy="16" r="13" 
                        fill="none" 
                        stroke="#22d3ee" 
                        strokeWidth="2.5" 
                        strokeDasharray={2 * Math.PI * 13}
                        initial={{ strokeDashoffset: 2 * Math.PI * 13 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 13 * (1 - 0.78) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[7.5px] font-mono font-bold text-cyan-400">78%</span>
                  </div>
                  <div>
                    <div className="text-[8px] font-mono-label text-zinc-400 font-bold">MASTERY</div>
                    <span className="text-[6.5px] text-zinc-500 font-semibold block leading-tight mt-0.5">Syllabus complete</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Auto exams */}
          <BentoCard
            className="md:col-span-3 lg:col-span-2"
            tag="04 · Timed past exams"
            tagColor="text-emerald-400"
            title="Real exam conditions. Instant marking."
            description="Sit past papers under timed conditions. Our engine grades MCQ, structured and long-response questions — then maps your gaps."
            testid="feature-exams"
          >
            <div className="mt-6 grid grid-cols-3 gap-2.5">
              <MockTimer label="Paper 1" time="00:45:00" pct={62} color="cyan" />
              <MockTimer label="Paper 2" time="01:15:00" pct={48} color="emerald" />
              <MockTimer label="Paper 3" time="00:30:00" pct={91} color="cyan" />
            </div>
          </BentoCard>

          {/* Analytics */}
          <BentoCard
            className="md:col-span-2 lg:col-span-2"
            tag="05 · Analytics"
            tagColor="text-cyan-400"
            title="See mastery gaps early."
            description="Granular per-syllabus-point mastery tracking that keeps you ahead."
            icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}
            testid="feature-analytics"
          >
            <div className="mt-6 grid sm:grid-cols-2 gap-4 items-stretch">
              {/* Mini Curriculum Progress Card */}
              <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/60 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-xs text-white">Cambridge Primary</span>
                  <span className="font-mono-label text-[10px] text-rose-500 font-bold">88% avg</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
                    <div className="font-display text-sm font-bold text-white">3</div>
                    <div className="text-[8px] text-zinc-500 font-mono-label uppercase tracking-wider">Subjects</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
                    <div className="font-display text-sm font-bold text-white">12</div>
                    <div className="text-[8px] text-zinc-500 font-mono-label uppercase tracking-wider">Studied</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
                    <div className="font-display text-sm font-bold text-white">15/15</div>
                    <div className="text-[8px] text-zinc-500 font-mono-label uppercase tracking-wider">Tasks</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[8px] text-zinc-500 font-mono-label mb-1">
                    <span>PROGRESS</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>

              {/* Mini Weekly Study Velocity Bar Chart */}
              <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/60 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20">
                  <div className="w-full h-px bg-white/10" />
                  <div className="w-full h-px bg-white/10" />
                  <div className="w-full h-px bg-white/10" />
                </div>
                
                <div className="relative flex items-end justify-between gap-1.5 h-16 mt-2">
                  {[0, 0, 2, 2, 2, 2, 0].map((val, idx) => {
                    const days = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
                    const heightPercent = val === 2 ? "70%" : "8%";
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group/bar relative">
                        <div className="absolute -top-7 scale-0 group-hover/bar:scale-100 transition-all duration-200 bg-zinc-900 border border-white/10 text-[9px] px-1.5 py-0.5 rounded text-white font-mono-label z-10">
                          {val} hrs
                        </div>
                        <div 
                          className={`w-full rounded-md transition-all duration-300 ${
                            val > 0 
                              ? "bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.35)] group-hover/bar:shadow-[0_0_20px_rgba(139,92,246,0.65)]" 
                              : "bg-white/5"
                          }`}
                          style={{ height: heightPercent }}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between text-[8px] font-mono-label text-zinc-500 font-bold">
                  {["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"].map(d => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>
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
    <section data-testid="journey-section" className="relative py-12 lg:py-14 bg-zinc-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
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

          <div className="space-y-12">
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
function SubjectsGrid() {
  const SUBJECTS = [
    { name: "English", icon: BookText, topics: 14, accent: "emerald" },
    { name: "Mathematics", icon: Sigma, topics: 18, accent: "cyan" },
    { name: "Science", icon: FlaskConical, topics: 16, accent: "emerald" },
  ];

  const ACCENT = {
    cyan: {
      border: "hover:border-cyan-500/40",
      iconWrap: "border-cyan-500/20 bg-cyan-500/5 group-hover:bg-cyan-500/10",
      icon: "text-cyan-400",
    },
    emerald: {
      border: "hover:border-emerald-500/40",
      iconWrap: "border-emerald-500/20 bg-emerald-500/5 group-hover:bg-emerald-500/10",
      icon: "text-emerald-400",
    },
  };

  return (
    <section id="subjects" data-testid="subjects-section" className="relative py-8 lg:py-10 bg-zinc-950/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="max-w-xl">
            <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-emerald-400">
              · Subjects
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter mt-3 leading-[1.05] text-white">
              Syllabus-aligned subjects.
            </h2>
          </div>
          <p className="text-zinc-500 text-sm max-w-sm font-semibold">
            Interactive labs, drawing worksheets and mock checkpoint papers for all core primary subjects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {SUBJECTS.map((s) => {
            const a = ACCENT[s.accent];
            return (
              <div
                key={s.name}
                data-testid={`subject-${s.name.toLowerCase().replace(/[^a-z]/g, "")}`}
                className={`group relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 ${a.border} hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}
              >
                <div className={`h-10 w-10 rounded-lg border ${a.iconWrap} grid place-items-center mb-4 transition-colors`}>
                  <s.icon className={`h-5 w-5 ${a.icon}`} />
                </div>
                <div className="font-display text-lg font-bold text-white tracking-tight">{s.name}</div>
                <div className="font-mono-label text-[10px] uppercase tracking-wider text-zinc-500 mt-1 font-bold">
                  {s.topics} Topics · Cambridge Curriculum
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 7. TESTIMONIALS ── */
function Testimonials() {
  const TESTIMONIAL_DATA = [
    {
      quote: "My son struggled with fractions, but after using the interactive visuals and worksheets, he got an A in his Cambridge Primary checkpoint tests!",
      name: "Aanya Sharma",
      role: "Parent · Cambridge Primary Grade 5",
      img: "https://images.pexels.com/photos/13538613/pexels-photo-13538613.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=65&w=65",
    },
    {
      quote: "The checkpoint prep mock tests feel exactly like the real exam. My daughter walked into Grade 6 with zero panic.",
      name: "Marcus Hale",
      role: "Parent · Cambridge Primary",
      img: "https://images.pexels.com/photos/36608621/pexels-photo-36608621.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=65&w=65",
    },
    {
      quote: "I got a top grade in my Cambridge Primary Science checkpoint exam thanks to these simulations! Annotating worksheets directly saves hours.",
      name: "Liang Wei",
      role: "Cambridge Primary Student",
      img: "https://images.pexels.com/photos/8085257/pexels-photo-8085257.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
  ];

  return (
    <section data-testid="testimonials-section" className="relative py-8 lg:py-10 bg-zinc-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-400">
            · Student stories
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter mt-3 leading-[1.05] text-white">
            Results that speak louder than marketing copy.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIAL_DATA.map((t, i) => (
            <div
              key={i}
              data-testid={`testimonial-${i}`}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-7 hover:border-cyan-500/30 transition-all duration-300"
            >
              <Quote className="h-5 w-5 text-cyan-400/60 mb-5" />
              <p className="text-zinc-200 leading-relaxed text-[15px]">{t.quote}</p>
              <div className="mt-7 flex items-center gap-3 pt-5 border-t border-white/5">
                <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/10 bg-zinc-900">
                  <img src={t.img} alt={t.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="font-display font-semibold text-sm text-white">{t.name}</div>
                  <div className="font-mono-label text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{t.role}</div>
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
      name: "Explorer",
      badge: null,
      price: "Free",
      originalPrice: null,
      discountBadge: null,
      savingsAmount: null,
      sub: "Forever",
      description: "Get a taste of the platform. Perfect for trying out a few simulations and lessons.",
      features: [
        "3 simulations / month",
        "1 subject sandbox",
        "Community support",
        "Basic exam timer",
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
        "Unlimited access to the simulations",
        "All subjects & auto-timed checkpoints",
        "Drawable worksheets with sketch tools",
        "Full PDF notes & video lessons",
        "Priority student support",
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
        "All student features included",
        "Interactive explanation whiteboard",
        "Teacher dashboard & analytics",
        "Advanced simulation playbacks",
        "Priority teacher support",
      ],
      cta: "Get started as a teacher",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" data-testid="pricing-section" className="relative pt-4 pb-8 bg-zinc-950/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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

        <div className="grid lg:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.id}
              data-testid={`plan-${p.id}`}
              className={`relative rounded-2xl border p-6 backdrop-blur-2xl transition-all duration-300 flex flex-col ${
                p.highlight
                  ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/[0.07] via-zinc-900/40 to-emerald-500/[0.07] shadow-[0_0_60px_-15px_rgba(34,211,238,0.35)]"
                  : p.id === "teacher"
                  ? "border-violet-500/30 bg-gradient-to-br from-violet-500/[0.05] via-zinc-900/40 to-purple-500/[0.04] hover:border-violet-400/40"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              {/* Badge */}
              {p.badge && (
                <div className="absolute -top-3 left-8 px-3 py-1 rounded-full text-[10px] font-mono-label uppercase tracking-[0.18em] bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-bold">
                  {p.badge}
                </div>
              )}

              {/* Plan name */}
              <div className={`font-mono-label text-[10px] uppercase tracking-[0.22em] font-bold ${
                p.highlight ? "text-cyan-400" : p.id === "teacher" ? "text-violet-400" : "text-zinc-500"
              }`}>
                {p.name}
              </div>

              {/* Price block */}
              <div className="mt-4 flex flex-col gap-2">
                {p.originalPrice ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xl line-through text-zinc-500 font-medium">{p.originalPrice}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                        {p.discountBadge}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-6xl font-extrabold tracking-tight drop-shadow-[0_0_20px_rgba(52,211,153,0.15)] ${
                        p.highlight
                          ? "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                          : "bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"
                      }`}>
                        {p.price}
                      </span>
                      <span className="text-sm text-zinc-400 font-semibold">{p.sub}</span>
                    </div>
                    {p.savingsAmount && (
                      <div className={`text-xs font-semibold flex items-center gap-1.5 mt-1 rounded-lg py-1.5 px-3 w-fit border ${
                        p.highlight
                          ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
                          : "text-violet-400 bg-violet-500/5 border-violet-500/10"
                      }`}>
                        <span>🎉 You save {p.savingsAmount} instantly</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl font-black tracking-tighter text-white">{p.price}</span>
                    <span className="text-sm text-zinc-500 font-semibold">{p.sub}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed min-h-[2.5rem]">{p.description}</p>

              {/* CTA */}
              <Link
                to="/register"
                data-testid={`plan-cta-${p.id}`}
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  p.highlight
                    ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 hover:shadow-[0_0_30px_rgba(34,211,238,0.45)]"
                    : p.id === "teacher"
                    ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/40 text-violet-200 hover:from-violet-500/30 hover:to-purple-500/30 hover:border-violet-400/60"
                    : "border border-white/15 text-white hover:bg-white/5"
                }`}
              >
                {p.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              {/* Divider */}
              <div className={`mt-4 mb-4 h-px w-full ${
                p.highlight ? "bg-cyan-500/20" : p.id === "teacher" ? "bg-violet-500/20" : "bg-white/5"
              }`} />

              {/* Features */}
              <ul className="space-y-2 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${
                      p.highlight ? "text-cyan-400" : p.id === "teacher" ? "text-violet-400" : "text-emerald-400"
                    }`} />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
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
    { title: "Curriculum", links: ["Cambridge Primary Science", "Cambridge Primary Math", "Cambridge Primary English"] },
    { title: "Company", links: ["About", "Educators", "Careers", "Press"] },
    { title: "Resources", links: ["Blog", "Help center", "Status", "Changelog"] },
  ];

  return (
    <footer data-testid="site-footer" className="relative pt-8 pb-6 bg-black border-t border-white/5 overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[60%] bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
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
      title: "Cambridge Primary",
      badge: "World-Class Learning for Tomorrow's Leaders",
      desc: "Delivering an engaging Cambridge Primary education through interactive lessons, intelligent assessments, immersive animations, and beautifully designed learning experiences that inspire curiosity and academic excellence.",
      img: "/cam1.webp",
      color: "from-cyan-500/20 to-transparent",
      accent: "text-cyan-400",
      btnText: "Explore Learning →"
    },
    {
      title: "Modern Education, Powered by Innovation",
      badge: "Mentara Learning Platform",
      desc: "Transform every lesson into an engaging digital experience with interactive whiteboards, smart assessments, 3D simulations, drawable worksheets, and powerful teaching tools—all designed for Cambridge Primary classrooms.",
      img: "/feature.webp",
      color: "from-emerald-500/20 to-transparent",
      accent: "text-emerald-400",
      btnText: "Explore Features →"
    },
    {
      title: "Mentara Learning Experience",
      badge: "Modern Education, Timeless Excellence.",
      desc: "Experience a new generation of digital learning with expertly designed worksheets, real-time assessments, progress insights, and interactive educational resources—all built around the Cambridge Primary curriculum.",
      img: "/cam3.webp",
      color: "from-violet-500/20 to-transparent",
      accent: "text-violet-400",
      btnText: "Start Your Journey →"
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
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.title}
              onClick={() => setActiveTab(idx)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
                activeTab === idx
                  ? "bg-white/10 border-white/20 text-white shadow-lg"
                  : "bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {slide.title}
            </button>
          ))}
        </div>

        {/* Dynamic Display Panel */}
        <div className="grid lg:grid-cols-12 gap-8 items-center bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${SLIDES[activeTab].color} opacity-40 blur-3xl -z-10`} />

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
            <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-zinc-950/80 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeTab}
                  src={SLIDES[activeTab].img}
                  alt={SLIDES[activeTab].title}
                  initial={{ opacity: 0, x: 25, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -25, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full h-auto max-h-[460px] aspect-[16/10] ${
                    SLIDES[activeTab].img === "/feature.webp" ? "object-contain bg-zinc-950/90 p-4" : "object-cover"
                  }`}
                />
              </AnimatePresence>
            </div>
          </div>
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
    <section className="pt-8 pb-2 bg-zinc-950/60 relative border-b border-white/5">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
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