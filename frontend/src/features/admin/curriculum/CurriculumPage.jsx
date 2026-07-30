import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Edit2, Users, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageWrapper, Button, Badge, EmptyState, Skeleton,
  Modal, Input, Textarea, Toggle, ConfirmDialog,
} from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import useAuthStore from '@/store/authStore';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .cp-root {
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
  }
  .cp-root *, .cp-root *::before, .cp-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .cp-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 28px;
    padding: 2rem 2.5rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .cp-hblob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .cp-hblob-1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    top: -100px; right: -60px;
    animation: cp-drift 12s ease-in-out infinite alternate;
  }
  .cp-hblob-2 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%);
    bottom: -40px; left: 25%;
    animation: cp-drift 15s ease-in-out infinite alternate-reverse;
  }
  @keyframes cp-drift { from{transform:translate(0,0)} to{transform:translate(20px,-14px)} }

  .cp-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.3rem 0.9rem; border-radius: 50px;
    font-size: 0.7rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.6rem;
  }
  .cp-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: cp-blink 2s ease infinite;
  }
  @keyframes cp-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  .cp-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.4rem, 2.5vw, 1.85rem); font-weight: 700; letter-spacing: -0.025em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.2rem; line-height: 1.15;
  }
  .cp-subtitle { font-size: 0.83rem; color: var(--muted); }

  /* ── NEW CURRICULUM BUTTON ── */
  .cp-btn-primary {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
    border: 1px solid rgba(124,58,237,0.5);
    color: #fff; font-family: 'Inter', sans-serif;
    font-size: 0.8rem; font-weight: 600;
    padding: 0.65rem 1.25rem; border-radius: 14px;
    cursor: pointer; white-space: nowrap;
    box-shadow: 0 4px 20px rgba(124,58,237,0.35);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    flex-shrink: 0; position: relative; z-index: 1;
  }
  .cp-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(124,58,237,0.5);
    border-color: rgba(124,58,237,0.8);
  }
  .cp-btn-primary:active { transform: translateY(0); }

  /* ── GRID ── */
  .cp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 1rem;
  }

  /* ── CURRICULUM CARD ── */
  .cp-card {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(12px);
    display: flex; flex-direction: column;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.25s;
    cursor: default;
  }
  .cp-card:hover {
    border-color: rgba(124,58,237,0.3);
    box-shadow: 0 16px 48px rgba(124,58,237,0.12);
    transform: translateY(-3px);
  }

  /* thumbnail */
  .cp-thumb {
    height: 112px; overflow: hidden; position: relative; flex-shrink: 0;
  }
  .cp-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .cp-thumb-placeholder {
    height: 112px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(0,212,255,0.08) 100%);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .cp-thumb-orb {
    position: absolute;
    width: 120px; height: 120px; border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%);
    top: -20px; right: -20px;
    animation: cp-drift 10s ease-in-out infinite alternate;
  }

  /* card body */
  .cp-card-body {
    padding: 1.1rem 1.25rem 0;
    display: flex; flex-direction: column; gap: 0.6rem; flex: 1;
  }
  .cp-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
  .cp-card-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    color: var(--cream); line-height: 1.3;
  }

  /* badge */
  .cp-badge {
    display: inline-flex; align-items: center; padding: 0.18rem 0.6rem;
    border-radius: 50px; font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid; flex-shrink: 0;
  }
  .cp-badge-active  { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: #6EE7B7; }
  .cp-badge-draft   { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color: var(--muted); }

  .cp-card-desc { font-size: 0.75rem; color: var(--muted); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* stats row */
  .cp-stats-row { display: flex; align-items: center; gap: 1rem; }
  .cp-stat-chip {
    display: flex; align-items: center; gap: 0.35rem;
    font-size: 0.7rem; color: var(--muted); font-weight: 500;
  }

  /* card footer actions */
  .cp-card-footer {
    display: flex; align-items: center; gap: 0.25rem;
    padding: 0.75rem 1.25rem 1.1rem;
    border-top: 1px solid var(--card-bdr);
    margin-top: auto;
  }
  .cp-manage-link {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
    font-size: 0.75rem; font-weight: 600;
    color: var(--violet-l);
    padding: 0.45rem 0.75rem; border-radius: 10px;
    transition: background 0.2s, color 0.2s;
    text-decoration: none;
  }
  .cp-manage-link:hover { background: rgba(124,58,237,0.12); color: #fff; }

  .cp-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 10px;
    background: transparent; border: none; cursor: pointer;
    color: var(--muted); transition: background 0.2s, color 0.2s;
  }
  .cp-icon-btn:hover { background: rgba(255,255,255,0.06); }
  .cp-icon-btn.toggle-on  { color: #6EE7B7; }
  .cp-icon-btn.toggle-off { color: var(--muted); }
  .cp-icon-btn.edit:hover   { color: var(--violet-l); background: rgba(124,58,237,0.1); }
  .cp-icon-btn.delete:hover { color: #F87171; background: rgba(239,68,68,0.08); }

  /* ── SHIMMER SKELETON ── */
  /* ── LIGHT THEME COMPATIBILITY ── */
  html.light .cp-root, .light .cp-root {
    --cream: #0F172A;
    --muted: #475569;
    --card-bg: #FFFFFF;
    --card-bdr: #CBD5E1;
  }
  html.light .cp-card, .light .cp-card {
    background: #FFFFFF;
    border-color: #CBD5E1;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  }
  html.light .cp-card-name, .light .cp-card-name {
    color: #0F172A;
  }
  html.light .cp-card-desc, .light .cp-card-desc,
  html.light .cp-stat-chip, .light .cp-stat-chip {
    color: #475569;
  }
  html.light .cp-badge-draft, .light .cp-badge-draft {
    background: #F1F5F9;
    border-color: #E2E8F0;
    color: #475569;
  }
  html.light .cp-card-footer, .light .cp-card-footer {
    border-top-color: #F1F5F9;
  }
  html.light .cp-manage-link, .light .cp-manage-link {
    color: #4F46E5;
  }
  html.light .cp-manage-link:hover, .light .cp-manage-link:hover {
    background: rgba(79, 70, 229, 0.08);
    color: #4F46E5;
  }
  html.light .cp-icon-btn:hover, .light .cp-icon-btn:hover {
    background: #F1F5F9;
    color: #0F172A;
  }
  html.light .cp-icon-btn.edit:hover, .light .cp-icon-btn.edit:hover {
    color: #4F46E5;
    background: rgba(79, 70, 229, 0.08);
  }
  html.light .cp-empty, .light .cp-empty {
    background: #F8FAFC;
    border-color: #CBD5E1;
  }
  html.light .cp-empty-title, .light .cp-empty-title {
    color: #0F172A;
  }
  html.light .cp-empty-desc, .light .cp-empty-desc {
    color: #475569;
  }
  html.light .cp-skel, .light .cp-skel {
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  }
`;

const BLANK = { name: '', description: '', thumbnail_url: '', is_active: true };

/* stagger container */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function CurriculumPage() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = user?.role === 'teacher';

  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [deleteId, setDeleteId] = useState(null);

  const { data: curriculums, loading, refetch } = useApi(adminApi.getCurriculums);

  const { mutate: save, loading: saving } = useMutation(
    (data) => editing
      ? adminApi.updateCurriculum(editing.id, data)
      : adminApi.createCurriculum(data),
    {
      onSuccess: () => { setModal(false); setEditing(null); setForm(BLANK); refetch(); },
      successMsg: editing ? 'Curriculum updated' : 'Curriculum created',
    }
  );

  const { mutate: del } = useMutation(adminApi.deleteCurriculum, {
    onSuccess: () => { setDeleteId(null); refetch(); },
    successMsg: 'Curriculum deleted',
  });

  const { mutate: toggleActive } = useMutation(
    (c) => adminApi.updateCurriculum(c.id, { is_active: !c.is_active }),
    { onSuccess: refetch }
  );

  const openCreate = () => { setEditing(null); setForm(BLANK); setModal(true); };
  const openEdit   = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? '', thumbnail_url: c.thumbnail_url ?? '', is_active: c.is_active });
    setModal(true);
  };

  const list = curriculums ?? [];

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="cp-root">

        {/* ── Header ── */}
        <motion.div
          className="cp-header"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="cp-hblob cp-hblob-1" />
          <div className="cp-hblob cp-hblob-2" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="cp-eyebrow">
              <span className="cp-eyebrow-dot" />
              {isTeacher ? 'Teacher' : 'Admin'}
            </div>
            <h1 className="cp-title">Curriculum</h1>
            <p className="cp-subtitle">
              {loading ? 'Loading…' : `${list.length} curriculum${list.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {!isTeacher && (
            <button className="cp-btn-primary" onClick={openCreate} style={{ position: 'relative', zIndex: 1 }}>
              <Plus size={15} /> New Curriculum
            </button>
          )}
        </motion.div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="cp-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--card-bg)', border: '1px solid var(--card-bdr)' }}>
                <div className="cp-skel" style={{ height: 112, borderRadius: 0 }} />
                <div style={{ padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div className="cp-skel" style={{ height: 16, width: '65%' }} />
                  <div className="cp-skel" style={{ height: 12, width: '90%' }} />
                  <div className="cp-skel" style={{ height: 12, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <motion.div
            className="cp-empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="cp-empty-icon">
              <BookOpen size={26} style={{ color: 'var(--violet-l)' }} />
            </div>
            <p className="cp-empty-title">No curriculums yet</p>
            <p className="cp-empty-desc">Create your first curriculum and add subjects to get started.</p>
            {!isTeacher && (
              <button className="cp-btn-primary" onClick={openCreate}>
                <Plus size={14} /> New Curriculum
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="cp-grid"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {list.map((c) => (
                <motion.div
                  key={c.id}
                  className="cp-card"
                  variants={cardVariant}
                  layout
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Thumbnail */}
                  {c.thumbnail_url ? (
                    <div className="cp-thumb">
                      <img src={c.thumbnail_url} alt={c.name} />
                    </div>
                  ) : (
                    <div className="cp-thumb-placeholder">
                      <div className="cp-thumb-orb" />
                      <BookOpen size={30} style={{ color: 'rgba(196,181,253,0.35)', position: 'relative', zIndex: 1 }} />
                    </div>
                  )}

                  <div className="cp-card-body">
                    <div className="cp-card-top">
                      <h3 className="cp-card-name">{c.name}</h3>
                      <span className={`cp-badge ${c.is_active ? 'cp-badge-active' : 'cp-badge-draft'}`}>
                        {c.is_active ? 'Active' : 'Draft'}
                      </span>
                    </div>

                    {c.description && (
                      <p className="cp-card-desc">{c.description}</p>
                    )}

                    <div className="cp-stats-row">
                      <span className="cp-stat-chip">
                        <BookOpen size={11} /> {c.class_count ?? 0} class{c.class_count !== 1 ? 'es' : ''}
                      </span>
                      <span className="cp-stat-chip">
                        <Users size={11} /> {c.student_count ?? 0} students
                      </span>
                    </div>
                  </div>

                  <div className="cp-card-footer">
                    <Link to={isTeacher ? `/courses/${c.id}` : `/admin/curriculum/${c.id}`} className="cp-manage-link">
                      {isTeacher ? 'Explore' : 'Manage'} <ChevronRight size={13} />
                    </Link>

                    {!isTeacher && (
                      <>
                        <button
                          onClick={() => toggleActive(c)}
                          title={c.is_active ? 'Deactivate' : 'Activate'}
                          className={`cp-icon-btn ${c.is_active ? 'toggle-on' : 'toggle-off'}`}
                        >
                          {c.is_active
                            ? <ToggleRight size={15} />
                            : <ToggleLeft size={15} />}
                        </button>
                        <button onClick={() => openEdit(c)} className="cp-icon-btn edit">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteId(c.id)} className="cp-icon-btn delete">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); setEditing(null); }}
        title={editing ? 'Edit Curriculum' : 'New Curriculum'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. JEE Foundation 2025"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Description"
            rows={3}
            placeholder="What will students learn in this curriculum?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Thumbnail URL (optional)"
            placeholder="https://..."
            value={form.thumbnail_url}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
          />
          <Toggle
            label="Active (visible to enrolled students)"
            checked={form.is_active}
            onChange={(v) => setForm({ ...form, is_active: v })}
          />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={() => save(form)}>
            {editing ? 'Save Changes' : 'Create Curriculum'}
          </Button>
        </div>
      </Modal>

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => del(deleteId)}
        title="Delete Curriculum"
        description="This will permanently delete the curriculum and all its subjects and content. Students will lose access immediately."
        danger
      />
    </PageWrapper>
  );
}