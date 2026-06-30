import { Link, Navigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Calendar, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper, Skeleton, EmptyState } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';

/* ─── Design tokens (mirror ProfilePage / LandingPage) ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  .cp-root {
    --navy:       var(--local-navy, #0A0E1A);
    --navy2:      var(--local-navy2, #0F1629);
    --violet:     #7C3AED;
    --violet-l:   var(--local-violet-l, #9D6FEF);
    --cyan:       var(--local-cyan, #00D4FF);
    --cream:      var(--local-cream, #F5F0E8);
    --lavender:   var(--local-lavender, #C4B5FD);
    --muted:      var(--local-muted, rgba(245,240,232,0.45));
    --card-bg:    rgba(255, 255, 255, 0.015);
    --card-bdr:   rgba(255, 255, 255, 0.06);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.01) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
    background-size: 30px 30px;
  }
  .cp-root *, .cp-root *::before, .cp-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .cp-header {
    position: relative;
    background: linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(124,58,237,0.1) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 2rem 2.25rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.5rem;
  }
  .cp-header-blob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .cp-header-blob-1 {
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%);
    top: -60px; left: -40px;
  }
  .cp-header-blob-2 {
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
    bottom: -50px; right: -20px;
  }
  .cp-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2);
    padding: 0.3rem 0.85rem; border-radius: 50px;
    font-size: 0.65rem; font-weight: 700; color: var(--cyan);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.6rem;
  }
  .eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: cp-blink 2s ease infinite;
  }
  @keyframes cp-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  
  .cp-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.5rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1.1;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.35rem;
  }
  .cp-subtitle { font-size: 0.85rem; color: var(--muted); font-weight: 500; }

  /* ── COURSE CARD ── */
  .cp-card {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease;
    display: flex; flex-direction: column;
    text-decoration: none; color: inherit;
    cursor: pointer;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
  }
  .cp-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 12px 30px -10px rgba(34, 211, 238, 0.15), 0 4px 30px rgba(0, 0, 0, 0.15);
  }
  .cp-card::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(34, 211, 238, 0.08) 0%, transparent 60%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.25s;
  }
  .cp-card:hover::before { opacity: 1; }

  /* Thumbnail */
  .cp-thumb {
    height: 160px; position: relative; overflow: hidden;
    flex-shrink: 0;
  }
  .cp-thumb img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .cp-thumb-fallback {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, rgba(124,58,237,0.18) 0%, var(--local-navy2) 60%, rgba(0,212,255,0.08) 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .cp-thumb-icon {
    width: 56px; height: 56px; border-radius: 18px;
    background: rgba(124,58,237,0.15);
    border: 2px solid rgba(124,58,237,0.3);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }
  .cp-card:hover .cp-thumb-icon { background: rgba(124,58,237,0.22); }

  /* Gradient overlay on thumb */
  .cp-thumb::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(10,14,26,0.85) 0%, transparent 55%);
    pointer-events: none;
  }

  /* Batch pill overlaid on thumb bottom */
  .cp-batch-pill {
    position: absolute;
    bottom: 10px; left: 12px; z-index: 2;
    background: rgba(124,58,237,0.85);
    backdrop-filter: blur(8px);
    border: 1.5px solid rgba(255,255,255,0.12);
    border-radius: 50px;
    padding: 0.2rem 0.65rem;
    font-size: 0.65rem; font-weight: 700;
    color: #fff; letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Body */
  .cp-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
  .cp-course-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    line-height: 1.3; color: var(--cream);
  }
  .cp-desc { font-size: 0.75rem; color: var(--muted); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 600; }

  /* Footer row */
  .cp-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 0.75rem;
    border-top: 2px solid var(--card-bdr);
    margin-top: auto;
  }
  .cp-meta { display: flex; align-items: center; gap: 0.9rem; }
  .cp-meta-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.68rem; color: var(--muted); font-weight: 600; }
  .cp-arrow {
    width: 28px; height: 28px; border-radius: 10px;
    background: rgba(124,58,237,0.1);
    border: 2px solid rgba(124,58,237,0.25);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    flex-shrink: 0;
  }
  .cp-card:hover .cp-arrow {
    background: rgba(124,58,237,0.25);
    border-color: var(--violet);
    transform: translateX(2px);
  }

  /* Shimmer skeleton */
  .cp-skeleton {
    background: linear-gradient(90deg, var(--color-surface-border) 25%, var(--color-surface-hover) 50%, var(--color-surface-border) 75%);
    background-size: 200% 100%;
    animation: cp-shimmer 1.6s ease infinite;
    border-radius: 14px;
  }
  @keyframes cp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* Count badge */
  .cp-count-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(0,212,255,0.08);
    border: 2px solid rgba(0,212,255,0.3);
    border-radius: 50px;
    padding: 0.25rem 0.75rem;
    font-size: 0.72rem; font-weight: 700; color: var(--cyan);
  }
