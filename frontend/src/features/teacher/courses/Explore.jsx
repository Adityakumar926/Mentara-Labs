import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Sparkles, BookOpen, FileText, Video, Image, 
  ExternalLink, Eye, Play, Download, ChevronRight, Award, Lock, Clock, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, EmptyState, Button, Modal } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import MuxPlayer from '@mux/mux-player-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

/* ─── Premium Modern CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

  .ex-root {
    --navy:     var(--local-navy, #0A0E1A);
    --navy2:    var(--local-navy2, #0F1629);
    --violet:   #7C3AED;
    --violet-l: var(--local-violet-l, #9D6FEF);
    --cyan:     var(--local-cyan, #00D4FF);
    --cream:    var(--local-cream, #F5F0E8);
    --lavender: var(--local-lavender, #C4B5FD);
    --green:    #10B981;
    --amber:    #F59E0B;
    --muted:    var(--local-muted, rgba(245,240,232,0.45));
    --card-bg:  var(--local-card-bg, rgba(255,255,255,0.03));
    --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.06));
    font-family: 'Inter', sans-serif;
    color: var(--cream);
    position: relative;
    overflow: hidden;
  }
  .ex-root *, .ex-root *::before, .ex-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .ex-header {
    position: relative;
    background: linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(124,58,237,0.1) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 2rem 2.25rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .ex-header-image {
    width: 230px;
    height: 180px;
    object-fit: contain;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  @media (max-width: 767px) {
    .ex-header-image { display: none; }
  }
  .ex-header-blob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .ex-blob-1 {
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%);
    top: -60px; left: -40px;
  }
  .ex-blob-2 {
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
    bottom: -50px; right: -20px;
  }
  .ex-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2);
    padding: 0.3rem 0.85rem; border-radius: 50px;
    font-size: 0.65rem; font-weight: 700; color: var(--cyan);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.6rem;
  }
  .ex-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.3rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.3rem;
  }
  .ex-subtitle { font-size: 0.8rem; color: var(--muted); }

  /* ── CONTROLS ROW ── */
  .ex-controls {
    display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.75rem;
  }
  @media (min-width: 992px) {
    .ex-controls { flex-direction: row; align-items: center; justify-content: space-between; }
  }

  /* Search & Filter Row */
  .ex-search-row { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; width: 100%; max-width: 600px; }
  .ex-search-wrap { position: relative; flex: 1; min-width: 260px; }
  .ex-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
  .ex-search {
    width: 100%; background: var(--local-card-bg); border: 2px solid var(--local-card-bdr);
    border-radius: 14px; padding: 0.65rem 1rem 0.65rem 2.5rem;
    font-family: 'Inter', sans-serif; font-size: 0.8rem; color: var(--cream); outline: none;
    transition: border-color 0.2s, background 0.2s;
    font-weight: 600;
  }
  .ex-search:focus { border-color: var(--violet); background: var(--color-surface-hover); }

  /* Category Tabs */
  .ex-tabs-bar {
    display: flex; flex-wrap: wrap; gap: 0.35rem; background: var(--local-card-bg);
    border: 2px solid var(--local-card-bdr); border-radius: 16px; padding: 0.3rem; flex-shrink: 0;
  }
  .ex-tab-btn {
    display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1rem; border-radius: 12px;
    font-size: 0.76rem; font-weight: 700; color: var(--muted); border: none; background: transparent;
    cursor: pointer; transition: all 0.2s ease;
  }
  .ex-tab-btn:hover { color: var(--cream); background: var(--color-surface-hover); }
  .ex-tab-btn.active {
    color: #fff;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(124, 58, 237, 0.15));
    border: 1px solid rgba(34, 211, 238, 0.3);
    box-shadow: 0 0 16px rgba(34,211,238,0.25);
  }

  /* ── SUBJECT FILTERS ── */
  .ex-subjects { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; padding-bottom: 0.5rem; }
  .ex-subject-pill {
    padding: 0.4rem 0.9rem; border-radius: 50px; font-size: 0.72rem; font-weight: 700;
    color: var(--muted); background: var(--local-card-bg); border: 2px solid var(--local-card-bdr);
    cursor: pointer; transition: all 0.18s;
  }
  .ex-subject-pill:hover { color: var(--cream); border-color: var(--violet); }
  .ex-subject-pill.active {
    color: #fff;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(16, 185, 129, 0.15));
    border-color: rgba(34, 211, 238, 0.35);
    box-shadow: 0 4px 12px rgba(34,211,238,0.2);
  }

  /* ── SUB-TAB SELECTION FOR MATERIALS ── */
  .ex-materials-filter {
    display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem;
  }
  .ex-mat-btn {
    padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.68rem; font-weight: 700;
    background: var(--local-card-bg); border: 2px solid var(--local-card-bdr);
    color: var(--muted); cursor: pointer; transition: all 0.15s;
  }
  .ex-mat-btn:hover { color: var(--cream); }
  .ex-mat-btn.active {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.08);
    border-color: rgba(34, 211, 238, 0.3);
  }

  /* ── GRID LAYOUTS ── */
  .ex-grid {
    display: grid; grid-template-columns: 1fr; gap: 1.1rem;
  }
  @media (min-width: 640px) { .ex-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .ex-grid { grid-template-columns: repeat(3, 1fr); } }

  /* ── ANIMATION/WIDGET CARD ── */
  .ex-card {
    position: relative;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 1.5rem;
    display: flex; flex-direction: column; gap: 0.75rem;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    overflow: hidden;
    text-decoration: none; color: inherit;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
  }
  .ex-card:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 12px 30px -10px rgba(34, 211, 238, 0.15), 0 4px 30px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }
  .ex-card.dimmed { opacity: 0.65; }

  /* strip by status */
  .ex-card-strip {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    border-radius: 24px 24px 0 0;
  }
  .ex-strip-anim { background: linear-gradient(90deg, var(--green), rgba(16,185,129,0)); }
  .ex-strip-mat  { background: linear-gradient(90deg, var(--cyan), rgba(0,212,255,0)); }
  .ex-strip-exam { background: linear-gradient(90deg, var(--violet-l), transparent); }

  /* glow on hover */
  .ex-card-glow {
    position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none;
    width: 180px; height: 180px; top: -60px; right: -40px; opacity: 0;
    background: radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%);
    transition: opacity 0.4s;
  }
  .ex-card:hover .ex-card-glow { opacity: 1; }

  /* live pulse indicator */
  .ep-live-pulse {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 8px var(--green);
    animation: ep-blink 1.4s ease infinite;
    flex-shrink: 0;
  }
  @keyframes ep-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .ex-card-header { display: flex; align-items: start; justify-content: space-between; gap: 0.5rem; }
  .ex-card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1rem; font-weight: 700; color: var(--cream);
    line-height: 1.35; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  /* status pill */
  .ep-status {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 0.22rem 0.65rem; border-radius: 50px;
    white-space: nowrap; flex-shrink: 0;
  }
  .ep-status-scheduled { background: rgba(0,212,255,0.1);    border: 1px solid rgba(0,212,255,0.25);  color: var(--cyan); }
  .ep-status-live      { background: rgba(16,185,129,0.15);  border: 1px solid rgba(16,185,129,0.3);  color: #34D399; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
  .ep-status-ended     { background: rgba(245,240,232,0.04); border: 1px solid rgba(245,240,232,0.08); color: rgba(245,240,232,0.3); }

  .ex-mat-icon-wrap {
    width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ex-mat-icon-notes { background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.18); color: var(--lavender); }
  .ex-mat-icon-video { background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.18); color: var(--cyan); }
  .ex-mat-icon-worksheet { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.18); color: var(--amber); }

  /* ── Light Mode Overrides ── */
  .light .ex-search {
    background: #FFFFFF;
    border-color: #CBD5E1;
    color: #0F172A;
  }
  .light .ex-search::placeholder {
    color: #94A3B8;
  }
  .light .ex-search:focus {
    border-color: #4F46E5;
    background: #FFFFFF;
  }
  .light .ex-tabs-bar {
    background: #F1F5F9;
    border-color: #CBD5E1;
  }
  .light .ex-tab-btn.active {
    color: #FFFFFF !important;
    background: linear-gradient(135deg, #0891B2 0%, #4F46E5 100%);
    border: 1px solid #4F46E5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  }
  .light .ex-subject-pill {
    background: #FFFFFF;
    border-color: #CBD5E1;
    color: #475569;
  }
  .light .ex-subject-pill:hover {
    color: #0F172A;
    border-color: #4F46E5;
  }
  .light .ex-subject-pill.active {
    color: #FFFFFF !important;
    background: linear-gradient(135deg, #0891B2 0%, #059669 100%);
    border-color: #059669;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
  }
  .light .ex-mat-btn {
    background: #FFFFFF;
    border-color: #CBD5E1;
    color: #475569;
  }
  .light .ex-mat-btn:hover {
    color: #0F172A;
    border-color: #4F46E5;
  }
  .light .ex-mat-btn.active {
    color: #FFFFFF !important;
    background: linear-gradient(135deg, #0891B2 0%, #4F46E5 100%);
    border-color: #4F46E5;
  }
  .light .ex-card {
    background: #F3F4FD;
    border-color: #D2D6FF;
  }
  .light .ex-card:hover {
    border-color: #B2B9FF;
    background: #EBEFFF;
    box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.08);
  }
  .light .ex-card-title {
    color: #0F172A;
  }
  .light .ex-card-foot {
    border-top: 1px solid #D2D6FF !important;
  }
  .light .ex-header {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(124, 58, 237, 0.18) 60%, rgba(248, 250, 252, 0.8) 100%);
    border-color: #D2D6FF;
  }
`;

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('animations'); // 'animations', 'materials', 'exams'
  const [activeSubjectId, setActiveSubjectId] = useState('all');
  const [activeMatType, setActiveMatType] = useState('all'); // 'all', 'notes', 'video', 'worksheet'
  const [activeExamFilter, setActiveExamFilter] = useState('all'); // 'all', 'attempted', 'pending'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveMatType('all');
    setActiveExamFilter('all');
  }, [activeTab]);
  
  // Modals / Actions state
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [activeSimulation, setActiveSimulation] = useState(null);

  // Fetch unified explore contents
  const { data: exploreData, loading, refetch } = useApi(studentApi.getExploreContents);

  const subjects = exploreData?.subjects ?? [];
  const contents = exploreData?.contents ?? [];
  const exams = exploreData?.exams ?? [];

  // Filtered lists
  const filteredSubjects = subjects;
  
  const getFilteredContents = () => {
    return contents.filter(c => {
      // 1. Tab check (animations vs other learning materials)
      if (activeTab === 'animations' && c.content_type !== 'animation') return false;
      if (activeTab === 'materials' && c.content_type === 'animation') return false;

      // 2. Material type sub-filter
      if (activeTab === 'materials' && activeMatType !== 'all') {
        if (activeMatType === 'notes' && c.content_type !== 'note') return false;
        if (activeMatType === 'video' && c.content_type !== 'video') return false;
        if (activeMatType === 'worksheet' && c.content_type !== 'worksheet') return false;
      }

      // 3. Subject filter
      if (activeSubjectId !== 'all' && c.subject_id !== activeSubjectId) return false;

      // 4. Search query filter
      if (searchQuery.trim() && !c.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  };

  const getFilteredExams = () => {
    return exams.filter(e => {
      // Subject filter
      if (activeSubjectId !== 'all' && e.subject_id !== activeSubjectId) return false;

      // Search query filter
      if (searchQuery.trim() && !e.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Attempted filter
      if (activeExamFilter === 'attempted' && e.submission_status !== 'submitted') return false;
      if (activeExamFilter === 'pending' && e.submission_status === 'submitted') return false;

      return true;
    });
  };

  // Launch animation
  const handleOpenAnimation = async (content) => {
    if (content.is_premium && !isUserPremium) return;
    
    // Synchronously open a new tab in the click event tick to bypass popup blockers
    const animWindow = window.open('', '_blank');
    if (animWindow) {
      animWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Loading 3D Simulation...</title></head>
          <body style="margin:0;background:#0A0E1A;color:#00D4FF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:1rem;">
            <div style="width:42px;height:42px;border:4px solid rgba(0,212,255,0.2);border-top-color:#00D4FF;border-radius:50%;animation:spin 0.9s linear infinite;"></div>
            <div style="font-weight:700;font-size:1.1rem;letter-spacing:0.02em;">Loading Interactive 3D Simulation...</div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
          </body>
        </html>
      `);
    }

    setLoadingActionId(content.id);
    try {
      const res = await studentApi.getAnimation(content.animation_id);
      const anim = res.data?.data ?? res.data ?? res;
      if (anim?.html_content && animWindow) {
        animWindow.document.open();
        animWindow.document.write(anim.html_content);
        animWindow.document.close();
        toast.success('Simulation ready!');
      } else {
        if (animWindow) animWindow.close();
        toast.error('No content found for this simulation.');
      }
      // Track completion
      await studentApi.trackResource({ contentId: content.id, completed: true });
      refetch();
    } catch (e) {
      if (animWindow) animWindow.close();
      toast.error('Failed to open simulation.');
    } finally {
      setLoadingActionId(null);
    }
  };

  // Open note PDF directly
  const handleOpenNote = async (content) => {
    if (content.is_premium && !isUserPremium) return;
    if (content.file_url) {
      window.open(content.file_url, '_blank');
    }
    setLoadingActionId(content.id);
    try {
      await studentApi.trackResource({ contentId: content.id, completed: true });
      refetch();
    } catch (e) {
      console.error('Failed to track note progress:', e);
    } finally {
      setLoadingActionId(null);
    }
  };

  // Open Worksheet canvas sandbox in a new popup window
  const handleOpenWorksheet = async (content) => {
    if (content.is_premium && !isUserPremium) return;

    const wsWindow = window.open('', '_blank', 'width=980,height=750,resizable=yes,scrollbars=yes');
    if (wsWindow) {
      wsWindow.document.write('<div style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#0A0E1A;color:#fff;">Loading Worksheet...</div>');
    }

    setLoadingActionId(content.id);
    try {
      let wsUrl = content.file_url;
      if (!wsUrl) {
        const res = await studentApi.getWorksheetUrl(content.id);
        wsUrl = res.data.url;
      }
      
      if (wsUrl && wsWindow) {
        // Setup window callback
        window.onWorksheetSubmit = (cid) => {
          studentApi.trackResource({ contentId: cid, completed: true })
            .then(() => refetch())
            .catch(err => console.error('Failed to update worksheet progress:', err));
        };
        openWorksheetInWindow(wsWindow, wsUrl, content.id);
      } else if (wsWindow) {
        wsWindow.close();
      }
    } catch (e) {
      console.error('Failed to open worksheet:', e);
      if (wsWindow) wsWindow.close();
    } finally {
      setLoadingActionId(null);
    }
  };

  const openWorksheetInWindow = (win, imageUrl, contentId) => {
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
    area.className = '';
  };
  document.getElementById('btnEraser').onclick = () => {
    tool = 'eraser';
    document.getElementById('btnEraser').classList.add('active');
    document.getElementById('btnPen').classList.remove('active');
    document.getElementById('swatches').style.display = 'none';
    area.className = 'eraser';
  };
  document.getElementById('sizeRange').oninput = (e) => {
    size = parseInt(e.target.value);
    document.getElementById('sizeVal').innerText = size;
  };
  document.getElementById('btnClear').onclick = () => {
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  };

  // Swatches
  document.querySelectorAll('.swatch').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      color = btn.getAttribute('data-color');
    };
  });

  // Draw logic
  function getPos(e) {
    const rect = overlay.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * overlay.width,
      y: ((clientY - rect.top) / rect.height) * overlay.height
    };
  }

  function start(pos) { drawing = true; last = pos; }
  function draw(pos) {
    if (!drawing) return;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size * 2.5;
    }
    ctx.stroke();
    last = pos;
  }
  function stop() { drawing = false; last = null; }

  overlay.addEventListener('mousedown', (e) => start(getPos(e)));
  overlay.addEventListener('mousemove', (e) => draw(getPos(e)));
  overlay.addEventListener('mouseup', stop);
  overlay.addEventListener('mouseleave', stop);

  overlay.addEventListener('touchstart', (e) => { e.preventDefault(); start(getPos(e)); });
  overlay.addEventListener('touchmove', (e) => { e.preventDefault(); draw(getPos(e)); });
  overlay.addEventListener('touchend', stop);

  // Submit
  submitBtn.onclick = () => {
    subOver.classList.add('show');
    if (window.opener && typeof window.opener.onWorksheetSubmit === 'function') {
      window.opener.onWorksheetSubmit('${contentId}');
    }
  };
  document.getElementById('btnRetry').onclick = () => {
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    subOver.classList.remove('show');
  };
  document.getElementById('btnClose').onclick = () => {
    window.close();
  };
