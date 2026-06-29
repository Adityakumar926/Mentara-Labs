import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .auth-root {
    height: 100vh;
    background: #030712;
    position: relative;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
    width: 100%;
  }

  /* Ambient blobs */
  .auth-blob {
    position: absolute; border-radius: 50%;
    filter: blur(80px); pointer-events: none;
  }
  .auth-blob-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, transparent 70%);
    top: -160px; left: -120px;
    animation: auth-drift1 13s ease-in-out infinite alternate;
  }
  .auth-blob-2 {
    width: 420px; height: 420px;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, transparent 70%);
    bottom: -120px; right: -100px;
    animation: auth-drift2 16s ease-in-out infinite alternate;
  }
  .auth-blob-3 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(196,181,253,0.06) 0%, transparent 70%);
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

  /* Card wrapper */
  .auth-card-wrap {
    position: relative; z-index: 2;
    width: 100%;
    height: 100vh;
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

        {/* Auth form slot */}
        <motion.div
          className="auth-card-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>

      </div>
    </>
  );
}