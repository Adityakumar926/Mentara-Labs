import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Layers, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper, Skeleton, EmptyState } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .subj-root {
    --navy:     #0A0E1A;
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
  .subj-root *, .subj-root *::before, .subj-root *::after { box-sizing: border-box; }

  /* ── HEADER ── */
  .subj-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 28px;
    padding: 1.75rem 2.25rem;
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
    width: 40px; height: 40px; border-radius: 14px; border: none;
    background: rgba(255,255,255,0.06); color: var(--muted);
    cursor: pointer; flex-shrink: 0; position: relative; z-index: 1;
    transition: background 0.2s, color 0.2s, transform 0.2s;
  }
  .subj-back-btn:hover { background: rgba(124,58,237,0.15); color: var(--cream); transform: translateX(-2px); }

  .subj-header-text { position: relative; z-index: 1; flex: 1; min-width: 0; }
  .subj-eyebrow {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
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
  .subj-subtitle { font-size: 0.78rem; color: var(--muted); }

  /* ── SUBJECT CARDS ── */
  .subj-grid {
    display: flex; flex-direction: column; gap: 0.65rem;
  }

  .subj-card {
    display: flex; align-items: center; gap: 1rem;
    padding: 1.1rem 1.25rem;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 20px;
    text-decoration: none; color: inherit;
    cursor: pointer; position: relative; overflow: hidden;
    transition: border-color 0.25s, background 0.25s, transform 0.2s, box-shadow 0.25s;
  }
  .subj-card:hover {
    border-color: rgba(124,58,237,0.35);
    background: rgba(124,58,237,0.05);
    transform: translateX(4px);
    box-shadow: 0 8px 32px rgba(124,58,237,0.1);
  }
  .subj-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: linear-gradient(180deg, var(--violet), var(--cyan));
    border-radius: 0 3px 3px 0;
    transform: scaleY(0);
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    transform-origin: center;
  }
  .subj-card:hover::before { transform: scaleY(1); }

  /* Index bubble */
  .subj-index {
    width: 40px; height: 40px; border-radius: 13px; flex-shrink: 0;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.2);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem; font-weight: 700; color: var(--lavender);
    transition: background 0.25s, transform 0.25s;
  }
  .subj-card:hover .subj-index {
    background: rgba(124,58,237,0.22);
    transform: scale(1.07);
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
    font-size: 0.68rem; color: var(--muted);
  }
  .subj-card-meta-item { display: flex; align-items: center; gap: 0.25rem; }

  /* Badges */
  .subj-badge {
    display: inline-flex; align-items: center; gap: 0.25rem;
    padding: 0.14rem 0.5rem; border-radius: 50px;
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    border: 1px solid;
  }
  .subj-badge-premium { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }
  .subj-badge-content { background: rgba(0,212,255,0.08); border-color: rgba(0,212,255,0.2); color: var(--cyan); }

  /* Arrow */
  .subj-arrow {
    width: 30px; height: 30px; border-radius: 10px; flex-shrink: 0;
    background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.15);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
  }
  .subj-card:hover .subj-arrow {
    background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4);
    transform: translateX(2px);
  }

  /* ── SKELETON ── */
  .subj-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: subj-shimmer 1.6s ease infinite;
    border-radius: 12px;
  }
  @keyframes subj-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── EMPTY ── */
  .subj-empty {
    display: flex; flex-direction: column; align-items: center; gap: 1rem;
    padding: 3.5rem 2rem;
    border: 1px dashed rgba(124,58,237,0.2);
    border-radius: 20px;
    background: rgba(124,58,237,0.02);
    text-align: center;
  }
  .subj-empty-icon {
    width: 52px; height: 52px; border-radius: 16px;
    background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .subj-empty-title { font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; font-weight: 700; color: var(--cream); }
  .subj-empty-desc  { font-size: 0.78rem; color: var(--muted); max-width: 260px; line-height: 1.55; }
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

  const { data: subjects, loading } = useApi(
    () => studentApi.getCurriculumSubjects(curriculumId),
    null,
    [curriculumId]
  );

  const list = subjects ?? [];
  const curriculumName = list[0]?.curriculum_name ?? 'Subjects';

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

          <button className="subj-back-btn" onClick={() => navigate('/courses')}>
            <ArrowLeft size={16} />
          </button>

          <div className="subj-header-text">
            <div className="subj-eyebrow">
              <span className="subj-eyebrow-dot" />
              Curriculum
            </div>
            <h1 className="subj-title">{loading ? 'Loading…' : curriculumName}</h1>
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
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
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