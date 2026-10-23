import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Star, BookOpen } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import Auth3DSurfer from '@/components/auth/Auth3DSurfer';

const Field = ({ label, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, sans-serif' }}>
      {label}
    </label>
    {children}
    {error && <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 500 }}>{error}</span>}
  </div>
);

const inputBase = (hasError) => ({
  width: '100%',
  background: '#ffffff',
  border: `1.5px solid ${hasError ? '#EF4444' : '#E2E8F0'}`,
  borderRadius: '12px',
  padding: '0.82rem 1.1rem',
  color: '#0F172A',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
});


export default function LoginPage() {
  const { login, loginWithGoogle, loading } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [show, setShow]       = useState(false);
  const [errors, setErrors]   = useState({});
  const [savedAccount, setSavedAccount] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mentara_saved_account");
      if (raw) {
        setSavedAccount(JSON.parse(raw));
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const saveAccountToCache = (userObj) => {
    try {
      if (userObj && (userObj.email || userObj.full_name)) {
        localStorage.setItem("mentara_saved_account", JSON.stringify({
          email: userObj.email,
          name: userObj.full_name,
          role: userObj.role
        }));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleGoogleCallback = async (response) => {
    try {
      const user = await loginWithGoogle(response.credential, null, 'login');
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      if (['student', 'teacher'].includes(user.role) && !user.onboarded) {
        navigate('/onboarding');
      } else {
        navigate(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/courses' : '/student/dashboard');
      }
    } catch (err) {
      if (err.code === 'USER_NOT_FOUND' || err.message?.toLowerCase().includes('no account found')) {
        toast.error('No account found for this Google email. Redirecting to register...');
        setTimeout(() => navigate('/register'), 1000);
      } else {
        toast.error(err.message);
      }
    }
  };

  useEffect(() => {
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const triggerGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Client ID is missing');
      return;
    }

    const startOAuthPopup = () => {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              return toast.error(tokenResponse.error_description || 'Google login cancelled');
            }
            if (tokenResponse?.access_token) {
              try {
                const user = await loginWithGoogle({ access_token: tokenResponse.access_token }, null, 'login');
                toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
                if (['student', 'teacher'].includes(user.role) && !user.onboarded) {
                  navigate('/onboarding');
                } else {
                  navigate(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/courses' : '/student/dashboard');
                }
              } catch (err) {
                if (err.code === 'USER_NOT_FOUND' || err.message?.toLowerCase().includes('no account found')) {
                  toast.error('No account found for this Google email. Redirecting to register...');
                  setTimeout(() => navigate('/register'), 1000);
                } else {
                  toast.error(err.message || 'Google login failed');
                }
              }
            }
          }
        });
        client.requestAccessToken();
      } else {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/login')}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;
        const width = 500, height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(authUrl, 'GoogleSignIn', `width=${width},height=${height},left=${left},top=${top}`);
      }
    };

    startOAuthPopup();
  };

  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const access_token = params.get('access_token');
      if (access_token) {
        window.history.replaceState(null, '', window.location.pathname);
        loginWithGoogle({ access_token }, null, 'login')
          .then((user) => {
            toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
            if (['student', 'teacher'].includes(user.role) && !user.onboarded) {
              navigate('/onboarding');
            } else {
              navigate(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/courses' : '/student/dashboard');
            }
          })
          .catch((err) => {
            if (err.code === 'USER_NOT_FOUND' || err.message?.toLowerCase().includes('no account found')) {
              toast.error('No account found for this Google email. Redirecting to register...');
              setTimeout(() => navigate('/register'), 1000);
            } else {
              toast.error(err.message || 'Google login failed');
            }
          });
      }
    }
  }, [loginWithGoogle, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      const user = await login(form.email, form.password);
      saveAccountToCache(user);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/courses' : '/student/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <style>{`
        /* Master Layout */
        .auth-shell {
          min-height: 100vh;
          width: 100vw;
          display: grid;
          grid-template-columns: 1.08fr 1fr;
          background: #FAF9F6;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          overflow-x: hidden;
          color: #0f172a;
        }

        /* ---------------- LEFT PANEL (Matching RegisterPage) ---------------- */
        .auth-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.75rem 3.25rem;
          min-height: 100vh;
          box-sizing: border-box;
          overflow: hidden;
          background: linear-gradient(135deg, #edf6fd 0%, #cce7f9 32%, #b5ddf7 68%, #9dd4f4 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.55);
        }

        .auth-panel-sunbeam {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 15% 15%, rgba(255, 255, 255, 0.75) 0%, transparent 60%);
          pointer-events: none;
          z-index: 1;
        }

        .auth-panel-mesh {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 10% 90%, rgba(255,255,255,0.3) 0%, transparent 40%),
            linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
          background-size: 100% 100%, 36px 36px, 36px 36px;
          opacity: 0.6;
          pointer-events: none;
          z-index: 1;
        }

        .panel-header {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panel-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        @keyframes logo-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .panel-logo-text {
          font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
          font-size: 1.55rem;
          font-weight: 850;
          letter-spacing: -0.02em;
          background: linear-gradient(
            120deg,
            #4f46e5 0%,
            #7c3aed 22%,
            #0284c7 48%,
            #06b6d4 72%,
            #6366f1 100%
          );
          background-size: 250% 250%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: logo-gradient-shift 4.5s ease-in-out infinite;
          display: inline-block;
          filter: drop-shadow(0 2px 8px rgba(79, 70, 229, 0.15));
        }

        .panel-3d-stage {
          position: relative;
          z-index: 5;
          flex: 1;
          min-height: 400px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
        }

        /* ── BOTTOM STATS ROW & COPYRIGHT (MATCHING SCREENSHOT) ── */
        .panel-footer-content {
          position: relative;
          z-index: 10;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          padding-top: 0.5rem;
        }

        .panel-stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .ps-card {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ps-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #034b75;
          box-shadow: 0 4px 12px rgba(4, 47, 74, 0.04);
          flex-shrink: 0;
        }

        .ps-num {
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 850;
          color: #05263f;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .ps-label {
          font-size: 0.75rem;
          color: #0c3e60;
          font-weight: 600;
          white-space: nowrap;
        }

        .panel-copyright {
          font-size: 0.78rem;
          font-family: 'Inter', sans-serif;
          color: #1a567c;
          letter-spacing: 0.01em;
          font-weight: 500;
        }

        /* ---------------- RIGHT FORM SIDE (Clean Light Theme) ---------------- */
        .auth-form-side {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          background: #FAF9F6;
          overflow-y: auto;
        }

        .auth-form-side::before {
          content: '';
          position: absolute;
          top: -10%;
          right: -10%;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(120, 222, 251, 0.18) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .auth-form-side::after {
          content: '';
          position: absolute;
          bottom: -10%;
          left: -10%;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .auth-form-box {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
        }

        .form-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #0284c7;
          margin-bottom: 0.35rem;
        }

        .form-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.15rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
          margin: 0 0 0.4rem 0;
        }

        .form-sub {
          font-size: 0.92rem;
          color: #64748b;
          margin: 0 0 1.75rem 0;
          line-height: 1.45;
        }

        .auth-input:focus {
          border-color: #0284c7 !important;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12) !important;
        }

        .auth-input::placeholder {
          color: #94a3b8 !important;
        }

        .auth-btn {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 0.85rem 1.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-sizing: border-box;
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
        }

        .auth-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
        }

        .auth-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .auth-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── RGB rotating border lighting effect on Google button ── */
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
          padding: 2.2px;
          border-radius: 999px;
          background: conic-gradient(
            from var(--rgb-angle),
            #22d3ee, #818cf8, #c084fc, #f43f5e, #fbbf24, #34d399, #22d3ee
          );
          animation: rgb-spin 3s linear infinite;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 48px;
          margin: 1.25rem auto 0 auto;
          box-sizing: border-box;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .google-btn-wrapper:hover {
          transform: translateY(-1px);
        }
        .google-btn-wrapper::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 999px;
          background: conic-gradient(
            from var(--rgb-angle),
            rgba(34,211,238,0.5), rgba(129,140,248,0.5), rgba(192,132,252,0.5),
            rgba(244,63,94,0.45), rgba(251,191,36,0.45), rgba(52,211,153,0.45), rgba(34,211,238,0.5)
          );
          filter: blur(10px);
          z-index: 0;
          animation: rgb-spin 3s linear infinite;
          pointer-events: none;
        }
        .custom-google-btn {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #0f172a;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          pointer-events: none;
          box-sizing: border-box;
        }

        .auth-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 1.75rem 0;
        }

        .auth-footer-link {
          text-align: center;
          font-size: 0.88rem;
          color: #64748b;
          margin-top: 1.25rem;
          font-weight: 500;
        }

        .auth-footer-link a {
          color: #0284c7;
          font-weight: 650;
          text-decoration: none;
          transition: color 0.15s;
        }

        .auth-footer-link a:hover {
          color: #0369a1;
          text-decoration: underline;
        }

        .pw-wrap {
          position: relative;
          width: 100%;
        }

        .pw-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color 0.15s;
        }

        .pw-toggle:hover {
          color: #475569;
        }

        .md-hidden {
          display: none;
        }

        @media (max-width: 960px) {
          .auth-shell {
            grid-template-columns: 1fr;
          }
          .auth-panel {
            display: none;
          }
          .auth-form-side {
            padding: 2.5rem 1.5rem;
          }
          .md-hidden {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2rem;
          }
        }
      `}</style>

      <div className="auth-shell">

        {/* LEFT — brand panel with Pure Sky Blue background & Dedicated 3D Stage */}
        <aside className="auth-panel">
          <div className="auth-panel-sunbeam" />
          <div className="auth-panel-mesh" />
          <div className="panel-header">
            <Link to="/" className="panel-logo">
              <img src="/mentara-new.png" alt="Mentara Learning Logo" className="h-10 w-10 object-contain" />
              <span className="panel-logo-text">Mentara Learning</span>
            </Link>
          </div>

          <div className="panel-3d-stage">
            <Auth3DSurfer />
          </div>

          <div className="panel-footer-content">
            <div className="panel-stats-row">
              <div className="ps-card">
                <div className="ps-icon">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="ps-num">100+</div>
                  <div className="ps-label">Active Learners</div>
                </div>
              </div>

              <div className="ps-card">
                <div className="ps-icon">
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

              <div className="ps-card">
                <div className="ps-icon">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="ps-num">98%</div>
                  <div className="ps-label">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="panel-copyright">
              © 2026 Mentara Learning · Cambridge Primary Practice
            </div>
          </div>

        </aside>

        {/* RIGHT — Form in Clean Light Theme */}
        <main className="auth-form-side">
          <div className="auth-form-box">
            {/* Mobile-only logo */}
            <div className="md-hidden" style={{ gap: '12px' }}>
              <img src="/mentara-new.png" alt="Mentara Learning Logo" className="h-10 w-10 object-contain" />
              <span className="panel-logo-text">Mentara Learning</span>
            </div>

            <div className="form-eyebrow">Welcome back</div>
            <h1 className="form-title">Sign in</h1>
            <p className="form-sub">Enter your credentials to continue learning.</p>

            {savedAccount && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '0.85rem 1.1rem',
                borderRadius: '16px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}>
                    {savedAccount.name ? savedAccount.name[0].toUpperCase() : (savedAccount.email ? savedAccount.email[0].toUpperCase() : 'U')}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 700 }}>Saved Account</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{savedAccount.name || savedAccount.email}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{savedAccount.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, email: savedAccount.email }))}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '50px',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      color: '#0284c7',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Continue →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('mentara_saved_account');
                      setSavedAccount(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '6px',
                      transition: 'color 0.2s'
                    }}
                    title="Dismiss saved account"
                    aria-label="Dismiss saved account"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <Field label="Email" error={errors.email}>
                <input
                  className="auth-input"
                  style={inputBase(!!errors.email)}
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  autoComplete="email"
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((x) => ({ ...x, email: '' })); }}
                />
              </Field>

              <Field label="Password" error={errors.password}>
                <div className="pw-wrap">
                  <input
                    className="auth-input"
                    style={{ ...inputBase(!!errors.password), paddingRight: '2.75rem' }}
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    autoComplete="current-password"
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors((x) => ({ ...x, password: '' })); }}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShow(!show)} tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'}>
                    {show
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </Field>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading
                  ? <><div className="auth-btn-spinner" />Signing in…</>
                  : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>Sign in</>
                }
              </button>
            </form>

            <div className="google-btn-wrapper" onClick={triggerGoogleLogin}>
              <div className="custom-google-btn">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </div>
            </div>

            <div className="auth-divider" />
            <p className="auth-footer-link">
              Don't have an account? <Link to="/register">Create one free</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
