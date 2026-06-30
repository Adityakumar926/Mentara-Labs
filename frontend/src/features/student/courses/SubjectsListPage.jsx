import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Layers, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper, Skeleton, EmptyState } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .subj-root {
    --navy:     var(--local-navy, #0A0E1A);
    --navy2:    var(--local-navy2, #0F1629);
    --violet:   #7C3AED;
    --violet-l: var(--local-violet-l, #9D6FEF);
    --cyan:     var(--local-cyan, #00D4FF);
    --cream:    var(--local-cream, #F5F0E8);
    --lavender: var(--local-lavender, #C4B5FD);
    --green:    var(--local-green, #10B981);
    --amber:    var(--local-amber, #F59E0B);
    --muted:    var(--local-muted, rgba(245,240,232,0.45));
    --card-bg:  var(--local-card-bg, rgba(255,255,255,0.04));
    --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.08));
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .subj-root *, .subj-root *::before, .subj-root *::after { box-sizing: border-box; }

  /* ── HEADER ── */
  .subj-header {
    position: relative;
    background: linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(124,58,237,0.1) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 2rem 2.25rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.5rem;
    display: flex; align-items: center; gap: 1rem;
  }
  .subj-blob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .subj-blob-1 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    top: -90px; right: -50px;
    animation: subj-drift 11s ease-in-out infinite alternate;
  }
  .subj-blob-2 {
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%);
    bottom: -40px; left: 30%;
    animation: subj-drift 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes subj-drift { from{transform:translate(0,0)} to{transform:translate(20px,-14px)} }

  .subj-back-btn {
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: 14px;
    border: 2px solid var(--card-bdr);
    background: var(--local-card-bg); color: var(--muted);
    cursor: pointer; flex-shrink: 0; position: relative; z-index: 1;
    transition: background 0.2s, color 0.2s, transform 0.2s;
    font-weight: 700;
  }
  .subj-back-btn:hover { background: var(--color-surface-hover); color: var(--cream); transform: translateX(-2px); }

  .subj-header-text { position: relative; z-index: 1; flex: 1; min-width: 0; }
  .subj-eyebrow {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: rgba(124,58,237,0.15); border: 2px solid rgba(124,58,237,0.35);
    padding: 0.22rem 0.75rem; border-radius: 50px;
    font-size: 0.67rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.4rem;
  }
  .subj-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 7px var(--cyan);
    animation: subj-blink 2s ease infinite;
  }
  @keyframes subj-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .subj-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.15rem, 2.2vw, 1.55rem);
    font-weight: 700; letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    line-height: 1.2; margin-bottom: 0.1rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .subj-subtitle { font-size: 0.78rem; color: var(--muted); font-weight: 600; }

  /* ── SUBJECT CARDS ── */
  .subj-grid {
    display: flex; flex-direction: column; gap: 0.65rem;
  }

  .subj-card {
    display: flex; align-items: center; gap: 1rem;
    padding: 1.1rem 1.25rem;
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    border-radius: 20px;
    text-decoration: none; color: inherit;
    cursor: pointer; position: relative; overflow: hidden;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .subj-card:hover {
    border-color: var(--violet);
    background: var(--color-surface-hover);
    box-shadow: 0 4px 20px rgba(10,14,26,0.25);
  }

  /* Index bubble */
  .subj-index {
    width: 40px; height: 40px; border-radius: 13px; flex-shrink: 0;
    background: rgba(124,58,237,0.1);
    border: 2px solid rgba(124,58,237,0.3);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem; font-weight: 700; color: var(--lavender);
    transition: background 0.2s;
  }
  .subj-card:hover .subj-index {
    background: rgba(124,58,237,0.18);
  }

  /* Text */
  .subj-card-body { flex: 1; min-width: 0; }
  .subj-card-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem; font-weight: 700; color: var(--cream);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 0.2rem;
  }
  .subj-card-meta {
    display: flex; align-items: center; gap: 0.6rem;
    font-size: 0.68rem; color: var(--muted); font-weight: 600;
  }
  .subj-card-meta-item { display: flex; align-items: center; gap: 0.25rem; }

  /* Badges */
  .subj-badge {
    display: inline-flex; align-items: center; gap: 0.25rem;
    padding: 0.14rem 0.5rem; border-radius: 50px;
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    border: 2px solid;
  }
  .subj-badge-premium { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: var(--amber); }
  .subj-badge-content { background: rgba(0,212,255,0.08); border-color: rgba(0,212,255,0.2); color: var(--cyan); }

  /* Arrow */
  .subj-arrow {
    width: 30px; height: 30px; border-radius: 10px; flex-shrink: 0;
    background: rgba(124,58,237,0.08); border: 2px solid rgba(124,58,237,0.25);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, border-color 0.2s;
  }
  .subj-card:hover .subj-arrow {
    background: rgba(124,58,237,0.15); border-color: var(--violet);
  }

  /* ── SKELETON ── */
  .subj-skel {
    background: linear-gradient(90deg, var(--color-surface-border) 25%, var(--color-surface-hover) 50%, var(--color-surface-border) 75%);
    background-size: 200% 100%;
    animation: subj-shimmer 1.6s ease infinite;
    border-radius: 12px;
  }
  @keyframes subj-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── EMPTY ── */
  .subj-empty {
    display: flex; flex-direction: column; align-items: center; gap: 1rem;
    padding: 3.5rem 2rem;
    border: 2px dashed var(--card-bdr);
    border-radius: 20px;
    background: var(--card-bg);
    text-align: center;
  }
  .subj-empty-icon {
    width: 52px; height: 52px; border-radius: 16px;
    background: var(--local-card-bg); border: 2px solid var(--local-card-bdr);
    display: flex; align-items: center; justify-content: center;
  }
  .subj-empty-title { font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; font-weight: 700; color: var(--cream); }
  .subj-empty-desc  { font-size: 0.78rem; color: var(--muted); max-width: 260px; line-height: 1.55; font-weight: 600; }
`;

const listContainer = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};
const cardVariant = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function SubjectsListPage() {
  const { curriculumId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: subjects, loading } = useApi(
    () => studentApi.getCurriculumSubjects(curriculumId),
    null,
    [curriculumId]
  );

  const list = subjects ?? [];
  const curriculumName = list[0]?.curriculum_name ?? 'Subjects';
  const className = list[0]?.class_name;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="subj-root">

        {/* ── Header ── */}
        <motion.div
          className="subj-header"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="subj-blob subj-blob-1" />
          <div className="subj-blob subj-blob-2" />

          {user?.role !== 'student' && (
            <button className="subj-back-btn" onClick={() => navigate('/courses')}>
              <ArrowLeft size={16} />
            </button>
          )}

          <div className="subj-header-text">
            <div className="subj-eyebrow">
              <span className="subj-eyebrow-dot" />
              {className ? `${curriculumName} • ${className}` : curriculumName}
            </div>
            <h1 className="subj-title">{loading ? 'Loading…' : className ? `${className} Subjects` : curriculumName}</h1>
            <p className="subj-subtitle">
              {loading ? '' : `${list.length} subject${list.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </motion.div>

        {/* ── Subject list ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {Array(5).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.1rem 1.25rem',
                  background: 'var(--local-card-bg)',
                  border: '2px solid var(--local-card-bdr)',
                  borderRadius: 20,
                }}
              >
                <div className="subj-skel" style={{ width: 40, height: 40, borderRadius: 13, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="subj-skel" style={{ height: 14, width: '55%' }} />
                  <div className="subj-skel" style={{ height: 10, width: '30%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <motion.div
            className="subj-empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="subj-empty-icon">
              <BookOpen size={22} style={{ color: 'var(--violet-l)' }} />
            </div>
            <p className="subj-empty-title">No subjects yet</p>
            <p className="subj-empty-desc">Your teacher hasn't added any subjects to this curriculum yet. Check back soon.</p>
          </motion.div>
        ) : (
          <motion.div
            className="subj-grid"
            variants={listContainer}
            initial="hidden"
            animate="show"
          >
            {list.map((subject, idx) => (
              <motion.div key={subject.id} variants={cardVariant}>
                <Link
                  to={`/courses/${curriculumId}/subjects/${subject.id}`}
                  className="subj-card"
                >
                  {/* Index bubble */}
                  <div className="subj-index">
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {/* Info */}
                  <div className="subj-card-body">
                    <p className="subj-card-name">{subject.name}</p>
                    <div className="subj-card-meta">
                      <span className="subj-card-meta-item">
                        <Layers size={10} style={{ color: 'var(--violet-l)' }} />
                        {subject.content_count ?? 0} item{subject.content_count !== 1 ? 's' : ''}
                      </span>
                      {subject.premium_content_count > 0 && (
                        <span className="subj-badge subj-badge-premium">
                          <Lock size={8} /> {subject.premium_content_count} premium
                        </span>
                      )}
                      {subject.content_count > 0 && (
                        <span className="subj-badge subj-badge-content">
                          {subject.content_count} content
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="subj-arrow">
                    <ChevronRight size={13} style={{ color: 'var(--violet-l)' }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}