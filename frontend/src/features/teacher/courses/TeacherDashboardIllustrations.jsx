import React from 'react';

/* ── Rounded Puffy 5-Point Star Badge for Stage 1–6 Cards ── */
export function StarNumberBadge({ number = 1, color = '#FF6B8B', glow = 'rgba(255, 107, 139, 0.25)' }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '54px',
        height: '54px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: `drop-shadow(0 6px 12px ${glow})`,
      }}
    >
      <svg viewBox="0 0 64 64" width="54" height="54" fill="none">
        <path
          d="M35.5 5.8C34.1 3.1 30.2 3.1 28.8 5.8L23.1 16.8C22.5 17.9 21.5 18.6 20.3 18.8L8.1 20.8C5.1 21.3 3.9 25 6 27.1L14.7 35.9C15.5 36.7 15.9 37.9 15.7 39.1L13.8 51.3C13.3 54.3 16.5 56.6 19.2 55.2L30.3 49.6C31.4 49 32.8 49 33.9 49.6L45 55.2C47.7 56.6 50.9 54.3 50.4 51.3L48.5 39.1C48.3 37.9 48.7 36.7 49.5 35.9L58.2 27.1C60.3 25 59.1 21.3 56.1 20.8L43.9 18.8C42.7 18.6 41.7 17.9 41.1 16.8L35.5 5.8Z"
          fill={color}
        />
        <path
          d="M32 8C31.2 8 30.5 8.4 30.1 9.1L25.2 18.6C24.4 20.1 22.9 21.2 21.2 21.5L10.6 23.2C9 23.5 8.4 25.4 9.5 26.5L17.1 34.1C18.3 35.3 18.9 37 18.6 38.7L16.9 49.3C16.6 50.9 18.3 52.1 19.7 51.4L29.3 46.5C30.8 45.7 32.6 45.7 34.1 46.5L43.7 51.4C45.1 52.1 46.8 50.9 46.5 49.3L44.8 38.7C44.5 37 45.1 35.3 46.3 34.1L53.9 26.5C55 25.4 54.4 23.5 52.8 23.2L42.2 21.5C40.5 21.2 39 20.1 38.2 18.6L33.3 9.1C32.9 8.4 32.5 8 32 8Z"
          fill="white"
          fillOpacity="0.14"
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#FFFFFF',
          lineHeight: 1,
          marginTop: '2px',
        }}
      >
        {number}
      </span>
    </div>
  );
}

