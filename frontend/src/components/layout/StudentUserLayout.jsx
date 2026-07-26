import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, User, LogOut, ChevronRight, Sparkles, Sun, Moon, Award } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import NotificationBell from '@/components/shared/NotificationBell';

const NAV = [
  { to: '/student/dashboard',  icon: BookOpen, label: 'Dashboard' },
  { to: '/student/certificates', icon: Award,    label: 'Certificates' },
  { to: '/student/profile',    icon: User,     label: 'Profile'   },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Quicksand:wght@600;700;800&display=swap');

  .sl-root {
    display: flex; height: 100vh; overflow: hidden;
    background: #080C16;
    font-family: 'Quicksand', sans-serif;
    --color-navy: #080C16;
    --color-surface: #0E1424;
    --color-surface-card: rgba(255, 255, 255, 0.03);
    --color-surface-border: rgba(255, 255, 255, 0.08);
    --color-surface-hover: rgba(255, 255, 255, 0.06);
    --local-cream: #F4F6FC;
    --local-muted: #94A3B8;
    --local-purple: #8B5CF6;
    --local-purple-l: #A78BFA;
    --local-cyan: #06B6D4;
  }

  html.light .sl-root, .light .sl-root {
    background: #F0F4F8;
    --color-navy: #F0F4F8;
    --color-surface: #FFFFFF;
    --color-surface-card: #FFFFFF;
    --color-surface-border: #CBD5E1;
    --color-surface-hover: #F1F5F9;
    --local-cream: #0F172A;
    --local-muted: #64748B;
    --local-purple: #7C3AED;
    --local-purple-l: #8B5CF6;
    --local-cyan: #0284C7;
  }

  .sl-aside {
    width: 68px; height: 100%; background: var(--color-surface);
    border-right: 1.5px solid var(--color-surface-border);
    display: flex; flex-direction: column; flex-shrink: 0;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
    z-index: 40;
  }
  .sl-aside:hover {
    width: 260px;
  }

  .sl-logo {
    padding: 1.25rem 1rem; display: flex; align-items: center; justify-content: flex-start; gap: 0.75rem;
    height: 72px; border-bottom: 1px solid var(--color-surface-border);
    overflow: hidden;
  }
  .sl-logo-left { display: flex; align-items: center; gap: 0.75rem; min-width: 220px; }
  .sl-logo-mark {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sl-logo-text-group { display: flex; flex-direction: column; transition: opacity 0.2s; }
  .sl-aside:not(:hover) .sl-logo-text-group { opacity: 0; pointer-events: none; }

  .sl-logo-text {
    font-family: 'Outfit', sans-serif; font-weight: 800;
    font-size: 1.05rem; color: var(--local-cream); letter-spacing: -0.02em;
    line-height: 1.1; white-space: nowrap;
  }
  .sl-logo-subtext {
    font-size: 0.68rem; font-weight: 700; color: #06B6D4; white-space: nowrap;
  }

  .sl-nav { padding: 1.25rem 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; overflow-y: auto; overflow-x: hidden; }
  .sl-nav-item {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.75rem 0.85rem; border-radius: 18px;
    color: var(--local-muted); font-size: 0.9rem; font-weight: 700;
    text-decoration: none; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1.5px solid transparent;
    min-width: 220px;
  }
  .sl-nav-item:hover {
    color: var(--local-cream); background: var(--color-surface-hover);
  }
  .sl-nav-item.active {
    color: #FFFFFF;
    background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
  }
  .sl-nav-icon { flex-shrink: 0; transition: transform 0.2s; }
  .sl-nav-item.active .sl-nav-icon { color: #FFFFFF; transform: scale(1.1); }
  .sl-nav-label { flex: 1; transition: opacity 0.2s; white-space: nowrap; }
  .sl-aside:not(:hover) .sl-nav-label { opacity: 0; pointer-events: none; }
  .sl-nav-chevron { opacity: 0.5; transition: opacity 0.2s; flex-shrink: 0; }
  .sl-aside:not(:hover) .sl-nav-chevron { opacity: 0; display: none; }

  .sl-theme-bar {
    padding: 0 0.5rem 0.75rem; display: flex; align-items: center; gap: 0.5rem; overflow: hidden;
  }
  .sl-theme-btn {
    background: var(--color-surface-hover);
    border: 1px solid var(--color-surface-border);
    color: var(--local-muted);
    cursor: pointer;
    padding: 0.45rem 0.65rem;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    font-weight: 700;
    min-width: 34px;
  }
  .sl-theme-text { white-space: nowrap; transition: opacity 0.2s; }
  .sl-aside:not(:hover) .sl-theme-text { opacity: 0; display: none; }
  .sl-aside:not(:hover) .sl-notif-wrap { display: none; }

  .sl-premium {
    margin: 0 0.5rem 1rem; padding: 0.75rem 0.85rem; border-radius: 18px;
    background: linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.06) 100%);
    border: 1.5px solid rgba(245,158,11,0.25);
    display: flex; align-items: center; gap: 0.75rem; overflow: hidden; min-height: 48px;
  }
  .sl-premium-star { font-size: 1.2rem; flex-shrink: 0; }
  .sl-premium-text { font-size: 0.85rem; font-weight: 800; color: #FBBF24; white-space: nowrap; transition: opacity 0.2s; }
  .sl-aside:not(:hover) .sl-premium-text { opacity: 0; pointer-events: none; }

  .sl-upgrade {
    margin: 0 0.5rem 1rem; padding: 0.65rem 0.85rem; border-radius: 18px;
    background: linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(139,92,246,0.12) 100%);
    border: 1.5px solid rgba(139,92,246,0.25);
    display: flex; align-items: center; gap: 0.75rem; text-align: left;
    cursor: pointer; transition: all 0.25s ease;
    width: calc(100% - 1rem); min-height: 48px; overflow: hidden;
  }
  .sl-upgrade:hover {
    border-color: rgba(139,92,246,0.5); transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139,92,246,0.2);
  }
  .sl-upgrade-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: rgba(139,92,246,0.2); display: flex; align-items: center; justify-content: center;
    color: #A78BFA; flex-shrink: 0;
  }
  .sl-upgrade-copy { display: flex; flex-direction: column; gap: 1px; transition: opacity 0.2s; }
  .sl-aside:not(:hover) .sl-upgrade-copy { opacity: 0; pointer-events: none; }
  .sl-upgrade-title { font-size: 0.82rem; font-weight: 800; color: var(--local-cream); white-space: nowrap; }
  .sl-upgrade-sub { font-size: 0.68rem; font-weight: 600; color: var(--local-muted); white-space: nowrap; }

  .sl-footer {
    padding: 0.75rem 0.5rem; border-top: 1px solid var(--color-surface-border); overflow: hidden;
  }
  .sl-user-row {
    display: flex; align-items: center; gap: 0.75rem; padding: 0.25rem; border-radius: 14px;
    min-width: 220px;
  }
  .sl-user-details { flex: 1; min-width: 0; transition: opacity 0.2s; }
  .sl-aside:not(:hover) .sl-user-details { opacity: 0; pointer-events: none; }
  .sl-aside:not(:hover) .sl-logout { opacity: 0; display: none; }

  .sl-avatar {
    width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #06B6D4);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif; font-weight: 800; color: #FFFFFF;
    border: 2px solid rgba(255,255,255,0.2); overflow: hidden; flex-shrink: 0;
  }
  .sl-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .sl-user-name { font-size: 0.85rem; font-weight: 800; color: var(--local-cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-user-email { font-size: 0.68rem; color: var(--local-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-logout {
    background: transparent; border: none; color: var(--local-muted); cursor: pointer;
    padding: 0.45rem; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    transition: color 0.2s, background 0.2s;
  }
  .sl-logout:hover { color: #EF4444; background: rgba(239,68,68,0.1); }

  /* Main Area */
  .sl-main { flex: 1; height: 100%; overflow-y: auto; position: relative; }
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

  useEffect(() => {
    const preventImageSave = (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    };
    const preventImageDrag = (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
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

        {/* ── Collapsible Sidebar ── */}
        <aside className="sl-aside">
          {/* Logo */}
          <div className="sl-logo">
            <div className="sl-logo-left">
              <div className="sl-logo-mark">
                <img src="/mentara-new.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="sl-logo-text-group">
                <span className="sl-logo-text">Mentara Labs</span>
                <span className="sl-logo-subtext">Cambridge Primary</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="sl-nav">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sl-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={18} className="sl-nav-icon" />
                <span className="sl-nav-label">{label}</span>
                <ChevronRight size={13} className="sl-nav-chevron" />
              </NavLink>
            ))}
          </nav>

          {/* Theme & Notifications Bar */}
          <div className="sl-theme-bar">
            <button
              type="button"
              onClick={toggleTheme}
              className="sl-theme-btn"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              <span className="sl-theme-text">{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            <div className="sl-notif-wrap">
              <NotificationBell variant="desktop" />
            </div>
          </div>

          {/* Premium badge / Upgrade CTA */}
          {user?.is_premium ? (
            <div className="sl-premium">
              <span className="sl-premium-star">⭐</span>
              <span className="sl-premium-text">Premium Member</span>
            </div>
          ) : (
            <button className="sl-upgrade" onClick={handleUpgradeClick}>
              <span className="sl-upgrade-icon">
                <Sparkles size={16} />
              </span>
              <span className="sl-upgrade-copy">
                <span className="sl-upgrade-title">Upgrade Premium</span>
                <span className="sl-upgrade-sub">Unlock 3D simulations</span>
              </span>
            </button>
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
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Dashboard Content Area ── */}
        <main className="sl-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