`;

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

/* Cursor-tracking glow on each card */
function useMouseGlow(ref) {
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width)  * 100;
    const y = ((e.clientY - r.top)  / r.height) * 100;
    if (ref.current) {
      ref.current.style.setProperty('--mx', `${x}%`);
      ref.current.style.setProperty('--my', `${y}%`);
    }
  };
  return { onMouseMove: onMove };
}

import { useRef } from 'react';

function CourseCard({ c, index }) {
  const ref = useRef(null);
  const glowProps = useMouseGlow(ref);

  return (
    <motion.div
      key={`${c.id}-${c.batch_id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        to={`/courses/${c.id}/subjects`}
        ref={ref}
        className="cp-card"
        {...glowProps}
      >
        {/* Thumbnail */}
        <div className="cp-thumb">
          {c.thumbnail_url ? (
            <img src={c.thumbnail_url} alt={c.name} />
          ) : (
            <div className="cp-thumb-fallback">
              <div className="cp-thumb-icon">
                <BookOpen size={26} color="rgba(196,181,253,0.7)" />
              </div>
            </div>
          )}
          <div className="cp-batch-pill">{c.batch_name}</div>
        </div>

        {/* Body */}
        <div className="cp-body">
          <div className="cp-course-name">{c.name}</div>
          {c.description && <p className="cp-desc">{c.description}</p>}

          <div className="cp-footer">
            <div className="cp-meta">
              <span className="cp-meta-item">
                <Layers size={10} style={{ color: 'var(--violet-l)' }} />
                {c.subject_count ?? 0} subjects
              </span>
              {c.end_date && (
                <span className="cp-meta-item">
                  <Calendar size={10} style={{ color: 'var(--cyan)' }} />
                  Until {fmt(c.end_date)}
                </span>
              )}
            </div>
            <div className="cp-arrow">
              <ChevronRight size={13} color="var(--violet-l)" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CoursesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: curriculums, loading } = useApi(studentApi.getCurriculums);
  const list = curriculums ?? [];

  if (user && user.role === 'student' && user.curriculum_id) {
    return <Navigate to={`/courses/${user.curriculum_id}/subjects`} replace />;
  }

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="cp-root">

        {/* Header */}
        <motion.div
          className="cp-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="cp-header-blob cp-header-blob-1" />
          <div className="cp-header-blob cp-header-blob-2" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="cp-eyebrow">
              <span className="eyebrow-dot" />
              Your Learning
            </div>
            <h1 className="cp-title">My Courses</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <p className="cp-subtitle">All your enrolled curriculums in one place</p>
              {!loading && (
                <motion.span
                  className="cp-count-badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <BookOpen size={11} />
                  {list.length} curriculum{list.length !== 1 ? 's' : ''}
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid var(--local-card-bdr)', background: 'var(--local-card-bg)' }}>
                <div className="cp-skeleton" style={{ height: 160 }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="cp-skeleton" style={{ height: 18, width: '70%' }} />
                  <div className="cp-skeleton" style={{ height: 13, width: '90%' }} />
                  <div className="cp-skeleton" style={{ height: 13, width: '55%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="You haven't been enrolled in any batch. Contact your admin to get started."
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {list.map((c, i) => (
              <CourseCard key={`${c.id}-${c.batch_id}`} c={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}