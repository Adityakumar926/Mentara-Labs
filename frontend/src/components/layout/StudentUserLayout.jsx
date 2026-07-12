import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, User, LogOut, ChevronRight, Sparkles, Sun, Moon } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import NotificationBell from '@/components/shared/NotificationBell';

const NAV = [
  { to: '/student/dashboard', icon: BookOpen,   label: 'Dashboard' },
  { to: '/student/profile',   icon: User,       label: 'Profile'   },
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

  .sl-aside {
    width: 68px; height: 100%; background: var(--color-surface);
    border-right: 1px solid var(--color-surface-border);
    display: flex; flex-direction: column; flex-shrink: 0;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
    z-index: 40;
  }
  .sl-aside:hover {
    width: 280px;
  }
  .sl-logo {
    padding: 1.5rem 1rem; display: flex; align-items: center; justify-content: flex-start; gap: 0.75rem;
    border-bottom: 1px solid var(--color-surface-border);
    height: 73px;
    overflow: hidden;
  }
  .sl-logo-left { display: flex; align-items: center; gap: 0.75rem; min-width: 220px; }
  .sl-logo-mark {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sl-logo-text {
    font-family: 'Space Grotesk', sans-serif; font-weight: 700;
    font-size: 1.15rem; color: var(--local-cream); letter-spacing: -0.025em;
    transition: opacity 0.2s;
  }
  .sl-aside:not(:hover) .sl-logo-text { opacity: 0; pointer-events: none; }
  .sl-aside:not(:hover) [title="Switch to dark theme"], 
  .sl-aside:not(:hover) [title="Switch to light theme"] { display: none; }

  .sl-nav { padding: 1.5rem 0.5rem; display: flex; flex-direction: column; gap: 0.35rem; flex: 1; overflow-y: auto; overflow-x: hidden; }
  .sl-nav-item {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.75rem 0.9rem; border-radius: 12px;
    color: var(--color-text-secondary); font-size: 0.85rem; font-weight: 550;
    text-decoration: none; transition: all 0.2s ease;
    border: 1px solid transparent;
    min-width: 220px;
  }
  .sl-nav-item:hover {
    color: var(--local-cream); background: var(--color-surface-hover);
  }
  .sl-nav-item.active {
    color: #ffffff;
    background: linear-gradient(90deg, rgba(34,211,238,0.1) 0%, rgba(168,85,247,0.04) 100%);
    border-color: rgba(34,211,238,0.18);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  .sl-nav-icon { flex-shrink: 0; transition: transform 0.2s; }
  .sl-nav-item.active .sl-nav-icon { color: #22d3ee; }
  .sl-nav-label { flex: 1; transition: opacity 0.2s; }
  .sl-aside:not(:hover) .sl-nav-label { opacity: 0; pointer-events: none; }
  .sl-nav-chevron { opacity: 0; transition: opacity 0.2s, transform 0.2s; color: var(--color-text-muted); }
  .sl-nav-item:hover .sl-nav-chevron { opacity: 0.5; }
  .sl-nav-item.active .sl-nav-chevron { opacity: 0.8; color: #22d3ee; transform: translateX(2px); }
  .sl-aside:not(:hover) .sl-nav-chevron { display: none; }

  .sl-premium {
    margin: 0 0.5rem 1rem; padding: 0.75rem; border-radius: 14px;
    background: linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(251,191,36,0.02) 100%);
    border: 1px solid rgba(245,158,11,0.15);
    display: flex; align-items: center; gap: 0.75rem;
    overflow: hidden;
    min-height: 52px;
  }
  .sl-premium-star { font-size: 1.1rem; flex-shrink: 0; }
  .sl-premium-text { font-size: 0.82rem; font-weight: 600; color: #FBBF24; white-space: nowrap; transition: opacity 0.2s; }
  .sl-aside:not(:hover) .sl-premium-text { opacity: 0; pointer-events: none; }

  .sl-upgrade {
    margin: 0 0.5rem 1rem; padding: 0.75rem; border-radius: 14px;
    background: linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(168,85,247,0.06) 100%);
    border: 1px solid rgba(34,211,238,0.15);
    display: flex; align-items: center; gap: 0.75rem; text-align: left;
    cursor: pointer; transition: border-color 0.2s, transform 0.2s;
    width: calc(100% - 1rem);
    min-width: 52px;
    overflow: hidden;
    min-height: 52px;
  }
  .sl-upgrade:hover {
    border-color: rgba(34,211,238,0.3); transform: translateY(-1px);
  }
  .sl-upgrade-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: rgba(34,211,238,0.15); display: flex; align-items: center; justify-content: center;
    color: #22d3ee; flex-shrink: 0;
  }
  .sl-upgrade-copy { display: flex; flex-direction: column; gap: 2px; transition: opacity 0.2s; }
  .sl-aside:not(:hover) .sl-upgrade-copy { opacity: 0; pointer-events: none; }
  .sl-upgrade-title { font-size: 0.8rem; font-weight: 700; color: var(--local-cream); white-space: nowrap; }
  .sl-upgrade-sub { font-size: 0.68rem; color: var(--color-text-muted); white-space: nowrap; }

  .sl-footer {
    padding: 0.75rem 0.5rem; border-top: 1px solid var(--color-surface-border);
    overflow: hidden;
  }
  .sl-user-row {
    display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 12px;
    transition: background 0.2s;
    min-width: 220px;
  }
  .sl-user-details {
    flex: 1; min-width: 0; transition: opacity 0.2s;
  }
  .sl-aside:not(:hover) .sl-user-details { opacity: 0; pointer-events: none; }
  .sl-aside:not(:hover) .sl-logout { display: none; }
  .sl-avatar {
    width: 34px; height: 34px; border-radius: 50%; background: var(--color-surface-hover);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: var(--local-lavender);
    border: 1px solid var(--color-surface-border); overflow: hidden;
    flex-shrink: 0;
  }
  .sl-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .sl-user-name { font-size: 0.8rem; font-weight: 600; color: var(--local-cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-user-email { font-size: 0.7rem; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-logout {
    background: transparent; border: none; color: var(--color-text-muted); cursor: pointer;
    padding: 0.4rem; border-radius: 8px; display: flex; align-items: center; justify-content: center;
    transition: color 0.2s, background 0.2s;
  }
  .sl-logout:hover { color: var(--local-cream); background: var(--color-surface-hover); }

  .sl-main { flex: 1; height: 100%; overflow-y: auto; position: relative; }

  /* Bottom navigation (mobile-only) */
  .sl-bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0; height: 60px;
    background: var(--color-surface); border-top: 1px solid var(--color-surface-border);
    display: none; justify-content: space-around; align-items: center;
    z-index: 50; backdrop-filter: blur(10px);
  }
  .sl-bottom-item {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 550; color: var(--color-text-secondary);
    text-decoration: none; gap: 3px;
  }
  .sl-bottom-item.active { color: #22d3ee; }
  .sl-bottom-icon { opacity: 0.7; }
  .sl-bottom-item.active .sl-bottom-icon { opacity: 1; }

  @media (max-width: 768px) {
    .sl-aside { display: none; }
    .sl-main { padding-bottom: 60px; }
    .sl-bottom-nav { display: flex; }
  }
`;

export default function StudentUserLayout() {
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
    navigate('/student/premium');
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
              <span className="sl-logo-text">Student Portal</span>
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
                <span className="sl-upgrade-sub">Unlock all subjects & animations</span>
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
              <div className="sl-user-details">
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
