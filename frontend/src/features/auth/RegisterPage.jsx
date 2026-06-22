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
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${hasError ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: '12px',
  padding: '0.75rem 1rem',
  color: '#F5F0E8',
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
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm]             = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [show, setShow]             = useState(false);
  const [errors, setErrors]         = useState({});
  const [quoteIdx, setQuoteIdx]     = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => { setQuoteIdx((i) => (i + 1) % QUOTES.length); setQuoteVisible(true); }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.full_name) e.full_name = 'Name is required';
    if (!form.email)     e.email     = 'Email is required';
    if (form.password.length < 8)           e.password = 'At least 8 characters';
    if (form.password !== form.confirm)     e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const user = await register({ full_name: form.full_name, email: form.email, password: form.password });
      toast.success(`Account created! Welcome, ${user.full_name.split(' ')[0]}!`);
      navigate('/courses');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const q = QUOTES[quoteIdx];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@300;400;500&display=swap');
        .auth-shell{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:#0A0E1A;font-family:'Inter',sans-serif}
        .auth-panel{position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:3rem;overflow:hidden;background:linear-gradient(145deg,#0D1120 0%,#110D22 100%);border-right:1px solid rgba(255,255,255,0.05)}
        .auth-panel::before{content:'';position:absolute;width:500px;height:500px;top:-100px;left:-100px;background:radial-gradient(circle,rgba(124,58,237,0.22)0%,transparent 65%);pointer-events:none;animation:sdrift 14s ease-in-out infinite alternate}
        .auth-panel::after{content:'';position:absolute;width:350px;height:350px;bottom:-60px;right:-60px;background:radial-gradient(circle,rgba(0,212,255,0.15)0%,transparent 65%);pointer-events:none;animation:sdrift 18s ease-in-out infinite alternate-reverse}
        @keyframes sdrift{from{transform:translate(0,0)}to{transform:translate(30px,20px)}}
        .panel-logo{font-family:'Space Grotesk',sans-serif;font-size:1.6rem;font-weight:700;background:linear-gradient(135deg,#00D4FF,#C4B5FD);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.02em;position:relative;z-index:2;text-decoration:none}
        .panel-mid{position:relative;z-index:2}
        .panel-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.25);border-radius:50px;padding:4px 14px;font-size:0.72rem;font-weight:600;color:#C4B5FD;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:1.5rem}
        .panel-tag-dot{width:6px;height:6px;border-radius:50%;background:#00D4FF;box-shadow:0 0 6px #00D4FF;animation:pdot 2s ease infinite}
        @keyframes pdot{0%,100%{opacity:1}50%{opacity:0.3}}
        .panel-headline{font-family:'Space Grotesk',sans-serif;font-size:2.4rem;font-weight:700;line-height:1.15;letter-spacing:-0.03em;color:#F5F0E8;margin-bottom:1rem}
        .panel-headline span{background:linear-gradient(135deg,#00D4FF 0%,#C4B5FD 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .panel-sub{color:rgba(245,240,232,0.45);font-size:0.9rem;line-height:1.65;max-width:340px}
        .panel-stats{display:flex;gap:2rem;margin-top:2.5rem}
        .ps-num{font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;color:#F5F0E8}
        .ps-label{font-size:0.72rem;color:rgba(245,240,232,0.4);margin-top:2px}
        .quote-card{position:relative;z-index:2;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:1.5rem;transition:opacity 0.4s ease,transform 0.4s ease}
        .quote-card.q-hidden{opacity:0;transform:translateY(8px)}
        .quote-card.q-visible{opacity:1;transform:translateY(0)}
        .quote-mark{font-size:2rem;line-height:1;color:rgba(124,58,237,0.5);font-family:Georgia,serif;margin-bottom:0.5rem}
        .quote-text{font-size:0.9rem;color:rgba(245,240,232,0.75);line-height:1.65;font-style:italic;margin-bottom:1rem}
        .quote-author{display:flex;align-items:center;gap:10px}
        .quote-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#00D4FF);display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:0.8rem;font-weight:700;color:#fff;flex-shrink:0}
        .quote-name{font-family:'Space Grotesk',sans-serif;font-size:0.82rem;font-weight:600;color:#F5F0E8}
        .quote-role{font-size:0.72rem;color:rgba(245,240,232,0.4)}
        .quote-dots{display:flex;gap:6px;margin-top:1rem}
        .qdot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.15);transition:background 0.3s,transform 0.3s}
        .qdot.active{background:#7C3AED;transform:scale(1.3)}
        .auth-form-side{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:3rem 2rem;min-height:100vh}
        .auth-form-box{width:100%;max-width:420px}
        .form-eyebrow{font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7C3AED;margin-bottom:0.75rem}
        .form-title{font-family:'Space Grotesk',sans-serif;font-size:1.9rem;font-weight:700;letter-spacing:-0.025em;color:#F5F0E8;margin-bottom:0.4rem}
        .form-sub{font-size:0.88rem;color:rgba(245,240,232,0.45);margin-bottom:2rem}
        .auth-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);margin:1.75rem 0}
        .auth-input:focus{border-color:rgba(124,58,237,0.7)!important;box-shadow:0 0 0 3px rgba(124,58,237,0.15)!important}
        .auth-input::placeholder{color:rgba(245,240,232,0.2)}
        .auth-btn{width:100%;padding:0.85rem 1.5rem;background:linear-gradient(135deg,#7C3AED,#4F46E5);border:none;border-radius:12px;color:#fff;font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 0 30px rgba(124,58,237,0.35);transition:transform 0.15s,box-shadow 0.15s,opacity 0.15s;letter-spacing:0.01em;margin-top:0.5rem}
        .auth-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 45px rgba(124,58,237,0.55)}
        .auth-btn:active:not(:disabled){transform:translateY(0)}
        .auth-btn:disabled{opacity:0.65;cursor:not-allowed}
        .auth-btn-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .auth-footer-link{text-align:center;font-size:0.85rem;color:rgba(245,240,232,0.4);margin-top:1.5rem}
        .auth-footer-link a{color:#9D6FEF;font-weight:600;text-decoration:none;transition:color 0.2s}
        .auth-footer-link a:hover{color:#C4B5FD}
        .pw-wrap{position:relative}
        .pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(245,240,232,0.35);padding:4px;display:flex;align-items:center;transition:color 0.2s}
        .pw-toggle:hover{color:rgba(245,240,232,0.7)}
        @media(max-width:768px){.auth-shell{grid-template-columns:1fr}.auth-panel{display:none}.auth-form-side{padding:2rem 1.25rem}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
      `}</style>

      <div className="auth-shell">

        {/* LEFT — brand panel */}
        <aside className="auth-panel">
          <Link to="/" className="panel-logo">Mentera</Link>

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
          <div className="auth-form-box">
            <div className="form-eyebrow">Create Account</div>
            <h1 className="form-title">Sign up</h1>
            <p className="form-sub">Join thousands of learners today.</p>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <Field label="Full Name" error={errors.full_name}>
                <input
                  className="auth-input"
                  style={inputBase(!!errors.full_name)}
                  type="text"
                  placeholder="Anand Kumar"
                  value={form.full_name}
                  autoComplete="name"
                  onChange={(e) => { set('full_name', e.target.value); setErrors((x) => ({ ...x, full_name: '' })); }}
                />
              </Field>

              <Field label="Email" error={errors.email}>
                <input
                  className="auth-input"
                  style={inputBase(!!errors.email)}
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  autoComplete="email"
                  onChange={(e) => { set('email', e.target.value); setErrors((x) => ({ ...x, email: '' })); }}
                />
              </Field>

              <Field label="Password" error={errors.password}>
                <div className="pw-wrap">
                  <input
                    className="auth-input"
                    style={{ ...inputBase(!!errors.password), paddingRight: '2.75rem' }}
                    type={show ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    autoComplete="new-password"
                    onChange={(e) => { set('password', e.target.value); setErrors((x) => ({ ...x, password: '' })); }}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShow(!show)} tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'}>
                    {show
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password" error={errors.confirm}>
                <input
                  className="auth-input"
                  style={inputBase(!!errors.confirm)}
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  autoComplete="new-password"
                  onChange={(e) => { set('confirm', e.target.value); setErrors((x) => ({ ...x, confirm: '' })); }}
                />
              </Field>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading
                  ? <><div className="auth-btn-spinner" />Creating account…</>
                  : <><UserPlus size={15} />Create Account</>
                }
              </button>
            </form>

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