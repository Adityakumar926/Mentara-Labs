import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, NavLink, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, GraduationCap, BookOpen, FileText, User, LogOut, Compass, HelpCircle,
  ChevronRight, ChevronDown, Sparkles, Sun, Moon, PenTool, Eraser, RotateCcw,
  Maximize2, Minimize2, Square, Triangle, Circle, Minus, Ruler, Download,
  Undo, Redo, Trash2, Grid, Zap, Users, Search, Bookmark
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import NotificationBell from '@/components/shared/NotificationBell';
import VoiceTutor from '@/components/shared/VoiceTutor';
import { SidebarTeacherIllustration } from '@/features/teacher/courses/TeacherDashboardIllustrations';

const STAGE_NAV = [
  { stageKey: 'Stage 1', num: 1, label: 'Stage 1', color: '#FB7185', bg: '#FFE4E6' },
  { stageKey: 'Stage 2', num: 2, label: 'Stage 2', color: '#F59E0B', bg: '#FEF3C7' },
  { stageKey: 'Stage 3', num: 3, label: 'Stage 3', color: '#10B981', bg: '#D1FAE5' },
  { stageKey: 'Stage 4', num: 4, label: 'Stage 4', color: '#3B82F6', bg: '#DBEAFE' },
  { stageKey: 'Stage 5', num: 5, label: 'Stage 5', color: '#8B5CF6', bg: '#EDE9FE' },
];

const SECONDARY_NAV = [
  { to: '/classrooms',         icon: Users,      label: 'My Classrooms'   },
  { to: '/question-generator', icon: Sparkles,   label: 'Generator'       },
  { to: '/exams',              icon: FileText,   label: 'Exams & Quizzes' },
  { to: '/questions',          icon: HelpCircle, label: 'Question Bank'   },
  { to: '/explore',            icon: Compass,    label: 'Explore'         },
  { to: '/profile',            icon: User,       label: 'My Profile'      },
];

const MOBILE_NAV = [
  { to: '/courses',            icon: Home,       label: 'Dashboard'  },
  { to: '/classrooms',         icon: Users,      label: 'Classrooms' },
  { to: '/explore',            icon: Compass,    label: 'Resources'  },
  { to: '/question-generator', icon: Sparkles,   label: 'Generator'  },
  { to: '/exams',              icon: FileText,   label: 'Exams'      },
  { to: '/profile',            icon: User,       label: 'Profile'    },
];

