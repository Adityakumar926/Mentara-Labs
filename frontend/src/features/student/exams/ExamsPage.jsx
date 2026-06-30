import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, ChevronRight, Radio, PlayCircle, AlertCircle, CalendarClock, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .exams-root {
    --navy:       var(--local-navy, #0A0E1A);
    --navy2:      var(--local-navy2, #0F1629);
    --violet:     #7C3AED;
    --violet-l:   var(--local-violet-l, #9D6FEF);
    --cyan:       var(--local-cyan, #00D4FF);
    --cream:      var(--local-cream, #F5F0E8);
    --lavender:   var(--local-lavender, #C4B5FD);
    --amber:      var(--local-amber, #F59E0B);
    --green:      var(--local-green, #10B981);
    --red:        var(--local-red, #EF4444);
    --card-bg:    var(--local-card-bg, rgba(255,255,255,0.04));
    --card-bdr:   var(--local-card-bdr, rgba(255,255,255,0.08));
    --muted:      var(--local-muted, rgba(245,240,232,0.45));
    font-family: 'Inter', sans-serif;
    color: var(--cream);
    overflow-x: hidden;
  }
  .exams-root *, .exams-root *::before, .exams-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .exams-header {
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
  .exams-header-image {
    width: 320px;
    height: 130px;
    object-fit: cover;
    border-radius: 16px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  @media (max-width: 767px) {
    .exams-header-image { display: none; }
  }
  .exams-header-blob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .exams-blob-1 {
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%);
    top: -60px; left: -40px;
  }
  .exams-blob-2 {
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
    bottom: -50px; right: -20px;
  }
  .exams-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(34, 211, 238, 0.08); border: 1px solid rgba(34, 211, 238, 0.2);
    padding: 0.3rem 0.85rem; border-radius: 50px;
    font-size: 0.65rem; font-weight: 700; color: var(--cyan);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.6rem;
  }
  .exams-page-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.3rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.3rem;
  }
  .exams-page-sub { font-size: 0.8rem; color: var(--muted); }

  /* ── TAB STRIP ── */
  .exams-tab-strip {
    display: flex; gap: 0.25rem;
    padding: 0.3rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px;
    width: fit-content;
  }
  .exams-tab-btn {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.55rem 1.2rem;
    border-radius: 14px;
    border: none; background: transparent;
    color: var(--muted);
    font-size: 0.82rem; font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    position: relative;
    transition: color 0.2s;
    white-space: nowrap;
  }
  .exams-tab-btn.active { color: #fff; }
  .exams-tab-indicator {
    position: absolute; inset: 0;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(124, 58, 237, 0.15));
    border: 1px solid rgba(34, 211, 238, 0.3);
    box-shadow: 0 0 24px rgba(34,211,238,0.25);
    z-index: -1;
  }

  /* ── EXAM GRID ── */
  .exams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.1rem;
  }

  /* ── EXAM CARD ── */
  .exam-card {
    position: relative;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 1.5rem;
    display: flex; flex-direction: column; gap: 0.75rem;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    overflow: hidden;
    text-decoration: none; color: inherit;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
  }
  .exam-card:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 12px 30px -10px rgba(34, 211, 238, 0.15), 0 4px 30px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }
  .exam-card.dimmed { opacity: 0.65; }

  /* strip by status */
  .exam-card-strip {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    border-radius: 24px 24px 0 0;
  }
  .exam-strip-scheduled { background: linear-gradient(90deg, var(--cyan), rgba(0,212,255,0)); }
  .exam-strip-live      { background: linear-gradient(90deg, var(--green), rgba(16,185,129,0)); }
  .exam-strip-history   { background: linear-gradient(90deg, var(--violet-l), transparent); }

  /* glow on hover */
  .exam-card-glow {
    position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none;
    width: 180px; height: 180px; top: -60px; right: -40px; opacity: 0;
    background: radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%);
    transition: opacity 0.4s;
  }
  .exam-card:hover .exam-card-glow { opacity: 1; }

  /* live pulse indicator */
  .ep-live-pulse {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 8px var(--green);
    animation: ep-blink 1.4s ease infinite;
    flex-shrink: 0;
  }
  @keyframes ep-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .exam-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
  .exam-card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1rem; font-weight: 700; color: var(--cream);
    line-height: 1.35; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  /* status pill */
  .ep-status {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 0.22rem 0.65rem; border-radius: 50px;
    white-space: nowrap; flex-shrink: 0;
  }
  .ep-status-scheduled { background: rgba(0,212,255,0.1);    border: 1px solid rgba(0,212,255,0.25);  color: var(--cyan); }
  .ep-status-live      { background: rgba(16,185,129,0.15);  border: 1px solid rgba(16,185,129,0.3);  color: #34D399; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
  .ep-status-ended     { background: rgba(245,240,232,0.04); border: 1px solid rgba(245,240,232,0.08); color: rgba(245,240,232,0.3); }

  /* meta */
  .exam-card-meta {
    display: flex; flex-direction: column; gap: 0.2rem;
    font-size: 0.78rem; color: var(--local-violet-l);
    font-weight: 600;
  }

  /* foot */
  .exam-card-foot {
    display: flex; align-items: center; gap: 0.8rem;
    padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.07);
    margin-top: auto; font-size: 0.72rem; color: var(--muted);
    font-weight: 500;
  }
  .exam-card-foot span { display: flex; align-items: center; gap: 0.35rem; }

  /* Buttons and links */
  .exam-attempt-btn {
    margin-left: auto;
    background: rgba(34, 211, 238, 0.08);
    border: 1px solid rgba(34, 211, 238, 0.2);
    color: #22d3ee;
    border-radius: 50px;
    padding: 0.25rem 0.75rem;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif;
    display: flex; align-items: center; gap: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .exam-attempt-btn:hover {
    background: rgba(34, 211, 238, 0.16);
    border-color: #22d3ee;
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.25);
  }

  .exam-locked-btn {
    margin-left: auto;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.2);
    color: var(--amber);
    border-radius: 50px;
    padding: 0.25rem 0.75rem;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif;
    display: flex; align-items: center; gap: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .exam-view-btn {
    margin-left: auto;
    color: var(--local-violet-l);
    font-weight: 700;
    font-size: 0.75rem;
    font-family: 'Space Grotesk', sans-serif;
    display: flex; align-items: center; gap: 0.15rem;
    transition: color 0.2s;
  }
  .exam-card:hover .exam-view-btn {
    color: #22d3ee;
  }

  /* ── ALERT BANNER ── */
  .alert-banner {
    display: flex; align-items: flex-start; gap: 0.75rem;
    padding: 0.9rem 1.1rem;
    border-radius: 16px;
    font-size: 0.78rem; line-height: 1.6;
  }

  /* ── STATS GRID ── */
  .history-stat-card {
    padding: 1.1rem 1rem;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 18px;
    text-align: center;
    transition: border-color 0.2s, transform 0.2s;
  }
  .history-stat-card:hover { border-color: var(--violet); transform: translateY(-2px); }
  .history-stat-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.6rem; font-weight: 700;
  }
  .history-stat-label { font-size: 0.7rem; color: var(--muted); margin-top: 0.2rem; font-weight: 500; letter-spacing: 0.04em; }

  /* ── HISTORY SCORE CIRCLE ── */
  .score-circle {
    font-size: 0.72rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    padding: 0.2rem 0.6rem;
    border-radius: 50px;
  }

  /* ── SKELETON ── */
  .exam-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.06);
    animation: skel-shine 1.6s ease infinite;
  }
  @keyframes skel-shine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── EMPTY ── */
  .exams-empty {
    padding: 3rem 2rem;
    text-align: center;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
  }
  .exams-empty-icon {
    width: 56px; height: 56px; border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.2);
  }
  .exams-empty-title { font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 700; margin-bottom: 0.4rem; }
  .exams-empty-sub { font-size: 0.82rem; color: var(--muted); line-height: 1.6; max-width: 320px; margin: 0 auto; }

  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }

  /* ── FILTERS ROW ── */
  .exams-filters-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0.85rem 1.25rem;
    border-radius: 20px;
    margin-bottom: 0.5rem;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .exams-filter-select {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--cream);
    padding: 0.55rem 1.1rem;
    border-radius: 12px;
    font-size: 0.78rem;
    font-weight: 600;
    outline: none;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 150px;
  }
  .exams-filter-select:focus {
    border-color: var(--cyan);
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.2);
  }
  .exams-filter-select option {
    background: #09090b;
    color: var(--cream);
  }
  .exams-filter-btn-group {
    display: flex;
    gap: 0.25rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 0.25rem;
    border-radius: 12px;
  }
  .exams-filter-btn {
    border: none;
    background: transparent;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-size: 0.74rem;
    font-weight: 700;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .exams-filter-btn:hover {
    color: var(--cream);
  }
  .exams-filter-btn.active {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.08);
  }

  /* ── Light Mode Overrides ── */
  .light .exams-tab-btn.active {
    color: #FFFFFF !important;
  }
  .light .exams-tab-indicator {
    background: linear-gradient(135deg, #0891B2 0%, #4F46E5 100%);
    border: 1px solid #4F46E5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  }
  .light .exams-filters-row {
    background: #FFFFFF;
    border-color: #E2E8F0;
  }
  .light .exams-filter-select {
    background: #F1F5F9;
    border-color: #CBD5E1;
    color: #0F172A;
  }
  .light .exams-filter-select option {
    background: #FFFFFF;
    color: #0F172A;
  }
  .light .exams-filter-btn-group {
    background: #F1F5F9;
    border-color: #CBD5E1;
  }
  .light .exams-filter-btn {
    color: #475569;
  }
  .light .exams-filter-btn:hover {
    color: #0F172A;
  }
  .light .exams-filter-btn.active {
    color: #FFFFFF !important;
    background: linear-gradient(135deg, #0891B2 0%, #4F46E5 100%) !important;
  }
  .light .exam-card {
    background: #F3F4FD;
    border-color: #D2D6FF;
  }
  .light .exam-card:hover {
    border-color: #B2B9FF;
    background: #EBEFFF;
    box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.08);
  }
  .light .exam-card-title {
    color: #0F172A;
  }
  .light .exam-card-foot {
    border-top: 1px solid #D2D6FF !important;
  }
  .light .exams-header {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(124, 58, 237, 0.18) 60%, rgba(248, 250, 252, 0.8) 100%);
    border-color: #D2D6FF;
  }
`;

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

/* ─── sub-components ───────────────────────────────────────────────────────── */
function PingDot({ color = '#EF4444', bgColor = '#EF4444' }) {
  return (
    <span className="ping-dot">
      <span className="ping-dot-inner ping-dot-ring" style={{ background: color, opacity: 0.6 }} />
      <span className="ping-dot-inner" style={{ background: bgColor }} />
    </span>
  );
}

function ExamSkeleton() {
  return (
    <div className="exams-grid">
      {[1,2,3].map((i) => <div key={i} className="exam-skel" style={{ height: 160 }} />)}
    </div>
  );
}

function ExamsEmpty({ icon: Icon, title, description }) {
  return (
    <motion.div className="exams-empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="exams-empty-icon"><Icon size={24} color="var(--violet-l)" /></div>
      <p className="exams-empty-title">{title}</p>
      <p className="exams-empty-sub">{description}</p>
    </motion.div>
  );
}

function AlertBanner({ color, bg, border, icon: Icon, children }) {
  return (
    <div className="alert-banner" style={{ background: bg, border: `1px solid ${border}` }}>
      <Icon size={14} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ color, lineHeight: 1.65 }}>{children}</p>
    </div>
  );
}

function LiveExamCard({ exam, idx }) {
  const attempted = exam.already_attempted;
  const { user } = useAuthStore();
  const locked = exam.is_premium && !user?.is_premium;

  const inner = (
    <div className={clsx('exam-card', (attempted || locked) && 'dimmed')}>
      <div className="exam-card-strip exam-strip-live" />
      <div className="exam-card-glow" />

      <div className="exam-card-head">
        <p className="exam-card-title">{exam.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {locked ? (
            <span className="ep-status ep-status-scheduled" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)', color: 'var(--amber)' }}><Lock size={10} />Locked</span>
          ) : (
            <span className="ep-status ep-status-live" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="ep-live-pulse" />
              LIVE
            </span>
          )}
        </div>
      </div>

      {(exam.subject_name || exam.topic_name) && (
        <div className="exam-card-meta">
          <span>
            {exam.subject_name}
            {exam.topic_name && ` • ${exam.topic_name}`}
          </span>
        </div>
      )}

      <div className="exam-card-foot">
        <span><Clock size={11} style={{ color: 'var(--cyan)' }} />{exam.duration_minutes ? `${exam.duration_minutes}m` : 'Untimed'}</span>
        {exam.question_count > 0 && <span>{exam.question_count} Qs</span>}
        {attempted ? (
          <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--muted)' }}>Submitted</span>
        ) : locked ? (
          <span className="exam-locked-btn"><Lock size={11} />Premium</span>
        ) : (
          <span className="exam-attempt-btn"><PlayCircle size={12} />Attempt</span>
        )}
      </div>
    </div>
  );

  const handleClick = (e) => {
    if (locked) {
      e.preventDefault();
      toast.error('This is a premium exam. Please upgrade to premium to attempt.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07, duration: 0.25 }}
    >
      {attempted ? (
        inner
      ) : locked ? (
        <div onClick={handleClick} style={{ cursor: 'pointer' }}>{inner}</div>
      ) : (
        <Link to={`/exams/${exam.id}/take`} style={{ textDecoration: 'none' }}>{inner}</Link>
      )}
    </motion.div>
  );
}

function ScheduledExamCard({ exam, idx }) {
  const { user } = useAuthStore();
  const locked = exam.is_premium && !user?.is_premium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07, duration: 0.25 }}
    >
      <div className={clsx('exam-card', locked && 'dimmed')}>
        <div className="exam-card-strip exam-strip-scheduled" />
        <div className="exam-card-glow" />

        <div className="exam-card-head">
          <p className="exam-card-title">{exam.title}</p>
          <span className="ep-status ep-status-scheduled">Scheduled</span>
        </div>

        {(exam.subject_name || exam.topic_name) && (
          <div className="exam-card-meta">
            <span>
              {exam.subject_name}
              {exam.topic_name && ` • ${exam.topic_name}`}
            </span>
          </div>
        )}

        <div className="exam-card-foot">
          <span><Clock size={11} style={{ color: 'var(--cyan)' }} />{exam.duration_minutes ? `${exam.duration_minutes}m` : 'Untimed'}</span>
          {exam.scheduled_at && <span style={{ marginLeft: 'auto', fontSize: '0.68rem' }}><CalendarClock size={10} style={{ color: 'var(--cyan)', marginRight: 3 }} />{fmtDateTime(exam.scheduled_at)}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function LiveTab({ exams, loading, isFiltered }) {
  if (loading) return <ExamSkeleton />;
  if (!exams.length) {
    if (isFiltered) {
      return <ExamsEmpty icon={Radio} title="No matching live exams" description="Adjust your filters or try another subject/topic." />;
    }
    return <ExamsEmpty icon={Radio} title="No live exams right now" description="When your batch has an active exam, it'll appear here. Check back later." />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AlertBanner color="#EF4444" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)" icon={AlertCircle}>
        Live exams are time-bound. Once you start, the timer begins and you cannot pause. Make sure you have a stable connection before attempting.
      </AlertBanner>
      <div className="exams-grid">
        {exams.map((exam, idx) => <LiveExamCard key={exam.id} exam={exam} idx={idx} />)}
      </div>
    </div>
  );
}

function ScheduledTab({ exams, loading, isFiltered }) {
  if (loading) return <ExamSkeleton />;
  if (!exams.length) {
    if (isFiltered) {
      return <ExamsEmpty icon={CalendarClock} title="No matching upcoming exams" description="Adjust your filters or try another subject/topic." />;
    }
    return <ExamsEmpty icon={CalendarClock} title="No upcoming exams" description="Scheduled exams from your enrolled batches will appear here." />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AlertBanner color="var(--violet-l)" bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.2)" icon={AlertCircle}>
        These exams are scheduled by your batch admins. They'll go live automatically at the scheduled time.
      </AlertBanner>
      <div className="exams-grid">
        {exams.map((exam, idx) => <ScheduledExamCard key={exam.id} exam={exam} idx={idx} />)}
      </div>
    </div>
  );
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useState(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (!end) return;
    const step = end / (700 / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(t); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  });
  return <>{display}</>;
}

function HistoryTab({ history, loading, isFiltered }) {
  const historyList = history ?? [];
  const passed   = historyList.filter((r) => r.passed).length;
  const avgScore = historyList.length
    ? (historyList.reduce((a, r) => a + parseFloat(r.percentage || 0), 0) / historyList.length).toFixed(1)
    : null;

  if (loading) return <ExamSkeleton />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {historyList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Exams Taken', value: historyList.length, color: 'var(--cream)' },
            { label: 'Avg Score',   value: avgScore ? `${avgScore}%` : '—', color: 'var(--violet-l)' },
            { label: 'Passed',      value: passed, color: 'var(--green)' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="history-stat-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="history-stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="history-stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {historyList.length === 0 ? (
        isFiltered ? (
          <ExamsEmpty icon={FileText} title="No matching past exams" description="Adjust your filters or try another subject/topic." />
        ) : (
          <ExamsEmpty icon={FileText} title="No exams taken yet" description="When your batch has live exams, they'll appear here after you attempt them." />
        )
      ) : (
        <div className="exams-grid">
          {historyList.map((r, idx) => {
            const pct       = r.percentage != null ? Math.round(r.percentage) : null;
            const pctColor  = r.is_structure_only ? 'var(--violet-l)' : r.passed ? 'var(--green)' : 'var(--red)';
            const pctBg     = r.is_structure_only ? 'rgba(124,58,237,0.12)' : r.passed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
            const scoreText = r.is_structure_only ? 'Prc' : pct != null ? `${pct}%` : '—';
            return (
              <motion.div
                key={r.submission_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/exams/${r.exam_id}/result`} style={{ textDecoration: 'none' }}>
                  <div className="exam-card">
                    <div className="exam-card-strip exam-strip-history" />
                    <div className="exam-card-glow" />

                    <div className="exam-card-head">
                      <p className="exam-card-title">{r.title}</p>
                      <div className="score-circle" style={{ background: pctBg, color: pctColor, border: `1px solid ${pctColor}` }}>
                        {scoreText}
                      </div>
                    </div>

                    {(r.subject_name || r.topic_name) && (
                      <div className="exam-card-meta">
                        <span>
                          {r.subject_name}
                          {r.topic_name && ` • ${r.topic_name}`}
                        </span>
                      </div>
                    )}

                    <div className="exam-card-foot">
                      <span><Clock size={11} style={{ color: 'var(--cyan)' }} />{fmt(r.submitted_at)}</span>
                      {r.is_structure_only ? (
                        <span>Practice</span>
                      ) : (
                        <span>{r.score}/{r.total_marks ?? '-'} marks</span>
                      )}
                      {r.rank && !r.is_structure_only && <span style={{ color: 'var(--amber)' }}>Rank #{r.rank}</span>}
                      <span className="exam-view-btn">View <ChevronRight size={12} /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN PAGE ────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'live',      label: 'Live'      },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'history',   label: 'History'   },
];

