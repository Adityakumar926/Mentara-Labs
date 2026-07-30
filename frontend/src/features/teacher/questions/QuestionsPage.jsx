import { useState, useMemo } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, Lock, CheckCircle, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import clsx from 'clsx';
import HierarchySidebar from '@/components/shared/HierarchySidebar';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

  .q-root {
    --navy:     var(--local-navy, #0A0E1A);
    --navy2:    var(--local-navy2, #0F1629);
    --violet:   #7C3AED;
    --violet-l: var(--local-violet-l, #9D6FEF);
    --cyan:     var(--local-cyan, #00D4FF);
    --cream:    var(--local-cream, #F5F0E8);
    --lavender: var(--local-lavender, #C4B5FD);
    --amber:    var(--local-amber, #F59E0B);
    --green:    var(--local-green, #10B981);
    --red:      var(--local-red, #EF4444);
    --card-bg:  var(--local-card-bg, rgba(255,255,255,0.04));
    --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.08));
    --muted:    var(--local-muted, rgba(245,240,232,0.45));
    font-family: 'Inter', sans-serif;
    color: var(--cream);
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .q-root *, .q-root *::before, .q-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .q-header {
    position: relative;
    background: linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(124,58,237,0.1) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 2rem 2.25rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .q-header-image {
    width: 230px;
    height: 180px;
    object-fit: contain;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  @media (max-width: 767px) {
    .q-header-image { display: none; }
  }
  .light .q-header {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(124, 58, 237, 0.18) 60%, rgba(248, 250, 252, 0.8) 100%);
    border-color: #D2D6FF;
  }
  .q-header-blob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .q-blob-1 {
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%);
    top: -60px; left: -40px;
  }
  .q-blob-2 {
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
    bottom: -50px; right: -20px;
  }
  .q-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(34, 211, 238, 0.08); border: 1px solid rgba(34, 211, 238, 0.2);
    padding: 0.3rem 0.85rem; border-radius: 50px;
    font-size: 0.65rem; font-weight: 700; color: var(--cyan);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.6rem;
  }
  .eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: q-blink 2s ease infinite;
  }
  @keyframes q-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .q-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.3rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.3rem;
  }
  .q-subtitle { font-size: 0.8rem; color: var(--muted); }

  /* ── SEARCH BAR ── */
  .q-search-wrap {
    position: relative;
    flex: 1;
  }
  .q-search-icon {
    position: absolute;
    left: 0.85rem; top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--muted);
  }
  .q-search-input {
    width: 100%;
    background: var(--local-card-bg);
    border: 1px solid var(--local-card-bdr);
    border-radius: 16px;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    color: var(--cream);
    font-size: 0.88rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .q-search-input:focus {
    border-color: var(--violet);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15), 0 0 24px rgba(124,58,237,0.08);
    background: var(--color-surface-hover);
  }
  .q-search-input::placeholder { color: var(--color-text-muted); }

  /* ── SELECT FILTER ── */
  .q-select-filter {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 0.45rem 0.85rem;
    color: var(--cream);
    font-size: 0.8rem;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .q-select-filter:focus, .q-select-filter:hover {
    border-color: var(--violet);
    background: rgba(124,58,237,0.14);
  }
  .q-select-filter option {
    background: #0F1629;
    color: #F5F0E8;
  }

  /* ── TYPE FILTER STRIP ── */
  .q-filter-strip {
    display: flex; gap: 0.25rem;
    padding: 0.3rem;
    background: var(--local-card-bg);
    border: 1px solid var(--local-card-bdr);
    border-radius: 16px;
    flex-shrink: 0;
  }
  .q-filter-btn {
    padding: 0.45rem 0.9rem;
    border-radius: 12px;
    border: none; background: transparent;
    color: var(--muted);
    font-size: 0.75rem; font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    position: relative;
    transition: color 0.2s;
    white-space: nowrap;
  }
  .q-filter-btn.active { color: #fff; }
  .q-filter-indicator {
    position: absolute; inset: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    box-shadow: 0 0 20px rgba(124,58,237,0.4);
    z-index: -1;
  }

  /* ── SUBJECT SECTION ── */
  .subject-header-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
    padding: 0.85rem 1.1rem;
    background: var(--local-card-bg);
    border: 1px solid var(--local-card-bdr);
    border-radius: 20px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
    color: var(--cream);
  }
  .subject-header-btn:hover {
    border-color: var(--violet);
    background: var(--color-surface-hover);
    transform: translateY(-1px);
  }
  .subject-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    letter-spacing: -0.01em;
  }
  .subject-count-pill {
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.18rem 0.65rem;
    border-radius: 99px;
    font-size: 0.68rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
  }
  .subject-count-free {
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.22);
    color: var(--lavender);
  }
  .subject-count-premium {
    background: rgba(245,158,11,0.1);
    border: 1px solid rgba(245,158,11,0.25);
    color: var(--amber);
  }
  .subject-curriculum-label {
    font-size: 0.7rem; color: var(--muted);
    font-family: 'Inter', sans-serif;
  }

  /* ── QUESTION CARD ── */
  .q-card {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 18px;
    overflow: hidden;
    backdrop-filter: blur(12px);
    transition: border-color 0.2s, box-shadow 0.15s;
  }
  .q-card:hover { border-color: rgba(124,58,237,0.2); }
  .q-card.answered-correct { border-color: rgba(16,185,129,0.25); box-shadow: 0 0 0 1px rgba(16,185,129,0.1); }
  .q-card.answered-wrong   { border-color: rgba(239,68,68,0.22); }

  /* ── QUESTION HEADER ROW ── */
  .q-header-row {
    width: 100%;
    display: flex; align-items: flex-start; gap: 0.85rem;
    padding: 1rem 1.1rem;
    text-align: left;
    background: none; border: none;
    color: var(--cream);
    font-family: 'Inter', sans-serif;
    transition: background 0.15s;
  }
  .q-header-row.clickable { cursor: pointer; }
  .q-header-row.clickable:hover { background: rgba(255,255,255,0.02); }
  .q-header-row.static { cursor: default; }

  .q-index {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem; font-weight: 600;
    color: var(--muted);
    width: 18px; flex-shrink: 0; margin-top: 3px;
    user-select: none;
  }

  .q-text {
    flex: 1; min-width: 0;
    font-size: 0.9rem; line-height: 1.7;
    color: var(--cream);
  }
  .q-text.blurred { filter: blur(5px); user-select: none; pointer-events: none; }

  .q-meta-right {
    display: flex; align-items: center; gap: 0.5rem;
    flex-shrink: 0;
  }

  /* ── TYPE BADGE ── */
  .q-type-badge {
    display: inline-flex;
    padding: 0.15rem 0.55rem;
    border-radius: 99px;
    font-size: 0.65rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: 0.04em;
  }
  .q-type-mcq    { background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.25); color: var(--lavender); }
  .q-type-fill   { background: rgba(0,212,255,0.08);  border: 1px solid rgba(0,212,255,0.2);  color: var(--cyan); }
  .q-type-photo  { background: rgba(245,158,11,0.1);  border: 1px solid rgba(245,158,11,0.22); color: var(--amber); }
  .q-type-other  { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--muted); }

  /* ── CHEVRON ICON ── */
  .q-chevron { color: var(--muted); transition: transform 0.25s, color 0.15s; flex-shrink: 0; }
  .q-chevron.open { transform: rotate(180deg); color: var(--violet-l); }

  /* ── MCQ OPTIONS PANEL ── */
  .q-options-panel {
    padding: 0 1.1rem 1.1rem 2.8rem;
    overflow: hidden;
  }
  .q-options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .q-option-btn {
    display: flex; align-items: center; gap: 0.65rem;
    padding: 0.75rem 0.9rem;
    border-radius: 14px;
    border: 1px solid var(--card-bdr);
    background: rgba(255,255,255,0.03);
    color: var(--cream);
    font-size: 0.82rem;
    font-family: 'Inter', sans-serif;
    text-align: left;
    cursor: pointer;
    transition: all 0.18s;
    position: relative;
    overflow: hidden;
  }
  .q-option-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(124,58,237,0.06) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.18s;
  }
  .q-option-btn:not(:disabled):hover {
    border-color: rgba(124,58,237,0.4);
    background: rgba(124,58,237,0.06);
    transform: translateX(2px);
  }
  .q-option-btn:not(:disabled):hover::before { opacity: 1; }
  .q-option-btn.correct {
    background: rgba(16,185,129,0.1);
    border-color: rgba(16,185,129,0.35);
    color: #10B981;
    box-shadow: 0 0 12px rgba(16,185,129,0.12);
  }
  .q-option-btn.wrong {
    background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.3);
    color: #EF4444;
  }
  .q-option-btn.dimmed { opacity: 0.35; }
  .q-option-btn:disabled { cursor: not-allowed; }

  .q-option-letter {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; font-weight: 600;
    width: 16px; flex-shrink: 0;
    color: inherit;
    opacity: 0.7;
  }

  /* ── FEEDBACK ROW ── */
  .q-feedback-row {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .q-feedback-text {
    font-size: 0.78rem; font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
  }
  .q-feedback-text.correct { color: var(--green); }
  .q-feedback-text.wrong   { color: var(--red); }

  .q-try-again-btn {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.68rem; font-weight: 600;
    color: var(--muted);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 0.25rem 0.65rem;
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: all 0.15s;
  }
  .q-try-again-btn:hover { color: var(--cream); border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.07); }

  .q-hint {
    font-size: 0.7rem; color: var(--muted);
    padding-top: 0.3rem;
    font-style: italic;
  }

  /* ── PREMIUM OVERLAY ── */
  .q-premium-overlay {
    position: absolute; inset: 0;
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
    background: rgba(10,14,26,0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .q-premium-pill {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.35rem 0.9rem;
    border-radius: 99px;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.3);
    font-size: 0.75rem; font-weight: 700;
    color: var(--amber);
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: 0.04em;
    box-shadow: 0 0 20px rgba(245,158,11,0.2);
  }

  /* ── SKELETON ── */
  .q-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.06);
    animation: q-skel-shine 1.6s ease infinite;
  }
  @keyframes q-skel-shine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .q-skel-head {
    height: 34px; border-radius: 16px; margin-bottom: 0.6rem;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: q-skel-shine 1.6s ease infinite;
  }

  /* ── EMPTY ── */
  .q-empty {
    padding: 3rem 2rem;
    text-align: center;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
  }
  .q-empty-icon {
    width: 56px; height: 56px; border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.2);
  }
  .q-empty-title { font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 700; margin-bottom: 0.4rem; }
  .q-empty-sub { font-size: 0.82rem; color: var(--muted); line-height: 1.6; max-width: 300px; margin: 0 auto; }

  /* ── SECTION SEPARATOR ── */
  .q-section-sep {
    width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.2) 30%, rgba(0,212,255,0.15) 70%, transparent 100%);
    margin: 0.25rem 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

