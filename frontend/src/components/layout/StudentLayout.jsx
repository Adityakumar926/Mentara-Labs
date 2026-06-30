import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, User, LogOut, Compass, HelpCircle, ChevronRight, Sparkles, Sun, Moon } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import NotificationBell from '@/components/shared/NotificationBell';

const NAV = [
  { to: '/courses',   icon: BookOpen,   label: 'Courses'   },
  { to: '/explore',   icon: Compass,    label: 'Explore'   },
  { to: '/exams',     icon: FileText,   label: 'Exams'     },
  { to: '/questions', icon: HelpCircle, label: 'Questions' },
  { to: '/profile',   icon: User,       label: 'Profile'   },
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
  .sl-aside {
    width: 220px; flex-shrink: 0;
    display: flex; flex-direction: column;
    background: rgba(255, 255, 255, 0.015);
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    position: relative; overflow: hidden;
  }
  @media (max-width: 767px) { .sl-aside { display: none; } }

  .sl-aside::before {
    content: '';
    position: absolute;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%);
    top: -70px; left: -70px; pointer-events: none;
    animation: sl-blob 11s ease-in-out infinite alternate;
  }
  .sl-aside::after {
    content: '';
    position: absolute;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%);
    bottom: 80px; right: -50px; pointer-events: none;
    animation: sl-blob 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes sl-blob { from{transform:translate(0,0)} to{transform:translate(14px,-10px)} }

  /* Logo */
  .sl-logo {
    display: flex; align-items: center; justify-content: space-between; gap: 0.7rem;
    padding: 1.4rem 1.2rem 1.3rem;
    border-bottom: 1px solid var(--local-card-bdr);
    position: relative; z-index: 1; flex-shrink: 0;
  }
  .sl-logo-left { display: flex; align-items: center; gap: 0.7rem; min-width: 0; }
  .sl-logo-mark {
    width: 34px; height: 34px;
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
  }
  @keyframes sl-logo-rgb {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }

  /* Nav */
  .sl-nav {
    flex: 1; padding: 0.7rem 0.6rem;
    display: flex; flex-direction: column; gap: 0.2rem;
    overflow-y: auto; position: relative; z-index: 1;
  }
  .sl-nav::-webkit-scrollbar { width: 0; }

  .sl-nav-item {
    display: flex; align-items: center; gap: 0.7rem;
    padding: 0.6rem 0.85rem; border-radius: 14px;
    font-size: 0.8rem; font-weight: 700;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color 0.2s, background 0.2s;
    position: relative; overflow: hidden;
    border: 2px solid transparent;
  }
  .sl-nav-item:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.06);
  }
  .sl-nav-item.active {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.08);
    border-color: rgba(34, 211, 238, 0.2);
  }
  .sl-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3.5px; border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #22d3ee, #34d399);
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.7);
  }
  .sl-nav-icon { color: var(--color-text-muted); transition: color 0.2s; flex-shrink: 0; }
  .sl-nav-item:hover .sl-nav-icon { color: var(--color-text-secondary); }
  .sl-nav-item.active .sl-nav-icon { color: #22d3ee; }
  .sl-nav-label { flex: 1; }
  .sl-nav-chevron {
    opacity: 0; color: var(--color-text-muted);
    transition: opacity 0.2s, transform 0.2s;
  }
  .sl-nav-item:hover .sl-nav-chevron { opacity: 1; transform: translateX(2px); }

  /* Premium badge */
  .sl-premium {
    margin: 0 0.6rem 0.6rem;
    padding: 0.55rem 0.85rem; border-radius: 14px;
    background: rgba(245,158,11,0.08);
    border: 2px solid var(--local-amber);
    display: flex; align-items: center; gap: 0.5rem;
    position: relative; z-index: 1;
  }
  .sl-premium-star { font-size: 0.8rem; }
  .sl-premium-text { font-size: 0.72rem; font-weight: 800; color: var(--local-amber); letter-spacing: 0.02em; }

  /* Upgrade to premium button (non-premium users) */
  .sl-upgrade {
    margin: 0 0.6rem 0.6rem;
    padding: 0.6rem 0.85rem; border-radius: 16px;
    background: rgba(245,158,11,0.05);
    border: 2px solid var(--local-amber);
    display: flex; align-items: center; gap: 0.55rem;
    position: relative; z-index: 1; overflow: hidden;
    cursor: pointer; width: 90%;
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
    width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0;
    background: linear-gradient(135deg, #F59E0B, #7C3AED);
    display: flex; align-items: center; justify-content: center;
    color: #fff;
  }
  .sl-upgrade-copy { display: flex; flex-direction: column; align-items: flex-start; text-align: left; min-width: 0; }
  .sl-upgrade-title { font-size: 0.72rem; font-weight: 800; color: var(--local-amber); letter-spacing: 0.01em; }
  .sl-upgrade-sub { font-size: 0.6rem; color: var(--color-text-secondary); font-weight: 700; }

  /* User footer */
  .sl-footer {
    padding: 0.6rem;
    border-top: 1px solid var(--local-card-bdr);
    position: relative; z-index: 1; flex-shrink: 0;
  }
  .sl-user-row {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.6rem 0.7rem; border-radius: 14px;
    background: var(--local-card-bg);
    border: 1px solid var(--local-card-bdr);
    transition: background 0.2s, border-color 0.2s;
  }
  .sl-user-row:hover { background: var(--color-surface-hover); border-color: var(--local-card-bdr); }
  .sl-avatar {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,212,255,0.2));
    border: 1.5px solid rgba(124,58,237,0.35);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.72rem; font-weight: 700; color: #C4B5FD;
    overflow: hidden;
  }
  .sl-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .sl-user-name { font-size: 0.72rem; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-user-email { font-size: 0.6rem; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-logout {
    width: 26px; height: 26px; border-radius: 8px;
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--color-text-muted); flex-shrink: 0;
    transition: color 0.2s, background 0.2s;
  }
  .sl-logout:hover { color: #FCA5A5; background: rgba(239,68,68,0.1); }

  /* ── MAIN ── */
  .sl-main {
    flex: 1; overflow-y: auto;
    background: var(--color-navy);
    padding-bottom: 0;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sl-user-name">{user?.full_name}</div>
                <div className="sl-user-email">{user?.email}</div>
              </div>
              <button className="sl-logout" onClick={handleLogout} title="Log out">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </motion.aside>

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
      </div>
    </>
  );
}