/* ── Teacher Zone 3D-Style Purple Graduation Cap Illustration ── */
export function TeacherZoneCapIllustration() {
  return (
    <svg viewBox="0 0 120 82" width="88" height="62" fill="none" style={{ filter: 'drop-shadow(0 8px 14px rgba(109, 40, 217, 0.22))' }}>
      {/* Soft background sparkles */}
      <circle cx="18" cy="20" r="2.5" fill="#C4B5FD" />
      <circle cx="104" cy="16" r="3" fill="#DDD6FE" />
      <path d="M98 48L100 52L104 54L100 56L98 60L96 56L92 54L96 52L98 48Z" fill="#FBBF24" opacity="0.8" />
      {/* Cap skull / base */}
      <path
        d="M34 39V56C34 63.5 45.6 69.5 60 69.5C74.4 69.5 86 63.5 86 56V39L60 51L34 39Z"
        fill="url(#tzCapBase)"
      />
      {/* Cap top diamond */}
      <path
        d="M60 12L14 33.5L60 55L106 33.5L60 12Z"
        fill="url(#tzCapTop)"
      />
      <path
        d="M60 15L20 33.5L60 52L100 33.5L60 15Z"
        stroke="#DDD6FE"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />
      {/* Center button & golden tassel */}
      <ellipse cx="60" cy="33.5" rx="5" ry="3" fill="#4C1D95" />
      <path
        d="M60 33.5C70 36 81 42 84 57"
        stroke="#FBBF24"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M84 55L80 65H88L84 55Z"
        fill="#F59E0B"
      />
      <circle cx="84" cy="55" r="2.8" fill="#FDE68A" />
      <defs>
        <linearGradient id="tzCapTop" x1="14" y1="12" x2="106" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="tzCapBase" x1="34" y1="39" x2="86" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Stage 1: Cute Lion Illustration ── */
export function LionIllustration() {
  return (
    <svg viewBox="0 0 130 110" width="96" height="82" fill="none">
      {/* Soft pink cloud & leaf accents */}
      <ellipse cx="75" cy="98" rx="46" ry="10" fill="#FECDD3" opacity="0.55" />
      <path d="M22 92C16 82 18 70 26 66C28 75 27 84 22 92Z" fill="#FB7185" opacity="0.45" />
      <path d="M30 94C22 86 24 76 32 72C34 80 33 88 30 94Z" fill="#F43F5E" opacity="0.4" />
      {/* Body */}
      <path d="M56 72C53 82 54 96 54 98H96C96 96 97 82 94 72H56Z" fill="#FBBF24" />
      <ellipse cx="75" cy="86" rx="11" ry="11" fill="#FDE68A" />
      {/* Tail */}
      <path d="M95 88C106 86 112 78 110 70" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="110" cy="68" r="5" fill="#B45309" />
      {/* Scalloped Mane */}
      <circle cx="75" cy="50" r="30" fill="#B45309" />
      <circle cx="52" cy="36" r="10" fill="#B45309" />
      <circle cx="98" cy="36" r="10" fill="#B45309" />
      <circle cx="46" cy="52" r="10" fill="#B45309" />
      <circle cx="104" cy="52" r="10" fill="#B45309" />
      <circle cx="52" cy="67" r="10" fill="#B45309" />
      <circle cx="98" cy="67" r="10" fill="#B45309" />
      <circle cx="64" cy="24" r="10" fill="#B45309" />
      <circle cx="86" cy="24" r="10" fill="#B45309" />
      <circle cx="75" cy="73" r="10" fill="#B45309" />
      {/* Ears */}
      <circle cx="55" cy="30" r="7" fill="#FBBF24" />
      <circle cx="55" cy="30" r="4" fill="#F59E0B" />
      <circle cx="95" cy="30" r="7" fill="#FBBF24" />
      <circle cx="95" cy="30" r="4" fill="#F59E0B" />
      {/* Face */}
      <circle cx="75" cy="51" r="22" fill="#FBBF24" />
      {/* Eyes */}
      <circle cx="66" cy="47" r="3" fill="#1E293B" />
      <circle cx="65" cy="46" r="1" fill="#FFFFFF" />
      <circle cx="84" cy="47" r="3" fill="#1E293B" />
      <circle cx="83" cy="46" r="1" fill="#FFFFFF" />
      {/* Cheeks */}
      <ellipse cx="60" cy="54" rx="4" ry="2.5" fill="#FB7185" opacity="0.6" />
      <ellipse cx="90" cy="54" rx="4" ry="2.5" fill="#FB7185" opacity="0.6" />
      {/* Muzzle & Nose */}
      <ellipse cx="75" cy="56" rx="8" ry="6" fill="#FEF3C7" />
      <path d="M72 52H78L75 56L72 52Z" fill="#78350F" />
      <path d="M75 56V59M75 59C73 61 70 60 69 59M75 59C77 61 80 60 81 59" stroke="#78350F" strokeWidth="1.6" strokeLinecap="round" />
      {/* Paws */}
      <ellipse cx="63" cy="97" rx="6.5" ry="4.5" fill="#F59E0B" />
      <ellipse cx="87" cy="97" rx="6.5" ry="4.5" fill="#F59E0B" />
    </svg>
  );
}

/* ── Stage 2: Cute Giraffe Illustration ── */
export function GiraffeIllustration() {
  return (
    <svg viewBox="0 0 130 110" width="96" height="82" fill="none">
      {/* Soft warm cloud base */}
      <ellipse cx="78" cy="100" rx="42" ry="9" fill="#FDE68A" opacity="0.55" />
      {/* Neck & Body */}
      <path d="M68 46L62 98H92L82 46H68Z" fill="#FBBF24" />
      {/* Giraffe spots on neck */}
      <circle cx="74" cy="62" r="4" fill="#D97706" />
      <circle cx="80" cy="76" r="5" fill="#D97706" />
      <circle cx="70" cy="86" r="4.5" fill="#D97706" />
      <circle cx="83" cy="92" r="3.5" fill="#D97706" />
      {/* Ossicones (horns) */}
      <line x1="67" y1="24" x2="64" y2="13" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
      <circle cx="64" cy="12" r="4" fill="#92400E" />
      <line x1="83" y1="24" x2="86" y2="13" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
      <circle cx="86" cy="12" r="4" fill="#92400E" />
      {/* Ears */}
      <ellipse cx="54" cy="28" rx="7" ry="4" transform="rotate(-20 54 28)" fill="#FBBF24" />
      <ellipse cx="54" cy="28" rx="4" ry="2" transform="rotate(-20 54 28)" fill="#F59E0B" />
      <ellipse cx="96" cy="28" rx="7" ry="4" transform="rotate(20 96 28)" fill="#FBBF24" />
      <ellipse cx="96" cy="28" rx="4" ry="2" transform="rotate(20 96 28)" fill="#F59E0B" />
      {/* Head */}
      <ellipse cx="75" cy="34" rx="18" ry="15" fill="#FBBF24" />
      {/* Snout */}
      <ellipse cx="75" cy="41" rx="13" ry="9" fill="#FDE68A" />
      {/* Eyes */}
      <circle cx="67" cy="31" r="2.8" fill="#1E293B" />
      <circle cx="66.2" cy="30" r="0.9" fill="#FFFFFF" />
      <circle cx="83" cy="31" r="2.8" fill="#1E293B" />
      <circle cx="82.2" cy="30" r="0.9" fill="#FFFFFF" />
      {/* Nostrils & Smile */}
      <circle cx="71" cy="39" r="1.5" fill="#B45309" />
      <circle cx="79" cy="39" r="1.5" fill="#B45309" />
      <path d="M71 44C73 46.5 77 46.5 79 44" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" />
      {/* Rosy cheeks */}
      <ellipse cx="62" cy="37" rx="3" ry="2" fill="#FB7185" opacity="0.55" />
      <ellipse cx="88" cy="37" rx="3" ry="2" fill="#FB7185" opacity="0.55" />
    </svg>
  );
}

/* ── Stage 3: Cute Panda Illustration ── */
export function PandaIllustration() {
  return (
    <svg viewBox="0 0 130 110" width="96" height="82" fill="none">
      {/* Soft green pastel hill & bamboo leaves */}
      <ellipse cx="75" cy="99" rx="46" ry="9" fill="#BBF7D0" opacity="0.7" />
      <path d="M24 94C18 83 22 71 30 66C32 76 29 86 24 94Z" fill="#4ADE80" opacity="0.55" />
      <path d="M33 96C29 87 33 78 40 74C41 82 38 90 33 96Z" fill="#22C55E" opacity="0.45" />
      {/* Body */}
      <ellipse cx="75" cy="82" rx="24" ry="20" fill="#1E293B" />
      <ellipse cx="75" cy="85" rx="16" ry="14" fill="#FFFFFF" />
      {/* Arms */}
      <ellipse cx="53" cy="77" rx="7" ry="11" transform="rotate(20 53 77)" fill="#1E293B" />
      <ellipse cx="97" cy="77" rx="7" ry="11" transform="rotate(-20 97 77)" fill="#1E293B" />
      {/* Feet */}
      <ellipse cx="61" cy="96" rx="8" ry="6" fill="#1E293B" />
      <ellipse cx="61" cy="96" rx="4" ry="3" fill="#F1F5F9" />
      <ellipse cx="89" cy="96" rx="8" ry="6" fill="#1E293B" />
      <ellipse cx="89" cy="96" rx="4" ry="3" fill="#F1F5F9" />
      {/* Ears */}
      <circle cx="55" cy="30" r="9" fill="#1E293B" />
      <circle cx="95" cy="30" r="9" fill="#1E293B" />
      {/* Head */}
      <ellipse cx="75" cy="49" rx="24" ry="21" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      {/* Eye patches */}
      <ellipse cx="65" cy="48" rx="6.5" ry="8" transform="rotate(-12 65 48)" fill="#1E293B" />
      <ellipse cx="85" cy="48" rx="6.5" ry="8" transform="rotate(12 85 48)" fill="#1E293B" />
      {/* Eyes */}
      <circle cx="66" cy="47" r="2.6" fill="#FFFFFF" />
      <circle cx="66.5" cy="46.5" r="1.2" fill="#1E293B" />
      <circle cx="84" cy="47" r="2.6" fill="#FFFFFF" />
      <circle cx="83.5" cy="46.5" r="1.2" fill="#1E293B" />
      {/* Nose & Mouth */}
      <ellipse cx="75" cy="54" rx="3.5" ry="2.5" fill="#1E293B" />
      <path d="M75 56.5V59M75 59C73 61 70.5 60.5 69.5 59M75 59C77 61 79.5 60.5 80.5 59" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
      {/* Rosy Cheeks */}
      <ellipse cx="58" cy="55" rx="3.8" ry="2.2" fill="#FB7185" opacity="0.65" />
      <ellipse cx="92" cy="55" rx="3.8" ry="2.2" fill="#FB7185" opacity="0.65" />
    </svg>
  );
}

/* ── Stage 4: Cute Elephant Illustration ── */
export function ElephantIllustration() {
  return (
    <svg viewBox="0 0 130 110" width="96" height="82" fill="none">
      {/* Soft sky cloud base */}
      <ellipse cx="72" cy="99" rx="48" ry="9" fill="#BFDBFE" opacity="0.65" />
      {/* Big Floppy Ears */}
      <ellipse cx="42" cy="54" rx="16" ry="21" transform="rotate(-10 42 54)" fill="#60A5FA" />
      <ellipse cx="43" cy="55" rx="10" ry="14" transform="rotate(-10 43 55)" fill="#BAE6FD" />
      <ellipse cx="102" cy="54" rx="16" ry="21" transform="rotate(10 102 54)" fill="#60A5FA" />
      <ellipse cx="101" cy="55" rx="10" ry="14" transform="rotate(10 101 55)" fill="#BAE6FD" />
      {/* Body */}
      <ellipse cx="72" cy="82" rx="25" ry="18" fill="#60A5FA" />
      {/* Legs */}
      <rect x="53" y="84" width="11" height="15" rx="5" fill="#3B82F6" />
      <rect x="80" y="84" width="11" height="15" rx="5" fill="#3B82F6" />
      {/* Head */}
      <circle cx="72" cy="52" r="22" fill="#93C5FD" />
      {/* Eyes */}
      <circle cx="63" cy="48" r="2.8" fill="#1E293B" />
      <circle cx="62.2" cy="47" r="1" fill="#FFFFFF" />
      <circle cx="81" cy="48" r="2.8" fill="#1E293B" />
      <circle cx="80.2" cy="47" r="1" fill="#FFFFFF" />
      {/* Cheeks */}
      <ellipse cx="56" cy="55" rx="3.8" ry="2.2" fill="#FB7185" opacity="0.55" />
      <ellipse cx="88" cy="55" rx="3.8" ry="2.2" fill="#FB7185" opacity="0.55" />
      {/* Trunk */}
      <path
        d="M68 54C68 65 68 74 76 74C81 74 82 69 79 67"
        stroke="#60A5FA"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M68 54C68 65 68 74 76 74C81 74 82 69 79 67"
        stroke="#93C5FD"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Stage 5: Cute Whale Illustration ── */
export function WhaleIllustration() {
  return (
    <svg viewBox="0 0 130 110" width="96" height="82" fill="none">
      {/* Soft pastel purple/blue waves */}
      <ellipse cx="68" cy="96" rx="52" ry="10" fill="#DDD6FE" opacity="0.7" />
      <path d="M18 95C34 89 52 99 70 93C88 87 104 97 118 92" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" />
      {/* Water Spout */}
      <path d="M62 34C62 22 52 16 46 20" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M65 34C65 20 75 14 81 18" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="24" r="2.2" fill="#60A5FA" />
      <circle cx="83" cy="22" r="2.2" fill="#60A5FA" />
      {/* Whale Tail & Body */}
      <path
        d="M32 68C32 46 50 36 70 38C90 40 98 56 108 58C113 59 117 54 119 48C121 56 118 65 112 68C118 71 122 77 120 82C114 79 110 75 104 77C92 84 78 90 54 89C38 88 32 79 32 68Z"
        fill="url(#whaleGrad)"
      />
      {/* White/Light Belly Stripes */}
      <path
        d="M34 74C44 74 58 76 74 87C56 90 40 87 34 74Z"
        fill="#E0F2FE"
      />
      <path d="M40 79C48 80 56 82 64 87" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eye & Smile */}
      <circle cx="48" cy="60" r="3" fill="#1E293B" />
      <circle cx="47.2" cy="59" r="1" fill="#FFFFFF" />
      <ellipse cx="54" cy="66" rx="3.5" ry="2" fill="#FB7185" opacity="0.55" />
      <path d="M40 67C43 70 48 70 51 67" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
      {/* Side Fin */}
      <ellipse cx="68" cy="78" rx="9" ry="5" transform="rotate(25 68 78)" fill="#2563EB" />
      <defs>
        <linearGradient id="whaleGrad" x1="32" y1="36" x2="120" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Stage 6 (Extra): Cute Owl Illustration ── */
export function OwlIllustration() {
  return (
    <svg viewBox="0 0 130 110" width="96" height="82" fill="none">
      <ellipse cx="75" cy="99" rx="44" ry="9" fill="#CCFBF1" opacity="0.7" />
      {/* Body */}
      <ellipse cx="75" cy="66" rx="25" ry="28" fill="#14B8A6" />
      <ellipse cx="75" cy="72" rx="16" ry="19" fill="#CCFBF1" />
      {/* Ear Tufts */}
      <path d="M54 44L48 30L64 38Z" fill="#0D9488" />
      <path d="M96 44L102 30L86 38Z" fill="#0D9488" />
      {/* Wings */}
      <ellipse cx="50" cy="68" rx="7" ry="15" transform="rotate(12 50 68)" fill="#0D9488" />
      <ellipse cx="100" cy="68" rx="7" ry="15" transform="rotate(-12 100 68)" fill="#0D9488" />
      {/* Big Eyes */}
      <circle cx="65" cy="54" r="10" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2" />
      <circle cx="85" cy="54" r="10" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2" />
      <circle cx="65" cy="54" r="4.5" fill="#1E293B" />
      <circle cx="63.5" cy="52.5" r="1.5" fill="#FFFFFF" />
      <circle cx="85" cy="54" r="4.5" fill="#1E293B" />
      <circle cx="83.5" cy="52.5" r="1.5" fill="#FFFFFF" />
      {/* Beak & Feet */}
      <path d="M72 58H78L75 64L72 58Z" fill="#F59E0B" />
      <ellipse cx="66" cy="95" rx="5" ry="3" fill="#F59E0B" />
      <ellipse cx="84" cy="95" rx="5" ry="3" fill="#F59E0B" />
    </svg>
  );
}

/* ── Hero Banner Right Side: Teacher at Whiteboard + Inspiring Quote Illustration ── */
export function HeroTeacherIllustration() {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '0.25rem',
        minWidth: '340px',
        height: '138px',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Teacher & Whiteboard Illustration from /t1_comp.png */}
      <img
        src="/t1_comp.png"
        alt="Teacher illustration"
        style={{
          height: '150px',
          width: 'auto',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 2,
          marginBottom: '-12px',
          filter: 'drop-shadow(0 6px 14px rgba(99, 102, 241, 0.1))',
        }}
      />

      {/* Right Inspiring Quote Cloud */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.85) 100%)',
          border: '1px solid rgba(191, 219, 254, 0.7)',
          borderRadius: '24px',
          padding: '0.65rem 1rem',
          boxShadow: '0 6px 18px rgba(59, 130, 246, 0.08)',
          transform: 'rotate(-4deg)',
          textAlign: 'center',
          lineHeight: 1.25,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
            fontSize: '12px',
            fontWeight: 800,
            fontStyle: 'italic',
            color: '#1E293B',
          }}
        >
          &ldquo;Great teachers
          <br />
          inspire curious
          <br />
          <span style={{ color: '#2563EB' }}>minds!&rdquo;</span>
        </div>
      </div>
    </div>
  );
}

/* ── Bottom-Left Sidebar Teacher Illustration & Empowering Quote ── */
export function SidebarTeacherIllustration() {
  return (
    <div
      style={{
        position: 'relative',
        padding: '0.35rem 0.4rem 0',
        borderRadius: '18px',
        background: 'linear-gradient(155deg, #F5F3FF 0%, #EFF6FF 55%, #FFFBEB 100%)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <img
        src="/t2_comp.png"
        alt="Empowering teachers to create brighter futures"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '148px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}

