import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const Field = ({ label, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(245,240,232,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {label}
    </label>
    {children}
    {error && <span style={{ fontSize: '0.75rem', color: '#F87171' }}>{error}</span>}
  </div>
);

const inputBase = (hasError) => ({
  width: '100%',
  background: 'rgba(255,255,255,0.02)',
  border: `1px solid ${hasError ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: '12px',
  padding: '0.8rem 1.1rem',
  color: '#ffffff',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
});

const QUOTES = [
  { text: 'My Physics score went from 54% to 87% in three weeks.', author: 'Arjun M.', role: 'JEE Aspirant' },
  { text: 'Managing 4 batches used to take hours. Now it takes minutes.', author: 'Priya S.', role: 'Science Teacher' },
  { text: 'I finally understand Organic Chemistry — the animations are incredible.', author: 'Ritika J.', role: 'NEET Prep' },
];

export default function RegisterPage() {
  const { loginWithGoogle, loading } = useAuthStore();
  const navigate = useNavigate();

  const [quoteIdx, setQuoteIdx]     = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  const handleGoogleCallback = async (response) => {
    try {
      const user = await loginWithGoogle(response.credential);
      toast.success(`Account resolved! Welcome, ${user.full_name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/courses');
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
          { theme: 'outline', size: 'large', width: '380', shape: 'rectangular', text: 'signup_with' }
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

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => { setQuoteIdx((i) => (i + 1) % QUOTES.length); setQuoteVisible(true); }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const q = QUOTES[quoteIdx];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        .auth-shell { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; background: #030712; font-family: 'Inter', sans-serif; }
        .auth-panel { position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 3.5rem; overflow: hidden; background: #030712; border-right: 1px solid rgba(255, 255, 255, 0.05); }
        .auth-panel-grid { position: absolute; inset: 0; z-index: 1; background-size: 30px 30px; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px); mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%); opacity: 0.4; pointer-events: none; }
        .auth-panel::before { content: ''; position: absolute; width: 500px; height: 500px; top: -100px; left: -100px; background: radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, transparent 65%); pointer-events: none; animation: sdrift 14s ease-in-out infinite alternate; z-index: 0; }
        .auth-panel::after { content: ''; position: absolute; width: 350px; height: 350px; bottom: -60px; right: -60px; background: radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, transparent 65%); pointer-events: none; animation: sdrift 18s ease-in-out infinite alternate-reverse; z-index: 0; }
        @keyframes sdrift { from { transform: translate(0, 0); } to { transform: translate(30px, 20px); } }
        .panel-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; position: relative; z-index: 2; }
        .panel-logo-text { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: #ffffff; letter-spacing: -0.015em; }
        .panel-mid { position: relative; z-index: 2; }
        .panel-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(34, 211, 238, 0.08); border: 1px solid rgba(34, 211, 238, 0.2); border-radius: 50px; padding: 5px 14px; font-size: 0.72rem; font-weight: 600; color: #22d3ee; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.5rem; }
        .panel-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px #34d399; animation: pdot 2s ease infinite; }
        @keyframes pdot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .panel-headline { font-family: 'Outfit', sans-serif; font-size: 2.5rem; font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; color: #ffffff; margin-bottom: 1.25rem; }
        .panel-headline span { background: linear-gradient(to right, #22d3ee, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .panel-sub { color: #9ca3af; font-size: 0.95rem; line-height: 1.65; max-width: 360px; }
        .panel-stats { display: flex; gap: 2.5rem; margin-top: 3rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 2rem; }
        .ps-num { font-family: 'Outfit', sans-serif; font-size: 1.75rem; font-weight: 700; color: #ffffff; }
        .ps-label { font-size: 0.75rem; color: #6b7280; margin-top: 2px; font-weight: 500; }
        .quote-card { position: relative; z-index: 2; background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 1.75rem; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); transition: opacity 0.4s ease, transform 0.4s ease; }
        .quote-card.q-hidden { opacity: 0; transform: translateY(8px); }
        .quote-card.q-visible { opacity: 1; transform: translateY(0); }
        .quote-mark { font-size: 2.25rem; line-height: 1; color: rgba(34, 211, 238, 0.4); font-family: Georgia, serif; margin-bottom: 0.25rem; }
        .quote-text { font-size: 0.925rem; color: #e5e7eb; line-height: 1.65; font-style: italic; margin-bottom: 1.25rem; }
        .quote-author { display: flex; align-items: center; gap: 12px; }
        .quote-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #22d3ee, #34d399); display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 700; color: #09090b; flex-shrink: 0; }
        .quote-name { font-family: 'Outfit', sans-serif; font-size: 0.875rem; font-weight: 600; color: #ffffff; }
        .quote-role { font-size: 0.75rem; color: #6b7280; font-weight: 500; }
        .quote-dots { display: flex; gap: 6px; margin-top: 1.25rem; }
        .qdot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); transition: background 0.3s, transform 0.3s; }
        .qdot.active { background: #22d3ee; transform: scale(1.3); }
        .auth-form-side { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 3rem 2rem; min-height: 100vh; background: #030712; }
        .auth-form-box { width: 100%; max-width: 400px; }
        .form-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #22d3ee; margin-bottom: 0.75rem; }
        .form-title { font-family: 'Outfit', sans-serif; font-size: 2.25rem; font-weight: 950; letter-spacing: -0.03em; color: #ffffff; margin-bottom: 0.5rem; }
        .form-sub { font-size: 0.95rem; color: #6b7280; margin-bottom: 2.25rem; font-weight: 500; }
        .auth-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent); margin: 2rem 0; }
        .auth-input:focus { border-color: rgba(34, 211, 238, 0.5) !important; box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1) !important; }
        .auth-input::placeholder { color: rgba(255, 255, 255, 0.15); }
        .auth-btn { width: 100%; padding: 0.9rem 1.5rem; background: linear-gradient(135deg, #22d3ee, #34d399); border: none; border-radius: 12px; color: #09090b; font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 0 35px rgba(34, 211, 238, 0.25); transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s; letter-spacing: 0.01em; margin-top: 0.5rem; }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 45px rgba(34, 211, 238, 0.45); }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .auth-btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(9, 9, 11, 0.3); border-top-color: #09090b; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-footer-link { text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 1.5rem; font-weight: 500; }
        .auth-footer-link a { color: #22d3ee; font-weight: 600; text-decoration: none; transition: color 0.2s; }
        .auth-footer-link a:hover { color: #34d399; }
        .pw-wrap { position: relative; }
        .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(255, 255, 255, 0.3); padding: 4px; display: flex; align-items: center; transition: color 0.2s; }
        .pw-toggle:hover { color: rgba(255, 255, 255, 0.7); }
        @media (max-width: 768px) { .auth-shell { grid-template-columns: 1fr; } .auth-panel { display: none; } .auth-form-side { padding: 2rem 1.25rem; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      <div className="auth-shell">

        {/* LEFT — brand panel */}
        <aside className="auth-panel">
          <div className="auth-panel-grid" />
          <Link to="/" className="panel-logo">
            <img src="/mentara-new.png" alt="Mentara Labs Logo" className="h-8 w-8 object-contain" />
            <span className="panel-logo-text">Mentara Labs</span>
          </Link>

          <div className="panel-mid">
            <div className="panel-tag"><span className="panel-tag-dot" />Intelligent Learning</div>
            <h2 className="panel-headline">Every exam starts<br />with <span>showing up.</span></h2>
            <p className="panel-sub">Structured courses, adaptive mock exams, and a streak system built to make consistency your competitive edge.</p>
            <div className="panel-stats">
              <div><div className="ps-num">12K+</div><div className="ps-label">Active Learners</div></div>
              <div><div className="ps-num">500+</div><div className="ps-label">Questions</div></div>
              <div><div className="ps-num">98%</div><div className="ps-label">Satisfaction</div></div>
            </div>
          </div>

          <div>
            <div className={`quote-card ${quoteVisible ? 'q-visible' : 'q-hidden'}`}>
              <div className="quote-mark">"</div>
              <p className="quote-text">{q.text}</p>
              <div className="quote-author">
                <div className="quote-avatar">{q.author[0]}</div>
                <div><div className="quote-name">{q.author}</div><div className="quote-role">{q.role}</div></div>
              </div>
            </div>
            <div className="quote-dots">
              {QUOTES.map((_, i) => <div key={i} className={`qdot ${i === quoteIdx ? 'active' : ''}`} />)}
            </div>
          </div>
        </aside>

        {/* RIGHT — form */}
        <main className="auth-form-side">
          <div className="auth-form-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div className="form-eyebrow">Create Account</div>
            <h1 className="form-title">Sign up</h1>
            <p className="form-sub" style={{ marginBottom: '2.5rem' }}>Sign up using Google to start learning.</p>

            <div id="google-btn-container" style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '50px' }} />

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