import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Clock, Users, CheckCircle, Radio } from 'lucide-react';
import { PageWrapper, Button, Badge, EmptyState, SkeletonCard, Modal, Input, Select, Textarea, Toggle } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

/* ─── unchanged helpers ─── */
const STATUS_BADGE = { draft: 'muted', scheduled: 'indigo', live: 'success', ended: 'muted' };
const BLANK = {
  title: '', description: '',
  duration_minutes: 60, total_marks: 100, passing_marks: 40,
  is_premium: false,
  subject_id: '', batch_id: '',
};

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .ep-root {
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
  .ep-root *, .ep-root *::before, .ep-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .ep-header {
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
  .ep-hblob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .ep-hblob-1 {
    width: 340px; height: 340px;
    background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
    top: -100px; right: -80px;
    animation: ep-drift 11s ease-in-out infinite alternate;
  }
  .ep-hblob-2 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%);
    bottom: -50px; left: 28%;
    animation: ep-drift 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes ep-drift { from{transform:translate(0,0)} to{transform:translate(22px,-16px)} }
  @keyframes ep-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .ep-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.3rem 0.9rem; border-radius: 50px;
    font-size: 0.7rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.55rem;
  }
  .ep-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: ep-blink 2s ease infinite;
  }
  .ep-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 700; letter-spacing: -0.025em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.2rem;
  }
  .ep-subtitle { font-size: 0.82rem; color: var(--muted); }

  .ep-new-btn {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: linear-gradient(135deg, var(--violet), #5B21B6);
    color: #fff; border: none; padding: 0.65rem 1.35rem;
    border-radius: 50px; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; font-family: 'Space Grotesk', sans-serif;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 22px rgba(124,58,237,0.45);
    white-space: nowrap; flex-shrink: 0; position: relative; z-index: 1;
  }
  .ep-new-btn:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(124,58,237,0.65); }

  /* ── FILTER TABS ── */
  .ep-filters {
    display: flex; gap: 0.35rem; padding: 0.35rem;
    background: rgba(255,255,255,0.04); border: 1px solid var(--card-bdr);
    border-radius: 16px; width: fit-content; margin-bottom: 1.4rem;
    backdrop-filter: blur(10px);
  }
  .ep-filter-btn {
    padding: 0.45rem 1rem; border-radius: 10px; border: none;
    font-size: 0.75rem; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: color 0.2s, background 0.2s, box-shadow 0.2s;
    color: var(--muted); background: transparent;
  }
  .ep-filter-btn-active {
    background: linear-gradient(135deg, rgba(124,58,237,0.35), rgba(124,58,237,0.18));
    color: var(--lavender);
    box-shadow: 0 0 18px rgba(124,58,237,0.2), inset 0 0 0 1px rgba(124,58,237,0.3);
  }
  .ep-filter-btn:not(.ep-filter-btn-active):hover { color: var(--cream); background: rgba(255,255,255,0.04); }

  /* status-specific filter colours */
  .ep-filter-live.ep-filter-btn-active {
    background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.1));
    color: #34D399;
    box-shadow: 0 0 18px rgba(16,185,129,0.2), inset 0 0 0 1px rgba(16,185,129,0.3);
  }
  .ep-filter-scheduled.ep-filter-btn-active {
    background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.08));
    color: var(--cyan);
    box-shadow: 0 0 18px rgba(0,212,255,0.15), inset 0 0 0 1px rgba(0,212,255,0.25);
  }

  /* ── EXAM GRID ── */
  .ep-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.1rem;
  }

  /* ── EXAM CARD ── */
  .ep-card {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 1.5rem;
    display: flex; flex-direction: column; gap: 0.75rem;
    backdrop-filter: blur(14px);
    overflow: hidden;
    text-decoration: none; color: inherit;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.25s;
    cursor: pointer;
  }
  .ep-card:hover {
    border-color: rgba(124,58,237,0.35);
    box-shadow: 0 18px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,58,237,0.1);
    transform: translateY(-3px);
  }

  /* strip by status */
  .ep-card-strip {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    border-radius: 24px 24px 0 0;
  }
  .ep-strip-draft     { background: linear-gradient(90deg, rgba(245,240,232,0.2), transparent); }
  .ep-strip-scheduled { background: linear-gradient(90deg, var(--cyan), rgba(0,212,255,0)); }
  .ep-strip-live      { background: linear-gradient(90deg, var(--green), rgba(16,185,129,0)); }
  .ep-strip-ended     { background: linear-gradient(90deg, rgba(245,240,232,0.12), transparent); }

  /* glow on hover */
  .ep-card-glow {
    position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none;
    width: 180px; height: 180px; top: -60px; right: -40px; opacity: 0;
    background: radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%);
    transition: opacity 0.4s;
  }
  .ep-card:hover .ep-card-glow { opacity: 1; }

  /* live pulse indicator */
  .ep-live-pulse {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 8px var(--green);
    animation: ep-blink 1.4s ease infinite;
    flex-shrink: 0;
  }

  .ep-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
  .ep-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.92rem; font-weight: 700; color: var(--cream);
    line-height: 1.35; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  /* status pill */
  .ep-status {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 0.22rem 0.65rem; border-radius: 50px;
    white-space: nowrap; flex-shrink: 0;
  }
  .ep-status-draft     { background: rgba(245,240,232,0.06); border: 1px solid rgba(245,240,232,0.1); color: var(--muted); }
  .ep-status-scheduled { background: rgba(0,212,255,0.1);    border: 1px solid rgba(0,212,255,0.25);  color: var(--cyan); }
  .ep-status-live      { background: rgba(16,185,129,0.15);  border: 1px solid rgba(16,185,129,0.3);  color: #34D399; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
  .ep-status-ended     { background: rgba(245,240,232,0.04); border: 1px solid rgba(245,240,232,0.08); color: rgba(245,240,232,0.3); }

  .ep-card-meta {
    display: flex; flex-direction: column; gap: 0.2rem;
    font-size: 0.73rem; color: var(--muted);
  }
  .ep-card-meta span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .ep-card-foot {
    display: flex; align-items: center; gap: 1rem;
    padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.07);
    margin-top: auto; font-size: 0.71rem; color: var(--muted);
  }
  .ep-card-foot span { display: flex; align-items: center; gap: 0.3rem; }
  .ep-card-foot .ep-manage {
    margin-left: auto; display: flex; align-items: center; gap: 0.25rem;
    font-size: 0.73rem; font-weight: 600; color: var(--violet-l);
    transition: color 0.2s;
  }
  .ep-card:hover .ep-manage { color: var(--cyan); }

  /* ── SKELETON ── */
  .ep-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: ep-shimmer 1.5s infinite;
    border-radius: 14px;
  }
  @keyframes ep-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── MODAL ── */
  .ep-modal-footer {
    display: flex; justify-content: flex-end; gap: 0.5rem;
    margin-top: 1.5rem; padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
`;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardV     = { hidden: { opacity: 0, y: 20, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } } };
const headerV   = { hidden: { opacity: 0, y: -16 }, show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } } };

const FILTERS = [
  { key: '',          label: 'All',       cls: '' },
  { key: 'draft',     label: 'Draft',     cls: '' },
  { key: 'scheduled', label: 'Scheduled', cls: 'ep-filter-scheduled' },
  { key: 'live',      label: 'Live',      cls: 'ep-filter-live' },
  { key: 'ended',     label: 'Ended',     cls: '' },
];

export default function ExamsPage() {
  /* ─── unchanged logic ─── */
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(BLANK);
  const [filter, setFilter] = useState('');

  const { data: exams, loading, refetch } = useApi(adminApi.getExams);
  const { data: batches                 } = useApi(adminApi.getBatches);
  const { data: subjects                } = useApi(adminApi.getSubjects);

  const { mutate: create, loading: creating } = useMutation(adminApi.createExam, {
    onSuccess: () => { setModal(false); setForm(BLANK); refetch(); },
    successMsg: 'Exam created',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered    = (exams ?? []).filter((e) => !filter || e.status === filter);
  const batchList   = batches?.data ?? batches ?? [];
  const subjectList = subjects?.data ?? subjects ?? [];

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="ep-root">

        {/* ── Header ── */}
        <motion.div className="ep-header" variants={headerV} initial="hidden" animate="show">
          <div className="ep-hblob ep-hblob-1" />
          <div className="ep-hblob ep-hblob-2" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="ep-eyebrow">
              <span className="ep-eyebrow-dot" />
              Admin · Exams
            </div>
            <h1 className="ep-title">Exam Management</h1>
            <p className="ep-subtitle">
              {exams?.length ?? 0} exam{exams?.length !== 1 ? 's' : ''} · draft, schedule, and run assessments
            </p>
          </div>
          <button className="ep-new-btn" onClick={() => setModal(true)}>
            <Plus size={15} /> New Exam
          </button>
        </motion.div>

        {/* ── Filter tabs ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
          <div className="ep-filters">
            {FILTERS.map(({ key, label, cls }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={clsx('ep-filter-btn', cls, filter === key && 'ep-filter-btn-active')}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="ep-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-bdr)', borderRadius: 24, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="ep-skel" style={{ height: 18, width: '65%' }} />
                <div className="ep-skel" style={{ height: 14, width: '45%' }} />
                <div className="ep-skel" style={{ height: 12, width: '55%' }} />
                <div className="ep-skel" style={{ height: 32, marginTop: 8 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <EmptyState
              icon={CheckCircle}
              title="No exams found"
              action={
                <button className="ep-new-btn" onClick={() => setModal(true)}>
                  <Plus size={14} /> Create Exam
                </button>
              }
            />
          </motion.div>
        ) : (
          <motion.div className="ep-grid" variants={container} initial="hidden" animate="show">
            <AnimatePresence>
              {filtered.map((e) => (
                <motion.div key={e.id} variants={cardV} layout>
                  <Link to={`/admin/exams/${e.id}`} className="ep-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className={`ep-card-strip ep-strip-${e.status}`} />
                    <div className="ep-card-glow" />

                    <div className="ep-card-head">
                      <p className="ep-card-title">{e.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {e.status === 'live' && <span className="ep-live-pulse" />}
                        <span className={`ep-status ep-status-${e.status}`}>{e.status}</span>
                      </div>
                    </div>

                    {(e.batch_name || e.subject_name) && (
                      <div className="ep-card-meta">
                        {e.batch_name   && <span>{e.batch_name}</span>}
                        {e.subject_name && <span style={{ color: 'var(--violet-l)' }}>{e.subject_name}</span>}
                      </div>
                    )}

                    <div className="ep-card-foot">
                      <span><Clock size={11} style={{ color: 'var(--cyan)' }} />{e.duration_minutes}m</span>
                      <span><Users size={11} style={{ color: 'var(--violet-l)' }} />{e.submission_count ?? 0} submitted</span>
                      {e.question_count > 0 && <span>{e.question_count} Qs</span>}
                      <span className="ep-manage">View <ChevronRight size={12} /></span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Create modal ── */}
        <Modal open={modal} onClose={() => { setModal(false); setForm(BLANK); }} title="Create Exam" size="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Title" placeholder="e.g. Mid-term Exam" value={form.title} onChange={(e) => set('title', e.target.value)} />
            <Textarea label="Description" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Select label="Batch" value={form.batch_id} onChange={(e) => set('batch_id', e.target.value)}>
                <option value="">No batch</option>
                {batchList.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
              <Select label="Subject" value={form.subject_id} onChange={(e) => set('subject_id', e.target.value)}>
                <option value="">No subject</option>
                {subjectList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <Input label="Duration (min)" type="number" value={form.duration_minutes} onChange={(e) => set('duration_minutes', +e.target.value)} />
              <Input label="Total Marks"    type="number" value={form.total_marks}       onChange={(e) => set('total_marks',       +e.target.value)} />
              <Input label="Passing Marks"  type="number" value={form.passing_marks}     onChange={(e) => set('passing_marks',     +e.target.value)} />
            </div>
            <Toggle label="Premium exam" checked={form.is_premium} onChange={(v) => set('is_premium', v)} />
          </div>
          <div className="ep-modal-footer">
            <Button variant="ghost" onClick={() => { setModal(false); setForm(BLANK); }}>Cancel</Button>
            <Button variant="primary" loading={creating} onClick={() => create(form)}>Create Exam</Button>
          </div>
        </Modal>

      </div>
    </PageWrapper>
  );
}