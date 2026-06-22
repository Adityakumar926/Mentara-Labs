import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, GraduationCap, Trash2, Edit2, Users, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageWrapper, Button, Badge, EmptyState, Skeleton,
  Modal, Input, Select, ConfirmDialog,
} from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';

/* ─── unchanged helpers ─── */
const BLANK = { name: '', curriculum_id: '', start_date: '', end_date: '' };
const fmt   = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .bp-root {
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
  .bp-root *, .bp-root *::before, .bp-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .bp-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, transparent 100%);
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
  .bp-hblob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .bp-hblob-1 {
    width: 340px; height: 340px;
    background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
    top: -100px; right: -80px;
    animation: bp-drift 11s ease-in-out infinite alternate;
  }
  .bp-hblob-2 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%);
    bottom: -50px; left: 30%;
    animation: bp-drift 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes bp-drift { from{transform:translate(0,0)} to{transform:translate(22px,-16px)} }

  .bp-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.3rem 0.9rem; border-radius: 50px;
    font-size: 0.7rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.55rem;
  }
  .bp-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: bp-blink 2s ease infinite;
  }
  @keyframes bp-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .bp-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.4rem,3vw,1.9rem); font-weight: 700; letter-spacing: -0.025em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.2rem;
  }
  .bp-subtitle { font-size: 0.82rem; color: var(--muted); }

  .bp-new-btn {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: linear-gradient(135deg, var(--violet), #5B21B6);
    color: #fff; border: none; padding: 0.65rem 1.35rem;
    border-radius: 50px; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; font-family: 'Space Grotesk', sans-serif;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 22px rgba(124,58,237,0.45);
    white-space: nowrap; flex-shrink: 0; position: relative; z-index: 1;
  }
  .bp-new-btn:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(124,58,237,0.65); }

  /* ── GRID ── */
  .bp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.1rem;
  }

  /* ── BATCH CARD ── */
  .bp-card {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 1.5rem;
    display: flex; flex-direction: column; gap: 0.85rem;
    backdrop-filter: blur(14px);
    overflow: hidden;
    cursor: default;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.25s;
  }
  .bp-card:hover {
    border-color: rgba(124,58,237,0.35);
    box-shadow: 0 18px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,58,237,0.1);
    transform: translateY(-3px);
  }
  .bp-card-glow {
    position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none;
    width: 180px; height: 180px; top: -60px; right: -40px; opacity: 0;
    background: radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%);
    transition: opacity 0.4s;
  }
  .bp-card:hover .bp-card-glow { opacity: 1; }

  /* status strip */
  .bp-card-strip {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    border-radius: 24px 24px 0 0;
  }
  .bp-card-strip-active   { background: linear-gradient(90deg, var(--green), rgba(16,185,129,0)); }
  .bp-card-strip-upcoming { background: linear-gradient(90deg, var(--violet-l), rgba(157,111,239,0)); }
  .bp-card-strip-muted    { background: linear-gradient(90deg, rgba(245,240,232,0.2), transparent); }

  .bp-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
  .bp-card-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem; font-weight: 700; color: var(--cream); line-height: 1.3;
  }

  /* status badge */
  .bp-status {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 0.25rem 0.7rem; border-radius: 50px;
    white-space: nowrap; flex-shrink: 0;
  }
  .bp-status-active   { background: rgba(16,185,129,0.15);  border: 1px solid rgba(16,185,129,0.3);  color: #34D399; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
  .bp-status-upcoming { background: rgba(124,58,237,0.15);  border: 1px solid rgba(124,58,237,0.3);  color: var(--lavender); }
  .bp-status-muted    { background: rgba(245,240,232,0.06); border: 1px solid rgba(245,240,232,0.1); color: var(--muted); }

  .bp-curriculum {
    font-size: 0.75rem; font-weight: 500; color: var(--violet-l);
    truncate: ellipsis; overflow: hidden; white-space: nowrap;
  }

  .bp-meta {
    display: flex; align-items: center; gap: 1rem;
    font-size: 0.72rem; color: var(--muted);
  }
  .bp-meta span { display: flex; align-items: center; gap: 0.3rem; }

  /* divider & actions */
  .bp-card-foot {
    display: flex; align-items: center; gap: 0.25rem;
    padding-top: 0.85rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    margin-top: auto;
  }
  .bp-manage {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
    font-size: 0.78rem; font-weight: 600; color: var(--violet-l);
    text-decoration: none; padding: 0.45rem 0;
    border-radius: 10px; transition: color 0.2s, background 0.2s;
  }
  .bp-manage:hover { color: var(--cyan); background: rgba(0,212,255,0.06); }

  .bp-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 10px; border: none; cursor: pointer;
    background: transparent; color: var(--muted);
    transition: color 0.2s, background 0.2s;
  }
  .bp-icon-btn:hover { background: rgba(255,255,255,0.06); }
  .bp-icon-btn.edit:hover  { color: var(--violet-l); }
  .bp-icon-btn.trash:hover { color: #EF4444; }

  /* ── SKELETON CARD ── */
  .bp-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: bp-shimmer 1.5s infinite;
    border-radius: 14px;
  }
  @keyframes bp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── MODAL OVERRIDES ── */
  .bp-form-section { display: flex; flex-direction: column; gap: 1rem; }
  .bp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .bp-modal-footer {
    display: flex; justify-content: flex-end; gap: 0.5rem;
    margin-top: 1.5rem; padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
`;

/* ─── animation variants ─── */
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const card      = { hidden: { opacity: 0, y: 20, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } } };
const headerV   = { hidden: { opacity: 0, y: -16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

export default function BatchesPage() {
  /* ─── unchanged state & logic ─── */
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [deleteId, setDeleteId] = useState(null);

  const { data: batches,     loading,  refetch } = useApi(adminApi.getBatches);
  const { data: curriculums, loading: loadingC  } = useApi(adminApi.getCurriculums);

  const { mutate: save, loading: saving } = useMutation(
    (data) => editing
      ? adminApi.updateBatch(editing.id, data)
      : adminApi.createBatch(data),
    {
      onSuccess: () => { setModal(false); setEditing(null); setForm(BLANK); refetch(); },
      successMsg: editing ? 'Batch updated' : 'Batch created',
    }
  );

  const { mutate: del } = useMutation(adminApi.deleteBatch, {
    onSuccess: () => { setDeleteId(null); refetch(); },
    successMsg: 'Batch deleted',
  });

  const openCreate = () => { setEditing(null); setForm(BLANK); setModal(true); };
  const openEdit   = (b) => {
    setEditing(b);
    setForm({
      name: b.name,
      curriculum_id: b.curriculum_id,
      start_date: b.start_date?.split('T')[0] ?? '',
      end_date:   b.end_date?.split('T')[0]   ?? '',
    });
    setModal(true);
  };

  const batchStatus = (b) => {
    const now   = new Date();
    const start = b.start_date ? new Date(b.start_date) : null;
    const end   = b.end_date   ? new Date(b.end_date)   : null;
    if (!start)          return { label: 'Upcoming', key: 'upcoming' };
    if (now < start)     return { label: 'Upcoming',  key: 'upcoming'  };
    if (end && now > end) return { label: 'Completed', key: 'muted'   };
    return                      { label: 'Active',    key: 'active' };
  };

  const list = batches ?? [];

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="bp-root">

        {/* ── Header ── */}
        <motion.div className="bp-header" variants={headerV} initial="hidden" animate="show">
          <div className="bp-hblob bp-hblob-1" />
          <div className="bp-hblob bp-hblob-2" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="bp-eyebrow">
              <span className="bp-eyebrow-dot" />
              Admin · Batches
            </div>
            <h1 className="bp-title">Batch Management</h1>
            <p className="bp-subtitle">
              {list.length} batch{list.length !== 1 ? 'es' : ''} · organise students under a curriculum
            </p>
          </div>
          <button className="bp-new-btn" onClick={openCreate}>
            <Plus size={15} /> New Batch
          </button>
        </motion.div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="bp-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-bdr)', borderRadius: 24, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="bp-skel" style={{ height: 18, width: '55%' }} />
                <div className="bp-skel" style={{ height: 14, width: '75%' }} />
                <div className="bp-skel" style={{ height: 12, width: '40%' }} />
                <div className="bp-skel" style={{ height: 34, marginTop: 8 }} />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <EmptyState
              icon={GraduationCap}
              title="No batches yet"
              description="Create a batch to group students under a curriculum."
              action={
                <button className="bp-new-btn" onClick={openCreate}>
                  <Plus size={14} /> New Batch
                </button>
              }
            />
          </motion.div>
        ) : (
          <motion.div className="bp-grid" variants={container} initial="hidden" animate="show">
            <AnimatePresence>
              {list.map((b) => {
                const status = batchStatus(b);
                return (
                  <motion.div key={b.id} variants={card} layout className="bp-card">
                    <div className={`bp-card-strip bp-card-strip-${status.key}`} />
                    <div className="bp-card-glow" />

                    {/* Title + status */}
                    <div className="bp-card-head">
                      <h3 className="bp-card-name">{b.name}</h3>
                      <span className={`bp-status bp-status-${status.key}`}>{status.label}</span>
                    </div>

                    {/* Curriculum */}
                    {b.curriculum_name && (
                      <p className="bp-curriculum">{b.curriculum_name}</p>
                    )}

                    {/* Meta */}
                    <div className="bp-meta">
                      <span>
                        <Users size={11} style={{ color: 'var(--violet-l)' }} />
                        {b.student_count ?? 0} students
                      </span>
                      {b.start_date && (
                        <span>
                          <Calendar size={11} style={{ color: 'var(--cyan)' }} />
                          {fmt(b.start_date)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="bp-card-foot">
                      <Link to={`/admin/batches/${b.id}`} className="bp-manage">
                        Manage <ChevronRight size={13} />
                      </Link>
                      <button className="bp-icon-btn edit" onClick={() => openEdit(b)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="bp-icon-btn trash" onClick={() => setDeleteId(b.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Create / Edit Modal ── */}
        <Modal
          open={modal}
          onClose={() => { setModal(false); setEditing(null); }}
          title={editing ? 'Edit Batch' : 'New Batch'}
          size="md"
        >
          <div className="bp-form-section">
            <Input
              label="Batch Name"
              placeholder="e.g. JEE 2025 — Morning Batch"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Select
              label="Curriculum"
              value={form.curriculum_id}
              onChange={(e) => setForm({ ...form, curriculum_id: e.target.value })}
              disabled={loadingC}
            >
              <option value="">Select a curriculum…</option>
              {(curriculums ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <div className="bp-form-row">
              <Input
                label="Start Date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="bp-modal-footer">
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={() => save(form)}>
              {editing ? 'Save Changes' : 'Create Batch'}
            </Button>
          </div>
        </Modal>

        {/* ── Delete confirm ── */}
        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => del(deleteId)}
          title="Delete Batch"
          description="This will permanently delete the batch and remove all student enrollments. Exam history is preserved."
          danger
        />

      </div>
    </PageWrapper>
  );
}