/* ─── constants ────────────────────────────────────────────────────────────── */
const TYPE_LABEL = { mcq: 'MCQ', fill_blank: 'Fill blank', photo: 'Structure' };
const ALL_TYPES = ['all', 'mcq', 'fill_blank', 'photo'];

function TypeBadge({ type }) {
  const cls = type === 'mcq' ? 'q-type-mcq' : type === 'fill_blank' ? 'q-type-fill' : type === 'photo' ? 'q-type-photo' : 'q-type-other';
  return <span className={`q-type-badge ${cls}`}>{TYPE_LABEL[type] ?? type}</span>;
}

/* ─── PremiumOverlay ───────────────────────────────────────────────────────── */
function PremiumOverlay() {
  return (
    <div className="q-premium-overlay">
      <span className="q-premium-pill">
        <Lock size={11} />
        PREMIUM
      </span>
    </div>
  );
}

/* ─── QuestionCard ─────────────────────────────────────────────────────────── */
/* ─── QuestionCard ─────────────────────────────────────────────────────────── */
function QuestionCard({ q, idx }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [fillValue, setFillValue] = useState(''); // Tracks the text input for fill-in-the-blanks

  const isPremium = q.is_premium;
  const isLocked = isPremium && q.question_text === '[PREMIUM]';
  const hasOptions = !isLocked && q.question_type === 'mcq' && Array.isArray(q.options) && q.options.length;
  const isPhoto = !isLocked && q.question_type === 'photo';
  const photoHasOptions = isPhoto && Array.isArray(q.options) && q.options.some((o) => o.text?.trim());
  const isFillBlank = !isLocked && q.question_type === 'fill_blank';
  const isExpandable = (hasOptions || isPhoto || isFillBlank) && !isLocked;

  const answered = selected !== null;
  
  // Adjusted isCorrect to handle case-insensitive string matching for fill in the blanks
  const isCorrect = answered && (
    isFillBlank && typeof selected === 'string' && typeof q.correct_answer === 'string'
      ? selected.toLowerCase() === q.correct_answer.toLowerCase()
      : selected === q.correct_answer
  );

  const handleOptionClick = (optId) => { 
    if (answered) return; 
    setSelected(optId); 
  };

  const handleFillSubmit = (e) => {
    e.preventDefault();
    if (answered || !fillValue.trim()) return;
    setSelected(fillValue.trim()); // Lock in the answer
  };

  const handleReset = (e) => { 
    e.stopPropagation(); 
    setSelected(null); 
    setFillValue(''); // Clear the input field when retrying
  };

  const cardClass = clsx(
    'q-card',
    answered && isCorrect && 'answered-correct',
    answered && !isCorrect && 'answered-wrong'
  );

  return (
    <motion.div
      className={cardClass}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03, duration: 0.22 }}
    >
      {isLocked && <PremiumOverlay />}

      {/* Header row */}
      <button
        onClick={() => isExpandable && setOpen((p) => !p)}
        className={clsx('q-header-row', isExpandable ? 'clickable' : 'static')}
      >
        <span className="q-index">{idx + 1}</span>

        <p className={clsx('q-text', isLocked && 'blurred')}>
          {isLocked
            ? 'This is a premium question — unlock to view.'
            : (q.question_text || (q.image_url ? 'Question Diagram / Photo' : `Question #${idx + 1}`))}
        </p>

        <div className="q-meta-right">
          {answered && (
            isCorrect
              ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                <CheckCircle size={15} color="var(--green)" />
              </motion.span>
              : <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                <XCircle size={15} color="var(--red)" />
              </motion.span>
          )}
          <TypeBadge type={q.question_type} />
          {isExpandable && (
            <ChevronDown size={13} className={clsx('q-chevron', open && 'open')} />
          )}
        </div>
      </button>

      {/* Direct Question Photo Display */}
      {q.image_url && !isLocked && (
        <div style={{ padding: '0.5rem 1.1rem 0.85rem 2.8rem' }}>
          <img
            src={q.image_url}
            alt="Question photo"
            style={{
              width: '100%',
              maxHeight: '450px',
              objectFit: 'contain',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.25)',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {open && isExpandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="q-options-panel">
              <div className="q-section-sep" style={{ marginBottom: '0.75rem' }} />

              {/* ── Photo panel ── */}
              {isPhoto && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {q.image_url ? (
                    <motion.img
                      src={q.image_url}
                      alt="Question image"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        width: '100%',
                        maxHeight: '420px',
                        objectFit: 'contain',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)',
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                      No image attached to this question.
                    </p>
                  )}
                  <p className="q-hint" style={{ paddingTop: 0 }}>
                    Photo-type question — analyze the photo and choose the answer.
                  </p>
                  
                  {photoHasOptions && (
                    <div className="q-options-grid">
                      {q.options.map((opt, oi) => {
                        const isThisCorrect = opt.id === q.correct_answer;
                        const isThisSelected = opt.id === selected;
                        const btnClass = clsx(
                          'q-option-btn',
                          answered && isThisCorrect && 'correct',
                          answered && isThisSelected && !isThisCorrect && 'wrong',
                          answered && !isThisCorrect && !isThisSelected && 'dimmed'
                        );
                        return (
                          <motion.button
                            key={opt.id}
                            className={btnClass}
                            onClick={() => handleOptionClick(opt.id)}
                            disabled={answered}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: oi * 0.04 }}
                            whileTap={!answered ? { scale: 0.98 } : {}}
                          >
                            <span className="q-option-letter">{opt.id.toUpperCase()}.</span>
                            <span style={{ flex: 1, position: 'relative', zIndex: 1 }}>{opt.text}</span>
                            {answered && isThisCorrect && <CheckCircle size={13} color="var(--green)" style={{ flexShrink: 0 }} />}
                            {answered && isThisSelected && !isThisCorrect && <XCircle size={13} color="var(--red)" style={{ flexShrink: 0 }} />}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  <AnimatePresence>
                    {answered ? (
                      <motion.div
                        className="q-feedback-row"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className={clsx('q-feedback-text', isCorrect ? 'correct' : 'wrong')}>
                          {isCorrect
                            ? '✓ Correct!'
                            : `✗ Incorrect — correct answer is ${q.correct_answer.toUpperCase()}`}
                        </span>
                        <button className="q-try-again-btn" onClick={handleReset}>
                          <RotateCcw size={10} /> Try again
                        </button>
                      </motion.div>
                    ) : (
                      <motion.p className="q-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Select an option to check your answer
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Fill in the blanks ── */}
              {isFillBlank && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <p className="q-hint" style={{ paddingTop: 0 }}>
                    Type your answer below and click Check.
                  </p>
                  <form onSubmit={handleFillSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="q-search-input"
                      placeholder="Type your answer here..."
                      value={fillValue}
                      onChange={(e) => setFillValue(e.target.value)}
                      disabled={answered}
                      autoComplete="off"
                      style={{ flex: 1, borderRadius: '14px', padding: '0.75rem 1rem' }}
                    />
                    <button
                      type="submit"
                      disabled={answered || !fillValue.trim()}
                      className={clsx(
                        'q-option-btn',
                        answered && isCorrect && 'correct',
                        answered && !isCorrect && 'wrong'
                      )}
                      style={{ padding: '0 1.25rem', margin: 0, justifyContent: 'center', minWidth: '90px' }}
                    >
                      Check
                    </button>
                  </form>

                  <AnimatePresence>
                    {answered && (
                      <motion.div
                        className="q-feedback-row"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className={clsx('q-feedback-text', isCorrect ? 'correct' : 'wrong')}>
                          {isCorrect
                            ? '✓ Correct!'
                            : `✗ Incorrect — correct answer is: ${q.correct_answer}`}
                        </span>
                        <button type="button" className="q-try-again-btn" onClick={handleReset}>
                          <RotateCcw size={10} /> Try again
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── MCQ options ── */}
              {hasOptions && (
                <>
                  <div className="q-options-grid">
                    {q.options.map((opt, oi) => {
                      const isThisCorrect = opt.id === q.correct_answer;
                      const isThisSelected = opt.id === selected;
                      const btnClass = clsx(
                        'q-option-btn',
                        answered && isThisCorrect && 'correct',
                        answered && isThisSelected && !isThisCorrect && 'wrong',
                        answered && !isThisCorrect && !isThisSelected && 'dimmed'
                      );
                      return (
                        <motion.button
                          key={opt.id}
                          className={btnClass}
                          onClick={() => handleOptionClick(opt.id)}
                          disabled={answered}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: oi * 0.04 }}
                          whileTap={!answered ? { scale: 0.98 } : {}}
                        >
                          <span className="q-option-letter">{opt.id.toUpperCase()}.</span>
                          <span style={{ flex: 1, position: 'relative', zIndex: 1 }}>{opt.text}</span>
                          {answered && isThisCorrect && <CheckCircle size={13} color="var(--green)" style={{ flexShrink: 0 }} />}
                          {answered && isThisSelected && !isThisCorrect && <XCircle size={13} color="var(--red)" style={{ flexShrink: 0 }} />}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {answered ? (
                      <motion.div
                        className="q-feedback-row"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className={clsx('q-feedback-text', isCorrect ? 'correct' : 'wrong')}>
                          {isCorrect
                            ? '✓ Correct!'
                            : `✗ Incorrect — correct answer is ${q.correct_answer.toUpperCase()}`}
                        </span>
                        <button className="q-try-again-btn" onClick={handleReset}>
                          <RotateCcw size={10} /> Try again
                        </button>
                      </motion.div>
                    ) : (
                      <motion.p className="q-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Select an option to check your answer
                      </motion.p>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── SubjectSection ───────────────────────────────────────────────────────── */
function SubjectSection({ group, typeFilter, search, subjectFilter, topicFilter, premiumFilter, sectionIdx, selectedNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const questions = useMemo(() => {
    // 1. Subject filter check (by subject_id to handle same-name subjects across stages)
    if (subjectFilter !== 'all' && group.subject_id !== subjectFilter) {
      return [];
    }

    const term = (search || '').trim().toLowerCase();
    return group.questions.filter((q) => {
      if (!q) return false;

      // Sidebar topic node filter
      if (selectedNode?.type === 'topic' && q.topic_id !== selectedNode.id) return false;

      const matchType = typeFilter === 'all' || q.question_type === typeFilter;
      if (!matchType) return false;

      // 2. Topic filter check (by normalized topic name)
      if (topicFilter !== 'all') {
        const qTopicKey = (q.topic_name || '').trim().toLowerCase();
        if (qTopicKey !== String(topicFilter).trim().toLowerCase()) return false;
      }

      // 3. Premium / Free filter check
      if (premiumFilter === 'free' && q.is_premium) return false;
      if (premiumFilter === 'premium' && !q.is_premium) return false;

      if (!term) return true;

      const textMatch    = Boolean(q.question_text && String(q.question_text).toLowerCase().includes(term));
      const subjectMatch = Boolean(group.subject_name && String(group.subject_name).toLowerCase().includes(term));
      const topicMatch   = Boolean(q.topic_name && String(q.topic_name).toLowerCase().includes(term));
      const typeMatch    = Boolean(q.question_type && String(q.question_type).toLowerCase().includes(term));
      const diffMatch    = Boolean(q.difficulty && String(q.difficulty).toLowerCase().includes(term));
      const imageMatch   = Boolean(q.image_url && String(q.image_url).toLowerCase().includes(term));

      let optionsMatch = false;
      if (Array.isArray(q.options)) {
        optionsMatch = q.options.some(o => o && ((o.text && String(o.text).toLowerCase().includes(term)) || (o.id && String(o.id).toLowerCase().includes(term))));
      }

      return textMatch || subjectMatch || topicMatch || typeMatch || diffMatch || imageMatch || optionsMatch;
    });
  }, [group.questions, group.subject_name, typeFilter, search, subjectFilter, topicFilter, premiumFilter, selectedNode]);

  if (!questions.length) return null;

  const freeCount = questions.filter((q) => !q.is_premium).length;
  const premiumCount = questions.filter((q) => q.is_premium).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: sectionIdx * 0.08, duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
    >
      {/* Subject header */}
      <button className="subject-header-btn" onClick={() => setCollapsed((p) => !p)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span className="subject-name">{group.subject_name}</span>
          <span className="subject-count-pill subject-count-free">{freeCount} free</span>
          {premiumCount > 0 && (
            <span className="subject-count-pill subject-count-premium">
              <Lock size={9} /> {premiumCount} premium
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <span className="subject-curriculum-label">{group.curriculum_name}</span>
          <ChevronDown size={14} className={clsx('q-chevron', !collapsed && 'open')} style={{ color: 'var(--muted)' }} />
        </div>
      </button>

      {/* Questions list */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            {questions.map((q, i) => (
              <QuestionCard key={q.id} q={q} idx={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Skeleton loader ──────────────────────────────────────────────────────── */
function QSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <div className="q-skel-head" />
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="q-skel" style={{ height: 56 + j * 2 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Empty states ─────────────────────────────────────────────────────────── */
function QEmpty({ icon: Icon, title, description }) {
  return (
    <motion.div className="q-empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="q-empty-icon"><Icon size={24} color="var(--violet-l)" /></div>
      <p className="q-empty-title">{title}</p>
      <p className="q-empty-sub">{description}</p>
    </motion.div>
  );
}

/* ─── MAIN PAGE ────────────────────────────────────────────────────────────── */
export default function StudentQuestionsPage() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');

  const { data: raw, loading } = useApi(studentApi.getMyQuestions);
  const rawGroups = raw?.data ?? raw ?? [];

  const groups = useMemo(() => {
    if (!selectedNode) return rawGroups;
    return rawGroups.filter(g => {
      if (selectedNode.type === 'curriculum') {
        return g.curriculum_id === selectedNode.id;
      }
      if (selectedNode.type === 'class') {
        return g.class_id === selectedNode.id;
      }
      if (selectedNode.type === 'subject') {
        return g.subject_id === selectedNode.id;
      }
      if (selectedNode.type === 'topic') {
        return (g.questions || []).some(q => q.topic_id === selectedNode.id);
      }
      return true;
    });
  }, [rawGroups, selectedNode]);

  // Available subjects (unique per subject_id, not per name)
  const availableSubjects = useMemo(() => {
    const map = new Map();
    (groups || []).forEach(g => {
      if (g.subject_id && !map.has(g.subject_id)) {
        map.set(g.subject_id, {
          id: g.subject_id,
          name: g.subject_name?.trim() || g.subject_id,
          class_id: g.class_id,
          curriculum_id: g.curriculum_id,
        });
      }
    });
    return Array.from(map.values());
  }, [groups]);

  // Available topics for selected subject
  const availableTopics = useMemo(() => {
    const map = new Map();
    (groups || []).forEach(g => {
      // filter by subject_id (not subject name) to avoid cross-stage matches
      if (subjectFilter !== 'all' && g.subject_id !== subjectFilter) return;
      (g.questions || []).forEach(q => {
        if (q.topic_name) {
          const key = q.topic_name.trim().toLowerCase();
          if (!map.has(key)) {
            map.set(key, { id: key, name: q.topic_name.trim() });
          }
        }
      });
    });
    return Array.from(map.values());
  }, [groups, subjectFilter]);

  const totalFree = useMemo(() => groups.reduce((a, g) => a + g.questions.filter((q) => !q.is_premium).length, 0), [groups]);
  const totalPremium = useMemo(() => groups.reduce((a, g) => a + g.questions.filter((q) => q.is_premium).length, 0), [groups]);

  const visibleCount = useMemo(
    () => groups.reduce((acc, g) => {
      // filter by subject_id when a subject is selected
      if (subjectFilter !== 'all' && g.subject_id !== subjectFilter) return acc;
      const term = (search || '').trim().toLowerCase();
      const count = g.questions.filter((q) => {
        if (!q) return false;

        // Sidebar topic node filter
        if (selectedNode?.type === 'topic' && q.topic_id !== selectedNode.id) return false;

        const matchType = typeFilter === 'all' || q.question_type === typeFilter;
        if (!matchType) return false;

        if (topicFilter !== 'all') {
          const qTopicKey = (q.topic_name || '').trim().toLowerCase();
          if (qTopicKey !== String(topicFilter).trim().toLowerCase()) return false;
        }

        if (premiumFilter === 'free' && q.is_premium) return false;
        if (premiumFilter === 'premium' && !q.is_premium) return false;

        if (!term) return true;

        const textMatch    = Boolean(q.question_text && String(q.question_text).toLowerCase().includes(term));
        const subjectMatch = Boolean(g.subject_name && String(g.subject_name).toLowerCase().includes(term));
        const topicMatch   = Boolean(q.topic_name && String(q.topic_name).toLowerCase().includes(term));
        const typeMatch    = Boolean(q.question_type && String(q.question_type).toLowerCase().includes(term));
        const diffMatch    = Boolean(q.difficulty && String(q.difficulty).toLowerCase().includes(term));
        const imageMatch   = Boolean(q.image_url && String(q.image_url).toLowerCase().includes(term));

        let optionsMatch = false;
        if (Array.isArray(q.options)) {
          optionsMatch = q.options.some(o => o && ((o.text && String(o.text).toLowerCase().includes(term)) || (o.id && String(o.id).toLowerCase().includes(term))));
        }

        return textMatch || subjectMatch || topicMatch || typeMatch || diffMatch || imageMatch || optionsMatch;
      }).length;
      return acc + count;
    }, 0),
    [groups, typeFilter, search, subjectFilter, topicFilter, premiumFilter, selectedNode]
  );

  return (
    <PageWrapper className="p-0">
      <style>{CSS}</style>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <HierarchySidebar
          selectedNodeId={selectedNode?.id}
          selectedNodeType={selectedNode?.type}
          onSelectNode={(node) => {
            if (selectedNode?.id === node.id && selectedNode?.type === node.type) {
              setSelectedNode(null);
            } else {
              setSelectedNode(node);
            }
          }}
        />
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          <div className="q-root">

        {/* Ambient background blur blobs */}
        <div className="q-header-blob q-blob-1" />
        <div className="q-header-blob q-blob-2" />

        {/* ── Page header ── */}
        <motion.div 
          className="q-header"
          initial={{ opacity: 0, y: -12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
        >
          <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <div className="q-eyebrow">
              <span className="eyebrow-dot" />
              Practice Bank
            </div>
            <h1 className="q-title">Questions</h1>
            <p className="q-subtitle">
              {loading ? 'Loading…' : (
                <>
                  {totalFree} free · <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{totalPremium} premium</span> from your curriculum
                </>
              )}
            </p>
          </div>
          <img src="/question.png?v=2" alt="" className="q-header-image" />
        </motion.div>

        {/* ── Hierarchy Filter Bar (Subject, Topic & Premium) ── */}
        {!loading && groups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            style={{
              display: 'flex',
              gap: '0.85rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-bdr)',
              borderRadius: '18px',
              padding: '0.75rem 1.1rem',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Subject Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--lavender)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Subject:
              </span>
              <select
                className="q-select-filter"
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setTopicFilter('all');
                }}
              >
                <option value="all">All Subjects ({availableSubjects.length})</option>
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Topic Selector */}
            {availableTopics.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Topic:
                </span>
                <select
                  className="q-select-filter"
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                >
                  <option value="all">All Topics ({availableTopics.length})</option>
                  {availableTopics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Premium / Free Tier Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tier:
              </span>
              <select
                className="q-select-filter"
                value={premiumFilter}
                onChange={(e) => setPremiumFilter(e.target.value)}
              >
                <option value="all">All Questions</option>
                <option value="free">Free Only ({totalFree})</option>
                <option value="premium">Premium Only ({totalPremium})</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* ── Search + type filter ── */}
        {!loading && groups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
          >
            <div className="q-search-wrap">
              <Search size={14} className="q-search-icon" />
              <input
                className="q-search-input"
                placeholder="Search questions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="q-filter-strip">
              {ALL_TYPES.map((t) => (
                <button
                  key={t}
                  className={clsx('q-filter-btn', typeFilter === t && 'active')}
                  onClick={() => setTypeFilter(t)}
                >
                  {typeFilter === t && (
                    <motion.div
                      className="q-filter-indicator"
                      layoutId="q-filter-indicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {t === 'all' ? 'All' : TYPE_LABEL[t]}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <QSkeleton />
        ) : groups.length === 0 ? (
          <QEmpty icon={BookOpen} title="No questions available" description="Questions from your enrolled curriculum will appear here." />
        ) : visibleCount === 0 ? (
          <QEmpty icon={Search} title="No matches" description="Try a different search term or question type." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {groups.map((group, si) => (
              <SubjectSection
                key={group.subject_id}
                group={group}
                typeFilter={typeFilter}
                search={search}
                subjectFilter={subjectFilter}
                topicFilter={topicFilter}
                premiumFilter={premiumFilter}
                sectionIdx={si}
                selectedNode={selectedNode}
              />
            ))}
          </div>
        )}

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}