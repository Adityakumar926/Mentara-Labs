import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const inputBase = (hasError) => ({
  width: '100%',
  background: 'rgba(15, 23, 42, 0.65)',
  border: `1px solid ${hasError ? 'rgba(248,113,113,0.5)' : 'rgba(59, 130, 246, 0.15)'}`,
  borderRadius: '12px',
  padding: '0.8rem 1.1rem',
  color: '#ffffff',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
});

import { BookOpen, GraduationCap, Users, Star } from 'lucide-react';

const InteractiveHeadline = () => {
  const line1Words = ["Every", "exam", "starts"];
  const line2Words = [
    { text: "with", highlight: false },
    { text: "showing", highlight: true },
    { text: "up.", highlight: true }
  ];

  const renderWord = (word, isHighlight = false, wordKey = "") => (
    <span key={wordKey} className={`hl-word ${isHighlight ? "hl-word-gradient" : ""}`}>
      {word.split("").map((char, charIdx) => (
        <span
          key={charIdx}
          className={`hl-char ${isHighlight ? "hl-char-gradient" : ""}`}
        >
          {char}
        </span>
      ))}
    </span>
  );

  return (
    <h2 className="panel-headline" aria-label="Every exam starts with showing up.">
      <span className="hl-line">
        {line1Words.map((w, i) => renderWord(w, false, `l1-${i}`))}
      </span>
      <span className="hl-line">
        {line2Words.map((item, i) => renderWord(item.text, item.highlight, `l2-${i}`))}
      </span>
    </h2>
  );
};

