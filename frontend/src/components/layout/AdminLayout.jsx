import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, HelpCircle, FileText,
  Sparkles, Users, LogOut, ChevronRight, Settings, Sun, Moon, FolderOpen, Award
} from 'lucide-react';
import useAuthStore from '@/store/authStore';

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',    exact: true },
  { to: '/admin/curriculum', icon: BookOpen,        label: 'Curriculum'   },
  { to: '/admin/materials',  icon: FolderOpen,      label: 'Materials Explorer' },
  { to: '/admin/questions',  icon: HelpCircle,      label: 'Question Bank'},
  { to: '/admin/exams',      icon: FileText,        label: 'Exams'        },
  { to: '/admin/certificates', icon: Award,          label: 'Certificates' },
  { to: '/admin/students',   icon: Users,           label: 'Users'        },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings'     },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .al-root {
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

  html.light .al-root, .light .al-root {
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

  /* ── SIDEBAR WRAPPER & SLIDING HOVER SIDEBAR ── */
  .al-aside-wrapper {
    width: 68px;
    flex-shrink: 0;
    position: relative;
    z-index: 50;
    height: 100vh;
  }
  .al-aside {
    width: 68px;
    height: 100vh;
    position: absolute;
    top: 0; left: 0; bottom: 0;
    flex-shrink: 0;
    display: flex; flex-direction: column;
    background: #0d0d11;
    border-right: 1px solid var(--local-card-bdr);
    overflow: hidden;
    z-index: 50;
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease, background 0.3s ease;
    will-change: width;
  }
  .light .al-aside {
    background: #FFFFFF;
  }
  .al-aside:hover {
    width: 240px;
    box-shadow: 12px 0 36px rgba(0, 0, 0, 0.5);
    background: #0f0f13;
  }
  .light .al-aside:hover {
    background: #FFFFFF;
    box-shadow: 12px 0 36px rgba(0, 0, 0, 0.12);
  }

  /* Subtle ambient glow behind sidebar */
  .al-aside::before {
    content: '';
    position: absolute;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%);
    top: -80px; left: -80px;
    pointer-events: none;
    animation: al-blob 12s ease-in-out infinite alternate;
  }
  .light .al-aside::before {
    background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
  }
  .al-aside::after {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%);
    bottom: 40px; right: -60px;
    pointer-events: none;
    animation: al-blob 15s ease-in-out infinite alternate-reverse;
  }
  .light .al-aside::after {
    background: radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%);
  }
  @keyframes al-blob { from{transform:translate(0,0)} to{transform:translate(15px,-12px)} }

  /* ── LOGO ── */
  .al-logo {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 0.85rem;
    border-bottom: 1px solid var(--local-card-bdr);
    position: relative; z-index: 1; flex-shrink: 0;
    height: 68px;
    overflow: hidden;
  }
  .al-logo-mark {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .al-logo-info {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s ease 0.05s, visibility 0.25s ease 0.05s;
    white-space: nowrap;
  }
  .al-aside:hover .al-logo-info {
    opacity: 1;
    visibility: visible;
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

  .al-theme-btn {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s ease 0.05s, visibility 0.25s ease 0.05s;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0.35rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .al-aside:hover .al-theme-btn {
    opacity: 1;
    visibility: visible;
  }

  /* ── NAV ── */
  .al-nav {
    flex: 1; padding: 0.75rem 0.5rem;
    display: flex; flex-direction: column; gap: 0.3rem;
    overflow-y: auto; overflow-x: hidden; position: relative; z-index: 1;
  }
  .al-nav::-webkit-scrollbar { width: 0; }

  .al-nav-item {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.65rem 0.85rem; border-radius: 14px;
    font-size: 0.8rem; font-weight: 600;
    color: var(--color-text-secondary);
    text-decoration: none; cursor: pointer;
    transition: color 0.2s, background 0.2s, border-color 0.2s;
    position: relative; overflow: hidden;
    white-space: nowrap;
    border: 1px solid transparent;
    min-height: 42px;
  }
  .al-nav-item:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-hover);
    border-color: var(--color-surface-border);
  }
  .al-nav-item.active {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.08);
    border-color: rgba(34, 211, 238, 0.2);
  }
  .light .al-nav-item.active {
    color: var(--color-text-primary);
    background: rgba(79, 70, 229, 0.08);
    border-color: rgba(79, 70, 229, 0.2);
  }
  .al-nav-item.active .al-nav-icon { color: #22d3ee; }
  .light .al-nav-item.active .al-nav-icon { color: var(--local-lavender); }
  /* Active left accent */
  .al-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3.5px; border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #22d3ee, #34d399);
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.7);
  }
  .light .al-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #7C3AED, #00D4FF);
    box-shadow: 0 0 8px rgba(124,58,237,0.8);
  }
  .al-nav-icon { color: var(--color-text-muted); transition: color 0.2s; flex-shrink: 0; width: 18px; height: 18px; }
  .al-nav-item:hover .al-nav-icon { color: var(--color-text-secondary); }
  .al-nav-label {
    flex: 1;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s ease 0.05s, visibility 0.25s ease 0.05s;
    white-space: nowrap;
  }
  .al-aside:hover .al-nav-label {
    opacity: 1;
    visibility: visible;
  }
  .al-nav-chevron {
    opacity: 0; visibility: hidden; color: var(--color-text-muted);
    transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
  }
  .al-aside:hover .al-nav-item:hover .al-nav-chevron { opacity: 1; visibility: visible; transform: translateX(2px); }
  .al-aside:hover .al-nav-item.active .al-nav-chevron { opacity: 0.5; visibility: visible; }

  /* ── USER FOOTER ── */
  .al-footer {
    padding: 0.65rem 0.5rem;
    border-top: 1px solid var(--local-card-bdr);
    position: relative; z-index: 1; flex-shrink: 0;
  }
  .al-user-row {
    display: flex; align-items: center; gap: 0.65rem;
    padding: 0.65rem 0.75rem; border-radius: 16px;
    background: var(--local-card-bg);
    border: 1px solid var(--local-card-bdr);
    transition: background 0.2s, border-color 0.2s;
    white-space: nowrap;
    overflow: hidden;
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
  .al-user-details {
    flex: 1; min-width: 0;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s ease 0.05s, visibility 0.25s ease 0.05s;
    white-space: nowrap;
    overflow: hidden;
  }
  .al-aside:hover .al-user-details {
    opacity: 1;
    visibility: visible;
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
    transition: color 0.2s, background 0.2s, opacity 0.25s ease, visibility 0.25s ease;
    flex-shrink: 0;
    opacity: 0;
    visibility: hidden;
  }
  .al-aside:hover .al-logout {
    opacity: 1;
    visibility: visible;
  }
  .al-logout:hover { color: #FCA5A5; background: rgba(239,68,68,0.1); }

  /* ── MAIN ── */
  .al-main {
    flex: 1; overflow-y: auto; overflow-x: hidden;
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

        {/* ── Collapsible Sliding Sidebar Rail ── */}
        <div className="al-aside-wrapper">
          <motion.aside
            className="al-aside"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Logo */}
            <div className="al-logo">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="al-logo-mark">
                  <img src="/mentara-new.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="al-logo-info">
                  <div className="al-logo-text">Mentara Labs</div>
                  <div className="al-logo-sub">Admin Panel</div>
                </div>
              </div>
              <button
                type="button"
                className="al-theme-btn"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
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
                    title={label}
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
                <div className="al-user-details">
                  <div className="al-user-name">{user?.full_name}</div>
                  <div className="al-user-email">{user?.email}</div>
                </div>
                <button className="al-logout" onClick={handleLogout} title="Log out">
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* ── Main content ── */}
        <main className="al-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}