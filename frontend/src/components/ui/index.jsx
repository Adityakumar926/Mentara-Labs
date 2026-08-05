import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Star, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

/* ─── Shared design tokens injected once ─── */
const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  :root {
    --ui-navy:     #0A0E1A;
    --ui-navy2:    #0F1629;
    --ui-violet:   #7C3AED;
    --ui-violet-l: #9D6FEF;
    --ui-cyan:     #00D4FF;
    --ui-cream:    #F5F0E8;
    --ui-lavender: #C4B5FD;
    --ui-green:    #10B981;
    --ui-amber:    #F59E0B;
    --ui-red:      #EF4444;
    --ui-muted:    rgba(245,240,232,0.45);
    --ui-card-bg:  rgba(255,255,255,0.04);
    --ui-card-bdr: rgba(255,255,255,0.08);
  }

  /* ── MODAL ── */
  .ui-modal-overlay {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center;
    padding: 0.5rem;
  }
  .ui-modal-backdrop {
    position: absolute; inset: 0;
    background: rgba(10,14,26,0.75);
    backdrop-filter: blur(12px);
  }
  .ui-modal-panel {
    position: relative; z-index: 10;
    background: rgba(15,22,41,0.95);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 28px;
    padding: 1.5rem;
    width: 100%;
    backdrop-filter: blur(24px);
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.08);
    overflow: hidden;
    max-height: 96vh;
    display: flex;
    flex-direction: column;
  }
  /* Forces modal to always be full height — use for complex forms */
  .ui-modal-tall {
    height: 96vh;
  }
  /* In tall mode: body must NOT scroll — only the inner scrollable zone does */
  .ui-modal-tall .ui-modal-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .ui-modal-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
  }
  .ui-modal-body::-webkit-scrollbar {
    width: 6px;
  }
  .ui-modal-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .ui-modal-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  .ui-modal-body::-webkit-scrollbar-thumb:hover {
    background: rgba(124, 58, 237, 0.4);
  }
  /* Subtle violet sheen at top of modal */
  .ui-modal-panel::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(0,212,255,0.4), transparent);
    pointer-events: none;
  }
  .ui-modal-sm  { max-width: 400px; }
  .ui-modal-md  { max-width: 540px; }
  .ui-modal-lg  { max-width: 720px; }
  .ui-modal-xl  { max-width: 960px; }
  .ui-modal-2xl { max-width: 1400px; }
  .ui-modal-fs  { max-width: 98vw; }
  .ui-modal-full { max-width: 100vw !important; width: 100vw !important; height: 100vh !important; max-height: 100vh !important; border-radius: 0 !important; padding: 0 !important; border: none !important; }

  .ui-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.4rem;
  }
  .ui-modal-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem; font-weight: 700; letter-spacing: -0.01em;
    background: linear-gradient(135deg, var(--ui-cream) 0%, var(--ui-lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .ui-modal-close {
    width: 32px; height: 32px; border-radius: 10px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--ui-muted);
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .ui-modal-close:hover {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.2);
    color: #FCA5A5;
  }

  /* ── BUTTON ── */
  .ui-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
    border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600;
    border-radius: 12px; transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s, background 0.18s;
    white-space: nowrap; text-decoration: none;
  }
  .ui-btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
  .ui-btn:active:not(:disabled) { transform: scale(0.97); }

  /* Sizes */
  .ui-btn-sm  { padding: 0.4rem 0.9rem;  font-size: 0.72rem; border-radius: 10px; }
  .ui-btn-md  { padding: 0.6rem 1.25rem; font-size: 0.82rem; }
  .ui-btn-lg  { padding: 0.75rem 1.6rem; font-size: 0.9rem; border-radius: 14px; }

  /* Variants */
  .ui-btn-primary {
    background: linear-gradient(135deg, var(--ui-violet), #4F46E5);
    color: #fff;
    box-shadow: 0 0 20px rgba(124,58,237,0.35);
  }
  .ui-btn-primary:hover:not(:disabled) {
    box-shadow: 0 0 32px rgba(124,58,237,0.55);
    transform: translateY(-1px);
  }
  .ui-btn-ghost {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--ui-muted);
  }
  .ui-btn-ghost:hover:not(:disabled) {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.16);
    color: var(--ui-cream);
  }
  .ui-btn-danger {
    background: linear-gradient(135deg, #EF4444, #DC2626);
    color: #fff;
    box-shadow: 0 0 16px rgba(239,68,68,0.3);
  }
  .ui-btn-danger:hover:not(:disabled) {
    box-shadow: 0 0 28px rgba(239,68,68,0.5);
    transform: translateY(-1px);
  }
  .ui-btn-outline {
    background: transparent;
    border: 1px solid rgba(124,58,237,0.35);
    color: var(--ui-lavender);
  }
  .ui-btn-outline:hover:not(:disabled) {
    background: rgba(124,58,237,0.1);
    border-color: rgba(124,58,237,0.55);
  }

  /* Spinner */
  .ui-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    animation: ui-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes ui-spin { to { transform: rotate(360deg); } }

  /* ── INPUT / TEXTAREA / SELECT ── */
  .ui-field { display: flex; flex-direction: column; gap: 0.4rem; }
  .ui-label {
    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.02em;
    color: rgba(245,240,232,0.6);
  }
  .ui-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; padding: 0.65rem 1rem;
    font-family: 'Inter', sans-serif; font-size: 0.82rem;
    color: var(--ui-cream); outline: none; width: 100%;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    -webkit-appearance: none; appearance: none;
  }
  .ui-input::placeholder { color: rgba(245,240,232,0.3); }
  .ui-input:focus {
    border-color: rgba(124,58,237,0.5);
    background: rgba(124,58,237,0.05);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }
  .ui-input.error {
    border-color: rgba(239,68,68,0.5);
    box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
  }

  /* Native <select> needs an OPAQUE background. On Windows, Chrome paints the
     dropdown popup using the <select>'s own background-color, not each
     <option>'s — so the near-transparent rgba(255,255,255,0.04) used above
     renders as system white, leaving --ui-cream text invisible until the OS
     hover/focus highlight provides contrast by accident. We override both the
     select and its options with a solid color to fix this across browsers. */
  select.ui-input {
    background-color: var(--ui-navy2);
  }
  select.ui-input option {
    background-color: var(--ui-navy2);
    color: var(--ui-cream);
  }

  .ui-error { font-size: 0.68rem; color: #FCA5A5; font-weight: 500; }

  /* ── TOGGLE ── */
  .ui-toggle-wrap { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; user-select: none; }
  .ui-toggle-track {
    position: relative; width: 38px; height: 22px; border-radius: 50px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.1);
    transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
    flex-shrink: 0;
  }
  .ui-toggle-track.on {
    background: linear-gradient(135deg, var(--ui-violet), #4F46E5);
    border-color: rgba(124,58,237,0.4);
    box-shadow: 0 0 14px rgba(124,58,237,0.4);
  }
  .ui-toggle-thumb {
    position: absolute; top: 2px; left: 2px;
    width: 16px; height: 16px; border-radius: 50%;
    background: rgba(245,240,232,0.5);
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.25s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .ui-toggle-track.on .ui-toggle-thumb { transform: translateX(16px); background: #fff; }
  .ui-toggle-label { font-size: 0.78rem; color: var(--ui-muted); }

  /* ── STAT CARD (fallback, pages override with own styles) ── */
  .ui-stat-card {
    background: var(--ui-card-bg);
    border: 1px solid var(--ui-card-bdr);
    border-radius: 20px; padding: 1.25rem;
    display: flex; align-items: flex-start; gap: 1rem;
    backdrop-filter: blur(12px);
    transition: border-color 0.3s, transform 0.2s;
  }
  .ui-stat-card:hover { transform: translateY(-2px); border-color: rgba(124,58,237,0.25); }
  .ui-stat-icon {
    width: 40px; height: 40px; border-radius: 13px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .ui-stat-val {
    font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 700;
    background: linear-gradient(135deg, var(--ui-cream), var(--ui-lavender));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .ui-stat-label { font-size: 0.7rem; color: var(--ui-muted); margin-top: 0.2rem; font-weight: 500; }

  /* ── SKELETON ── */
  .ui-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: ui-shimmer 1.6s ease infinite;
    border-radius: 10px;
  }
  @keyframes ui-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── EMPTY STATE ── */
  .ui-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 5rem 2rem; gap: 1rem; text-align: center;
  }
  .ui-empty-icon {
    width: 60px; height: 60px; border-radius: 20px;
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.18);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 0.25rem;
  }
  .ui-empty-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    background: linear-gradient(135deg, var(--ui-cream), var(--ui-lavender));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .ui-empty-desc { font-size: 0.78rem; color: var(--ui-muted); max-width: 280px; line-height: 1.6; margin-top: 0.2rem; }

  /* ── PREMIUM GATE ── */
  .ui-premium-wrap { position: relative; }
  .ui-premium-overlay {
    position: absolute; inset: 0; z-index: 2;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem;
    background: rgba(10,14,26,0.7); backdrop-filter: blur(6px);
    border-radius: inherit;
  }
  .ui-premium-icon {
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25);
    display: flex; align-items: center; justify-content: center;
  }
  .ui-premium-title { font-family:'Space Grotesk',sans-serif;font-size:0.85rem;font-weight:700;color:var(--ui-cream); }
  .ui-premium-desc { font-size:0.72rem;color:var(--ui-muted);text-align:center;max-width:180px;line-height:1.5; }

  /* ── CONFIRM DIALOG ── */
  .ui-confirm-desc { font-size: 0.82rem; color: var(--ui-muted); line-height: 1.6; margin-bottom: 1.4rem; }
  .ui-confirm-actions { display: flex; gap: 0.6rem; justify-content: flex-end; }

  /* ── LIGHT THEME ADAPTATION ── */
  html.light, .light {
    --ui-navy:     #F8FAFC;
    --ui-navy2:    #F1F5F9;
    --ui-cream:    #0F172A;
    --ui-muted:    #475569;
    --ui-card-bg:  #FFFFFF;
    --ui-card-bdr: #CBD5E1;
  }
  
  html.light .ui-modal-panel, .light .ui-modal-panel {
    background: #FFFFFF;
    border-color: #CBD5E1;
    box-shadow: 0 32px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(124,58,237,0.04);
  }
  html.light .ui-modal-title, .light .ui-modal-title {
    color: #0F172A;
    background: none;
    -webkit-text-fill-color: initial;
  }
  html.light .ui-modal-close, .light .ui-modal-close {
    background: #F1F5F9;
    border-color: #E2E8F0;
    color: #475569;
  }
  html.light .ui-modal-body::-webkit-scrollbar-thumb, .light .ui-modal-body::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
  }
  html.light .ui-label, .light .ui-label {
    color: #334155;
  }
  html.light .ui-input, .light .ui-input {
    background: #FFFFFF;
    border-color: #CBD5E1;
    color: #0F172A;
  }
  html.light .ui-input::placeholder, .light .ui-input::placeholder {
    color: #94A3B8;
  }
  html.light select.ui-input, .light select.ui-input {
    background-color: #FFFFFF;
  }
  html.light select.ui-input option, .light select.ui-input option {
    background-color: #FFFFFF;
    color: #0F172A;
  }
  html.light .ui-btn-ghost, .light .ui-btn-ghost {
    background: #F1F5F9;
    border-color: #E2E8F0;
    color: #475569;
  }
  html.light .ui-btn-ghost:hover:not(:disabled), .light .ui-btn-ghost:hover:not(:disabled) {
    background: #E2E8F0;
    border-color: #CBD5E1;
    color: #0F172A;
  }
  html.light .ui-toggle-track, .light .ui-toggle-track {
    background: #E2E8F0;
    border-color: #CBD5E1;
  }
  html.light .ui-toggle-thumb, .light .ui-toggle-thumb {
    background: #FFFFFF;
  }
  html.light .ui-toggle-track.on .ui-toggle-thumb, .light .ui-toggle-track.on .ui-toggle-thumb {
    background: #FFFFFF;
  }
  html.light .ui-skeleton, .light .ui-skeleton {
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  }
  html.light .ui-empty-title, .light .ui-empty-title {
    color: #0F172A;
    background: none;
    -webkit-text-fill-color: initial;
  }
  html.light .ui-empty-desc, .light .ui-empty-desc {
    color: #475569;
  }
  html.light .ui-premium-title, .light .ui-premium-title {
    color: #0F172A;
  }
  html.light .ui-confirm-desc, .light .ui-confirm-desc {
    color: #475569;
  }

  /* ── PAGE WRAPPER ── */
  .ui-page { min-height: 100%; }
