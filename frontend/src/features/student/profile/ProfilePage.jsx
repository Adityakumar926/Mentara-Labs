import { useState, useEffect, useRef } from 'react';
import { User, Lock, TrendingUp, Award, BookOpen, Flame, Calendar, Activity, Camera, Shield, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { PageWrapper, Button, Input, Badge, Skeleton } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import clsx from 'clsx';

/* ─────────────────────────────────────────────
   DESIGN TOKENS  (mirror LandingPage vars)
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .prof-root {
    --navy:       var(--local-navy, #0A0E1A);
    --navy2:      var(--local-navy2, #0F1629);
    --navy3:      var(--local-navy2, #131929);
    --violet:     #7C3AED;
    --violet-l:   #9D6FEF;
    --cyan:       #00D4FF;
    --cream:      var(--local-cream, #F5F0E8);
    --lavender:   #C4B5FD;
    --amber:      #F59E0B;
    --green:      #10B981;
    --red:        #EF4444;
    --card-bg:    var(--local-card-bg, rgba(255,255,255,0.04));
    --card-bdr:   var(--local-card-bdr, rgba(255,255,255,0.08));
    --muted:      var(--local-muted, rgba(245,240,232,0.45));
    --local-heat-0: rgba(255,255,255,0.06);
    --local-heat-1: rgba(124,58,237,0.25);
    --local-heat-2: rgba(124,58,237,0.45);
    --local-heat-3: rgba(124,58,237,0.65);
    --local-heat-4: #7C3AED;
    font-family: 'Inter', sans-serif;
    color: var(--cream);
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .light .prof-root, :global(.light) .prof-root, :root.light .prof-root {
    --local-heat-0: #94A3B8;
    --local-heat-1: #7C3AED;
    --local-heat-2: #5B21B6;
    --local-heat-3: #4C1D95;
    --local-heat-4: #2E1065;
  }
  .light .prof-root .heat-cell,
  :root.light .prof-root .heat-cell {
    border: 1px solid rgba(0,0,0,0.2);
  }
  .light .prof-root .cal-day:not(.active),
  :root.light .prof-root .cal-day:not(.active) {
    background: #CBD5E1;
    border: 1px solid #94A3B8;
  }
  .light .prof-root .cal-day.active,
  :root.light .prof-root .cal-day.active {
    background: #7C3AED;
    border: 2px solid #5B21B6;
    color: #ffffff;
  }
  .prof-root *, .prof-root *::before, .prof-root *::after { box-sizing: border-box; }

  .prof-hero {
    position: relative;
    background: linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(124,58,237,0.1) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 2rem 2.25rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .prof-hero-image {
    width: 180px;
    height: 120px;
    object-fit: contain;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  @media (max-width: 767px) {
    .prof-hero-image { display: none; }
  }
  .prof-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%);
    pointer-events: none;
  }
  .prof-hero-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    animation: blob-drift 10s ease-in-out infinite alternate;
  }
  @keyframes blob-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(20px, -15px) scale(1.1); } }

  /* ── AVATAR ── */
  .avatar-ring {
    position: relative;
    width: 88px; height: 88px;
    flex-shrink: 0;
  }
  .avatar-ring::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--violet), var(--cyan));
    animation: avatar-spin 6s linear infinite;
  }
  .avatar-ring::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--cyan), var(--violet));
    animation: avatar-spin 6s linear infinite reverse;
    opacity: 0.4;
  }
  @keyframes avatar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .avatar-inner {
    position: relative;
    z-index: 2;
    width: 100%; height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,212,255,0.2));
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--navy);
    overflow: hidden;
  }
  .avatar-initials {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.6rem; font-weight: 700;
    background: linear-gradient(135deg, var(--cream), var(--lavender));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .premium-badge {
    position: absolute;
    bottom: 2px; right: 2px;
    width: 24px; height: 24px;
    background: linear-gradient(135deg, var(--amber), #F97316);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem;
    z-index: 3;
    border: 2px solid var(--navy);
    box-shadow: 0 0 12px rgba(245,158,11,0.6);
  }

  /* ── STAT CHIPS ── */
  .stat-chip {
    text-align: center;
    padding: 0.75rem 1.25rem;
    background: var(--local-card-bg);
    border: 2px solid var(--local-card-bdr);
    border-radius: 16px;
    transition: border-color 0.2s, background 0.2s, transform 0.2s;
  }
  .stat-chip:hover { border-color: var(--violet); background: var(--color-surface-hover); transform: translateY(-2px); }
  .stat-chip-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.4rem; font-weight: 700;
    background: linear-gradient(135deg, var(--cream), var(--lavender));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .stat-chip-label { font-size: 0.7rem; color: var(--muted); margin-top: 0.15rem; font-weight: 600; letter-spacing: 0.03em; }

  /* ── TABS ── */
  .tab-strip {
    display: flex; gap: 0.25rem;
    padding: 0.3rem;
    background: var(--local-card-bg);
    border: 2px solid var(--local-card-bdr);
    border-radius: 18px;
    width: fit-content;
  }
  .tab-btn {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.55rem 1.1rem;
    border-radius: 14px;
    border: none; background: transparent;
    color: var(--color-text-secondary);
    font-size: 0.8rem; font-weight: 700;
    cursor: pointer;
    transition: color 0.2s;
    font-family: 'Inter', sans-serif;
    position: relative;
    white-space: nowrap;
    isolation: isolate;
  }
  .tab-btn.active { color: #fff !important; }
  .tab-indicator {
    position: absolute; inset: 0;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    box-shadow: 0 0 24px rgba(124,58,237,0.45);
    z-index: -1;
  }

  /* ── CONTENT CARD ── */
  .prof-card {
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(16px);
    transition: border-color 0.3s;
  }
  .prof-card:hover { border-color: var(--violet); }

  /* ── FORM ── */
  .prof-form-field {
    display: flex; flex-direction: column; gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .prof-label {
    font-size: 0.78rem; font-weight: 800;
    color: var(--color-text-primary);
    letter-spacing: 0.05em;
  }
  .prof-input {
    background: var(--local-card-bg);
    border: 2px solid var(--local-card-bdr);
    border-radius: 14px;
    padding: 0.8rem 1rem;
    color: var(--color-text-primary);
    font-size: 0.9rem;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none;
    width: 100%;
    font-weight: 600;
  }
  .prof-input:focus {
    border-color: var(--violet);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.1);
    background: var(--color-surface-hover);
  }
  .prof-input::placeholder { color: var(--color-text-muted); }
  .prof-input.error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(239,68,68,0.15); }
  .field-error { font-size: 0.73rem; color: var(--red); }

  .prof-save-btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    color: #fff;
    border: none; border-radius: 14px;
    padding: 0.75rem 1.75rem;
    font-size: 0.88rem; font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    box-shadow: 0 0 30px rgba(124,58,237,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .prof-save-btn:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(124,58,237,0.6); }
  .prof-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── PROGRESS BARS ── */
  .prog-track {
    height: 6px;
    background: rgba(255,255,255,0.07);
    border-radius: 99px;
    overflow: hidden;
  }
  .prog-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--violet), var(--cyan));
    transform-origin: left;
    transition: transform 1s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── STREAK STATS ── */
  .streak-stat {
    padding: 1.5rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
    text-align: center;
    transition: border-color 0.2s, transform 0.2s, background 0.2s;
  }
  .streak-stat:hover { border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.06); transform: translateY(-3px); }
  .streak-icon-wrap {
    width: 48px; height: 48px;
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
  }
  .streak-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2rem; font-weight: 700;
    line-height: 1;
  }
  .streak-label { font-size: 0.72rem; color: var(--muted); font-weight: 500; letter-spacing: 0.04em; }

  /* ── HEATMAP ── */
  .heat-cell {
    width: 12px; height: 12px;
    border-radius: 3px;
    cursor: default;
    transition: transform 0.15s, opacity 0.15s;
  }
  .heat-cell:hover { transform: scale(1.5); opacity: 1 !important; }

  /* ── CALENDAR ── */
  .cal-day {
    aspect-ratio: 1;
    border-radius: 8px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px;
    transition: all 0.15s;
    cursor: default;
    position: relative;
    padding: 2px;
  }
  .cal-day.active { background: var(--local-heat-1); border: 2px solid var(--local-heat-3); color: var(--color-text-primary); font-weight: 700; }
  .cal-day.today { outline: 2px solid var(--violet); outline-offset: 1px; }
  .cal-day:not(.active) { background: var(--local-heat-0); border: 1px solid var(--local-card-bdr); }
  .cal-day:hover { transform: scale(1.08); z-index: 1; }

  /* ── EXAM TABLE ── */
  .exam-row { transition: background 0.15s; }
  .exam-row:hover { background: rgba(124,58,237,0.05) !important; }
  .score-pill {
    display: inline-flex;
    padding: 0.2rem 0.65rem;
    border-radius: 99px;
    font-size: 0.72rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
  }

  /* ── FLOATING GLOW ── */
  @keyframes float-y { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .float-anim { animation: float-y 6s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }

  @media (max-width: 768px) {
    .prof-hero-stats-grid { flex-direction: column; gap: 0.5rem; }
    .tab-strip { width: 100%; overflow-x: auto; }
  }
`;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const ACTIVITY_COLOR = {
  study:     '#7C3AED',
  video:     '#10B981',
  animation: '#F59E0B',
  exam:      '#EF4444',
};

const HEAT_LEVELS = [
  'var(--local-heat-0)',
  'var(--local-heat-1)',
  'var(--local-heat-2)',
  'var(--local-heat-3)',
  'var(--local-heat-4)',
];

function getHeatColor(count) {
  if (count === 0) return HEAT_LEVELS[0];
  if (count === 1) return HEAT_LEVELS[1];
  if (count <= 3)  return HEAT_LEVELS[2];
  if (count <= 6)  return HEAT_LEVELS[3];
  return HEAT_LEVELS[4];
}

/* Animated counter */
function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const duration = 900;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

/* Tilt card */
function TiltCard({ children, className, style }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-4, 4]);
  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: 'preserve-3d', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [tab, setTab]     = useState('profile');
  const now = new Date();

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name ?? '',
  });
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url ?? null);
  const avatarInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const { mutate: saveName, loading: savingName } = useMutation(
    studentApi.updateProfile,
    { onSuccess: () => fetchMe(), successMsg: 'Profile updated' }
  );

  const { mutate: uploadAvatar, loading: uploadingAvatar } = useMutation(
    studentApi.uploadAvatar,
    { onSuccess: () => { setAvatarFile(null); fetchMe(); }, successMsg: 'Avatar updated' }
  );

  const savingProfile = savingName || uploadingAvatar;

  const handleSaveProfile = async () => {
    // Fire both in parallel if both changed, or just whichever changed
    const calls = [];
    if (profileForm.full_name !== (user?.full_name ?? '')) {
      calls.push(saveName({ full_name: profileForm.full_name }));
    }
    if (avatarFile) {
      calls.push(uploadAvatar(avatarFile));
    }
    // If nothing changed, still save name (matches original behaviour)
    if (calls.length === 0) {
      saveName({ full_name: profileForm.full_name });
    }
  };

  const [pwForm, setPwForm]     = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});

  const { mutate: changePw, loading: changingPw } = useMutation(
    studentApi.changePassword,
    {
      onSuccess: () => setPwForm({ current_password: '', new_password: '', confirm: '' }),
      successMsg: 'Password changed',
    }
  );

  const validatePw = () => {
    const e = {};
    if (!pwForm.current_password)             e.current = 'Required';
    if (pwForm.new_password.length < 8)       e.new     = 'Minimum 8 characters';
    if (pwForm.new_password !== pwForm.confirm) e.confirm = 'Passwords do not match';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePw = () => {
    if (!validatePw()) return;
    const { current_password, new_password } = pwForm;
    changePw({ current_password, new_password });
  };

  const { data: profile, loading: loadingProfile } = useApi(studentApi.getProfile);
  const { data: progress, loading: loadingProgress } = useApi(studentApi.getProgress);

  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

  const { data: calData, loading: loadingCal } = useApi(
    () => studentApi.getCalendar({ year: calYear, month: calMonth }),
    null,
    [calYear, calMonth]
  );

  const { data: heatmapData, loading: loadingHeat } = useApi(
    () => studentApi.getHeatmap({ year: calYear }),
    null,
    [calYear]
  );

  const calStreak    = calData?.streak ?? null;
  const calActivity  = calData?.calendar ?? [];
  const calTotalDays = calData?.total_active_days ?? 0;

  const headerStreak    = profile?.current_streak    ?? 0;
  const headerLongest   = profile?.longest_streak    ?? 0;
  const headerTotalDays = profile?.total_active_days ?? 0;

  const streakCurrent = calStreak?.current_streak ?? headerStreak;
  const streakLongest = calStreak?.longest_streak ?? headerLongest;
  const streakTotal   = calTotalDays || headerTotalDays;

  const daysInMonth    = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay();
  const activityMap    = Object.fromEntries(calActivity.map((a) => [a.date, a]));

  const heatmap = (() => {
    const heatMap = {};
    (heatmapData ?? []).forEach((d) => { heatMap[d.date] = parseInt(d.count, 10); });
    const weeks = [];
    const cur   = new Date(calYear, 0, 1);
    cur.setDate(cur.getDate() - cur.getDay());
    while (weeks.length < 53) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const iso = cur.toISOString().split('T')[0];
        week.push({ date: iso, count: heatMap[iso] ?? 0, inYear: cur.getFullYear() === calYear });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
      if (cur.getFullYear() > calYear) break;
    }
    return weeks;
  })();

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear((y) => y - 1); setCalMonth(12); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalYear((y) => y + 1); setCalMonth(1); }
    else setCalMonth((m) => m + 1);
  };
  const canNext = !(calYear === now.getFullYear() && calMonth === now.getMonth() + 1);

  const initials = user?.full_name
    ?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) ?? 'S';

  const TABS = [
    { key: 'profile',  icon: User,       label: 'Profile'  },
    { key: 'password', icon: Shield,     label: 'Security' },
    { key: 'progress', icon: TrendingUp, label: 'Progress' },
    { key: 'streak',   icon: Flame,      label: 'Streak'   },
  ];

  const headerStats = [
    { label: 'Exams Taken',   value: profile?.exams_taken ?? 0,          suffix: '' },
    { label: 'Avg Score',     value: profile?.avg_exam_score ?? null,     suffix: '%', raw: true },
    { label: 'Active Days',   value: headerTotalDays,                     suffix: '' },
    { label: 'Current Streak',value: headerStreak,                        suffix: 'd 🔥' },
  ];

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>

      <div className="prof-root">

        {/* ── HERO HEADER ── */}
        <motion.div
          className="prof-hero"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Background blobs */}
          <div className="prof-hero-blob" style={{ width: 320, height: 320, background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', top: -80, left: -60 }} />
          <div className="prof-hero-blob" style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)', bottom: -40, right: -30, animationDelay: '-5s' }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Left side: Avatar & User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 0, flex: '1 1 auto' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div className="avatar-ring float-anim">
                  <div className="avatar-inner">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span className="avatar-initials">{initials}</span>
                    )}
                  </div>
                </div>
                {user?.is_premium && (
                  <div className="premium-badge">⭐</div>
                )}
              </div>

              {/* Name & email */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <motion.h1
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    marginBottom: '0.25rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={user?.full_name}
                >
                  {user?.full_name ?? 'Student'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--muted)',
                    marginBottom: '0.5rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={user?.email}
                >
                  {user?.email}
                </motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  {user?.is_premium ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.15))',
                      border: '1px solid rgba(245,158,11,0.4)',
                      padding: '0.25rem 0.85rem', borderRadius: '99px',
                      fontSize: '0.72rem', fontWeight: 700,
                      color: '#F59E0B', letterSpacing: '0.05em',
                    }}>
                      <Star size={10} fill="#F59E0B" /> PREMIUM
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '0.25rem 0.85rem', borderRadius: '99px',
                      fontSize: '0.72rem', fontWeight: 600,
                      color: 'var(--muted)', letterSpacing: '0.05em',
                    }}>
                      FREE PLAN
                    </span>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Right side: Quick stats */}
            {!loadingProfile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  alignSelf: 'center'
                }}
              >
                {headerStats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    className="stat-chip"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                  >
                    <div className="stat-chip-val">
                      {s.raw && s.value == null ? '—' : <AnimatedNumber value={s.value ?? 0} suffix={s.suffix} />}
                    </div>
                    <div className="stat-chip-label">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="tab-strip">
            {TABS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                className={clsx('tab-btn', tab === key && 'active')}
                onClick={() => setTab(key)}
              >
                {tab === key && (
                  <motion.div className="tab-indicator" layoutId="tab-indicator" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <Icon size={13} style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <TiltCard className="prof-card" style={{ padding: '2rem', maxWidth: 520 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Edit Profile
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Update your display name and avatar.</p>
                </div>

                <div className="prof-form-field">
                  <label className="prof-label">FULL NAME</label>
                  <input
                    className="prof-input"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <div className="prof-form-field">
                  <label className="prof-label">PROFILE PHOTO <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Preview */}
                    <div style={{ position: 'relative', width: 64, height: 64, borderRadius: '50%', flexShrink: 0, background: 'rgba(124,58,237,0.15)', border: '2px solid rgba(124,58,237,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--cream), var(--lavender))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {initials}
                        </span>
                      )}
                    </div>
                    {/* Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 10, padding: '0.45rem 0.9rem', color: 'var(--lavender)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
                      >
                        <Camera size={13} /> {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {avatarFile && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', paddingLeft: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                          {avatarFile.name}
                        </span>
                      )}
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                          style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.7)', fontSize: '0.72rem', cursor: 'pointer', textAlign: 'left', padding: '0 0.2rem', fontFamily: 'Inter, sans-serif' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    className="prof-save-btn"
                    disabled={savingProfile}
                    onClick={handleSaveProfile}
                  >
                    {savingProfile ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                        Saving…
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {/* ── SECURITY TAB ── */}
          {tab === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <TiltCard className="prof-card" style={{ padding: '2rem', maxWidth: 520 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Change Password
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Keep your account secure with a strong password.</p>
                </div>

                {[
                  { key: 'current_password', label: 'CURRENT PASSWORD', placeholder: '••••••••', errKey: 'current' },
                  { key: 'new_password',     label: 'NEW PASSWORD',     placeholder: 'Min. 8 characters', errKey: 'new' },
                  { key: 'confirm',          label: 'CONFIRM PASSWORD', placeholder: 'Re-enter new password', errKey: 'confirm' },
                ].map((f) => (
                  <div key={f.key} className="prof-form-field">
                    <label className="prof-label">{f.label}</label>
                    <input
                      type="password"
                      className={clsx('prof-input', pwErrors[f.errKey] && 'error')}
                      value={pwForm[f.key]}
                      placeholder={f.placeholder}
                      onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                    />
                    {pwErrors[f.errKey] && (
                      <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="field-error">
                        {pwErrors[f.errKey]}
                      </motion.span>
                    )}
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    className="prof-save-btn"
                    disabled={changingPw}
                    onClick={handleChangePw}
                  >
                    {changingPw ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                        Updating…
                      </>
                    ) : 'Update Password'}
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {/* ── PROGRESS TAB ── */}
          {tab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {loadingProgress ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1,2,3].map((i) => (
                    <div key={i} className="prof-card" style={{ height: 120, background: 'rgba(255,255,255,0.03)', animation: 'pulse 2s ease infinite' }} />
                  ))}
                </div>
              ) : (
                <>
                  {/* Curriculum cards */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <BookOpen size={15} color="var(--violet-l)" />
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: 700 }}>Curriculum Progress</span>
                    </div>

                    {(progress?.curriculums ?? []).length === 0 ? (
                      <div className="prof-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                        You're not enrolled in any curriculum yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(progress?.curriculums ?? []).map((c, ci) => {
                          const examPct = c.total_exams > 0
                            ? Math.round((c.completed_exams / c.total_exams) * 100)
                            : 0;
                          const scoreColor = c.avg_exam_score >= 75 ? 'var(--green)'
                            : c.avg_exam_score >= 50 ? 'var(--amber)' : 'var(--red)';

                          return (
                            <motion.div
                              key={c.id}
                              className="prof-card"
                              style={{ padding: '1.5rem' }}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: ci * 0.07 }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem' }}>{c.name}</span>
                                {c.avg_exam_score != null && (
                                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: scoreColor }}>
                                    <AnimatedNumber value={c.avg_exam_score} suffix="%" /> avg
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
                                {[
                                  { label: 'Subjects', val: c.total_subjects },
                                  { label: 'Studied',  val: c.studied_content },
                                  { label: 'Exams done', val: `${c.completed_exams}/${c.total_exams}` },
                                ].map((m) => (
                                  <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '0.6rem' }}>
                                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem' }}>{m.val}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>{m.label}</div>
                                  </div>
                                ))}
                              </div>

                              {c.total_exams > 0 && (
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
                                    <span>Exam completion</span>
                                    <span style={{ color: 'var(--lavender)', fontWeight: 600 }}>{examPct}%</span>
                                  </div>
                                  <div className="prog-track">
                                    <motion.div
                                      className="prog-fill"
                                      initial={{ scaleX: 0 }}
                                      animate={{ scaleX: examPct / 100 }}
                                      transition={{ duration: 1, delay: ci * 0.1, ease: [0.4,0,0.2,1] }}
                                    />
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recent exams */}
                  {(progress?.recent_exams ?? []).length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Award size={15} color="#F59E0B" />
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: 700 }}>Recent Exams</span>
                      </div>

                      <div className="prof-card" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                              {['Exam', 'Score', '%', 'Date'].map((h) => (
                                <th key={h} style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.06em' }}>{h.toUpperCase()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(progress?.recent_exams ?? []).map((e, i) => {
                              const pctColor = e.percentage >= 75 ? 'var(--green)' : e.percentage >= 50 ? 'var(--amber)' : 'var(--red)';
                              const pctBg   = e.percentage >= 75 ? 'rgba(16,185,129,0.12)' : e.percentage >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';
                              return (
                                <motion.tr
                                  key={i}
                                  className="exam-row"
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.04 }}
                                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</td>
                                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--muted)' }}>{e.score}/{e.total_marks}</td>
                                  <td style={{ padding: '0.85rem 1.25rem' }}>
                                    <span className="score-pill" style={{ background: pctBg, color: pctColor }}>
                                      {e.percentage}%
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--muted)' }}>
                                    {e.submitted_at
                                      ? new Date(e.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                      : '—'}
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── STREAK TAB ── */}
          {tab === 'streak' && (
            <motion.div
              key="streak"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Streak stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { icon: Flame,      label: 'Current Streak',    value: streakCurrent, suffix: 'd', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', glow: 'rgba(245,158,11,0.3)' },
                  { icon: TrendingUp, label: 'Longest Streak',    value: streakLongest, suffix: 'd', color: 'var(--violet-l)', bg: 'rgba(124,58,237,0.12)', glow: 'rgba(124,58,237,0.3)' },
                  { icon: Activity,   label: 'Total Active Days', value: streakTotal,   suffix: '',  color: 'var(--green)', bg: 'rgba(16,185,129,0.12)', glow: 'rgba(16,185,129,0.3)' },
                ].map((s, idx) => (
                  <motion.div
                    key={s.label}
                    className="streak-stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <div className="streak-icon-wrap" style={{ background: s.bg, boxShadow: `0 0 20px ${s.glow}` }}>
                      <s.icon size={20} color={s.color} />
                    </div>
                    <div className="streak-val" style={{ color: s.color, textShadow: `0 0 30px ${s.glow}` }}>
                      <AnimatedNumber value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="streak-label">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Yearly heatmap */}
              <motion.div
                className="prof-card"
                style={{ padding: '1.5rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} color="var(--violet-l)" />
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem' }}>{calYear} Activity</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setCalYear((y) => y - 1)}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--muted)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}
                    >
                      ← {calYear - 1}
                    </button>
                    {calYear < now.getFullYear() && (
                      <button
                        onClick={() => setCalYear((y) => y + 1)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--muted)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}
                      >
                        {calYear + 1} →
                      </button>
                    )}
                  </div>
                </div>

                {loadingHeat ? (
                  <div style={{ height: 100, background: 'rgba(255,255,255,0.03)', borderRadius: 12, animation: 'pulse 2s ease infinite' }} />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'flex', gap: 3, minWidth: 'max-content' }}>
                      {/* Day labels */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 4, paddingTop: 2 }}>
                        {[0, 2, 4, 6].map((d) => (
                          <span key={d} style={{ fontSize: '0.6rem', color: 'var(--muted)', lineHeight: '12px', height: 12, marginBottom: d < 6 ? 12 : 0 }}>
                            {DAYS[d][0]}
                          </span>
                        ))}
                      </div>
                      {heatmap.map((week, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {week.map((day) => (
                            <div
                              key={day.date}
                              className="heat-cell"
                              title={`${day.date}: ${day.count} activities`}
                              style={{
                                background: day.inYear ? getHeatColor(day.count) : 'transparent',
                                opacity: day.inYear ? 1 : 0,
                                boxShadow: day.inYear && day.count > 0 ? `0 0 6px ${getHeatColor(day.count)}60` : 'none',
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    {/* Legend */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Less</span>
                      {HEAT_LEVELS.map((c, i) => (
                        <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                      ))}
                      <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>More</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Monthly calendar */}
              <motion.div
                className="prof-card"
                style={{ padding: '1.5rem', maxWidth: '480px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Month nav */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <button
                    onClick={prevMonth}
                    style={{ width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>
                    {MONTHS[calMonth - 1]} {calYear}
                  </span>
                  <button
                    onClick={nextMonth}
                    disabled={!canNext}
                    style={{ width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--cream)', cursor: canNext ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: canNext ? 1 : 0.3, transition: 'all 0.15s' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {loadingCal ? (
                  <div style={{ height: 200, background: 'rgba(255,255,255,0.03)', borderRadius: 12, animation: 'pulse 2s ease infinite' }} />
                ) : (
                  <>
                    {/* Weekday headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
                      {DAYS.map((d) => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', padding: '0.25rem 0' }}>
                          {d[0]}
                        </div>
                      ))}
                    </div>

                    {/* Day grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem' }}>
                      {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`e-${i}`} />)}
                      {Array(daysInMonth).fill(null).map((_, i) => {
                        const day   = i + 1;
                        const iso   = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                        const entry = activityMap[iso];
                        const types = entry?.types ?? [];
                        const active  = !!entry;
                        const isToday = iso === now.toISOString().split('T')[0];

                        return (
                          <motion.div
                            key={day}
                            className={clsx('cal-day', active && 'active', isToday && 'today')}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.01 }}
                          >
                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: active ? 'var(--lavender)' : 'var(--muted)' }}>
                              {day}
                            </span>
                            {active && types.length > 0 && (
                              <div style={{ display: 'flex', gap: 2 }}>
                                {types.slice(0, 3).map((t) => (
                                  <div key={t} style={{ width: 4, height: 4, borderRadius: '50%', background: ACTIVITY_COLOR[t] ?? 'var(--violet)', boxShadow: `0 0 4px ${ACTIVITY_COLOR[t] ?? 'var(--violet)'}` }} />
                                ))}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      {Object.entries(ACTIVITY_COLOR).map(([type, color]) => (
                        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'capitalize', fontWeight: 500 }}>{type}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}