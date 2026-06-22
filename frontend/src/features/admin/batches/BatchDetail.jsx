import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Users, BarChart2,
  Search, TrendingUp, Award, Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageWrapper, Button, Badge, Skeleton, EmptyState,
  Modal, ConfirmDialog,
} from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import clsx from 'clsx';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .bd-root {
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
  .bd-root *, .bd-root *::before, .bd-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .bd-header {
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
  }
  .bd-hblob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .bd-hblob-1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
    top: -90px; right: -70px;
    animation: bd-drift 11s ease-in-out infinite alternate;
  }
  .bd-hblob-2 {
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%);
    bottom: -40px; left: 25%;
    animation: bd-drift 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes bd-drift { from{transform:translate(0,0)} to{transform:translate(20px,-14px)} }
  @keyframes bd-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .bd-header-left { display: flex; align-items: center; gap: 1rem; position: relative; z-index: 1; }
  .bd-back-btn {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border-radius: 12px; border: 1px solid var(--card-bdr);
    background: rgba(255,255,255,0.05); color: var(--muted); cursor: pointer;
    flex-shrink: 0; transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .bd-back-btn:hover { border-color: rgba(124,58,237,0.4); color: var(--lavender); background: rgba(124,58,237,0.1); }

  .bd-eyebrow {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.25rem 0.8rem; border-radius: 50px;
    font-size: 0.68rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.4rem;
  }
  .bd-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 7px var(--cyan);
    animation: bd-blink 2s ease infinite;
  }
  .bd-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.25rem,2.5vw,1.75rem); font-weight: 700; letter-spacing: -0.025em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.15rem;
  }
  .bd-subtitle { font-size: 0.8rem; color: var(--muted); }

  .bd-add-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: linear-gradient(135deg, var(--violet), #5B21B6);
    color: #fff; border: none; padding: 0.6rem 1.2rem;
    border-radius: 50px; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; font-family: 'Space Grotesk', sans-serif;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 22px rgba(124,58,237,0.45);
    white-space: nowrap; flex-shrink: 0; position: relative; z-index: 1;
  }
  .bd-add-btn:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(124,58,237,0.65); }

  /* ── TABS ── */
  .bd-tabs {
    display: flex; gap: 0.35rem; padding: 0.35rem;
    background: rgba(255,255,255,0.04); border: 1px solid var(--card-bdr);
    border-radius: 16px; width: fit-content; margin-bottom: 1.25rem;
    backdrop-filter: blur(10px);
  }
  .bd-tab {
    display: flex; align-items: center; gap: 0.45rem;
    padding: 0.5rem 1.1rem; border-radius: 10px; border: none;
    font-size: 0.78rem; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: color 0.2s, background 0.2s, box-shadow 0.2s;
    color: var(--muted); background: transparent;
  }
  .bd-tab-active {
    background: linear-gradient(135deg, rgba(124,58,237,0.35), rgba(124,58,237,0.18));
    color: var(--lavender);
    box-shadow: 0 0 18px rgba(124,58,237,0.2), inset 0 0 0 1px rgba(124,58,237,0.3);
  }
  .bd-tab:not(.bd-tab-active):hover { color: var(--cream); background: rgba(255,255,255,0.04); }

  /* ── GLASS CARD ── */
  .bd-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px; padding: 1.5rem;
    backdrop-filter: blur(14px);
    transition: border-color 0.3s;
    margin-bottom: 1.1rem;
  }
  .bd-card:hover { border-color: rgba(124,58,237,0.18); }
  .bd-card:last-child { margin-bottom: 0; }

  .bd-card-title {
    display: flex; align-items: center; gap: 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem; font-weight: 700; color: var(--cream);
    margin-bottom: 1.1rem;
  }
  .bd-card-title-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  }

  /* ── STUDENTS TABLE ── */
  .bd-table-wrap { overflow-x: auto; }
  .bd-table {
    width: 100%; border-collapse: collapse; font-size: 0.78rem;
  }
  .bd-table thead tr { border-bottom: 1px solid rgba(255,255,255,0.08); }
  .bd-table th {
    padding: 0.65rem 1rem; text-align: left;
    font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--muted);
  }
  .bd-table td { padding: 0.85rem 1rem; }
  .bd-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: background 0.2s;
  }
  .bd-table tbody tr:hover { background: rgba(124,58,237,0.06); }
  .bd-table tbody tr:last-child { border-bottom: none; }

  /* avatar */
  .bd-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.35);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 700; color: var(--lavender);
    flex-shrink: 0;
  }
  .bd-student-name { font-weight: 600; color: var(--cream); font-size: 0.8rem; }
  .bd-student-email { font-size: 0.7rem; color: var(--muted); }
  .bd-td-muted { color: var(--muted); font-size: 0.75rem; }

  /* plan badge */
  .bd-plan {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
    padding: 0.22rem 0.65rem; border-radius: 50px;
  }
  .bd-plan-premium {
    background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08));
    border: 1px solid rgba(245,158,11,0.3); color: #FCD34D;
    box-shadow: 0 0 8px rgba(245,158,11,0.15);
  }
  .bd-plan-free {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    color: var(--muted);
  }

  .bd-remove-btn {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: transparent; color: var(--muted); cursor: pointer;
    transition: color 0.2s, background 0.2s; margin-left: auto;
  }
  .bd-remove-btn:hover { color: #EF4444; background: rgba(239,68,68,0.1); }

  /* ── ANALYTICS ── */
  .bd-analytics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.1rem;
  }
  @media (max-width: 780px) { .bd-analytics-grid { grid-template-columns: 1fr; } }

  /* top-students leaderboard */
  .bd-leader-row {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.55rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .bd-leader-row:last-child { border-bottom: none; }
  .bd-rank {
    width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.62rem; font-weight: 800; flex-shrink: 0;
  }
  .bd-rank-1 { background: rgba(245,158,11,0.2); color: #FCD34D; box-shadow: 0 0 8px rgba(245,158,11,0.2); }
  .bd-rank-2 { background: rgba(196,181,253,0.15); color: var(--lavender); }
  .bd-rank-3 { background: rgba(255,255,255,0.06); color: var(--muted); }
  .bd-rank-n { background: rgba(255,255,255,0.04); color: var(--muted); }

  .bd-leader-name { font-size: 0.78rem; font-weight: 600; color: var(--cream); }
  .bd-leader-sub  { font-size: 0.68rem; color: var(--muted); }
  .bd-score-green  { font-size: 0.85rem; font-weight: 700; color: #34D399; }
  .bd-score-amber  { font-size: 0.85rem; font-weight: 700; color: #FCD34D; }
  .bd-score-red    { font-size: 0.85rem; font-weight: 700; color: #F87171; }

  /* exam stats table */
  .bd-exam-val-green { font-weight: 600; color: #34D399; }
  .bd-exam-val-amber { font-weight: 600; color: #FCD34D; }
  .bd-exam-val-red   { font-weight: 600; color: #F87171; }

  /* ── SKELETON ── */
  .bd-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: bd-shimmer 1.5s infinite;
    border-radius: 14px;
  }
  @keyframes bd-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── ADD-STUDENTS MODAL ── */
  .bd-search-wrap { position: relative; margin-bottom: 0.75rem; }
  .bd-search-icon {
    position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
    color: var(--muted); pointer-events: none;
  }
  .bd-search-input {
    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--card-bdr);
    border-radius: 12px; padding: 0.6rem 0.85rem 0.6rem 2.25rem;
    color: var(--cream); font-size: 0.82rem; font-family: 'Inter', sans-serif;
    outline: none; transition: border-color 0.2s;
  }
  .bd-search-input::placeholder { color: var(--muted); }
  .bd-search-input:focus { border-color: rgba(124,58,237,0.5); }

  .bd-student-list { max-height: 50vh; overflow-y: auto; display: flex; flex-direction: column; gap: 0.4rem; }
  .bd-student-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 0.85rem; border-radius: 14px;
    border: 1px solid var(--card-bdr); cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .bd-student-item:hover { border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.05); }
  .bd-student-item-sel {
    border-color: rgba(124,58,237,0.5) !important;
    background: rgba(124,58,237,0.1) !important;
  }

  .bd-checkbox {
    width: 16px; height: 16px; border-radius: 5px; flex-shrink: 0;
    border: 2px solid var(--card-bdr); display: flex; align-items: center;
    justify-content: center; transition: border-color 0.2s, background 0.2s;
  }
  .bd-checkbox-sel {
    border-color: var(--violet) !important;
    background: var(--violet) !important;
  }
  .bd-check-mark { font-size: 0.6rem; color: #fff; font-weight: 800; line-height: 1; }

  .bd-modal-footer {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 1rem; padding-top: 0.85rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .bd-sel-count { font-size: 0.8rem; color: var(--muted); }
`;

/* ─── Custom tooltip (same data as before) ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,22,41,0.95)', border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: 12, padding: '0.6rem 0.9rem', fontSize: '0.75rem',
      backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: 'rgba(245,240,232,0.5)', marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const scoreClass = (v) => +v >= 75 ? 'bd-score-green' : +v >= 50 ? 'bd-score-amber' : 'bd-score-red';
const examCls    = (v) => +v >= 75 ? 'bd-exam-val-green' : +v >= 50 ? 'bd-exam-val-amber' : 'bd-exam-val-red';
const rankCls    = (i) => ['bd-rank-1','bd-rank-2','bd-rank-3'][i] ?? 'bd-rank-n';

/* ─── fade-up variant ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.38, ease: 'easeOut' },
});

export default function BatchDetail() {
  /* ─── unchanged logic ─── */
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState('students');
  const [addModal, setAddModal]         = useState(false);
  const [search, setSearch]             = useState('');
  const [removeId, setRemoveId]         = useState(null);

  const { data: batch,     loading,         refetch } = useApi(() => adminApi.getBatch(id), null, [id]);
  const { data: analytics, loading: loadingA }        = useApi(() => adminApi.getBatchAnalytics(id), null, [id]);
  const { data: available, loading: loadingAvail, refetch: refetchAvail } = useApi(
    () => adminApi.getAvailableStudents(id, search ? { search } : {}),
    null,
    [id, search]
  );

  const [selectedIds, setSelectedIds] = useState([]);

  const { mutate: addStudents, loading: adding } = useMutation(
    () => adminApi.addBatchStudents(id, selectedIds),
    {
      onSuccess: () => { setAddModal(false); setSelectedIds([]); refetch(); refetchAvail(); },
      successMsg: `${selectedIds.length} student(s) added`,
    }
  );

  const { mutate: removeStudent } = useMutation(
    (sid) => adminApi.removeBatchStudent(id, sid),
    { onSuccess: () => { setRemoveId(null); refetch(); }, successMsg: 'Student removed' }
  );

  const toggleSelect = (sid) =>
    setSelectedIds((p) => p.includes(sid) ? p.filter((x) => x !== sid) : [...p, sid]);

  const students    = batch?.students ?? [];
  const examStats   = analytics?.examStats ?? [];
  const topStudents = analytics?.topStudents ?? [];
  const activity    = analytics?.activityTrend?.map((a) => ({
    date: new Date(a.activity_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    active: parseInt(a.active_students),
  })) ?? [];

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <PageWrapper className="p-6">
        <style>{CSS}</style>
        <div className="bd-root">
          <div className="bd-header" style={{ marginBottom: '1.5rem' }}>
            <div className="bd-hblob bd-hblob-1" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
              <div className="bd-skel" style={{ height: 16, width: 160 }} />
              <div className="bd-skel" style={{ height: 28, width: 260 }} />
              <div className="bd-skel" style={{ height: 14, width: 200 }} />
            </div>
          </div>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bd-skel" style={{ height: 64, marginBottom: 12 }} />
          ))}
        </div>
      </PageWrapper>
    );
  }
  if (!batch) return null;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="bd-root">

        {/* ── Header ── */}
        <motion.div className="bd-header" {...fadeUp(0)}>
          <div className="bd-hblob bd-hblob-1" />
          <div className="bd-hblob bd-hblob-2" />

          <div className="bd-header-left">
            <button className="bd-back-btn" onClick={() => navigate('/admin/batches')}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="bd-eyebrow">
                <span className="bd-eyebrow-dot" />
                {batch.curriculum_name || 'Batch'}
              </div>
              <h1 className="bd-title">{batch.name}</h1>
              <p className="bd-subtitle">
                {students.length} student{students.length !== 1 ? 's' : ''} enrolled
              </p>
            </div>
          </div>

          <button className="bd-add-btn" onClick={() => setAddModal(true)}>
            <Plus size={14} /> Add Students
          </button>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div {...fadeUp(0.08)}>
          <div className="bd-tabs">
            {[
              { key: 'students',  icon: Users,    label: 'Students'  },
              { key: 'analytics', icon: BarChart2, label: 'Analytics' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={clsx('bd-tab', activeTab === key && 'bd-tab-active')}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── STUDENTS TAB ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
              {students.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No students in this batch"
                  description="Add students to get them started on this curriculum."
                  action={
                    <button className="bd-add-btn" onClick={() => setAddModal(true)}>
                      <Plus size={14} /> Add Students
                    </button>
                  }
                />
              ) : (
                <div className="bd-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="bd-table-wrap">
                    <table className="bd-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Joined</th>
                          <th>Plan</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, i) => (
                          <motion.tr
                            key={s.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.28 }}
                          >
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div className="bd-avatar">{s.full_name?.[0]?.toUpperCase()}</div>
                                <div>
                                  <p className="bd-student-name">{s.full_name}</p>
                                  <p className="bd-student-email">{s.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="bd-td-muted">
                              {s.joined_at
                                ? new Date(s.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—'}
                            </td>
                            <td>
                              <span className={`bd-plan ${s.is_premium ? 'bd-plan-premium' : 'bd-plan-free'}`}>
                                {s.is_premium ? '⭐ Premium' : 'Free'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="bd-remove-btn" onClick={() => setRemoveId(s.id)}>
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
              {loadingA ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bd-skel" style={{ height: 200 }} />
                  ))}
                </div>
              ) : (
                <>
                  {/* ── Activity trend (full-width) ── */}
                  <motion.div className="bd-card" {...fadeUp(0.05)}>
                    <div className="bd-card-title">
                      <span className="bd-card-title-dot" style={{ background: 'var(--violet-l)', boxShadow: '0 0 6px var(--violet)' }} />
                      Daily Active Students
                      <Activity size={13} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
                    </div>
                    {activity.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '2.5rem 0', fontSize: '0.78rem', color: 'var(--muted)' }}>No activity data yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={activity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="bd-actGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}   />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" tick={{ fill: 'rgba(245,240,232,0.3)', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'rgba(245,240,232,0.3)', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124,58,237,0.2)', strokeWidth: 1 }} />
                          <Area type="monotone" dataKey="active" name="Students" stroke="#7C3AED" fill="url(#bd-actGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </motion.div>

                  {/* ── Two-column: leaderboard + exam bar chart ── */}
                  <div className="bd-analytics-grid">

                    {/* Top Students */}
                    <motion.div className="bd-card" style={{ marginBottom: 0 }} {...fadeUp(0.1)}>
                      <div className="bd-card-title">
                        <span className="bd-card-title-dot" style={{ background: '#F59E0B', boxShadow: '0 0 6px #F59E0B' }} />
                        Top Students by Avg Score
                        <Award size={13} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
                      </div>
                      {topStudents.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2.5rem 0', fontSize: '0.78rem', color: 'var(--muted)' }}>No exam submissions yet.</p>
                      ) : (
                        <div>
                          {topStudents.map((s, i) => (
                            <motion.div
                              key={s.email}
                              className="bd-leader-row"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.12 + i * 0.05 }}
                            >
                              <span className={`bd-rank ${rankCls(i)}`}>{i + 1}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="bd-leader-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name}</p>
                                <p className="bd-leader-sub">{s.exams_taken} exam{s.exams_taken !== 1 ? 's' : ''} taken</p>
                              </div>
                              <span className={scoreClass(s.avg_score)}>{s.avg_score ?? '—'}%</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* Exam performance bar chart */}
                    <motion.div className="bd-card" style={{ marginBottom: 0 }} {...fadeUp(0.14)}>
                      <div className="bd-card-title">
                        <span className="bd-card-title-dot" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
                        Exam Avg Score
                        <TrendingUp size={13} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
                      </div>
                      {examStats.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2.5rem 0', fontSize: '0.78rem', color: 'var(--muted)' }}>No exams in this batch yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={examStats.slice(0, 6)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="bd-barGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"  stopColor="#00D4FF" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.6} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="title" tick={{ fill: 'rgba(245,240,232,0.3)', fontSize: 9, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.length > 8 ? v.slice(0, 8) + '…' : v} />
                            <YAxis domain={[0, 100]} tick={{ fill: 'rgba(245,240,232,0.3)', fontSize: 9, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
                            <Bar dataKey="avg_score" name="Avg %" fill="url(#bd-barGrad)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </motion.div>
                  </div>

                  {/* ── Exam performance table (full-width) ── */}
                  {examStats.length > 0 && (
                    <motion.div className="bd-card" {...fadeUp(0.18)}>
                      <div className="bd-card-title">
                        <span className="bd-card-title-dot" style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
                        Exam Performance
                      </div>
                      <div className="bd-table-wrap">
                        <table className="bd-table">
                          <thead>
                            <tr>
                              {['Exam', 'Submissions', 'Avg %', 'Highest', 'Lowest'].map((h) => (
                                <th key={h}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {examStats.map((e, i) => (
                              <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.04 }}
                              >
                                <td style={{ fontWeight: 600, color: 'var(--cream)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</td>
                                <td className="bd-td-muted">{e.submissions}</td>
                                <td><span className={examCls(e.avg_score)}>{e.avg_score ?? '—'}%</span></td>
                                <td style={{ color: '#34D399', fontWeight: 600 }}>{e.highest ?? '—'}</td>
                                <td style={{ color: '#F87171', fontWeight: 600 }}>{e.lowest ?? '—'}</td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Add Students Modal ── */}
        <Modal open={addModal} onClose={() => { setAddModal(false); setSelectedIds([]); }} title="Add Students" size="lg">
          <div className="bd-search-wrap">
            <Search size={13} className="bd-search-icon" />
            <input
              className="bd-search-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bd-student-list">
            {loadingAvail ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bd-skel" style={{ height: 52 }} />
              ))
            ) : (available ?? []).length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2.5rem 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                {search ? 'No students match your search.' : 'All students are already in this batch.'}
              </p>
            ) : (
              (available ?? []).map((s) => {
                const sel = selectedIds.includes(s.id);
                return (
                  <motion.div
                    key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={clsx('bd-student-item', sel && 'bd-student-item-sel')}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={clsx('bd-checkbox', sel && 'bd-checkbox-sel')}>
                      {sel && <span className="bd-check-mark">✓</span>}
                    </div>
                    <div className="bd-avatar">{s.full_name?.[0]?.toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="bd-student-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name}</p>
                      <p className="bd-student-email" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</p>
                    </div>
                    {s.is_premium && (
                      <span className="bd-plan bd-plan-premium">⭐ Premium</span>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="bd-modal-footer">
              <p className="bd-sel-count">{selectedIds.length} selected</p>
              <Button variant="primary" loading={adding} onClick={addStudents}>
                Add to Batch
              </Button>
            </div>
          )}
        </Modal>

        {/* ── Remove confirm ── */}
        <ConfirmDialog
          open={!!removeId}
          onClose={() => setRemoveId(null)}
          onConfirm={() => removeStudent(removeId)}
          title="Remove Student"
          description="This student will lose access to this batch's curriculum and exams."
          danger
        />

      </div>
    </PageWrapper>
  );
}