import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronRight, Play, Eye, FileText, Sparkles, Image,
  Activity, GraduationCap, Video, CheckCircle, ArrowLeft, Clock
} from 'lucide-react';
import { PageWrapper, Skeleton, Modal } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import MuxPlayer from '@mux/mux-player-react';
import toast from 'react-hot-toast';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Outfit:wght@500;600;700&display=swap');

  .sd-root {
    --navy:     #080b11;
    --navy2:    #0f1420;
    --violet:   #8b5cf6;
    --violet-l: #a78bfa;
    --cyan:     #06b6d4;
    --cream:    #f4f4f5;
    --muted:    #94a3b8;
    --card-bg:  rgba(255, 255, 255, 0.035);
    --card-bdr: rgba(255, 255, 255, 0.08);
    font-family: 'Quicksand', sans-serif;
    color: var(--cream);
  }

  html.light .sd-root {
    --navy:     #f8fafc;
    --navy2:    #ffffff;
    --violet:   #6d28d9;
    --violet-l: #8b5cf6;
    --cyan:     #0891b2;
    --cream:    #0f172a;
    --muted:    #475569;
    --card-bg:  #f1f5f9;
    --card-bdr: #e2e8f0;
  }

  .sd-welcome-card {
    position: relative;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%);
    border: 2px solid rgba(139, 92, 246, 0.2);
    border-radius: 28px;
    padding: 2.5rem;
    overflow: hidden;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.1);
  }

  .sd-grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .sd-subject-card {
    background: var(--navy2);
    border: 2px solid var(--card-bdr);
    border-radius: 24px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    gap: 1.25rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }

  .sd-subject-card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 12px 30px rgba(139, 92, 246, 0.15);
  }

  .sd-subject-card.active {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
    box-shadow: 0 12px 30px rgba(139, 92, 246, 0.25);
  }

  .sd-subject-icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: transform 0.3s ease;
  }

  .sd-subject-card:hover .sd-subject-icon {
    transform: rotate(10deg) scale(1.1);
  }

  .sd-dashboard-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 1.75rem;
    align-items: start;
  }

  @media (max-width: 960px) {
    .sd-dashboard-layout {
      grid-template-columns: 1fr;
    }
  }

  .sd-topic-item {
    background: var(--card-bg);
    border: 2px solid var(--card-bdr);
    border-radius: 18px;
    padding: 1.15rem 1.35rem;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .sd-topic-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--violet);
    transform: scale(1.01);
  }

  .sd-topic-item.active {
    border-color: var(--violet);
    background: linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, transparent 100%);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1);
  }

  .sd-tabs-bar {
    display: flex;
    gap: 0.75rem;
    border-bottom: 2px solid var(--card-bdr);
    padding-bottom: 1rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    scrollbar-width: none;
  }
  
  .sd-tabs-bar::-webkit-scrollbar {
    display: none;
  }

  .sd-tab-btn {
    padding: 0.65rem 1.25rem;
    border-radius: 16px;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--muted);
    background: rgba(255, 255, 255, 0.02);
    border: 2px solid var(--card-bdr);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    white-space: nowrap;
  }

  .sd-tab-btn:hover {
    color: var(--cream);
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }

  .sd-tab-btn.active {
    color: #fff;
    background: linear-gradient(135deg, var(--violet) 0%, var(--violet-l) 100%);
    border-color: var(--violet);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
    transform: translateY(-2px) scale(1.03);
  }

  .sd-resource-card {
    background: var(--navy2);
    border: 2px solid var(--card-bdr);
    border-radius: 22px;
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.25s ease;
    margin-bottom: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .sd-resource-card:hover {
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.1);
  }

  .sd-res-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.3rem;
  }

  .sd-res-btn {
    background: linear-gradient(135deg, var(--violet) 0%, var(--violet-l) 100%);
    border: none;
    padding: 0.65rem 1.25rem;
    border-radius: 14px;
    font-size: 0.85rem;
    font-weight: 700;
    color: #ffffff;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  }

  .sd-res-btn:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.35);
  }
