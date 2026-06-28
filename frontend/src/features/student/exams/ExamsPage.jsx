import { useState } from 'react';
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
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .exams-root {
    --navy:       var(--local-navy, #0A0E1A);
    --navy2:      var(--local-navy2, #0F1629);
    --violet:     #7C3AED;
    --violet-l:   #9D6FEF;
    --cyan:       #00D4FF;
    --cream:      var(--local-cream, #F5F0E8);
    --lavender:   #C4B5FD;
    --amber:      #F59E0B;
    --green:      #10B981;
    --red:        #EF4444;
    --card-bg:    var(--local-card-bg, rgba(255,255,255,0.04));
    --card-bdr:   var(--local-card-bdr, rgba(255,255,255,0.08));
    --muted:      var(--local-muted, rgba(245,240,232,0.45));
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .exams-root *, .exams-root *::before, .exams-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .exams-page-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.4rem, 3vw, 1.8rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .exams-page-sub { font-size: 0.85rem; color: var(--muted); margin-top: 0.2rem; }

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
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    box-shadow: 0 0 24px rgba(124,58,237,0.45);
    z-index: -1;
  }

  /* ── EXAM CARD ── */
  .exam-card {
    display: flex; align-items: center; gap: 1rem;
    padding: 1.1rem 1.25rem;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 20px;
    backdrop-filter: blur(16px);
    transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    color: inherit;
  }
  .exam-card.hoverable:hover {
    border-color: rgba(124,58,237,0.35);
    background: rgba(124,58,237,0.06);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(124,58,237,0.2);
  }
  .exam-card.live-hover:hover {
    border-color: rgba(239,68,68,0.35);
    background: rgba(239,68,68,0.05);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(239,68,68,0.2);
  }
  .exam-card.dimmed { opacity: 0.55; cursor: not-allowed; }

  /* ── ICON BOX ── */
  .exam-icon-box {
    width: 44px; height: 44px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* ── LIVE BADGE ── */
  .live-badge {
    display: inline-flex; align-items: center; gap: 0.35rem;
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.3);
    padding: 0.2rem 0.65rem;
    border-radius: 99px;
    font-size: 0.7rem; font-weight: 700;
    color: #EF4444;
    letter-spacing: 0.05em;
    font-family: 'Space Grotesk', sans-serif;
  }

  /* ── PING DOT ── */
  @keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }
  .ping-dot { position: relative; width: 8px; height: 8px; flex-shrink: 0; }
  .ping-dot-inner { position: absolute; inset: 0; border-radius: 50%; }
  .ping-dot-ring { animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite; }

  /* ── ATTEMPT LABEL ── */
  .attempt-label {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.78rem; font-weight: 600;
    color: var(--violet-l);
    font-family: 'Space Grotesk', sans-serif;
    white-space: nowrap;
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
  .history-stat-card:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-2px); }
  .history-stat-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.6rem; font-weight: 700;
  }
  .history-stat-label { font-size: 0.7rem; color: var(--muted); margin-top: 0.2rem; font-weight: 500; letter-spacing: 0.04em; }

  /* ── HISTORY SCORE CIRCLE ── */
  .score-circle {
    width: 46px; height: 46px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.72rem; font-weight: 700;
  }

  /* ── PASSED/FAILED PILL ── */
  .result-pill {
    display: inline-flex; padding: 0.22rem 0.7rem;
    border-radius: 99px;
    font-size: 0.7rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: 0.04em;
  }

  /* ── META ROW ── */
  .meta-row { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; font-size: 0.72rem; color: var(--muted); margin-top: 0.25rem; }
  .meta-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(245,240,232,0.2); flex-shrink: 0; }

  /* ── SKELETON ── */
  .exam-skel {
    height: 68px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    border-radius: 20px;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {[1,2,3].map((i) => <div key={i} className="exam-skel" />)}
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
    <div className={clsx('exam-card', !attempted && !locked && 'live-hover', (attempted || locked) && 'dimmed')} style={attempted ? {} : locked ? { borderColor: 'rgba(245,158,11,0.15)' } : { borderColor: 'rgba(239,68,68,0.15)' }}>
      {/* Icon */}
      <div className="exam-icon-box" style={{ background: attempted ? 'rgba(255,255,255,0.04)' : locked ? 'rgba(245,158,11,0.07)' : 'rgba(239,68,68,0.1)', border: `1px solid ${attempted ? 'rgba(255,255,255,0.07)' : locked ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
        {locked ? (
          <Lock size={18} color="var(--amber)" />
        ) : (
          <Radio size={18} color={attempted ? 'var(--muted)' : '#EF4444'} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.title}</p>
        <div className="meta-row">
          {exam.is_premium && <span style={{ color: 'var(--amber)', fontWeight: 700 }}>PREMIUM</span>}
          {exam.is_premium && <span className="meta-dot" />}
          {exam.subject_name && <span>{exam.subject_name}</span>}
          {exam.subject_name && exam.batch_name && <span className="meta-dot" />}
          {exam.batch_name && <span>{exam.batch_name}</span>}
          {exam.duration_minutes && <><span className="meta-dot" /><span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{exam.duration_minutes} min</span></>}
          {exam.total_marks && <><span className="meta-dot" /><span>{exam.total_marks} marks</span></>}
          {exam.ends_at && <><span className="meta-dot" /><span>Ends {fmtTime(exam.ends_at)}</span></>}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {locked ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} />Locked</span>
        ) : (
          <span className="live-badge"><PingDot color="rgba(239,68,68,0.6)" bgColor="#EF4444" />LIVE</span>
        )}
        {attempted ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Submitted</span>
        ) : locked ? (
          <span className="attempt-label" style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--amber)', borderColor: 'rgba(245,158,11,0.2)' }}><Lock size={12} />Premium</span>
        ) : (
          <span className="attempt-label"><PlayCircle size={13} />Attempt</span>
        )}
        {!attempted && !locked && <ChevronRight size={14} color="var(--muted)" />}
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
      <div className="exam-card" style={locked ? { borderColor: 'rgba(245,158,11,0.15)' } : { borderColor: 'rgba(124,58,237,0.15)' }}>
        <div className="exam-icon-box" style={{ background: locked ? 'rgba(245,158,11,0.07)' : 'rgba(124,58,237,0.1)', border: `1px solid ${locked ? 'rgba(245,158,11,0.25)' : 'rgba(124,58,237,0.25)'}` }}>
          {locked ? (
            <Lock size={18} color="var(--amber)" />
          ) : (
            <CalendarClock size={18} color="var(--violet-l)" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.title}</p>
          <div className="meta-row">
            {exam.is_premium && <span style={{ color: 'var(--amber)', fontWeight: 700 }}>PREMIUM</span>}
            {exam.is_premium && <span className="meta-dot" />}
            {exam.subject_name && <span>{exam.subject_name}</span>}
            {exam.batch_name && <><span className="meta-dot" /><span>{exam.batch_name}</span></>}
            {exam.duration_minutes && <><span className="meta-dot" /><span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{exam.duration_minutes} min</span></>}
            {exam.total_marks && <><span className="meta-dot" /><span>{exam.total_marks} marks</span></>}
            {exam.scheduled_at && <><span className="meta-dot" /><span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><CalendarClock size={10} />{fmtDateTime(exam.scheduled_at)}</span></>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LiveTab({ exams, loading }) {
  if (loading) return <ExamSkeleton />;
  if (!exams.length) return <ExamsEmpty icon={Radio} title="No live exams right now" description="When your batch has an active exam, it'll appear here. Check back later." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <AlertBanner color="#EF4444" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)" icon={AlertCircle}>
        Live exams are time-bound. Once you start, the timer begins and you cannot pause. Make sure you have a stable connection before attempting.
      </AlertBanner>
      {exams.map((exam, idx) => <LiveExamCard key={exam.id} exam={exam} idx={idx} />)}
    </div>
  );
}

function ScheduledTab({ exams, loading }) {
  if (loading) return <ExamSkeleton />;
  if (!exams.length) return <ExamsEmpty icon={CalendarClock} title="No upcoming exams" description="Scheduled exams from your enrolled batches will appear here." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <AlertBanner color="var(--violet-l)" bg="rgba(124,58,237,0.06)" border="rgba(124,58,237,0.2)" icon={AlertCircle}>
        These exams are scheduled by your batch admins. They'll go live automatically at the scheduled time.
      </AlertBanner>
      {exams.map((exam, idx) => <ScheduledExamCard key={exam.id} exam={exam} idx={idx} />)}
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

function HistoryTab({ history, loading }) {
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
        <ExamsEmpty icon={FileText} title="No exams taken yet" description="When your batch has live exams, they'll appear here after you attempt them." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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
                  <div className="exam-card hoverable">
                    <div className="score-circle" style={{ background: pctBg, color: pctColor }}>
                      {scoreText}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                      <div className="meta-row">
                        {r.subject_name && <span>{r.subject_name}</span>}
                        <span className="meta-dot" />
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{fmt(r.submitted_at)}</span>
                        <span className="meta-dot" />
                        {r.is_structure_only ? (
                          <span>Structure Practice</span>
                        ) : (
                          <span>{r.score}/{r.total_marks ?? '-'} marks</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                      {r.rank && !r.is_structure_only && <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>#{r.rank}</span>}
                      {r.is_structure_only ? (
                        <span className="result-pill" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--violet-l)', border: '1px solid rgba(124,58,237,0.25)' }}>
                          Practice
                        </span>
                      ) : r.passed === null ? (
                        <span className="result-pill" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--violet-l)', border: '1px solid rgba(124,58,237,0.25)' }}>
                          Completed
                        </span>
                      ) : (
                        <span className="result-pill" style={{ background: r.passed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: r.passed ? 'var(--green)' : 'var(--red)', border: `1px solid ${r.passed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                          {r.passed ? 'Passed' : 'Failed'}
                        </span>
                      )}
                      <ChevronRight size={14} color="var(--muted)" />
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

  const { data: liveRes,      loading: liveLoading      } = useApi(studentApi.getLiveExams);
  const { data: scheduledRes, loading: scheduledLoading } = useApi(studentApi.getScheduledExams);
  const { data: history,      loading: historyLoading   } = useApi(studentApi.getAllResults);

  const liveList      = (liveRes?.data      ?? liveRes)      ?? [];
  const scheduledList = (scheduledRes?.data ?? scheduledRes) ?? [];
  const historyList   = history ?? [];

  return (
    <PageWrapper>
      <style>{CSS}</style>
      <div className="exams-root" style={{ padding: '1.5rem', maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="exams-page-title">My Exams</h1>
          <p className="exams-page-sub">Live, upcoming, and past exams from your batches</p>
        </motion.div>

        {/* Tab strip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="exams-tab-strip">
            {TABS.map(({ id, label }) => (
              <button key={id} className={clsx('exams-tab-btn', activeTab === id && 'active')} onClick={() => setActiveTab(id)}>
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

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'live'      && <LiveTab      exams={liveList}      loading={liveLoading}      />}
            {activeTab === 'scheduled' && <ScheduledTab exams={scheduledList} loading={scheduledLoading} />}
            {activeTab === 'history'   && <HistoryTab   history={historyList} loading={historyLoading}   />}
          </motion.div>
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
}