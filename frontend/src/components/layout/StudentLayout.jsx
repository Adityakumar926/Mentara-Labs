import { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, User, LogOut, Compass, HelpCircle, ChevronRight, Sparkles, Sun, Moon, PenTool, Eraser, RotateCcw, Maximize2, Minimize2, Square, Triangle, Circle, Minus, Ruler, Download, Undo, Redo, Trash2, Grid, Zap } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import NotificationBell from '@/components/shared/NotificationBell';
import VoiceTutor from '@/components/shared/VoiceTutor';

const NAV = [
  { to: '/courses',            icon: BookOpen,   label: 'Courses'   },
  { to: '/explore',            icon: Compass,    label: 'Explore'   },
  { to: '/question-generator', icon: Sparkles,   label: 'Generator' },
  { to: '/exams',              icon: FileText,   label: 'Exams'     },
  { to: '/questions',          icon: HelpCircle, label: 'Questions' },
  { to: '/profile',            icon: User,       label: 'Profile'   },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .sl-root {
    display: flex; height: 100vh; overflow: hidden;
    background: #09090b;
    font-family: 'Inter', sans-serif;
    --color-navy: #09090b;
    --color-surface: #0f0f13;
    --color-surface-card: rgba(255, 255, 255, 0.015);
    --color-surface-border: rgba(255, 255, 255, 0.06);
    --color-surface-hover: rgba(255, 255, 255, 0.035);
    --local-navy: #09090b;
    --local-navy2: #0f0f13;
    --local-card-bg: rgba(255, 255, 255, 0.015);
    --local-card-bdr: rgba(255, 255, 255, 0.06);
    --local-cream: #f4f4f5;
    --local-muted: #71717a;
    --color-text-primary: #f4f4f5;
    --color-text-secondary: #a1a1aa;
    --color-text-muted: #71717a;
    --local-lavender: #C4B5FD;
  }

  html.light .sl-root, .light .sl-root {
    background: #F8FAFC;
    --color-navy: #F8FAFC;
    --color-surface: #FFFFFF;
    --color-surface-card: #FFFFFF;
    --color-surface-border: #CBD5E1;
    --color-surface-hover: #E2E8F0;
    --local-navy: #F8FAFC;
    --local-navy2: #F1F5F9;
    --local-card-bg: #FFFFFF;
    --local-card-bdr: #94A3B8;
    --local-cream: #0F172A;
    --local-muted: #334155;
    --color-text-primary: #0F172A;
    --color-text-secondary: #334155;
    --color-text-muted: #475569;
    --local-lavender: #4F46E5;
  }

  /* Global image protection: prevent drag-and-drop copies and direct pointer interactions */
  .sl-root img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    pointer-events: none;
  }

  /* ── SIDEBAR (desktop) ── */
  .sl-aside-wrapper {
    width: 56px;
    flex-shrink: 0;
    position: relative;
    z-index: 50;
    height: 100vh;
  }
  @media (max-width: 767px) { .sl-aside-wrapper { display: none; } }

  .sl-aside {
    width: 56px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border-right: 1px solid var(--local-card-bdr);
    position: absolute;
    top: 0; left: 0; bottom: 0;
    overflow: hidden;
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease, background 0.3s ease;
    z-index: 50;
  }
  .sl-aside:hover {
    width: 220px;
    box-shadow: 12px 0 36px rgba(0, 0, 0, 0.5);
  }
  .light .sl-aside:hover {
    box-shadow: 12px 0 36px rgba(0, 0, 0, 0.12);
  }

  .sl-aside::before {
    content: '';
    position: absolute;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%);
    top: -70px; left: -70px; pointer-events: none;
    animation: sl-blob 11s ease-in-out infinite alternate;
  }
  .light .sl-aside::before {
    background: radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%);
  }
  .sl-aside::after {
    content: '';
    position: absolute;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%);
    bottom: 80px; right: -50px; pointer-events: none;
    animation: sl-blob 14s ease-in-out infinite alternate-reverse;
  }
  .light .sl-aside::after {
    background: radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%);
  }
  @keyframes sl-blob { from{transform:translate(0,0)} to{transform:translate(14px,-10px)} }

  /* Logo */
  .sl-logo {
    display: flex; align-items: center; justify-content: space-between; gap: 0.7rem;
    padding: 1.1rem 0.85rem;
    border-bottom: 1px solid var(--local-card-bdr);
    position: relative; z-index: 1; flex-shrink: 0;
    overflow: hidden;
    min-height: 58px;
  }
  .sl-logo-left { display: flex; align-items: center; gap: 0.7rem; min-width: 0; flex-shrink: 0; }
  .sl-logo-mark {
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sl-logo-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.92rem; font-weight: 700;
    background: linear-gradient(90deg, #22d3ee, #34d399, #a855f7, #22d3ee);
    background-size: 300% 100%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    animation: sl-logo-rgb 4s linear infinite;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.18s ease 0s;
    pointer-events: none;
  }
  .sl-aside:hover .sl-logo-text {
    opacity: 1;
    transition: opacity 0.2s ease 0.1s;
  }
  @keyframes sl-logo-rgb {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }

  /* Nav */
  .sl-nav {
    flex: 1; padding: 0.7rem 0.45rem;
    display: flex; flex-direction: column; gap: 0.2rem;
    overflow-y: auto; overflow-x: hidden; position: relative; z-index: 1;
  }
  .sl-nav::-webkit-scrollbar { width: 0; }

  .sl-nav-item {
    display: flex; align-items: center; gap: 0.7rem;
    padding: 0.62rem 0.8rem; border-radius: 14px;
    font-size: 0.8rem; font-weight: 700;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color 0.2s, background 0.2s;
    position: relative; overflow: hidden;
    border: 2px solid transparent;
    white-space: nowrap;
  }
  .sl-nav-item:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-hover);
    border-color: var(--color-surface-border);
  }
  .sl-nav-item.active {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.08);
    border-color: rgba(34, 211, 238, 0.2);
  }
  .light .sl-nav-item.active {
    color: var(--color-text-primary);
    background: rgba(79, 70, 229, 0.08);
    border-color: rgba(79, 70, 229, 0.2);
  }
  .sl-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3.5px; border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #22d3ee, #34d399);
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.7);
  }
  .light .sl-nav-item.active::before {
    background: linear-gradient(180deg, #7C3AED, #00D4FF);
    box-shadow: 0 0 8px rgba(124,58,237,0.8);
  }
  .sl-nav-icon { color: var(--color-text-muted); transition: color 0.2s; flex-shrink: 0; }
  .sl-nav-item:hover .sl-nav-icon { color: var(--color-text-secondary); }
  .sl-nav-item.active .sl-nav-icon { color: #22d3ee; }
  .light .sl-nav-item.active .sl-nav-icon { color: var(--local-lavender); }
  .sl-nav-label {
    flex: 1;
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity 0.15s ease 0s, transform 0.15s ease 0s;
    pointer-events: none;
  }
  .sl-aside:hover .sl-nav-label {
    opacity: 1;
    transform: translateX(0);
    transition: opacity 0.2s ease 0.1s, transform 0.2s ease 0.1s;
  }
  .sl-nav-chevron {
    opacity: 0; color: var(--color-text-muted);
    transition: opacity 0.2s, transform 0.2s;
  }
  .sl-nav-item:hover .sl-nav-chevron { opacity: 1; transform: translateX(2px); }

  /* Premium badge */
  .sl-premium {
    margin: 0 0.45rem 0.6rem;
    padding: 0.55rem 0.8rem; border-radius: 14px;
    background: rgba(245,158,11,0.08);
    border: 2px solid var(--local-amber);
    display: flex; align-items: center; gap: 0.5rem;
    position: relative; z-index: 1;
    overflow: hidden;
  }
  .sl-premium-star { font-size: 0.8rem; flex-shrink: 0; }
  .sl-premium-text {
    font-size: 0.72rem; font-weight: 800; color: var(--local-amber); letter-spacing: 0.02em;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.18s ease 0s;
  }
  .sl-aside:hover .sl-premium-text {
    opacity: 1;
    transition: opacity 0.2s ease 0.1s;
  }

  /* Upgrade to premium button (non-premium users) */
  .sl-upgrade {
    margin: 0 0.45rem 0.6rem;
    padding: 0.6rem 0.8rem; border-radius: 16px;
    background: rgba(245,158,11,0.05);
    border: 2px solid var(--local-amber);
    display: flex; align-items: center; gap: 0.55rem;
    position: relative; z-index: 1; overflow: hidden;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .sl-upgrade:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(245,158,11,0.18);
    border-color: var(--violet);
  }
  .sl-upgrade:active { transform: translateY(0); }
  .sl-upgrade::before {
    content: '';
    position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
    animation: sl-shimmer 3.2s ease-in-out infinite;
  }
  @keyframes sl-shimmer { 0%,100% { left: -60%; } 50% { left: 120%; } }
  .sl-upgrade-icon {
    width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0;
    background: linear-gradient(135deg, #F59E0B, #7C3AED);
    display: flex; align-items: center; justify-content: center;
    color: #fff;
  }
  .sl-upgrade-copy {
    display: flex; flex-direction: column; align-items: flex-start; text-align: left; min-width: 0;
    opacity: 0;
    transition: opacity 0.18s ease 0s;
  }
  .sl-aside:hover .sl-upgrade-copy {
    opacity: 1;
    transition: opacity 0.2s ease 0.1s;
  }
  .sl-upgrade-title { font-size: 0.72rem; font-weight: 800; color: var(--local-amber); letter-spacing: 0.01em; white-space: nowrap; }
  .sl-upgrade-sub { font-size: 0.6rem; color: var(--color-text-secondary); font-weight: 700; white-space: nowrap; }

  /* User footer */
  .sl-footer {
    padding: 0.5rem 0.45rem;
    border-top: 1px solid var(--local-card-bdr);
    position: relative; z-index: 1; flex-shrink: 0;
  }
  .sl-user-row {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.55rem 0.6rem; border-radius: 14px;
    background: var(--local-card-bg);
    border: 1px solid var(--local-card-bdr);
    transition: background 0.2s, border-color 0.2s;
    overflow: hidden;
  }
  .sl-user-row:hover { background: var(--color-surface-hover); border-color: var(--local-card-bdr); }
  .sl-avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,212,255,0.2));
    border: 1.5px solid rgba(124,58,237,0.35);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.72rem; font-weight: 700; color: #C4B5FD;
    overflow: hidden;
  }
  .sl-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .sl-user-info {
    flex: 1; min-width: 0;
    opacity: 0;
    transition: opacity 0.18s ease 0s;
  }
  .sl-aside:hover .sl-user-info {
    opacity: 1;
    transition: opacity 0.2s ease 0.1s;
  }
  .sl-user-name { font-size: 0.72rem; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-user-email { font-size: 0.6rem; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-logout {
    width: 24px; height: 24px; border-radius: 7px;
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--color-text-muted); flex-shrink: 0;
    transition: color 0.2s, background 0.2s;
    opacity: 0;
  }
  .sl-aside:hover .sl-logout {
    opacity: 1;
    transition: opacity 0.2s ease 0.1s;
  }
  .sl-logout:hover { color: #FCA5A5; background: rgba(239,68,68,0.1); }

  /* Theme / notif buttons in header — hide text when collapsed */
  .sl-logo-actions {
    display: flex; align-items: center; gap: 0.3rem; flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.18s ease 0s;
  }
  .sl-aside:hover .sl-logo-actions {
    opacity: 1;
    transition: opacity 0.2s ease 0.1s;
  }

  /* ── MAIN ── */
  .sl-main {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    background: var(--color-navy);
    padding-bottom: 0;
    overscroll-behavior-y: contain;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    transform: translateZ(0);
    will-change: scroll-position;
  }
  @media (max-width: 767px) { .sl-main { padding-bottom: 72px; } }
  .sl-main::-webkit-scrollbar { width: 6px; }
  .sl-main::-webkit-scrollbar-track { background: transparent; }
  .sl-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  .sl-main::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.4); }

  /* ── BOTTOM NAV (mobile) ── */
  .sl-bottom-nav {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    background: var(--color-surface);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--local-card-bdr);
  }
  @media (max-width: 767px) { .sl-bottom-nav { display: flex; } }

  .sl-bottom-item {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 0.6rem 0 0.55rem;
    gap: 0.22rem;
    text-decoration: none;
    color: var(--color-text-secondary);
    font-size: 0.58rem; font-weight: 700; letter-spacing: 0.04em;
    transition: color 0.2s;
    position: relative;
  }
  .sl-bottom-item:hover { color: var(--color-text-primary); }
  .sl-bottom-item.active { color: var(--local-lavender); }
  /* Active indicator dot above icon */
  .sl-bottom-item.active::before {
    content: '';
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 20px; height: 2px; border-radius: 0 0 4px 4px;
    background: linear-gradient(90deg, #7C3AED, #00D4FF);
    box-shadow: 0 0 8px rgba(124,58,237,0.7);
  }
  .sl-bottom-icon { flex-shrink: 0; }

  /* ── Whiteboard CSS ── */
  .wb-grid-dark {
    background-color: #09090b;
    background-size: 15px 15px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  }
  .wb-grid-light {
    background-color: #f8fafc;
    background-size: 15px 15px;
    background-image: 
      linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
  }
`;

export default function StudentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Prevent saving/copying images via context menus or dragging
  useEffect(() => {
    const preventImageSave = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };
    const preventImageDrag = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventImageSave);
    document.addEventListener('dragstart', preventImageDrag);

    return () => {
      document.removeEventListener('contextmenu', preventImageSave);
      document.removeEventListener('dragstart', preventImageDrag);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpgradeClick = () => {
    // TODO: hook up Razorpay checkout here. For now this just routes
    // to a premium/checkout page where the payment flow will live.
    navigate('/premium');
  };

  const initial = user?.full_name?.[0]?.toUpperCase() ?? 'S';

  return (
    <>
      <style>{CSS}</style>
      <div className="sl-root">

        {/* ── Sidebar (desktop) ── */}
        <div className="sl-aside-wrapper">
          <motion.aside
            className="sl-aside"
            initial={{ x: -22, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Logo */}
            <div className="sl-logo">
              <div className="sl-logo-left">
                <div className="sl-logo-mark">
                  <img src="/mentara-new.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </div>
                <span className="sl-logo-text">Mentara Labs</span>
              </div>
              <div className="sl-logo-actions">
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: '0.35rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s, background 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--local-cream)'; e.currentTarget.style.background = 'var(--color-surface-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                </button>
                <NotificationBell variant="desktop" />
              </div>
            </div>

            {/* Nav */}
            <nav className="sl-nav">
              {NAV.map(({ to, icon: Icon, label }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.25 }}
                  >
                    <NavLink
                      to={to}
                      className={({ isActive }) => `sl-nav-item${isActive ? ' active' : ''}`}
                    >
                      <Icon size={15} className="sl-nav-icon" />
                      <span className="sl-nav-label">{label}</span>
                      <ChevronRight size={11} className="sl-nav-chevron" />
                    </NavLink>
                  </motion.div>
                ))}
            </nav>

            {/* Teacher Smart Whiteboard */}
            {user?.role === 'teacher' && <TeacherWhiteboard />}

            {/* Premium badge / Upgrade CTA */}
            {user?.is_premium ? (
              <motion.div
                className="sl-premium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <span className="sl-premium-star">⭐</span>
                <span className="sl-premium-text">Premium Member</span>
              </motion.div>
            ) : (
              <motion.button
                className="sl-upgrade"
                onClick={handleUpgradeClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <span className="sl-upgrade-icon">
                  <Sparkles size={13} />
                </span>
                <span className="sl-upgrade-copy">
                  <span className="sl-upgrade-title">Upgrade to Premium</span>
                  <span className="sl-upgrade-sub">Unlock all courses & exams</span>
                </span>
              </motion.button>
            )}

            {/* User footer */}
            <div className="sl-footer">
              <div className="sl-user-row">
                <div className="sl-avatar">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" />
                  ) : (
                    initial
                  )}
                </div>
                <div className="sl-user-info">
                  <div className="sl-user-name">{user?.full_name}</div>
                  <div className="sl-user-email">{user?.email}</div>
                </div>
                <button className="sl-logout" onClick={handleLogout} title="Log out">
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* ── Main ── */}
        <main className="sl-main">
          <Outlet />
        </main>

        {/* ── Bottom nav (mobile) ── */}
        <nav className="sl-bottom-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sl-bottom-item${isActive ? ' active' : ''}`}
            >
              <Icon size={19} className="sl-bottom-icon" />
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            className="sl-bottom-item"
            style={{ background: 'transparent', border: 'none' }}
          >
            {theme === 'light' ? <Moon size={19} className="sl-bottom-icon" /> : <Sun size={19} className="sl-bottom-icon" />}
            Theme
          </button>
          <NotificationBell variant="mobile" />
        </nav>

        {/* Floating Voice Tutor */}
        <VoiceTutor />
      </div>
    </>
  );
}