`;


const getSubjectStyle = (name) => {
  const n = name.toLowerCase();
  if (n.includes('science')) {
    return {
      iconBg: 'rgba(16, 185, 129, 0.15)',
      color: '#10B981',
      avatar: '🧪',
    };
  }
  if (n.includes('math') || n.includes('arithmetic')) {
    return {
      iconBg: 'rgba(245, 158, 11, 0.15)',
      color: '#F59E0B',
      avatar: '🧮',
    };
  }
  return {
    iconBg: 'rgba(139, 92, 246, 0.15)',
    color: '#A78BFA',
    avatar: '📚',
  };
};

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('exams'); // 'exams', 'worksheets', 'simulators', 'notes'

  // Modal view states
  const [pdfUrl, setPdfUrl] = useState(null);
  const [videoToken, setVideoToken] = useState(null);
  const [selectedVideoContent, setSelectedVideoContent] = useState(null);

  // Fetch subjects for this curriculum
  const { data: subjectsRes, loading: loadingSubjects } = useApi(
    () => studentApi.getCurriculumSubjects(user.curriculum_id),
    null,
    [user.curriculum_id]
  );
  const subjects = subjectsRes?.data ?? subjectsRes ?? [];

  // Fetch topics for the selected subject
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setSelectedTopic(null);
      return;
    }
    setLoadingTopics(true);
    studentApi.getSubjectTopics(selectedSubject.id)
      .then(res => {
        const list = res.data?.data ?? res.data ?? res ?? [];
        // Filter parent topics only (parent_topic_id is null)
        const roots = list.filter(t => !t.parent_topic_id);
        setTopics(roots);
        if (roots[0]) setSelectedTopic(roots[0]);
        setLoadingTopics(false);
      })
      .catch(() => {
        toast.error('Failed to load topics');
        setLoadingTopics(false);
      });
  }, [selectedSubject]);

  // Fetch learning materials for selected topic
  const [topicContent, setTopicContent] = useState(null);
  const [loadingContents, setLoadingContents] = useState(false);

  useEffect(() => {
    if (!selectedTopic) {
      setTopicContent(null);
      return;
    }
    setLoadingContents(true);
    studentApi.getTopicContent(selectedTopic.id)
      .then(res => {
        const data = res.data?.data ?? res.data ?? res;
        setTopicContent(data);
        setLoadingContents(false);
      })
      .catch(() => {
        toast.error('Failed to load learning resources');
        setLoadingContents(false);
      });
  }, [selectedTopic]);

  const items = topicContent?.items ?? [];
  const exams = topicContent?.exams ?? [];

  const handleOpenNote = async (content) => {
    const toastId = toast.loading('Loading study note...');
    try {
      const res = await studentApi.getNoteUrl(content.id);
      const url = res.data?.data ?? res.data ?? res;
      setPdfUrl(url);
      toast.success('Note loaded!', { id: toastId });
    } catch (e) {
      toast.error('Failed to view note', { id: toastId });
    }
  };

  const handleOpenVideo = async (content) => {
    const toastId = toast.loading('Preparing video player...');
    try {
      const res = await studentApi.getVideoToken(content.id);
      const token = res.data?.data ?? res.data ?? res;
      setVideoToken(token);
      setSelectedVideoContent(content);
      toast.success('Video loaded!', { id: toastId });
    } catch (e) {
      toast.error('Failed to fetch video', { id: toastId });
    }
  };

  const handleOpenAnimation = async (content) => {
    if (!content.animation_id) {
      toast.error('Simulation ID is missing.');
      return;
    }
    const toastId = toast.loading('Loading simulator...');
    try {
      const res = await studentApi.getAnimation(content.animation_id);
      const anim = res.data?.data ?? res.data ?? res;
      if (anim?.html_content) {
        const blob = new Blob([anim.html_content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const animWindow = window.open(url, '_blank');
        if (!animWindow) {
          toast.error('Popup blocker active. Please allow popups for this site.', { id: toastId });
        } else {
          toast.success('Simulation ready!', { id: toastId });
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
        }
      } else {
        toast.error('No simulator contents found.', { id: toastId });
      }
    } catch (e) {
      toast.error('Failed to open simulation', { id: toastId });
    }
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
            .then(() => {
              if (selectedTopic) {
                studentApi.getTopicContent(selectedTopic.id)
                  .then(r => setTopicContent(r.data?.data ?? r.data ?? r));
              }
            })
            .catch(err => console.error('Failed to update worksheet progress:', err));
        };
        openWorksheetInNewTab(wsUrl, content.id, wsWindow);
      } else if (wsWindow) {
        wsWindow.close();
      }
    } catch (e) {
      console.error('Failed to open worksheet:', e);
      toast.error('Failed to open worksheet: ' + (e.response?.data?.message || e.message));
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
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('dragstart', e => e.preventDefault());
</script>
</body>
</html>`;
    if (!wsWindow) return;
    wsWindow.document.open();
    wsWindow.document.write(html);
    wsWindow.document.close();
  };

  // Group content types
  const notesAndVideos = items.filter(c => c.content_type === 'note' || c.content_type === 'video');
  const simulators = items.filter(c => c.content_type === 'animation');
  const worksheets = items.filter(c => c.content_type === 'worksheet');

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="sd-root">
        
        {/* Welcome Header */}
        <div className="sd-welcome-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.3)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                🏆 Primary Learning Quest
              </div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Hello, {user?.full_name?.split(' ')[0] || 'Learner'}! 👋
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '0.5rem', margin: 0, fontWeight: 500 }}>
                Ready for a learning adventure? Select a subject below to explore interactive simulations, coloring sheets, mock checkpoints, and more! 🚀⭐
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(255, 255, 255, 0.04)', border: '2px solid var(--card-bdr)', padding: '0.85rem 1.5rem', borderRadius: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <div className="text-2xl">🎓</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700 }}>Curriculum</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--cyan)' }}>Cambridge Primary</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects List Grid */}
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Select a Subject 🚀</h2>
        {loadingSubjects ? (
          <div className="sd-grid-3">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} style={{ height: 90, borderRadius: 24 }} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No subjects allocated yet.</div>
        ) : (
          <div className="sd-grid-3">
            {subjects.map((sub) => {
              const isActive = selectedSubject?.id === sub.id;
              const style = getSubjectStyle(sub.name);
              return (
                <div
                  key={sub.id}
                  className={`sd-subject-card ${isActive ? 'active' : ''}`}
                  style={{
                    borderColor: isActive ? 'var(--cyan)' : 'var(--card-bdr)',
                    background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(124, 58, 237, 0.06) 100%)' : 'var(--card-bg)'
                  }}
                  onClick={() => setSelectedSubject(isActive ? null : sub)}
                >
                  <div 
                    className="sd-subject-icon shadow-inner"
                    style={{
                      background: style.iconBg,
                      color: style.color,
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    {style.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{sub.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem', margin: 0 }}>
                      {sub.description || 'Access worksheets and lessons'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Subject Split view */}
        <AnimatePresence mode="wait">
          {selectedSubject && (
            <motion.div
              className="sd-dashboard-layout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Sidebar: Topics */}
              <div style={{ background: 'var(--navy2)', border: '2px solid var(--card-bdr)', borderRadius: '24px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <Activity size={18} style={{ color: 'var(--violet-l)' }} />
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    Adventure Topics 🎯
                  </h3>
                </div>

                {loadingTopics ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} style={{ height: 45, borderRadius: 18 }} />
                    ))}
                  </div>
                ) : topics.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem 0' }}>No topics found under this subject.</p>
                ) : (
                  <div>
                    {topics.map((t) => {
                      const isAct = selectedTopic?.id === t.id;
                      return (
                        <div
                          key={t.id}
                          className={`sd-topic-item ${isAct ? 'active' : ''}`}
                          onClick={() => setSelectedTopic(t)}
                        >
                          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{t.name}</span>
                          <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Main Contents Panel */}
              <div style={{ background: 'var(--navy2)', border: '2px solid var(--card-bdr)', borderRadius: '24px', padding: '1.75rem' }}>
                {selectedTopic ? (
                  <>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      {selectedTopic.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                      {selectedTopic.description || 'Coloring worksheets, interactive game simulations & challenge mock check points.'}
                    </p>

                    {/* Tab Navigation */}
                    <div className="sd-tabs-bar">
                      {[
                        { id: 'exams', label: '🏆 Mock Quests', count: exams.length },
                        { id: 'worksheets', label: '🎨 Coloring Sheets', count: worksheets.length },
                        { id: 'simulators', label: '🎮 Play Simulators', count: simulators.length },
                        { id: 'notes', label: '📖 Study Adventure', count: notesAndVideos.length }
                      ].map((t) => (
                        <button
                          key={t.id}
                          className={`sd-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                          onClick={() => setActiveTab(t.id)}
                        >
                          {t.label} <span style={{ marginLeft: 4, opacity: 0.6 }}>({t.count})</span>
                        </button>
                      ))}
                    </div>

                    {/* Tab Panels */}
                    {loadingContents ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Array(3).fill(0).map((_, i) => (
                          <Skeleton key={i} style={{ height: 60, borderRadius: 22 }} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ minHeight: '200px' }}>
                        {activeTab === 'notes' && (
                          notesAndVideos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No study guides or lessons available yet.</div>
                          ) : (
                            notesAndVideos.map((c) => (
                              <div key={c.id} className="sd-resource-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div className="sd-res-icon-wrapper" style={{ background: c.content_type === 'video' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(6, 182, 212, 0.15)' }}>
                                    {c.content_type === 'video' ? '🎥' : '📖'}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{c.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>
                                      {c.content_type === 'video' ? '🎬 Watch Video Story' : '📘 Read Illustrated Story Book'}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  className="sd-res-btn"
                                  style={{
                                    background: c.content_type === 'video' ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' : 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                                    boxShadow: c.content_type === 'video' ? '0 4px 12px rgba(139, 92, 246, 0.2)' : '0 4px 12px rgba(6, 182, 212, 0.2)'
                                  }}
                                  onClick={() => c.content_type === 'video' ? handleOpenVideo(c) : handleOpenNote(c)}
                                >
                                  {c.content_type === 'video' ? <Play size={13} /> : <Eye size={13} />}
                                  {c.content_type === 'video' ? 'Watch Story' : 'Read Story'}
                                </button>
                              </div>
                            ))
                          )
                        )}

                        {activeTab === 'simulators' && (
                          simulators.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No game simulators available yet.</div>
                          ) : (
                            simulators.map((c) => (
                              <div key={c.id} className="sd-resource-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div className="sd-res-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                                    🎮
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{c.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>🚀 Playful 3D Simulation Game</div>
                                  </div>
                                </div>
                                <button 
                                  className="sd-res-btn" 
                                  style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                                  onClick={() => handleOpenAnimation(c)}
                                >
                                  <Play size={13} /> Play Game
                                </button>
                              </div>
                            ))
                          )
                        )}

                        {activeTab === 'worksheets' && (
                          worksheets.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No worksheets available yet.</div>
                          ) : (
                            worksheets.map((c) => (
                              <div key={c.id} className="sd-resource-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div className="sd-res-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                                    🎨
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{c.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>🖍️ Drawable Coloring Sheet</div>
                                  </div>
                                </div>
                                <button 
                                  className="sd-res-btn" 
                                  style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}
                                  onClick={() => handleOpenWorksheet(c)}
                                >
                                  <Eye size={13} /> Start Sketching
                                </button>
                              </div>
                            ))
                          )
                        )}

                        {activeTab === 'exams' && (
                          exams.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No mock quests found.</div>
                          ) : (
                            exams.map((e) => (
                              <div key={e.id} className="sd-resource-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div className="sd-res-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                                    🏆
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{e.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>⏱️ {e.duration_minutes} Mins Challenge Quest</div>
                                  </div>
                                </div>
                                <button
                                  className="sd-res-btn"
                                  style={{ background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
                                  onClick={() => window.open(`/exams/${e.id}/take`, '_blank')}
                                >
                                  <CheckCircle size={13} /> Start Quest
                                </button>
                              </div>
                            ))
                          )
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)', fontWeight: 600 }}>
                    Please select a topic from the sidebar.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: PDF Viewer */}
        <Modal open={!!pdfUrl} onClose={() => setPdfUrl(null)} title="Note Viewer" size="lg">
          <div style={{ height: '70vh', width: '100%' }}>
            {pdfUrl && <iframe src={pdfUrl} title="Note PDF" style={{ border: 'none', width: '100%', height: '100%' }} />}
          </div>
        </Modal>

        {/* Modal: Mux Video Player */}
        <Modal open={!!videoToken} onClose={() => setVideoToken(null)} title={selectedVideoContent?.title || 'Video Lesson'} size="md">
          <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '12px', background: '#000' }}>
            {videoToken && (
              <MuxPlayer
                playbackId={videoToken}
                metadataVideoTitle={selectedVideoContent?.title}
                primaryColor="#7C3AED"
                accentColor="#00D4FF"
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </div>
        </Modal>

      </div>
    </PageWrapper>
  );
}
