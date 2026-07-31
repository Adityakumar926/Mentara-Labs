import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Clock, Users, CheckCircle, Radio } from 'lucide-react';
import { PageWrapper, Button, Badge, EmptyState, SkeletonCard, Modal, Input, Select, Textarea, Toggle } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import HierarchySidebar from '@/components/shared/HierarchySidebar';

/* ─── unchanged helpers ─── */
const STATUS_BADGE = { draft: 'muted', scheduled: 'indigo', live: 'success', ended: 'muted' };
const BLANK = {
  title: '', description: '',
  duration_minutes: 60, total_marks: 100, passing_marks: 40,
  is_premium: false,
  certificate_enabled: false,
  subject_id: '',
  curriculum_id: '', class_id: '', topic_id: '',
};

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .ep-root {
    --navy:     var(--local-navy, #0A0E1A);
    --navy2:    var(--local-navy2, #0F1629);
    --violet:   #7C3AED;
    --violet-l: var(--local-violet-l, #9D6FEF);
    --cyan:     var(--local-cyan, #00D4FF);
    --cream:    var(--local-cream, #F5F0E8);
    --lavender: var(--local-lavender, #C4B5FD);
    --green:    var(--local-green, #10B981);
    --amber:    var(--local-amber, #F59E0B);
    --red:      var(--local-red, #EF4444);
    --muted:    var(--local-muted, rgba(245,240,232,0.45));
    --card-bg:  var(--local-card-bg, rgba(255,255,255,0.04));
    --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.08));
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
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.25rem;
  }

  /* ── EXAM CARD ── */
  .ep-card {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 0;
    display: flex; flex-direction: column;
    backdrop-filter: blur(14px);
    overflow: hidden;
    text-decoration: none; color: inherit;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.25s;
    cursor: pointer;
    min-height: 200px;
  }
  .ep-card:hover {
    border-color: rgba(124,58,237,0.4);
    box-shadow: 0 20px 56px rgba(0,0,0,0.32), 0 0 0 1px rgba(124,58,237,0.12);
    transform: translateY(-4px);
  }

  /* strip by status */
  .ep-card-strip {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    border-radius: 24px 24px 0 0;
  }
  .ep-strip-draft     { background: linear-gradient(90deg, rgba(245,240,232,0.3), transparent); }
  .ep-strip-scheduled { background: linear-gradient(90deg, var(--cyan), rgba(0,212,255,0)); }
  .ep-strip-live      { background: linear-gradient(90deg, #34D399, rgba(16,185,129,0)); }
  .ep-strip-ended     { background: linear-gradient(90deg, rgba(245,240,232,0.15), transparent); }

  /* glow on hover */
  .ep-card-glow {
    position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none;
    width: 200px; height: 200px; top: -70px; right: -50px; opacity: 0;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    transition: opacity 0.45s;
  }
  .ep-card:hover .ep-card-glow { opacity: 1; }

  /* live pulse indicator */
  .ep-live-pulse {
    width: 7px; height: 7px; border-radius: 50%;
    background: #34D399; box-shadow: 0 0 8px #34D399;
    animation: ep-blink 1.4s ease infinite;
    flex-shrink: 0;
  }

  /* ── CARD BODY (padded area) ── */
  .ep-card-body {
    padding: 1.4rem 1.4rem 1rem;
    display: flex; flex-direction: column; gap: 0.85rem;
    flex: 1;
  }

  /* ── CARD HEAD row ── */
  .ep-card-head {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem;
  }
  .ep-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem; font-weight: 700; color: var(--cream);
    line-height: 1.35; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    flex: 1;
  }

  /* ── STATUS PILL ── */
  .ep-status {
    font-size: 0.6rem; font-weight: 800; letter-spacing: 0.09em;
    text-transform: uppercase; padding: 0.24rem 0.7rem; border-radius: 50px;
    white-space: nowrap; flex-shrink: 0;
    display: flex; align-items: center; gap: 0.3rem;
  }
  .ep-status-draft     { background: rgba(245,240,232,0.06); border: 1px solid rgba(245,240,232,0.1); color: var(--muted); }
  .ep-status-scheduled { background: rgba(0,212,255,0.1);    border: 1px solid rgba(0,212,255,0.25);  color: var(--cyan); }
  .ep-status-live      { background: rgba(16,185,129,0.15);  border: 1px solid rgba(16,185,129,0.3);  color: #34D399; box-shadow: 0 0 12px rgba(16,185,129,0.2); }
  .ep-status-ended     { background: rgba(245,240,232,0.04); border: 1px solid rgba(245,240,232,0.08); color: rgba(245,240,232,0.3); }

  /* ── META (subject, topic, cert badge) ── */
  .ep-card-meta {
    display: flex; flex-direction: column; gap: 0.35rem;
  }
  .ep-meta-subject {
    font-size: 0.76rem; font-weight: 600;
    color: var(--violet-l);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .ep-meta-topic {
    font-size: 0.71rem; color: var(--muted); font-weight: 500;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .ep-cert-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.63rem; font-weight: 700;
    color: #A78BFA;
    background: rgba(139,92,246,0.12);
    border: 1px solid rgba(139,92,246,0.28);
    padding: 0.18rem 0.55rem;
    border-radius: 50px;
    width: fit-content;
    letter-spacing: 0.02em;
  }

  /* ── STATS ROW ── */
  .ep-card-stats {
    display: flex; align-items: center;
    gap: 0;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.055);
    border-radius: 14px;
    overflow: hidden;
  }
  .ep-stat-chip {
    flex: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 0.55rem 0.35rem;
    gap: 0.15rem;
    border-right: 1px solid rgba(255,255,255,0.055);
    min-width: 0;
  }
  .ep-stat-chip:last-child { border-right: none; }
  .ep-stat-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.85rem; font-weight: 700;
    color: var(--cream);
    line-height: 1;
  }
  .ep-stat-label {
    font-size: 0.58rem; font-weight: 600;
    color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.05em;
    line-height: 1;
  }

  /* ── CARD FOOTER ── */
  .ep-card-foot {
    display: flex; align-items: center;
    padding: 0.75rem 1.4rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    gap: 0.5rem;
    background: rgba(0,0,0,0.08);
  }
  .ep-duplicate-btn {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--muted);
    border-radius: 50px;
    padding: 0.32rem 0.85rem;
    font-size: 0.67rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif;
    white-space: nowrap;
  }
  .ep-duplicate-btn:hover {
    border-color: rgba(124,58,237,0.4);
    background: rgba(124,58,237,0.12);
    color: var(--cream);
  }
  .ep-view-btn {
    margin-left: auto;
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.72rem; font-weight: 700;
    color: var(--violet-l);
    padding: 0.32rem 0.85rem;
    border-radius: 50px;
    border: 1px solid rgba(124,58,237,0.25);
    background: rgba(124,58,237,0.08);
    transition: all 0.2s;
    white-space: nowrap;
  }
  .ep-card:hover .ep-view-btn {
    color: var(--cyan); border-color: rgba(0,212,255,0.35);
    background: rgba(0,212,255,0.08);
  }

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

export default function ExamsPage() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(BLANK);
  const [filter, setFilter] = useState('');
  const [certFilter, setCertFilter] = useState(false);

  const { data: exams, loading, refetch } = useApi(
    adminApi.getExams,
    useMemo(() => {
      const params = {};
      if (selectedNode) {
        if (selectedNode.type === 'curriculum') params.curriculum_id = selectedNode.id;
        else if (selectedNode.type === 'class') params.class_id = selectedNode.id;
        else if (selectedNode.type === 'subject') params.subject_id = selectedNode.id;
        else if (selectedNode.type === 'topic') params.topic_id = selectedNode.id;
      }
      return params;
    }, [selectedNode]),
    [selectedNode]
  );
  
  const { data: curriculums } = useApi(adminApi.getCurriculums);
  const { data: subjects } = useApi(adminApi.getSubjects);
  const { data: hierarchy } = useApi(adminApi.getHierarchy);

  const { mutate: create, loading: creating } = useMutation(adminApi.createExam, {
    onSuccess: () => { setModal(false); setForm(BLANK); refetch(); },
    successMsg: 'Exam created',
  });

  const { mutate: duplicateExam, loading: duplicating } = useMutation(adminApi.duplicateExam, {
    onSuccess: () => { refetch(); },
    successMsg: 'Exam duplicated',
  });

  const subjectNode = useMemo(() => {
    if (!form.subject_id || !hierarchy) return null;
    for (const curr of hierarchy) {
      for (const cls of curr.classes) {
        for (const subj of cls.subjects) {
          if (subj.id === form.subject_id) {
            return subj;
          }
        }
      }
    }
    return null;
  }, [hierarchy, form.subject_id]);

  const selectedTopicPath = useMemo(() => {
    if (!subjectNode || !form.topic_id) return [];
    return findTopicPath(subjectNode.topics, form.topic_id) || [];
  }, [subjectNode, form.topic_id]);

  const filteredClasses = useMemo(() => {
    const list = subjects ?? [];
    if (!form.curriculum_id) return [];
    const seen = new Set();
    const result = [];
    list.forEach((s) => {
      if (String(s.curriculum_id) === String(form.curriculum_id) && s.class_id) {
        if (!seen.has(s.class_id)) {
          seen.add(s.class_id);
          result.push({ id: s.class_id, name: s.class_name });
        }
      }
    });
    return result;
  }, [subjects, form.curriculum_id]);

  const filteredSubjects = useMemo(() => {
    const list = subjects ?? [];
    if (!form.class_id) return [];
    return list.filter((s) => String(s.class_id) === String(form.class_id));
  }, [subjects, form.class_id]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => {
    if (selectedNode) {
      setForm({
        ...BLANK,
        curriculum_id: selectedNode.pathIds.curriculum_id ?? '',
        class_id: selectedNode.pathIds.class_id ?? '',
        subject_id: selectedNode.pathIds.subject_id ?? '',
        topic_id: selectedNode.pathIds.topic_id ?? '',
      });
    } else {
      setForm(BLANK);
    }
    setModal(true);
  };

  const handleCurriculumChange = (currId) => setForm((p) => ({ ...p, curriculum_id: currId, class_id: '', subject_id: '', topic_id: '' }));
  const handleClassChange = (classId) => setForm((p) => ({ ...p, class_id: classId, subject_id: '', topic_id: '' }));
  const handleSubjectChange = (subjectId) => setForm((p) => ({ ...p, subject_id: subjectId, topic_id: '' }));

  const handleTopicDropdownChange = (index, value) => {
    if (!value) {
      if (index === 0) {
        set('topic_id', '');
      } else {
        set('topic_id', selectedTopicPath[index - 1].id);
      }
    } else {
      set('topic_id', value);
    }
  };

  const filtered    = (exams ?? []).filter((e) => {
    const statusMatch = !filter || e.status === filter;
    const certMatch = !certFilter || e.certificate_enabled === true;
    return statusMatch && certMatch;
  });

  return (
    <PageWrapper className="p-0">
      <style>{CSS}</style>
      <div className="ep-root" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <HierarchySidebar
          selectedNodeId={selectedNode?.id}
          selectedNodeType={selectedNode?.type}
          onSelectNode={setSelectedNode}
        />
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
          {/* ── Header ── */}
          <motion.div className="ep-header" variants={headerV} initial="hidden" animate="show">
            <div className="ep-hblob ep-hblob-1" />
            <div className="ep-hblob ep-hblob-2" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="ep-eyebrow">
                <span className="ep-eyebrow-dot" />
                {selectedNode?.pathNames ? selectedNode.pathNames.join(' > ') : 'Admin · Exams'}
              </div>
              <h1 className="ep-title">Exam Management</h1>
              <p className="ep-subtitle">
                {exams?.length ?? 0} exam{exams?.length !== 1 ? 's' : ''} · draft, schedule, and run assessments
              </p>
            </div>
            <button className="ep-new-btn" onClick={openCreate}>
              <Plus size={15} /> New Exam
            </button>
          </motion.div>

          {/* ── Filter tabs ── */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.35 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.4rem' }}
          >
            <div className="ep-filters" style={{ marginBottom: 0 }}>
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

            <button
              onClick={() => setCertFilter(p => !p)}
              className={clsx('ep-filter-btn', certFilter && 'ep-filter-btn-active')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: certFilter ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.1))' : 'rgba(255,255,255,0.03)',
                color: certFilter ? '#A78BFA' : 'var(--muted)',
                boxShadow: certFilter ? '0 0 18px rgba(139, 92, 246, 0.2)' : 'none',
                transition: 'all 0.2s ease',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🎓 Certificate Enabled
            </button>
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
                  <button className="ep-new-btn" onClick={openCreate}>
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
                    <Link to={`/admin/exams/${e.id}`} className="ep-card">
                      <div className={`ep-card-strip ep-strip-${e.status}`} />
                      <div className="ep-card-glow" />

                      {/* ── Card Body ── */}
                      <div className="ep-card-body">

                        {/* Row 1: Title + Status pill */}
                        <div className="ep-card-head">
                          <p className="ep-card-title">{e.title}</p>
                          <span className={`ep-status ep-status-${e.status}`}>
                            {e.status === 'live' && <span className="ep-live-pulse" />}
                            {e.status}
                          </span>
                        </div>

                        {/* Row 2: Subject / Topic / Cert badge */}
                        <div className="ep-card-meta">
                          {e.subject_name && (
                            <span className="ep-meta-subject">
                              📘 {e.subject_name}
                            </span>
                          )}
                          {e.topic_name && (
                            <span className="ep-meta-topic">↳ {e.topic_name}</span>
                          )}
                          {e.certificate_enabled && (
                            <span className="ep-cert-badge">🎓 Certificate Enabled</span>
                          )}
                        </div>

                        {/* Row 3: Stats chips */}
                        <div className="ep-card-stats">
                          <div className="ep-stat-chip">
                            <span className="ep-stat-val" style={{ color: 'var(--cyan)' }}>
                              {e.duration_minutes ? `${e.duration_minutes}m` : '∞'}
                            </span>
                            <span className="ep-stat-label">Duration</span>
                          </div>
                          <div className="ep-stat-chip">
                            <span className="ep-stat-val" style={{ color: 'var(--violet-l)' }}>
                              {e.submission_count ?? 0}
                            </span>
                            <span className="ep-stat-label">Submitted</span>
                          </div>
                          <div className="ep-stat-chip">
                            <span className="ep-stat-val" style={{ color: '#FCD34D' }}>
                              {e.question_count ?? 0}
                            </span>
                            <span className="ep-stat-label">Questions</span>
                          </div>
                        </div>

                      </div>{/* end card-body */}

                      {/* ── Card Footer ── */}
                      <div className="ep-card-foot">
                        <button
                          type="button"
                          onClick={(evt) => {
                            evt.preventDefault();
                            evt.stopPropagation();
                            duplicateExam(e.id);
                          }}
                          className="ep-duplicate-btn"
                          title="Duplicate this exam"
                          disabled={duplicating}
                        >
                          Duplicate
                        </button>
                        <span className="ep-view-btn">
                          View <ChevronRight size={12} />
                        </span>
                      </div>

                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ── Create modal ── */}
        <Modal open={modal} onClose={() => { setModal(false); setForm(BLANK); }} title="Create Exam" size="lg" preventOutsideClickClose={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Title" placeholder="e.g. Mid-term Exam" value={form.title} onChange={(e) => set('title', e.target.value)} />
            <Textarea label="Description" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              <Select label="Curriculum" value={form.curriculum_id} onChange={(e) => handleCurriculumChange(e.target.value)}>
                <option value="">No curriculum</option>
                {(curriculums ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Select label="Class" value={form.class_id} onChange={(e) => handleClassChange(e.target.value)}>
                <option value="">{form.curriculum_id ? 'No class' : 'Select curriculum first'}</option>
                {filteredClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Subject" value={form.subject_id} onChange={(e) => handleSubjectChange(e.target.value)}>
                <option value="">{form.class_id ? 'No subject' : 'Select class first'}</option>
                {filteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>

            {subjectNode && subjectNode.topics && subjectNode.topics.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Select
                  label="Topic (Optional)"
                  value={selectedTopicPath[0]?.id ?? ''}
                  onChange={(e) => handleTopicDropdownChange(0, e.target.value)}
                >
                  <option value="">Select topic…</option>
                  {subjectNode.topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>

                {selectedTopicPath.map((topicNode, idx) => {
                  if (!topicNode.children || topicNode.children.length === 0) return null;
                  const nextIdx = idx + 1;
                  return (
                    <Select
                      key={topicNode.id}
                      label="Sub-topic (Optional)"
                      value={selectedTopicPath[nextIdx]?.id ?? ''}
                      onChange={(e) => handleTopicDropdownChange(nextIdx, e.target.value)}
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

            <div style={{ display: 'grid', gridTemplateColumns: form.duration_minutes !== null ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.75rem' }}>
              {form.duration_minutes !== null && (
                <Input label="Duration (min)" type="number" value={form.duration_minutes || ''} onChange={(e) => set('duration_minutes', e.target.value === '' ? null : +e.target.value)} />
              )}
              <Input label="Total Marks"    type="number" value={form.total_marks || ''}       onChange={(e) => set('total_marks',       e.target.value === '' ? '' : +e.target.value)} />
              <Input label="Passing Marks"  type="number" value={form.passing_marks || ''}     onChange={(e) => set('passing_marks',     e.target.value === '' ? null : +e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Toggle label="Enable Exam Timer" checked={form.duration_minutes !== null} onChange={(checked) => set('duration_minutes', checked ? 60 : null)} />
              <Toggle label="Premium exam" checked={form.is_premium} onChange={(v) => set('is_premium', v)} />
              <Toggle label="Enable Certificate" checked={form.certificate_enabled} onChange={(v) => set('certificate_enabled', v)} />
            </div>
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