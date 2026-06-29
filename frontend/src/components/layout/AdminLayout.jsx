import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, HelpCircle, FileText,
  Sparkles, Users, LogOut, ChevronRight, Settings, Sun, Moon
} from 'lucide-react';
import useAuthStore from '@/store/authStore';

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',    exact: true },
  { to: '/admin/curriculum', icon: BookOpen,        label: 'Curriculum'   },
  { to: '/admin/questions',  icon: HelpCircle,      label: 'Question Bank'},
  { to: '/admin/exams',      icon: FileText,        label: 'Exams'        },
  { to: '/admin/students',   icon: Users,           label: 'Students'     },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings'     },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .al-root {
    display: flex; height: 100vh; overflow: hidden;
    background: var(--color-navy);
    font-family: 'Inter', sans-serif;
  }

  /* ── SIDEBAR ── */
  .al-aside {
    width: 232px; flex-shrink: 0;
    display: flex; flex-direction: column;
    background: var(--local-card-bg);
    border-right: 1px solid var(--local-card-bdr);
    position: relative; overflow: hidden;
  }
  /* Subtle ambient glow behind sidebar */
  .al-aside::before {
    content: '';
    position: absolute;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
    top: -80px; left: -80px;
    pointer-events: none;
    animation: al-blob 12s ease-in-out infinite alternate;
  }
  .al-aside::after {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%);
    bottom: 40px; right: -60px;
    pointer-events: none;
    animation: al-blob 15s ease-in-out infinite alternate-reverse;
  }
  @keyframes al-blob { from{transform:translate(0,0)} to{transform:translate(15px,-12px)} }

  /* ── LOGO ── */
  .al-logo {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 1.4rem 1.25rem 1.3rem;
    border-bottom: 1px solid var(--local-card-bdr);
    position: relative; z-index: 1; flex-shrink: 0;
  }
  .al-logo-mark {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .al-logo-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    background: linear-gradient(90deg, #22d3ee, #34d399, #a855f7, #22d3ee);
    background-size: 300% 100%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    animation: al-logo-rgb 4s linear infinite;
    line-height: 1.2;
  }
  @keyframes al-logo-rgb {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  .al-logo-sub {
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--color-text-muted); margin-top: 0.05rem;
  }

  /* ── NAV ── */
  .al-nav {
    flex: 1; padding: 0.75rem 0.65rem;
    display: flex; flex-direction: column; gap: 0.2rem;
    overflow-y: auto; position: relative; z-index: 1;
  }
  .al-nav::-webkit-scrollbar { width: 0; }

  .al-nav-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.6rem 0.85rem; border-radius: 14px;
    font-size: 0.8rem; font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none; cursor: pointer;
    transition: color 0.2s, background 0.2s;
    position: relative; overflow: hidden;
    border: 1px solid transparent;
  }
  .al-nav-item:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-hover);
  }
  .al-nav-item.active {
    color: var(--color-text-primary);
    background: rgba(124,58,237,0.14);
    border-color: rgba(124,58,237,0.25);
  }
  .al-nav-item.active .al-nav-icon { color: #C4B5FD; }
  /* Active left accent */
  .al-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #7C3AED, #00D4FF);
    box-shadow: 0 0 8px rgba(124,58,237,0.8);
  }
  .al-nav-icon { color: var(--color-text-muted); transition: color 0.2s; flex-shrink: 0; }
  .al-nav-item:hover .al-nav-icon { color: var(--color-text-secondary); }
  .al-nav-label { flex: 1; }
  .al-nav-chevron {
    opacity: 0; color: var(--color-text-muted);
    transition: opacity 0.2s, transform 0.2s;
  }
  .al-nav-item:hover .al-nav-chevron { opacity: 1; transform: translateX(2px); }
  .al-nav-item.active .al-nav-chevron { opacity: 0.5; }

  /* ── USER FOOTER ── */
  .al-footer {
    padding: 0.65rem;
    border-top: 1px solid var(--local-card-bdr);
    position: relative; z-index: 1; flex-shrink: 0;
  }
  .al-user-row {
    display: flex; align-items: center; gap: 0.65rem;
    padding: 0.65rem 0.75rem; border-radius: 16px;
    background: var(--local-card-bg);
    border: 1px solid var(--local-card-bdr);
    transition: background 0.2s, border-color 0.2s;
  }
  .al-user-row:hover { background: var(--color-surface-hover); border-color: var(--local-card-bdr); }
  .al-avatar {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,212,255,0.2));
    border: 1.5px solid rgba(124,58,237,0.35);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.75rem; font-weight: 700;
    color: #C4B5FD;
  }
  .al-user-name {
    font-size: 0.75rem; font-weight: 600; color: var(--color-text-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .al-user-email {
    font-size: 0.62rem; color: var(--color-text-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .al-logout {
    width: 28px; height: 28px; border-radius: 9px;
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--color-text-muted);
    transition: color 0.2s, background 0.2s;
    flex-shrink: 0;
  }
  .al-logout:hover { color: #FCA5A5; background: rgba(239,68,68,0.1); }

  /* ── MAIN ── */
  .al-main {
    flex: 1; overflow-y: auto;
    background: var(--color-navy);
  }
  .al-main::-webkit-scrollbar { width: 6px; }
  .al-main::-webkit-scrollbar-track { background: transparent; }
  .al-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  .al-main::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.4); }
`;

export default function AdminLayout() {
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initial = user?.full_name?.[0]?.toUpperCase() ?? 'A';

  return (
    <>
      <style>{CSS}</style>
      <div className="al-root">

        {/* ── Sidebar ── */}
        <motion.aside
          className="al-aside"
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Logo */}
          <div className="al-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="al-logo-mark">
                <img src="/mentara-new.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              </div>
              <div>
                <div className="al-logo-text">Mentara Labs</div>
                <div className="al-logo-sub">Admin Panel</div>
              </div>
            </div>
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
          </div>

          {/* Nav */}
          <nav className="al-nav">
            {NAV.map(({ to, icon: Icon, label, exact }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 + i * 0.05, duration: 0.25 }}
              >
                <NavLink
                  to={to}
                  end={exact}
                  className={({ isActive }) => `al-nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon size={15} className="al-nav-icon" />
                  <span className="al-nav-label">{label}</span>
                  <ChevronRight size={11} className="al-nav-chevron" />
                </NavLink>
              </motion.div>
            ))}
          </nav>

          {/* User footer */}
          <div className="al-footer">
            <div className="al-user-row">
              <div className="al-avatar">{initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="al-user-name">{user?.full_name}</div>
                <div className="al-user-email">{user?.email}</div>
              </div>
              <button className="al-logout" onClick={handleLogout} title="Log out">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </motion.aside>

        {/* ── Main content ── */}
        <main className="al-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}