</script>
</body>
</html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  // Open video modal player
  const handleOpenVideo = async (content) => {
    if (content.is_premium && !isUserPremium) return;
    setLoadingActionId(content.id);
    try {
      const res = await studentApi.getVideoToken(content.id);
      if (content.mux_playback_id) {
        setSelectedVideoUrl(content.mux_playback_id);
      }
      await studentApi.trackResource({ contentId: content.id, completed: true });
      refetch();
    } catch (e) {
      console.error('Failed to fetch video details:', e);
    } finally {
      setLoadingActionId(null);
    }
  };

  const activeContents = getFilteredContents();
  const activeExams = getFilteredExams();

  const isUserPremium = user?.is_premium;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="ex-root">
        
        {/* Ambient background blur blobs */}
        <div className="ex-header-blob ex-blob-1" />
        <div className="ex-header-blob ex-blob-2" />

        {/* ── HEADER ── */}
        <motion.div 
          className="ex-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <div className="ex-eyebrow">
              <span className="ex-eyebrow-dot" />
              Resource Central
            </div>
            <h1 className="ex-title">Explore Content</h1>
            <p className="ex-subtitle">Discover interactive widgets, study materials, and practice exams designed for your curriculum.</p>
          </div>
          <img src="/explore.png?v=2" alt="" className="ex-header-image" />
        </motion.div>

        {/* ── CONTROLS ROW ── */}
        <div className="ex-controls">
          {/* Left search */}
          <div className="ex-search-row">
            <div className="ex-search-wrap">
              <Search size={15} className="ex-search-icon" />
              <input
                type="text"
                className="ex-search"
                placeholder={`Search ${activeTab === 'animations' ? 'animations' : activeTab === 'materials' ? 'materials' : 'exams'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right tab selector */}
          <div className="ex-tabs-bar">
            <button 
              className={clsx('ex-tab-btn', activeTab === 'animations' && 'active')}
              onClick={() => { setActiveTab('animations'); setSearchQuery(''); }}
            >
              <Sparkles size={13} />
              Animations
            </button>
            <button 
              className={clsx('ex-tab-btn', activeTab === 'materials' && 'active')}
              onClick={() => { setActiveTab('materials'); setSearchQuery(''); }}
            >
              <BookOpen size={13} />
              Materials
            </button>
            <button 
              className={clsx('ex-tab-btn', activeTab === 'exams' && 'active')}
              onClick={() => { setActiveTab('exams'); setSearchQuery(''); }}
            >
              <FileText size={13} />
              Exams
            </button>
          </div>
        </div>

        {/* ── SUBJECT PILL FILTERS ── */}
        <div className="ex-subjects">
          <button 
            className={clsx('ex-subject-pill', activeSubjectId === 'all' && 'active')}
            onClick={() => setActiveSubjectId('all')}
          >
            All Subjects
          </button>
          {filteredSubjects.map(sub => (
            <button
              key={sub.id}
              className={clsx('ex-subject-pill', activeSubjectId === sub.id && 'active')}
              onClick={() => setActiveSubjectId(sub.id)}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* ── TAB DETAILS ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ex-grid"
            >
              {[1, 2, 3].map(n => (
                <div key={n} className="ex-card" style={{ height: 180, background: 'rgba(255,255,255,0.015)' }}>
                  <div style={{ width: '40%', height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                  <div style={{ width: '80%', height: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 4, marginTop: 12 }} />
                  <div style={{ width: '100%', height: 36, background: 'rgba(255,255,255,0.02)', borderRadius: 10, marginTop: 'auto' }} />
                </div>
              ))}
            </motion.div>
          ) : activeTab === 'animations' ? (
            /* ──────────────── ANIMATIONS GRID ──────────────── */
            <motion.div
              key="animations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeContents.length === 0 ? (
                <EmptyState icon={Sparkles} title="No Animations Found" description="Try selecting a different subject or typing another keyword." />
              ) : (
                <div className="ex-grid">
                  {activeContents.map(c => {
                    const locked = c.is_premium && !isUserPremium;
                    return (
                      <div 
                        key={c.id} 
                        className={clsx('ex-card', locked && 'dimmed')}
                        onClick={locked || loadingActionId === c.id ? undefined : () => handleLaunchAnimation(c)}
                      >
                        <div className="ex-card-strip ex-strip-anim" />
                        <div className="ex-card-glow" />

                        <div className="ex-card-header">
                          <span className="ex-card-title">{c.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {locked && (
                              <span className="ep-status" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)', color: 'var(--amber)' }}><Lock size={10} />Locked</span>
                            )}
                          </div>
                        </div>

                        {(c.subject_name || c.topic_name) && (
                          <div className="ex-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--local-violet-l)', fontWeight: 600 }}>
                            <span>
                              {c.subject_name}
                              {c.topic_name && ` • ${c.topic_name}`}
                            </span>
                          </div>
                        )}

                        <div className="ex-card-foot" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 'auto', fontSize: '0.72rem', color: 'var(--muted)' }}>
                          <span>Widget Demo</span>
                          {locked ? (
                            <span className="exam-locked-btn" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--amber)', padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}><Lock size={11} />Premium</span>
                          ) : (
                            <span className="exam-attempt-btn" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34, 211, 238, 0.2)', color: '#22d3ee', padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {loadingActionId === c.id ? 'Loading' : 'Launch'}
                              <ExternalLink size={11} style={{ marginLeft: 2 }} />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'materials' ? (
            /* ──────────────── MATERIALS LIST ──────────────── */
            <motion.div
              key="materials"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Secondary filter bar for materials */}
              <div className="ex-materials-filter">
                <button className={clsx('ex-mat-btn', activeMatType === 'all' && 'active')} onClick={() => setActiveMatType('all')}>All Types</button>
                <button className={clsx('ex-mat-btn', activeMatType === 'notes' && 'active')} onClick={() => setActiveMatType('notes')}>Notes</button>
                <button className={clsx('ex-mat-btn', activeMatType === 'video' && 'active')} onClick={() => setActiveMatType('video')}>Videos</button>
                <button className={clsx('ex-mat-btn', activeMatType === 'worksheet' && 'active')} onClick={() => setActiveMatType('worksheet')}>Worksheets</button>
              </div>

              {activeContents.length === 0 ? (
                <EmptyState icon={BookOpen} title="No Materials Found" description="Try selecting a different subject or type filter." />
              ) : (
                <div className="ex-grid">
                  {activeContents.map(c => {
                    const locked = c.is_premium && !isUserPremium;
                    const isNotes = c.content_type === 'note' || c.content_type === 'notes';
                    const isVideo = c.content_type === 'video';
                    const isWorksheet = c.content_type === 'worksheet';
                    
                    let icon = BookOpen;
                    let iconCls = 'ex-mat-icon-notes';
                    let actionIcon = Download;
                    let handler = () => handleOpenNote(c);
                    
                    if (isVideo) {
                       icon = Video;
                       iconCls = 'ex-mat-icon-video';
                       actionIcon = Play;
                       handler = () => handleOpenVideo(c);
                    } else if (isWorksheet) {
                       icon = Image;
                       iconCls = 'ex-mat-icon-worksheet';
                       actionIcon = Eye;
                       handler = () => handleOpenWorksheet(c);
                    }

                    const IconComp = icon;
                    const ActionIconComp = actionIcon;

                    return (
                      <div 
                        key={c.id} 
                        className={clsx('ex-card', locked && 'dimmed')}
                        onClick={locked || loadingActionId === c.id ? undefined : handler}
                      >
                        <div className="ex-card-strip ex-strip-mat" />
                        <div className="ex-card-glow" />

                        <div className="ex-card-header">
                          <span className="ex-card-title">{c.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {locked ? (
                              <span className="ep-status" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)', color: 'var(--amber)' }}><Lock size={10} />Locked</span>
                            ) : (
                              <span className={clsx('ex-mat-icon-wrap', iconCls)} style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconComp size={12} />
                              </span>
                            )}
                          </div>
                        </div>

                        {(c.subject_name || c.topic_name) && (
                          <div className="ex-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--local-violet-l)', fontWeight: 600 }}>
                            <span>
                              {c.subject_name}
                              {c.topic_name && ` • ${c.topic_name}`}
                            </span>
                          </div>
                        )}

                        <div className="ex-card-foot" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 'auto', fontSize: '0.72rem', color: 'var(--muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isNotes && 'Document'}
                            {isVideo && 'Video Lecture'}
                            {isWorksheet && 'Worksheet'}
                          </span>
                          {locked ? (
                            <span className="exam-locked-btn" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--amber)', padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}><Lock size={11} />Premium</span>
                          ) : (
                            <span className="exam-attempt-btn" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34, 211, 238, 0.2)', color: '#22d3ee', padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <ActionIconComp size={11} />
                              {isNotes && 'Open'}
                              {isVideo && 'Play'}
                              {isWorksheet && 'View'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            /* ──────────────── EXAMS GRID ──────────────── */
            <motion.div
              key="exams"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Secondary filter bar for exams */}
              <div className="ex-materials-filter">
                <button className={clsx('ex-mat-btn', activeExamFilter === 'all' && 'active')} onClick={() => setActiveExamFilter('all')}>All Exams</button>
                <button className={clsx('ex-mat-btn', activeExamFilter === 'attempted' && 'active')} onClick={() => setActiveExamFilter('attempted')}>Attempted</button>
                <button className={clsx('ex-mat-btn', activeExamFilter === 'pending' && 'active')} onClick={() => setActiveExamFilter('pending')}>Pending</button>
              </div>

              {activeExams.length === 0 ? (
                <EmptyState icon={FileText} title="No Practice Exams Found" description="Try selecting a different subject or typing another keyword." />
              ) : (
                <div className="ex-grid">
                  {activeExams.map(exam => {
                    const isLive = exam.status === 'live';
                    const attempted = exam.submission_status === 'submitted';
                    const locked = exam.is_premium && !isUserPremium;

                    return (
                      <div key={exam.id} className={clsx('ex-card', locked && 'dimmed')} onClick={locked ? undefined : () => navigate(`/exams/${exam.id}/take`)}>
                        <div className="ex-card-strip ex-strip-exam" />
                        <div className="ex-card-glow" />

                        <div className="ex-card-header">
                          <span className="ex-card-title">{exam.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {locked ? (
                              <span className="ep-status ep-status-scheduled" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)', color: 'var(--amber)' }}><Lock size={10} />Locked</span>
                            ) : (
                              <span className={clsx('ep-status', isLive ? 'ep-status-live' : 'ep-status-scheduled')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {isLive && <span className="ep-live-pulse" />}
                                {isLive ? 'LIVE' : 'Scheduled'}
                              </span>
                            )}
                          </div>
                        </div>

                        {(exam.subject_name || exam.topic_name) && (
                          <div className="ex-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--local-violet-l)', fontWeight: 600 }}>
                            <span>
                              {exam.subject_name}
                              {exam.topic_name && ` • ${exam.topic_name}`}
                            </span>
                          </div>
                        )}

                        <div className="ex-card-foot" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 'auto', fontSize: '0.72rem', color: 'var(--muted)' }}>
                          <span><Clock size={11} style={{ color: 'var(--cyan)' }} />{exam.duration_minutes}m</span>
                          <span><Award size={11} style={{ color: 'var(--local-violet-l)' }} />{exam.total_marks} Marks</span>
                          {attempted && (
                            <span style={{ color: 'var(--local-green)' }}><CheckCircle size={11} />Attempted</span>
                          )}
                          {locked ? (
                            <span className="exam-locked-btn" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--amber)', padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}><Lock size={11} />Premium</span>
                          ) : isLive ? (
                            <span className="exam-attempt-btn" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34, 211, 238, 0.2)', color: '#22d3ee', padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <Play size={11} />
                              {attempted ? 'Retake' : 'Start'}
                            </span>
                          ) : (
                            <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)' }}>Pending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MUX VIDEO PLAYER MODAL ── */}
        <Modal 
          open={!!selectedVideoUrl} 
          onClose={() => setSelectedVideoUrl(null)} 
          title="Video Playback" 
          size="xl"
        >
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
            {selectedVideoUrl && (
              <MuxPlayer
                playbackId={selectedVideoUrl}
                metadataVideoTitle="Explore Video Material"
                style={{ width: '100%', height: '100%' }}
                autoPlay
              />
            )}
          </div>
        </Modal>

        {/* Modal: Interactive 3D Simulation Player */}
        <Modal open={!!activeSimulation} onClose={() => setActiveSimulation(null)} title={activeSimulation?.title || 'Interactive 3D Simulation'} size="lg">
          <div style={{ height: '75vh', width: '100%', borderRadius: '14px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.08)' }}>
            {activeSimulation && (
              <iframe
                srcDoc={activeSimulation.html_content}
                title={activeSimulation.title || 'Interactive 3D Simulation'}
                style={{ border: 'none', width: '100%', height: '100%' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
          </div>
        </Modal>

      </div>
    </PageWrapper>
  );
}
