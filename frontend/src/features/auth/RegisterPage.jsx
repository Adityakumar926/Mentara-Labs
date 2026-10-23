import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import Auth3DSurfer from '@/components/auth/Auth3DSurfer';
import { BookOpen, GraduationCap, Users, Star, Compass } from 'lucide-react';

export default function RegisterPage() {
  const { loginWithGoogle, loading } = useAuthStore();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);

  const handleGoogleCallback = async (response) => {
    if (!selectedRole) {
      toast.error('Please select your role (Student or Teacher) first.');
      return;
    }
    try {
      const user = await loginWithGoogle(response.credential, selectedRole, 'register');
      toast.success(`Account resolved! Welcome, ${user.full_name.split(' ')[0]}!`);
      if (['student', 'teacher'].includes(user.role) && !user.onboarded) {
        navigate('/onboarding');
      } else {
        navigate(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/courses' : '/student/dashboard');
      }
    } catch (err) {
      toast.error(err.message);
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
    if (!selectedRole) {
      toast.error('Please select your role (Student or Teacher) first to continue.');
      return;
    }
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
              return toast.error(tokenResponse.error_description || 'Google sign-up cancelled');
            }
            if (tokenResponse?.access_token) {
              try {
                const user = await loginWithGoogle({ access_token: tokenResponse.access_token }, selectedRole, 'register');
                toast.success(`Account resolved! Welcome, ${user.full_name.split(' ')[0]}!`);
                if (['student', 'teacher'].includes(user.role) && !user.onboarded) {
                  navigate('/onboarding');
                } else {
                  navigate(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/courses' : '/student/dashboard');
                }
              } catch (err) {
                toast.error(err.message || 'Google authentication failed');
              }
            }
          },
        });
        client.requestAccessToken();
      } else {
        toast.error('Google Auth SDK is loading, please try clicking again');
      }
    };

    if (window.google?.accounts?.oauth2) {
      startOAuthPopup();
    } else {
      const existingScript = document.getElementById('google-gsi-client');
      if (existingScript) {
        existingScript.onload = startOAuthPopup;
      } else {
        const script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = startOAuthPopup;
        document.body.appendChild(script);
      }
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

        /* ---------------- LEFT PANEL (Sky Blue Brand Stage) ---------------- */
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

        /* Subtle organic depth overlays on the blue */
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

        /* Left Header */
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

        .panel-tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          font-weight: 700;
          color: #034b75;
          letter-spacing: 0.04em;
          box-shadow: 0 2px 10px rgba(10, 80, 120, 0.06);
        }

        .panel-tag-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #0284c7;
          box-shadow: 0 0 8px #0284c7;
        }

        /* Dedicated 3D Stage - Zero Overlap with text or cards */
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

/* ---------------- RIGHT FORM SIDE (Light Theme) ---------------- */
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

        /* Role Cards in Light Theme */
        .role-cards-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .role-card {
          flex: 1;
          padding: 1.25rem 1rem;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          background: #ffffff;
          border: 2px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          user-select: none;
        }

        .role-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }

        .role-card.selected-student {
          border-color: #0284c7;
          background: rgba(120, 222, 251, 0.12);
          box-shadow: 0 8px 24px rgba(2, 132, 199, 0.14);
          transform: translateY(-2px);
        }

        .role-card.selected-teacher {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.08);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.14);
          transform: translateY(-2px);
        }

        .role-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          transition: all 0.2s ease;
        }

        .role-title {
          font-weight: 700;
          font-size: 0.96rem;
          color: #0f172a;
        }

        .role-desc {
          font-size: 0.74rem;
          color: #64748b;
          line-height: 1.35;
        }

        .role-badge-student {
          font-size: 0.68rem;
          font-weight: 800;
          color: #0284c7;
          background: rgba(2, 132, 199, 0.12);
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          margin-top: 4px;
        }

        .role-badge-teacher {
          font-size: 0.68rem;
          font-weight: 800;
          color: #6366f1;
          background: rgba(99, 102, 241, 0.12);
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          margin-top: 4px;
        }

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
          margin: 0;
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

        {/* LEFT — Sky Blue Brand Panel with Surfer 3D */}
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

        {/* RIGHT — Light Theme Auth Form */}
        <main className="auth-form-side">
          <div className="auth-form-box">
            {/* Mobile-only brand logo with live color effect */}
            <div className="md-hidden">
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <img src="/mentara-new.png" alt="Mentara Labs Logo" className="h-9 w-9 object-contain" />
                <span className="panel-logo-text">Mentara Labs</span>
              </Link>
            </div>

            <div className="form-eyebrow">Get Started Free</div>
            <h1 className="form-title">Create Account</h1>
            <p className="form-sub">Select your role to start your learning journey.</p>

            {/* Role selector cards */}
            <div className="role-cards-container">
              <div
                onClick={() => setSelectedRole('student')}
                className={`role-card ${selectedRole === 'student' ? 'selected-student' : ''}`}
              >
                <div 
                  className="role-icon-box"
                  style={{
                    background: selectedRole === 'student' ? 'rgba(2, 132, 199, 0.15)' : '#f1f5f9',
                    color: selectedRole === 'student' ? '#0284c7' : '#64748b'
                  }}
                >
                  <BookOpen size={22} />
                </div>
                <div className="role-title">I am a Student</div>
                <div className="role-desc">Primary tools, 3D animations & worksheets</div>
                {selectedRole === 'student' && (
                  <span className="role-badge-student">✓ Selected</span>
                )}
              </div>

              <div
                onClick={() => setSelectedRole('teacher')}
                className={`role-card ${selectedRole === 'teacher' ? 'selected-teacher' : ''}`}
              >
                <div 
                  className="role-icon-box"
                  style={{
                    background: selectedRole === 'teacher' ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
                    color: selectedRole === 'teacher' ? '#6366f1' : '#64748b'
                  }}
                >
                  <GraduationCap size={22} />
                </div>
                <div className="role-title">I am a Teacher</div>
                <div className="role-desc">Interactive tools, whiteboard & curriculum</div>
                {selectedRole === 'teacher' && (
                  <span className="role-badge-teacher">✓ Selected</span>
                )}
              </div>
            </div>

            {/* Google Signup Action: ONLY shown once role is selected */}
            {selectedRole ? (
              <div className="google-btn-wrapper" onClick={triggerGoogleLogin}>
                <div className="custom-google-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google as {selectedRole === 'student' ? 'Student' : 'Teacher'}</span>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'rgba(241, 245, 249, 0.65)',
                border: '1.5px dashed #cbd5e1',
                color: '#64748b',
                textAlign: 'center',
                fontSize: '0.86rem',
                fontWeight: 500,
                marginTop: '0.25rem'
              }}>
                Select your role above to continue
              </div>
            )}

            <div className="auth-divider" />
            <p className="auth-footer-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
