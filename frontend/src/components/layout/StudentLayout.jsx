import { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, User, LogOut, Compass, HelpCircle, ChevronRight, Sparkles, Sun, Moon, PenTool, Eraser, RotateCcw, Maximize2, Minimize2, Square, Triangle, Circle, Minus, Ruler, Download } from 'lucide-react';
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
  .sl-aside {
    width: 220px; flex-shrink: 0;
    display: flex; flex-direction: column;
    background: var(--local-card-bg);
    border-right: 1px solid var(--local-card-bdr);
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
    flex: 1; overflow-y: auto; overflow-x: hidden;
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

/* ── Smart Explanation Whiteboard for Teachers ── */
function TeacherWhiteboard() {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#22d3ee');
  const [bgType, setBgType] = useState('dark'); // 'dark', 'grid', 'light'
  const [tool, setTool] = useState('draw'); // 'draw', 'erase', 'line', 'rect', 'circle', 'triangle'
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

    const handleMove = (moveEvent) => {
      const mX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const mY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const dx = mX - startX;
      const dy = mY - startY;
      
      if (isRuler) {
        setRulerState(prev => ({ ...prev, x: initialX + dx, y: initialY + dy }));
      } else {
        setProtractorState(prev => ({ ...prev, x: initialX + dx, y: initialY + dy }));
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
    const rect = widgetEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = isRuler ? (rect.top + rect.height / 2) : rect.bottom;

    const handleMove = (moveEvent) => {
      const mX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const mY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const angleRad = Math.atan2(mY - centerY, mX - centerX);
      const angleDeg = angleRad * (180 / Math.PI);
      
      if (isRuler) {
        setRulerState(prev => ({ ...prev, angle: angleDeg }));
      } else {
        setProtractorState(prev => ({ ...prev, angle: angleDeg }));
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

      // 2. Update size to fit full window viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // 3. Restore drawings and brush settings
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.drawImage(tempCanvas, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    
    // Call layout sizing immediately after render
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isOpen]);

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
    if (bgType === 'light') {
      exportCtx.fillStyle = '#ffffff';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    } else {
      exportCtx.fillStyle = '#09090b'; // zinc-950
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
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
      exportCtx.fillStyle = 'rgba(34, 211, 238, 0.05)';
      exportCtx.fillRect(-160, -38, 320, 76);

      // Draw Ruler Border
      exportCtx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
      exportCtx.lineWidth = 1;
      exportCtx.strokeRect(-160, -38, 320, 76);

      // Centimeter markings
      const startX = -150;
      const cmStep = 300 / 15;
      exportCtx.strokeStyle = '#22d3ee';
      exportCtx.fillStyle = '#22d3ee';
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
      exportCtx.fillStyle = 'rgba(34, 211, 238, 0.8)';
      exportCtx.fillText(`Ruler · ${Math.round(rulerState.angle)}°`, 0, -5);

      // Bottom bar
      exportCtx.fillStyle = '#084d62';
      exportCtx.fillRect(-160, 18, 320, 20);
      
      exportCtx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      exportCtx.beginPath();
      exportCtx.moveTo(-160, 18);
      exportCtx.lineTo(160, 18);
      exportCtx.stroke();

      exportCtx.fillStyle = '#22d3ee';
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
      exportCtx.fillStyle = 'rgba(167, 139, 250, 0.05)';
      exportCtx.beginPath();
      exportCtx.arc(0, -20, 120, Math.PI, 0);
      exportCtx.fill();

      // Semi-circle Arc
      exportCtx.beginPath();
      exportCtx.arc(0, -20, 120, Math.PI, 0);
      exportCtx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
      exportCtx.lineWidth = 1;
      exportCtx.stroke();

      // Flat Edge Line
      exportCtx.beginPath();
      exportCtx.moveTo(-120, -20);
      exportCtx.lineTo(120, -20);
      exportCtx.stroke();

      // Degrees
      exportCtx.fillStyle = '#c4b5fd';
      exportCtx.strokeStyle = 'rgba(196, 181, 253, 0.6)';
      exportCtx.font = 'bold 7px monospace';
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
        exportCtx.lineTo(cos * 110, -20 - sin * 110);
        exportCtx.stroke();

        // Label
        if (degree % 30 === 0) {
          const tx = cos * 95;
          const ty = -20 - sin * 95;
          exportCtx.fillText(degree.toString(), tx, ty);
        }
      }

      // Center Vertex
      exportCtx.beginPath();
      exportCtx.arc(0, -20, 2, 0, Math.PI * 2);
      exportCtx.fill();

      // Bottom Bar
      exportCtx.fillStyle = '#2e1065';
      exportCtx.fillRect(-120, -20, 240, 20);

      exportCtx.strokeStyle = 'rgba(196, 181, 253, 0.3)';
      exportCtx.beginPath();
      exportCtx.moveTo(-120, -20);
      exportCtx.lineTo(120, -20);
      exportCtx.stroke();

      exportCtx.fillStyle = '#c4b5fd';
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
    
    const ctx = canvas.getContext('2d');
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const handleDraw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coords = getCoordinates(e);
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
      saveState();
    }
  };

  const getBgClass = () => {
    if (bgType === 'light') return 'wb-grid-light';
    if (bgType === 'grid') return 'wb-grid-dark';
    return 'bg-zinc-950';
  };

  return (
    <div className="px-3 mb-4">
      {/* Smart Board Toggle Button in Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-zinc-900/40 text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-all text-xs font-semibold"
      >
        <div className="flex items-center gap-2">
          <PenTool size={14} className="text-cyan-400" />
          <span>Explanation Board</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] text-zinc-500">Launch</span>
        </div>
      </button>

      {/* True Full Screen Whiteboard Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-zinc-950 select-none overflow-hidden w-screen h-screen">
          
          {/* Background CSS Grid Pattern classes */}
          <div className={`absolute inset-0 w-full h-full transition-colors duration-200 ${getBgClass()}`}>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
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
              className="z-[10000] flex flex-col justify-between border border-cyan-500/40 bg-transparent rounded shadow-lg select-none pointer-events-none"
            >
              {/* Ruler Markings (centimeters / ticks) - Click Pass-Through */}
              <div className="relative w-full h-[56px] pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-2 pt-0.5 border-b border-white/10">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[7px] text-cyan-400 font-mono font-bold leading-none">{i}</span>
                      <div className="h-2 w-[1px] bg-cyan-400/40 mt-[1px]" />
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-2 pt-0.5 opacity-40">
                  {Array.from({ length: 76 }).map((_, i) => {
                    if (i % 5 === 0) return null;
                    return (
                      <div
                        key={i}
                        className="h-1 w-[0.5px] bg-cyan-300"
                        style={{ marginLeft: `${i * 4}px` }}
                      />
                    );
                  })}
                </div>

                {/* Title & Stats */}
                <div className="w-full text-center text-[10px] text-cyan-400/80 font-mono font-bold pt-4">
                  Ruler · {Math.round(rulerState.angle)}° · {Math.round(rulerState.scale * 100)}%
                </div>
              </div>

              {/* Bottom Grab/Drag Bar (Active pointer events) */}
              <div
                onMouseDown={(e) => handleDragStart(e, 'ruler')}
                onTouchStart={(e) => handleDragStart(e, 'ruler')}
                className="w-full h-5 bg-cyan-950/90 border-t border-cyan-500/20 flex items-center justify-between px-2 cursor-move pointer-events-auto rounded-b"
              >
                {/* Close Button */}
                <button
                  onClick={() => setRulerState(prev => ({ ...prev, active: false }))}
                  className="h-3.5 w-3.5 rounded-full bg-red-500/20 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white flex items-center justify-center text-[8px] font-bold cursor-pointer transition-all"
                  title="Hide ruler"
                >
                  ✕
                </button>
                
                <span className="text-[8px] text-cyan-400/70 font-mono font-bold uppercase tracking-wider">Drag to Move</span>
                
                {/* Scale buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setRulerState(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) })) }}
                    className="h-3.5 w-3.5 bg-cyan-950 border border-cyan-500 text-cyan-400 text-[8px] font-bold flex items-center justify-center rounded cursor-pointer hover:bg-cyan-900 active:scale-95 transition-all"
                    title="Make smaller"
                  >
                    -
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setRulerState(prev => ({ ...prev, scale: Math.min(2.0, prev.scale + 0.1) })) }}
                    className="h-3.5 w-3.5 bg-cyan-950 border border-cyan-500 text-cyan-400 text-[8px] font-bold flex items-center justify-center rounded cursor-pointer hover:bg-cyan-900 active:scale-95 transition-all"
                    title="Make larger"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rotate Knob (Positioned on the side) */}
              <button
                onMouseDown={(e) => handleRotateStart(e, 'ruler')}
                onTouchStart={(e) => handleRotateStart(e, 'ruler')}
                className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-400 flex items-center justify-center cursor-alias shadow-md hover:bg-cyan-900 active:scale-95 transition-all z-10 pointer-events-auto"
                title="Drag to rotate"
              >
                ↻
              </button>
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
              className="z-[10000] border-t border-x border-violet-500/40 bg-transparent rounded-t-full shadow-lg select-none pointer-events-none flex flex-col justify-end"
            >
              {/* Semi-circular markings SVG - Click Pass-Through */}
              <div className="relative w-full h-[120px] pointer-events-none">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 120">
                  {Array.from({ length: 19 }).map((_, i) => {
                    const degree = i * 10;
                    const angleRad = (180 - degree) * (Math.PI / 180);
                    const radius = 105;
                    const x = 120 + radius * Math.cos(angleRad);
                    const y = 120 - radius * Math.sin(angleRad);
                    
                    const textRadius = 88;
                    const tx = 120 + textRadius * Math.cos(angleRad);
                    const ty = 120 - textRadius * Math.sin(angleRad);
                    
                    return (
                      <g key={degree}>
                        <line
                          x1={120 + 115 * Math.cos(angleRad)}
                          y1={120 - 115 * Math.sin(angleRad)}
                          x2={x}
                          y2={y}
                          stroke="rgba(196, 181, 253, 0.6)"
                          strokeWidth="1"
                        />
                        {degree % 30 === 0 && (
                          <text
                            x={tx}
                            y={ty}
                            fill="#C4B5FD"
                            fontSize="7"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                          >
                            {degree}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  <circle cx="120" cy="120" r="3" fill="#C4B5FD" />
                  <line x1="120" y1="120" x2="120" y2="40" stroke="rgba(196, 181, 253, 0.3)" strokeDasharray="2,2" />
                </svg>

                {/* Title & Stats */}
                <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-violet-400/80 font-mono font-bold">
                  Protractor · {Math.round(protractorState.angle)}° · {Math.round(protractorState.scale * 100)}%
                </div>
              </div>

              {/* Bottom Grab/Drag Bar (Active pointer events) */}
              <div
                onMouseDown={(e) => handleDragStart(e, 'protractor')}
                onTouchStart={(e) => handleDragStart(e, 'protractor')}
                className="w-full h-6 bg-violet-950/90 border-t border-violet-500/20 flex items-center justify-between px-2 cursor-move pointer-events-auto rounded-b"
              >
                {/* Close Button */}
                <button
                  onClick={() => setProtractorState(prev => ({ ...prev, active: false }))}
                  className="h-3.5 w-3.5 rounded-full bg-red-500/20 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white flex items-center justify-center text-[8px] font-bold cursor-pointer transition-all"
                  title="Hide protractor"
                >
                  ✕
                </button>

                {/* Rotate Knob (Moved from top to here!) */}
                <button
                  onMouseDown={(e) => handleRotateStart(e, 'protractor')}
                  onTouchStart={(e) => handleRotateStart(e, 'protractor')}
                  className="h-4.5 w-4.5 rounded-lg bg-violet-900 border border-violet-500 text-violet-300 flex items-center justify-center cursor-alias hover:text-white active:scale-95 transition-all text-[10px]"
                  title="Drag to rotate"
                >
                  ↻
                </button>
                
                <span className="text-[8px] text-violet-400/70 font-mono font-bold uppercase tracking-wider">Drag to Move</span>

                {/* Scale buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setProtractorState(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) })) }}
                    className="h-3.5 w-3.5 bg-violet-950 border border-violet-500 text-violet-400 text-[8px] font-bold flex items-center justify-center rounded cursor-pointer hover:bg-violet-900 active:scale-95 transition-all"
                    title="Make smaller"
                  >
                    -
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setProtractorState(prev => ({ ...prev, scale: Math.min(2.0, prev.scale + 0.1) })) }}
                    className="h-3.5 w-3.5 bg-violet-950 border border-violet-500 text-violet-400 text-[8px] font-bold flex items-center justify-center rounded cursor-pointer hover:bg-violet-900 active:scale-95 transition-all"
                    title="Make larger"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* Floating Close / Minimize Button (Top Right) */}
          <button
            onClick={() => setIsOpen(false)}
            className="fixed top-1.5 right-6 z-[10001] flex items-center justify-center h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 transition-all shadow-lg backdrop-blur-md"
            title="Minimize Whiteboard"
          >
            <Minimize2 size={14} />
          </button>


          {/* Floating Cybernetic Dock Toolbar (Right Side Centered) */}
          <div className="fixed right-6 top-[53%] -translate-y-1/2 z-[10001] flex flex-col items-center gap-4 px-3 py-4 bg-zinc-900/80 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl w-24">
            
            {/* Draw mode icons - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-950/60 p-1 rounded-xl border border-white/5 w-full">
              {[
                { id: 'draw', icon: PenTool, label: 'Free Draw' },
                { id: 'erase', icon: Eraser, label: 'Eraser' },
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
                    className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                      tool === t.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>

            {/* Colors picker - Column Layout */}
            <div className="flex flex-col items-center gap-2 bg-zinc-950/60 p-2 rounded-xl border border-white/5 w-full">
              {['#22d3ee', '#34d399', '#f59e0b', '#f43f5e', '#ffffff'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-5 w-5 rounded-full border border-black/30 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 8px ${c}` : 'none',
                    border: color === c ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)'
                  }}
                />
              ))}
            </div>

            {/* Geometry Tools - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-950/60 p-1 rounded-xl border border-white/5 w-full">
              <button
                onClick={() => setRulerState(prev => ({ ...prev, active: !prev.active }))}
                title="Toggle Ruler"
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                  rulerState.active
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Ruler size={14} />
              </button>
              <button
                onClick={() => setProtractorState(prev => ({ ...prev, active: !prev.active }))}
                title="Toggle Protractor"
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                  protractorState.active
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Compass size={14} />
              </button>
            </div>

            {/* Size brush selector - Stacked */}
            <div className="flex flex-col items-center gap-1.5 bg-zinc-950/60 p-2 rounded-xl border border-white/5 text-[9px] w-full">
              <span className="text-zinc-500 font-bold uppercase tracking-wider">Size</span>
              <input
                type="range"
                min="1"
                max="25"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-white font-mono font-bold">{brushSize}px</span>
            </div>

            {/* Board Background select - Column layout */}
            <div className="flex flex-col gap-1 bg-zinc-950/60 p-1 rounded-xl border border-white/5 w-full">
              {[
                { id: 'dark', label: 'Dark' },
                { id: 'grid', label: 'Grid' },
                { id: 'light', label: 'Light' }
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBgType(b.id)}
                  className={`py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    bgType === b.id
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Undo / Redo / Reset */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex gap-1 w-full">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="flex-1 py-1 rounded-lg text-[10px] font-semibold bg-zinc-950/60 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors text-center"
                >
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex-1 py-1 rounded-lg text-[10px] font-semibold bg-zinc-950/60 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors text-center"
                >
                  Redo
                </button>
              </div>
              <button
                onClick={downloadBoard}
                className="w-full py-1.5 rounded-lg text-[10px] font-bold border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/25 transition-all text-center flex items-center justify-center gap-1"
                title="Download drawing as image"
              >
                <Download size={11} />
                <span>Save PNG</span>
              </button>
              <button
                onClick={resetBoard}
                className="w-full py-1.5 rounded-lg text-[10px] font-bold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all text-center"
              >
                Clear All
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}