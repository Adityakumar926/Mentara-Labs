import { useState } from 'react';
import { BookOpen, Users, Calendar, CheckCircle, Search, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, EmptyState, Button } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import clsx from 'clsx';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .eb-root {
    --navy:     #0A0E1A;
    --navy2:    #0F1629;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --muted:    rgba(245,240,232,0.45);
    --card-bg:  rgba(255,255,255,0.04);
    --card-bdr: rgba(255,255,255,0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .eb-root *, .eb-root *::before, .eb-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .eb-header {
    position: relative;
    background: linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.12) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 28px;
    padding: 2rem 2.5rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.5rem;
  }
  .eb-header-blob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .eb-blob-1 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 70%);
    top: -80px; left: -50px;
    animation: eb-float 11s ease-in-out infinite alternate;
  }
  .eb-blob-2 {
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    bottom: -60px; right: -30px;
    animation: eb-float 9s ease-in-out infinite alternate-reverse;
  }
  @keyframes eb-float { from{transform:translate(0,0)} to{transform:translate(25px,-20px)} }

  .eb-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25);
    padding: 0.3rem 0.9rem; border-radius: 50px;
    font-size: 0.7rem; font-weight: 700; color: var(--cyan);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.75rem;
  }
  .eb-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: eb-blink 2s ease infinite;
  }
  @keyframes eb-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  .eb-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.5rem,3vw,2rem); font-weight: 700; letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.3rem;
  }
  .eb-subtitle { font-size: 0.85rem; color: var(--muted); }

  /* ── SEARCH ── */
  .eb-search-wrap {
    position: relative; max-width: 440px; margin-bottom: 2rem;
  }
  .eb-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: var(--muted); pointer-events: none;
  }
  .eb-search {
    width: 100%; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px; padding: 0.75rem 1rem 0.75rem 2.75rem;
    font-family: 'Inter', sans-serif; font-size: 0.85rem;
    color: var(--cream); outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .eb-search::placeholder { color: var(--muted); }
  .eb-search:focus {
    border-color: rgba(124,58,237,0.5);
    background: rgba(124,58,237,0.06);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }

  /* ── SECTION LABEL ── */
  .eb-section-label {
    display: flex; align-items: center; gap: 0.6rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.82rem; font-weight: 700;
    color: var(--cream); letter-spacing: 0.02em;
    margin-bottom: 0.9rem;
  }
  .eb-section-dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── BATCH CARD ── */
  .eb-card {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px; overflow: hidden;
    backdrop-filter: blur(12px);
    display: flex; flex-direction: column;
    transition: border-color 0.3s, transform 0.25s, box-shadow 0.3s;
  }
  .eb-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 50px rgba(0,0,0,0.3);
  }
  .eb-card.enrolled {
    border-color: rgba(16,185,129,0.2);
    background: linear-gradient(135deg, rgba(16,185,129,0.04) 0%, var(--card-bg) 60%);
  }
  .eb-card.enrolled:hover { border-color: rgba(16,185,129,0.4); box-shadow: 0 16px 50px rgba(16,185,129,0.1); }

  /* Thumb */
  .eb-thumb { height: 140px; position: relative; overflow: hidden; flex-shrink: 0; }
  .eb-thumb img { width:100%;height:100%;object-fit:cover;transition:transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94); }
  .eb-card:hover .eb-thumb img { transform: scale(1.05); }
  .eb-thumb::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(to top, rgba(10,14,26,0.8) 0%, transparent 55%);
    pointer-events: none;
  }
  .eb-thumb-fallback {
    width:100%;height:100%;
    background: linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(10,14,26,0.8) 60%, rgba(124,58,237,0.1) 100%);
    display:flex;align-items:center;justify-content:center;
  }
  .eb-thumb-icon {
    width:48px;height:48px;border-radius:16px;
    background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.15);
    display:flex;align-items:center;justify-content:center;
    transition: background 0.3s, transform 0.3s;
  }
  .eb-card:hover .eb-thumb-icon { transform: scale(1.1); background: rgba(0,212,255,0.2); }

  /* Status badge */
  .eb-status {
    position: absolute; top: 10px; right: 10px; z-index: 2;
    padding: 0.2rem 0.6rem; border-radius: 50px;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    backdrop-filter: blur(8px); border: 1px solid;
  }
  .eb-status.active   { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.4); color: #6EE7B7; }
  .eb-status.upcoming { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4); color: var(--lavender); }
  .eb-status.completed{ background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); color: var(--muted); }
  .eb-status.open     { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.4); color: #6EE7B7; }

  /* Body */
  .eb-body { padding: 1.1rem 1.1rem 1.25rem; display:flex;flex-direction:column;gap:0.6rem;flex:1; }
  .eb-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem; font-weight: 700; color: var(--cream); line-height:1.3;
  }
  .eb-curriculum { font-size: 0.72rem; color: var(--cyan); font-weight: 600; margin-top: 0.15rem; }
  .eb-desc { font-size: 0.72rem; color: var(--muted); line-height: 1.6; display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
  .eb-meta { display:flex;align-items:center;gap:0.75rem; }
  .eb-meta-item { display:flex;align-items:center;gap:0.3rem;font-size:0.65rem;color:var(--muted);font-weight:500; }

  /* Price + action row */
  .eb-action-row {
    display:flex;align-items:center;justify-content:space-between;
    padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.07);
    margin-top: auto;
  }
  .eb-price-free { font-family:'Space Grotesk',sans-serif;font-size:0.9rem;font-weight:700;color:var(--green); }
  .eb-price-paid { font-family:'Space Grotesk',sans-serif;font-size:0.9rem;font-weight:700;color:var(--violet-l); }

  /* Join / Leave */
  .eb-join-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.45rem 1rem; border-radius: 12px; border: none;
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    color: #fff; font-size: 0.75rem; font-weight: 700;
    cursor: pointer; font-family: 'Inter', sans-serif;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 0 20px rgba(124,58,237,0.35);
  }
  .eb-join-btn:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(124,58,237,0.55); }
  .eb-join-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .eb-enrolled-tag {
    display: flex; align-items: center; gap: 0.3rem;
    font-size: 0.72rem; font-weight: 700; color: var(--green);
  }
  .eb-leave-btn {
    background: none; border: none; cursor: pointer;
    font-size: 0.65rem; color: var(--muted);
    text-decoration: underline; transition: color 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .eb-leave-btn:hover { color: #EF4444; }

  /* Shimmer */
  .eb-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: eb-shimmer 1.6s ease infinite;
    border-radius: 12px;
  }
  @keyframes eb-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

const batchStatus = (b) => {
  const now   = new Date();
  const start = b.start_date ? new Date(b.start_date) : null;
  const end   = b.end_date   ? new Date(b.end_date)   : null;
  if (!start)          return { label: 'Open',      cls: 'open' };
  if (now < start)     return { label: 'Upcoming',  cls: 'upcoming' };
  if (end && now > end)return { label: 'Completed', cls: 'completed' };
  return                      { label: 'Active',    cls: 'active' };
};

function BatchCard({ batch: b, idx, onJoin, onLeave, isJoining, enrolled }) {
  const status = batchStatus(b);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={clsx('eb-card', enrolled && 'enrolled')}>
        {/* Thumb */}
        <div className="eb-thumb">
          {b.thumbnail_url ? (
            <img src={b.thumbnail_url} alt={b.curriculum_name} />
          ) : (
            <div className="eb-thumb-fallback">
              <div className="eb-thumb-icon">
                <BookOpen size={22} color="rgba(0,212,255,0.75)" />
              </div>
            </div>
          )}
          <span className={`eb-status ${status.cls}`}>{status.label}</span>
        </div>

        {/* Body */}
        <div className="eb-body">
          <div>
            <div className="eb-name">{b.name}</div>
            <div className="eb-curriculum">{b.curriculum_name}</div>
          </div>

          {b.curriculum_description && (
            <p className="eb-desc">{b.curriculum_description}</p>
          )}

          <div className="eb-meta">
            <span className="eb-meta-item">
              <Users size={10} style={{ color: 'var(--violet-l)' }} />
              {b.student_count ?? 0} students
            </span>
            <span className="eb-meta-item">
              <Layers size={10} style={{ color: 'var(--cyan)' }} />
              {b.subject_count ?? 0} subjects
            </span>
            {b.start_date && (
              <span className="eb-meta-item">
                <Calendar size={10} style={{ color: 'var(--amber)' }} />
                {fmt(b.start_date)}
              </span>
            )}
          </div>

          <div className="eb-action-row">
            <span className={b.is_free ? 'eb-price-free' : 'eb-price-paid'}>
              {b.is_free ? 'Free' : `₹${b.price}`}
            </span>

            {enrolled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="eb-enrolled-tag">
                  <CheckCircle size={13} /> Enrolled
                </span>
                <button className="eb-leave-btn" onClick={onLeave}>Leave</button>
              </div>
            ) : (
              <button
                className="eb-join-btn"
                disabled={isJoining}
                onClick={onJoin}
              >
                {b.is_free ? 'Join Free' : 'Enroll'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExploreBatchesPage() {
  const [search, setSearch] = useState('');

  const { data: batches, loading, refetch } = useApi(studentApi.getAllBatches);
  const { mutate: join, loading: joining } = useMutation(studentApi.joinBatch, {
    onSuccess: refetch, successMsg: 'Successfully enrolled!',
  });
  const { mutate: leave } = useMutation(studentApi.leaveBatch, {
    onSuccess: refetch, successMsg: 'Left batch',
  });

  const filtered = (batches ?? []).filter((b) =>
    !search ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.curriculum_name.toLowerCase().includes(search.toLowerCase())
  );
  const enrolled  = filtered.filter((b) =>  b.is_enrolled);
  const available = filtered.filter((b) => !b.is_enrolled);

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="eb-root">

        {/* Header */}
        <motion.div
          className="eb-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="eb-header-blob eb-blob-1" />
          <div className="eb-header-blob eb-blob-2" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="eb-eyebrow">
              <span className="eb-eyebrow-dot" />
              Discover
            </div>
            <h1 className="eb-title">Explore Batches</h1>
            <p className="eb-subtitle">Browse and join batches to unlock courses and exams</p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="eb-search-wrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Search size={14} className="eb-search-icon" />
          <input
            className="eb-search"
            placeholder="Search batches or curriculums…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                <div className="eb-skel" style={{ height: 140 }} />
                <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div className="eb-skel" style={{ height: 16, width: '65%' }} />
                  <div className="eb-skel" style={{ height: 11, width: '45%' }} />
                  <div className="eb-skel" style={{ height: 11, width: '85%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No batches found"
            description="Try adjusting your search or check back later."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Enrolled */}
            {enrolled.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                <div className="eb-section-label">
                  <span className="eb-section-dot" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                  Enrolled · {enrolled.length}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
                  <AnimatePresence>
                    {enrolled.map((b, i) => (
                      <BatchCard key={b.id} batch={b} idx={i} onLeave={() => leave(b.id)} isJoining={joining} enrolled />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Available */}
            {available.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="eb-section-label">
                  <span className="eb-section-dot" style={{ background: 'var(--violet-l)', boxShadow: '0 0 8px var(--violet)' }} />
                  Available Batches · {available.length}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
                  <AnimatePresence>
                    {available.map((b, i) => (
                      <BatchCard key={b.id} batch={b} idx={i} onJoin={() => join(b.id)} isJoining={joining} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}