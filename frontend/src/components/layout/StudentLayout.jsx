import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, User, LogOut, Compass, HelpCircle, ChevronRight, Sparkles } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import NotificationBell from '@/components/shared/NotificationBell';

const NAV = [
  { to: '/courses',   icon: BookOpen,   label: 'Courses'   },
  { to: '/batches',   icon: Compass,    label: 'Explore'   },
  { to: '/exams',     icon: FileText,   label: 'Exams'     },
  { to: '/questions', icon: HelpCircle, label: 'Questions' },
  { to: '/profile',   icon: User,       label: 'Profile'   },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .sl-root {
    display: flex; height: 100vh; overflow: hidden;
    background: #0A0E1A;
    font-family: 'Inter', sans-serif;
  }

  /* ── SIDEBAR (desktop) ── */
  .sl-aside {
    width: 220px; flex-shrink: 0;
    display: flex; flex-direction: column;
    background: rgba(255,255,255,0.025);
    border-right: 1px solid rgba(255,255,255,0.07);
    position: relative; overflow: hidden;
  }
  @media (max-width: 767px) { .sl-aside { display: none; } }

  .sl-aside::before {
    content: '';
    position: absolute;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%);
    top: -70px; left: -70px; pointer-events: none;
    animation: sl-blob 11s ease-in-out infinite alternate;
  }
  .sl-aside::after {
    content: '';
    position: absolute;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%);
    bottom: 80px; right: -50px; pointer-events: none;
    animation: sl-blob 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes sl-blob { from{transform:translate(0,0)} to{transform:translate(14px,-10px)} }

  /* Logo */
  .sl-logo {
    display: flex; align-items: center; justify-content: space-between; gap: 0.7rem;
    padding: 1.4rem 1.2rem 1.3rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    position: relative; z-index: 1; flex-shrink: 0;
  }
  .sl-logo-left { display: flex; align-items: center; gap: 0.7rem; min-width: 0; }
  .sl-logo-mark {
    width: 34px; height: 34px; border-radius: 11px;
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 18px rgba(124,58,237,0.45);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9rem; font-weight: 700; color: #fff;
  }
  .sl-logo-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.92rem; font-weight: 700;
    background: linear-gradient(135deg, #F5F0E8 0%, #C4B5FD 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
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
    font-size: 0.8rem; font-weight: 500;
    color: rgba(245,240,232,0.45);
    text-decoration: none;
    transition: color 0.2s, background 0.2s;
    position: relative; overflow: hidden;
    border: 1px solid transparent;
  }
  .sl-nav-item:hover {
    color: rgba(245,240,232,0.85);
    background: rgba(255,255,255,0.04);
  }
  .sl-nav-item.active {
    color: #fff;
    background: rgba(124,58,237,0.14);
    border-color: rgba(124,58,237,0.25);
  }
  .sl-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #7C3AED, #00D4FF);
    box-shadow: 0 0 8px rgba(124,58,237,0.8);
  }
  .sl-nav-icon { color: rgba(245,240,232,0.35); transition: color 0.2s; flex-shrink: 0; }
  .sl-nav-item:hover .sl-nav-icon { color: rgba(245,240,232,0.7); }
  .sl-nav-item.active .sl-nav-icon { color: #C4B5FD; }
  .sl-nav-label { flex: 1; }
  .sl-nav-chevron {
    opacity: 0; color: rgba(245,240,232,0.3);
    transition: opacity 0.2s, transform 0.2s;
  }
  .sl-nav-item:hover .sl-nav-chevron { opacity: 1; transform: translateX(2px); }

  /* Premium badge */
  .sl-premium {
    margin: 0 0.6rem 0.6rem;
    padding: 0.55rem 0.85rem; border-radius: 14px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.2);
    display: flex; align-items: center; gap: 0.5rem;
    position: relative; z-index: 1;
  }
  .sl-premium-star { font-size: 0.8rem; }
  .sl-premium-text { font-size: 0.72rem; font-weight: 700; color: #FCD34D; letter-spacing: 0.02em; }

  /* Upgrade to premium button (non-premium users) */
  .sl-upgrade {
    margin: 0 0.6rem 0.6rem;
    padding: 0.6rem 0.85rem; border-radius: 16px;
    background: linear-gradient(135deg, rgba(245,158,11,0.14), rgba(124,58,237,0.14));
    border: 1px solid rgba(245,158,11,0.28);
    display: flex; align-items: center; gap: 0.55rem;
    position: relative; z-index: 1; overflow: hidden;
    cursor: pointer; width: 90%;
    font-family: 'Inter', sans-serif;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .sl-upgrade:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(245,158,11,0.18);
    border-color: rgba(245,158,11,0.5);
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
  .sl-upgrade-title { font-size: 0.72rem; font-weight: 700; color: #FCD34D; letter-spacing: 0.01em; }
  .sl-upgrade-sub { font-size: 0.6rem; color: rgba(245,240,232,0.4); }

  /* User footer */
  .sl-footer {
    padding: 0.6rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    position: relative; z-index: 1; flex-shrink: 0;
  }
  .sl-user-row {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.6rem 0.7rem; border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    transition: background 0.2s, border-color 0.2s;
  }
  .sl-user-row:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
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
  .sl-user-name { font-size: 0.72rem; font-weight: 600; color: #F5F0E8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-user-email { font-size: 0.6rem; color: rgba(245,240,232,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sl-logout {
    width: 26px; height: 26px; border-radius: 8px;
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: rgba(245,240,232,0.3); flex-shrink: 0;
    transition: color 0.2s, background 0.2s;
  }
  .sl-logout:hover { color: #FCA5A5; background: rgba(239,68,68,0.1); }

  /* ── MAIN ── */
  .sl-main {
    flex: 1; overflow-y: auto;
    background: #0A0E1A;
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
    background: rgba(10,14,26,0.92);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255,255,255,0.07);
  }
  @media (max-width: 767px) { .sl-bottom-nav { display: flex; } }

  .sl-bottom-item {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 0.6rem 0 0.55rem;
    gap: 0.22rem;
    text-decoration: none;
    color: rgba(245,240,232,0.35);
    font-size: 0.58rem; font-weight: 600; letter-spacing: 0.04em;
    transition: color 0.2s;
    position: relative;
  }
  .sl-bottom-item:hover { color: rgba(245,240,232,0.7); }
  .sl-bottom-item.active { color: #C4B5FD; }
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
                <img src="/mentara-new.png" alt="" style={{ width: '22px', height: '22px', display: 'block' }} />
              </div>
              <span className="sl-logo-text">Mentera</span>
            </div>
            <NotificationBell variant="desktop" />
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
          <NotificationBell variant="mobile" />
        </nav>
      </div>
    </>
  );
}