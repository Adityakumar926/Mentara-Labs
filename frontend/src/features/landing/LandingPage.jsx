import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
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
      navigate(user.role === "admin" ? "/admin" : "/courses", { replace: true });
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
      `}</style>

      <main className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
        <Header />
        <Hero />
        <CurriculumStrip />
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
        <a href="#" data-testid="brand-logo" className="flex items-center gap-2.5 group">
          <img src="/mentara-new.png" alt="Mentara Labs Logo" className="h-8 w-8 object-contain" />
          <span className="font-display font-bold text-[16px] tracking-tight">Mentara Labs</span>
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
              Built for Cambridge · IB DP · MYP
            </span>
          </div>

          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tighter text-white">
            The new operating system for{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              global curricula.
            </span>
          </h1>

          <p className="mt-7 text-lg leading-relaxed text-zinc-400 max-w-xl">
            Mentara Labs delivers premium, institution-grade learning for Cambridge IGCSE, A-Level
            and IB Diploma students — powered by interactive simulations, drawable worksheets and
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

            {/* Projectile simulation Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 left-0 right-4 rounded-2xl border border-white/10 bg-zinc-900/65 backdrop-blur-2xl p-5 shadow-2xl"
              data-testid="hero-mock-simulation"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono-label text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  physics · projectile motion
                </span>
              </div>
              <div className="relative h-40 rounded-lg bg-zinc-950/80 border border-white/5 overflow-hidden">
                <svg viewBox="0 0 320 180" className="w-full h-full">
                  <defs>
                    <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  {[...Array(8)].map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="180" stroke="rgba(255,255,255,0.03)" />
                  ))}
                  {[...Array(5)].map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 40} x2="320" y2={i * 40} stroke="rgba(255,255,255,0.03)" />
                  ))}
                  <path d="M10 150 Q 110 -10 300 130" stroke="url(#trail)" strokeWidth="2" fill="none" />
                  <circle cx="200" cy="60" r="5" fill="#22d3ee">
                    <animate attributeName="cx" values="10;300;10" dur="4s" repeatCount="indefinite" />
                    <animate attributeName="cy" values="150;30;150" dur="4s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[
                  { label: "Velocity", value: "42 m/s" },
                  { label: "Angle", value: "37°" },
                  { label: "Range", value: "184 m" },
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
              className="absolute bottom-4 -left-6 w-56 rounded-xl border border-cyan-500/20 bg-zinc-900/80 backdrop-blur-2xl p-4 shadow-[0_0_35px_rgba(34,211,238,0.12)]"
              data-testid="hero-mock-timer"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Timer className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-mono-label text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  Paper 2 · IB Physics HL
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
              className="absolute top-1/2 -right-4 w-48 rounded-xl border border-emerald-500/20 bg-zinc-900/80 backdrop-blur-2xl p-4 shadow-[0_0_35px_rgba(52,211,153,0.1)]"
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
                <text x="10" y="75" fontFamily="monospace" fontSize="8" fill="#71717a">f(x) = sin(x)</text>
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
    { icon: Globe, label: "Cambridge IGCSE" },
    { icon: GraduationCap, label: "Cambridge A-Level" },
    { icon: BookOpen, label: "IB Diploma" },
    { icon: Compass, label: "IB MYP" },
    { icon: Award, label: "Examiner-Reviewed" },
    { icon: Library, label: "Global Standards" },
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
            title="Drag, tweak, break things — then learn why."
            description="240+ Physics, Chemistry & Biology simulations rendered in real time. Adjust variables, watch outcomes change, build genuine intuition."
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
                    Live · Chemistry · Titration
                  </div>
                  <div className="font-display text-lg font-bold text-white mt-1">pH Curve · NaOH ⇌ HCl</div>
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
                <text x="88" y="36" fontFamily="monospace" fontSize="8" fill="#a1a1aa">peak</text>
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
                { c: "Mechanics", p: 92 },
                { c: "Electromagnetism", p: 78 },
                { c: "Quantum Theory", p: 64 },
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
            tag="05 · Analytics"
            tagColor="text-cyan-400"
            title="See mastery gaps early."
            description="Granular per-syllabus-point mastery tracking that keeps you ahead."
            icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}
            testid="feature-analytics"
          >
            <div className="mt-4 flex items-end gap-1.5 h-16">
              {[40, 65, 30, 80, 55, 90, 70, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-cyan-500/40 to-cyan-400"
                  style={{ height: `${h}%` }}
                />
              ))}
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
      title: "Pick your curriculum.",
      body: "Choose Cambridge IGCSE, A-Level, IB DP or MYP. We unlock the exact syllabus you need.",
    },
    {
      n: "02",
      title: "Learn with simulations.",
      body: "Read examiner-reviewed notes, then explore the concept in a live, interactive simulation.",
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
            Our methodology is built on years of working with top-scoring IB and Cambridge students.
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
    { name: "Physics", icon: Atom, topics: 14, accent: "cyan" },
    { name: "Chemistry", icon: FlaskConical, topics: 12, accent: "emerald" },
    { name: "Biology", icon: Dna, topics: 16, accent: "emerald" },
    { name: "Mathematics", icon: Sigma, topics: 18, accent: "cyan" },
    { name: "Computer Science", icon: Code2, topics: 9, accent: "cyan" },
    { name: "Economics", icon: LineChart, topics: 11, accent: "emerald" },
    { name: "Geography", icon: Globe2, topics: 10, accent: "cyan" },
    { name: "English Lit.", icon: BookText, topics: 8, accent: "emerald" },
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
              Every subject. Every exam board. One platform.
            </h2>
          </div>
          <p className="text-zinc-500 text-sm max-w-sm font-semibold">
            Currently 8 core subjects live. Adding 12 more across humanities and languages by next academic cycle.
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
                  {s.topics} Topics · Cambridge · IB
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
      quote: "I went from a 5 to a 7 in IB Physics HL in one term. The simulations are unreal — I actually get circular motion now.",
      name: "Aanya Sharma",
      role: "IB DP Y13 · Singapore",
      img: "https://images.pexels.com/photos/13538613/pexels-photo-13538613.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=65&w=65",
    },
    {
      quote: "The auto-timed mocks feel exactly like the real exam. My daughter walked into A-Levels with zero panic.",
      name: "Marcus Hale",
      role: "Parent · Cambridge A-Level",
      img: "https://images.pexels.com/photos/36608621/pexels-photo-36608621.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=65&w=65",
    },
    {
      quote: "Finally a platform that respects how rigorous IB actually is. The draw worksheets save me printing hours.",
      name: "Liang Wei",
      role: "IB DP Y12 · Hong Kong",
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
  const PLANS = [
    {
      name: "Explorer",
      price: "Free",
      sub: "Forever",
      description: "Get a taste of the platform. Perfect for trying out a few simulations and lessons.",
      features: ["3 simulations / month", "1 subject sandbox", "Community support", "Basic exam timer"],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Scholar",
      price: "$24",
      sub: "/ month",
      description: "Everything a serious Cambridge or IB student needs to top their cohort.",
      features: [
        "Unlimited simulations",
        "All subjects · all syllabi",
        "Drawable worksheets",
        "Auto-timed exams + analytics",
        "Past papers (10+ years)",
        "Priority support",
      ],
      cta: "Start 7-day trial",
      highlight: true,
    },
    {
      name: "Institution",
      price: "Custom",
      sub: "Per cohort",
      description: "For schools, tuition centers and academies running global curricula.",
      features: ["Bulk seats & rosters", "Teacher dashboards", "Custom branding", "Dedicated success manager"],
      cta: "Talk to sales",
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
          <p className="text-zinc-400 mt-5 text-lg">No hidden fees. Cancel anytime. Built for students, not investors.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.name}
              data-testid={`plan-${p.name.toLowerCase()}`}
              className={`relative rounded-2xl border p-8 backdrop-blur-2xl transition-all duration-300 ${
                p.highlight
                  ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/[0.07] via-zinc-900/40 to-emerald-500/[0.07] shadow-[0_0_60px_-15px_rgba(34,211,238,0.35)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-8 px-3 py-1 rounded-full text-[10px] font-mono-label uppercase tracking-[0.18em] bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-bold">
                  Most popular
                </div>
              )}
              <div className="font-mono-label text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-bold">{p.name}</div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-black tracking-tighter text-white">{p.price}</span>
                <span className="text-sm text-zinc-500 font-semibold">{p.sub}</span>
              </div>
              <p className="text-sm text-zinc-400 mt-3 leading-relaxed min-h-[3rem]">{p.description}</p>

              <Link
                to="/register"
                data-testid={`plan-cta-${p.name.toLowerCase()}`}
                className={`mt-7 inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all ${
                  p.highlight
                    ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 hover:shadow-[0_0_30px_rgba(34,211,238,0.45)]"
                    : "border border-white/15 text-white hover:bg-white/5"
                }`}
              >
                {p.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              <ul className="mt-7 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.highlight ? "text-cyan-400" : "text-emerald-400"}`} />
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
      q: "Which exam boards do you support?",
      a: "Today we fully support Cambridge IGCSE, Cambridge A-Level, and IB Diploma Programme (HL & SL). IB MYP is in beta. We add new boards based on student demand.",
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
    { title: "Curriculum", links: ["Cambridge IGCSE", "Cambridge A-Level", "IB Diploma", "IB MYP"] },
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
            <div className="flex items-center gap-2 mb-5">
              <img src="/mentara-new.png" alt="Mentara Labs Logo" className="h-7 w-7 object-contain" />
              <span className="font-display font-bold text-[15px] tracking-tight text-white">Mentara Labs</span>
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