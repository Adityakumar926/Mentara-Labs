import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Award, Trophy, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Skeleton } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import clsx from 'clsx';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .result-root {
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
  }
  .result-root *, .result-root *::before, .result-root *::after { box-sizing: border-box; }

  /* ── BACK BUTTON ── */
  .result-back {
    display: inline-flex; align-items: center; gap: 0.5rem;
    font-size: 0.82rem; font-weight: 700;
    color: var(--muted);
    background: var(--local-card-bg);
    border: 2px solid var(--local-card-bdr);
    border-radius: 12px;
    padding: 0.45rem 1rem;
    cursor: pointer;
    transition: color 0.2s, background 0.2s, border-color 0.2s;
    text-decoration: none;
    font-family: 'Space Grotesk', sans-serif;
  }
  .result-back:hover { color: var(--cream); background: var(--color-surface-hover); border-color: var(--violet); }

  /* ── SCORE HERO ── */
  .result-hero {
    position: relative;
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    border-radius: 28px;
    padding: 2.5rem 2rem;
    text-align: center;
    overflow: hidden;
    backdrop-filter: blur(16px);
  }
  .result-hero-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    pointer-events: none;
  }
  .result-hero-blob-1 { width: 300px; height: 300px; top: -100px; left: 50%; transform: translateX(-50%); animation: hero-blob 8s ease-in-out infinite alternate; }
  @keyframes hero-blob { from { transform: translateX(-50%) scale(1); opacity: 0.6; } to { transform: translateX(-50%) scale(1.2); opacity: 1; } }

  /* ── SCORE RING ── */
  .score-ring-wrap {
    position: relative;
    width: 140px; height: 140px;
    margin: 0 auto 1.5rem;
  }
  .score-ring-svg { transform: rotate(-90deg); }
  .score-ring-bg { fill: none; stroke: var(--local-card-bdr); stroke-width: 8; }
  .score-ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1); }
  .score-ring-inner {
    position: absolute;
    inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .score-ring-pct {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.9rem; font-weight: 700;
    line-height: 1;
  }
  .score-ring-pct span { font-weight: 800; }
  .score-ring-label { font-size: 0.7rem; color: var(--muted); margin-top: 2px; font-weight: 700; }

  /* ── PASSED / FAILED BADGE ── */
  .result-verdict {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 1.25rem;
    border-radius: 99px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.82rem; font-weight: 800;
    letter-spacing: 0.06em;
    margin-bottom: 1.25rem;
  }

  /* ── STAT CHIPS ── */
  .result-stats-row {
    display: flex; align-items: center; justify-content: center;
    gap: 0; padding-top: 1.5rem;
    border-top: 2px solid var(--local-card-bdr);
    flex-wrap: wrap;
  }
  .result-stat {
    text-align: center;
    padding: 0.5rem 1.5rem;
    border-right: 2px solid var(--local-card-bdr);
  }
  .result-stat:last-child { border-right: none; }
  .result-stat-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.3rem; font-weight: 700;
  }
  .result-stat-label { font-size: 0.68rem; color: var(--muted); margin-top: 0.15rem; font-weight: 700; letter-spacing: 0.04em; }

  /* ── SECTION HEADER ── */
  .result-section-head {
    display: flex; align-items: center; gap: 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    margin-bottom: 0.85rem;
  }

  /* ── QUESTION CARD ── */
  .result-qcard {
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    border-radius: 20px;
    padding: 1.4rem 1.5rem;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(12px);
    transition: border-color 0.2s;
  }
  .result-qcard:hover { border-color: var(--violet); }
  .result-qcard-accent {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 20px 0 0 20px;
  }

  /* ── Q NUMBER BADGE ── */
  .result-qbadge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px;
    border-radius: 7px;
    font-size: 0.65rem; font-weight: 700;
    font-family: 'Space Grotesk', monospace;
    background: var(--local-card-bg);
    color: var(--muted);
    border: 1px solid var(--local-card-bdr);
    flex-shrink: 0;
  }

  /* ── ANSWER PILLS ── */
  .answer-pill {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.65rem 0.9rem;
    border-radius: 14px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  .answer-pill-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; opacity: 0.7; flex-shrink: 0; text-transform: uppercase; }

  /* ── EXPLANATION BOX ── */
  .result-explanation {
    padding: 0.85rem 1rem;
    border-radius: 14px;
    background: rgba(124,58,237,0.06);
    border: 2px solid rgba(124,58,237,0.15);
    margin-top: 0.85rem;
  }
  .result-explanation-label {
    font-size: 0.68rem; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--violet-l); margin-bottom: 0.4rem;
    font-family: 'Space Grotesk', sans-serif;
  }
  .result-explanation-text { font-size: 0.82rem; line-height: 1.65; color: var(--color-text-secondary); font-weight: 600; }

  /* ── SKELETON ── */
  .result-skel {
    background: linear-gradient(90deg, var(--color-surface-border) 25%, var(--color-surface-hover) 50%, var(--color-surface-border) 75%);
    background-size: 200% 100%;
    border-radius: 20px;
    border: 2px solid var(--color-surface-border);
    animation: skel-shine 1.6s ease infinite;
  }
  @keyframes skel-shine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── MARKS CHIP ── */
  .marks-chip {
    display: inline-flex;
    padding: 0.15rem 0.5rem;
    border-radius: 99px;
    font-size: 0.65rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    background: var(--local-card-bg);
    color: var(--muted);
    border: 2px solid var(--local-card-bdr);
  }

  /* ── CONFETTI PARTICLE ── */
  @keyframes confetti-fall {
    0%  { transform: translateY(0) rotate(0deg); opacity: 1; }
    100%{ transform: translateY(120px) rotate(720deg); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

/* ─── Animated percentage counter ─────────────────────────────────────────── */
function AnimatedPct({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let v = 0;
    const end = parseFloat(target) || 0;
    const step = end / (900 / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= end) { setVal(end); clearInterval(t); } else setVal(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return <>{val.toFixed(1)}</>;
}

/* ─── Score Ring SVG ───────────────────────────────────────────────────────── */
function ScoreRing({ percentage, passed }) {
  const R = 58;
  const circ = 2 * Math.PI * R;
  const offset = circ - (percentage / 100) * circ;

  const stroke = passed
    ? 'url(#ring-green)'
    : percentage >= 50
    ? 'url(#ring-amber)'
    : 'url(#ring-red)';

  const glowColor = passed ? 'rgba(16,185,129,0.4)' : percentage >= 50 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)';
  const textColor = passed ? 'var(--green)' : percentage >= 50 ? 'var(--amber)' : 'var(--red)';

  return (
    <div className="score-ring-wrap">
      <svg className="score-ring-svg" width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <linearGradient id="ring-green" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
          <linearGradient id="ring-amber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="ring-red" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle className="score-ring-bg" cx="70" cy="70" r={R} />
        <motion.circle
          className="score-ring-fill"
          cx="70" cy="70" r={R}
          stroke={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        />
      </svg>
      <div className="score-ring-inner">
        <span className="score-ring-pct" style={{ color: textColor, textShadow: `0 0 30px ${glowColor}` }}>
          <AnimatedPct target={percentage} />%
        </span>
        <span className="score-ring-label">Score</span>
      </div>
    </div>
  );
}

/* ─── Confetti (only on pass) ──────────────────────────────────────────────── */
function Confetti() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 0.8,
    color: ['#7C3AED','#00D4FF','#C4B5FD','#F59E0B','#10B981'][i % 5],
    size: 6 + Math.random() * 6,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          top: '10%',
          left: p.left,
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: '2px',
          animation: `confetti-fall 1.8s ease-out ${p.delay}s both`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────────────────────────────────────── */
export default function ResultPage() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const user = authUser || (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();

  const { data: result, loading } = useApi(
    () => studentApi.getMyResult(examId), null, [examId]
  );

  if (loading) {
    return (
      <PageWrapper>
        <style>{CSS}</style>
        <div className="result-root" style={{ padding: '1.5rem', maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="result-skel" style={{ height: 44, width: 140 }} />
          <div className="result-skel" style={{ height: 360 }} />
          <div className="result-skel" style={{ height: 28, width: 220 }} />
          {[1,2,3,4,5].map((i) => <div key={i} className="result-skel" style={{ height: 120 }} />)}
        </div>
      </PageWrapper>
    );
  }

  if (!result) {
    return (
      <PageWrapper>
        <style>{CSS}</style>
        <div className="result-root" style={{ padding: '2rem', maxWidth: '640px', margin: '4rem auto 0', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--card-bg)',
              border: '2px solid var(--card-bdr)',
              borderRadius: '28px',
              padding: '3rem 2rem',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(124, 58, 237, 0.15)', border: '2px solid rgba(124, 58, 237, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', color: '#A78BFA'
            }}>
              <Trophy size={32} />
            </div>

            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'var(--cream)', marginBottom: '0.65rem' }}>
              No Result Found Yet
            </h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.75rem', fontWeight: 600, lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 1.75rem' }}>
              You haven't submitted an attempt for this exam yet, or the submission record is still processing.
            </p>

            <button
              type="button"
              className="result-back"
              style={{
                padding: '0.75rem 1.8rem',
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)'
              }}
              onClick={() => navigate((user?.role === 'teacher' || user?.role === 'admin') ? '/exams' : '/student/dashboard')}
            >
              <ArrowLeft size={16} /> Return to Dashboard
            </button>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  const { submission, breakdown, rank, total_submissions } = result;
  const passed        = submission.passed;
  const percentage    = parseFloat(submission.percentage ?? 0);
  const examEnded     = submission.exam_status === 'ended'
                        || (submission.exam_ends_at ? new Date() >= new Date(submission.exam_ends_at) : true);
  const showRank      = examEnded && rank != null;

  const hasPassing = submission.passed !== null;
  const heroGlow   = passed ? 'rgba(16,185,129,0.2)' : !hasPassing ? 'rgba(124,58,237,0.15)' : percentage >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)';
  const heroBorder = passed ? 'var(--local-green)' : !hasPassing ? 'var(--local-violet-l)'  : percentage >= 50 ? 'var(--local-amber)'  : 'var(--local-red)';
  const verdictBg  = passed ? 'rgba(16,185,129,0.08)' : !hasPassing ? 'rgba(124,58,237,0.08)' : 'rgba(239,68,68,0.08)';
  const verdictBdr = passed ? 'var(--local-green)'  : !hasPassing ? 'var(--local-violet-l)'  : 'var(--local-red)';
  const verdictClr = passed ? 'var(--local-green)' : !hasPassing ? 'var(--local-violet-l)' : 'var(--local-red)';

  const isStructureExam = breakdown && breakdown.length > 0 && breakdown.every(q => q.question_type === 'structure' || q.question_type === 'photo');

  if (isStructureExam) {
    return (
      <PageWrapper>
        <style>{CSS}</style>
        <div className="result-root" style={{ padding: '1.5rem', maxWidth: '640px', margin: '4rem auto 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <motion.div
            className="result-hero"
            style={{ borderColor: 'rgba(124,58,237,0.25)', padding: '3.5rem 2rem' }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="result-hero-blob result-hero-blob-1" style={{ background: 'rgba(124,58,237,0.18)' }} />
            
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--local-card-bg)', border: '2px solid var(--local-violet-l)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem', boxShadow: '0 0 24px rgba(124,58,237,0.25)'
              }}>
                <Award size={36} color="var(--violet-l)" />
              </div>

              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 700,
                background: 'linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '0.65rem'
              }}>
                Practice Attempt Submitted!
              </h2>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem', fontWeight: 700, fontStyle: 'italic' }}>
                {submission.exam_title}
              </p>

              <div style={{
                background: 'var(--local-card-bg)', border: '2px solid var(--local-card-bdr)',
                borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem',
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.6rem'
              }}>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
                  ✨ <strong>Great work completing this practice exam!</strong>
                </p>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  This exam contains structure-drawing questions. These questions are designed to help you practice drawing chemical structures and diagrams, which are not evaluated by automated pass/fail scores.
                </p>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Keep attempting more exams on your dashboard to strengthen your skills, build muscle memory, and master chemical structures!
                </p>
              </div>

              <button 
                type="button" 
                className="result-back" 
                style={{ padding: '0.65rem 2rem', background: 'linear-gradient(135deg, var(--violet), #4F46E5)', color: '#fff', border: 'none', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }} 
                onClick={() => navigate(user?.role === 'student' ? '/student/dashboard' : '/exams')}
              >
                Explore More Exams
              </button>

            </div>
          </motion.div>

        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <style>{CSS}</style>
      <div className="result-root" style={{ padding: '1.5rem', maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── Back ── */}
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <button className="result-back" onClick={() => navigate(user?.role === 'student' ? '/student/dashboard' : '/exams')}>
            <ArrowLeft size={14} /> Back to Exams
          </button>
        </motion.div>

        {/* ── Score hero ── */}
        <motion.div
          className="result-hero"
          style={{ borderColor: heroBorder }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* Background glow */}
          <div className="result-hero-blob result-hero-blob-1" style={{ background: heroGlow }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${heroGlow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

          {passed && <Confetti />}

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Score ring */}
            <ScoreRing percentage={percentage} passed={passed} />

            {/* Exam title */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: '1rem', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '0.75rem', color: 'var(--cream)' }}
            >
              {submission.exam_title}
            </motion.p>

            {/* Verdict badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}>
              <span className="result-verdict" style={{ background: verdictBg, border: `1px solid ${verdictBdr}`, color: verdictClr }}>
                {passed ? <Trophy size={14} /> : !hasPassing ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {passed ? 'Passed' : !hasPassing ? 'Completed' : 'Failed'}
              </span>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="result-stats-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {[
                { label: 'Score',     val: submission.score,       color: 'var(--cream)' },
                { label: 'Total',     val: submission.total_marks ?? '-', color: 'var(--cream)' },
                submission.passing_marks && { label: 'Pass mark', val: submission.passing_marks, color: 'var(--muted)' },
              ].filter(Boolean).map((s, i) => (
                <div key={i} className="result-stat">
                  <div className="result-stat-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="result-stat-label">{s.label}</div>
                </div>
              ))}
              <div className="result-stat">
                {showRank ? (
                  <>
                    <div className="result-stat-val" style={{ color: 'var(--violet-l)' }}>#{rank}</div>
                    <div className="result-stat-label">of {total_submissions}</div>
                  </>
                ) : (
                  <>
                    <div className="result-stat-val" style={{ color: 'var(--muted)', fontSize: '1rem' }}>
                      <Award size={18} style={{ display: 'inline', verticalAlign: 'middle', marginBottom: 2 }} />
                    </div>
                    <div className="result-stat-label" style={{ whiteSpace: 'nowrap' }}>Rank after exam ends</div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Question breakdown ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="result-section-head">
            <Target size={16} color="var(--violet-l)" />
            <span>Question Breakdown</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500, marginLeft: 'auto', fontFamily: 'Inter' }}>
              {(breakdown ?? []).filter(q => q.is_correct).length} / {(breakdown ?? []).length} correct
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(breakdown ?? []).map((q, i) => {
              const answered = q.student_answer != null;
              const correct  = q.is_correct === true;
              const wrong    = answered && !correct;

              const accentColor = correct ? 'var(--green)' : wrong ? 'var(--red)' : 'rgba(255,255,255,0.15)';
              const cardGlow    = correct ? 'rgba(16,185,129,0.05)' : wrong ? 'rgba(239,68,68,0.05)' : 'transparent';

              return (
                <motion.div
                  key={q.id}
                  className="result-qcard"
                  style={{ background: `linear-gradient(135deg, ${cardGlow}, var(--card-bg))` }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.04, duration: 0.25 }}
                >
                  {/* Left accent bar */}
                  <div className="result-qcard-accent" style={{ background: accentColor }} />

                  <div style={{ paddingLeft: '0.25rem' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                        <span className="result-qbadge">{i + 1}</span>
                        {q.question_text && <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-text-primary)', fontWeight: 600 }}>{q.question_text}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <span className="marks-chip">{q.marks}m</span>
                        {correct
                          ? <CheckCircle size={16} color="var(--green)" />
                          : answered
                          ? <XCircle size={16} color="var(--red)" />
                          : <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>—</span>}
                      </div>
                    </div>

                    {/* Image Display for Questions */}
                    {q.image_url && (
                      <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'center' }}>
                        <img 
                          src={q.image_url} 
                          alt="Question illustration" 
                          style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '12px', border: '2px solid var(--card-bdr)', display: 'block' }} 
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Answer pills */}
                    {q.question_type !== 'photo' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                        <div
                          className="answer-pill"
                          style={
                            correct
                              ? { background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)', color: 'var(--green)' }
                              : wrong
                              ? { background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.22)', color: 'var(--red)' }
                              : { background: 'var(--local-card-bg)', border: '2px solid var(--local-card-bdr)', color: 'var(--color-text-secondary)' }
                          }
                        >
                          <span className="answer-pill-label">Your answer</span>
                          <span style={{ fontWeight: 600 }}>{q.student_answer ?? 'Not answered'}</span>
                        </div>

                        {!correct && q.correct_answer && (
                          <div className="answer-pill" style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)', color: 'var(--green)' }}>
                            <span className="answer-pill-label">Correct</span>
                            <span style={{ fontWeight: 600 }}>{q.correct_answer}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <motion.div
                        className="result-explanation"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.6 + i * 0.04 }}
                      >
                        <div className="result-explanation-label">Explanation</div>
                        <p className="result-explanation-text">{q.explanation}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
}