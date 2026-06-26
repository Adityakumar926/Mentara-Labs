import { Link, Navigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Calendar, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper, Skeleton, EmptyState } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';

/* ─── Design tokens (mirror ProfilePage / LandingPage) ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .cp-root {
    --navy:       #0A0E1A;
    --navy2:      #0F1629;
    --violet:     #7C3AED;
    --violet-l:   #9D6FEF;
    --cyan:       #00D4FF;
    --cream:      #F5F0E8;
    --lavender:   #C4B5FD;
    --muted:      rgba(245,240,232,0.45);
    --card-bg:    rgba(255,255,255,0.04);
    --card-bdr:   rgba(255,255,255,0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .cp-root *, .cp-root *::before, .cp-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .cp-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 28px;
    padding: 2rem 2.5rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.75rem;
  }
  .cp-header-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
  }
  .cp-header-blob-1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
    top: -80px; right: -80px;
    animation: cp-drift 10s ease-in-out infinite alternate;
  }
  .cp-header-blob-2 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%);
    bottom: -40px; left: 20%;
    animation: cp-drift 13s ease-in-out infinite alternate-reverse;
  }
  @keyframes cp-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(20px,-15px) scale(1.08); }
  }
  .cp-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124,58,237,0.15);
    border: 1px solid rgba(124,58,237,0.3);
    padding: 0.3rem 0.9rem; border-radius: 50px;
    font-size: 0.7rem; font-weight: 700;
    color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 0.75rem;
  }
  .eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: cp-blink 2s ease infinite;
  }
  @keyframes cp-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .cp-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700; line-height: 1.15; letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
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
    backdrop-filter: blur(12px);
    transition: border-color 0.3s, transform 0.25s, box-shadow 0.3s;
    display: flex; flex-direction: column;
    text-decoration: none; color: inherit;
    cursor: pointer;
  }
  .cp-card:hover {
    border-color: rgba(124,58,237,0.4);
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(124,58,237,0.18), 0 0 0 1px rgba(124,58,237,0.15);
  }
  .cp-card::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(124,58,237,0.1) 0%, transparent 60%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .cp-card:hover::before { opacity: 1; }

  /* Thumbnail */
  .cp-thumb {
    height: 160px; position: relative; overflow: hidden;
    flex-shrink: 0;
  }
  .cp-thumb img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .cp-card:hover .cp-thumb img { transform: scale(1.06); }
  .cp-thumb-fallback {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(10,14,26,0.8) 60%, rgba(0,212,255,0.08) 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .cp-thumb-icon {
    width: 56px; height: 56px; border-radius: 18px;
    background: rgba(124,58,237,0.15);
    border: 1px solid rgba(124,58,237,0.2);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.3s, transform 0.3s;
  }
  .cp-card:hover .cp-thumb-icon { background: rgba(124,58,237,0.25); transform: scale(1.08); }

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
    border: 1px solid rgba(255,255,255,0.12);
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
    font-size: 0.9rem; font-weight: 700;
    line-height: 1.3; color: var(--cream);
  }
  .cp-desc { font-size: 0.75rem; color: var(--muted); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* Footer row */
  .cp-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    margin-top: auto;
  }
  .cp-meta { display: flex; align-items: center; gap: 0.9rem; }
  .cp-meta-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.68rem; color: var(--muted); font-weight: 500; }
  .cp-arrow {
    width: 28px; height: 28px; border-radius: 10px;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.2);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    flex-shrink: 0;
  }
  .cp-card:hover .cp-arrow {
    background: rgba(124,58,237,0.25);
    border-color: rgba(124,58,237,0.5);
    transform: translateX(2px);
  }

  /* Shimmer skeleton */
  .cp-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: cp-shimmer 1.6s ease infinite;
    border-radius: 14px;
  }
  @keyframes cp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* Count badge */
  .cp-count-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(0,212,255,0.08);
    border: 1px solid rgba(0,212,255,0.2);
    border-radius: 50px;
    padding: 0.25rem 0.75rem;
    font-size: 0.72rem; font-weight: 600; color: var(--cyan);
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
              <div key={i} style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
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