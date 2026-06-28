import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, Radio, CheckCircle, Clock, Users, TrendingUp, Award } from 'lucide-react';
import { PageWrapper, Button, Badge, Skeleton, Modal, EmptyState, ConfirmDialog, Select, Input, Textarea, Toggle } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const getOptionsArray = (options) => {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .ed-root {
    --navy:     var(--local-navy, #0A0E1A);
    --navy2:    var(--local-navy2, #0F1629);
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    var(--local-cream, #F5F0E8);
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --red:      #EF4444;
    --muted:    var(--local-muted, rgba(245,240,232,0.45));
    --card-bg:  var(--local-card-bg, rgba(255,255,255,0.04));
    --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.08));
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

function findTopicPath(topics, targetId, currentPath = []) {
  if (!topics || !targetId) return null;
  for (const topic of topics) {
    if (topic.id === targetId) {
      return [...currentPath, topic];
    }
    if (topic.children && topic.children.length > 0) {
      const path = findTopicPath(topic.children, targetId, [...currentPath, topic]);
      if (path) return path;
    }
  }
  return null;
}

function getDescendantTopicIds(topic) {
  let ids = [topic.id];
  if (topic.children) {
    for (const child of topic.children) {
      ids = [...ids, ...getDescendantTopicIds(child)];
    }
  }
  return ids;
}

const BLANK = {
  title: '', description: '',
  duration_minutes: 60, total_marks: 100, passing_marks: 40,
  is_premium: false,
  subject_id: '',
  curriculum_id: '', class_id: '', topic_id: '',
};

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [addQModal, setAddQModal]   = useState(false);
  const [schedModal, setSchedModal] = useState(false);
  const [schedForm, setSchedForm]   = useState({ scheduled_at: '' });
  const [selected, setSelected]     = useState([]);
  const [activeTab, setActiveTab]   = useState('questions');
  const [filterTopicId, setFilterTopicId] = useState('');
  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);
  const [confirmRescheduleOpen, setConfirmRescheduleOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [activeImage, setActiveImage]         = useState(null);

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm]   = useState(BLANK);

  const { data: exam, loading, refetch } = useApi(() => adminApi.getExam(id), null, [id]);
  const { data: curriculums } = useApi(adminApi.getCurriculums);
  const { data: subjects } = useApi(adminApi.getSubjects);
  
  const { data: allQuestions } = useApi(
    adminApi.getQuestions,
    useMemo(() => ({ subject_id: exam?.subject_id, limit: 1000 }), [exam?.subject_id]),
    [exam?.subject_id]
  );
  
  const { data: results } = useApi(() => adminApi.getExamResults(id), null, [id]);
  const { data: hierarchy } = useApi(adminApi.getHierarchy);

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

  const { mutate: duplicateExam, loading: duplicating } = useMutation(
    () => adminApi.duplicateExam(id),
    {
      onSuccess: (res) => {
        navigate(`/admin/exams/${res.data?.id || res.data?.data?.id || res.data}`);
      },
      successMsg: 'Exam duplicated'
    }
  );

  const { mutate: deleteExam, loading: deleting } = useMutation(
    () => adminApi.deleteExam(id),
    {
      onSuccess: () => navigate('/admin/exams'),
      successMsg: 'Exam deleted successfully'
    }
  );

  const { mutate: updateExam, loading: updatingExam } = useMutation(
    (formData) => adminApi.updateExam(id, formData),
    {
      onSuccess: () => {
        setEditModal(false);
        refetch();
      },
      successMsg: 'Exam details updated'
    }
  );

  const editSubjectNode = useMemo(() => {
    if (!editForm.subject_id || !hierarchy) return null;
    for (const curr of hierarchy) {
      for (const cls of curr.classes) {
        for (const subj of cls.subjects) {
          if (subj.id === editForm.subject_id) {
            return subj;
          }
        }
      }
    }
    return null;
  }, [hierarchy, editForm.subject_id]);

  const editSelectedTopicPath = useMemo(() => {
    if (!editSubjectNode || !editForm.topic_id) return [];
    return findTopicPath(editSubjectNode.topics, editForm.topic_id) || [];
  }, [editSubjectNode, editForm.topic_id]);

  const editFilteredClasses = useMemo(() => {
    const list = subjects ?? [];
    if (!editForm.curriculum_id) return [];
    const seen = new Set();
    const result = [];
    list.forEach((s) => {
      if (String(s.curriculum_id) === String(editForm.curriculum_id) && s.class_id) {
        if (!seen.has(s.class_id)) {
          seen.add(s.class_id);
          result.push({ id: s.class_id, name: s.class_name });
        }
      }
    });
    return result;
  }, [subjects, editForm.curriculum_id]);

  const editFilteredSubjects = useMemo(() => {
    const list = subjects ?? [];
    if (!editForm.class_id) return [];
    return list.filter((s) => String(s.class_id) === String(editForm.class_id));
  }, [subjects, editForm.class_id]);

  const setEdit = (k, v) => setEditForm((p) => ({ ...p, [k]: v }));

  const handleEditCurriculumChange = (currId) => setEditForm((p) => ({ ...p, curriculum_id: currId, class_id: '', subject_id: '', topic_id: '' }));
  const handleEditClassChange = (classId) => setEditForm((p) => ({ ...p, class_id: classId, subject_id: '', topic_id: '' }));
  const handleEditSubjectChange = (subjectId) => setEditForm((p) => ({ ...p, subject_id: subjectId, topic_id: '' }));

  const handleEditTopicDropdownChange = (index, value) => {
    if (!value) {
      if (index === 0) {
        setEdit('topic_id', '');
      } else {
        setEdit('topic_id', editSelectedTopicPath[index - 1].id);
      }
    } else {
      setEdit('topic_id', value);
    }
  };

  const openEdit = () => {
    setEditForm({
      title: exam.title || '',
      description: exam.description || '',
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks || 0,
      passing_marks: exam.passing_marks ?? '',
      is_premium: exam.is_premium || false,
      subject_id: exam.subject_id || '',
      curriculum_id: exam.curriculum_id || '',
      class_id: exam.class_id || '',
      topic_id: exam.topic_id || '',
    });
    setEditModal(true);
  };

  const subjectNode = useMemo(() => {
    if (!exam?.subject_id || !hierarchy) return null;
    for (const curr of hierarchy) {
      for (const cls of curr.classes) {
        for (const subj of cls.subjects) {
          if (subj.id === exam.subject_id) {
            return subj;
          }
        }
      }
    }
    return null;
  }, [hierarchy, exam?.subject_id]);

  const filterTopicPath = useMemo(() => {
    if (!subjectNode || !filterTopicId) return [];
    return findTopicPath(subjectNode.topics, filterTopicId) || [];
  }, [subjectNode, filterTopicId]);

  const existingIds  = new Set((exam?.questions ?? []).map((q) => q.id));
  const availableQs  = (allQuestions ?? []).filter((q) => !existingIds.has(q.id));
  
  const filteredAvailableQs = useMemo(() => {
    const list = availableQs ?? [];
    if (!filterTopicId || !subjectNode) return list;
    
    const findNode = (topics, id) => {
      if (!topics) return null;
      for (const t of topics) {
        if (t.id === id) return t;
        if (t.children) {
          const found = findNode(t.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const selectedTopicNode = findNode(subjectNode.topics, filterTopicId);
    if (!selectedTopicNode) return list.filter((q) => q.topic_id === filterTopicId);
    
    const allowedIds = new Set(getDescendantTopicIds(selectedTopicNode));
    return list.filter((q) => q.topic_id && allowedIds.has(q.topic_id));
  }, [availableQs, filterTopicId, subjectNode]);

  const toggleSelect = (qid) =>
    setSelected((p) => p.includes(qid) ? p.filter((x) => x !== qid) : [...p, qid]);

  const handleFilterTopicChange = (index, value) => {
    if (!value) {
      if (index === 0) {
        setFilterTopicId('');
      } else {
        setFilterTopicId(filterTopicPath[index - 1].id);
      }
    } else {
      setFilterTopicId(value);
    }
  };

  const isDraft     = exam?.status === 'draft';
  const isScheduled = exam?.status === 'scheduled';
  const isLive      = exam?.status === 'live';
  const canEdit     = exam?.status !== 'live';

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
                <span><Clock size={11} style={{ color: 'var(--cyan)' }} />{exam.duration_minutes ? `${exam.duration_minutes}m` : 'Untimed'}</span>
                <span>{exam.total_marks} marks</span>
                {exam.passing_marks && <span>Pass: {exam.passing_marks}</span>}
              </div>
            </div>
          </div>

          <div className="ed-header-actions">
            {canEdit && (
              <button className="ed-btn-outline" style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => setConfirmDeleteOpen(true)}>
                Delete Exam
              </button>
            )}

            <button className="ed-btn-outline" onClick={() => duplicateExam()} disabled={duplicating}>
              Duplicate
            </button>

            {canEdit && (
              <>
                <button className="ed-btn-outline" onClick={openEdit}>
                  Edit Details
                </button>
                <button className="ed-btn-primary" onClick={() => setAddQModal(true)}>
                  <Plus size={14} /> Add Questions
                </button>
              </>
            )}

            {isDraft && (
              <>
                <button className="ed-btn-golive" onClick={() => goLive()}>
                  <Radio size={13} /> Enable
                </button>
                <button className="ed-btn-outline" onClick={() => setSchedModal(true)}>
                  <Calendar size={14} /> Schedule
                </button>
              </>
            )}
            {isScheduled && (
              <>
                <button className="ed-btn-outline" onClick={() => setSchedModal(true)}>
                  <Calendar size={14} /> Reschedule
                </button>
                <button className="ed-btn-golive" onClick={() => goLive()}>
                  <Radio size={13} /> Go Live
                </button>
              </>
            )}
            {isLive && (
              <button className="ed-btn-danger" onClick={() => endExam()}>
                End Exam
              </button>
            )}
            {exam.status === 'ended' && (
              <>
                <button className="ed-btn-golive" onClick={() => setConfirmPublishOpen(true)}>
                  <Radio size={13} /> Publish
                </button>
                <button className="ed-btn-outline" onClick={() => setConfirmRescheduleOpen(true)}>
                  <Calendar size={14} /> Reschedule
                </button>
              </>
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
                  action={canEdit && (
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
                      onClick={() => setViewingQuestion(q)}
                      style={{ cursor: 'pointer' }}
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
                      {canEdit && (
                        <button className="ed-q-remove" onClick={(e) => { e.stopPropagation(); removeQ(q.id); }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Topic Filters */}
            {subjectNode && subjectNode.topics && subjectNode.topics.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <Select
                  label="Filter by Topic"
                  value={filterTopicPath[0]?.id ?? ''}
                  onChange={(e) => handleFilterTopicChange(0, e.target.value)}
                >
                  <option value="">All Topics</option>
                  {subjectNode.topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>

                {filterTopicPath.map((topicNode, idx) => {
                  if (!topicNode.children || topicNode.children.length === 0) return null;
                  const nextIdx = idx + 1;
                  return (
                    <Select
                      key={topicNode.id}
                      label="Filter by Sub-topic"
                      value={filterTopicPath[nextIdx]?.id ?? ''}
                      onChange={(e) => handleFilterTopicChange(nextIdx, e.target.value)}
                    >
                      <option value="">All Sub-topics</option>
                      {topicNode.children.map(child => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                      ))}
                    </Select>
                  );
                })}
              </div>
            )}

            <div className="ed-modal-q-list">
              {filteredAvailableQs.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2.5rem 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  No available questions found matching your filter criteria.
                </p>
              ) : (
                filteredAvailableQs.map((q) => {
                  const sel = selected.includes(q.id);
                  return (
                    <motion.div
                      key={q.id}
                      onClick={() => toggleSelect(q.id)}
                      className={clsx('ed-modal-q-item', sel && 'ed-modal-q-sel')}
                      whileTap={{ scale: 0.98 }}
                      style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', padding: '1rem' }}
                    >
                      <div className={clsx('ed-checkbox', sel && 'ed-checkbox-sel')} style={{ marginTop: '3px' }}>
                        {sel && <span className="ed-check-mark">✓</span>}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <p className="ed-modal-q-text" style={{ fontWeight: '500', fontSize: '0.82rem', margin: 0, color: 'var(--cream)', lineHeight: '1.4' }}>
                              {q.question_text}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                              <span className="ed-q-type-pill" style={{ padding: '0.1rem 0.45rem', fontSize: '0.62rem', letterSpacing: '0.02em', textTransform: 'uppercase', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--lavender)', borderRadius: '50px' }}>
                                {q.question_type === 'photo' ? 'structure' : (q.question_type ? q.question_type.replace('_', ' ') : 'mcq')}
                              </span>
                              {q.difficulty && (
                                <span 
                                  style={{ 
                                    padding: '0.1rem 0.45rem', 
                                    fontSize: '0.62rem', 
                                    fontWeight: 'bold', 
                                    borderRadius: '50px',
                                    background: q.difficulty === 'easy' ? 'rgba(16,185,129,0.12)' : q.difficulty === 'hard' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                    color: q.difficulty === 'easy' ? '#34D399' : q.difficulty === 'hard' ? '#F87171' : '#FCD34D',
                                    border: q.difficulty === 'easy' ? '1px solid rgba(16,185,129,0.2)' : q.difficulty === 'hard' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em'
                                  }}
                                >
                                  {q.difficulty}
                                </span>
                              )}
                              {q.topic_name && <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>• {q.topic_name}</span>}
                            </div>
                          </div>
                          
                          {q.image_url && (
                            <img 
                              src={q.image_url} 
                              alt="thumbnail" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImage(q.image_url);
                              }}
                              style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', cursor: 'zoom-in' }} 
                            />
                          )}
                        </div>
                        
                        {(() => {
                          const opts = getOptionsArray(q.options);
                          if (opts.length === 0) return null;
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.4rem', marginTop: '0.6rem' }}>
                              {opts.map((opt, idx) => (
                                <div 
                                  key={idx} 
                                  style={{ 
                                    fontSize: '0.72rem', 
                                    color: 'rgba(250,250,250,0.5)', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    padding: '0.3rem 0.6rem', 
                                    borderRadius: '6px', 
                                    border: '1px solid rgba(255,255,255,0.04)',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <strong style={{ marginRight: '0.2rem', color: 'rgba(250,250,250,0.3)' }}>{opt.key || String.fromCharCode(65 + idx)}.</strong>
                                  {typeof opt === 'object' ? (opt.text || opt.value || opt.key || JSON.stringify(opt)) : opt}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
          {selected.length > 0 && (
            <div className="ed-modal-footer">
              <p className="ed-sel-count">{selected.length} selected</p>
              <Button variant="primary" loading={adding} onClick={addQs}>Add to Exam</Button>
            </div>
          )}
        </Modal>

        {/* ── Schedule Modal ── */}
        <Modal open={schedModal} onClose={() => setSchedModal(false)} title={exam.status === 'ended' ? "Reschedule Exam" : "Schedule Exam"} size="sm" preventOutsideClickClose={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              type="datetime-local"
              label="Start Date & Time"
              value={schedForm.scheduled_at}
              onChange={(e) => setSchedForm({ scheduled_at: e.target.value })}
            />
            <p className="ed-sched-note">
              {exam.duration_minutes ? (
                <>
                  The exam will automatically go live at the scheduled time and end after{' '}
                  <strong>{exam.duration_minutes} minutes</strong>.
                  Unsubmitted attempts will be auto-submitted when time is up.
                </>
              ) : (
                <>
                  The exam will automatically go live at the scheduled time and will remain untimed.
                  Admins must manually end the exam when finished.
                </>
              )}
            </p>
          </div>
          <div className="ed-modal-footer-end">
            <Button variant="ghost" onClick={() => setSchedModal(false)}>Cancel</Button>
            <Button variant="primary" loading={scheduling} onClick={schedule}>
              {exam.status === 'ended' ? 'Reschedule' : 'Schedule'}
            </Button>
          </div>
        </Modal>

        {/* ── Edit Details Modal ── */}
        <Modal open={editModal} onClose={() => { setEditModal(false); }} title="Edit Exam Details" size="lg" preventOutsideClickClose={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Title" placeholder="e.g. Mid-term Exam" value={editForm.title} onChange={(e) => setEdit('title', e.target.value)} />
            <Textarea label="Description" rows={2} value={editForm.description} onChange={(e) => setEdit('description', e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              <Select label="Curriculum" value={editForm.curriculum_id} onChange={(e) => handleEditCurriculumChange(e.target.value)}>
                <option value="">No curriculum</option>
                {(curriculums ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Select label="Class" value={editForm.class_id} onChange={(e) => handleEditClassChange(e.target.value)}>
                <option value="">{editForm.curriculum_id ? 'No class' : 'Select curriculum first'}</option>
                {editFilteredClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Subject" value={editForm.subject_id} onChange={(e) => handleEditSubjectChange(e.target.value)}>
                <option value="">{editForm.class_id ? 'No subject' : 'Select class first'}</option>
                {editFilteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>

            {editSubjectNode && editSubjectNode.topics && editSubjectNode.topics.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Select
                  label="Topic (Optional)"
                  value={editSelectedTopicPath[0]?.id ?? ''}
                  onChange={(e) => handleEditTopicDropdownChange(0, e.target.value)}
                >
                  <option value="">Select topic…</option>
                  {editSubjectNode.topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>

                {editSelectedTopicPath.map((topicNode, idx) => {
                  if (!topicNode.children || topicNode.children.length === 0) return null;
                  const nextIdx = idx + 1;
                  return (
                    <Select
                      key={topicNode.id}
                      label="Sub-topic (Optional)"
                      value={editSelectedTopicPath[nextIdx]?.id ?? ''}
                      onChange={(e) => handleEditTopicDropdownChange(nextIdx, e.target.value)}
                    >
                      <option value="">Select sub-topic…</option>
                      {topicNode.children.map(child => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                      ))}
                    </Select>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: editForm.duration_minutes !== null ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.75rem' }}>
              {editForm.duration_minutes !== null && (
                <Input label="Duration (min)" type="number" value={editForm.duration_minutes || ''} onChange={(e) => setEdit('duration_minutes', e.target.value === '' ? null : +e.target.value)} />
              )}
              <Input label="Total Marks"    type="number" value={editForm.total_marks || ''}       onChange={(e) => setEdit('total_marks',       e.target.value === '' ? '' : +e.target.value)} />
              <Input label="Passing Marks"  type="number" value={editForm.passing_marks || ''}     onChange={(e) => setEdit('passing_marks',     e.target.value === '' ? null : +e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Toggle label="Enable Exam Timer" checked={editForm.duration_minutes !== null} onChange={(checked) => setEdit('duration_minutes', checked ? 60 : null)} />
              <Toggle label="Premium exam" checked={editForm.is_premium} onChange={(v) => setEdit('is_premium', v)} />
            </div>
          </div>
          <div className="ed-modal-footer-end">
            <Button variant="ghost" onClick={() => { setEditModal(false); }}>Cancel</Button>
            <Button variant="primary" loading={updatingExam} onClick={() => updateExam(editForm)}>Save Changes</Button>
          </div>
        </Modal>

        {/* ── Confirm Publish Dialog ── */}
        <ConfirmDialog
          open={confirmPublishOpen}
          onClose={() => setConfirmPublishOpen(false)}
          onConfirm={() => {
            setConfirmPublishOpen(false);
            goLive();
          }}
          title="Republish Exam?"
          description="Warning: Publishing this exam again will permanently delete all previous student submissions and results for this exam. Students will be able to take the exam again immediately. Do you want to proceed?"
          danger={true}
        />

        {/* ── Confirm Reschedule Dialog ── */}
        <ConfirmDialog
          open={confirmRescheduleOpen}
          onClose={() => setConfirmRescheduleOpen(false)}
          onConfirm={() => {
            setConfirmRescheduleOpen(false);
            setSchedModal(true);
          }}
          title="Reschedule Exam?"
          description="Warning: Rescheduling this exam will permanently delete all previous student submissions and results for this exam. Students will be able to take the exam again at the newly scheduled time. Do you want to proceed?"
          danger={true}
        />

        {/* ── Confirm Delete Dialog ── */}
        <ConfirmDialog
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={() => {
            setConfirmDeleteOpen(false);
            deleteExam();
          }}
          title="Delete Exam?"
          description="Are you sure you want to permanently delete this exam? This action cannot be undone."
          danger={true}
        />

        {/* ── Question Details Modal ── */}
        <Modal
          open={!!viewingQuestion}
          onClose={() => setViewingQuestion(null)}
          title="Question Details"
          size="md"
        >
          {viewingQuestion && (
            <div className="ed-q-view">
              <style>{`
                .ed-q-view-title { font-size: 1rem; font-weight: 600; color: #fafafa; margin-bottom: 1rem; line-height: 1.5; }
                .ed-q-view-meta { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
                .ed-q-view-img { max-width: 100%; max-height: 250px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.065); margin-bottom: 1.25rem; display: block; object-fit: contain; background: rgba(0,0,0,0.2); }
                .ed-q-view-options { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem; }
                .ed-q-view-option {
                  padding: 0.75rem 1rem; border-radius: 12px;
                  border: 1px solid rgba(255,255,255,0.05);
                  background: rgba(255,255,255,0.02);
                  font-size: 0.85rem; color: rgba(250,250,250,0.8);
                  display: flex; align-items: center; gap: 0.75rem;
                }
                .ed-q-view-option-correct {
                  border-color: rgba(16,185,129,0.3) !important;
                  background: rgba(16,185,129,0.08) !important;
                  color: #34D399 !important;
                  font-weight: 600;
                }
                .ed-q-view-correct-badge {
                  background: rgba(16,185,129,0.2); color: #34D399;
                  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
                  padding: 0.15rem 0.45rem; border-radius: 4px;
                }
                .ed-q-view-explanation {
                  padding: 1rem; border-radius: 12px;
                  background: rgba(99,102,241,0.05);
                  border: 1px solid rgba(99,102,241,0.15);
                  font-size: 0.8rem; color: rgba(250,250,250,0.7);
                  line-height: 1.5;
                }
              `}</style>
              <div className="ed-q-view-meta">
                <span className="ed-q-type-pill">{viewingQuestion.question_type ? viewingQuestion.question_type.replace('_', ' ') : 'mcq'}</span>
                <span className="ed-q-marks-pill">{viewingQuestion.marks || 1} mark(s)</span>
              </div>
              <div className="ed-q-view-title">{viewingQuestion.question_text}</div>
              
              {viewingQuestion.image_url && (
                <img 
                  src={viewingQuestion.image_url} 
                  alt="Question" 
                  className="ed-q-view-img" 
                  onClick={() => setActiveImage(viewingQuestion.image_url)}
                  style={{ cursor: 'zoom-in' }}
                />
              )}
              
              {(() => {
                const opts = getOptionsArray(viewingQuestion.options);
                if (opts.length === 0) return null;
                return (
                  <div className="ed-q-view-options">
                    {opts.map((opt, idx) => {
                      const isCorrect = String(viewingQuestion.correct_answer).toUpperCase() === String(opt.key || opt.id || String.fromCharCode(65 + idx)).toUpperCase();
                      return (
                        <div key={idx} className={`ed-q-view-option ${isCorrect ? 'ed-q-view-option-correct' : ''}`}>
                          <span style={{ fontWeight: 700, color: isCorrect ? '#34D399' : 'rgba(250,250,250,0.3)' }}>
                            {opt.key || String.fromCharCode(65 + idx)}.
                          </span>
                          <span>{typeof opt === 'object' ? (opt.text || opt.value || opt.key || JSON.stringify(opt)) : opt}</span>
                          {isCorrect && <span className="ed-q-view-correct-badge" style={{ marginLeft: 'auto' }}>Correct</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              
              {viewingQuestion.explanation && (
                <div className="ed-q-view-explanation">
                  <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#818cf8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explanation</div>
                  <div>{viewingQuestion.explanation}</div>
                </div>
              )}
              
              <div className="ed-modal-footer-end">
                <Button onClick={() => setViewingQuestion(null)}>Close</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Image Preview Modal ── */}
        <Modal open={!!activeImage} onClose={() => setActiveImage(null)} title="Image Preview" size="xl">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
            <img src={activeImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '12px', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        </Modal>

      </div>
    </PageWrapper>
  );
}