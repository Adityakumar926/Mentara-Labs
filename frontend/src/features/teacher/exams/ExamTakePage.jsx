import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, Maximize2, Minimize2, Paintbrush, Slash, Eraser, Undo2, Redo2, RefreshCw, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Modal } from '@/components/ui';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import VoiceTutor from '@/components/shared/VoiceTutor';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

  .take-root {
    --navy:     var(--local-navy, #0A0E1A);
    --navy2:    var(--local-navy2, #0F1629);
    --violet:   #7C3AED;
    --violet-l: var(--local-violet-l, #9D6FEF);
    --cyan:     var(--local-cyan, #00D4FF);
    --cream:    var(--local-cream, #F5F0E8);
    --lavender: var(--local-lavender, #C4B5FD);
    --green:    var(--local-green, #10B981);
    --red:      var(--local-red, #EF4444);
    --amber:    var(--local-amber, #F59E0B);
    --card-bg:  var(--local-card-bg, rgba(255,255,255,0.04));
    --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.08));
    --muted:    var(--local-muted, rgba(245,240,232,0.45));
    font-family: 'Inter', sans-serif;
    color: var(--cream);
    min-height: 100vh;
    background: var(--navy2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .take-root *, .take-root *::before, .take-root *::after { box-sizing: border-box; }

  /* ── TOP BAR ── */
  .take-topbar {
    position: sticky; top: 0; z-index: 30;
    padding: 0.9rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    background: var(--navy);
    border-bottom: 2px solid var(--card-bdr);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  /* ── PROGRESS BAR ── */
  .take-progress-track {
    height: 5px;
    background: var(--card-bdr);
    border-radius: 99px;
    overflow: hidden;
    width: 120px;
  }
  .take-progress-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--violet), var(--cyan));
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  .take-progress-label {
    font-size: 0.75rem; font-weight: 600;
    color: var(--muted);
    white-space: nowrap;
    font-family: 'Space Grotesk', sans-serif;
  }

  /* ── TIMER ── */
  .take-timer {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.45rem 1rem;
    border-radius: 12px;
    border: 2px solid var(--card-bdr);
    background: var(--card-bg);
    font-family: 'JetBrains Mono', 'Space Grotesk', monospace;
    font-size: 0.92rem; font-weight: 700;
    transition: all 0.3s;
  }
  .take-timer.urgent {
    border-color: rgba(239,68,68,0.4);
    background: rgba(239,68,68,0.08);
    color: var(--red);
    box-shadow: 0 0 20px rgba(239,68,68,0.15);
    animation: timer-pulse 1s ease-in-out infinite;
  }
  @keyframes timer-pulse { 0%,100%{opacity:1} 50%{opacity:0.75} }

  /* ── SUBMIT BUTTON ── */
  .take-submit-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    color: #fff;
    border: none; border-radius: 12px;
    padding: 0.5rem 1.2rem;
    font-size: 0.82rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    box-shadow: 0 0 24px rgba(124,58,237,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.02em;
  }
  .take-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 0 36px rgba(124,58,237,0.6); }
  .take-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── BODY ── */
  .take-body { display: flex; flex: 1; overflow: hidden; }
  .take-main { flex: 1; overflow-y: auto; padding: 1.75rem 1.5rem; scroll-behavior: smooth; }

  /* ── QUESTION CARD ── */
  .take-qcard {
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    border-radius: 24px;
    padding: 1.75rem 2rem;
    margin-bottom: 1.25rem;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(16px);
  }
  .take-qcard::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 50%);
    pointer-events: none;
  }
  .take-qnum {
    font-family: 'Space Grotesk', monospace;
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--violet-l);
    text-transform: uppercase;
    margin-bottom: 0.9rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .take-marks-pill {
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    padding: 0.18rem 0.6rem;
    border-radius: 99px;
    font-size: 0.68rem; font-weight: 700;
    color: var(--violet-l);
    font-family: 'Space Grotesk', sans-serif;
  }
  .take-qtext {
    font-size: 1rem; font-weight: 700;
    line-height: 1.7;
    color: var(--color-text-primary);
  }

  /* ── MCQ OPTIONS ── */
  .take-option {
    width: 100%;
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 18px;
    border: 2px solid var(--card-bdr);
    background: var(--card-bg);
    cursor: pointer;
    text-align: left;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .take-option::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(124,58,237,0) 0%, rgba(124,58,237,0.06) 100%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .take-option:hover { border-color: var(--violet); transform: translateX(3px); }
  .take-option:hover::before { opacity: 1; }
  .take-option.selected {
    border-color: var(--violet);
    background: rgba(124,58,237,0.08);
    box-shadow: 0 0 0 1px rgba(124,58,237,0.3), 0 4px 24px rgba(124,58,237,0.12);
    transform: translateX(3px);
    color: var(--color-text-primary);
    font-weight: 700;
  }
  .take-option.selected::before { opacity: 1; }
  .take-radio {
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 2px solid var(--card-bdr);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.2s, background 0.2s;
  }
  .take-radio.selected {
    border-color: var(--violet);
    background: var(--violet);
    box-shadow: 0 0 12px rgba(124,58,237,0.5);
  }
  .take-radio-dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; }

  /* ── FILL BLANK INPUT ── */
  .take-fill-input {
    width: 100%;
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    border-radius: 16px;
    padding: 0.95rem 1.25rem;
    color: var(--color-text-primary);
    font-size: 0.95rem;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .take-fill-input:focus {
    border-color: var(--violet);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15), 0 0 24px rgba(124,58,237,0.1);
    background: var(--card-bg);
  }
  .take-fill-input::placeholder { color: var(--color-text-muted); }

  .spin { animation: take-spin 0.8s linear infinite; }
  @keyframes take-spin { to { transform: rotate(360deg); } }

  /* ── NAV BUTTONS ── */
  .take-nav-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.6rem 1.25rem;
    border-radius: 14px;
    font-size: 0.82rem; font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .take-nav-btn.ghost {
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    color: var(--color-text-secondary);
  }
  .take-nav-btn.ghost:hover:not(:disabled) { background: var(--color-surface-hover); color: var(--color-text-primary); }
  .take-nav-btn.ghost:disabled { opacity: 0.35; cursor: not-allowed; }
  .take-nav-btn.primary {
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    color: #fff;
    box-shadow: 0 0 20px rgba(124,58,237,0.35);
  }
  .take-nav-btn.primary:hover { box-shadow: 0 0 32px rgba(124,58,237,0.55); transform: translateY(-1px); }
  .take-nav-btn.outline {
    background: rgba(124,58,237,0.08);
    border: 2px solid var(--violet);
    color: var(--local-violet-l);
    font-weight: 700;
  }
  .take-nav-btn.outline:hover { background: rgba(124,58,237,0.14); }

  /* ── SIDEBAR ── */
  .take-sidebar {
    width: 220px;
    flex-shrink: 0;
    border-left: 2px solid var(--card-bdr);
    background: var(--navy);
    backdrop-filter: blur(16px);
    padding: 1.5rem 1.1rem;
    overflow-y: auto;
  }
  .take-sidebar-title {
    font-size: 0.68rem; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--color-text-secondary);
    margin-bottom: 0.85rem;
    font-family: 'Space Grotesk', sans-serif;
  }
  .take-qgrid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .take-qnum-btn {
    aspect-ratio: 1;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.68rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }
  .take-qnum-btn.cur {
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    color: #fff;
    box-shadow: 0 0 12px rgba(124,58,237,0.5);
    transform: scale(1.05);
  }
  .take-qnum-btn.answered {
    background: rgba(16,185,129,0.12);
    border: 2px solid var(--local-green);
    color: var(--local-green);
  }
  .take-qnum-btn.unanswered {
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    color: var(--color-text-secondary);
  }
  .take-qnum-btn.unanswered:hover { border-color: var(--violet); color: var(--color-text-primary); }

  /* ── LEGEND ── */
  .sidebar-legend { margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.68rem; color: var(--muted); }
  .legend-dot { width: 10px; height: 10px; border-radius: 4px; flex-shrink: 0; }

  /* ── LOADING SCREEN ── */
  .take-loading {
    min-height: 100vh;
    background: var(--navy);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 1rem;
  }
  .take-spinner {
    width: 44px; height: 44px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: var(--violet);
    border-right-color: rgba(124,58,237,0.3);
    animation: take-spin 0.7s linear infinite;
  }
  @keyframes take-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .take-spinner-glow {
    box-shadow: 0 0 30px rgba(124,58,237,0.4);
  }
  .take-loading-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9rem; font-weight: 500;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  /* ── MODAL CONTENT ── */
  .take-modal-warning {
    display: flex; align-items: flex-start; gap: 0.75rem;
    padding: 1rem 1.1rem;
    border-radius: 16px;
    background: rgba(245,158,11,0.08);
    border: 2px solid var(--local-amber);
    margin-bottom: 1.5rem;
    font-size: 0.82rem;
    color: var(--color-text-primary);
    line-height: 1.65;
    font-weight: 600;
  }
  .modal-btns { display: flex; justify-content: flex-end; gap: 0.6rem; }
  .modal-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.6rem 1.25rem;
    border-radius: 12px;
    font-size: 0.82rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .modal-btn.ghost { background: var(--card-bg); border: 2px solid var(--card-bdr); color: var(--color-text-secondary); }
  .modal-btn.ghost:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
  .modal-btn.primary { background: linear-gradient(135deg, var(--violet), #4F46E5); color: #fff; box-shadow: 0 0 20px rgba(124,58,237,0.35); }
  .modal-btn.primary:hover { box-shadow: 0 0 32px rgba(124,58,237,0.55); }

  @media (max-width: 1024px) { .take-sidebar { display: none; } }
  @media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }

  /* ── FULLSCREEN TOGGLE & LAYOUT ADJUSTMENTS ── */
  body.has-fullscreen-exam .sl-aside {
    display: none !important;
  }
  body.has-fullscreen-exam .sl-bottom-nav {
    display: none !important;
  }
  body.has-fullscreen-exam .sl-main {
    padding-bottom: 0 !important;
  }

  .take-root.fullscreen-mode {
    padding: 0;
    margin: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  .take-root.fullscreen-mode .take-main {
    max-width: 100% !important;
    padding: 2rem 4rem !important;
  }

  /* ── CANVAS DRAWING TOOLBOX ── */
  .canvas-wrapper {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }
  .canvas-container {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
    background: #0D111E;
    border: 2px solid var(--card-bdr);
  }
  /* ── CANVAS DRAWING TOOLBOX ── */
  .canvas-wrapper {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }
  .canvas-container {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    background: #090D16;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }
  .take-toolbox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
    max-width: 720px;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgba(15, 22, 41, 0.95) 0%, rgba(20, 29, 54, 0.95) 100%);
    border: 2px solid rgba(124, 58, 237, 0.25);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  .toolbox-group {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.3rem 0.45rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .toolbox-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.45rem 0.85rem;
    border-radius: 10px;
    border: 1.5px solid transparent;
    background: transparent;
    color: rgba(245, 240, 232, 0.65);
    font-size: 0.76rem;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .toolbox-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: #FFFFFF;
    transform: translateY(-1px);
  }
  .toolbox-btn.active-draw {
    background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
    border-color: #A78BFA;
    color: #FFFFFF;
    box-shadow: 0 0 16px rgba(124, 58, 237, 0.5);
  }
  .toolbox-btn.active-line {
    background: linear-gradient(135deg, #00D4FF 0%, #0284C7 100%);
    border-color: #38BDF8;
    color: #FFFFFF;
    box-shadow: 0 0 16px rgba(0, 212, 255, 0.5);
  }
  .toolbox-btn.active-erase {
    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    border-color: #FCD34D;
    color: #FFFFFF;
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.5);
  }
  .toolbox-btn.active-size {
    background: rgba(0, 212, 255, 0.15);
    border-color: #00D4FF;
    color: #00D4FF;
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
  }
  .toolbox-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .color-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
    border: 2px solid rgba(255, 255, 255, 0.2);
    position: relative;
  }
  .color-dot:hover {
    transform: scale(1.2);
  }
  .color-dot.active {
    transform: scale(1.25);
    box-shadow: 0 0 12px currentColor, 0 0 0 2px #FFFFFF;
    border-color: #FFFFFF;
  }
  .saving-indicator {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.7rem;
    color: var(--muted);
    font-weight: 500;
  }
  .saving-spinner {
    animation: take-spin 1s linear infinite;
  }
`;

/* ─── Timer hook ──────────────────────────────────────────────────────────── */
function useCountdown(deadlineIso, serverOffset = 0) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!deadlineIso) return;
    const tick = () => {
      const adjustedNow = Date.now() + serverOffset;
      const diff = Math.max(0, new Date(deadlineIso).getTime() - adjustedNow);
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineIso, serverOffset]);

  if (remaining === null) {
    return { remaining: 0, label: '—', expired: false };
  }

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  const pad = (n) => String(n).padStart(2, '0');
  const label = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

  return { remaining, label, expired: Boolean(deadlineIso && remaining === 0) };
}

function InteractiveTimer({ remaining, timerLabel, isUrgent, durationMinutes }) {
  const [format, setFormat] = useState('digital'); // 'digital', 'detailed'
  const [showTooltip, setShowTooltip] = useState(false);

  const totalMs = (durationMinutes || 60) * 60 * 1000;
  const elapsedPct = totalMs > 0 ? Math.min(100, Math.max(0, ((totalMs - remaining) / totalMs) * 100)) : 0;
  const remainingPct = 100 - elapsedPct;

  const isLowTime = remaining > 0 && remaining < 15 * 60 * 1000;
  const isCritical = remaining > 0 && remaining < 5 * 60 * 1000;

  const color = isCritical ? '#EF4444' : isLowTime ? '#F59E0B' : '#00D4FF';
  const bg = isCritical ? 'rgba(239, 68, 68, 0.18)' : isLowTime ? 'rgba(245, 158, 11, 0.18)' : 'rgba(0, 212, 255, 0.15)';
  const border = isCritical ? 'rgba(239, 68, 68, 0.45)' : isLowTime ? 'rgba(245, 158, 11, 0.45)' : 'rgba(0, 212, 255, 0.35)';

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  const detailedText = h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;

  const statusText = isCritical
    ? '🚨 Critical! Final 5 mins — submit soon!'
    : isLowTime
    ? '⚠️ Time is winding down (< 15 mins)'
    : '🟢 Steady pace — Plenty of time';

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        type="button"
        onClick={() => setFormat((f) => (f === 'digital' ? 'detailed' : 'digital'))}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          padding: '0.4rem 0.95rem',
          borderRadius: '14px',
          background: bg,
          border: `1.5px solid ${border}`,
          color: color,
          fontFamily: 'Space Grotesk, monospace',
          fontSize: '0.88rem',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: isCritical
            ? '0 0 20px rgba(239, 68, 68, 0.45)'
            : '0 0 14px rgba(0, 212, 255, 0.15)',
          transition: 'all 0.25s ease',
          height: '36px',
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        title="Click to switch timer display format"
      >
        <motion.div
          animate={isCritical ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : {}}
          transition={isCritical ? { repeat: Infinity, duration: 1 } : {}}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Clock size={15} style={{ strokeWidth: 2.5 }} />
        </motion.div>

        <span>{format === 'digital' ? timerLabel : detailedText}</span>

        {/* Pulsing indicator dot */}
        <div
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 8px ${color}`,
            animation: 'take-spin 2s linear infinite'
          }}
        />
      </motion.button>

      {/* Interactive Tooltip Card */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '240px',
              background: '#0F1629',
              border: `1.5px solid ${border}`,
              borderRadius: '16px',
              padding: '1rem',
              boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
              zIndex: 100,
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
              Time Allocation Summary
            </div>
            
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F5F0E8', marginBottom: '0.5rem', fontFamily: 'Space Grotesk, sans-serif' }}>
              {detailedText} remaining
            </div>

            {/* Time progress bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div
                style={{
                  height: '100%',
                  width: `${remainingPct}%`,
                  background: `linear-gradient(90deg, ${color}, #34D399)`,
                  borderRadius: '10px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: color, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {statusText}
            </div>

            <div style={{ fontSize: '0.65rem', color: 'rgba(245,240,232,0.4)', marginTop: '0.45rem', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.45rem' }}>
              💡 Click timer pill to switch digital / words format
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getCategoryInfo = (difficulty) => {
  const d = String(difficulty || '').toLowerCase().trim();
  if (d === 'easy' || d === 'foundation') {
    return {
      name: 'Foundation',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.35)',
      color: '#10B981',
      btnBg: 'rgba(16, 185, 129, 0.12)',
      btnBorder: '#10B981',
      btnColor: '#34D399',
      activeBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      activeShadow: '0 0 14px rgba(16, 185, 129, 0.5)'
    };
  }
  if (d === 'hard' || d === 'secure') {
    return {
      name: 'Secure',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.35)',
      color: '#EF4444',
      btnBg: 'rgba(239, 68, 68, 0.12)',
      btnBorder: '#EF4444',
      btnColor: '#F87171',
      activeBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      activeShadow: '0 0 14px rgba(239, 68, 68, 0.5)'
    };
  }
  return {
    name: 'Developing',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.35)',
    color: '#F59E0B',
    btnBg: 'rgba(245, 158, 11, 0.12)',
    btnBorder: '#F59E0B',
    btnColor: '#FBBF24',
    activeBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    activeShadow: '0 0 14px rgba(245, 158, 11, 0.5)'
  };
};

function CategoryBadge({ difficulty }) {
  const info = getCategoryInfo(difficulty);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0.2rem 0.65rem',
        borderRadius: '50px',
        fontSize: '0.68rem',
        fontWeight: 700,
        background: info.bg,
        border: `1px solid ${info.border}`,
        color: info.color,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontFamily: 'Space Grotesk, sans-serif'
      }}
    >
      {info.name}
    </span>
  );
}

/* ─── DRAWING CANVAS COMPONENTS ───────────────────────────────────────────── */
const redraw = (ctx, width, height, strokeList) => {
  ctx.clearRect(0, 0, width, height);
  strokeList.forEach(stroke => {
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (stroke.type === 'freehand' || stroke.type === 'draw') {
      if (stroke.points.length > 0) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    } else if (stroke.type === 'line') {
      if (stroke.points.length >= 2) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
        ctx.stroke();
      }
    } else if (stroke.type === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      if (stroke.points.length > 0) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });
};

function StructureCanvas({ imageUrl, strokes = [], onChange }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [tool, setTool] = useState('draw'); // 'draw', 'line', 'erase'
  const [color, setColor] = useState('#EF4444'); // default red
  const [brushSize, setBrushSize] = useState(4);
  const [redoList, setRedoList] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);

  const handleImageLoad = () => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setCanvasSize({ width: rect.width, height: rect.height });
  };

  useEffect(() => {
    const handleResize = () => {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      handleImageLoad();
    }
  }, [imageUrl]);

  useEffect(() => {
    if (!canvasRef.current || canvasSize.width === 0) return;
    const canvas = canvasRef.current;
    if (canvas.width !== canvasSize.width) canvas.width = canvasSize.width;
    if (canvas.height !== canvasSize.height) canvas.height = canvasSize.height;
    
    const ctx = canvas.getContext('2d');
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    redraw(ctx, canvasSize.width, canvasSize.height, allStrokes);
  }, [canvasSize, strokes, currentStroke]);

  const getCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    setIsDrawing(true);
    
    const newStroke = {
      type: tool,
      color: tool === 'erase' ? '#000000' : color,
      size: brushSize,
      points: [coords]
    };
    
    setCurrentStroke(newStroke);
  };

  const handleMove = (e) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    
    let updatedPoints = [...currentStroke.points];
    if (tool === 'line') {
      updatedPoints = [updatedPoints[0], coords];
    } else {
      updatedPoints.push(coords);
    }
    
    const updatedStroke = { ...currentStroke, points: updatedPoints };
    setCurrentStroke(updatedStroke);
  };

  const handleEnd = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    
    const finalStrokes = [...strokes, currentStroke];
    onChange(finalStrokes);
    setCurrentStroke(null);
    setRedoList([]);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const undone = strokes[strokes.length - 1];
    const newStrokes = strokes.slice(0, -1);
    onChange(newStrokes);
    setRedoList([...redoList, undone]);
  };

  const handleRedo = () => {
    if (redoList.length === 0) return;
    const redone = redoList[redoList.length - 1];
    const newStrokes = [...strokes, redone];
    onChange(newStrokes);
    setRedoList(redoList.slice(0, -1));
  };

  const handleClear = () => {
    onChange([]);
    setRedoList([]);
  };

  const COLORS = [
    { value: '#EF4444', label: 'Red' },
    { value: '#00D4FF', label: 'Cyan' },
    { value: '#10B981', label: 'Green' },
    { value: '#7C3AED', label: 'Violet' },
    { value: '#FFFFFF', label: 'White' }
  ];

  const SIZES = [
    { value: 2, label: 'Thin' },
    { value: 4, label: 'Medium' },
    { value: 8, label: 'Thick' }
  ];

  return (
    <div className="canvas-wrapper">
      <div 
        ref={containerRef} 
        className="canvas-container"
        style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Structure diagram"
          onLoad={handleImageLoad}
          draggable={false}
          style={{ width: '100%', maxHeight: '550px', objectFit: 'contain', borderRadius: '12px', display: 'block', pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitUserDrag: 'none' }}
        />
        
        {canvasSize.width > 0 && (
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onContextMenu={e => e.preventDefault()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: canvasSize.width,
              height: canvasSize.height,
              cursor: tool === 'erase' ? 'cell' : 'crosshair',
              touchAction: 'none'
            }}
          />
        )}
      </div>

      <div className="take-toolbox">
        {/* Tool selection group */}
        <div className="toolbox-group">
          <motion.button 
            type="button"
            className={clsx('toolbox-btn', tool === 'draw' && 'active-draw')} 
            onClick={() => setTool('draw')}
            title="Draw Freehand"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Paintbrush size={14} />
            <span>Draw</span>
          </motion.button>
          <motion.button 
            type="button"
            className={clsx('toolbox-btn', tool === 'line' && 'active-line')} 
            onClick={() => setTool('line')}
            title="Draw Straight Line"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Slash size={14} />
            <span>Line</span>
          </motion.button>
          <motion.button 
            type="button"
            className={clsx('toolbox-btn', tool === 'erase' && 'active-erase')} 
            onClick={() => setTool('erase')}
            title="Eraser"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eraser size={14} />
            <span>Erase</span>
          </motion.button>
        </div>

        {/* Color Palette (hidden when eraser is active) */}
        {tool !== 'erase' && (
          <div className="toolbox-group" style={{ padding: '0 0.5rem' }}>
            {COLORS.map(c => (
              <motion.button
                key={c.value}
                type="button"
                className={clsx('color-dot', color === c.value && 'active')}
                style={{ backgroundColor: c.value, color: c.value }}
                onClick={() => setColor(c.value)}
                title={c.label}
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        )}

        {/* Brush Size selector */}
        <div className="toolbox-group">
          {SIZES.map(s => (
            <motion.button
              key={s.value}
              type="button"
              className={clsx('toolbox-btn', brushSize === s.value && 'active-size')}
              onClick={() => setBrushSize(s.value)}
              title={`${s.label} Brush Size (${s.value}px)`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <span style={{ 
                display: 'inline-block', 
                width: s.value + 2, 
                height: s.value + 2, 
                borderRadius: '50%', 
                backgroundColor: 'currentColor' 
              }} />
            </motion.button>
          ))}
        </div>

        {/* Canvas History Actions */}
        <div className="toolbox-group">
          <motion.button 
            type="button"
            className="toolbox-btn" 
            onClick={handleUndo} 
            disabled={strokes.length === 0}
            title="Undo stroke"
            whileHover={{ scale: strokes.length > 0 ? 1.05 : 1 }}
            whileTap={{ scale: strokes.length > 0 ? 0.95 : 1 }}
          >
            <Undo2 size={14} />
          </motion.button>
          <motion.button 
            type="button"
            className="toolbox-btn" 
            onClick={handleRedo} 
            disabled={redoList.length === 0}
            title="Redo stroke"
            whileHover={{ scale: redoList.length > 0 ? 1.05 : 1 }}
            whileTap={{ scale: redoList.length > 0 ? 0.95 : 1 }}
          >
            <Redo2 size={14} />
          </motion.button>
          <motion.button 
            type="button"
            className="toolbox-btn" 
            onClick={handleClear} 
            disabled={strokes.length === 0}
            title="Clear canvas"
            style={{ color: strokes.length > 0 ? '#EF4444' : undefined }}
            whileHover={{ scale: strokes.length > 0 ? 1.05 : 1 }}
            whileTap={{ scale: strokes.length > 0 ? 0.95 : 1 }}
          >
            Clear
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function ExamTakePage() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const user = authUser || (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();

  const [phase, setPhase]                 = useState('loading');
  const [errorMsg, setErrorMsg]           = useState(null);
  const [submissionId, setSubmissionId]     = useState(null);
  const [deadline, setDeadline]             = useState(null);
  const [serverOffset, setServerOffset]     = useState(0);
  const [questions, setQuestions]           = useState([]);
  const [answers, setAnswers]               = useState({});
  const [current, setCurrent]               = useState(0);
  const [confirmSubmit, setConfirmSubmit]   = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const saveTimer = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasStrokes, setCanvasStrokes] = useState({});

  const { remaining, label: timerLabel, expired } = useCountdown(deadline, serverOffset);

  // Broadcast current active question context to GOGO AI Voice Tutor
  useEffect(() => {
    if (questions && questions.length > 0 && questions[current]) {
      const q = questions[current];
      const img = q.image_url || q.worksheet_url || q.file_url || q.image || q.question_image || q.url || q.content_url || null;
      const ctx = {
        questionNumber: current + 1,
        totalQuestions: questions.length,
        questionText: q.question_text || q.text || q.prompt || q.title || '',
        options: q.options || [],
        imageUrl: img,
        extractedText: null
      };
      window.activeExamContext = ctx;
      window.dispatchEvent(new CustomEvent('active-exam-question-changed', { detail: ctx }));
    } else {
      window.activeExamContext = null;
      window.dispatchEvent(new CustomEvent('active-exam-question-changed', { detail: null }));
    }

    return () => {
      window.activeExamContext = null;
      window.dispatchEvent(new CustomEvent('active-exam-question-changed', { detail: null }));
    };
  }, [current, questions]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('has-fullscreen-exam');
    } else {
      document.body.classList.remove('has-fullscreen-exam');
    }
    return () => {
      document.body.classList.remove('has-fullscreen-exam');
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const token = localStorage.getItem('accessToken');
    if (!token && !user) {
      navigate('/login', { replace: true });
      return;
    }

    (async () => {
      try {
        const startRes = await studentApi.startExam(examId);
        if (!isMounted) return;

        const startData = startRes.data?.data ?? startRes.data ?? {};
        const sid = startData.submission_id;
        const dl  = startData.deadline_at;
        const st  = startData.server_time;
        if (st) {
          setServerOffset(new Date(st).getTime() - Date.now());
        }
        setSubmissionId(sid);
        setDeadline(dl);

        const qRes = await studentApi.getExamQuestions(examId);
        if (!isMounted) return;

        const qData = qRes.data?.data ?? qRes.data ?? {};
        const rawQs = Array.isArray(qData.questions) ? qData.questions : Array.isArray(qData) ? qData : [];

        const fetchedQuestions = rawQs.map((q) => {
          let parsedOptions = [];
          if (Array.isArray(q.options)) {
            parsedOptions = q.options;
          } else if (typeof q.options === 'string') {
            try {
              parsedOptions = JSON.parse(q.options);
            } catch (e) {
              parsedOptions = [];
            }
          }
          return {
            ...q,
            options: parsedOptions,
          };
        });

        setQuestions(fetchedQuestions);
        
        // Initialize answers state from database
        const initialAnswers = {};
        fetchedQuestions.forEach(q => {
          if (q.student_answer !== undefined && q.student_answer !== null) {
            initialAnswers[q.id] = q.student_answer;
          }
        });
        setAnswers(initialAnswers);

        setPhase('taking');
      } catch (err) {
        if (!isMounted) return;
        console.error('Exam take error:', err);
        const msg = err.response?.data?.message ?? err.message ?? 'Could not start exam';
        toast.error(msg);
        setErrorMsg(msg);
        setPhase('error');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [examId, navigate, user]);

  useEffect(() => {
    if (expired && phase === 'taking') handleSubmit(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  const saveAnswer = useCallback(async (questionId, answer) => {
    if (!submissionId) return;
    try { await studentApi.saveAnswer(examId, submissionId, { question_id: questionId, answer }); } catch { /* silent */ }
  }, [examId, submissionId]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((p) => ({ ...p, [questionId]: answer }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveAnswer(questionId, answer), 800);
  };

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    setConfirmSubmit(false);
    setPhase('submitting');
    try {
      await studentApi.submitExam(examId, submissionId);
      if (!auto) toast.success('Exam submitted!');
      navigate(`/exams/${examId}/result`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Submission failed');
      setPhase('taking');
      setSubmitting(false);
    }
  };

  const answered = Object.keys(answers).length;
  const total    = questions.length;
  const q        = questions[current];
  const isUrgent = remaining > 0 && remaining < 5 * 60 * 1000;
  const pct      = total > 0 ? (answered / total) * 100 : 0;

  /* ── Loading / Submitting screens ── */
  if (phase === 'loading') {
    return (
      <div className="take-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F1629' }}>
        <style>{CSS}</style>
        <div className="take-loading" style={{ minHeight: 'auto', background: 'transparent' }}>
          <motion.div className="take-spinner take-spinner-glow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          <motion.p className="take-loading-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ color: '#F5F0E8' }}>
            Preparing your exam…
          </motion.p>
        </div>
      </div>
    );
  }

  if (phase === 'submitting') {
    return (
      <div className="take-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F1629' }}>
        <style>{CSS}</style>
        <div className="take-loading" style={{ minHeight: 'auto', background: 'transparent' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative', width: 44, height: 44 }}>
            <div className="take-spinner" style={{ borderTopColor: '#10B981', borderRightColor: 'rgba(16,185,129,0.3)', boxShadow: '0 0 30px rgba(16,185,129,0.4)' }} />
          </motion.div>
          <motion.p className="take-loading-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ color: '#F5F0E8' }}>
            Submitting your exam…
          </motion.p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="take-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F1629' }}>
        <style>{CSS}</style>
        <div className="take-loading" style={{ gap: '1.25rem', padding: '2rem', textAlign: 'center', minHeight: 'auto', background: 'transparent' }}>
          <div style={{ padding: '1.25rem', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
            <AlertTriangle size={36} />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F5F0E8' }}>
            Unable to Start Exam
          </div>
          <p style={{ fontSize: '0.88rem', color: 'rgba(245,240,232,0.6)', maxWidth: '420px', margin: 0, lineHeight: 1.6 }}>
            {errorMsg || 'Exam could not be loaded. Please check back later.'}
          </p>
          <button
            onClick={() => navigate((user?.role === 'teacher' || user?.role === 'admin') ? '/exams' : '/student/dashboard')}
            className="take-nav-btn primary"
            style={{ marginTop: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'taking' && questions.length === 0) {
    return (
      <div className="take-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F1629' }}>
        <style>{CSS}</style>
        <div className="take-loading" style={{ gap: '1.25rem', padding: '2rem', textAlign: 'center', minHeight: 'auto', background: 'transparent' }}>
          <div style={{ padding: '1.25rem', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
            <AlertTriangle size={36} />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F5F0E8' }}>
            No Questions Available in This Exam
          </div>
          <p style={{ fontSize: '0.88rem', color: 'rgba(245,240,232,0.6)', maxWidth: '420px', margin: 0, lineHeight: 1.6 }}>
            This exam has not been populated with questions yet. Please check back later or contact your instructor.
          </p>
          <button
            onClick={() => navigate(user?.role === 'student' ? '/student/dashboard' : '/exams')}
            className="take-nav-btn primary"
            style={{ marginTop: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="take-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F1629' }}>
        <style>{CSS}</style>
        <div className="take-loading" style={{ gap: '1rem', padding: '2rem', textAlign: 'center', minHeight: 'auto', background: 'transparent' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F5F0E8' }}>
            Question {current + 1} not found
          </div>
          <button
            onClick={() => setCurrent(0)}
            className="take-nav-btn primary"
            style={{ padding: '0.65rem 1.25rem', borderRadius: '10px' }}
          >
            Go to Question 1
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className={clsx('take-root', isFullscreen && 'fullscreen-mode')}>

        {/* ── TOP BAR ── */}
        <div className="take-topbar">
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span className="take-progress-label">{answered}/{total} answered</span>
            <div className="take-progress-track">
              <div className="take-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Fullscreen Option */}
            <button 
              type="button"
              className="toolbox-btn" 
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--cream)', padding: '0.45rem 0.95rem', gap: '0.4rem', height: '36px', borderRadius: '12px' }}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>

            {/* Interactive Timer */}
            <InteractiveTimer
              remaining={remaining}
              timerLabel={timerLabel}
              isUrgent={isUrgent}
              durationMinutes={questions?.[0]?.duration_minutes || 60}
            />
          </div>

          {/* Submit */}
          <button className="take-submit-btn" disabled={submitting} onClick={() => setConfirmSubmit(true)}>
            <Send size={13} /> Submit
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="take-body">

          {/* ── Main content ── */}
          <main className="take-main" style={{ maxWidth: 740, margin: '0 auto', width: '100%' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Question card */}
                <div className="take-qcard">
                  <div className="take-qnum">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span>Question {current + 1} of {total}</span>
                      <CategoryBadge difficulty={q.difficulty} />
                    </div>
                    <span className="take-marks-pill">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                  </div>
                  {q.question_text && <p className="take-qtext">{q.question_text}</p>}
                  
                  {/* Structure Question Canvas overlay with toolbox */}
                  {q.question_type === 'photo' && q.image_url && (
                    <StructureCanvas
                      imageUrl={q.image_url}
                      strokes={canvasStrokes[q.id] || []}
                      onChange={(newStrokes) => setCanvasStrokes(p => ({ ...p, [q.id]: newStrokes }))}
                    />
                  )}

                  {/* Optional reference image for MCQ/fill_blank questions */}
                  {q.question_type !== 'photo' && q.image_url && (
                    <div style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <img 
                        src={q.image_url} 
                        alt="Question reference" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '320px', 
                          objectFit: 'contain', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: 'rgba(0,0,0,0.2)',
                          padding: '0.5rem'
                        }} 
                      />
                    </div>
                  )}

                  {/* Optional Question Listening Audio Passage Player */}
                  {q.audio_url && (
                    <div style={{
                      marginTop: '1.2rem',
                      padding: '1rem 1.25rem',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(0,212,255,0.15) 100%)',
                      border: '1px solid rgba(0,212,255,0.45)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,212,255,0.4)' }}>
                            <Volume2 size={18} color="#00D4FF" />
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF', letterSpacing: '-0.01em' }}>
                            Question Listening Passage
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00D4FF', background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', padding: '0.2rem 0.65rem', borderRadius: 50 }}>
                          Listen & Answer
                        </span>
                      </div>
                      <audio
                        controls
                        controlsList="nodownload"
                        src={q.audio_url}
                        style={{ width: '100%', borderRadius: '10px', height: '42px', outline: 'none' }}
                      />
                    </div>
                  )}
                </div>

                {/* Answer area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  
                  {/* MCQ options (only for MCQ questions) */}
                  {q.question_type === 'mcq' && Array.isArray(q.options) && q.options.map((opt, i) => {
                    const val      = typeof opt === 'object' ? opt.id : opt;
                    const display  = typeof opt === 'object' ? opt.text : opt;
                    const selected = answers[q.id] === val;
                    return (
                      <motion.button
                        key={i}
                        className={clsx('take-option', selected && 'selected')}
                        onClick={() => handleAnswer(q.id, val)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className={clsx('take-radio', selected && 'selected')}>
                          {selected && <div className="take-radio-dot" />}
                        </div>
                        <span style={{ fontSize: '0.92rem', position: 'relative', zIndex: 1 }}>{display}</span>
                      </motion.button>
                    );
                  })}

                  {/* Fill blank */}
                  {q.question_type === 'fill_blank' && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <input
                        className="take-fill-input"
                        placeholder="Type your answer here…"
                        value={answers[q.id] ?? ''}
                        onChange={(e) => handleAnswer(q.id, e.target.value)}
                        autoFocus
                      />
                    </motion.div>
                  )}

                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="take-nav-btn ghost"
                    onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                    disabled={current === 0}
                  >
                    <ChevronLeft size={15} /> Previous
                  </button>
                  <button
                    className={clsx('take-nav-btn', current < total - 1 ? 'outline' : 'primary')}
                    onClick={() => current < total - 1 ? setCurrent((p) => p + 1) : setConfirmSubmit(true)}
                  >
                    {current < total - 1 ? <><span>Next</span><ChevronRight size={15} /></> : <><Send size={13} /><span>Submit</span></>}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* ── Sidebar ── */}
          <aside className="take-sidebar">
            <p className="take-sidebar-title">Questions</p>
            <div className="take-qgrid">
              {questions.map((qItem, i) => {
                const isCur = i === current;
                const isAns = !!answers[qItem?.id];
                const cat = getCategoryInfo(qItem?.difficulty);

                let btnStyle = {
                  background: cat.btnBg,
                  borderColor: cat.btnBorder,
                  color: cat.btnColor,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '38px',
                  cursor: 'pointer',
                  borderStyle: 'solid',
                  borderWidth: '1.5px',
                };

                if (isCur) {
                  btnStyle = {
                    ...btnStyle,
                    background: cat.activeBg,
                    color: '#FFFFFF',
                    borderColor: '#FFFFFF',
                    boxShadow: `${cat.activeShadow}, 0 0 0 2px rgba(255, 255, 255, 0.8)`,
                    transform: 'scale(1.08)',
                    zIndex: 2,
                  };
                } else if (isAns) {
                  btnStyle = {
                    ...btnStyle,
                    background: cat.btnBg,
                    borderColor: cat.btnBorder,
                    color: '#FFFFFF',
                    boxShadow: `inset 0 0 8px ${cat.btnBg}`,
                  };
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    style={btnStyle}
                    title={`Q${i + 1}: ${cat.name} (${isAns ? 'Answered' : 'Unanswered'})`}
                  >
                    <span>{i + 1}</span>
                    {isAns && !isCur && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-3px',
                          right: '-3px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: cat.btnColor,
                          border: '1.5px solid #0F1629'
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Question Categories
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {[
                  { label: 'Foundation', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
                  { label: 'Developing', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' },
                  { label: 'Secure',     color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)' },
                ].map((item) => (
                  <span
                    key={item.label}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '50px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      background: item.bg,
                      border: `1px solid ${item.border}`,
                      color: item.color
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress ring summary */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--cream), var(--lavender))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {Math.round(pct)}%
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2 }}>complete</div>
            </div>
          </aside>
        </div>

        {/* ── Confirm submit modal ── */}
        <Modal open={confirmSubmit} onClose={() => setConfirmSubmit(false)} title="Submit Exam" size="sm">
          <div className="take-modal-warning">
            <AlertTriangle size={16} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 700, marginBottom: '0.3rem', color: 'var(--color-text-primary)' }}>Are you sure?</p>
              <p>You've answered <strong style={{ color: 'var(--local-amber)' }}>{answered}</strong> of <strong style={{ color: 'var(--local-amber)' }}>{total}</strong> questions. You cannot change answers after submitting.</p>
            </div>
          </div>
          <div className="modal-btns">
            <button className="modal-btn ghost" onClick={() => setConfirmSubmit(false)}>Keep reviewing</button>
            <button className="modal-btn primary" disabled={submitting} onClick={() => handleSubmit(false)}>
              <Send size={13} /> Submit now
            </button>
          </div>
        </Modal>

        {/* ── GOGO AI Voice Tutor Widget for Exams ── */}
        <VoiceTutor />

      </div>
    </>
  );
}