/* ── Smart Explanation Whiteboard for Teachers ── */
function TeacherWhiteboard() {
  const [isOpen, setIsOpen] = useState(false);

  // Notify VoiceTutor to shrink when whiteboard is open
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('whiteboard-toggle', { detail: { open: isOpen } }));
  }, [isOpen]);

  const canvasRef = useRef(null);
  const laserCanvasRef = useRef(null);
  const laserSegmentsRef = useRef([]);
  const laserAnimationIdRef = useRef(null);
  
  const [color, setColor] = useState('#22d3ee');
  const [wbTheme, setWbTheme] = useState('dark'); // 'dark', 'light'
  const [wbGrid, setWbGrid] = useState(true); // boolean grid overlay
  const [tool, setTool] = useState('draw'); // 'draw', 'erase', 'line', 'rect', 'circle', 'triangle', 'laser'
  const [brushSize, setBrushSize] = useState(3);
  
  // Undo/Redo history
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const isDrawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const prevPosRef = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef(null);

  const [rulerState, setRulerState] = useState({ active: false, x: 180, y: 180, angle: 0, scale: 1.0 });
  const [protractorState, setProtractorState] = useState({ active: false, x: 380, y: 180, angle: 0, scale: 1.0 });

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [windowPos, setWindowPos] = useState({ x: 120, y: 80 });
  const [windowSize, setWindowSize] = useState({ width: 750, height: 500 });
  
  const isLight = wbTheme === 'light';

  const handleWindowDragStart = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const startX = clientX;
    const startY = clientY;
    const initialX = windowPos.x;
    const initialY = windowPos.y;

    const handleMove = (moveEvent) => {
      const mX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const mY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      setWindowPos({
        x: Math.max(0, initialX + (mX - startX)),
        y: Math.max(0, initialY + (mY - startY))
      });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  };

  const handleWindowResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const startX = clientX;
    const startY = clientY;
    const initialW = windowSize.width;
    const initialH = windowSize.height;

    const handleMove = (moveEvent) => {
      const mX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const mY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      setWindowSize({
        width: Math.max(450, initialW + (mX - startX)),
        height: Math.max(350, initialH + (mY - startY))
      });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  };

  const handleDragStart = (e, type) => {
    e.preventDefault();
    const isRuler = type === 'ruler';
    const state = isRuler ? rulerState : protractorState;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const startX = clientX;
    const startY = clientY;
    const initialX = state.x;
    const initialY = state.y;

    const canvas = canvasRef.current;
    const canvasW = canvas ? canvas.width : window.innerWidth;
    const canvasH = canvas ? canvas.height : window.innerHeight;

    const handleMove = (moveEvent) => {
      const mX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const mY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const dx = mX - startX;
      const dy = mY - startY;
      
      if (isRuler) {
        const nextX = Math.max(10, Math.min(initialX + dx, canvasW - 310));
        const nextY = Math.max(10, Math.min(initialY + dy, canvasH - 70));
        setRulerState(prev => ({ ...prev, x: nextX, y: nextY }));
      } else {
        const nextX = Math.max(10, Math.min(initialX + dx, canvasW - 230));
        const nextY = Math.max(10, Math.min(initialY + dy, canvasH - 130));
        setProtractorState(prev => ({ ...prev, x: nextX, y: nextY }));
      }
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  };

  const handleRotateStart = (e, type) => {
    e.stopPropagation();
    e.preventDefault();
    const isRuler = type === 'ruler';
    const widgetEl = document.getElementById(isRuler ? 'ruler-widget' : 'protractor-widget');
    if (!widgetEl) return;
    
    const parentEl = widgetEl.parentElement;
    if (!parentEl) return;
    const parentRect = parentEl.getBoundingClientRect();
    
    // Calculate precise center using state coordinates relative to parent container
    const centerX = isRuler
      ? parentRect.left + rulerState.x + (160 * rulerState.scale)
      : parentRect.left + protractorState.x + (120 * protractorState.scale);
    const centerY = isRuler
      ? parentRect.top + rulerState.y + (38 * rulerState.scale)
      : parentRect.top + protractorState.y + (140 * protractorState.scale);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const startAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    const initialWidgetAngle = isRuler ? rulerState.angle : protractorState.angle;

    const handleMove = (moveEvent) => {
      const mX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const mY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const currentAngle = Math.atan2(mY - centerY, mX - centerX) * (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      const nextAngle = (initialWidgetAngle + angleDiff) % 360;
      
      if (isRuler) {
        setRulerState(prev => ({ ...prev, angle: nextAngle }));
      } else {
        setProtractorState(prev => ({ ...prev, angle: nextAngle }));
      }
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  };

  const handleScaleStart = (e, type) => {
    e.stopPropagation();
    e.preventDefault();
    const isRuler = type === 'ruler';
    const widgetEl = document.getElementById(isRuler ? 'ruler-widget' : 'protractor-widget');
    if (!widgetEl) return;

    const parentEl = widgetEl.parentElement;
    if (!parentEl) return;
    const parentRect = parentEl.getBoundingClientRect();

    // Calculate precise center using state coordinates relative to parent container
    const centerX = isRuler
      ? parentRect.left + rulerState.x + (160 * rulerState.scale)
      : parentRect.left + protractorState.x + (120 * protractorState.scale);
    const centerY = isRuler
      ? parentRect.top + rulerState.y + (38 * rulerState.scale)
      : parentRect.top + protractorState.y + (140 * protractorState.scale);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Initial distance from cursor to center
    const startDist = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
    const initialScale = isRuler ? rulerState.scale : protractorState.scale;

    const handleMove = (moveEvent) => {
      const mX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const mY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const currentDist = Math.sqrt(Math.pow(mX - centerX, 2) + Math.pow(mY - centerY, 2));
      if (startDist === 0) return;
      
      const ratio = currentDist / startDist;
      const nextScale = Math.max(0.5, Math.min(2.5, initialScale * ratio));

      if (isRuler) {
        setRulerState(prev => ({ ...prev, scale: nextScale }));
      } else {
        setProtractorState(prev => ({ ...prev, scale: nextScale }));
      }
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  };

  const drawLaserStrokes = () => {
    const canvas = laserCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();
    // Filter out expired segments (fade lifetime: 2.5 seconds)
    laserSegmentsRef.current = laserSegmentsRef.current.filter(seg => now - seg.createdAt < seg.life);

    if (laserSegmentsRef.current.length === 0) {
      laserAnimationIdRef.current = null;
      return;
    }

    // Draw active segments
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    laserSegmentsRef.current.forEach(seg => {
      const age = now - seg.createdAt;
      const progress = age / seg.life;
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = seg.width;
      
      // Neon glow effect!
      ctx.shadowBlur = seg.width * 1.5;
      ctx.shadowColor = seg.color;

      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.restore();
    });

    laserAnimationIdRef.current = requestAnimationFrame(drawLaserStrokes);
  };

  const triggerLaserRedraw = () => {
    if (!laserAnimationIdRef.current) {
      laserAnimationIdRef.current = requestAnimationFrame(drawLaserStrokes);
    }
  };

  // Clean up laser animation on unmount
  useEffect(() => {
    return () => {
      if (laserAnimationIdRef.current) {
        cancelAnimationFrame(laserAnimationIdRef.current);
      }
    };
  }, []);

  // Resize canvas to window dimensions dynamically
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      // 1. Save current drawing in memory
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);

      // 2. Update size to fit current bounds
      const targetW = isFullScreen ? window.innerWidth : windowSize.width;
      const targetH = isFullScreen ? (window.innerHeight - 40) : (windowSize.height - 40); // Subtract header height
      
      canvas.width = targetW;
      canvas.height = targetH;

      const laserCanvas = laserCanvasRef.current;
      if (laserCanvas) {
        laserCanvas.width = targetW;
        laserCanvas.height = targetH;
        triggerLaserRedraw();
      }

      // 3. Restore drawings and brush settings
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.drawImage(tempCanvas, 0, 0);

      // 4. Clamp geometry tools within new bounds
      setRulerState(prev => {
        const nextX = Math.max(10, Math.min(prev.x, targetW - 310));
        const nextY = Math.max(10, Math.min(prev.y, targetH - 70));
        return { ...prev, x: nextX, y: nextY };
      });
      setProtractorState(prev => {
        const nextX = Math.max(10, Math.min(prev.x, targetW - 230));
        const nextY = Math.max(10, Math.min(prev.y, targetH - 130));
        return { ...prev, x: nextX, y: nextY };
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Call layout sizing immediately after render
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isOpen, isFullScreen, windowSize]);

  // Save drawing state to history for undo/redo
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imgData);
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Triggered on first draw or clear
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          saveState();
        }
      }, 150);
    } else {
      // Clear history when closed
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [isOpen]);

  const undo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      restoreStateAtIndex(nextIdx);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      restoreStateAtIndex(nextIdx);
    }
  };

  const restoreStateAtIndex = (idx) => {
    const state = history[idx];
    const canvas = canvasRef.current;
    if (!state || !canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(state, 0, 0);
  };

  const resetBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
    setHistoryIndex(-1);
    setTimeout(() => {
      saveState();
    }, 50);
  };

  const downloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas to merge background and strokes
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');

    // 1. Fill background based on current theme
    if (wbTheme === 'light') {
      exportCtx.fillStyle = '#ffffff';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      if (wbGrid) {
        exportCtx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
        exportCtx.lineWidth = 1;
        for (let x = 0; x < exportCanvas.width; x += 15) {
          exportCtx.beginPath();
          exportCtx.moveTo(x, 0);
          exportCtx.lineTo(x, exportCanvas.height);
          exportCtx.stroke();
        }
        for (let y = 0; y < exportCanvas.height; y += 15) {
          exportCtx.beginPath();
          exportCtx.moveTo(0, y);
          exportCtx.lineTo(exportCanvas.width, y);
          exportCtx.stroke();
        }
      }
    } else {
      exportCtx.fillStyle = '#09090b'; // zinc-950
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      if (wbGrid) {
        exportCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        exportCtx.lineWidth = 1;
        for (let x = 0; x < exportCanvas.width; x += 15) {
          exportCtx.beginPath();
          exportCtx.moveTo(x, 0);
          exportCtx.lineTo(x, exportCanvas.height);
          exportCtx.stroke();
        }
        for (let y = 0; y < exportCanvas.height; y += 15) {
          exportCtx.beginPath();
          exportCtx.moveTo(0, y);
          exportCtx.lineTo(exportCanvas.width, y);
          exportCtx.stroke();
        }
      }
    }

    // 2. Draw the whiteboard canvas contents on top
    exportCtx.drawImage(canvas, 0, 0);

    // 2.5 Draw active geometry tools on top of canvas for export
    if (rulerState.active) {
      exportCtx.save();
      // Translate to CSS transform center
      exportCtx.translate(rulerState.x + 160, rulerState.y + 38);
      exportCtx.rotate(rulerState.angle * Math.PI / 180);
      exportCtx.scale(rulerState.scale, rulerState.scale);

      // Background Tint
      exportCtx.fillStyle = isLight ? 'rgba(8, 102, 126, 0.08)' : 'rgba(34, 211, 238, 0.05)';
      exportCtx.fillRect(-160, -38, 320, 76);

      // Draw Ruler Border
      exportCtx.strokeStyle = isLight ? 'rgba(8, 102, 126, 0.6)' : 'rgba(34, 211, 238, 0.4)';
      exportCtx.lineWidth = 1;
      exportCtx.strokeRect(-160, -38, 320, 76);

      // Centimeter markings
      const startX = -150;
      const cmStep = 300 / 15;
      exportCtx.strokeStyle = isLight ? '#08667e' : '#22d3ee';
      exportCtx.fillStyle = isLight ? '#08667e' : '#22d3ee';
      exportCtx.font = 'bold 7px monospace';
      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'top';

      for (let i = 0; i <= 15; i++) {
        const xPos = startX + i * cmStep;
        
        // Major Tick
        exportCtx.beginPath();
        exportCtx.moveTo(xPos, -38);
        exportCtx.lineTo(xPos, -28);
        exportCtx.stroke();

        // Centimeter value
        exportCtx.fillText(i.toString(), xPos, -24);

        // Millimeter ticks
        if (i < 15) {
          const mmStep = cmStep / 10;
          for (let j = 1; j < 10; j++) {
            const mmX = xPos + j * mmStep;
            exportCtx.beginPath();
            exportCtx.moveTo(mmX, -38);
            exportCtx.lineTo(mmX, j === 5 ? -32 : -35);
            exportCtx.stroke();
          }
        }
      }

      // Title
      exportCtx.fillStyle = isLight ? 'rgba(8, 102, 126, 0.9)' : 'rgba(34, 211, 238, 0.8)';
      exportCtx.fillText(`Ruler · ${Math.round(rulerState.angle)}°`, 0, -5);

      // Bottom bar
      exportCtx.fillStyle = isLight ? '#cffafe' : '#084d62';
      exportCtx.fillRect(-160, 18, 320, 20);
      
      exportCtx.strokeStyle = isLight ? 'rgba(8, 102, 126, 0.3)' : 'rgba(34, 211, 238, 0.3)';
      exportCtx.beginPath();
      exportCtx.moveTo(-160, 18);
      exportCtx.lineTo(160, 18);
      exportCtx.stroke();

      exportCtx.fillStyle = isLight ? '#0e7490' : '#22d3ee';
      exportCtx.fillText(`Drag to Move  ·  Scale: ${Math.round(rulerState.scale * 100)}%`, 0, 24);

      exportCtx.restore();
    }

    if (protractorState.active) {
      exportCtx.save();
      // Translate to CSS transform center bottom
      exportCtx.translate(protractorState.x + 120, protractorState.y + 140);
      exportCtx.rotate(protractorState.angle * Math.PI / 180);
      exportCtx.scale(protractorState.scale, protractorState.scale);

      // Background Tint
      exportCtx.fillStyle = isLight ? 'rgba(91, 33, 182, 0.08)' : 'rgba(167, 139, 250, 0.05)';
      exportCtx.beginPath();
      exportCtx.arc(0, -20, 120, Math.PI, 0);
      exportCtx.fill();

      // Semi-circle Arc
      exportCtx.beginPath();
      exportCtx.arc(0, -20, 120, Math.PI, 0);
      exportCtx.strokeStyle = isLight ? 'rgba(91, 33, 182, 0.6)' : 'rgba(167, 139, 250, 0.4)';
      exportCtx.lineWidth = 1;
      exportCtx.stroke();

      // Inner Concentric split line
      exportCtx.beginPath();
      exportCtx.arc(0, -20, 84, Math.PI, 0);
      exportCtx.strokeStyle = isLight ? 'rgba(91, 33, 182, 0.2)' : 'rgba(167, 139, 250, 0.2)';
      exportCtx.lineWidth = 0.7;
      exportCtx.stroke();

      // Flat Edge Line
      exportCtx.beginPath();
      exportCtx.moveTo(-120, -20);
      exportCtx.lineTo(120, -20);
      exportCtx.stroke();

      // Degrees
      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'middle';

      for (let i = 0; i <= 18; i++) {
        const degree = i * 10;
        const angleRad = (180 - degree) * (Math.PI / 180);
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        
        // Tick Mark
        exportCtx.beginPath();
        exportCtx.moveTo(cos * 120, -20 - sin * 120);
        exportCtx.lineTo(cos * 105, -20 - sin * 105);
        exportCtx.strokeStyle = isLight ? 'rgba(91, 33, 182, 0.7)' : 'rgba(196, 181, 253, 0.6)';
        exportCtx.lineWidth = 1;
        exportCtx.stroke();

        // Dual scale labels
        if (degree % 30 === 0) {
          // Outer scale text
          exportCtx.fillStyle = isLight ? '#5b21b6' : '#c4b5fd';
          exportCtx.font = 'bold 7px monospace';
          const tx = cos * 92;
          const ty = -20 - sin * 92;
          exportCtx.fillText(degree.toString(), tx, ty);

          // Inner scale text
          exportCtx.fillStyle = isLight ? '#7c3aed' : '#a78bfa';
          exportCtx.font = 'bold 6.5px monospace';
          const txi = cos * 76;
          const tyi = -20 - sin * 76;
          exportCtx.fillText((180 - degree).toString(), txi, tyi);
        }
      }

      // Center Vertex
      exportCtx.beginPath();
      exportCtx.arc(0, -20, 2, 0, Math.PI * 2);
      exportCtx.fillStyle = isLight ? '#5b21b6' : '#c4b5fd';
      exportCtx.fill();

      // Bottom Bar
      exportCtx.fillStyle = isLight ? '#ede9fe' : '#2e1065';
      exportCtx.fillRect(-120, -20, 240, 20);

      exportCtx.strokeStyle = isLight ? 'rgba(91, 33, 182, 0.3)' : 'rgba(196, 181, 253, 0.3)';
      exportCtx.beginPath();
      exportCtx.moveTo(-120, -20);
      exportCtx.lineTo(120, -20);
      exportCtx.stroke();

      exportCtx.fillStyle = isLight ? '#6d28d9' : '#c4b5fd';
      exportCtx.font = 'bold 7px monospace';
      exportCtx.fillText(`Protractor · ${Math.round(protractorState.angle)}° · Scale: ${Math.round(protractorState.scale * 100)}%`, 0, -12);

      exportCtx.restore();
    }

    // 3. Trigger download
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `whiteboard-${dateStr}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coords = getCoordinates(e);
    startPosRef.current = coords;
    prevPosRef.current = coords;
    isDrawingRef.current = true;
    
    if (tool === 'laser') {
      return;
    }
    const ctx = canvas.getContext('2d');
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const handleDraw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coords = getCoordinates(e);
    
    if (tool === 'laser') {
      const segment = {
        x1: prevPosRef.current.x,
        y1: prevPosRef.current.y,
        x2: coords.x,
        y2: coords.y,
        color: color,
        width: brushSize * 2 + 1, // Laser pointer looks better slightly bolder
        createdAt: Date.now(),
        life: 2500
      };
      laserSegmentsRef.current.push(segment);
      prevPosRef.current = coords;
      triggerLaserRedraw();
      return;
    }

    const ctx = canvas.getContext('2d');
    
    if (tool === 'draw' || tool === 'erase') {
      ctx.beginPath();
      ctx.moveTo(prevPosRef.current.x, prevPosRef.current.y);
      ctx.lineTo(coords.x, coords.y);
      
      if (tool === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize * 5;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      prevPosRef.current = coords;
    } else {
      // Shape / Line previews
      if (snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
      }
      
      ctx.beginPath();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const startX = startPosRef.current.x;
      const startY = startPosRef.current.y;
      
      if (tool === 'line') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.strokeRect(startX, startY, coords.x - startX, coords.y - startY);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(coords.x - startX, 2) + Math.pow(coords.y - startY, 2));
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'triangle') {
        ctx.moveTo(startX + (coords.x - startX) / 2, startY);
        ctx.lineTo(coords.x, coords.y);
        ctx.lineTo(startX, coords.y);
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  const handleEnd = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      if (tool !== 'laser') {
        saveState();
      }
    }
  };

  const getBgClass = () => {
    if (wbTheme === 'light') {
      return wbGrid ? 'wb-grid-light' : 'bg-white';
    } else {
      return wbGrid ? 'wb-grid-dark' : 'bg-zinc-950';
    }
  };

  return (
    <div className="px-3 mb-4">
      {/* Smart Board Toggle Button in Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-xs select-none cursor-pointer
          border-slate-800 bg-slate-100 text-slate-900 font-extrabold hover:bg-slate-200 hover:text-black hover:border-slate-950 shadow-sm
          dark:border-cyan-400/10 dark:bg-cyan-500/5 dark:text-cyan-400 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300 dark:hover:border-cyan-400/20 dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:font-bold dark:font-mono dark:tracking-wide dark:uppercase"
      >
        <div className="flex items-center gap-2">
          <PenTool size={14} className="text-cyan-600 dark:text-cyan-400 stroke-[2.5]" />
          <span>Explanation Board</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse" />
          <span className="text-[9px] text-slate-500 dark:text-cyan-400/60 font-medium">Launch</span>
        </div>
      </button>

      {/* Draggable & Resizable Whiteboard Window Popup */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            left: isFullScreen ? 0 : windowPos.x,
            top: isFullScreen ? 0 : windowPos.y,
            width: isFullScreen ? '100vw' : `${windowSize.width}px`,
            height: isFullScreen ? '100vh' : `${windowSize.height}px`,
            zIndex: 9999,
          }}
          className={`bg-zinc-950/85 backdrop-blur-md select-none overflow-visible shadow-2xl flex flex-col ${
            isFullScreen ? 'w-screen h-screen' : 'border-2 border-white/10 rounded-2xl'
          }`}
        >
          {/* Draggable Header Bar */}
          <div
            onMouseDown={handleWindowDragStart}
            onTouchStart={handleWindowDragStart}
            className={`h-10 bg-zinc-900/80 border-b border-white/5 flex items-center justify-between px-4 select-none cursor-move flex-shrink-0 ${
              isFullScreen ? '' : 'rounded-t-2xl'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-zinc-200 tracking-wide font-mono uppercase">Smart Explanation Board</span>
            </div>
            
            {/* Header controls (Maximize / Close) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? "Restore Popup Size" : "Make Full Screen"}
                className="h-6 w-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5 pointer-events-auto"
              >
                {isFullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Board"
                className="h-6 w-6 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/20 flex items-center justify-center transition-all cursor-pointer text-xs font-bold pointer-events-auto"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative flex-1 w-full overflow-hidden touch-none">
            {/* Background CSS Grid Pattern classes */}
            <div className={`absolute inset-0 w-full h-full transition-colors duration-200 ${getBgClass()}`}>
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                onMouseDown={handleStart}
                onMouseMove={handleDraw}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleDraw}
                onTouchEnd={handleEnd}
              />
              <canvas
                ref={laserCanvasRef}
                className={`absolute inset-0 w-full h-full touch-none ${tool === 'laser' ? 'pointer-events-auto cursor-crosshair z-[10]' : 'pointer-events-none z-[1]'}`}
                onMouseDown={handleStart}
                onMouseMove={handleDraw}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleDraw}
                onTouchEnd={handleEnd}
              />
            </div>

          {/* Draggable & Rotatable Ruler Widget */}
          {rulerState.active && (
            <div
              id="ruler-widget"
              style={{
                position: 'absolute',
                left: rulerState.x,
                top: rulerState.y,
                transform: `rotate(${rulerState.angle}deg) scale(${rulerState.scale})`,
                transformOrigin: 'center center',
                width: '320px',
                height: '76px',
                touchAction: 'none',
              }}
              className={`z-[10000] flex flex-col justify-between border ${
                isLight ? 'border-cyan-600/60 bg-cyan-50/15 shadow-cyan-800/5' : 'border-cyan-500/40 bg-zinc-950/5'
              } rounded shadow-lg select-none pointer-events-none`}
            >
              {/* Ruler Markings (centimeters / ticks) - Click Pass-Through */}
              <div className="relative w-full h-[56px] pointer-events-none">
                <div className={`absolute top-0 left-0 right-0 h-4 flex justify-between px-2 pt-0.5 border-b ${
                  isLight ? 'border-cyan-600/10' : 'border-white/10'
                }`}>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className={`text-[7px] ${
                        isLight ? 'text-cyan-800 font-extrabold' : 'text-cyan-400 font-bold'
                      } font-mono leading-none`}>{i}</span>
                      <div className={`h-2 w-[1px] ${
                        isLight ? 'bg-cyan-600' : 'bg-cyan-400/40'
                      } mt-[1px]`} />
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-2 pt-0.5 opacity-40">
                  {Array.from({ length: 76 }).map((_, i) => {
                    if (i % 5 === 0) return null;
                    return (
                      <div
                        key={i}
                        className={`h-1 w-[0.5px] ${
                          isLight ? 'bg-cyan-700' : 'bg-cyan-300'
                        }`}
                        style={{ marginLeft: `${i * 4}px` }}
                      />
                    );
                  })}
                </div>

                {/* Title & Stats */}
                <div className={`w-full text-center text-[10px] ${
                  isLight ? 'text-cyan-800/90' : 'text-cyan-400/80'
                } font-mono font-bold pt-4`}>
                  Ruler · {Math.round(rulerState.angle)}° · {Math.round(rulerState.scale * 100)}%
                </div>
              </div>

              {/* Bottom Grab/Drag Bar (Active pointer events) */}
              <div
                onMouseDown={(e) => handleDragStart(e, 'ruler')}
                onTouchStart={(e) => handleDragStart(e, 'ruler')}
                className={`w-full h-5 ${
                  isLight ? 'bg-cyan-100/40 backdrop-blur-sm border-t border-cyan-300' : 'bg-cyan-950/90 border-t border-cyan-500/20'
                } flex items-center justify-between px-2 cursor-move pointer-events-auto rounded-b`}
              >
                {/* Close Button */}
                <button
                  onClick={() => setRulerState(prev => ({ ...prev, active: false }))}
                  className="h-3.5 w-3.5 rounded-full bg-red-500/20 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white flex items-center justify-center text-[8px] font-bold cursor-pointer transition-all"
                  title="Hide ruler"
                >
                  ✕
                </button>
                
                <span className={`text-[8px] ${
                  isLight ? 'text-cyan-700' : 'text-cyan-400/70'
                } font-mono font-bold uppercase tracking-wider`}>Drag to Move</span>
                
                {/* Scale & Rotate buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onMouseDown={(e) => handleScaleStart(e, 'ruler')}
                    onTouchStart={(e) => handleScaleStart(e, 'ruler')}
                    className={`h-3.5 px-1 rounded ${
                      isLight ? 'bg-cyan-50 hover:bg-cyan-200 text-cyan-800 border-cyan-400' : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border-cyan-500'
                    } border text-[7px] font-extrabold flex items-center justify-center cursor-se-resize active:scale-95 transition-all`}
                    title="Drag to resize / stretch"
                  >
                    ⤢ Stretch
                  </button>
                  <button
                    onMouseDown={(e) => handleRotateStart(e, 'ruler')}
                    onTouchStart={(e) => handleRotateStart(e, 'ruler')}
                    className={`h-3.5 w-3.5 rounded ${
                      isLight ? 'bg-cyan-50 hover:bg-cyan-200 text-cyan-800 border-cyan-400' : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border-cyan-500'
                    } border text-[8px] font-bold flex items-center justify-center cursor-alias active:scale-95 transition-all`}
                    title="Rotate ruler"
                  >
                    ↻
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Draggable & Rotatable Protractor Widget */}
          {protractorState.active && (
            <div
              id="protractor-widget"
              style={{
                position: 'absolute',
                left: protractorState.x,
                top: protractorState.y,
                transform: `rotate(${protractorState.angle}deg) scale(${protractorState.scale})`,
                transformOrigin: 'center bottom',
                width: '240px',
                height: '140px',
                touchAction: 'none',
              }}
              className={`z-[10000] border-t border-x ${
                isLight ? 'border-violet-600/60 bg-violet-50/15 shadow-violet-800/5' : 'border-violet-500/40 bg-zinc-950/5'
              } rounded-t-full shadow-lg select-none pointer-events-none flex flex-col justify-end`}
            >
              {/* Semi-circular markings SVG - Click Pass-Through */}
              <div className="relative w-full h-[120px] pointer-events-none">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 120">
                  {/* Concentric Splitter line */}
                  <path
                    d="M 36 112 A 84 84 0 0 1 204 112"
                    fill="none"
                    stroke={isLight ? 'rgba(109, 40, 217, 0.2)' : 'rgba(196, 181, 253, 0.2)'}
                    strokeWidth="0.7"
                  />
                  {/* Protractor baseline */}
                  <line
                    x1="12"
                    y1="112"
                    x2="228"
                    y2="112"
                    stroke={isLight ? 'rgba(109, 40, 217, 0.5)' : 'rgba(196, 181, 253, 0.4)'}
                    strokeWidth="1"
                  />
                  {Array.from({ length: 19 }).map((_, i) => {
                    const degree = i * 10;
                    const angleRad = (180 - degree) * (Math.PI / 180);
                    const radius = 105;
                    const x = 120 + radius * Math.cos(angleRad);
                    const y = 112 - radius * Math.sin(angleRad);
                    
                    return (
                      <g key={degree}>
                        <line
                          x1={120 + 115 * Math.cos(angleRad)}
                          y1={112 - 115 * Math.sin(angleRad)}
                          x2={x}
                          y2={y}
                          stroke={isLight ? 'rgba(109, 40, 217, 0.7)' : 'rgba(196, 181, 253, 0.6)'}
                          strokeWidth="1"
                        />
                        {degree % 30 === 0 && (
                          <g>
                            {/* Outer reading text (0 to 180 Left-to-Right) */}
                            <text
                              x={120 + 92 * Math.cos(angleRad)}
                              y={112 - 92 * Math.sin(angleRad)}
                              fill={isLight ? '#5b21b6' : '#C4B5FD'}
                              fontSize="7"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                              alignmentBaseline="middle"
                            >
                              {degree}
                            </text>
                            {/* Inner reading text (180 to 0 Left-to-Right / 0 to 180 Right-to-Left) */}
                            <text
                              x={120 + 76 * Math.cos(angleRad)}
                              y={112 - 76 * Math.sin(angleRad)}
                              fill={isLight ? '#7c3aed' : '#a78bfa'}
                              fontSize="6.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                              alignmentBaseline="middle"
                              opacity="0.8"
                            >
                              {180 - degree}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                  <circle cx="120" cy="112" r="3" fill={isLight ? '#5b21b6' : '#C4B5FD'} />
                  <line x1="120" y1="112" x2="120" y2="32" stroke={isLight ? 'rgba(109, 40, 217, 0.3)' : 'rgba(196, 181, 253, 0.3)'} strokeDasharray="2,2" />
                </svg>

                {/* Title & Stats */}
                <div className={`absolute bottom-2 left-0 right-0 text-center text-[10px] ${
                  isLight ? 'text-violet-800' : 'text-violet-400/80'
                } font-mono font-bold`}>
                  Protractor · {Math.round(protractorState.angle)}° · {Math.round(protractorState.scale * 100)}%
                </div>
              </div>

              {/* Bottom Grab/Drag Bar (Active pointer events) */}
              <div
                onMouseDown={(e) => handleDragStart(e, 'protractor')}
                onTouchStart={(e) => handleDragStart(e, 'protractor')}
                className={`w-full h-6 ${
                  isLight ? 'bg-violet-100/40 backdrop-blur-sm border-t border-violet-300' : 'bg-violet-950/90 border-t border-violet-500/20'
                } flex items-center justify-between px-2 cursor-move pointer-events-auto rounded-b`}
              >
                {/* Close Button */}
                <button
                  onClick={() => setProtractorState(prev => ({ ...prev, active: false }))}
                  className="h-3.5 w-3.5 rounded-full bg-red-500/20 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white flex items-center justify-center text-[8px] font-bold cursor-pointer transition-all"
                  title="Hide protractor"
                >
                  ✕
                </button>
                
                <span className={`text-[8px] ${
                  isLight ? 'text-violet-700' : 'text-violet-400/70'
                } font-mono font-bold uppercase tracking-wider`}>Drag to Move</span>

                {/* Scale & Rotate buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onMouseDown={(e) => handleScaleStart(e, 'protractor')}
                    onTouchStart={(e) => handleScaleStart(e, 'protractor')}
                    className={`h-3.5 px-1 rounded ${
                      isLight ? 'bg-violet-50 hover:bg-violet-200 text-violet-800 border-violet-450' : 'bg-violet-950 border border-violet-500 text-violet-400'
                    } border text-[7px] font-extrabold flex items-center justify-center cursor-se-resize active:scale-95 transition-all`}
                    title="Drag to resize / stretch"
                  >
                    ⤢ Stretch
                  </button>
                  <button
                    onMouseDown={(e) => handleRotateStart(e, 'protractor')}
                    onTouchStart={(e) => handleRotateStart(e, 'protractor')}
                    className={`h-3.5 w-3.5 rounded ${
                      isLight ? 'bg-violet-50 hover:bg-violet-200 text-violet-800 border-violet-450' : 'bg-violet-950 border border-violet-500 text-violet-400'
                    } border text-[8px] font-bold flex items-center justify-center cursor-alias active:scale-95 transition-all`}
                    title="Rotate protractor"
                  >
                    ↻
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>

          {/* Floating Cybernetic Dock Toolbar (Right Side Centered) - Compact Design */}
          <div
            style={{
              position: isFullScreen ? 'fixed' : 'absolute',
              right: isFullScreen ? '24px' : '-94px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            className="z-[10001] flex flex-col items-center gap-4 px-2.5 py-4 bg-zinc-900/80 border border-white/10 rounded-xl backdrop-blur-md shadow-2xl w-20"
          >
            
            {/* Draw mode icons - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-white/5 w-full">
              {[
                { id: 'draw', icon: PenTool, label: 'Free Draw' },
                { id: 'erase', icon: Eraser, label: 'Eraser' },
                { id: 'laser', icon: Zap, label: 'Laser Pointer' },
                { id: 'line', icon: Minus, label: 'Straight Line' },
                { id: 'rect', icon: Square, label: 'Rectangle' },
                { id: 'circle', icon: Circle, label: 'Circle' },
                { id: 'triangle', icon: Triangle, label: 'Triangle' }
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    title={t.label}
                    className={`flex items-center justify-center p-2 rounded transition-all ${
                      tool === t.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>

            {/* Colors picker - Compact Grid */}
            <div className="grid grid-cols-2 gap-1.5 bg-zinc-950/60 p-1.5 rounded-lg border border-white/5 w-full justify-items-center">
              {['#22d3ee', '#34d399', '#f59e0b', '#f43f5e', '#ffffff', '#000000'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-5 w-5 rounded-full border border-black/30 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 6px ${c}` : 'none',
                    border: color === c ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.2)'
                  }}
                />
              ))}
            </div>

            {/* Geometry Tools - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-white/5 w-full">
              <button
                onClick={() => setRulerState(prev => ({ ...prev, active: !prev.active }))}
                title="Toggle Ruler"
                className={`flex items-center justify-center p-2 rounded transition-all ${
                  rulerState.active
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Ruler size={16} />
              </button>
              <button
                onClick={() => setProtractorState(prev => ({ ...prev, active: !prev.active }))}
                title="Toggle Protractor"
                className={`flex items-center justify-center p-2 rounded transition-all ${
                  protractorState.active
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Compass size={16} />
              </button>
            </div>

            {/* Size brush selector - Compact */}
            <div className="flex flex-col items-center gap-1 bg-zinc-950/60 p-1.5 rounded-lg border border-white/5 w-full">
              <input
                type="range"
                min="1"
                max="25"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-14 h-0.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-400"
                title={`Brush Size: ${brushSize}px`}
              />
              <span className="text-[8px] text-white font-mono font-bold leading-none">{brushSize}px</span>
            </div>

            {/* Board Theme & Grid Toggles (Unified row of icons) */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-white/5 w-full">
              <button
                onClick={() => setWbTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                title={wbTheme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
                className={`flex items-center justify-center p-2 rounded transition-all ${
                  wbTheme === 'light' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {wbTheme === 'light' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                onClick={() => setWbGrid(!wbGrid)}
                title={wbGrid ? "Disable Grid Overlay" : "Enable Grid Overlay"}
                className={`flex items-center justify-center p-2 rounded transition-all ${
                  wbGrid ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {wbGrid ? <Grid size={15} /> : <Square size={15} />}
              </button>
            </div>

            {/* Actions: Undo/Redo & Save/Trash */}
            <div className="flex flex-col gap-1 w-full">
              <div className="grid grid-cols-2 gap-1 w-full">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="flex items-center justify-center p-2 rounded bg-zinc-950/60 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Undo last stroke"
                >
                  <Undo size={14} />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex items-center justify-center p-2 rounded bg-zinc-950/60 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Redo next stroke"
                >
                  <Redo size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 w-full">
                <button
                  onClick={downloadBoard}
                  className="flex items-center justify-center p-2 rounded border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/25 transition-all"
                  title="Save drawing as PNG image"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={resetBoard}
                  className="flex items-center justify-center p-2 rounded border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all"
                  title="Clear whiteboard canvas"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Draggable Resize Handle (Only shown in Windowed Mode in bottom right corner) */}
          {!isFullScreen && (
            <div
              onMouseDown={handleWindowResizeStart}
              onTouchStart={handleWindowResizeStart}
              style={{
                position: 'absolute',
                right: '0',
                bottom: '0',
                width: '28px',
                height: '28px',
                cursor: 'se-resize',
                zIndex: 10002,
                pointerEvents: 'auto',
              }}
              className="flex items-end justify-end p-1.5"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" className="text-zinc-500 fill-current opacity-70">
                <path d="M10,0 L0,10 L10,10 Z" />
              </svg>
            </div>
          )}

        </div>
      )}
    </div>
  );
}