export default function StudentExamsPage() {
  const [activeTab, setActiveTab] = useState('live');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedSubtopic, setSelectedSubtopic] = useState('all');
  const [attemptFilter, setAttemptFilter] = useState('all'); // 'all', 'attempted', 'not_attempted'

  const user = useAuthStore((s) => s.user);
  const curriculumId = user?.curriculum_id;

  const { data: liveRes,      loading: liveLoading      } = useApi(studentApi.getLiveExams);
  const { data: scheduledRes, loading: scheduledLoading } = useApi(studentApi.getScheduledExams);
  const { data: history,      loading: historyLoading   } = useApi(studentApi.getAllResults);

  // Fetch subjects from the enrolled curriculum
  const { data: curriculumSubjectsRes } = useApi(
    () => curriculumId ? studentApi.getCurriculumSubjects(curriculumId) : Promise.resolve(null),
    null,
    [curriculumId]
  );
  const curriculumSubjects = curriculumSubjectsRes ?? [];

  const liveList      = (liveRes?.data      ?? liveRes)      ?? [];
  const scheduledList = (scheduledRes?.data ?? scheduledRes) ?? [];
  const historyList   = history ?? [];

  // Find selected subject's ID to fetch its topics
  const selectedSubjectObj = useMemo(() => {
    if (selectedSubject === 'all') return null;
    const fromCurr = curriculumSubjects.find(s => s.name === selectedSubject);
    if (fromCurr) return fromCurr;
    const combinedExams = [...liveList, ...scheduledList, ...historyList];
    const fromExam = combinedExams.find(e => e.subject_name === selectedSubject);
    if (fromExam) return { id: fromExam.subject_id, name: fromExam.subject_name };
    return null;
  }, [selectedSubject, curriculumSubjects, liveList, scheduledList, historyList]);

  // Fetch topics for the selected subject
  const { data: subjectTopicsRes } = useApi(
    () => selectedSubjectObj?.id ? studentApi.getSubjectTopics(selectedSubjectObj.id) : Promise.resolve(null),
    null,
    [selectedSubjectObj?.id]
  );
  const subjectTopics = (subjectTopicsRes?.data ?? subjectTopicsRes) ?? [];

  // Fetch topics for all subjects in parallel when no subject is selected (for "All Subjects" option)
  const { data: allTopicsRes } = useApi(
    () => {
      if (curriculumSubjects.length === 0) return Promise.resolve([]);
      return Promise.all(
        curriculumSubjects.map(s => 
          studentApi.getSubjectTopics(s.id)
            .then(res => (res?.data ?? res ?? []))
            .catch(() => [])
        )
      ).then(arrays => arrays.flat());
    },
    [],
    [curriculumSubjects]
  );
  const allTopics = allTopicsRes ?? [];

  // Get unique subjects
  const uniqueSubjects = useMemo(() => {
    const subjectsFromCurriculum = curriculumSubjects.map(s => s.name);
    const combinedExams = [...liveList, ...scheduledList, ...historyList];
    const subjectsFromExams = combinedExams.map(e => e.subject_name);
    const set = new Set([...subjectsFromCurriculum, ...subjectsFromExams].filter(Boolean));
    return Array.from(set);
  }, [curriculumSubjects, liveList, scheduledList, historyList]);

  // Filter topics list into only parent topics (those without a parent_topic_id)
  const uniqueTopics = useMemo(() => {
    let rawTopics = selectedSubject === 'all' ? allTopics : subjectTopics;
    // Keep only root parent topics
    const parentTopics = rawTopics.filter(t => !t.parent_topic_id);
    
    // Also include root topics from exams
    const combinedExams = [...liveList, ...scheduledList, ...historyList];
    const filteredExams = selectedSubject === 'all' 
      ? combinedExams 
      : combinedExams.filter(e => e.subject_name === selectedSubject);
    
    const set = new Set([
      ...parentTopics.map(t => t.name),
      ...filteredExams.map(e => e.topic_name)
    ].filter(Boolean));
    return Array.from(set);
  }, [allTopics, subjectTopics, liveList, scheduledList, historyList, selectedSubject]);

  // Selected topic object (for subtopic logic)
  const selectedParentTopicObj = useMemo(() => {
    if (selectedTopic === 'all') return null;
    const rawTopics = selectedSubject === 'all' ? allTopics : subjectTopics;
    return rawTopics.find(t => t.name?.toLowerCase().trim() === selectedTopic.toLowerCase().trim());
  }, [selectedTopic, allTopics, subjectTopics, selectedSubject]);

  // Find all child subtopics belonging to selected parent topic
  const childSubtopics = useMemo(() => {
    if (selectedTopic === 'all' || !selectedParentTopicObj) return [];
    const rawTopics = selectedSubject === 'all' ? allTopics : subjectTopics;
    return rawTopics.filter(t => t.parent_topic_id === selectedParentTopicObj.id);
  }, [selectedTopic, selectedParentTopicObj, allTopics, subjectTopics, selectedSubject]);

  // Topic names matching range (includes parent topic name and all its subtopics)
  const allowedTopicNames = useMemo(() => {
    if (selectedTopic === 'all') return null;
    const names = [selectedTopic.toLowerCase().trim()];
    if (selectedParentTopicObj?.id) {
      const rawTopics = selectedSubject === 'all' ? allTopics : subjectTopics;
      const children = rawTopics.filter(t => t.parent_topic_id === selectedParentTopicObj.id);
      names.push(...children.map(c => c.name?.toLowerCase().trim()));
    }
    return names;
  }, [selectedTopic, selectedParentTopicObj, allTopics, subjectTopics, selectedSubject]);

  // Filter function
  const filterExam = (exam, isHistory = false) => {
    const examSubject = exam.subject_name?.toLowerCase().trim();
    const selectedSub = selectedSubject.toLowerCase().trim();
    const examTopic = exam.topic_name?.toLowerCase().trim();
    const selectedTop = selectedTopic.toLowerCase().trim();

    if (selectedSubject !== 'all' && examSubject !== selectedSub) return false;
    
    // Topic & subtopic matching
    if (selectedTopic !== 'all') {
      console.log("EXAM FILTER DEBUG:", {
        title: exam.title,
        examTopic,
        selectedTopic: selectedTop,
        allowedTopicNames,
        matchDirect: examTopic === selectedTop,
        matchAllowed: allowedTopicNames?.includes(examTopic)
      });
      if (selectedSubtopic !== 'all') {
        // If a specific subtopic is selected, match it exactly
        if (examTopic !== selectedSubtopic.toLowerCase().trim()) return false;
      } else {
        // Otherwise, match parent topic or any of its child subtopics
        if (allowedTopicNames && !allowedTopicNames.includes(examTopic)) return false;
      }
    }
    
    const attempted = isHistory ? true : !!exam.already_attempted;
    if (attemptFilter === 'attempted' && !attempted) return false;
    if (attemptFilter === 'not_attempted' && attempted) return false;
    
    return true;
  };

  const filteredLive = useMemo(() => liveList.filter(e => filterExam(e, false)), [liveList, selectedSubject, selectedTopic, selectedSubtopic, attemptFilter, allowedTopicNames]);
  const filteredScheduled = useMemo(() => scheduledList.filter(e => filterExam(e, false)), [scheduledList, selectedSubject, selectedTopic, selectedSubtopic, attemptFilter, allowedTopicNames]);
  const filteredHistory = useMemo(() => historyList.filter(e => filterExam(e, true)), [historyList, selectedSubject, selectedTopic, selectedSubtopic, attemptFilter, allowedTopicNames]);

  return (
    <PageWrapper>
      <style>{CSS}</style>
      <div className="exams-root" style={{ padding: '1.5rem', maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Ambient background blur blobs */}
        <div className="exams-header-blob exams-blob-1" />
        <div className="exams-header-blob exams-blob-2" />

        {/* Page header */}
        <motion.div 
          className="exams-header"
          initial={{ opacity: 0, y: -12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
        >
          <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <div className="exams-eyebrow">
              <span className="eyebrow-dot" />
              Assessments
            </div>
            <h1 className="exams-page-title">My Exams</h1>
            <p className="exams-page-sub">Live, upcoming, and past exams from your batches</p>
          </div>
          <img src="/header-exams.png" alt="" className="exams-header-image" />
        </motion.div>

        {/* Filters and Tabs row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Tab strip */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="exams-tab-strip">
              {TABS.map(({ id, label }) => (
                <button key={id} className={clsx('exams-tab-btn', activeTab === id && 'active')} onClick={() => { setActiveTab(id); setSelectedSubject('all'); setSelectedTopic('all'); setAttemptFilter('all'); }}>
                  {activeTab === id && (
                    <motion.div className="exams-tab-indicator" layoutId="exams-tab-indicator" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
                  {id === 'live' && !liveLoading && liveList.length > 0 && (
                    <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <PingDot color="rgba(239,68,68,0.6)" bgColor={activeTab === 'live' ? '#fff' : '#EF4444'} />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: activeTab === 'live' ? 'rgba(255,255,255,0.85)' : '#EF4444' }}>{liveList.length}</span>
                    </span>
                  )}
                  {id === 'scheduled' && !scheduledLoading && scheduledList.length > 0 && (
                    <span style={{ position: 'relative', zIndex: 1, background: activeTab === 'scheduled' ? 'rgba(255,255,255,0.2)' : 'rgba(124,58,237,0.15)', padding: '0.1rem 0.45rem', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, color: activeTab === 'scheduled' ? '#fff' : 'var(--violet-l)' }}>
                      {scheduledList.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Filter controls row */}
        <motion.div 
          className="exams-filters-row"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Subject filter */}
          <select 
            className="exams-filter-select"
            value={selectedSubject}
            onChange={(e) => { 
              setSelectedSubject(e.target.value); 
              setSelectedTopic('all'); 
              setSelectedSubtopic('all'); 
            }}
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          {/* Topic filter */}
          <select 
            className="exams-filter-select"
            value={selectedTopic}
            onChange={(e) => { 
              setSelectedTopic(e.target.value); 
              setSelectedSubtopic('all'); 
            }}
          >
            <option value="all">All Topics</option>
            {uniqueTopics.map(top => (
              <option key={top} value={top}>{top}</option>
            ))}
          </select>

          {/* Subtopic filter */}
          {childSubtopics.length > 0 && (
            <select 
              className="exams-filter-select"
              value={selectedSubtopic}
              onChange={(e) => setSelectedSubtopic(e.target.value)}
            >
              <option value="all">All Subtopics</option>
              {childSubtopics.map(sub => (
                <option key={sub.id} value={sub.name}>{sub.name}</option>
              ))}
            </select>
          )}

          {/* Attempt filter button group */}
          <div className="exams-filter-btn-group">
            <button 
              className={clsx('exams-filter-btn', attemptFilter === 'all' && 'active')}
              onClick={() => setAttemptFilter('all')}
            >
              All
            </button>
            <button 
              className={clsx('exams-filter-btn', attemptFilter === 'attempted' && 'active')}
              onClick={() => setAttemptFilter('attempted')}
            >
              Attempted
            </button>
            <button 
              className={clsx('exams-filter-btn', attemptFilter === 'not_attempted' && 'active')}
              onClick={() => setAttemptFilter('not_attempted')}
            >
              Unattempted
            </button>
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + selectedSubject + selectedTopic + selectedSubtopic + attemptFilter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'live'      && <LiveTab      exams={filteredLive}      loading={liveLoading}      isFiltered={selectedSubject !== 'all' || selectedTopic !== 'all' || selectedSubtopic !== 'all' || attemptFilter !== 'all'} />}
            {activeTab === 'scheduled' && <ScheduledTab exams={filteredScheduled} loading={scheduledLoading} isFiltered={selectedSubject !== 'all' || selectedTopic !== 'all' || selectedSubtopic !== 'all' || attemptFilter !== 'all'} />}
            {activeTab === 'history'   && <HistoryTab   history={filteredHistory} loading={historyLoading}   isFiltered={selectedSubject !== 'all' || selectedTopic !== 'all' || selectedSubtopic !== 'all' || attemptFilter !== 'all'} />}
          </motion.div>
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
}