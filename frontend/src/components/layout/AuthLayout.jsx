import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .auth-root {
    min-height: 100vh;
    background: #0A0E1A;
    display: flex; align-items: center; justify-content: center;
    padding: 1.5rem;
    position: relative; overflow: hidden;
    font-family: 'Inter', sans-serif;
  }

  /* Ambient blobs */
  .auth-blob {
    position: absolute; border-radius: 50%;
    filter: blur(80px); pointer-events: none;
  }
  .auth-blob-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
    top: -160px; left: -120px;
    animation: auth-drift1 13s ease-in-out infinite alternate;
  }
  .auth-blob-2 {
    width: 420px; height: 420px;
    background: radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%);
    bottom: -120px; right: -100px;
    animation: auth-drift2 16s ease-in-out infinite alternate;
  }
  .auth-blob-3 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(196,181,253,0.1) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    animation: auth-pulse 9s ease-in-out infinite;
  }
  @keyframes auth-drift1 { from{transform:translate(0,0)} to{transform:translate(40px,30px)} }
  @keyframes auth-drift2 { from{transform:translate(0,0)} to{transform:translate(-35px,-25px)} }
  @keyframes auth-pulse  { 0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.25)} }

  /* Grid texture overlay */
  .auth-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.6) 0%, transparent 100%);
  }

  /* Logo (top-center) */
  .auth-logo {
    position: absolute; top: 1.75rem; left: 50%; transform: translateX(-50%);
    display: flex; align-items: center; gap: 0.6rem; z-index: 2; white-space: nowrap;
  }
  .auth-logo-mark {
    width: 34px; height: 34px; border-radius: 11px;
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(124,58,237,0.5);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9rem; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .auth-logo-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.05rem; font-weight: 700;
    background: linear-gradient(135deg, #F5F0E8 0%, #C4B5FD 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* Card wrapper */
  .auth-card-wrap {
    position: relative; z-index: 2;
    width: 100%;
  }
`;

export default function AuthLayout() {
  return (
    <>
      <style>{CSS}</style>
      <div className="auth-root">

        {/* Background layers */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="auth-grid" />

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <img src="/mentara-new.png" alt="" style={{ width: '20px', height: '20px', display: 'block' }} />
          </div>
          <span className="auth-logo-text">Mentara Labs</span>
        </div>

        {/* Auth form slot */}
        <motion.div
          className="auth-card-wrap"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Outlet />
        </motion.div>

      </div>
    </>
  );
}