const CSS = `
  .sl-root {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: #F4F7FB;
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    color: #0F172A;
    --color-navy: #F4F7FB;
    --color-surface: #FFFFFF;
    --color-surface-card: #FFFFFF;
    --color-surface-border: #E2E8F0;
    --color-surface-hover: #F1F5F9;
    --local-navy: #F4F7FB;
    --local-navy2: #F1F5F9;
    --local-card-bg: #FFFFFF;
    --local-card-bdr: #E2E8F0;
    --local-cream: #0F172A;
    --local-muted: #64748B;
    --color-text-primary: #0F172A;
    --color-text-secondary: #334155;
    --color-text-muted: #64748B;
    --local-lavender: #2563EB;
  }

  /* Global image protection */
  .sl-root img {
    -webkit-user-drag: none;
    user-drag: none;
    user-select: none;
    -webkit-user-select: none;
    pointer-events: none;
  }

  /* ── SIDEBAR (Fixed Light Theme Desktop Sidebar matching Reference) ── */
  .sl-aside-wrapper {
    width: 244px;
    flex-shrink: 0;
    position: relative;
    z-index: 40;
    height: 100vh;
  }
  @media (max-width: 1023px) {
    .sl-aside-wrapper { display: none; }
  }

  .sl-aside {
    width: 244px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
    border-right: 1px solid #E8EEF5;
    box-shadow: 4px 0 24px rgba(15, 23, 42, 0.025);
    overflow: hidden;
  }

  /* Brand Header */
  .sl-logo {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 1.15rem 1.25rem;
    border-bottom: 1px solid #F1F5F9;
    text-decoration: none;
    flex-shrink: 0;
  }
  .sl-logo-mark {
    width: 34px;
    height: 34px;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
  }
  .sl-logo-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  @keyframes sl-logo-gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .sl-logo-title {
    font-family: 'Fredoka', 'Quicksand', 'Outfit', 'Plus Jakarta Sans', sans-serif;
    font-size: 1.14rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.15;
    background: linear-gradient(
      120deg,
      #8b5cf6 0%,
      #6366f1 22%,
      #38bdf8 50%,
      #06b6d4 75%,
      #a855f7 100%
    );
    background-size: 250% 250%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: sl-logo-gradient-shift 4.5s ease-in-out infinite;
  }
  .sl-logo-sub {
    font-size: 0.66rem;
    font-weight: 600;
    color: #64748B;
    letter-spacing: 0.02em;
    margin-top: 2px;
  }

  /* Sidebar Scrollable Nav */
  .sl-nav {
    flex: 1;
    padding: 0.75rem 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .sl-nav::-webkit-scrollbar { width: 4px; }
  .sl-nav::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }

  .sl-nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.58rem 0.85rem;
    border-radius: 12px;
    font-size: 0.84rem;
    font-weight: 600;
    color: #334155;
    text-decoration: none;
    transition: all 0.18s ease;
    cursor: pointer;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-family: inherit;
  }
  .sl-nav-item:hover {
    background: #F1F5F9;
    color: #0F172A;
  }
  .sl-nav-item.active {
    background: #E8F3FF;
    color: #1D4ED8;
    font-weight: 700;
  }
  .sl-nav-icon {
    color: #475569;
    flex-shrink: 0;
    transition: color 0.18s ease;
  }
  .sl-nav-item.active .sl-nav-icon {
    color: #2563EB;
  }

  /* Stage Number Pill in Sidebar */
  .sl-stage-pill {
    width: 22px;
    height: 22px;
    border-radius: 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 800;
    color: #FFFFFF;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .sl-nav-divider {
    height: 1px;
    background: #EEF2F6;
    margin: 0.45rem 0.4rem;
    flex-shrink: 0;
  }

  .sl-sidebar-bottom {
    padding: 0.5rem 0.85rem 0.85rem;
    flex-shrink: 0;
  }

  /* ── RIGHT CONTENT COLUMN (TOPBAR + MAIN) ── */
  .sl-content-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100vh;
    overflow: hidden;
  }

  /* Top Header Bar */
  .sl-topbar {
    height: 68px;
    background: #FFFFFF;
    border-bottom: 1px solid #E8EEF5;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-shrink: 0;
    z-index: 30;
  }
  @media (max-width: 767px) {
    .sl-topbar { padding: 0 1rem; height: 60px; }
  }

  .sl-topbar-search {
    position: relative;
    flex: 1;
    max-width: 480px;
  }
  .sl-topbar-search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #38BDF8;
    pointer-events: none;
  }
  .sl-topbar-search-input {
    width: 100%;
    padding: 0.62rem 1rem 0.62rem 2.65rem;
    border-radius: 999px;
    border: 1px solid #E2E8F0;
    background: #F4F7FB;
    color: #0F172A;
    font-size: 0.84rem;
    font-weight: 500;
    outline: none;
    transition: all 0.2s ease;
    font-family: inherit;
  }
  .sl-topbar-search-input::placeholder {
    color: #94A3B8;
  }
  .sl-topbar-search-input:focus {
    background: #FFFFFF;
    border-color: #38BDF8;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
  }

  .sl-topbar-right {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex-shrink: 0;
  }

  .sl-profile-wrap {
    position: relative;
  }
  .sl-profile-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0.7rem 0.35rem 0.4rem;
    border-radius: 999px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    cursor: pointer;
    transition: all 0.18s ease;
    font-family: inherit;
  }
  .sl-profile-btn:hover {
    background: #F1F5F9;
    border-color: #CBD5E1;
  }
  .sl-profile-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
    color: #FFFFFF;
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .sl-profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .sl-profile-name {
    font-size: 0.84rem;
    font-weight: 700;
    color: #1E293B;
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sl-profile-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 230px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.1);
    padding: 0.5rem;
    z-index: 60;
  }
  .sl-profile-menu-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.6rem 0.75rem;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: #334155;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    font-family: inherit;
    text-align: left;
  }
  .sl-profile-menu-item:hover {
    background: #F1F5F9;
    color: #0F172A;
  }
  .sl-profile-menu-item.danger {
    color: #E11D48;
  }
  .sl-profile-menu-item.danger:hover {
    background: #FFF1F2;
    color: #BE123C;
  }

  /* ── MAIN SCROLLABLE STAGE ── */
  .sl-main {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: linear-gradient(180deg, #F0F6FF 0%, #F6F9FC 45%, #F4F7FB 100%);
    padding-bottom: 0;
    overscroll-behavior-y: contain;
    scroll-behavior: smooth;
  }
  @media (max-width: 1023px) {
    .sl-main { padding-bottom: 74px; }
  }
  .sl-main::-webkit-scrollbar { width: 6px; }
  .sl-main::-webkit-scrollbar-track { background: transparent; }
  .sl-main::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
  .sl-main::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

  /* ── BOTTOM NAV (mobile / tablet) ── */
  .sl-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(16px);
    border-top: 1px solid #E2E8F0;
    box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.05);
  }
  @media (max-width: 1023px) {
    .sl-bottom-nav { display: flex; }
  }

  .sl-bottom-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 0;
    gap: 0.2rem;
    text-decoration: none;
    color: #64748B;
    font-size: 0.62rem;
    font-weight: 700;
    transition: color 0.2s;
    position: relative;
  }
  .sl-bottom-item:hover { color: #0F172A; }
  .sl-bottom-item.active { color: #2563EB; }
  .sl-bottom-item.active::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 24px; height: 3px;
    border-radius: 0 0 4px 4px;
    background: #2563EB;
  }

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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeStageParam = searchParams.get('stage') || 'ALL';
  const urlQueryParam = searchParams.get('q') || '';

  const [topSearch, setTopSearch] = useState(urlQueryParam);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Sync topbar search input with URL ?q= parameter
  useEffect(() => {
    setTopSearch(searchParams.get('q') || '');
  }, [searchParams]);

  // Force Light Theme for the Teacher Portal
  useEffect(() => {
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent saving/copying images via context menus or dragging
  useEffect(() => {
    const preventImageSave = (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    };
    document.addEventListener('contextmenu', preventImageSave);
    document.addEventListener('dragstart', preventImageSave);
    return () => {
      document.removeEventListener('contextmenu', preventImageSave);
      document.removeEventListener('dragstart', preventImageSave);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleStageSelect = (stageValue) => {
    if (stageValue === 'ALL') {
      navigate('/courses');
    } else {
      navigate(`/courses?stage=${encodeURIComponent(stageValue)}`);
    }
  };

  const handleTopSearchChange = (e) => {
    const val = e.target.value;
    setTopSearch(val);
    if (location.pathname === '/courses') {
      const next = new URLSearchParams(searchParams);
      if (val.trim()) next.set('q', val);
      else next.delete('q');
      navigate(`/courses?${next.toString()}`, { replace: true });
    }
  };

  const handleTopSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/courses') {
      navigate(`/courses?q=${encodeURIComponent(topSearch.trim())}`);
    }
  };

  const rawName = user?.full_name || user?.name || 'Sarah Mitchell';
  const initial = rawName[0]?.toUpperCase() ?? 'T';
  const displayName = rawName;
  const isOnCourses = location.pathname === '/courses';

  return (
    <>
      <style>{CSS}</style>
      <div className="sl-root light">

        {/* ── Left Sidebar (Desktop) ── */}
        <div className="sl-aside-wrapper">
          <aside className="sl-aside">
            {/* Brand Logo */}
            <Link to="/courses" className="sl-logo">
              <div className="sl-logo-mark">
                <img src="/mentara-new.png" alt="Mentara Learning" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="sl-logo-copy">
                <span className="sl-logo-title">Mentara Learning</span>
                <span className="sl-logo-sub">Learn · Explore · Grow</span>
              </div>
            </Link>

            {/* Navigation List */}
            <nav className="sl-nav">
              {/* Dashboard Home */}
              <button
                type="button"
                onClick={() => handleStageSelect('ALL')}
                className={`sl-nav-item ${isOnCourses && activeStageParam === 'ALL' ? 'active' : ''}`}
              >
                <Home size={17} className="sl-nav-icon" />
                <span>Dashboard</span>
              </button>

              {/* Teacher Zone */}
              <button
                type="button"
                onClick={() => handleStageSelect('Teacher Zone')}
                className={`sl-nav-item ${isOnCourses && activeStageParam.toLowerCase().includes('teacher') ? 'active' : ''}`}
              >
                <GraduationCap size={17} className="sl-nav-icon" style={{ color: '#6D28D9' }} />
                <span>Teacher Zone</span>
              </button>

              {/* Stage 1 to 5 Quick Links */}
              {STAGE_NAV.map((stg) => {
                const isStageActive = isOnCourses && activeStageParam.toLowerCase() === stg.stageKey.toLowerCase();
                return (
                  <button
                    key={stg.stageKey}
                    type="button"
                    onClick={() => handleStageSelect(stg.stageKey)}
                    className={`sl-nav-item ${isStageActive ? 'active' : ''}`}
                  >
                    <span className="sl-stage-pill" style={{ background: stg.color }}>
                      {stg.num}
                    </span>
                    <span>{stg.label}</span>
                  </button>
                );
              })}

              <div className="sl-nav-divider" />

              {/* Functional Teacher Pages */}
              {SECONDARY_NAV.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sl-nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon size={17} className="sl-nav-icon" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Smart Explanation Whiteboard Button */}
            {user?.role === 'teacher' && <TeacherWhiteboard />}

            {/* Bottom Teacher Illustration Card */}
            <div className="sl-sidebar-bottom">
              <SidebarTeacherIllustration />
            </div>
          </aside>
        </div>

        {/* ── Right Content Column (Top Header Bar + Main Outlet) ── */}
        <div className="sl-content-col">
          {/* Top Header Bar */}
          <header className="sl-topbar">
            <form className="sl-topbar-search" onSubmit={handleTopSearchSubmit}>
              <Search size={16} className="sl-topbar-search-icon" />
              <input
                type="text"
                value={topSearch}
                onChange={handleTopSearchChange}
                placeholder="Search for lessons, worksheets, videos, or topics..."
                className="sl-topbar-search-input"
              />
            </form>

            <div className="sl-topbar-right">
              <NotificationBell variant="desktop" />

              <div className="sl-profile-wrap" ref={profileMenuRef}>
                <button
                  type="button"
                  className="sl-profile-btn"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                >
                  <div className="sl-profile-avatar">
                    {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initial}
                  </div>
                  <span className="sl-profile-name">{displayName}</span>
                  <ChevronDown size={15} color="#64748B" />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      className="sl-profile-menu"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div style={{ padding: '0.5rem 0.75rem 0.65rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.35rem' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>{user?.full_name || 'Teacher'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="sl-profile-menu-item"
                      >
                        <User size={15} />
                        <span>My Profile</span>
                      </Link>

                      {!user?.is_premium && (
                        <Link
                          to="/premium"
                          onClick={() => setProfileMenuOpen(false)}
                          className="sl-profile-menu-item"
                          style={{ color: '#D97706' }}
                        >
                          <Sparkles size={15} />
                          <span>Upgrade to Premium</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="sl-profile-menu-item danger"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Main Outlet */}
          <main className="sl-main">
            <Outlet />
          </main>
        </div>

        {/* ── Bottom Nav (Mobile / Tablet) ── */}
        <nav className="sl-bottom-nav">
          {MOBILE_NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sl-bottom-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
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

  // Listen for dashboard 'open-explanation-board' trigger
  useEffect(() => {
    const handleOpenBoard = () => setIsOpen(true);
    window.addEventListener('open-explanation-board', handleOpenBoard);
    return () => window.removeEventListener('open-explanation-board', handleOpenBoard);
  }, []);

  // Notify VoiceTutor to shrink when whiteboard is open
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('whiteboard-toggle', { detail: { open: isOpen } }));
  }, [isOpen]);

  const canvasRef = useRef(null);
  const laserCanvasRef = useRef(null);
  const laserSegmentsRef = useRef([]);
  const laserAnimationIdRef = useRef(null);
  
  const [color, setColor] = useState('#2563EB');
  const [wbTheme, setWbTheme] = useState('light'); // 'light', 'dark'
  const [wbGrid, setWbGrid] = useState(true); // boolean grid overlay
  const [tool, setTool] = useState('draw'); // 'draw', 'erase', 'line', 'rect', 'circle', 'triangle', 'laser'
  const [brushSize, setBrushSize] = useState(4);
  
  // Undo/Redo history
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const isDrawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const prevPosRef = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef(null);

  const [rulerState, setRulerState] = useState({ active: false, x: 180, y: 140, angle: 0, scale: 1.0 });
  const [protractorState, setProtractorState] = useState({ active: false, x: 380, y: 140, angle: 0, scale: 1.0 });

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [windowPos, setWindowPos] = useState({ x: 140, y: 60 });
  const [windowSize, setWindowSize] = useState({ width: 860, height: 560 });
  
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
        width: Math.max(620, initialW + (mX - startX)),
        height: Math.max(420, initialH + (mY - startY))
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

    const centerX = isRuler
      ? parentRect.left + rulerState.x + (160 * rulerState.scale)
      : parentRect.left + protractorState.x + (120 * protractorState.scale);
    const centerY = isRuler
      ? parentRect.top + rulerState.y + (38 * rulerState.scale)
      : parentRect.top + protractorState.y + (140 * protractorState.scale);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
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
    laserSegmentsRef.current = laserSegmentsRef.current.filter(seg => now - seg.createdAt < seg.life);

    if (laserSegmentsRef.current.length === 0) {
      laserAnimationIdRef.current = null;
      return;
    }

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

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);

      const targetW = isFullScreen ? window.innerWidth : windowSize.width;
      const targetH = isFullScreen ? (window.innerHeight - 48) : (windowSize.height - 48);
      
      canvas.width = targetW;
      canvas.height = targetH;

      const laserCanvas = laserCanvasRef.current;
      if (laserCanvas) {
        laserCanvas.width = targetW;
        laserCanvas.height = targetH;
        triggerLaserRedraw();
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.drawImage(tempCanvas, 0, 0);

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
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isOpen, isFullScreen, windowSize]);

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

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');

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
      exportCtx.fillStyle = '#09090b';
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

    exportCtx.drawImage(canvas, 0, 0);

    if (rulerState.active) {
      exportCtx.save();
      exportCtx.translate(rulerState.x + 160, rulerState.y + 38);
      exportCtx.rotate(rulerState.angle * Math.PI / 180);
      exportCtx.scale(rulerState.scale, rulerState.scale);

      exportCtx.fillStyle = isLight ? 'rgba(8, 102, 126, 0.08)' : 'rgba(34, 211, 238, 0.05)';
      exportCtx.fillRect(-160, -38, 320, 76);

      exportCtx.strokeStyle = isLight ? 'rgba(8, 102, 126, 0.6)' : 'rgba(34, 211, 238, 0.4)';
      exportCtx.lineWidth = 1;
      exportCtx.strokeRect(-160, -38, 320, 76);

      const startX = -150;
      const cmStep = 300 / 15;
      exportCtx.strokeStyle = isLight ? '#08667e' : '#22d3ee';
      exportCtx.fillStyle = isLight ? '#08667e' : '#22d3ee';
      exportCtx.font = 'bold 7px monospace';
      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'top';

      for (let i = 0; i <= 15; i++) {
        const xPos = startX + i * cmStep;
        exportCtx.beginPath();
        exportCtx.moveTo(xPos, -38);
        exportCtx.lineTo(xPos, -28);
        exportCtx.stroke();
        exportCtx.fillText(i.toString(), xPos, -24);

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

      exportCtx.fillStyle = isLight ? 'rgba(8, 102, 126, 0.9)' : 'rgba(34, 211, 238, 0.8)';
      exportCtx.fillText(`Ruler · ${Math.round(rulerState.angle)}°`, 0, -5);

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
      exportCtx.translate(protractorState.x + 120, protractorState.y + 140);
      exportCtx.rotate(protractorState.angle * Math.PI / 180);
      exportCtx.scale(protractorState.scale, protractorState.scale);

      exportCtx.fillStyle = isLight ? 'rgba(91, 33, 182, 0.08)' : 'rgba(167, 139, 250, 0.05)';
      exportCtx.beginPath();
      exportCtx.arc(0, -20, 120, Math.PI, 0);
      exportCtx.fill();

      exportCtx.beginPath();
      exportCtx.arc(0, -20, 120, Math.PI, 0);
      exportCtx.strokeStyle = isLight ? 'rgba(91, 33, 182, 0.6)' : 'rgba(167, 139, 250, 0.4)';
      exportCtx.lineWidth = 1;
      exportCtx.stroke();

      exportCtx.beginPath();
      exportCtx.arc(0, -20, 84, Math.PI, 0);
      exportCtx.strokeStyle = isLight ? 'rgba(91, 33, 182, 0.2)' : 'rgba(167, 139, 250, 0.2)';
      exportCtx.lineWidth = 0.7;
      exportCtx.stroke();

      exportCtx.beginPath();
      exportCtx.moveTo(-120, -20);
      exportCtx.lineTo(120, -20);
      exportCtx.stroke();

      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'middle';

      for (let i = 0; i <= 18; i++) {
        const degree = i * 10;
        const angleRad = (180 - degree) * (Math.PI / 180);
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        
        exportCtx.beginPath();
        exportCtx.moveTo(cos * 120, -20 - sin * 120);
        exportCtx.lineTo(cos * 105, -20 - sin * 105);
        exportCtx.strokeStyle = isLight ? 'rgba(91, 33, 182, 0.7)' : 'rgba(196, 181, 253, 0.6)';
        exportCtx.lineWidth = 1;
        exportCtx.stroke();

        if (degree % 30 === 0) {
          exportCtx.fillStyle = isLight ? '#5b21b6' : '#c4b5fd';
          exportCtx.font = 'bold 7px monospace';
          exportCtx.fillText(degree.toString(), cos * 92, -20 - sin * 92);

          exportCtx.fillStyle = isLight ? '#7c3aed' : '#a78bfa';
          exportCtx.font = 'bold 6.5px monospace';
          exportCtx.fillText((180 - degree).toString(), cos * 76, -20 - sin * 76);
        }
      }

      exportCtx.beginPath();
      exportCtx.arc(0, -20, 2, 0, Math.PI * 2);
      exportCtx.fillStyle = isLight ? '#5b21b6' : '#c4b5fd';
      exportCtx.fill();

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
        width: brushSize * 2 + 1,
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

  const COLOR_PALETTE = [
    { hex: '#0F172A', name: 'Black Ink' },
    { hex: '#2563EB', name: 'Marker Blue' },
    { hex: '#DC2626', name: 'Crimson Red' },
    { hex: '#059669', name: 'Forest Green' },
    { hex: '#D97706', name: 'Amber Orange' },
    { hex: '#7C3AED', name: 'Violet Purple' },
  ];

  const STROKE_PRESETS = [
    { size: 2, dot: 5, label: 'Fine' },
    { size: 4, dot: 8, label: 'Medium' },
    { size: 8, dot: 12, label: 'Bold' },
  ];

  return (
    <div className="px-3 mb-2">
      {/* Smart Board Toggle Button in Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-indigo-100 bg-indigo-50/70 text-indigo-700 font-bold hover:bg-indigo-100/80 hover:border-indigo-200 transition-all text-[12.5px] select-none cursor-pointer shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <PenTool size={15} className="text-indigo-600 stroke-[2.2]" />
          <span>Explanation Board</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] text-indigo-600 font-semibold">Launch</span>
        </div>
      </button>

      {/* Draggable & Resizable Whiteboard Window Popup */}
      {isOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            left: isFullScreen ? 0 : windowPos.x,
            top: isFullScreen ? 0 : windowPos.y,
            width: isFullScreen ? '100vw' : `${windowSize.width}px`,
            height: isFullScreen ? '100vh' : `${windowSize.height}px`,
            zIndex: 9999,
            background: '#FFFFFF',
            borderRadius: isFullScreen ? 0 : 18,
            border: isFullScreen ? 'none' : '1px solid #CBD5E1',
            boxShadow: isFullScreen ? 'none' : '0 24px 60px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: 'none',
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          }}
        >
          {/* ── Clean Top Header & Utility Bar ── */}
          <div
            onMouseDown={handleWindowDragStart}
            onTouchStart={handleWindowDragStart}
            style={{
              height: 48,
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 14px',
              cursor: isFullScreen ? 'default' : 'move',
              flexShrink: 0,
            }}
          >
            {/* Left: Board Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: '#EEF2FF', border: '1px solid #C7D2FE',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5'
              }}>
                <PenTool size={14} />
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                Explanation Board
              </span>
            </div>

            {/* Right: Board Utilities (Undo, Redo, Grid, Theme, Save, Clear, Expand, Close) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Undo / Redo group */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 2 }}>
                <button
                  type="button"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  title="Undo"
                  style={{
                    width: 28, height: 26, borderRadius: 6, border: 'none', background: 'transparent',
                    color: historyIndex <= 0 ? '#CBD5E1' : '#475569',
                    cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <Undo size={14} />
                </button>
                <div style={{ width: 1, height: 14, background: '#E2E8F0' }} />
                <button
                  type="button"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo"
                  style={{
                    width: 28, height: 26, borderRadius: 6, border: 'none', background: 'transparent',
                    color: historyIndex >= history.length - 1 ? '#CBD5E1' : '#475569',
                    cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <Redo size={14} />
                </button>
              </div>

              {/* Grid Toggle */}
              <button
                type="button"
                onClick={() => setWbGrid(!wbGrid)}
                title={wbGrid ? 'Hide Grid' : 'Show Grid'}
                style={{
                  height: 30, padding: '0 10px', borderRadius: 8,
                  border: wbGrid ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                  background: wbGrid ? '#EEF2FF' : '#FFFFFF',
                  color: wbGrid ? '#4F46E5' : '#475569',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <Grid size={13} />
                <span>Grid</span>
              </button>

              {/* Board Surface Toggle */}
              <button
                type="button"
                onClick={() => setWbTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                title={wbTheme === 'light' ? 'Switch to Dark Board' : 'Switch to White Board'}
                style={{
                  height: 30, padding: '0 10px', borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                {wbTheme === 'light' ? <Moon size={13} /> : <Sun size={13} color="#F59E0B" />}
                <span>{wbTheme === 'light' ? 'Dark' : 'Light'}</span>
              </button>

              {/* Save Image */}
              <button
                type="button"
                onClick={downloadBoard}
                title="Download board as PNG"
                style={{
                  height: 30, padding: '0 10px', borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <Download size={13} />
                <span>Save</span>
              </button>

              {/* Clear Canvas */}
              <button
                type="button"
                onClick={resetBoard}
                title="Clear entire board"
                style={{
                  height: 30, padding: '0 10px', borderRadius: 8,
                  border: '1px solid #FECACA',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>

              <div style={{ width: 1, height: 18, background: '#E2E8F0', margin: '0 2px' }} />

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: '1px solid #E2E8F0', background: '#FFFFFF',
                  color: '#475569', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

              {/* Close Board */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Explanation Board"
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: '1px solid #E2E8F0', background: '#FFFFFF',
                  color: '#64748B', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Canvas Area ── */}
          <div className="relative flex-1 w-full overflow-hidden touch-none">
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
                  <div className={`w-full text-center text-[10px] ${
                    isLight ? 'text-cyan-800/90' : 'text-cyan-400/80'
                  } font-mono font-bold pt-4`}>
                    Ruler · {Math.round(rulerState.angle)}° · {Math.round(rulerState.scale * 100)}%
                  </div>
                </div>

                <div
                  onMouseDown={(e) => handleDragStart(e, 'ruler')}
                  onTouchStart={(e) => handleDragStart(e, 'ruler')}
                  className={`w-full h-5 ${
                    isLight ? 'bg-cyan-100/40 backdrop-blur-sm border-t border-cyan-300' : 'bg-cyan-950/90 border-t border-cyan-500/20'
                  } flex items-center justify-between px-2 cursor-move pointer-events-auto rounded-b`}
                >
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
                <div className="relative w-full h-[120px] pointer-events-none">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 120">
                    <path
                      d="M 36 112 A 84 84 0 0 1 204 112"
                      fill="none"
                      stroke={isLight ? 'rgba(109, 40, 217, 0.2)' : 'rgba(196, 181, 253, 0.2)'}
                      strokeWidth="0.7"
                    />
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
                  <div className={`absolute bottom-2 left-0 right-0 text-center text-[10px] ${
                    isLight ? 'text-violet-800' : 'text-violet-400/80'
                  } font-mono font-bold`}>
                    Protractor · {Math.round(protractorState.angle)}° · {Math.round(protractorState.scale * 100)}%
                  </div>
                </div>

                <div
                  onMouseDown={(e) => handleDragStart(e, 'protractor')}
                  onTouchStart={(e) => handleDragStart(e, 'protractor')}
                  className={`w-full h-6 ${
                    isLight ? 'bg-violet-100/40 backdrop-blur-sm border-t border-violet-300' : 'bg-violet-950/90 border-t border-violet-500/20'
                  } flex items-center justify-between px-2 cursor-move pointer-events-auto rounded-b`}
                >
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

            {/* ── Clean Bottom Floating Toolbar Dock (Human-Centered Design) ── */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10001,
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: 16,
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.06)',
                maxWidth: 'calc(100% - 24px)',
                overflowX: 'auto',
              }}
            >
              {/* 1. Primary Drawing Tools (Pen, Laser, Eraser) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '3px', borderRadius: 11, border: '1px solid #E2E8F0' }}>
                {[
                  { id: 'draw', icon: PenTool, label: 'Pen' },
                  { id: 'laser', icon: Zap, label: 'Laser' },
                  { id: 'erase', icon: Eraser, label: 'Eraser' },
                ].map((t) => {
                  const Icon = t.icon;
                  const active = tool === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTool(t.id)}
                      title={t.label}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '6px 10px', borderRadius: 8, border: 'none',
                        background: active ? '#4F46E5' : 'transparent',
                        color: active ? '#FFFFFF' : '#475569',
                        fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.15s ease', whiteSpace: 'nowrap'
                      }}
                    >
                      <Icon size={14} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 24, background: '#E2E8F0', flexShrink: 0 }} />

              {/* 2. Shapes (Line, Box, Circle, Triangle) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {[
                  { id: 'line', icon: Minus, label: 'Line' },
                  { id: 'rect', icon: Square, label: 'Rectangle' },
                  { id: 'circle', icon: Circle, label: 'Circle' },
                  { id: 'triangle', icon: Triangle, label: 'Triangle' },
                ].map((s) => {
                  const Icon = s.icon;
                  const active = tool === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTool(s.id)}
                      title={s.label}
                      style={{
                        width: 34, height: 34, borderRadius: 9,
                        border: active ? '1.5px solid #4F46E5' : '1px solid transparent',
                        background: active ? '#EEF2FF' : 'transparent',
                        color: active ? '#4F46E5' : '#475569',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0
                      }}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 24, background: '#E2E8F0', flexShrink: 0 }} />

              {/* 3. Ink Colors */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 2px', flexShrink: 0 }}>
                {COLOR_PALETTE.map((c) => {
                  const isSelected = color.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setColor(c.hex);
                        if (tool === 'erase') setTool('draw');
                      }}
                      title={c.name}
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: isSelected ? '2px solid #FFFFFF' : '1px solid rgba(15,23,42,0.15)',
                        boxShadow: isSelected ? `0 0 0 2px ${c.hex}` : 'none',
                        transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                        cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0
                      }}
                    />
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 24, background: '#E2E8F0', flexShrink: 0 }} />

              {/* 4. Stroke Thickness Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#F8FAFC', padding: '3px', borderRadius: 10, border: '1px solid #E2E8F0', flexShrink: 0 }}>
                {STROKE_PRESETS.map((p) => {
                  const active = brushSize === p.size;
                  return (
                    <button
                      key={p.size}
                      type="button"
                      onClick={() => setBrushSize(p.size)}
                      title={`${p.label} Stroke (${p.size}px)`}
                      style={{
                        width: 28, height: 28, borderRadius: 7,
                        border: active ? '1px solid #C7D2FE' : '1px solid transparent',
                        background: active ? '#EEF2FF' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      <span
                        style={{
                          width: p.dot,
                          height: p.dot,
                          borderRadius: '50%',
                          background: active ? '#4F46E5' : '#475569',
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 24, background: '#E2E8F0', flexShrink: 0 }} />

              {/* 5. Geometry Instruments (Labeled clearly) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setRulerState(prev => ({ ...prev, active: !prev.active }))}
                  title="Show / Hide Ruler"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 10px', borderRadius: 9,
                    border: rulerState.active ? '1px solid #BAE6FD' : '1px solid #E2E8F0',
                    background: rulerState.active ? '#F0F9FF' : '#FFFFFF',
                    color: rulerState.active ? '#0284C7' : '#475569',
                    fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Ruler size={14} />
                  <span>Ruler</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProtractorState(prev => ({ ...prev, active: !prev.active }))}
                  title="Show / Hide Protractor"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 10px', borderRadius: 9,
                    border: protractorState.active ? '1px solid #DDD6FE' : '1px solid #E2E8F0',
                    background: protractorState.active ? '#F5F3FF' : '#FFFFFF',
                    color: protractorState.active ? '#6D28D9' : '#475569',
                    fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Compass size={14} />
                  <span>Protractor</span>
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
                width: '24px',
                height: '24px',
                cursor: 'se-resize',
                zIndex: 10002,
                pointerEvents: 'auto',
              }}
              className="flex items-end justify-end p-1.5"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" style={{ color: '#94A3B8', fill: 'currentColor' }}>
                <path d="M10,0 L0,10 L10,10 Z" />
              </svg>
            </div>
          )}

        </div>,
        document.body
      )}
    </div>
  );
}