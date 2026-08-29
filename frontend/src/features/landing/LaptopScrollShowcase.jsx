import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import {
  PenTool, FileText, Box, Compass, Layers, BarChart3,
  ChevronRight, Sparkles, Monitor, Cpu, CheckCircle2
} from "lucide-react";

const FEATURES = [
  {
    id: 1,
    number: "01",
    tag: "INTERACTIVE BOARD",
    title: "Interactive Board",
    description: "Write, draw, and explain live with drawing and laser pens.",
    image: "/assets/laptop_1.webp",
    accent: "from-cyan-500 to-blue-500",
    glowColor: "rgba(6, 182, 212, 0.35)",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    icon: PenTool
  },
  {
    id: 2,
    number: "02",
    tag: "DIGITAL WORKSHEETS",
    title: "Digital Worksheets",
    description: "Interactive drawable worksheets to practice concepts.",
    image: "/assets/laptop_2.webp",
    accent: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.35)",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: FileText
  },
  {
    id: 3,
    number: "03",
    tag: "SIMULATIONS",
    title: "Simulations",
    description: "Live 3D environments making lessons effective.",
    image: "/assets/laptop_3.webp",
    accent: "from-purple-500 to-pink-500",
    glowColor: "rgba(168, 85, 247, 0.35)",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    icon: Box
  },
  {
    id: 4,
    number: "04",
    tag: "GEOMETRY TOOLS",
    title: "Geometry Tools",
    description: "Draw angles and measure lengths with virtual rulers and protractors.",
    image: "/assets/laptop_4.webp",
    accent: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.35)",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: Compass
  },
  {
    id: 5,
    number: "05",
    tag: "DIFFICULTY LEVELS",
    title: "Difficulty Levels",
    description: "Questions aligned with Foundation, Developing, and Secure stages.",
    image: "/assets/laptop_5.webp",
    accent: "from-rose-500 to-red-500",
    glowColor: "rgba(244, 63, 94, 0.35)",
    badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    icon: Layers
  },
  {
    id: 6,
    number: "06",
    tag: "LEARNING ANALYTICS",
    title: "Learning Analytics",
    description: "Granular reporting mapping masteries and velocity.",
    image: "/assets/laptop_6.webp",
    accent: "from-indigo-500 to-violet-500",
    glowColor: "rgba(99, 102, 241, 0.35)",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    icon: BarChart3
  }
];

export default function LaptopScrollShowcase() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Eagerly preload all 6 feature images into browser cache on mount for zero-lag instant switching
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

  // Small natural sideways movement of the whole laptop
  const rawRotateY = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [-3, 2, -2, 2, -1, 0]
  );

  const rotateY = useSpring(rawRotateY, {
    stiffness: 80,
    damping: 22,
  });

  // =====================================================
  // LAPTOP LID CLOSING ANIMATION (Closing fully at the end)
  // =====================================================
  // 0°  = completely open & clear view (Feature 01)
  // 8°  = almost open (Feature 02)
  // 16° = screen clearly visible (Feature 03)
  // 25° = slightly closed (Feature 04)
  // 38° = noticeably closed (Feature 05)
  // 55° = starting smooth closing motion (Feature 06)
  // 88° = FULLY CLOSED FLAT (Section Exit)
  const rawLidAngle = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 0.92, 1],
    [0, 8, 16, 25, 38, 55, 88]
  );

  const lidAngle = useSpring(rawLidAngle, {
    stiffness: 70,
    damping: 20,
  });

  // Dynamic glare shift across glass screen
  const rawGlareX = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const glareX = useSpring(rawGlareX, { stiffness: 50, damping: 25 });

  // Dynamic shadow under lid as it closes fully
  const lidShadowOpacity = useTransform(lidAngle, [0, 40, 88], [0.1, 0.3, 0.65]);

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
        className="relative h-[600vh] bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500/30"
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

              {/* LEFT COLUMN: REALISTIC 3D LAPTOP MOCKUP WITH REAL HINGE ROTATION (7 COLS) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center relative perspective-[1400px]">
                <motion.div
                  style={{
                    rotateY,
                    transformStyle: "preserve-3d",
                    transformPerspective: 1400,
                  }}
                  className="w-full max-w-[760px] relative"
                >
                  {/* ===================================================== */}
                  {/* MOVING LAPTOP SCREEN / LID (ROTATING FROM BOTTOM HINGE) */}
                  {/* ===================================================== */}
                  <motion.div
                    className="relative w-full aspect-[16/10]"
                    style={{
                      rotateX: lidAngle,
                      transformOrigin: "50% 100%",
                      transformStyle: "preserve-3d",
                      zIndex: 20,
                    }}
                  >
                    {/* DISPLAY SCREEN FRAME */}
                    <div className="relative w-full h-full bg-zinc-900 rounded-[22px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-zinc-700/60 overflow-hidden ring-1 ring-white/10">
                      
                      {/* WEBCAM & BEZEL HEADER */}
                      <div className="absolute top-1.5 inset-x-0 h-3 flex items-center justify-center gap-1.5 z-30 pointer-events-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 ring-1 ring-zinc-700" />
                        <div className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse" />
                      </div>

                      {/* MOCK BROWSER HEADER BAR INSIDE DISPLAY */}
                      <div className="h-7 w-full bg-zinc-950/90 backdrop-blur-md border-b border-white/10 px-3.5 flex items-center justify-between z-20 relative text-[11px] font-mono text-zinc-400">
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

                      {/* SCREEN CONTENT VIEWPORT WITH ANIMATE PRESENCE */}
                      <div className="relative w-full h-[calc(100%-28px)] bg-zinc-950 overflow-hidden">
                        {/* DYNAMIC SPECULAR GLASS REFLECTION */}
                        <motion.div
                          style={{ x: glareX }}
                          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.09] pointer-events-none z-20"
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
                                scale: isActive ? 1 : 1.03,
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

                    {/* DYNAMIC LID DROP SHADOW AS IT CLOSES */}
                    <motion.div
                      className="absolute left-[3%] right-[3%] bottom-0 h-8 bg-black/50 blur-xl pointer-events-none"
                      style={{ opacity: lidShadowOpacity }}
                    />
                  </motion.div>

                  {/* ===================================================== */}
                  {/* FIXED LAPTOP BASE DECK (STAYS FLAT WHILE LID ROTATES) */}
                  {/* ===================================================== */}
                  <div className="w-full h-2 bg-gradient-to-b from-zinc-800 to-zinc-900 mx-auto rounded-b-sm shadow-inner" />

                  <div className="relative w-[106%] -ml-[3%] h-4 sm:h-5 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 rounded-b-[18px] border-t border-zinc-600/50 shadow-[0_20px_40px_rgba(0,0,0,0.9)] flex items-center justify-center">
                    <div className="w-24 h-1 bg-zinc-950/80 rounded-full border-t border-white/10" />
                  </div>

                  <div className="w-[90%] mx-auto h-4 bg-cyan-500/20 blur-xl rounded-full -mt-2 opacity-60" />
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
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                        <span>Real-time desktop & tablet responsiveness</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Aligned with Cambridge Primary Framework</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* QUICK SELECTOR PILL BUTTONS */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2">
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
