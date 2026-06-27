import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Video, Sparkles, Lock, ChevronRight,
  ExternalLink, Image, Pen, Minus, Palette, RotateCcw,
  CheckCircle2, X, Eraser,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Badge, Skeleton, EmptyState, Modal } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import clsx from 'clsx';
import MuxPlayer from '@mux/mux-player-react';
import toast from 'react-hot-toast';

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
  .sp-eyebrow {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.22rem 0.75rem; border-radius: 50px;
    font-size: 0.67rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.45rem;
  }
  .sp-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 7px var(--cyan);
  }
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

  .sp-icon-bubble {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: transform 0.25s, background 0.25s;
  }
  .sp-item:not(.locked):hover .sp-icon-bubble { transform: scale(1.08); }
  .sp-icon-note      { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
  .sp-icon-video     { background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.2); }
  .sp-icon-anim      { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); }
  .sp-icon-worksheet { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }
  .sp-icon-exam      { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); }
  .sp-icon-locked    { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }

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
  .sp-badge-note      { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: var(--muted); }
  .sp-badge-video     { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.25); color: var(--lavender); }
  .sp-badge-anim      { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: #6EE7B7; }
  .sp-badge-worksheet { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }
  .sp-badge-danger    { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25); color: #F87171; }
  .sp-badge-premium   { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }

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

  .sp-group-label {
    display: flex; align-items: center; gap: 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 0.6rem; padding-left: 0.25rem;
  }
  .sp-group-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  .sp-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: sp-shimmer 1.6s ease infinite;
    border-radius: 12px;
  }
  @keyframes sp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── MODAL TOOLBAR ── */
  .sp-modal-toolbar {
    display: flex; align-items: center; justify-content: flex-end;
    margin-bottom: 0.75rem;
  }
  .sp-open-link {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.75rem; color: var(--violet-l); font-weight: 600;
    text-decoration: none; transition: color 0.2s;
    background: none; border: none; padding: 0; cursor: pointer;
  }
  .sp-open-link:hover { color: var(--cyan); }

  /* ── WORKSHEET CANVAS MODAL ── */
  .ws-modal-inner {
    display: flex; flex-direction: column; gap: 0;
    border-radius: 16px; overflow: hidden;
    border: 1px solid rgba(245,158,11,0.2);
    background: #1a1a2e;
  }

  /* Toolbar */
  .ws-toolbar {
    display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
    padding: 0.6rem 0.85rem;
    background: rgba(245,158,11,0.05);
    border-bottom: 1px solid rgba(245,158,11,0.15);
  }
  .ws-toolbar-group {
    display: flex; align-items: center; gap: 0.3rem;
  }
  .ws-toolbar-sep {
    width: 1px; height: 22px; background: rgba(255,255,255,0.1); margin: 0 0.15rem;
  }

  .ws-tool-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 9px; border: 1px solid transparent;
    background: rgba(255,255,255,0.04); cursor: pointer;
    color: rgba(245,240,232,0.5);
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .ws-tool-btn:hover { background: rgba(255,255,255,0.09); color: var(--cream); }
  .ws-tool-btn.active {
    background: rgba(245,158,11,0.15);
    border-color: rgba(245,158,11,0.4);
    color: #FCD34D;
  }
  .ws-tool-btn.danger:hover { background: rgba(239,68,68,0.12); color: #F87171; border-color: rgba(239,68,68,0.3); }

  /* Size slider */
  .ws-size-wrap {
    display: flex; align-items: center; gap: 0.5rem;
  }
  .ws-size-label { font-size: 0.62rem; color: var(--muted); font-weight: 600; white-space: nowrap; }
  .ws-size-input {
    -webkit-appearance: none; appearance: none;
    width: 80px; height: 4px; border-radius: 2px;
    background: rgba(255,255,255,0.1); outline: none; cursor: pointer;
  }
  .ws-size-input::-webkit-slider-thumb {
    -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
    background: #FCD34D; cursor: pointer;
    box-shadow: 0 0 6px rgba(252,211,77,0.5);
  }
  .ws-size-input::-moz-range-thumb {
    width: 14px; height: 14px; border: none; border-radius: 50%;
    background: #FCD34D; cursor: pointer;
  }

  /* Color swatches */
  .ws-color-swatch {
    width: 22px; height: 22px; border-radius: 6px; cursor: pointer;
    border: 2px solid transparent; transition: transform 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .ws-color-swatch:hover { transform: scale(1.15); }
  .ws-color-swatch.active { border-color: #fff; transform: scale(1.1); }

  /* Canvas wrapper */
  .ws-canvas-wrap {
    position: relative; overflow: auto;
    max-height: 600px;
    background: #1a1a2e;
    cursor: crosshair;
    display: flex; justify-content: center; align-items: flex-start;
  }
  .ws-canvas-wrap.eraser-mode { cursor: cell; }
  /* Sizer div: natural image size, overlay canvas stacked on top */
  .ws-canvas-sizer {
    position: relative;
    display: inline-block;
    line-height: 0;
  }
  .ws-canvas-sizer img {
    display: block;
    max-width: 100%;
    height: auto;
    user-select: none;
    pointer-events: none;
  }
  .ws-canvas {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    display: block;
    touch-action: none;
  }

  /* Submit banner */
  .ws-submit-bar {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;
    padding: 0.65rem 0.85rem;
    background: rgba(16,185,129,0.05);
    border-top: 1px solid rgba(16,185,129,0.15);
  }
  .ws-submit-hint { font-size: 0.72rem; color: var(--muted); }
  .ws-submit-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    border: 1px solid rgba(16,185,129,0.4); color: #fff;
    font-size: 0.78rem; font-weight: 700; font-family: 'Inter', sans-serif;
    padding: 0.55rem 1.1rem; border-radius: 10px; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 14px rgba(16,185,129,0.3);
  }
  .ws-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
  .ws-submit-btn:active { transform: translateY(0); }
  .ws-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  /* Submitted overlay */
  .ws-submitted-overlay {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem;
    background: rgba(10,14,26,0.82); backdrop-filter: blur(4px);
    z-index: 10;
  }
  .ws-submitted-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(16,185,129,0.15); border: 2px solid rgba(16,185,129,0.4);
    display: flex; align-items: center; justify-content: center;
  }
  .ws-submitted-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem; font-weight: 700; color: #6EE7B7;
  }
  .ws-submitted-sub { font-size: 0.78rem; color: var(--muted); }
