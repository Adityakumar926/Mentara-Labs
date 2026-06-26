import { useState, useMemo } from 'react';
import { Plus, Star, Lock, Trash2, Edit2, Search, Filter, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageWrapper, Button, Input, Select, Card,
  Badge, EmptyState, Skeleton, Modal, Textarea, Toggle, ConfirmDialog,
} from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import clsx from 'clsx';
import HierarchySidebar from '@/components/shared/HierarchySidebar';

/* ─── unchanged constants ─── */
const TYPES        = ['mcq', 'fill_blank', 'photo'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const BLANK_Q = {
  question_text: '', question_type: 'mcq', difficulty: 'medium',
  options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }],
  correct_answer: '', explanation: '', subject_id: '', curriculum_id: '', class_id: '', is_premium: false,
  photoAnswerFormat: 'mcq', // UI-only: for question_type 'photo', toggles between MCQ options and a text answer
  image_url: '', // for question_type 'photo': the uploaded question image
};

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .qp-root {
    --navy:     #0A0E1A;
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
  .qp-root *, .qp-root *::before, .qp-root *::after { box-sizing: border-box; }

  /* ── HEADER ── */
  .qp-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, transparent 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 28px; padding: 2rem 2.5rem;
    overflow: hidden; backdrop-filter: blur(16px);
    margin-bottom: 1.5rem;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  }
  .qp-hblob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .qp-hblob-1 {
    width: 340px; height: 340px;
    background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
    top: -100px; right: -80px;
    animation: qp-drift 11s ease-in-out infinite alternate;
  }
  .qp-hblob-2 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%);
    bottom: -50px; left: 28%;
    animation: qp-drift 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes qp-drift { from{transform:translate(0,0)} to{transform:translate(22px,-16px)} }
  @keyframes qp-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .qp-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.3rem 0.9rem; border-radius: 50px;
    font-size: 0.7rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.55rem;
  }
  .qp-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: qp-blink 2s ease infinite;
  }
  .qp-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 700; letter-spacing: -0.025em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.2rem;
  }
  .qp-subtitle { font-size: 0.82rem; color: var(--muted); }
  .qp-add-btn {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: linear-gradient(135deg, var(--violet), #5B21B6);
    color: #fff; border: none; padding: 0.65rem 1.35rem;
    border-radius: 50px; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; font-family: 'Space Grotesk', sans-serif;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 22px rgba(124,58,237,0.45);
    white-space: nowrap; flex-shrink: 0; position: relative; z-index: 1;
  }
  .qp-add-btn:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(124,58,237,0.65); }

  /* ── FILTER BAR ── */
  .qp-filters {
    display: flex; flex-wrap: wrap; gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  .qp-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .qp-search-icon {
    position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%);
    color: var(--muted); pointer-events: none;
  }
  .qp-search-input {
    width: 100%;
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 14px; padding: 0.6rem 0.9rem 0.6rem 2.4rem;
    color: var(--cream); font-size: 0.82rem; font-family: 'Inter', sans-serif;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    backdrop-filter: blur(10px);
  }
  .qp-search-input::placeholder { color: var(--muted); }
  .qp-search-input:focus { border-color: rgba(124,58,237,0.5); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }

  .qp-select {
    background-color: #0F1629; border: 1px solid var(--card-bdr);
    border-radius: 14px; padding: 0.6rem 2rem 0.6rem 0.9rem;
    color: var(--cream); font-size: 0.8rem; font-family: 'Inter', sans-serif;
    outline: none; cursor: pointer; min-width: 130px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(245,240,232,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 0.75rem center;
    transition: border-color 0.2s; backdrop-filter: blur(10px);
  }
  .qp-select:focus { border-color: rgba(124,58,237,0.5); outline: none; }
  .qp-select option { background: #0F1629; color: var(--cream); }

  /* ── QUESTION ROW ── */
  .qp-row {
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 18px; padding: 1rem 1.25rem;
    display: flex; align-items: flex-start; gap: 1rem;
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
    margin-bottom: 0.65rem;
  }
  .qp-row:hover {
    border-color: rgba(124,58,237,0.3);
    box-shadow: 0 8px 28px rgba(0,0,0,0.2);
    transform: translateY(-1px);
  }
  .qp-row:last-child { margin-bottom: 0; }

  /* type pill */
  .qp-type-pill {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 0.22rem 0.65rem; border-radius: 50px; white-space: nowrap; flex-shrink: 0; margin-top: 2px;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.25); color: var(--lavender);
  }
  .qp-type-fill  { background: rgba(0,212,255,0.1);   border-color: rgba(0,212,255,0.22);   color: var(--cyan); }
  .qp-type-photo { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.24);  color: #34D399; }

  .qp-q-text { font-size: 0.82rem; color: var(--cream); font-weight: 500; line-height: 1.5; margin-bottom: 0.45rem; }
  .qp-q-text-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  .qp-q-meta { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
  .qp-subject-tag { font-size: 0.68rem; color: var(--muted); }

  /* diff pill */
  .qp-diff {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.06em;
    padding: 0.18rem 0.55rem; border-radius: 50px;
  }
  .qp-diff-easy   { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #34D399; }
  .qp-diff-medium { background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.25); color: var(--lavender); }
  .qp-diff-hard   { background: rgba(239,68,68,0.12);  border: 1px solid rgba(239,68,68,0.22);  color: #F87171; }

  /* premium pill */
  .qp-prem-pill {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.04em;
    padding: 0.18rem 0.55rem; border-radius: 50px;
    background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); color: #FCD34D;
    display: inline-flex; align-items: center; gap: 0.25rem;
  }

  /* action icons */
  .qp-actions { display: flex; align-items: center; gap: 0.1rem; flex-shrink: 0; }
  .qp-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 10px; border: none;
    background: transparent; cursor: pointer; color: var(--muted);
    transition: color 0.2s, background 0.2s;
  }
  .qp-icon-btn:hover { background: rgba(255,255,255,0.06); }
  .qp-icon-btn.star:hover   { color: #FCD34D; }
  .qp-icon-btn.lock:hover   { color: #FCD34D; }
  .qp-icon-btn.edit:hover   { color: var(--violet-l); }
  .qp-icon-btn.trash:hover  { color: #F87171; }
  .qp-icon-btn.star-on   { color: #FCD34D; }
  .qp-icon-btn.lock-on   { color: #FCD34D; }

  /* ── SKELETON ── */
  .qp-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%; animation: qp-shimmer 1.5s infinite; border-radius: 18px;
  }
  @keyframes qp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── MCQ OPTIONS ── */
  .qp-option-row { display: flex; align-items: center; gap: 0.6rem; }
  .qp-option-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.72rem; font-weight: 700; color: var(--muted); min-width: 18px;
  }
  .qp-option-input {
    flex: 1; background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 10px; padding: 0.5rem 0.8rem;
    color: var(--cream); font-size: 0.8rem; font-family: 'Inter', sans-serif;
    outline: none; transition: border-color 0.2s;
  }
  .qp-option-input:focus { border-color: rgba(124,58,237,0.45); }
  .qp-option-input.correct-selected { border-color: rgba(16,185,129,0.5); background: rgba(16,185,129,0.06); }
  .qp-radio-wrap {
    width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--card-bdr);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    flex-shrink: 0; transition: border-color 0.2s, background 0.2s;
  }
  .qp-radio-wrap.selected { border-color: var(--green); background: rgba(16,185,129,0.15); }
  .qp-radio-inner { width: 8px; height: 8px; border-radius: 50%; background: var(--green); }

  .qp-modal-footer {
    display: flex; justify-content: flex-end; gap: 0.5rem;
    margin-top: 1.5rem; padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .qp-section-label {
    font-size: 0.72rem; font-weight: 700; color: var(--muted);
    letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem;
  }

  /* ── PHOTO ANSWER-FORMAT TOGGLE ── */
  .qp-format-toggle { display: flex; gap: 0.5rem; margin-bottom: 0.85rem; }
  .qp-format-btn {
    flex: 1; padding: 0.55rem 0.8rem; border-radius: 12px;
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    color: var(--muted); font-size: 0.78rem; font-weight: 600;
    font-family: 'Inter', sans-serif; cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .qp-format-btn:hover { color: var(--cream); }
  .qp-format-btn.active {
    border-color: rgba(124,58,237,0.5); background: rgba(124,58,237,0.12); color: var(--lavender);
  }

  /* ── PHOTO QUESTION — IMAGE UPLOAD ── */
  .qp-image-dropzone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 0.4rem; padding: 1.75rem 1rem; border-radius: 14px;
    border: 1.5px dashed var(--card-bdr); background: var(--card-bg);
    color: var(--muted); font-size: 0.8rem; font-weight: 500;
    cursor: pointer; transition: border-color 0.2s, background 0.2s, color 0.2s;
  }
  .qp-image-dropzone:hover { border-color: rgba(124,58,237,0.45); color: var(--cream); background: rgba(124,58,237,0.06); }
  .qp-image-dropzone.uploading { cursor: wait; }
  .qp-image-hint { font-size: 0.68rem; color: var(--muted); font-weight: 400; }
  .qp-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.15);
    border-top-color: var(--lavender);
    animation: ui-spin 0.7s linear infinite;
  }
  .qp-image-preview-wrap { position: relative; width: 100%; max-width: 240px; }
  .qp-image-preview {
    width: 100%; border-radius: 14px; border: 1px solid var(--card-bdr);
    display: block; object-fit: cover; max-height: 160px;
  }
  .qp-image-remove-btn {
    position: absolute; top: 8px; right: 8px;
    width: 26px; height: 26px; border-radius: 8px; border: none;
    background: rgba(10,14,26,0.75); backdrop-filter: blur(6px);
    color: var(--cream); display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s, color 0.2s;
  }
  .qp-image-remove-btn:hover { background: rgba(239,68,68,0.7); }
`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: 'easeOut' },
});

const typeClass = (t) => t === 'fill_blank' ? 'qp-type-fill' : t === 'photo' ? 'qp-type-photo' : '';
const diffClass = (d) => `qp-diff qp-diff-${d}`;

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

export default function QuestionsPage() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filters, setFilters]   = useState({ search: '', type: '', is_premium: '' });
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(BLANK_Q);
  const [deleteId, setDeleteId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError]         = useState('');

  const { data: questions, loading, refetch } = useApi(
    adminApi.getQuestions,
    useMemo(() => {
      const params = {
        type: filters.type || undefined,
        is_premium: filters.is_premium || undefined,
      };
      if (selectedNode) {
        if (selectedNode.type === 'curriculum') params.curriculum_id = selectedNode.id;
        else if (selectedNode.type === 'class') params.class_id = selectedNode.id;
        else if (selectedNode.type === 'subject') params.subject_id = selectedNode.id;
        else if (selectedNode.type === 'topic') params.topic_id = selectedNode.id;
      }
      return params;
    }, [filters.type, filters.is_premium, selectedNode]),
    [filters.type, filters.is_premium, selectedNode]
  );
  
  const { data: curriculums } = useApi(adminApi.getCurriculums);
  const { data: allSubjects  } = useApi(adminApi.getSubjects);
  const { data: hierarchy } = useApi(adminApi.getHierarchy);

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
    const list = allSubjects ?? [];
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
  }, [allSubjects, form.curriculum_id]);

  const filteredSubjects = useMemo(() => {
    const list = allSubjects ?? [];
    if (!form.class_id) return [];
    return list.filter((s) => String(s.class_id) === String(form.class_id));
  }, [allSubjects, form.class_id]);

  const { mutate: saveQ, loading: saving } = useMutation(
    (data) => editing ? adminApi.updateQuestion(editing.id, data) : adminApi.createQuestion(data),
    { onSuccess: () => { setModal(false); setEditing(null); refetch(); }, successMsg: editing ? 'Question updated' : 'Question created' }
  );
  const handleSave = (formData) => {
    const cleaned = { ...formData };
    if (formData.question_type === 'photo') {
      cleaned.options = null;
      cleaned.correct_answer = null;
    }
    saveQ(cleaned);
  };
  const { mutate: deleteQ    } = useMutation(adminApi.deleteQuestion,        { onSuccess: () => { setDeleteId(null); refetch(); }, successMsg: 'Question deleted' });
  const { mutate: toggleStar } = useMutation(adminApi.toggleQuestionStar,    { onSuccess: refetch });
  const { mutate: togglePrem } = useMutation(adminApi.toggleQuestionPremium, { onSuccess: refetch });

  const openCreate = () => {
    setEditing(null);
    if (selectedNode) {
      setForm({
        ...BLANK_Q,
        curriculum_id: selectedNode.pathIds.curriculum_id ?? '',
        class_id: selectedNode.pathIds.class_id ?? '',
        subject_id: selectedNode.pathIds.subject_id ?? '',
        topic_id: selectedNode.pathIds.topic_id ?? '',
      });
    } else {
      setForm(BLANK_Q);
    }
    setImageError('');
    setModal(true);
  };

  const openEdit   = (q) => {
    const subj = (allSubjects ?? []).find((s) => String(s.id) === String(q.subject_id));
    setEditing(q);
    const options = q.options ?? BLANK_Q.options;
    const photoAnswerFormat = options.some((o) => o.text?.trim()) ? 'mcq' : 'text';
    setForm({
      ...q,
      options,
      curriculum_id: subj?.curriculum_id ?? '',
      class_id: subj?.class_id ?? '',
      photoAnswerFormat
    });
    setImageError('');
    setModal(true);
  };

  const set    = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setOpt = (i, val) => {
    const opts = [...form.options];
    opts[i] = { ...opts[i], text: val };
    setForm((p) => ({ ...p, options: opts }));
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

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    setImageUploading(true);
    try {
      const { data } = await adminApi.uploadQuestionImage(file);
      set('image_url', data.data.url);
    } catch (err) {
      setImageError(err?.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setImageUploading(false);
      e.target.value = ''; // allow re-selecting the same file later
    }
  };
  const removeImage = () => set('image_url', '');

  const filtered = (questions ?? []).filter((q) =>
    !filters.search || q.question_text.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <PageWrapper className="p-0">
      <style>{CSS}</style>
      <div className="qp-root" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <HierarchySidebar
          selectedNodeId={selectedNode?.id}
          selectedNodeType={selectedNode?.type}
          onSelectNode={setSelectedNode}
        />
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
          {/* ── Header ── */}
          <motion.div className="qp-header" {...fadeUp(0)}>
            <div className="qp-hblob qp-hblob-1" />
            <div className="qp-hblob qp-hblob-2" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="qp-eyebrow">
                <span className="qp-eyebrow-dot" />
                {selectedNode?.pathNames ? selectedNode.pathNames.join(' > ') : 'Admin · Questions'}
              </div>
              <h1 className="qp-title">Question Bank</h1>
              <p className="qp-subtitle">{filtered.length} question{filtered.length !== 1 ? 's' : ''} · build and manage your question library</p>
            </div>
            <button className="qp-add-btn" onClick={openCreate}><Plus size={15} /> Add Question</button>
          </motion.div>

          {/* ── Filters ── */}
          <motion.div className="qp-filters" {...fadeUp(0.08)}>
            <div className="qp-search-wrap">
              <Search size={14} className="qp-search-icon" />
              <input
                className="qp-search-input"
                placeholder="Search questions…"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <select className="qp-select" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All Types</option>
              {TYPES.map((t) => <option key={t} value={t}>{t === 'photo' ? 'structured text' : t.replace('_', ' ')}</option>)}
            </select>
            <select className="qp-select" value={filters.is_premium} onChange={(e) => setFilters({ ...filters, is_premium: e.target.value })}>
              <option value="">All Access</option>
              <option value="true">Premium only</option>
              <option value="false">Free only</option>
            </select>
          </motion.div>

          {/* ── List ── */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="qp-skel" style={{ height: 76 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div {...fadeUp(0.1)}>
              <EmptyState icon={Filter} title="No questions found"
                description="Try adjusting your filters or add a new question."
                action={<button className="qp-add-btn" onClick={openCreate}><Plus size={14} /> Add Question</button>} />
            </motion.div>
          ) : (
            <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
              <AnimatePresence>
                {filtered.map((q, idx) => (
                  <motion.div
                    key={q.id}
                    className="qp-row"
                    layout
                    variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } } }}
                  >
                    {/* Type pill */}
                    <span className={`qp-type-pill ${typeClass(q.question_type)}`}>
                      {q.question_type === 'photo' ? 'structured text' : q.question_type.replace('_', ' ')}
                    </span>

                    {/* Body */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="qp-q-text qp-q-text-clamp">{q.question_text}</p>
                      <div className="qp-q-meta">
                        {(q.curriculum_name || q.class_name || q.subject_name) && (
                          <span className="qp-subject-tag font-medium">
                            {q.curriculum_name && `${q.curriculum_name} • `}
                            {q.class_name && `${q.class_name} • `}
                            {q.subject_name}
                            {q.topic_name && ` • ${q.topic_name}`}
                          </span>
                        )}
                        {q.difficulty   && <span className={diffClass(q.difficulty)}>{q.difficulty}</span>}
                        {q.is_premium   && (
                          <span className="qp-prem-pill">
                            <Lock size={9} /> Premium
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="qp-actions">
                      <button
                        className={clsx('qp-icon-btn star', q.is_starred && 'star-on')}
                        onClick={() => toggleStar(q.id)}
                        title="Star"
                      >
                        <Star size={14} fill={q.is_starred ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        className={clsx('qp-icon-btn lock', q.is_premium && 'lock-on')}
                        onClick={() => togglePrem(q.id)}
                        title="Toggle premium"
                      >
                        <Lock size={14} />
                      </button>
                      <button className="qp-icon-btn edit" onClick={() => openEdit(q)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="qp-icon-btn trash" onClick={() => setDeleteId(q.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ── Create / Edit Modal ── */}
        <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Question' : 'New Question'} size="lg" preventOutsideClickClose={true}>
          <div className="qp-root" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 'auto' }}>

            <Textarea label="Question Text" value={form.question_text}
              onChange={(e) => set('question_text', e.target.value)} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <Select label="Curriculum" value={form.curriculum_id}
                onChange={(e) => handleCurriculumChange(e.target.value)}>
                <option value="">Select curriculum…</option>
                {(curriculums ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Class" value={form.class_id}
                onChange={(e) => handleClassChange(e.target.value)}>
                <option value="">{form.curriculum_id ? 'Select class…' : 'Select curriculum first'}</option>
                {filteredClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Subject" value={form.subject_id}
                onChange={(e) => handleSubjectChange(e.target.value)}>
                <option value="">{form.class_id ? 'Select subject…' : 'Select class first'}</option>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Select label="Type" value={form.question_type} onChange={(e) => set('question_type', e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t === 'photo' ? 'structured text' : t.replace('_', ' ')}</option>)}
              </Select>
              <Select label="Difficulty" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>

            {/* Photo questions: the image attached to the question itself */}
            {form.question_type === 'photo' && (
              <div>
                <p className="qp-section-label">Question Image</p>
                {form.image_url ? (
                  <div className="qp-image-preview-wrap">
                    <img src={form.image_url} alt="Question" className="qp-image-preview" />
                    <button type="button" className="qp-image-remove-btn" onClick={removeImage} title="Remove image">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <label className={clsx('qp-image-dropzone', imageUploading && 'uploading')}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      disabled={imageUploading}
                      style={{ display: 'none' }}
                    />
                    {imageUploading ? (
                      <span className="qp-spinner" />
                    ) : (
                      <>
                        <ImageIcon size={20} />
                        <span>Click to upload an image</span>
                        <span className="qp-image-hint">JPEG, PNG or WebP · up to 5MB</span>
                      </>
                    )}
                  </label>
                )}
                {imageError && <p className="ui-error" style={{ marginTop: '0.4rem' }}>{imageError}</p>}
              </div>
            )}

            {/* MCQ Options */}
            {form.question_type === 'mcq' && (
              <div>
                <p className="qp-section-label">Options — select correct answer</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {form.options?.map((opt, i) => {
                    const isCorrect = form.correct_answer === opt.id;
                    return (
                      <div key={opt.id} className="qp-option-row">
                        <span className="qp-option-label">{opt.id.toUpperCase()}</span>
                        <input
                          className={clsx('qp-option-input', isCorrect && 'correct-selected')}
                          placeholder={`Option ${opt.id.toUpperCase()}`}
                          value={opt.text}
                          onChange={(e) => setOpt(i, e.target.value)}
                        />
                        <div
                          className={clsx('qp-radio-wrap', isCorrect && 'selected')}
                          onClick={() => set('correct_answer', opt.id)}
                          title="Mark as correct"
                        >
                          {isCorrect && <span className="qp-radio-inner" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {form.question_type === 'fill_blank' && (
              <Input label="Correct Answer" value={form.correct_answer}
                onChange={(e) => set('correct_answer', e.target.value)} />
            )}

            <Textarea label="Explanation (optional)" rows={2} value={form.explanation}
              onChange={(e) => set('explanation', e.target.value)} />

            <Toggle label="Premium question" checked={form.is_premium} onChange={(v) => set('is_premium', v)} />
          </div>

          <div className="qp-modal-footer">
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={() => handleSave(form)}>
              {editing ? 'Save Changes' : 'Create Question'}
            </Button>
          </div>
        </Modal>

        {/* ── Delete confirm ── */}
        <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
          onConfirm={() => deleteQ(deleteId)}
          title="Delete Question"
          description="This will permanently delete the question and remove it from all exams. This cannot be undone."
          danger />

      </div>
    </PageWrapper>
  );
}