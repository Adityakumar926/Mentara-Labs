import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, BookOpen, Trash2, Edit2, Users, ChevronRight, ToggleLeft, 
  ToggleRight, Search, Sparkles, GraduationCap, Layers, CheckCircle2, 
  Filter, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageWrapper, Button, Badge, Modal, Input, Textarea, Toggle, ConfirmDialog,
} from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import useAuthStore from '@/store/authStore';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  .cp-root {
    --navy:     #080C16;
    --navy2:    #0D1322;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --muted:    rgba(245,240,232,0.55);
    --card-bg:  rgba(13, 19, 34, 0.7);
    --card-bdr: rgba(255, 255, 255, 0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }

  /* ── HERO BANNER ── */
  .cp-hero {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(0,212,255,0.08) 50%, rgba(16,185,129,0.05) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 2.25rem 2.5rem;
    overflow: hidden;
    backdrop-filter: blur(24px);
    margin-bottom: 1.75rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .cp-hblob {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  }
  .cp-hblob-1 {
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    top: -120px; right: -80px;
    animation: cp-drift 12s ease-in-out infinite alternate;
  }
  .cp-hblob-2 {
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%);
    bottom: -60px; left: 30%;
    animation: cp-drift 16s ease-in-out infinite alternate-reverse;
  }
  @keyframes cp-drift { from{transform:translate(0,0)} to{transform:translate(25px,-20px)} }

  .cp-status-pill {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.35);
    padding: 0.35rem 0.95rem; border-radius: 50px;
    font-size: 0.72rem; font-weight: 700; color: #C4B5FD;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
  }
  .cp-status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #00D4FF; box-shadow: 0 0 10px #00D4FF;
    animation: cp-blink 2s infinite ease-in-out;
  }
  @keyframes cp-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .cp-hero-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.75rem, 3.5vw, 2.35rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #C4B5FD 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
    margin-bottom: 0.4rem;
  }
  .cp-hero-sub {
    font-size: 0.9rem; color: #94A3B8; font-weight: 500; max-width: 540px;
  }

  .cp-btn-primary {
    display: inline-flex; align-items: center; gap: 0.55rem;
    background: linear-gradient(135deg, #7C3AED 0%, #00D4FF 100%);
    color: #FFFFFF; font-family: 'Outfit', sans-serif;
    font-size: 0.85rem; font-weight: 700;
    padding: 0.7rem 1.35rem; border-radius: 14px;
    cursor: pointer; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 0 25px rgba(124, 58, 237, 0.35);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cp-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(0, 212, 255, 0.5);
    filter: brightness(1.1);
  }

  /* ── STATS ROW ── */
  .cp-stats-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem; margin-bottom: 1.5rem;
  }
  .cp-stat-box {
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 18px; padding: 1.1rem 1.25rem; backdrop-filter: blur(20px);
    display: flex; align-items: center; gap: 1rem;
    transition: all 0.25s ease;
  }
  .cp-stat-box:hover {
    border-color: rgba(255, 255, 255, 0.15); transform: translateY(-2px);
  }
  .cp-stat-icon-wrap {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .cp-stat-val { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 900; color: #FFF; line-height: 1; }
  .cp-stat-lbl { font-size: 0.75rem; color: #94A3B8; font-weight: 600; margin-top: 0.2rem; }

  /* ── FILTER & SEARCH BAR ── */
  .cp-controls-bar {
    display: flex; flex-wrap: wrap; items-center; justify-content: space-between; gap: 1rem;
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 20px; padding: 0.85rem 1.25rem; backdrop-filter: blur(20px);
    margin-bottom: 1.75rem;
  }
  .cp-search-wrap {
    position: relative; flex: 1; min-width: 240px; max-width: 400px;
  }
  .cp-search-input {
    width: 100%; bg: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;
    padding: 0.6rem 1rem 0.6rem 2.4rem; color: #FFFFFF; font-size: 0.82rem;
    outline: none; transition: all 0.2s ease;
  }
  .cp-search-input:focus {
    border-color: rgba(0, 212, 255, 0.5); box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
  }

  .cp-filter-tabs {
    display: flex; items-center; gap: 0.4rem; bg: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.25rem; border-radius: 12px;
  }
  .cp-filter-tab {
    padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700;
    color: #94A3B8; background: transparent; border: none; cursor: pointer; transition: all 0.2s ease;
  }
  .cp-filter-tab.active {
    background: #7C3AED; color: #FFFFFF; box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
  }

  /* ── CURRICULUM CARDS GRID ── */
  .cp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }
  .cp-card {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(24px);
    display: flex; flex-direction: column;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }
  .cp-card:hover {
    border-color: rgba(124,58,237,0.4);
    box-shadow: 0 20px 45px -10px rgba(124,58,237,0.25);
    transform: translateY(-4px);
  }

  .cp-thumb-placeholder {
    height: 130px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(0,212,255,0.12) 100%);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .cp-thumb-orb {
    position: absolute;
    width: 140px; height: 140px; border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    top: -30px; right: -30px;
    animation: cp-drift 10s ease-in-out infinite alternate;
  }

  .cp-card-body {
    padding: 1.35rem 1.4rem 1rem;
    display: flex; flex-direction: column; gap: 0.75rem; flex: 1;
  }
  .cp-card-name {
    font-family: 'Outfit', sans-serif;
    font-size: 1.15rem; font-weight: 800;
    color: #FFFFFF; line-height: 1.25;
  }

  .cp-badge {
    display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.7rem;
    border-radius: 50px; font-size: 0.65rem; font-weight: 800;
    letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid; flex-shrink: 0;
  }
  .cp-badge-active  { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.35); color: #6EE7B7; box-shadow: 0 0 10px rgba(16,185,129,0.15); }
  .cp-badge-draft   { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); color: #FCD34D; }

  .cp-card-desc { font-size: 0.8rem; color: #94A3B8; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  .cp-stats-row { display: flex; align-items: center; gap: 1rem; padding-top: 0.4rem; }
  .cp-stat-chip {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.75rem; color: #CBD5E1; font-weight: 600;
    background: rgba(255,255,255,0.03); padding: 0.35rem 0.75rem; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.05);
  }

  .cp-card-footer {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.9rem 1.4rem 1.2rem;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin-top: auto;
  }
  .cp-manage-link {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.45rem;
    font-size: 0.8rem; font-weight: 700;
    color: #00D4FF; background: rgba(0,212,255,0.08);
    border: 1px solid rgba(0,212,255,0.2);
    padding: 0.55rem 0.85rem; border-radius: 12px;
    transition: all 0.2s ease; text-decoration: none;
  }
  .cp-manage-link:hover {
    background: rgba(0,212,255,0.18); border-color: rgba(0,212,255,0.4); color: #FFFFFF;
  }

  .cp-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 12px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); cursor: pointer;
    color: #94A3B8; transition: all 0.2s ease;
  }
  .cp-icon-btn:hover { background: rgba(255,255,255,0.08); color: #FFF; }
  .cp-icon-btn.toggle-on  { color: #6EE7B7; border-color: rgba(16,185,129,0.3); }
  .cp-icon-btn.toggle-off { color: #FCD34D; border-color: rgba(245,158,11,0.3); }
  .cp-icon-btn.edit:hover   { color: #C4B5FD; border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.15); }
  .cp-icon-btn.delete:hover { color: #F87171; border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.15); }
`;

const BLANK = { name: '', description: '', thumbnail_url: '', is_active: true };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function CurriculumPage() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = user?.role === 'teacher';

  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(BLANK);
  const [deleteId, setDeleteId]     = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

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

  const filteredList = useMemo(() => {
    return list.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
      if (filterActive === 'all') return matchesSearch;
      if (filterActive === 'active') return matchesSearch && c.is_active;
      if (filterActive === 'draft') return matchesSearch && !c.is_active;
      return matchesSearch;
    });
  }, [list, searchTerm, filterActive]);

  const activeCount = useMemo(() => list.filter(c => c.is_active).length, [list]);
  const totalClasses = useMemo(() => list.reduce((acc, c) => acc + parseInt(c.class_count ?? 0), 0), [list]);
  const totalStudents = useMemo(() => list.reduce((acc, c) => acc + parseInt(c.student_count ?? 0), 0), [list]);

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="cp-root">

        {/* ── HERO BANNER ── */}
        <motion.div
          className="cp-hero"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="cp-hblob cp-hblob-1" />
          <div className="cp-hblob cp-hblob-2" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="cp-status-pill">
                <span className="cp-status-dot" />
                Curriculum Hierarchy Operations
              </div>
              <h1 className="cp-hero-title">Academic Curriculums</h1>
              <p className="cp-hero-sub">
                Manage Cambridge Primary subjects, topic structures, and student progression frameworks.
              </p>
            </div>

            {!isTeacher && (
              <button className="cp-btn-primary" onClick={openCreate}>
                <Plus size={18} /> New Curriculum
              </button>
            )}
          </div>
        </motion.div>

        {/* ── SUMMARY STATS ── */}
        <div className="cp-stats-grid">
          <div className="cp-stat-box">
            <div className="cp-stat-icon-wrap bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="cp-stat-val">{list.length}</div>
              <div className="cp-stat-lbl">Total Curriculums</div>
            </div>
          </div>

          <div className="cp-stat-box">
            <div className="cp-stat-icon-wrap bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="cp-stat-val">{activeCount}</div>
              <div className="cp-stat-lbl">Active Curriculums</div>
            </div>
          </div>

          <div className="cp-stat-box">
            <div className="cp-stat-icon-wrap bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="cp-stat-val">{totalClasses}</div>
              <div className="cp-stat-lbl">Enrolled Classes</div>
            </div>
          </div>

          <div className="cp-stat-box">
            <div className="cp-stat-icon-wrap bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <Users size={20} />
            </div>
            <div>
              <div className="cp-stat-val">{totalStudents}</div>
              <div className="cp-stat-lbl">Active Learners</div>
            </div>
          </div>
        </div>

        {/* ── FILTER & SEARCH BAR ── */}
        <div className="cp-controls-bar">
          <div className="cp-search-wrap">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search curriculum by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cp-search-input"
            />
          </div>

          <div className="cp-filter-tabs">
            {['all', 'active', 'draft'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterActive(tab)}
                className={`cp-filter-tab ${filterActive === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── CURRICULUMS GRID ── */}
        {loading ? (
          <div className="cp-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-56 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800 rounded-3xl text-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BookOpen size={36} className="text-purple-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Curriculums Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              {searchTerm ? `No results matching "${searchTerm}"` : 'Create your first curriculum to organize Cambridge Primary subjects.'}
            </p>
            {!isTeacher && (
              <button className="cp-btn-primary" onClick={openCreate}>
                <Plus size={15} /> Create Curriculum
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
              {filteredList.map((c) => (
                <motion.div
                  key={c.id}
                  className="cp-card"
                  variants={cardVariant}
                  layout
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  {/* Thumbnail Banner */}
                  {c.thumbnail_url ? (
                    <div className="h-32 overflow-hidden relative">
                      <img src={c.thumbnail_url} alt={c.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="cp-thumb-placeholder">
                      <div className="cp-thumb-orb" />
                      <GraduationCap size={36} className="text-cyan-300/40 relative z-10" />
                    </div>
                  )}

                  <div className="cp-card-body">
                    <div className="flex items-start justify-between gap-2">
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
                        <BookOpen size={12} className="text-cyan-400" /> {c.class_count ?? 0} Class{c.class_count !== 1 ? 'es' : ''}
                      </span>
                      <span className="cp-stat-chip">
                        <Users size={12} className="text-purple-400" /> {c.student_count ?? 0} Students
                      </span>
                    </div>
                  </div>

                  <div className="cp-card-footer">
                    <Link to={isTeacher ? `/courses/${c.id}` : `/admin/curriculum/${c.id}`} className="cp-manage-link">
                      <span>Manage Hierarchy</span>
                      <ArrowUpRight size={14} />
                    </Link>

                    {!isTeacher && (
                      <>
                        <button
                          onClick={() => toggleActive(c)}
                          title={c.is_active ? 'Deactivate' : 'Activate'}
                          className={`cp-icon-btn ${c.is_active ? 'toggle-on' : 'toggle-off'}`}
                        >
                          {c.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button onClick={() => openEdit(c)} className="cp-icon-btn edit" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(c.id)} className="cp-icon-btn delete" title="Delete">
                          <Trash2 size={14} />
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
            label="Curriculum Name"
            placeholder="e.g. Cambridge Primary Mathematics Stage 1-5"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Description"
            rows={3}
            placeholder="Describe the learning objectives and subject scope..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Thumbnail Banner URL (optional)"
            placeholder="https://images.unsplash.com/..."
            value={form.thumbnail_url}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
          />
          <Toggle
            label="Active Status (visible to enrolled students)"
            checked={form.is_active}
            onChange={(v) => setForm({ ...form, is_active: v })}
          />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-800">
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