`;

const TYPE_CONFIG = {
  note:      { icon: FileText, iconCls: 'sp-icon-note',      badge: 'sp-badge-note',      label: 'Note',      color: 'rgba(245,240,232,0.6)' },
  video:     { icon: Video,    iconCls: 'sp-icon-video',     badge: 'sp-badge-video',     label: 'Video',     color: 'var(--violet-l)' },
  animation: { icon: Sparkles, iconCls: 'sp-icon-anim',      badge: 'sp-badge-anim',      label: 'Animation', color: '#6EE7B7' },
  worksheet: { icon: Image,    iconCls: 'sp-icon-worksheet', badge: 'sp-badge-worksheet', label: 'Worksheet', color: '#FCD34D' },
  exam:      { icon: CheckCircle2, iconCls: 'sp-icon-exam',  badge: 'sp-badge-danger',    label: 'Exam',      color: '#EF4444' },
};

// ── Worksheet palette ──────────────────────────────────────────────────────────
const PALETTE = [
  '#1a1a1a', // near-black (default)
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#ffffff', // white
];

export default function SubjectPage() {
  const { curriculumId, subjectId, topicId } = useParams();
  const navigate  = useNavigate();
  const isPremium = useAuthStore((s) => s.isPremium());


  const [pdfUrl, setPdfUrl]           = useState(null);
  const [videoId, setVideoId]         = useState(null);
  const [activeVideoContentId, setActiveVideoContentId] = useState(null);

  const lastProgressRef = useRef(0);

  const { data: content, loading, refetch } = useApi(
    () => studentApi.getTopicContent(topicId), null, [topicId]
  );


  const handleOpenAnimation = async (animId) => {
    const animWindow = window.open('', '_blank');
    if (animWindow) {
      animWindow.document.write('<div style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#0A0E1A;color:#fff;">Loading Animation...</div>');
    }
    try {
      const res = await studentApi.getAnimation(animId);
      const anim = res.data.data;
      if (anim?.html_content && animWindow) {
        animWindow.document.open();
        animWindow.document.write(anim.html_content);
        animWindow.document.close();
      } else if (animWindow) {
        animWindow.close();
      }
    } catch (e) {
      console.error(e);
      if (animWindow) animWindow.close();
      toast.error('Failed to open animation.');
    }
  };



  // Setup popup window callback for worksheet drawing submission
  useEffect(() => {
    window.onWorksheetSubmit = (contentId) => {
      studentApi.trackResource({ contentId, completed: true })
        .then(() => {
          refetch();
        })
        .catch(err => console.error('Failed to submit worksheet progress:', err));
    };
    return () => {
      window.onWorksheetSubmit = null;
    };
  }, [refetch]);

  const handleVideoProgress = (progress, isCompleted) => {
    if (!activeVideoContentId) return;
    // Throttle progress updates to at least 5% jumps, or on completion
    if (progress - lastProgressRef.current >= 5 || (isCompleted && lastProgressRef.current < 90)) {
      lastProgressRef.current = progress;
      studentApi.trackVideo({
        contentId: activeVideoContentId,
        progress,
        completed: isCompleted
      })
      .then(() => {
        if (isCompleted) {
          refetch();
        }
      })
      .catch(err => console.error('Failed to track video progress:', err));
    }
  };
  const handleWorksheetSubmit = (contentId) => {
    studentApi.trackResource({ contentId, completed: true })
      .then(() => refetch())
      .catch(err => console.error('Failed to submit worksheet progress:', err));
  };

  const handleOpen = (item) => {
    if (item.is_premium && !isPremium) {
      toast.error('This is a premium resource. Please upgrade to premium to access.');
      return;
    }
    if (item.content_type === 'exam') {
      if (item.status === 'live') {
        if (item.submission_status === 'submitted') {
          navigate(`/exams/${item.id}/result`);
        } else {
          navigate(`/exams/${item.id}/take`);
        }
      } else if (item.status === 'ended') {
        if (item.submission_status === 'submitted') {
          navigate(`/exams/${item.id}/result`);
        } else {
          toast.error('This exam has ended and is no longer available to start.');
        }
      } else if (item.status === 'scheduled') {
        toast.error(`This exam is scheduled to start on ${new Date(item.scheduled_at).toLocaleString()}`);
      }
      return;
    }
    if (item.content_type === 'note') {
      if (item.file_url) {
        window.open(item.file_url, '_blank');
      }
      // Automatically track note completion on open
      studentApi.trackResource({ contentId: item.id, completed: true })
        .then(() => refetch())
        .catch(err => console.error('Failed to track note progress:', err));
    } else if (item.content_type === 'video') {
      setActiveVideoContentId(item.id);
      lastProgressRef.current = item.video_progress || 0;
      setVideoId(item.mux_playback_id);
    } else if (item.content_type === 'animation') {
      handleOpenAnimation(item.animation_id);
      // Automatically track animation completion on open
      studentApi.trackResource({ contentId: item.id, completed: true })
        .then(() => refetch())
        .catch(err => console.error('Failed to track animation progress:', err));
    } else if (item.content_type === 'worksheet') {
      logActivity({ activity_type: 'study', content_id: item.id });
      handleOpenWorksheet(item);
    }
  };

  const openAnimInNewTab = (anim) => {
    if (!anim?.html_content) return;
    const blob = new Blob([anim.html_content], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const handleOpenWorksheet = async (content) => {
    const wsWindow = window.open('', '_blank');
    if (wsWindow) {
      wsWindow.document.write('<div style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#0A0E1A;color:#fff;">Loading Worksheet...</div>');
    }
    try {
      const res = await studentApi.getWorksheetUrl(content.id);
      const wsUrl = res.data.url;
      if (wsUrl && wsWindow) {
        window.onWorksheetSubmit = (cid) => {
          studentApi.trackResource({ contentId: cid, completed: true })
            .then(() => refetch())
            .catch(err => console.error('Failed to update worksheet progress:', err));
        };
        openWorksheetInNewTab(wsUrl, content.id, wsWindow);
      } else if (wsWindow) {
        wsWindow.close();
      }
    } catch (e) {
      console.error('Failed to open worksheet:', e);
      if (wsWindow) wsWindow.close();
    }
  };

  const openWorksheetInNewTab = (imageUrl, contentId, wsWindow) => {
    if (!imageUrl) return;
    const PALETTE_COLORS = [
      '#1a1a1a','#EF4444','#F97316','#EAB308',
      '#22C55E','#3B82F6','#8B5CF6','#EC4899','#ffffff',
    ];
    const swatchesHtml = PALETTE_COLORS.map((c, i) =>
      `<button class="swatch${i === 0 ? ' active' : ''}" data-color="${c}" style="background:${c};${c === '#ffffff' ? 'border:2px solid rgba(255,255,255,0.3)' : ''}" title="${c}"></button>`
    ).join('');
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Worksheet</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0E1A; font-family: Inter, sans-serif; color: #F5F0E8; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  #toolbar { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding: 0.55rem 0.85rem; background: rgba(245,158,11,0.05); border-bottom: 1px solid rgba(245,158,11,0.15); flex-shrink: 0; }
  .sep { width: 1px; height: 22px; background: rgba(255,255,255,0.1); margin: 0 0.1rem; }
  button.tool { width: 32px; height: 32px; border-radius: 9px; border: 1px solid transparent; background: rgba(255,255,255,0.04); color: rgba(245,240,232,0.5); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s; }
  button.tool:hover { background: rgba(255,255,255,0.09); color: #F5F0E8; }
  button.tool.active { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.4); color: #FCD34D; }
  button.tool.danger:hover { background: rgba(239,68,68,0.12); color: #F87171; border-color: rgba(239,68,68,0.3); }
  .size-label { font-size: 0.62rem; color: rgba(245,240,232,0.45); font-weight: 600; white-space: nowrap; }
  #sizeRange { -webkit-appearance: none; appearance: none; width: 90px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; cursor: pointer; }
  #sizeRange::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #FCD34D; cursor: pointer; box-shadow: 0 0 6px rgba(252,211,77,0.5); }
  .swatch { width: 22px; height: 22px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: transform 0.15s, border-color 0.15s; flex-shrink: 0; }
  .swatch:hover { transform: scale(1.15); }
  .swatch.active { border-color: #fff; transform: scale(1.1); }
  #canvas-area { flex: 1; overflow: auto; display: flex; justify-content: center; align-items: flex-start; background: #1a1a2e; cursor: crosshair; padding: 2rem 0; }
  #canvas-area.eraser { cursor: cell; }
  #sizer { position: relative; display: inline-block; line-height: 0; }
  #wsImg { display: block; max-width: 85vw; max-height: 85vh; width: auto; height: auto; user-select: none; pointer-events: none; }
  #overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; touch-action: none; }
  #submitted-overlay { display: none; position: absolute; inset: 0; background: rgba(10,14,26,0.82); backdrop-filter: blur(4px); flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; z-index: 10; }
  #submitted-overlay.show { display: flex; }
  .sub-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(16,185,129,0.15); border: 2px solid rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; font-size: 26px; }
  .sub-title { font-size: 1.1rem; font-weight: 700; color: #6EE7B7; }
  .sub-desc { font-size: 0.78rem; color: rgba(245,240,232,0.45); }
  .sub-btns { display: flex; gap: 0.6rem; margin-top: 0.25rem; }
  .sub-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 10px; cursor: pointer; font-size: 0.78rem; font-weight: 700; border: none; transition: transform 0.15s; color: #fff; }
  .sub-btn:hover { transform: translateY(-1px); }
  #submit-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; padding: 0.65rem 0.85rem; background: rgba(16,185,129,0.05); border-top: 1px solid rgba(16,185,129,0.15); flex-shrink: 0; }
  .hint { font-size: 0.72rem; color: rgba(245,240,232,0.45); }
  #submitBtn { display: inline-flex; align-items: center; gap: 0.4rem; background: linear-gradient(135deg,#10B981,#059669); border: 1px solid rgba(16,185,129,0.4); color: #fff; font-size: 0.78rem; font-weight: 700; padding: 0.55rem 1.1rem; border-radius: 10px; cursor: pointer; font-family: inherit; box-shadow: 0 4px 14px rgba(16,185,129,0.3); }
  #submitBtn:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
</head>
<body>
<div id="toolbar">
  <div style="display:flex;align-items:center;gap:0.3rem">
    <button class="tool active" id="btnPen" title="Pen">&#9998;</button>
    <button class="tool" id="btnEraser" title="Eraser">&#9729;</button>
  </div>
  <div class="sep"></div>
  <div style="display:flex;align-items:center;gap:0.5rem">
    <span class="size-label">Size</span>
    <input type="range" id="sizeRange" min="1" max="24" value="3" />
    <span class="size-label" id="sizeVal">3</span>
  </div>
  <div class="sep"></div>
  <div id="swatches" style="display:flex;align-items:center;flex-wrap:wrap;gap:0.28rem">${swatchesHtml}</div>
  <div class="sep"></div>
  <button class="tool danger" id="btnClear" title="Clear">&#8635;</button>
</div>
<div id="canvas-area">
  <div id="sizer">
    <img id="wsImg" src="${imageUrl}" alt="Worksheet" crossorigin="anonymous" />
    <canvas id="overlay"></canvas>
    <div id="submitted-overlay">
      <div class="sub-icon">&#9989;</div>
      <p class="sub-title">Worksheet submitted!</p>
      <p class="sub-desc">Great work. Your drawing is for practice only.</p>
      <div class="sub-btns">
        <button class="sub-btn" id="btnRetry" style="background:linear-gradient(135deg,#7C3AED,#5B21B6)">&#8617; Try again</button>
        <button class="sub-btn" id="btnClose" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12)">&#10005; Close</button>
      </div>
    </div>
  </div>
</div>
<div id="submit-bar">
  <p class="hint">Draw on the worksheet, then click Submit when you're done. Your work is for practice only and won't be saved.</p>
  <button id="submitBtn" disabled>&#10003; Submit</button>
</div>
<script>
  const img = document.getElementById('wsImg');
  const overlay = document.getElementById('overlay');
  const ctx = overlay.getContext('2d');
  const area = document.getElementById('canvas-area');
  const subOver = document.getElementById('submitted-overlay');
  const submitBtn = document.getElementById('submitBtn');
  let tool = 'pen', color = '#1a1a1a', size = 3, drawing = false, last = null;

  function syncCanvas() { overlay.width = img.offsetWidth; overlay.height = img.offsetHeight; }
  img.onload = () => { syncCanvas(); submitBtn.disabled = false; };
  if (img.complete && img.naturalWidth) { syncCanvas(); submitBtn.disabled = false; }
  new ResizeObserver(syncCanvas).observe(img);

  document.getElementById('btnPen').onclick = () => {
    tool = 'pen';
    document.getElementById('btnPen').classList.add('active');
    document.getElementById('btnEraser').classList.remove('active');
    document.getElementById('swatches').style.display = 'flex';
    area.classList.remove('eraser');
  };
  document.getElementById('btnEraser').onclick = () => {
    tool = 'eraser';
    document.getElementById('btnEraser').classList.add('active');
    document.getElementById('btnPen').classList.remove('active');
    document.getElementById('swatches').style.display = 'none';
    area.classList.add('eraser');
  };
  document.getElementById('btnClear').onclick = () => ctx.clearRect(0, 0, overlay.width, overlay.height);

  const sizeRange = document.getElementById('sizeRange');
  sizeRange.oninput = () => { size = +sizeRange.value; document.getElementById('sizeVal').textContent = size; };

  document.querySelectorAll('.swatch').forEach(btn => {
    btn.onclick = () => {
      color = btn.dataset.color;
      document.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });

  function getPos(e) {
    const rect = overlay.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }
  function start(e) { e.preventDefault(); drawing = true; last = getPos(e); }
  function move(e) {
    if (!drawing) return; e.preventDefault();
    const pos = getPos(e);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (tool === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = 'rgba(0,0,0,1)'; }
    else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = color; }
    ctx.stroke(); last = pos;
  }
  function stop() { drawing = false; last = null; }
  overlay.addEventListener('mousedown', start); overlay.addEventListener('mousemove', move);
  overlay.addEventListener('mouseup', stop); overlay.addEventListener('mouseleave', stop);
  overlay.addEventListener('touchstart', start, { passive: false });
  overlay.addEventListener('touchmove', move, { passive: false });
  overlay.addEventListener('touchend', stop);
  submitBtn.onclick = () => {
    subOver.classList.add('show');
    overlay.style.opacity = '0.4';
    try {
      if (window.opener && typeof window.opener.onWorksheetSubmit === 'function') {
        window.opener.onWorksheetSubmit('${contentId}');
      }
    } catch (e) {
      console.error(e);
    }
  };
  document.getElementById('btnRetry').onclick = () => {
    subOver.classList.remove('show'); overlay.style.opacity = '1';
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  };
  document.getElementById('btnClose').onclick = () => window.close();
<\/script>
</body>
</html>`;
    if (!wsWindow) return;
    wsWindow.document.open();
    wsWindow.document.write(html);
    wsWindow.document.close();
  };


  const items = content?.items ?? [];
  const exams = content?.exams ?? [];
  const topicName = content?.topic_name;
  const subjectName = content?.subject_name;

  const groups = [
    { key: 'video',     label: 'Videos',     dot: 'var(--violet-l)',              items: items.filter(i => i.content_type === 'video') },
    { key: 'note',      label: 'Notes',      dot: 'rgba(245,240,232,0.5)',        items: items.filter(i => i.content_type === 'note') },
    { key: 'animation', label: 'Animations', dot: '#6EE7B7',                      items: items.filter(i => i.content_type === 'animation') },
    { key: 'worksheet', label: 'Worksheets', dot: '#FCD34D',                      items: items.filter(i => i.content_type === 'worksheet') },
    { key: 'exam',      label: 'Exams',      dot: '#EF4444',                      items: exams.map(e => ({ ...e, content_type: 'exam' })) },
  ].filter(g => g.items.length > 0);

  const totalItemsCount = items.length + exams.length;

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
          <button className="sp-back-btn" onClick={() => navigate(`/courses/${curriculumId}/subjects/${subjectId}`)}>
            <ArrowLeft size={16} />
          </button>
          <div className="sp-header-text">
            {subjectName && (
              <div className="sp-eyebrow">
                <span className="sp-eyebrow-dot" />
                {subjectName}
              </div>
            )}
            <h1 className="sp-title">{loading ? 'Loading…' : (topicName || 'Topic Resources')}</h1>
            <p className="sp-count">
              {loading ? '' : `${totalItemsCount} item${totalItemsCount !== 1 ? 's' : ''} available`}
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
        ) : totalItemsCount === 0 ? (
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
                        >
                          <div className={clsx('sp-icon-bubble', locked ? 'sp-icon-locked' : cfg.iconCls)}>
                            {locked
                              ? <Lock size={17} style={{ color: '#FCD34D' }} />
                              : <Icon size={19} style={{ color: cfg.color }} />
                            }
                          </div>

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
                              {item.content_type === 'exam' && (
                                <>
                                  <span className={clsx(
                                    'sp-type-badge',
                                    item.status === 'live' && 'sp-badge-video',
                                    item.status === 'scheduled' && 'sp-badge-worksheet',
                                    item.status === 'ended' && 'sp-badge-note'
                                  )}>
                                    {item.status}
                                  </span>
                                  {item.submission_status && (
                                    <span className={clsx(
                                      'sp-type-badge',
                                      item.submission_status === 'submitted' ? 'sp-badge-anim' : 'sp-badge-worksheet'
                                    )}>
                                      {item.submission_status === 'submitted' ? 'Submitted' : 'In Progress'}
                                    </span>
                                  )}
                                  {item.status === 'ended' && !item.submission_status && (
                                    <span className="sp-type-badge sp-badge-note">
                                      Missed
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

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
              <MuxPlayer
                playbackId={videoId}
                streamType="on-demand"
                style={{ width: '100%', height: '100%', display: 'block' }}
                onTimeUpdate={(e) => {
                  const player = e.target;
                  const currentTime = player.currentTime;
                  const duration = player.duration;
                  if (duration > 0) {
                    const percent = Math.round((currentTime / duration) * 100);
                    const isCompleted = percent >= 90;
                    handleVideoProgress(percent, isCompleted);
                  }
                }}
              />
            )}
          </div>
        </Modal>



      </div>
    </PageWrapper>
  );
}

// ─── Worksheet Canvas Component ────────────────────────────────────────────────
function WorksheetCanvas({ imageUrl, contentId, onSubmit, onClose }) {
  const canvasRef    = useRef(null);
  const overlayRef   = useRef(null); // drawing canvas layered on top
  const isDrawing    = useRef(false);
  const lastPos      = useRef(null);

  const [tool, setTool]         = useState('pen');   // 'pen' | 'eraser'
  const [color, setColor]       = useState('#1a1a1a');
  const [size, setSize]         = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Once the image has loaded, size the overlay canvas to match the rendered image
  const handleImageLoad = useCallback(() => {
    const img = canvasRef.current;
    if (!img || !overlayRef.current) return;
    // Use rendered dimensions so drawing coords map 1:1 to visible pixels
    overlayRef.current.width  = img.offsetWidth  || img.naturalWidth;
    overlayRef.current.height = img.offsetHeight || img.naturalHeight;
    setImgLoaded(true);
  }, []);

  // Re-sync canvas size if the container is resized (e.g. modal resize)
  useEffect(() => {
    const img = canvasRef.current;
    if (!img) return;
    const ro = new ResizeObserver(() => {
      if (!overlayRef.current || !imgLoaded) return;
      overlayRef.current.width  = img.offsetWidth;
      overlayRef.current.height = img.offsetHeight;
    });
    ro.observe(img);
    return () => ro.disconnect();
  }, [imgLoaded]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (e) => {
    if (!imgLoaded || submitted) return;
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current   = getPos(e, overlayRef.current);
  };

  const draw = (e) => {
    if (!isDrawing.current || !imgLoaded || submitted) return;
    e.preventDefault();
    const canvas = overlayRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth   = size;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }

    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    isDrawing.current = false;
    lastPos.current   = null;
  };

  const clearCanvas = () => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (onSubmit) {
      onSubmit(contentId);
    }
  };

  const handleRedo = () => {
    setSubmitted(false);
    clearCanvas();
  };

  return (
    <div className="sp-root">
      <style>{CSS}</style>
      <div className="ws-modal-inner">

        {/* ── Toolbar ── */}
        <div className="ws-toolbar">

          {/* Tool: pen / eraser */}
          <div className="ws-toolbar-group">
            <button
              className={clsx('ws-tool-btn', tool === 'pen' && 'active')}
              title="Pen"
              onClick={() => setTool('pen')}
            >
              <Pen size={14} />
            </button>
            <button
              className={clsx('ws-tool-btn', tool === 'eraser' && 'active')}
              title="Eraser"
              onClick={() => setTool('eraser')}
            >
              <Eraser size={14} />
            </button>
          </div>

          <div className="ws-toolbar-sep" />

          {/* Brush size */}
          <div className="ws-toolbar-group ws-size-wrap">
            <span className="ws-size-label">Size</span>
            <input
              type="range"
              min={1}
              max={24}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="ws-size-input"
            />
            <span className="ws-size-label" style={{ minWidth: 18, textAlign: 'right' }}>{size}</span>
          </div>

          <div className="ws-toolbar-sep" />

          {/* Color swatches — hidden when eraser is active */}
          {tool === 'pen' && (
            <div className="ws-toolbar-group" style={{ flexWrap: 'wrap', gap: '0.28rem' }}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  className={clsx('ws-color-swatch', color === c && 'active')}
                  style={{ background: c, border: c === '#ffffff' ? '2px solid rgba(255,255,255,0.3)' : undefined }}
                  title={c}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          )}

          <div className="ws-toolbar-sep" />

          {/* Clear */}
          <button className="ws-tool-btn danger" title="Clear all drawings" onClick={clearCanvas}>
            <RotateCcw size={14} />
          </button>
        </div>

        {/* ── Canvas area ── */}
        <div
          className={clsx('ws-canvas-wrap', tool === 'eraser' && 'eraser-mode')}
        >
          <div className="ws-canvas-sizer">
            {/* The worksheet image */}
            <img
              ref={canvasRef}
              src={imageUrl}
              alt="Worksheet"
              onLoad={handleImageLoad}
              draggable={false}
            />

            {/* Transparent drawing canvas layered on top */}
            <canvas
              ref={overlayRef}
              className="ws-canvas"
              style={{ opacity: submitted ? 0.4 : 1 }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />

            {/* Submitted overlay */}
            {submitted && (
              <div className="ws-submitted-overlay">
                <div className="ws-submitted-icon">
                  <CheckCircle2 size={28} color="#6EE7B7" />
                </div>
                <p className="ws-submitted-title">Worksheet submitted!</p>
                <p className="ws-submitted-sub">Great work. Your drawing isn't saved — this is for practice.</p>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                  <button className="ws-submit-btn" style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }} onClick={handleRedo}>
                    <RotateCcw size={14} /> Try again
                  </button>
                  <button className="ws-submit-btn" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'none' }} onClick={onClose}>
                    <X size={14} /> Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Submit bar ── */}
        {!submitted && (
          <div className="ws-submit-bar">
            <p className="ws-submit-hint">
              Draw on the worksheet, then tap Submit when you're done. Your work is for practice only and won't be saved.
            </p>
            <button className="ws-submit-btn" onClick={handleSubmit} disabled={!imgLoaded}>
              <CheckCircle2 size={14} /> Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}