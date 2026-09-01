import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import {
  Atom, Bot, GraduationCap, PenTool, Compass, Layers,
  Sparkles, CheckCircle2
} from "lucide-react";

const FEATURES = [
  {
    id: 1,
    number: "01",
    tag: "CAMBRIDGE PRIMARY",
    title: "Cambridge Primary",
    description: "Empower young minds with interactive lessons, 3D science labs, and drawing worksheets built for Cambridge Primary Stage 1 to 6.",
    image: "/cam1.webp",
    accent: "from-cyan-500 to-teal-500",
    glowColor: "rgba(6, 182, 212, 0.35)",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    icon: Atom,
    highlights: [
      "Interactive lessons & 3D science simulations",
      "Aligned with Cambridge Primary Stage 1 to 6"
    ]
  },
  {
    id: 2,
    number: "02",
    tag: "STUDENT DASHBOARD",
    title: "Student Dashboard",
    description: "Track study streaks, complete drawable activities, monitor checkpoint progress, and learn alongside GOGO AI Tutor 24/7.",
    image: "/dashboard.webp",
    accent: "from-purple-500 to-indigo-500",
    glowColor: "rgba(168, 85, 247, 0.35)",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    icon: Bot,
    highlights: [
      "Study streaks & drawable checkpoint progress",
      "Built-in GOGO AI Tutor assistance 24/7"
    ]
  },
  {
    id: 3,
    number: "03",
    tag: "CURRICULUM EXCELLENCE",
    title: "Curriculum Excellence",
    description: "Take a look inside the modern teacher learning suite built specifically for Cambridge Primary Stage 1 to 6.",
    image: "/feature.webp",
    accent: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.35)",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: GraduationCap,
    highlights: [
      "Designed specifically for Cambridge curriculums",
      "Real-time desktop & tablet responsiveness"
    ]
  },
  {
    id: 4,
    number: "04",
    tag: "INTERACTIVE BOARD",
    title: "Interactive Board",
    description: "Write, draw, and explain live with drawing and laser pens.",
    image: "/assets/laptop_1.webp",
    accent: "from-sky-500 to-cyan-500",
    glowColor: "rgba(14, 165, 233, 0.35)",
    badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    icon: PenTool,
    highlights: [
      "Smooth multi-stroke canvas drawings",
      "Live laser pointer & annotation pens"
    ]
  },
  {
    id: 5,
    number: "05",
    tag: "GEOMETRY TOOLS",
    title: "Geometry Tools",
    description: "Draw angles and measure lengths with virtual rulers and protractors.",
    image: "/assets/laptop_4.webp",
    accent: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.35)",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: Compass,
    highlights: [
      "Virtual rotating protractor & ruler measurements",
      "Dynamic shape creation & grid snapping"
    ]
  },
  {
    id: 6,
    number: "06",
    tag: "DIFFICULTY LEVELS",
    title: "Difficulty Levels",
    description: "Questions aligned with Foundation, Developing, and Secure stages.",
    image: "/assets/laptop_5.webp",
    accent: "from-rose-500 to-red-500",
    glowColor: "rgba(244, 63, 94, 0.35)",
    badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    icon: Layers,
    highlights: [
      "Foundation, Developing, and Secure stages",
      "Adaptive difficulty progression"
    ]
  }
];

