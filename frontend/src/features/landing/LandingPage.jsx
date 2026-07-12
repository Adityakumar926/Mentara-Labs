import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { studentApi } from "@/api/services";
import { 
  ArrowUpRight, Play, Timer, Atom, PenTool, Sparkles, ChevronRight, 
  Globe, BookOpen, GraduationCap, Award, Library, Compass, X, Menu,
  Dna, Sigma, Code2, LineChart, Globe2, BookText, Check, Quote,
  Github, Twitter, Linkedin, Youtube, Star, BarChart3, Layers, FlaskConical
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
        <FeaturesBento />
        <LearningJourney />
        <SubjectsGrid />
        <Testimonials />
        <Pricing />
        <FAQ />
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
    { label: "FAQ", href: "#faq" },
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
    <section data-testid="hero-section" className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-zinc-950">
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
    <section id="curriculum" data-testid="curriculum-strip" className="relative py-20 border-y border-white/5 bg-zinc-950">
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
    <section id="features" data-testid="features-section" className="relative py-28 lg:py-36 bg-zinc-950/20">
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

          {/* Premium content */}
          <BentoCard
            tag="03 · Premium content"
            tagColor="text-cyan-400"
            title="Written by examiners. Reviewed by teachers."
            description="Every topic, every subtopic, every command term — covered to syllabus depth."
            icon={<Sparkles className="h-5 w-5 text-cyan-400" />}
            testid="feature-content"
          >
            <div className="mt-5 space-y-2">
              {[
                { c: "Primary Science (Forces, Plants, Materials)", p: 92 },
                { c: "Primary Mathematics (Fractions, Geometry)", p: 78 },
                { c: "Primary English (Phonics, Comprehension)", p: 84 },
              ].map((t) => (
                <div key={t.c}>
                  <div className="flex justify-between text-[10px] font-mono-label text-zinc-500 uppercase tracking-wider font-semibold">
                    <span>{t.c}</span><span>{t.p}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 mt-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${t.p}%` }} />
                  </div>
                </div>
              ))}
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
    <section data-testid="journey-section" className="relative py-28 lg:py-32 bg-zinc-950 border-y border-white/5">
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
    { name: "Science", icon: FlaskConical, topics: 16, accent: "emerald" },
    { name: "Mathematics", icon: Sigma, topics: 18, accent: "cyan" },
    { name: "English", icon: BookText, topics: 14, accent: "emerald" },
    { name: "Global Perspectives", icon: Globe2, topics: 8, accent: "cyan" },
    { name: "Digital Literacy", icon: Code2, topics: 10, accent: "cyan" },
    { name: "Art & Design", icon: PenTool, topics: 6, accent: "emerald" },
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
    <section id="subjects" data-testid="subjects-section" className="relative py-28 lg:py-32 bg-zinc-950/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {SUBJECTS.map((s) => {
            const a = ACCENT[s.accent];
            return (
              <div
                key={s.name}
                data-testid={`subject-${s.name.toLowerCase().replace(/[^a-z]/g, "")}`}
                className={`group relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-5 ${a.border} hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}
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
    <section data-testid="testimonials-section" className="relative py-28 lg:py-32 bg-zinc-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
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
        "Unlimited simulations & animations",
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
    <section id="pricing" data-testid="pricing-section" className="relative py-28 lg:py-36 bg-zinc-950/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-emerald-400">
            · Pricing
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mt-3 leading-[1.05] text-white">
            Premium learning,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              honestly priced.
            </span>
          </h2>
          <p className="text-zinc-400 mt-5 text-lg">No hidden fees. Cancel anytime. Built for learners and teachers alike.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.id}
              data-testid={`plan-${p.id}`}
              className={`relative rounded-2xl border p-8 backdrop-blur-2xl transition-all duration-300 flex flex-col ${
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
              <p className="text-sm text-zinc-400 mt-3 leading-relaxed min-h-[3rem]">{p.description}</p>

              {/* CTA */}
              <Link
                to="/register"
                data-testid={`plan-cta-${p.id}`}
                className={`mt-7 inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all ${
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
              <div className={`mt-7 mb-5 h-px w-full ${
                p.highlight ? "bg-cyan-500/20" : p.id === "teacher" ? "bg-violet-500/20" : "bg-white/5"
              }`} />

              {/* Features */}
              <ul className="space-y-3 flex-1">
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
    <section id="faq" data-testid="faq-section" className="relative py-28 lg:py-32 bg-zinc-950 border-t border-white/5">
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
    <footer data-testid="site-footer" className="relative pt-28 pb-12 bg-black border-t border-white/5 overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[60%] bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* CTA Banner */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/[0.08] via-zinc-900/40 to-emerald-500/[0.08] backdrop-blur-2xl p-10 lg:p-14 mb-24">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="font-mono-label text-[10px] uppercase tracking-[0.24em] text-cyan-400">
                · Get started
              </span>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-3 leading-[1.05] text-white">
                Study smarter, not louder. Try Mentara Labs free.
              </h3>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Link
                to="/register"
                data-testid="footer-cta-start"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-semibold text-sm hover:shadow-[0_0_30px_rgba(34,211,238,0.45)] transition-shadow"
              >
                Start free trial
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                data-testid="footer-cta-demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-white font-medium text-sm hover:bg-white/5 transition-all"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid lg:grid-cols-12 gap-10 pb-16">
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
      title: "International Curriculum",
      badge: "Learn with Confidence. Grow with Excellence.",
      desc: "Aligned with the Cambridge Primary framework, every lesson is thoughtfully crafted to help students strengthen conceptual understanding, develop critical thinking, and achieve their full potential.",
      img: "/cam2.webp",
      color: "from-emerald-500/20 to-transparent",
      accent: "text-emerald-400",
      btnText: "View Curriculum →"
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
    <section className="py-24 bg-zinc-950/40 relative border-b border-white/5">
      <div className="absolute inset-0 -z-10 bg-grid opacity-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
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
                  className="w-full h-auto object-cover max-h-[460px] aspect-[16/10]"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}