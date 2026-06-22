import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Video, Sparkles, Lock, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Badge, Skeleton, EmptyState, Modal } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import clsx from 'clsx';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .sp-root {
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
  .sp-root *, .sp-root *::before, .sp-root *::after { box-sizing: border-box; }

  /* ── HEADER ── */
  .sp-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(0,212,255,0.05) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 24px; padding: 1.5rem 1.75rem;
    overflow: hidden; backdrop-filter: blur(16px);
    margin-bottom: 1.5rem;
    display: flex; align-items: center; gap: 1rem;
  }
  .sp-header-blob {
    position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    top: -60px; right: -40px;
    animation: sp-drift 9s ease-in-out infinite alternate;
  }
  @keyframes sp-drift { from{transform:translate(0,0)} to{transform:translate(18px,-12px)} }

  .sp-back-btn {
    width: 40px; height: 40px; border-radius: 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted);
    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
    flex-shrink: 0; position: relative; z-index: 1;
  }
  .sp-back-btn:hover {
    background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.3);
    color: var(--lavender); transform: translateX(-2px);
  }
  .sp-header-text { position: relative; z-index: 1; }
  .sp-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .sp-count { font-size: 0.75rem; color: var(--muted); margin-top: 0.15rem; }

  /* ── PREMIUM NOTICE ── */
  .sp-premium-notice {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.9rem 1.1rem; border-radius: 16px;
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.2);
    margin-bottom: 1.25rem;
    position: relative; overflow: hidden;
  }
  .sp-premium-notice::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(245,158,11,0.04) 0%, transparent 100%);
    pointer-events: none;
  }
  .sp-premium-text { font-size: 0.78rem; color: rgba(252,211,77,0.9); line-height: 1.5; }
  .sp-premium-text strong { color: #FCD34D; font-weight: 700; }

  /* ── CONTENT ITEM ── */
  .sp-item {
    width: 100%;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 18px;
    padding: 1rem 1.15rem;
    display: flex; align-items: center; gap: 1rem;
    cursor: pointer; text-align: left;
    transition: border-color 0.25s, background 0.25s, transform 0.2s, box-shadow 0.25s;
    position: relative; overflow: hidden;
  }
  .sp-item:not(.locked):hover {
    border-color: rgba(124,58,237,0.35);
    background: rgba(124,58,237,0.06);
    transform: translateX(3px);
    box-shadow: 0 8px 32px rgba(124,58,237,0.12);
  }
  .sp-item.locked { opacity: 0.55; cursor: not-allowed; }

  /* Accent line on hover */
  .sp-item:not(.locked)::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: linear-gradient(180deg, var(--violet), var(--cyan));
    border-radius: 0 3px 3px 0;
    transform: scaleY(0);
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    transform-origin: center;
  }
  .sp-item:not(.locked):hover::before { transform: scaleY(1); }

  /* Icon bubble */
  .sp-icon-bubble {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: transform 0.25s, background 0.25s;
  }
  .sp-item:not(.locked):hover .sp-icon-bubble { transform: scale(1.08); }
  .sp-icon-note    { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
  .sp-icon-video   { background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.2); }
  .sp-icon-anim    { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); }
  .sp-icon-locked  { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }

  /* Info */
  .sp-item-info { flex: 1; min-width: 0; }
  .sp-item-title {
    font-size: 0.85rem; font-weight: 600; line-height: 1.35;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sp-item-title.locked-txt { color: var(--muted); }
  .sp-item-title.normal-txt { color: var(--cream); }
  .sp-badges { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.35rem; }
  .sp-type-badge {
    display: inline-flex; align-items: center; gap: 0.25rem;
    padding: 0.15rem 0.55rem; border-radius: 50px;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    border: 1px solid;
  }
  .sp-badge-note    { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: var(--muted); }
  .sp-badge-video   { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.25); color: var(--lavender); }
  .sp-badge-anim    { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: #6EE7B7; }
  .sp-badge-premium { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }

  /* Arrow */
  .sp-item-arrow {
    width: 30px; height: 30px; border-radius: 10px;
    background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.15);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
  }
  .sp-item:not(.locked):hover .sp-item-arrow {
    background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4);
    transform: translateX(2px);
  }

  /* Group headers */
  .sp-group-label {
    display: flex; align-items: center; gap: 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 0.6rem; padding-left: 0.25rem;
  }
  .sp-group-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  /* Skeleton */
  .sp-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: sp-shimmer 1.6s ease infinite;
    border-radius: 12px;
  }
  @keyframes sp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* Modal inner */
  .sp-modal-toolbar {
    display: flex; align-items: center; justify-content: flex-end;
    margin-bottom: 0.75rem;
  }
  .sp-open-link {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.75rem; color: var(--violet-l); font-weight: 600;
    text-decoration: none; transition: color 0.2s;
  }
  .sp-open-link:hover { color: var(--cyan); }
