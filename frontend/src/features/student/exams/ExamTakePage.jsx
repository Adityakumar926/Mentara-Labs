import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, Maximize2, Minimize2, Paintbrush, Slash, Eraser, Undo2, Redo2, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Modal } from '@/components/ui';
import { studentApi } from '@/api/services';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

  .take-root {
    --navy:     #0A0E1A;
    --navy2:    #0F1629;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --red:      #EF4444;
    --amber:    #F59E0B;
    --card-bg:  rgba(255,255,255,0.04);
    --card-bdr: rgba(255,255,255,0.08);
    --muted:    rgba(245,240,232,0.45);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
    min-height: 100vh;
    background: var(--navy);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .take-root *, .take-root *::before, .take-root *::after { box-sizing: border-box; }

  /* ── TOP BAR ── */
  .take-topbar {
    position: sticky; top: 0; z-index: 30;
    padding: 0.9rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    background: rgba(10,14,26,0.92);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  /* ── PROGRESS BAR ── */
  .take-progress-track {
    height: 5px;
    background: rgba(255,255,255,0.07);
    border-radius: 99px;
    overflow: hidden;
    width: 120px;
  }
  .take-progress-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--violet), var(--cyan));
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  .take-progress-label {
    font-size: 0.75rem; font-weight: 600;
    color: var(--muted);
    white-space: nowrap;
    font-family: 'Space Grotesk', sans-serif;
  }

  /* ── TIMER ── */
  .take-timer {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.45rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    font-family: 'JetBrains Mono', 'Space Grotesk', monospace;
    font-size: 0.92rem; font-weight: 600;
    transition: all 0.3s;
  }
  .take-timer.urgent {
    border-color: rgba(239,68,68,0.4);
    background: rgba(239,68,68,0.08);
    color: var(--red);
    box-shadow: 0 0 20px rgba(239,68,68,0.15);
    animation: timer-pulse 1s ease-in-out infinite;
  }
  @keyframes timer-pulse { 0%,100%{opacity:1} 50%{opacity:0.75} }

  /* ── SUBMIT BUTTON ── */
  .take-submit-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    color: #fff;
    border: none; border-radius: 12px;
    padding: 0.5rem 1.2rem;
    font-size: 0.82rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    box-shadow: 0 0 24px rgba(124,58,237,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.02em;
  }
  .take-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 0 36px rgba(124,58,237,0.6); }
  .take-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── BODY ── */
  .take-body { display: flex; flex: 1; overflow: hidden; }
  .take-main { flex: 1; overflow-y: auto; padding: 1.75rem 1.5rem; scroll-behavior: smooth; }

  /* ── QUESTION CARD ── */
  .take-qcard {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 1.75rem 2rem;
    margin-bottom: 1.25rem;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(16px);
  }
  .take-qcard::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 50%);
    pointer-events: none;
  }
  .take-qnum {
    font-family: 'Space Grotesk', monospace;
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--violet-l);
    text-transform: uppercase;
    margin-bottom: 0.9rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .take-marks-pill {
    background: rgba(124,58,237,0.12);
    border: 1px solid rgba(124,58,237,0.25);
    padding: 0.18rem 0.6rem;
    border-radius: 99px;
    font-size: 0.68rem; font-weight: 700;
    color: var(--lavender);
    font-family: 'Space Grotesk', sans-serif;
  }
  .take-qtext {
    font-size: 1rem; font-weight: 500;
    line-height: 1.7;
    color: var(--cream);
  }

  /* ── MCQ OPTIONS ── */
  .take-option {
    width: 100%;
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 18px;
    border: 1px solid var(--card-bdr);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    text-align: left;
    color: var(--cream);
    font-size: 0.9rem;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .take-option::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(124,58,237,0) 0%, rgba(124,58,237,0.06) 100%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .take-option:hover { border-color: rgba(124,58,237,0.4); transform: translateX(3px); }
  .take-option:hover::before { opacity: 1; }
  .take-option.selected {
    border-color: var(--violet);
    background: rgba(124,58,237,0.1);
    box-shadow: 0 0 0 1px rgba(124,58,237,0.3), 0 4px 24px rgba(124,58,237,0.12);
    transform: translateX(3px);
  }
  .take-option.selected::before { opacity: 1; }
  .take-radio {
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 2px solid var(--card-bdr);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.2s, background 0.2s;
  }
  .take-radio.selected {
    border-color: var(--violet);
    background: var(--violet);
    box-shadow: 0 0 12px rgba(124,58,237,0.5);
  }
  .take-radio-dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; }

  /* ── FILL BLANK INPUT ── */
  .take-fill-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 0.95rem 1.25rem;
    color: var(--cream);
    font-size: 0.95rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .take-fill-input:focus {
    border-color: var(--violet);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15), 0 0 24px rgba(124,58,237,0.1);
    background: rgba(124,58,237,0.06);
  }
  .take-fill-input::placeholder { color: rgba(245,240,232,0.2); }

  .spin { animation: take-spin 0.8s linear infinite; }
  @keyframes take-spin { to { transform: rotate(360deg); } }

  /* ── NAV BUTTONS ── */
  .take-nav-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.6rem 1.25rem;
    border-radius: 14px;
    font-size: 0.82rem; font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .take-nav-btn.ghost {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--muted);
  }
  .take-nav-btn.ghost:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: var(--cream); }
  .take-nav-btn.ghost:disabled { opacity: 0.35; cursor: not-allowed; }
  .take-nav-btn.primary {
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    color: #fff;
    box-shadow: 0 0 20px rgba(124,58,237,0.35);
  }
  .take-nav-btn.primary:hover { box-shadow: 0 0 32px rgba(124,58,237,0.55); transform: translateY(-1px); }
  .take-nav-btn.outline {
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.3);
    color: var(--lavender);
  }
  .take-nav-btn.outline:hover { background: rgba(124,58,237,0.14); }

  /* ── SIDEBAR ── */
  .take-sidebar {
    width: 220px;
    flex-shrink: 0;
    border-left: 1px solid rgba(255,255,255,0.07);
    background: rgba(10,14,26,0.7);
    backdrop-filter: blur(16px);
    padding: 1.5rem 1.1rem;
    overflow-y: auto;
  }
  .take-sidebar-title {
    font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.85rem;
    font-family: 'Space Grotesk', sans-serif;
  }
  .take-qgrid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .take-qnum-btn {
    aspect-ratio: 1;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.68rem; font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }
  .take-qnum-btn.cur {
    background: linear-gradient(135deg, var(--violet), #4F46E5);
    color: #fff;
    box-shadow: 0 0 12px rgba(124,58,237,0.5);
    transform: scale(1.05);
  }
  .take-qnum-btn.answered {
    background: rgba(16,185,129,0.15);
    border: 1px solid rgba(16,185,129,0.35);
    color: var(--green);
  }
  .take-qnum-btn.unanswered {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    color: var(--muted);
  }
  .take-qnum-btn.unanswered:hover { border-color: rgba(124,58,237,0.4); color: var(--lavender); }

  /* ── LEGEND ── */
  .sidebar-legend { margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.68rem; color: var(--muted); }
  .legend-dot { width: 10px; height: 10px; border-radius: 4px; flex-shrink: 0; }

  /* ── LOADING SCREEN ── */
  .take-loading {
    min-height: 100vh;
    background: var(--navy);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 1rem;
  }
  .take-spinner {
    width: 44px; height: 44px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: var(--violet);
    border-right-color: rgba(124,58,237,0.3);
    animation: take-spin 0.7s linear infinite;
  }
  .take-spinner-glow {
    box-shadow: 0 0 30px rgba(124,58,237,0.4);
  }
  .take-loading-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9rem; font-weight: 500;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  /* ── MODAL CONTENT ── */
  .take-modal-warning {
    display: flex; align-items: flex-start; gap: 0.75rem;
    padding: 1rem 1.1rem;
    border-radius: 16px;
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.2);
    margin-bottom: 1.5rem;
    font-size: 0.82rem;
    color: var(--cream);
    line-height: 1.65;
  }
  .modal-btns { display: flex; justify-content: flex-end; gap: 0.6rem; }
  .modal-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.6rem 1.25rem;
    border-radius: 12px;
    font-size: 0.82rem; font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .modal-btn.ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--muted); }
  .modal-btn.ghost:hover { background: rgba(255,255,255,0.1); color: var(--cream); }
  .modal-btn.primary { background: linear-gradient(135deg, var(--violet), #4F46E5); color: #fff; box-shadow: 0 0 20px rgba(124,58,237,0.35); }
  .modal-btn.primary:hover { box-shadow: 0 0 32px rgba(124,58,237,0.55); }

  @media (max-width: 1024px) { .take-sidebar { display: none; } }
  @media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }

  /* ── FULLSCREEN TOGGLE & LAYOUT ADJUSTMENTS ── */
  body.has-fullscreen-exam .sl-aside {
    display: none !important;
  }
  body.has-fullscreen-exam .sl-bottom-nav {
    display: none !important;
  }
  body.has-fullscreen-exam .sl-main {
    padding-bottom: 0 !important;
  }

  .take-root.fullscreen-mode {
    padding: 0;
    margin: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  .take-root.fullscreen-mode .take-main {
    max-width: 100% !important;
    padding: 2rem 4rem !important;
  }

  /* ── CANVAS DRAWING TOOLBOX ── */
  .canvas-wrapper {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }
  .canvas-container {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
    background: #0D111E;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .take-toolbox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
    max-width: 700px;
    padding: 0.65rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .toolbox-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .toolbox-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: var(--muted);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: all 0.2s;
  }
  .toolbox-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.08);
    color: var(--cream);
    border-color: rgba(255,255,255,0.15);
  }
  .toolbox-btn.active {
    background: rgba(124,58,237,0.2);
    border-color: rgba(124,58,237,0.4);
    color: var(--lavender);
    box-shadow: 0 0 12px rgba(124,58,237,0.2);
  }
  .toolbox-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .color-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid rgba(0,0,0,0.3);
  }
  .color-dot.active {
    transform: scale(1.2);
    box-shadow: 0 0 8px currentColor;
    border: 2px solid #fff;
  }
  .saving-indicator {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.7rem;
    color: var(--muted);
    font-weight: 500;
  }
  .saving-spinner {
    animation: take-spin 1s linear infinite;
  }
