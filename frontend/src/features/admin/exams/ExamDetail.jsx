import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, Radio, CheckCircle, Clock, Users, TrendingUp, Award } from 'lucide-react';
import { PageWrapper, Button, Badge, Skeleton, Modal, EmptyState, ConfirmDialog } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .ed-root {
    --navy:     #0A0E1A;
    --navy2:    #0F1629;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --red:      #EF4444;
    --muted:    rgba(245,240,232,0.45);
    --card-bg:  rgba(255,255,255,0.04);
    --card-bdr: rgba(255,255,255,0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
    min-height: 100vh;
  }
  .ed-root *, .ed-root *::before, .ed-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .ed-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, transparent 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 28px;
    padding: 2rem 2.5rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .ed-hblob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .ed-hblob-1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
    top: -90px; right: -70px;
    animation: ed-drift 11s ease-in-out infinite alternate;
  }
  .ed-hblob-2 {
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%);
    bottom: -40px; left: 25%;
    animation: ed-drift 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes ed-drift { from{transform:translate(0,0)} to{transform:translate(20px,-14px)} }
  @keyframes ed-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .ed-header-left { display: flex; align-items: flex-start; gap: 1rem; position: relative; z-index: 1; flex: 1; min-width: 0; }
  .ed-back-btn {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; min-width: 38px; border-radius: 12px;
    border: 1px solid var(--card-bdr);
    background: rgba(255,255,255,0.05); color: var(--muted); cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .ed-back-btn:hover { border-color: rgba(124,58,237,0.4); color: var(--lavender); background: rgba(124,58,237,0.1); }

  .ed-eyebrow {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.25rem 0.8rem; border-radius: 50px;
    font-size: 0.68rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.4rem;
  }
  .ed-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 7px var(--cyan);
    animation: ed-blink 2s ease infinite;
  }
  .ed-live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 9px var(--green);
    animation: ed-blink 1.2s ease infinite;
    flex-shrink: 0;
  }

  .ed-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.2rem, 2.5vw, 1.7rem); font-weight: 700; letter-spacing: -0.025em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.3rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .ed-title-row { display: flex; align-items: center; gap: 0.6rem; }
  .ed-subtitle { font-size: 0.78rem; color: var(--muted); display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .ed-subtitle span { display: flex; align-items: center; gap: 0.3rem; }

  /* status pill */
  .ed-status {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 0.22rem 0.65rem; border-radius: 50px;
    white-space: nowrap; flex-shrink: 0;
  }
  .ed-status-draft     { background: rgba(245,240,232,0.06); border: 1px solid rgba(245,240,232,0.1); color: var(--muted); }
  .ed-status-scheduled { background: rgba(0,212,255,0.1);    border: 1px solid rgba(0,212,255,0.25);  color: var(--cyan); }
  .ed-status-live      { background: rgba(16,185,129,0.15);  border: 1px solid rgba(16,185,129,0.3);  color: #34D399; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
  .ed-status-ended     { background: rgba(245,240,232,0.04); border: 1px solid rgba(245,240,232,0.08); color: rgba(245,240,232,0.3); }

  /* header action buttons */
  .ed-header-actions { display: flex; gap: 0.6rem; flex-shrink: 0; position: relative; z-index: 1; flex-wrap: wrap; }
  .ed-btn-outline {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(255,255,255,0.05); border: 1px solid var(--card-bdr);
    color: var(--cream); padding: 0.55rem 1.1rem; border-radius: 50px;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: border-color 0.2s, background 0.2s;
  }
  .ed-btn-outline:hover { border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.1); }
  .ed-btn-primary {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: linear-gradient(135deg, var(--violet), #5B21B6);
    color: #fff; border: none; padding: 0.55rem 1.1rem; border-radius: 50px;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 18px rgba(124,58,237,0.4);
  }
  .ed-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(124,58,237,0.6); }
  .ed-btn-danger {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
    color: #F87171; padding: 0.55rem 1.1rem; border-radius: 50px;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .ed-btn-danger:hover { background: rgba(239,68,68,0.25); box-shadow: 0 0 20px rgba(239,68,68,0.2); }
  .ed-btn-golive {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.15));
    border: 1px solid rgba(16,185,129,0.4); color: #34D399; padding: 0.55rem 1.1rem; border-radius: 50px;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 16px rgba(16,185,129,0.2);
  }
  .ed-btn-golive:hover { background: rgba(16,185,129,0.35); box-shadow: 0 0 28px rgba(16,185,129,0.35); }

  /* ── TABS ── */
  .ed-tabs {
    display: flex; gap: 0.35rem; padding: 0.35rem;
    background: rgba(255,255,255,0.04); border: 1px solid var(--card-bdr);
    border-radius: 16px; width: fit-content; margin-bottom: 1.25rem;
    backdrop-filter: blur(10px);
  }
  .ed-tab {
    display: flex; align-items: center; gap: 0.45rem;
    padding: 0.5rem 1.1rem; border-radius: 10px; border: none;
    font-size: 0.78rem; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif; text-transform: capitalize;
    transition: color 0.2s, background 0.2s, box-shadow 0.2s;
    color: var(--muted); background: transparent;
  }
  .ed-tab-active {
    background: linear-gradient(135deg, rgba(124,58,237,0.35), rgba(124,58,237,0.18));
    color: var(--lavender);
    box-shadow: 0 0 18px rgba(124,58,237,0.2), inset 0 0 0 1px rgba(124,58,237,0.3);
  }
  .ed-tab:not(.ed-tab-active):hover { color: var(--cream); background: rgba(255,255,255,0.04); }

  /* ── GLASS CARD ── */
  .ed-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    backdrop-filter: blur(14px);
    transition: border-color 0.3s;
    margin-bottom: 1rem;
  }
  .ed-card:last-child { margin-bottom: 0; }
  .ed-card:hover { border-color: rgba(124,58,237,0.18); }

  .ed-card-title {
    display: flex; align-items: center; gap: 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem; font-weight: 700; color: var(--cream);
    padding: 1.25rem 1.5rem 0;
    margin-bottom: 1rem;
  }
  .ed-card-title-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  /* ── STAT PILLS (results tab) ── */
  .ed-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.85rem;
    margin-bottom: 1.1rem;
  }
  .ed-stat {
    position: relative;
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 20px; padding: 1.1rem 1.2rem;
    overflow: hidden; backdrop-filter: blur(12px);
    transition: border-color 0.3s, transform 0.25s, box-shadow 0.3s;
  }
  .ed-stat:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.25); }
  .ed-stat-glow {
    position: absolute; border-radius: 50%; filter: blur(36px); pointer-events: none;
    width: 90px; height: 90px; top: -20px; right: -15px; opacity: 0.5;
  }
  .ed-stat-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem; font-weight: 700; line-height: 1;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.3rem;
  }
  .ed-stat-label { font-size: 0.68rem; color: var(--muted); font-weight: 600; letter-spacing: 0.03em; }

  .ed-stat-violet .ed-stat-glow { background: radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%); }
  .ed-stat-violet:hover { border-color: rgba(124,58,237,0.4); box-shadow: 0 12px 36px rgba(124,58,237,0.15); }
  .ed-stat-cyan .ed-stat-glow { background: radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%); }
  .ed-stat-cyan:hover { border-color: rgba(0,212,255,0.3); box-shadow: 0 12px 36px rgba(0,212,255,0.1); }
  .ed-stat-green .ed-stat-glow { background: radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%); }
  .ed-stat-green:hover { border-color: rgba(16,185,129,0.35); box-shadow: 0 12px 36px rgba(16,185,129,0.12); }
  .ed-stat-amber .ed-stat-glow { background: radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 70%); }
  .ed-stat-amber:hover { border-color: rgba(245,158,11,0.35); box-shadow: 0 12px 36px rgba(245,158,11,0.12); }

  /* ── TABLE ── */
  .ed-table-wrap { overflow-x: auto; }
  .ed-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
  .ed-table thead tr { border-bottom: 1px solid rgba(255,255,255,0.08); }
  .ed-table th {
    padding: 0.65rem 1.25rem; text-align: left;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--muted);
  }
  .ed-table td { padding: 0.85rem 1.25rem; }
  .ed-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; }
  .ed-table tbody tr:hover { background: rgba(124,58,237,0.06); }
  .ed-table tbody tr:last-child { border-bottom: none; }
  .ed-td-muted { color: var(--muted); }
  .ed-td-name  { font-weight: 600; color: var(--cream); font-size: 0.8rem; }
  .ed-td-email { font-size: 0.7rem; color: var(--muted); }
  .ed-rank-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 50%;
    font-size: 0.68rem; font-weight: 800;
  }
  .ed-rank-1 { background: rgba(245,158,11,0.2); color: #FCD34D; box-shadow: 0 0 8px rgba(245,158,11,0.2); }
  .ed-rank-2 { background: rgba(196,181,253,0.15); color: var(--lavender); }
  .ed-rank-3 { background: rgba(255,255,255,0.06); color: var(--muted); }
  .ed-rank-n { color: var(--muted); font-size: 0.72rem; }
  .ed-pct-pass { font-weight: 700; color: #34D399; }
  .ed-pct-fail { font-weight: 700; color: #F87171; }

  /* ── QUESTION ROWS ── */
  .ed-q-row {
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 16px; padding: 1rem 1.25rem;
    display: flex; align-items: flex-start; gap: 1rem;
    transition: border-color 0.2s, background 0.2s;
    margin-bottom: 0.6rem;
  }
  .ed-q-row:hover { border-color: rgba(124,58,237,0.25); background: rgba(124,58,237,0.04); }
  .ed-q-row:last-child { margin-bottom: 0; }
  .ed-q-num {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.68rem; font-weight: 700; color: var(--muted);
    min-width: 22px; margin-top: 2px;
  }
  .ed-q-text { font-size: 0.82rem; color: var(--cream); line-height: 1.5; }
  .ed-q-meta {
    display: inline-flex; align-items: center; gap: 0.4rem;
    margin-top: 0.35rem; font-size: 0.68rem; color: var(--muted);
  }
  .ed-q-type-pill {
    background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.2);
    color: var(--lavender); padding: 0.15rem 0.55rem; border-radius: 50px;
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.04em;
  }
  .ed-q-marks-pill {
    background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.18);
    color: var(--cyan); padding: 0.15rem 0.55rem; border-radius: 50px;
    font-size: 0.62rem; font-weight: 600;
  }
  .ed-q-remove {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: transparent; color: var(--muted); cursor: pointer;
    transition: color 0.2s, background 0.2s; margin-left: auto; flex-shrink: 0;
  }
  .ed-q-remove:hover { color: #F87171; background: rgba(239,68,68,0.1); }

  /* ── ADD-Q MODAL ── */
  .ed-modal-q-list { max-height: 60vh; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; }
  .ed-modal-q-item {
    display: flex; align-items: flex-start; gap: 0.75rem;
    padding: 0.85rem 1rem; border-radius: 14px;
    border: 1px solid var(--card-bdr); cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: var(--card-bg);
  }
  .ed-modal-q-item:hover { border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.05); }
  .ed-modal-q-sel { border-color: rgba(124,58,237,0.5) !important; background: rgba(124,58,237,0.1) !important; }
  .ed-checkbox {
    width: 16px; height: 16px; border-radius: 5px; flex-shrink: 0;
    border: 2px solid var(--card-bdr); margin-top: 2px;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s, background 0.2s;
  }
  .ed-checkbox-sel { border-color: var(--violet) !important; background: var(--violet) !important; }
  .ed-check-mark { font-size: 0.6rem; color: #fff; font-weight: 800; line-height: 1; }
  .ed-modal-q-text { font-size: 0.8rem; color: var(--cream); line-height: 1.45; }
  .ed-modal-q-type { font-size: 0.68rem; color: var(--muted); margin-top: 0.25rem; }

  .ed-modal-footer {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 1rem; padding-top: 0.85rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .ed-modal-footer-end { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid rgba(255,255,255,0.08); }
  .ed-sel-count { font-size: 0.8rem; color: var(--muted); }

  /* ── SKELETON ── */
  .ed-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%; animation: ed-shimmer 1.5s infinite; border-radius: 14px;
  }
  @keyframes ed-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── SCHEDULE MODAL ── */
  .ed-sched-note {
    font-size: 0.78rem; color: var(--muted); line-height: 1.55;
    background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.15);
    border-radius: 12px; padding: 0.85rem 1rem;
  }
  .ed-sched-note strong { color: var(--cream); }
`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.38, ease: 'easeOut' },
});

const STAT_VARIANTS = ['ed-stat-violet', 'ed-stat-cyan', 'ed-stat-green', 'ed-stat-amber'];

export default function ExamDetail() {
  /* ─── unchanged logic ─── */
  const { id } = useParams();
  const navigate = useNavigate();
  const [addQModal, setAddQModal]   = useState(false);
  const [schedModal, setSchedModal] = useState(false);
  const [schedForm, setSchedForm]   = useState({ scheduled_at: '' });
  const [selected, setSelected]     = useState([]);
  const [activeTab, setActiveTab]   = useState('questions');

  const { data: exam, loading, refetch } = useApi(() => adminApi.getExam(id), null, [id]);
  const { data: allQuestions }           = useApi(adminApi.getQuestions);
  const { data: results }                = useApi(() => adminApi.getExamResults(id), null, [id]);

  const { mutate: addQs, loading: adding } = useMutation(
    () => adminApi.addExamQuestions(id, { questions: selected.map((qid) => ({ question_id: qid, marks: 1 })) }),
    { onSuccess: () => { setAddQModal(false); setSelected([]); refetch(); }, successMsg: 'Questions added' }
  );
  const { mutate: removeQ } = useMutation(
    (qId) => adminApi.removeExamQuestion(id, qId),
    { onSuccess: refetch, successMsg: 'Question removed' }
  );
  const { mutate: schedule, loading: scheduling } = useMutation(
    () => {
      const iso = new Date(schedForm.scheduled_at).toISOString();
      console.log('Sending scheduled_at:', iso);
      return adminApi.scheduleExam(id, { scheduled_at: iso });
    },
    { onSuccess: () => { setSchedModal(false); refetch(); }, successMsg: 'Exam scheduled' }
  );
  const { mutate: goLive  } = useMutation(() => adminApi.goLiveExam(id), { onSuccess: refetch, successMsg: 'Exam is now live!' });
  const { mutate: endExam } = useMutation(() => adminApi.endExam(id),    { onSuccess: refetch, successMsg: 'Exam ended' });

  const existingIds  = new Set((exam?.questions ?? []).map((q) => q.id));
  const availableQs  = (allQuestions ?? []).filter((q) => !existingIds.has(q.id));
  const toggleSelect = (qid) =>
    setSelected((p) => p.includes(qid) ? p.filter((x) => x !== qid) : [...p, qid]);

  const isDraft     = exam?.status === 'draft';
  const isScheduled = exam?.status === 'scheduled';
  const isLive      = exam?.status === 'live';

  const RESULT_STATS = results?.stats ? [
    { label: 'Submissions', value: results.stats.total_submissions, variant: 'ed-stat-violet' },
    { label: 'Avg Score',   value: `${results.stats.avg_score ?? 0}%`, variant: 'ed-stat-cyan'   },
    { label: 'Highest',     value: results.stats.highest_score ?? 0,   variant: 'ed-stat-green'  },
    { label: 'Passed',      value: results.stats.passed_count  ?? 0,   variant: 'ed-stat-amber'  },
  ] : [];

  /* ── Loading ── */
  if (loading) {
    return (
      <PageWrapper className="p-6">
        <style>{CSS}</style>
        <div className="ed-root">
          <div className="ed-header">
            <div className="ed-hblob ed-hblob-1" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
              <div className="ed-skel" style={{ height: 14, width: 140 }} />
              <div className="ed-skel" style={{ height: 26, width: 280 }} />
              <div className="ed-skel" style={{ height: 13, width: 200 }} />
            </div>
          </div>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="ed-skel" style={{ height: 60, marginBottom: 12 }} />
          ))}
        </div>
      </PageWrapper>
    );
  }
  if (!exam) return null;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="ed-root">

        {/* ── Header ── */}
        <motion.div className="ed-header" {...fadeUp(0)}>
          <div className="ed-hblob ed-hblob-1" />
          <div className="ed-hblob ed-hblob-2" />

          <div className="ed-header-left">
            <button className="ed-back-btn" onClick={() => navigate('/admin/exams')}>
              <ArrowLeft size={16} />
            </button>
            <div style={{ minWidth: 0 }}>
              <div className="ed-eyebrow">
                <span className="ed-eyebrow-dot" />
                Admin · Exams
              </div>
              <div className="ed-title-row">
                {isLive && <span className="ed-live-dot" />}
                <h1 className="ed-title">{exam.title}</h1>
                <span className={`ed-status ed-status-${exam.status}`}>{exam.status}</span>
              </div>
              <div className="ed-subtitle">
                <span><Clock size={11} style={{ color: 'var(--cyan)' }} />{exam.duration_minutes}m</span>
                <span>{exam.total_marks} marks</span>
                {exam.passing_marks && <span>Pass: {exam.passing_marks}</span>}
              </div>
            </div>
          </div>

          <div className="ed-header-actions">
            {isDraft && (
              <>
                <button className="ed-btn-outline" onClick={() => setSchedModal(true)}>
                  <Calendar size={14} /> Schedule
                </button>
                <button className="ed-btn-primary" onClick={() => setAddQModal(true)}>
                  <Plus size={14} /> Add Questions
                </button>
              </>
            )}
            {isScheduled && (
              <button className="ed-btn-golive" onClick={() => goLive()}>
                <Radio size={13} /> Go Live
              </button>
            )}
            {isLive && (
              <button className="ed-btn-danger" onClick={() => endExam()}>
                End Exam
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div {...fadeUp(0.08)}>
          <div className="ed-tabs">
            {['questions', 'results'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={clsx('ed-tab', activeTab === t && 'ed-tab-active')}
              >
                {t === 'questions' ? <CheckCircle size={13} /> : <Award size={13} />}
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* ── QUESTIONS TAB ── */}
          {activeTab === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
              {exam.questions?.length === 0 ? (
                <EmptyState
                  icon={Plus}
                  title="No questions yet"
                  description="Add questions from the question bank to this exam."
                  action={isDraft && (
                    <button className="ed-btn-primary" onClick={() => setAddQModal(true)}>
                      <Plus size={14} /> Add Questions
                    </button>
                  )}
                />
              ) : (
                <div>
                  {exam.questions.map((q, i) => (
                    <motion.div
                      key={q.id}
                      className="ed-q-row"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.28 }}
                    >
                      <span className="ed-q-num">{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="ed-q-text">{q.question_text}</p>
                        <div className="ed-q-meta">
                          <span className="ed-q-type-pill">{q.question_type.replace('_', ' ')}</span>
                          <span className="ed-q-marks-pill">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      {isDraft && (
                        <button className="ed-q-remove" onClick={() => removeQ(q.id)}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── RESULTS TAB ── */}
          {activeTab === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>

              {/* Stat pills */}
              {RESULT_STATS.length > 0 && (
                <div className="ed-stats-grid" style={{ marginBottom: '1.25rem' }}>
                  {RESULT_STATS.map((s, i) => (
                    <motion.div key={s.label} className={`ed-stat ${s.variant}`} {...fadeUp(i * 0.06)}>
                      <div className="ed-stat-glow" />
                      <div className="ed-stat-val">{s.value}</div>
                      <div className="ed-stat-label">{s.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Results table */}
              <motion.div className="ed-card" {...fadeUp(0.1)}>
                <div className="ed-card-title">
                  <span className="ed-card-title-dot" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
                  Student Results
                  <TrendingUp size={13} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
                </div>
                <div className="ed-table-wrap">
                  <table className="ed-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Student</th>
                        <th>Score</th>
                        <th>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(results?.results ?? []).map((r, i) => (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.12 + i * 0.04 }}
                        >
                          <td>
                            <span className={clsx('ed-rank-badge', r.rank <= 3 ? `ed-rank-${r.rank}` : 'ed-rank-n')}>
                              #{r.rank}
                            </span>
                          </td>
                          <td>
                            <p className="ed-td-name">{r.full_name}</p>
                            <p className="ed-td-email">{r.email}</p>
                          </td>
                          <td className="ed-td-muted">{r.score}/{r.total_marks}</td>
                          <td>
                            <span className={r.percentage >= 50 ? 'ed-pct-pass' : 'ed-pct-fail'}>
                              {r.percentage}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                      {!results?.results?.length && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)', fontSize: '0.8rem' }}>
                            No submissions yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>

            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Add Questions Modal ── */}
        <Modal open={addQModal} onClose={() => setAddQModal(false)} title="Add Questions" size="xl">
          <div className="ed-modal-q-list">
            {availableQs.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2.5rem 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                All questions are already added, or no questions exist yet.
              </p>
            ) : (
              availableQs.map((q) => {
                const sel = selected.includes(q.id);
                return (
                  <motion.div
                    key={q.id}
                    onClick={() => toggleSelect(q.id)}
                    className={clsx('ed-modal-q-item', sel && 'ed-modal-q-sel')}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={clsx('ed-checkbox', sel && 'ed-checkbox-sel')}>
                      {sel && <span className="ed-check-mark">✓</span>}
                    </div>
                    <div>
                      <p className="ed-modal-q-text">{q.question_text}</p>
                      <p className="ed-modal-q-type">{q.question_type.replace('_', ' ')}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
          {selected.length > 0 && (
            <div className="ed-modal-footer">
              <p className="ed-sel-count">{selected.length} selected</p>
              <Button variant="primary" loading={adding} onClick={addQs}>Add to Exam</Button>
            </div>
          )}
        </Modal>

        {/* ── Schedule Modal ── */}
        <Modal open={schedModal} onClose={() => setSchedModal(false)} title="Schedule Exam" size="sm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                Start Date &amp; Time
              </label>
              <input
                type="datetime-local"
                className="input"
                value={schedForm.scheduled_at}
                onChange={(e) => setSchedForm({ scheduled_at: e.target.value })}
              />
            </div>
            <p className="ed-sched-note">
              The exam will automatically go live at the scheduled time and end after{' '}
              <strong>{exam.duration_minutes} minutes</strong>.
              Unsubmitted attempts will be auto-submitted when time is up.
            </p>
          </div>
          <div className="ed-modal-footer-end">
            <Button variant="ghost" onClick={() => setSchedModal(false)}>Cancel</Button>
            <Button variant="primary" loading={scheduling} onClick={schedule}>Schedule</Button>
          </div>
        </Modal>

      </div>
    </PageWrapper>
  );
}