`;

let tokensInjected = false;
function ensureTokens() {
  if (tokensInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = TOKENS;
  document.head.appendChild(el);
  tokensInjected = true;
}

/* ─────────────────────────────────────────────
   BUTTON
───────────────────────────────────────────── */
export function Button({ variant = 'primary', size = 'md', className, loading, children, ...props }) {
  ensureTokens();
  const v = { primary: 'ui-btn-primary', ghost: 'ui-btn-ghost', danger: 'ui-btn-danger', outline: 'ui-btn-outline' };
  const s = { sm: 'ui-btn-sm', md: 'ui-btn-md', lg: 'ui-btn-lg' };
  return (
    <button
      className={clsx('ui-btn', v[variant] ?? 'ui-btn-primary', s[size] ?? 'ui-btn-md', className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="ui-spinner" />}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   INPUT / TEXTAREA / SELECT
───────────────────────────────────────────── */
export function Input({ label, error, className, ...props }) {
  ensureTokens();
  return (
    <div className="ui-field">
      {label && <label className="ui-label">{label}</label>}
      <input className={clsx('ui-input', error && 'error', className)} {...props} />
      {error && <p className="ui-error">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }) {
  ensureTokens();
  return (
    <div className="ui-field">
      {label && <label className="ui-label">{label}</label>}
      <textarea rows={4} className={clsx('ui-input', error && 'error', className)} style={{ resize: 'none' }} {...props} />
      {error && <p className="ui-error">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className, children, ...props }) {
  ensureTokens();
  return (
    <div className="ui-field">
      {label && <label className="ui-label">{label}</label>}
      <select className={clsx('ui-input', error && 'error', className)} {...props}>{children}</select>
      {error && <p className="ui-error">{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARD (light wrapper, pages bring their own glass styles)
───────────────────────────────────────────── */
export function Card({ className, hover, children, ...props }) {
  return <div className={clsx('card', hover && 'card-hover cursor-pointer', className)} {...props}>{children}</div>;
}

/* ─────────────────────────────────────────────
   BADGE
───────────────────────────────────────────── */
export function Badge({ variant = 'indigo', children, className }) {
  const v = {
    premium: 'badge-premium',
    success: 'badge-success',
    danger:  'badge-danger',
    indigo:  'badge-indigo',
    muted:   'badge bg-surface-border text-text-muted',
  };
  return <span className={clsx(v[variant], className)}>{children}</span>;
}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
export function Skeleton({ className, ...props }) {
  ensureTokens();
  return <div className={clsx('ui-skeleton', className)} {...props} />;
}
export function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton style={{ height: 18, width: '50%' }} />
      <Skeleton style={{ height: 13, width: '75%' }} />
      <Skeleton style={{ height: 13, width: '35%' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, size = 'md', preventOutsideClickClose = false, tall = false, hideHeader = false }) {
  ensureTokens();
  const s = { sm: 'ui-modal-sm', md: 'ui-modal-md', lg: 'ui-modal-lg', xl: 'ui-modal-xl', '2xl': 'ui-modal-2xl', fs: 'ui-modal-fs', full: 'ui-modal-full' };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="ui-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="ui-modal-backdrop" onClick={preventOutsideClickClose ? undefined : onClose} />
          <motion.div
            className={clsx('ui-modal-panel', s[size] ?? 'ui-modal-md', tall && 'ui-modal-tall')}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {(!hideHeader && title) && (
              <div className="ui-modal-header">
                <h2 className="ui-modal-title">{title}</h2>
                <button className="ui-modal-close" onClick={onClose}><X size={15} /></button>
              </div>
            )}
            <div className="ui-modal-body" style={size === 'full' ? { padding: 0, overflow: 'hidden' } : undefined}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   PREMIUM GATE
───────────────────────────────────────────── */
export function PremiumGate({ isPremium, children }) {
  ensureTokens();
  if (isPremium) return children;
  return (
    <div className="ui-premium-wrap">
      <div style={{ pointerEvents: 'none', filter: 'blur(4px)', userSelect: 'none' }}>{children}</div>
      <div className="ui-premium-overlay">
        <div className="ui-premium-icon"><Lock size={18} style={{ color: '#FCD34D' }} /></div>
        <p className="ui-premium-title">Premium Content</p>
        <p className="ui-premium-desc">Upgrade your plan to unlock this content</p>
        <Button variant="primary" size="sm" style={{ marginTop: '0.25rem' }}>
          <Star size={11} /> Upgrade to Premium
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE WRAPPER
───────────────────────────────────────────── */
export function PageWrapper({ children, className }) {
  return (
    <motion.div
      className={clsx('ui-page', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD (fallback; DashboardPage has its own richer version)
───────────────────────────────────────────── */
export function StatCard({ icon: Icon, label, value, color = 'indigo', loading }) {
  ensureTokens();
  const iconColors = {
    indigo: { bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.22)', color: '#9D6FEF' },
    green:  { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.22)', color: '#6EE7B7' },
    amber:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.22)', color: '#FCD34D' },
    red:    { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.22)',  color: '#FCA5A5' },
  };
  const ic = iconColors[color] ?? iconColors.indigo;
  return (
    <div className="ui-stat-card">
      <div className="ui-stat-icon" style={{ background: ic.bg, border: `1px solid ${ic.border}` }}>
        {Icon && <Icon size={17} style={{ color: ic.color }} />}
      </div>
      <div>
        {loading ? (
          <>
            <Skeleton style={{ height: 24, width: 80, marginBottom: 6 }} />
            <Skeleton style={{ height: 11, width: 110 }} />
          </>
        ) : (
          <>
            <div className="ui-stat-val">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className="ui-stat-label">{label}</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  ensureTokens();
  return (
    <motion.div
      className="ui-empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {Icon && (
        <div className="ui-empty-icon">
          <Icon size={24} style={{ color: 'rgba(196,181,253,0.6)' }} />
        </div>
      )}
      <div>
        <p className="ui-empty-title">{title}</p>
        {description && <p className="ui-empty-desc">{description}</p>}
      </div>
      {action}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   TOGGLE
───────────────────────────────────────────── */
export function Toggle({ checked, onChange, label }) {
  ensureTokens();
  return (
    <label className="ui-toggle-wrap" onClick={() => onChange(!checked)}>
      <div className={clsx('ui-toggle-track', checked && 'on')}>
        <div className="ui-toggle-thumb" />
      </div>
      {label && <span className="ui-toggle-label">{label}</span>}
    </label>
  );
}

/* ─────────────────────────────────────────────
   CONFIRM DIALOG
───────────────────────────────────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, title, description, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="ui-confirm-desc">{description}</p>
      <div className="ui-confirm-actions">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}