`;

const TYPE_CONFIG = {
  note:      { icon: FileText,  iconCls: 'sp-icon-note',  badge: 'sp-badge-note',  label: 'Note',      color: 'rgba(245,240,232,0.6)' },
  video:     { icon: Video,     iconCls: 'sp-icon-video', badge: 'sp-badge-video', label: 'Video',     color: 'var(--violet-l)' },
  animation: { icon: Sparkles,  iconCls: 'sp-icon-anim',  badge: 'sp-badge-anim',  label: 'Animation', color: '#6EE7B7' },
};

export default function SubjectPage() {
  const { curriculumId, subjectId } = useParams();
  const navigate  = useNavigate();
  const isPremium = useAuthStore((s) => s.isPremium());

  const [previewAnim, setPreviewAnim] = useState(null);
  const [pdfUrl, setPdfUrl]           = useState(null);
  const [videoId, setVideoId]         = useState(null);

  const { data: content, loading } = useApi(
    () => studentApi.getSubjectContent(subjectId), null, [subjectId]
  );
  const { mutate: logActivity } = useMutation(studentApi.logActivity);
  const { mutate: getNoteUrl, loading: loadingNote } = useMutation(
    studentApi.getNoteUrl, { onSuccess: (res) => setPdfUrl(res.url) }
  );
  const { mutate: getAnimation } = useMutation(
    studentApi.getAnimation, { onSuccess: (res) => setPreviewAnim(res.data) }
  );

  const handleOpen = (item) => {
    if (item.is_premium && !isPremium) return;
    if (item.content_type === 'note') {
      logActivity({ activity_type: 'study', content_id: item.id });
      getNoteUrl(item.id);
    } else if (item.content_type === 'video') {
      logActivity({ activity_type: 'video', content_id: item.id });
      setVideoId(item.mux_playback_id);
    } else if (item.content_type === 'animation') {
      logActivity({ activity_type: 'animation', content_id: item.id });
      getAnimation(item.animation_id);
    }
  };

  const items = content ?? [];

  /* Group by type for nicer visual organization */
  const groups = [
    { key: 'video',     label: 'Videos',     dot: 'var(--violet-l)', items: items.filter(i => i.content_type === 'video') },
    { key: 'note',      label: 'Notes',      dot: 'rgba(245,240,232,0.5)', items: items.filter(i => i.content_type === 'note') },
    { key: 'animation', label: 'Animations', dot: '#6EE7B7', items: items.filter(i => i.content_type === 'animation') },
  ].filter(g => g.items.length > 0);

  /* Staggered index across all items for animation delay */
  let globalIdx = 0;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="sp-root">

        {/* Header */}
        <motion.div
          className="sp-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="sp-header-blob" />
          <button className="sp-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>
          <div className="sp-header-text">
            <h1 className="sp-title">Subject Content</h1>
            <p className="sp-count">
              {loading ? 'Loading…' : `${items.length} item${items.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
        </motion.div>

        {/* Premium notice */}
        <AnimatePresence>
          {!isPremium && items.some(i => i.is_premium) && (
            <motion.div
              className="sp-premium-notice"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Lock size={16} style={{ color: '#FCD34D', flexShrink: 0 }} />
              <p className="sp-premium-text">
                Some content requires a <strong>Premium</strong> plan. Contact your admin to upgrade.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.15rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="sp-skel" style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="sp-skel" style={{ height: 14, width: '60%' }} />
                  <div className="sp-skel" style={{ height: 10, width: '30%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No content yet"
            description="Your teacher hasn't uploaded anything here yet. Check back soon."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {groups.map((group) => (
              <div key={group.key}>
                <div className="sp-group-label">
                  <span className="sp-group-dot" style={{ background: group.dot, boxShadow: `0 0 6px ${group.dot}` }} />
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {group.items.map((item) => {
                    const cfg    = TYPE_CONFIG[item.content_type] ?? TYPE_CONFIG.note;
                    const Icon   = cfg.icon;
                    const locked = item.is_premium && !isPremium;
                    const delay  = (globalIdx++) * 0.045;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay, duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        <button
                          className={clsx('sp-item', locked && 'locked')}
                          onClick={() => handleOpen(item)}
                          disabled={locked}
                        >
                          {/* Icon bubble */}
                          <div className={clsx('sp-icon-bubble', locked ? 'sp-icon-locked' : cfg.iconCls)}>
                            {locked
                              ? <Lock size={17} style={{ color: '#FCD34D' }} />
                              : <Icon size={19} style={{ color: cfg.color }} />
                            }
                          </div>

                          {/* Info */}
                          <div className="sp-item-info">
                            <p className={clsx('sp-item-title', locked ? 'locked-txt' : 'normal-txt')}>
                              {item.title}
                            </p>
                            <div className="sp-badges">
                              <span className={`sp-type-badge ${cfg.badge}`}>
                                {cfg.label}
                              </span>
                              {item.is_premium && (
                                <span className="sp-type-badge sp-badge-premium">
                                  <Lock size={8} /> Premium
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          {!locked && (
                            <div className="sp-item-arrow">
                              <ChevronRight size={13} style={{ color: 'var(--violet-l)' }} />
                            </div>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PDF Modal ── */}
        <Modal open={!!pdfUrl} onClose={() => setPdfUrl(null)} title="Note" size="xl">
          <div className="sp-modal-toolbar">
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="sp-open-link">
              Open in new tab <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', height: 520 }}>
            {pdfUrl && <iframe src={pdfUrl} title="Note PDF" className="w-full h-full" style={{ border: 'none', width: '100%', height: '100%' }} />}
          </div>
        </Modal>

        {/* ── Video Modal ── */}
        <Modal open={!!videoId} onClose={() => setVideoId(null)} title="Video" size="xl">
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
            {videoId && (
              <iframe
                src={`https://stream.mux.com/${videoId}.m3u8`}
                title="Video"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            )}
          </div>
        </Modal>

        {/* ── Animation Modal ── */}
        <Modal
          open={!!previewAnim}
          onClose={() => setPreviewAnim(null)}
          title={previewAnim?.title ?? 'Animation'}
          size="xl"
        >
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', height: 500 }}>
            {previewAnim?.html_content && (
              <iframe
                srcDoc={previewAnim.html_content}
                title={previewAnim.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                sandbox="allow-scripts"
              />
            )}
          </div>
        </Modal>
      </div>
    </PageWrapper>
  );
}