export default function RegisterPage() {
  const { loginWithGoogle, loading } = useAuthStore();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('student');

  const handleGoogleCallback = async (response) => {
    try {
      const user = await loginWithGoogle(response.credential, selectedRole);
      toast.success(`Account resolved! Welcome, ${user.full_name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/courses' : '/student/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn-container'),
          { theme: 'filled_black', size: 'large', width: '380', shape: 'pill', text: 'signup_with' }
        );
      }
    };

    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        .auth-shell {
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #020617;
          font-family: 'Inter', sans-serif;
        }
        .auth-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3.5rem;
          height: 100vh;
          box-sizing: border-box;
          overflow: hidden;
          background-color: #020617;
          background-image: 
            linear-gradient(135deg, rgba(2, 6, 23, 0.72) 0%, rgba(2, 6, 23, 0.58) 50%, rgba(2, 6, 23, 0.8) 100%),
            url('/cambridge-bg.webp');
          background-size: cover;
          background-position: center right;
          background-repeat: no-repeat;
          border-right: 1px solid rgba(59, 130, 246, 0.15);
        }
        .auth-panel-grid {
          position: absolute;
          inset: 0;
          z-index: 1;
          background-size: 32px 32px;
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          opacity: 0.4;
          pointer-events: none;
        }
        @keyframes sdrift {
          from { transform: translate(0, 0); }
          to { transform: translate(30px, 20px); }
        }
        .panel-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          position: relative;
          z-index: 2;
        }
        .panel-logo-text {
          font-family: 'Outfit', sans-serif;
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #60a5fa, #38bdf8, #818cf8, #60a5fa);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rgb-glow 4s linear infinite;
        }
        .panel-mid {
          position: relative;
          z-index: 2;
        }
        .panel-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(37, 99, 235, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.28);
          border-radius: 50px;
          padding: 5px 14px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #60a5fa;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .panel-tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 8px #38bdf8;
          animation: pdot 2s ease infinite;
        }
        @keyframes pdot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes textGlowShimmer {
          0% {
            background-position: 0% 50%;
            filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.3));
          }
          50% {
            background-position: 100% 50%;
            filter: drop-shadow(0 0 22px rgba(56, 189, 248, 0.65));
          }
          100% {
            background-position: 0% 50%;
            filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.3));
          }
        }
        .panel-headline {
          font-family: 'Outfit', sans-serif;
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin-bottom: 1.25rem;
          user-select: none;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        .hl-line {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.32em;
        }
        .hl-word {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }
        .hl-char {
          display: inline-block;
          cursor: pointer;
          transform: translate3d(0, 0, 0);
          transition: transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.4), color 0.2s ease, text-shadow 0.2s ease;
          will-change: transform;
          -webkit-font-smoothing: antialiased;
          backface-visibility: hidden;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }
        .hl-char:hover {
          transform: translate3d(0, -8px, 0);
          color: #60a5fa;
          text-shadow: 0 4px 16px rgba(56, 189, 248, 0.6), 0 1px 0 #1e3a8a, 0 2px 0 #1d4ed8;
          z-index: 5;
          position: relative;
        }
        .hl-char-gradient {
          background: linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #93c5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.4), filter 0.2s ease;
        }
        .hl-char-gradient:hover {
          transform: translate3d(0, -10px, 0);
          filter: drop-shadow(0 4px 16px rgba(56, 189, 248, 0.9));
          z-index: 5;
          position: relative;
        }
        .panel-sub {
          color: #94a3b8;
          font-size: 0.95rem;
          line-height: 1.65;
          max-width: 360px;
        }
        .panel-stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 2.75rem;
          border-top: 1px solid rgba(59, 130, 246, 0.12);
          padding-top: 2rem;
        }
        .ps-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ps-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ps-icon-cyan {
          background: rgba(14, 165, 233, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 0 18px rgba(56, 189, 248, 0.12);
          color: #38bdf8;
        }
        .ps-icon-purple {
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(129, 140, 248, 0.25);
          box-shadow: 0 0 18px rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
        }
        .ps-num {
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }
        .ps-label {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-top: 2px;
          font-weight: 500;
          white-space: nowrap;
        }
        .auth-form-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem 2rem;
          height: 100vh;
          box-sizing: border-box;
          overflow-y: auto;
          background: radial-gradient(circle at 88% 85%, rgba(30, 58, 138, 0.14) 0%, transparent 60%), #020617;
        }
        .auth-form-box {
          width: 100%;
          max-width: 400px;
        }
        .form-eyebrow {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #38bdf8;
          margin-bottom: 0.75rem;
        }
        .form-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.25rem;
          font-weight: 950;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }
        .form-sub {
          font-size: 0.95rem;
          color: #94a3b8;
          margin-bottom: 2.25rem;
          font-weight: 500;
        }
        .auth-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.15), transparent);
          margin: 2rem 0;
        }
        .auth-input:focus {
          border-color: rgba(56, 189, 248, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18), 0 0 20px rgba(59, 130, 246, 0.12) !important;
        }
        .auth-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .auth-footer-link {
          text-align: center;
          font-size: 0.875rem;
          color: #94a3b8;
          margin-top: 1.5rem;
          font-weight: 500;
        }
        .auth-footer-link a {
          color: #38bdf8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .auth-footer-link a:hover {
          color: #60a5fa;
        }
        .md-hidden { display: none; align-items: center; gap: 10px; margin-bottom: 1.5rem; }
        /* ── RGB rotating border on Google button ── */
        @property --rgb-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes rgb-spin {
          to { --rgb-angle: 360deg; }
        }
        .google-btn-wrapper {
          position: relative;
          padding: 2px;
          border-radius: 50px;
          background: conic-gradient(
            from var(--rgb-angle),
            #22d3ee, #a855f7, #f43f5e, #fbbf24, #34d399, #22d3ee
          );
          animation: rgb-spin 3s linear infinite;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 382px;
          max-width: 100%;
          height: 48px;
          margin: 1.25rem auto 0 auto;
          box-sizing: border-box;
          overflow: hidden;
          cursor: pointer;
        }
        .google-btn-wrapper::before {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 54px;
          background: conic-gradient(
            from var(--rgb-angle),
            rgba(34,211,238,0.3), rgba(168,85,247,0.3), rgba(244,63,94,0.3),
            rgba(251,191,36,0.3), rgba(52,211,153,0.3), rgba(34,211,238,0.3)
          );
          filter: blur(10px);
          z-index: -1;
          animation: rgb-spin 3s linear infinite;
        }
        .custom-google-btn {
          width: 100%;
          height: 100%;
          background: #09090b;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          pointer-events: none;
          box-sizing: border-box;
        }
        .real-google-btn-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.01;
          z-index: 10;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .real-google-btn-overlay > div {
          width: 100% !important;
          height: 100% !important;
        }

        @media (max-width: 768px) {
          .auth-shell { grid-template-columns: 1fr; }
          .auth-panel { display: none; }
          .auth-form-side { padding: 2rem 1.25rem; }
          .md-hidden { display: flex; }
        }
        @media (max-width: 440px) {
          .google-btn-wrapper {
            transform: scale(0.88);
            margin-top: 0.75rem;
          }
        }
      `}</style>

      <div className="auth-shell">

        {/* LEFT — brand panel */}
        <aside className="auth-panel">
          <div className="auth-panel-grid" />
          <Link to="/" className="panel-logo" style={{ gap: '12px' }}>
            <img src="/mentara-new.png" alt="Mentara Labs Logo" className="h-11 w-11 object-contain" />
            <span className="panel-logo-text">Mentara Labs</span>
          </Link>

          <div className="panel-mid">
            <div className="panel-tag"><span className="panel-tag-dot" />Intelligent Learning</div>
            <InteractiveHeadline />
            <p className="panel-sub">Structured courses, adaptive mock exams, and a streak system built to make consistency your competitive edge.</p>
            <div className="panel-stats">
              <div className="ps-item">
                <div className="ps-icon-box ps-icon-cyan">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="ps-num">100+</div>
                  <div className="ps-label">Active Learners</div>
                </div>
              </div>

              <div className="ps-item">
                <div className="ps-icon-box ps-icon-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    <circle cx="9" cy="12" r="1" fill="currentColor" />
                    <circle cx="15" cy="12" r="1" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <div className="ps-num">1K+</div>
                  <div className="ps-label">Questions</div>
                </div>
              </div>

              <div className="ps-item">
                <div className="ps-icon-box ps-icon-cyan">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="ps-num">98%</div>
                  <div className="ps-label">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'Space Grotesk, monospace', color: '#6b7280', letterSpacing: '0.04em' }}>
              © 2026 Mentara Labs · Cambridge Primary Practice
            </span>
          </div>
        </aside>

        {/* RIGHT — form */}
        <main className="auth-form-side">
          <div className="auth-form-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            {/* Mobile-only logo */}
            <div className="md-hidden" style={{ alignSelf: 'center', gap: '12px' }}>
              <img src="/mentara-new.png" alt="Mentara Labs Logo" className="h-10 w-10 object-contain" />
              <span className="panel-logo-text" style={{ fontFamily: 'Outfit, sans-serif' }}>Mentara Labs</span>
            </div>

            <div className="form-eyebrow">Create Account</div>
            <h1 className="form-title">Sign up</h1>
            <p className="form-sub" style={{ marginBottom: '1.5rem' }}>Select your role to register your account.</p>

            {/* Role selector */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div
                onClick={() => setSelectedRole('student')}
                style={{
                  flex: 1,
                  padding: '1.25rem 1rem',
                  borderRadius: '16px',
                  border: `2px solid ${selectedRole === 'student' ? 'rgba(56,189,248,0.7)' : 'rgba(59,130,246,0.12)'}`,
                  background: selectedRole === 'student' ? 'rgba(14,165,233,0.1)' : 'rgba(15,23,42,0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedRole === 'student' ? '0 0 24px rgba(14,165,233,0.2)' : 'none'
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: selectedRole === 'student' ? 'rgba(14,165,233,0.18)' : 'rgba(59,130,246,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${selectedRole === 'student' ? 'rgba(56,189,248,0.35)' : 'transparent'}`
                }}>
                  <BookOpen size={20} style={{ color: selectedRole === 'student' ? '#38bdf8' : 'rgba(255,255,255,0.5)' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>I am a Student</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.25 }}>Access simple primary tools, animations & worksheets</div>
              </div>

              <div
                onClick={() => setSelectedRole('teacher')}
                style={{
                  flex: 1,
                  padding: '1.25rem 1rem',
                  borderRadius: '16px',
                  border: `2px solid ${selectedRole === 'teacher' ? 'rgba(129,140,248,0.7)' : 'rgba(59,130,246,0.12)'}`,
                  background: selectedRole === 'teacher' ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedRole === 'teacher' ? '0 0 24px rgba(99,102,241,0.2)' : 'none'
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: selectedRole === 'teacher' ? 'rgba(99,102,241,0.18)' : 'rgba(59,130,246,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${selectedRole === 'teacher' ? 'rgba(129,140,248,0.35)' : 'transparent'}`
                }}>
                  <GraduationCap size={20} style={{ color: selectedRole === 'teacher' ? '#a5b4fc' : 'rgba(255,255,255,0.5)' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>I am a Teacher</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.25 }}>Teach with interactive controls, whiteboard & calculators</div>
              </div>
            </div>

            <div className="google-btn-wrapper">
              <div className="custom-google-btn">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign up with Google</span>
              </div>
              <div className="real-google-btn-overlay">
                <div id="google-btn-container" style={{ width: '100%', height: '100%' }} />
              </div>
            </div>

            <div className="auth-divider" style={{ margin: '2rem 0' }} />
            <p className="auth-footer-link" style={{ marginTop: 0 }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}