export default function LaptopScrollShowcase() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Eagerly preload all feature images into browser cache on mount for zero-lag instant switching
  React.useEffect(() => {
    FEATURES.forEach((feat) => {
      const img = new Image();
      img.src = feat.image;
    });
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth subtle horizontal drift on scroll (stays 100% straight and upright)
  const rawLaptopX = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [-16, 16, -12, 0]
  );
  const laptopX = useSpring(rawLaptopX, {
    stiffness: 65,
    damping: 20,
  });

  // Dynamic glare shift across glass screen
  const rawGlareX = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const glareX = useSpring(rawGlareX, { stiffness: 50, damping: 25 });

  // Dynamic scroll index tracking
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const total = FEATURES.length;
    const idx = Math.min(total - 1, Math.round(latest * (total - 1)));
    if (idx !== activeIndex) {
      setActiveIndex(idx);
    }
  });

  const activeFeature = FEATURES[activeIndex] || FEATURES[0];
  const IconComponent = activeFeature.icon;

  const scrollToFeatureIndex = (index) => {
    if (!containerRef.current) return;
    const sectionTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
    const sectionHeight = containerRef.current.offsetHeight;
    const maxScroll = sectionHeight - window.innerHeight;
    const progress = index / (FEATURES.length - 1);
    window.scrollTo({
      top: sectionTop + maxScroll * progress,
      behavior: "smooth"
    });
  };

  return (
    <>
      {/* INTRO HEADER SECTION */}
      <section className="relative bg-zinc-950 text-zinc-100">
        <div className="pt-16 pb-12 text-center max-w-4xl mx-auto px-6">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 inline-block mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            · PLATFORM HIGHLIGHTS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Teach, Learn, Practice & Excel
            </span>
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg leading-relaxed font-medium max-w-2xl mx-auto">
            Mentara Labs brings the complete Cambridge Primary suite onto one smart,
            interactive platform built for both educators and students.
          </p>
        </div>
      </section>

      {/* SCROLL ENGINE TRACK SECTION */}
      <section
        ref={containerRef}
        id="features-showcase"
        className="relative h-[550vh] bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500/30"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        {/* STICKY VIEWPORT CONTAINER */}
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="relative h-full w-full flex items-center justify-center">

            {/* Ambient Animated Glow */}
            <motion.div
              className="absolute w-[640px] h-[440px] rounded-full blur-[150px] opacity-25 pointer-events-none transition-all duration-700"
              style={{
                background: activeFeature.glowColor,
                top: "28%",
                left: "22%"
              }}
            />

            {/* MAIN DUAL-COLUMN LAYOUT */}
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

              {/* LEFT COLUMN: REALISTIC FRONT-FACING LAPTOP (7 COLS) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
                <motion.div
                  style={{ x: laptopX }}
                  className="w-full max-w-[740px] relative select-none"
                >
                  {/* LAPTOP SCREEN / LID (100% STRAIGHT & FRONT-FACING) */}
                  <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-t-[18px] sm:rounded-t-[22px] p-2.5 sm:p-3 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-zinc-700/80 border-b-0 overflow-hidden ring-1 ring-white/10 z-20">
                    
                    {/* REALISTIC WEBCAM & BEZEL NOTCH */}
                    <div className="absolute top-0 inset-x-0 flex justify-center z-30 pointer-events-none">
                      <div className="bg-zinc-950 px-3.5 py-1 rounded-b-lg border-b border-x border-zinc-800/80 flex items-center gap-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 ring-1 ring-zinc-700/60" />
                        <div className="w-1 h-1 rounded-full bg-emerald-500/90 animate-pulse" />
                      </div>
                    </div>

                    {/* MOCK BROWSER HEADER BAR INSIDE DISPLAY */}
                    <div className="h-7 w-full bg-zinc-950/95 backdrop-blur-md border-b border-white/10 px-3 flex items-center justify-between z-20 relative text-[11px] font-mono text-zinc-400 rounded-t-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-0.5 rounded-full border border-white/5 text-[10.5px] text-zinc-300 font-medium">
                        <span className="text-cyan-400 font-bold">https://</span>
                        <span>mentara.app/feature/{activeFeature.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        <span className="hidden sm:inline text-[10px] uppercase font-bold text-zinc-400">PLATFORM</span>
                      </div>
                    </div>

                    {/* SCREEN CONTENT VIEWPORT */}
                    <div className="relative w-full h-[calc(100%-28px)] bg-zinc-950 overflow-hidden rounded-b-sm">
                      {/* DYNAMIC SPECULAR GLASS REFLECTION */}
                      <motion.div
                        style={{ x: glareX }}
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.07] pointer-events-none z-20"
                      />

                      {/* PRE-RENDERED STACKED IMAGES LAYER FOR INSTANT ZERO-LAG SWITCHING */}
                      {FEATURES.map((feat, index) => {
                        const isActive = index === activeIndex;
                        return (
                          <motion.div
                            key={feat.id}
                            initial={false}
                            animate={{
                              opacity: isActive ? 1 : 0,
                              scale: isActive ? 1 : 1.02,
                              filter: isActive ? "blur(0px)" : "blur(4px)",
                            }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-950 pointer-events-none"
                            style={{ zIndex: isActive ? 10 : 1 }}
                          >
                            <img
                              src={feat.image}
                              alt={feat.title}
                              className="w-full h-full object-cover object-top select-none"
                              loading="eager"
                              onError={(e) => {
                                e.target.style.display = "none";
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = "flex";
                                }
                              }}
                            />
                            
                            {/* Fallback Display Card */}
                            <div className="hidden absolute inset-0 flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-zinc-900 to-zinc-950">
                              <div className={`p-4 rounded-2xl bg-gradient-to-r ${feat.accent} mb-4 shadow-xl`}>
                                <IconComponent className="h-10 w-10 text-white" />
                              </div>
                              <h4 className="text-xl font-bold text-white mb-2">{feat.title}</h4>
                              <p className="text-sm text-zinc-400 max-w-md">{feat.description}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* HINGE BAR */}
                  <div className="w-[99%] mx-auto h-1.5 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 border-t border-zinc-800" />

                  {/* REALISTIC LAPTOP BOTTOM BASE CHASSIS */}
                  <div className="relative w-[105%] -ml-[2.5%] h-3.5 sm:h-4.5 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 rounded-b-[14px] sm:rounded-b-[18px] border-t border-zinc-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-start justify-center">
                    {/* THUMB NOTCH OPENING CUTOUT */}
                    <div className="w-16 sm:w-20 h-1 sm:h-1.5 bg-zinc-950/90 rounded-b-md border-b border-x border-zinc-600/30" />
                  </div>

                  {/* UNDERGLOW REFLECTION */}
                  <div className="w-[92%] mx-auto h-3 bg-cyan-500/20 blur-lg rounded-full -mt-1 opacity-70 pointer-events-none" />
                </motion.div>
              </div>

              {/* RIGHT COLUMN: ACTIVE FEATURE DETAILS (5 COLS) */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                {/* TOP SUBHEADER BADGE */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-zinc-900/80 backdrop-blur-md w-fit mb-6 shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                  <span className="font-mono text-[11px] font-extrabold uppercase tracking-widest text-zinc-300">
                    PLATFORM CAPABILITIES
                  </span>
                </div>

                {/* FEATURE PROGRESS STEP INDICATORS */}
                <div className="flex items-center gap-2 mb-8">
                  {FEATURES.map((feat, index) => (
                    <button
                      key={feat.id}
                      onClick={() => scrollToFeatureIndex(index)}
                      className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                        index === activeIndex
                          ? `w-10 bg-gradient-to-r ${feat.accent} shadow-[0_0_12px_currentColor]`
                          : "w-2.5 bg-zinc-800 hover:bg-zinc-700"
                      }`}
                      aria-label={`Jump to ${feat.title}`}
                    />
                  ))}
                </div>

                {/* DYNAMIC FEATURE CONTENT DISPLAY */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature.id}
                    initial={{ opacity: 0, y: 16, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -16, filter: "blur(3px)" }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4"
                  >
                    {/* ACTIVE FEATURE NUMBER & BADGE */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-black text-zinc-500 tracking-tighter">
                        {activeFeature.number}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider border uppercase ${activeFeature.badgeBg}`}>
                        {activeFeature.tag}
                      </span>
                    </div>

                    {/* FEATURE TITLE */}
                    <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
                      {activeFeature.title}
                    </h3>

                    {/* FEATURE DESCRIPTION */}
                    <p className="text-zinc-400 text-base sm:text-lg leading-relaxed font-normal max-w-xl">
                      {activeFeature.description}
                    </p>

                    {/* FEATURE HIGHLIGHT BULLETS */}
                    <div className="pt-2 flex flex-col gap-2 text-xs sm:text-sm text-zinc-300 font-medium">
                      {(activeFeature.highlights || [
                        "Real-time desktop & tablet responsiveness",
                        "Aligned with Cambridge Primary Framework"
                      ]).map((hl, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${hIdx === 0 ? "text-cyan-400" : "text-emerald-400"}`} />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* QUICK SELECTOR PILL BUTTONS */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {FEATURES.map((f, i) => {
                    const isActive = i === activeIndex;
                    const FIcon = f.icon;
                    return (
                      <button
                        key={f.id}
                        onClick={() => scrollToFeatureIndex(i)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer border ${
                          isActive
                            ? "bg-zinc-800 text-white border-white/20 shadow-md scale-[1.02]"
                            : "bg-zinc-950/60 text-zinc-400 border-white/5 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                      >
                        <FIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                        <span className="truncate">{f.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