`;

/* ─── Timer hook ──────────────────────────────────────────────────────────── */
function useCountdown(deadlineIso) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!deadlineIso) return;
    const tick = () => { const diff = Math.max(0, new Date(deadlineIso) - Date.now()); setRemaining(diff); };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineIso]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const label = h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return { remaining, label, expired: remaining === 0 };
}

/* ─── DRAWING CANVAS COMPONENTS ───────────────────────────────────────────── */
const redraw = (ctx, width, height, strokeList) => {
  ctx.clearRect(0, 0, width, height);
  strokeList.forEach(stroke => {
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (stroke.type === 'freehand' || stroke.type === 'draw') {
      if (stroke.points.length > 0) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    } else if (stroke.type === 'line') {
      if (stroke.points.length >= 2) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
        ctx.stroke();
      }
    } else if (stroke.type === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      if (stroke.points.length > 0) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });
};

function StructureCanvas({ imageUrl, savedAnswerUrl, onSave, saving }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [baseImage, setBaseImage] = useState(savedAnswerUrl || imageUrl);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [tool, setTool] = useState('draw'); // 'draw', 'line', 'erase'
  const [color, setColor] = useState('#EF4444'); // default red
  const [brushSize, setBrushSize] = useState(4);
  const [strokes, setStrokes] = useState([]);
  const [redoList, setRedoList] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);

  useEffect(() => {
    setBaseImage(savedAnswerUrl || imageUrl);
    setStrokes([]);
    setRedoList([]);
  }, [imageUrl, savedAnswerUrl]);

  const handleImageLoad = () => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setCanvasSize({ width: rect.width, height: rect.height });
  };

  useEffect(() => {
    const handleResize = () => {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || canvasSize.width === 0) return;
    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    const ctx = canvas.getContext('2d');
    redraw(ctx, canvasSize.width, canvasSize.height, strokes);
  }, [canvasSize, strokes]);

  const getCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    setIsDrawing(true);
    
    const newStroke = {
      type: tool,
      color: tool === 'erase' ? '#000000' : color,
      size: brushSize,
      points: [coords]
    };
    
    setCurrentStroke(newStroke);
  };

  const handleMove = (e) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    
    let updatedPoints = [...currentStroke.points];
    if (tool === 'line') {
      updatedPoints = [updatedPoints[0], coords];
    } else {
      updatedPoints.push(coords);
    }
    
    const updatedStroke = { ...currentStroke, points: updatedPoints };
    setCurrentStroke(updatedStroke);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    redraw(ctx, canvas.width, canvas.height, [...strokes, updatedStroke]);
  };

  const handleEnd = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    
    const finalStrokes = [...strokes, currentStroke];
    setStrokes(finalStrokes);
    setCurrentStroke(null);
    setRedoList([]);

    triggerSave(finalStrokes);
  };

  const triggerSave = (currentStrokes) => {
    if (!imgRef.current || !canvasRef.current) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgRef.current.naturalWidth;
    tempCanvas.height = imgRef.current.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(imgRef.current, 0, 0, tempCanvas.width, tempCanvas.height);

    const scaleX = tempCanvas.width / canvasSize.width;
    const scaleY = tempCanvas.height / canvasSize.height;

    const scaledStrokes = currentStrokes.map(stroke => ({
      ...stroke,
      size: stroke.size * scaleX,
      points: stroke.points.map(pt => ({
        x: pt.x * scaleX,
        y: pt.y * scaleY
      }))
    }));

    redraw(tempCtx, tempCanvas.width, tempCanvas.height, scaledStrokes);
    onSave(tempCanvas);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const undone = strokes[strokes.length - 1];
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    setRedoList([...redoList, undone]);
    triggerSave(newStrokes);
  };

  const handleRedo = () => {
    if (redoList.length === 0) return;
    const redone = redoList[redoList.length - 1];
    const newStrokes = [...strokes, redone];
    setStrokes(newStrokes);
    setRedoList(redoList.slice(0, -1));
    triggerSave(newStrokes);
  };

  const handleClear = () => {
    if (strokes.length === 0) return;
    setStrokes([]);
    setRedoList([]);
    triggerSave([]);
  };

  const handleResetToOriginal = () => {
    setBaseImage(imageUrl);
    setStrokes([]);
    setRedoList([]);
    
    if (imgRef.current) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgRef.current.naturalWidth;
      tempCanvas.height = imgRef.current.naturalHeight;
      const tempCtx = tempCanvas.getContext('2d');
      
      const tempImg = new Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = () => {
        tempCtx.drawImage(tempImg, 0, 0, tempCanvas.width, tempCanvas.height);
        onSave(tempCanvas);
      };
      tempImg.src = imageUrl;
    }
  };

  const COLORS = [
    { value: '#EF4444', label: 'Red' },
    { value: '#00D4FF', label: 'Cyan' },
    { value: '#10B981', label: 'Green' },
    { value: '#7C3AED', label: 'Violet' },
    { value: '#FFFFFF', label: 'White' }
  ];

  const SIZES = [
    { value: 2, label: 'Thin' },
    { value: 4, label: 'Medium' },
    { value: 8, label: 'Thick' }
  ];

  return (
    <div className="canvas-wrapper">
      <div 
        ref={containerRef} 
        className="canvas-container"
        style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}
      >
        <img
          ref={imgRef}
          src={baseImage}
          alt="Structure diagram"
          onLoad={handleImageLoad}
          style={{ width: '100%', maxHeight: '550px', objectFit: 'contain', borderRadius: '12px', display: 'block' }}
          crossOrigin="anonymous"
        />
        
        {canvasSize.width > 0 && (
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: canvasSize.width,
              height: canvasSize.height,
              cursor: tool === 'erase' ? 'cell' : 'crosshair',
              touchAction: 'none'
            }}
          />
        )}
      </div>

      <div className="take-toolbox">
        <div className="toolbox-group">
          <button 
            type="button"
            className={clsx('toolbox-btn', tool === 'draw' && 'active')} 
            onClick={() => setTool('draw')}
            title="Draw Freehand"
          >
            <Paintbrush size={14} />
            <span>Draw</span>
          </button>
          <button 
            type="button"
            className={clsx('toolbox-btn', tool === 'line' && 'active')} 
            onClick={() => setTool('line')}
            title="Draw Straight Line"
          >
            <Slash size={14} />
            <span>Line</span>
          </button>
          <button 
            type="button"
            className={clsx('toolbox-btn', tool === 'erase' && 'active')} 
            onClick={() => setTool('erase')}
            title="Eraser"
          >
            <Eraser size={14} />
            <span>Erase</span>
          </button>
        </div>

        {tool !== 'erase' && (
          <div className="toolbox-group" style={{ padding: '0 0.5rem' }}>
            {COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                className={clsx('color-dot', color === c.value && 'active')}
                style={{ backgroundColor: c.value, color: c.value }}
                onClick={() => setColor(c.value)}
                title={c.label}
              />
            ))}
          </div>
        )}

        <div className="toolbox-group">
          {SIZES.map(s => (
            <button
              key={s.value}
              type="button"
              className={clsx('toolbox-btn', brushSize === s.value && 'active')}
              onClick={() => setBrushSize(s.value)}
              title={`${s.label} Brush`}
            >
              <span style={{ 
                display: 'inline-block', 
                width: s.value + 2, 
                height: s.value + 2, 
                borderRadius: '50%', 
                backgroundColor: 'currentColor' 
              }} />
            </button>
          ))}
        </div>

        <div className="toolbox-group">
          <button 
            type="button"
            className="toolbox-btn" 
            onClick={handleUndo} 
            disabled={strokes.length === 0}
            title="Undo"
          >
            <Undo2 size={14} />
          </button>
          <button 
            type="button"
            className="toolbox-btn" 
            onClick={handleRedo} 
            disabled={redoList.length === 0}
            title="Redo"
          >
            <Redo2 size={14} />
          </button>
          <button 
            type="button"
            className="toolbox-btn" 
            onClick={handleClear} 
            disabled={strokes.length === 0}
            title="Clear current drawing"
          >
            Clear
          </button>
          {baseImage !== imageUrl && (
            <button 
              type="button"
              className="toolbox-btn" 
              style={{ color: '#EF4444' }}
              onClick={handleResetToOriginal}
              title="Reset to clean original illustration"
            >
              Reset Original
            </button>
          )}
        </div>

        {saving && (
          <div className="saving-indicator">
            <Loader2 size={12} className="saving-spinner" />
            <span>Saving...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExamTakePage() {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase]                 = useState('loading');
  const [submissionId, setSubmissionId]     = useState(null);
  const [deadline, setDeadline]             = useState(null);
  const [questions, setQuestions]           = useState([]);
  const [answers, setAnswers]               = useState({});
  const [current, setCurrent]               = useState(0);
  const [confirmSubmit, setConfirmSubmit]   = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const saveTimer = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savingDrawing, setSavingDrawing] = useState(false);
  const drawingSaveTimeout = useRef(null);
  const pendingCanvasRef = useRef(null);

  const { remaining, label: timerLabel, expired } = useCountdown(deadline);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('has-fullscreen-exam');
    } else {
      document.body.classList.remove('has-fullscreen-exam');
    }
    return () => {
      document.body.classList.remove('has-fullscreen-exam');
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const startRes = await studentApi.startExam(examId);
        const sid = startRes.data.data.submission_id;
        const dl  = startRes.data.data.deadline_at;
        setSubmissionId(sid);
        setDeadline(dl);
        const qRes = await studentApi.getExamQuestions(examId);
        const fetchedQuestions = (qRes.data.data.questions ?? []).map((q) => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options ?? []),
        }));
        setQuestions(fetchedQuestions);
        
        // Initialize answers state from database
        const initialAnswers = {};
        fetchedQuestions.forEach(q => {
          if (q.student_answer !== undefined && q.student_answer !== null) {
            initialAnswers[q.id] = q.student_answer;
          }
        });
        setAnswers(initialAnswers);

        setPhase('taking');
      } catch (err) {
        toast.error(err.response?.data?.message ?? 'Could not start exam');
        navigate('/exams');
      }
    })();
  }, [examId, navigate]);

  useEffect(() => {
    if (expired && phase === 'taking') handleSubmit(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  const saveAnswer = useCallback(async (questionId, answer) => {
    if (!submissionId) return;
    try { await studentApi.saveAnswer(examId, submissionId, { question_id: questionId, answer }); } catch { /* silent */ }
  }, [examId, submissionId]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((p) => ({ ...p, [questionId]: answer }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveAnswer(questionId, answer), 800);
  };

  const uploadDrawing = async (canvas, questionId) => {
    if (!submissionId || !canvas) return;
    setSavingDrawing(true);
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `answer_${questionId}.png`, { type: 'image/png' });
      
      const res = await studentApi.savePhotoAnswer(examId, submissionId, questionId, file);
      const uploadedUrl = res.data.data.url;
      
      setAnswers((p) => ({ ...p, [questionId]: uploadedUrl }));
    } catch (err) {
      console.error('Error auto-saving drawing:', err);
      toast.error('Failed to auto-save drawing');
    } finally {
      setSavingDrawing(false);
    }
  };

  const triggerPendingSave = async () => {
    if (!pendingCanvasRef.current) return;
    if (drawingSaveTimeout.current) {
      clearTimeout(drawingSaveTimeout.current);
      drawingSaveTimeout.current = null;
    }
    const canvas = pendingCanvasRef.current;
    pendingCanvasRef.current = null;
    const currentQuestionId = questions[current]?.id;
    if (currentQuestionId) {
      await uploadDrawing(canvas, currentQuestionId);
    }
  };

  const handleDrawingSave = (canvas) => {
    pendingCanvasRef.current = canvas;
    if (drawingSaveTimeout.current) {
      clearTimeout(drawingSaveTimeout.current);
    }
    drawingSaveTimeout.current = setTimeout(() => {
      triggerPendingSave();
    }, 2000);
  };

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    setConfirmSubmit(false);
    setPhase('submitting');
    try {
      await studentApi.submitExam(examId, submissionId);
      if (!auto) toast.success('Exam submitted!');
      navigate(`/exams/${examId}/result`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Submission failed');
      setPhase('taking');
      setSubmitting(false);
    }
  };

  const answered = Object.keys(answers).length;
  const total    = questions.length;
  const q        = questions[current];
  const isUrgent = remaining > 0 && remaining < 5 * 60 * 1000;
  const pct      = total > 0 ? (answered / total) * 100 : 0;

  /* ── Loading / Submitting screens ── */
  if (phase === 'loading') {
    return (
      <>
        <style>{CSS}</style>
        <div className="take-loading">
          <motion.div className="take-spinner take-spinner-glow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          <motion.p className="take-loading-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            Preparing your exam…
          </motion.p>
        </div>
      </>
    );
  }

  if (phase === 'submitting') {
    return (
      <>
        <style>{CSS}</style>
        <div className="take-loading">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative', width: 44, height: 44 }}>
            <div className="take-spinner" style={{ borderTopColor: 'var(--green)', borderRightColor: 'rgba(16,185,129,0.3)', boxShadow: '0 0 30px rgba(16,185,129,0.4)' }} />
          </motion.div>
          <motion.p className="take-loading-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            Submitting your exam…
          </motion.p>
        </div>
      </>
    );
  }

  if (!q) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className={clsx('take-root', isFullscreen && 'fullscreen-mode')}>

        {/* ── TOP BAR ── */}
        <div className="take-topbar">
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span className="take-progress-label">{answered}/{total} answered</span>
            <div className="take-progress-track">
              <div className="take-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Fullscreen Option */}
            <button 
              type="button"
              className="toolbox-btn" 
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--cream)', padding: '0.45rem 0.95rem', gap: '0.4rem', height: '36px', borderRadius: '12px' }}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>

            {/* Timer */}
            <div className={clsx('take-timer', isUrgent && 'urgent')} style={{ height: '36px' }}>
              <Clock size={14} />
              {timerLabel}
            </div>
          </div>

          {/* Submit */}
          <button className="take-submit-btn" disabled={submitting} onClick={async () => {
            if (pendingCanvasRef.current) await triggerPendingSave();
            setConfirmSubmit(true);
          }}>
            <Send size={13} /> Submit
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="take-body">

          {/* ── Main content ── */}
          <main className="take-main" style={{ maxWidth: 740, margin: '0 auto', width: '100%' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Question card */}
                <div className="take-qcard">
                  <div className="take-qnum">
                    <span>Question {current + 1} of {total}</span>
                    <span className="take-marks-pill">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="take-qtext">{q.question_text}</p>
                  
                  {/* Structure Question Canvas overlay with toolbox */}
                  {q.question_type === 'photo' && q.image_url && (
                    <StructureCanvas
                      imageUrl={q.image_url}
                      savedAnswerUrl={answers[q.id]}
                      onSave={handleDrawingSave}
                      saving={savingDrawing}
                    />
                  )}
                </div>

                {/* Answer area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  
                  {/* MCQ options (only for MCQ questions) */}
                  {q.question_type === 'mcq' && Array.isArray(q.options) && q.options.map((opt, i) => {
                    const val      = typeof opt === 'object' ? opt.id : opt;
                    const display  = typeof opt === 'object' ? opt.text : opt;
                    const selected = answers[q.id] === val;
                    return (
                      <motion.button
                        key={i}
                        className={clsx('take-option', selected && 'selected')}
                        onClick={() => handleAnswer(q.id, val)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className={clsx('take-radio', selected && 'selected')}>
                          {selected && <div className="take-radio-dot" />}
                        </div>
                        <span style={{ fontSize: '0.92rem', position: 'relative', zIndex: 1 }}>{display}</span>
                      </motion.button>
                    );
                  })}

                  {/* Fill blank */}
                  {q.question_type === 'fill_blank' && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <input
                        className="take-fill-input"
                        placeholder="Type your answer here…"
                        value={answers[q.id] ?? ''}
                        onChange={(e) => handleAnswer(q.id, e.target.value)}
                        autoFocus
                      />
                    </motion.div>
                  )}

                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="take-nav-btn ghost"
                    onClick={async () => {
                      if (pendingCanvasRef.current) await triggerPendingSave();
                      setCurrent((p) => Math.max(0, p - 1));
                    }}
                    disabled={current === 0}
                  >
                    <ChevronLeft size={15} /> Previous
                  </button>
                  <button
                    className={clsx('take-nav-btn', current < total - 1 ? 'outline' : 'primary')}
                    onClick={async () => {
                      if (pendingCanvasRef.current) await triggerPendingSave();
                      if (current < total - 1) {
                        setCurrent((p) => p + 1);
                      } else {
                        setConfirmSubmit(true);
                      }
                    }}
                  >
                    {current < total - 1 ? <><span>Next</span><ChevronRight size={15} /></> : <><Send size={13} /><span>Submit</span></>}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* ── Sidebar ── */}
          <aside className="take-sidebar">
            <p className="take-sidebar-title">Questions</p>
            <div className="take-qgrid">
              {questions.map((_, i) => {
                const isCur  = i === current;
                const isAns  = !!answers[questions[i]?.id];
                return (
                  <button
                    key={i}
                    onClick={async () => {
                      if (pendingCanvasRef.current) await triggerPendingSave();
                      setCurrent(i);
                    }}
                    className={clsx(
                      'take-qnum-btn',
                      isCur ? 'cur' : isAns ? 'answered' : 'unanswered'
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="sidebar-legend">
              {[
                { cls: 'cur',      color: 'linear-gradient(135deg, #7C3AED, #4F46E5)', label: 'Current' },
                { cls: 'answered', color: 'rgba(16,185,129,0.25)',                     label: 'Answered' },
                { cls: 'unanswered',color:'rgba(255,255,255,0.05)',                      label: 'Unanswered' },
              ].map(({ color, label }) => (
                <div key={label} className="legend-item">
                  <div className="legend-dot" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>

            {/* Progress ring summary */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--cream), var(--lavender))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {Math.round(pct)}%
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 2 }}>complete</div>
            </div>
          </aside>
        </div>

        {/* ── Confirm submit modal ── */}
        <Modal open={confirmSubmit} onClose={() => setConfirmSubmit(false)} title="Submit Exam" size="sm">
          <div className="take-modal-warning">
            <AlertTriangle size={16} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 700, marginBottom: '0.3rem', color: 'var(--cream)' }}>Are you sure?</p>
              <p>You've answered <strong style={{ color: 'var(--cream)' }}>{answered}</strong> of <strong style={{ color: 'var(--cream)' }}>{total}</strong> questions. You cannot change answers after submitting.</p>
            </div>
          </div>
          <div className="modal-btns">
            <button className="modal-btn ghost" onClick={() => setConfirmSubmit(false)}>Keep reviewing</button>
            <button className="modal-btn primary" disabled={submitting} onClick={() => handleSubmit(false)}>
              <Send size={13} /> Submit now
            </button>
          </div>
        </Modal>

      </div>
    </>
  );
}