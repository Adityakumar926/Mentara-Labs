import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .auth-root {
    height: 100vh;
    background: #020617;
    position: relative;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
    width: 100%;
  }

  /* Ambient blobs */
  .auth-blob {
    position: absolute; border-radius: 50%;
    filter: blur(90px); pointer-events: none;
  }
  .auth-blob-1 {
    width: 550px; height: 550px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(29, 78, 216, 0.05) 50%, transparent 70%);
    top: -160px; left: -120px;
    animation: auth-drift1 13s ease-in-out infinite alternate;
  }
  .auth-blob-2 {
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, rgba(2, 132, 199, 0.04) 50%, transparent 70%);
    bottom: -120px; right: -100px;
    animation: auth-drift2 16s ease-in-out infinite alternate;
  }
  .auth-blob-3 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    animation: auth-pulse 9s ease-in-out infinite;
  }
  @keyframes auth-drift1 { from{transform:translate(0,0)} to{transform:translate(40px,30px)} }
  @keyframes auth-drift2 { from{transform:translate(0,0)} to{transform:translate(-35px,-25px)} }
  @keyframes auth-pulse  { 0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.25)} }

  /* Grid texture overlay */
  .auth-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(59, 130, 246, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.035) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.8) 0%, transparent 100%);
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