import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Maximize2, Minimize2, 
  FileText, Lock, Sparkles, Pencil, Highlighter, Eraser, Undo2, Redo2, Trash2, MousePointer, Paintbrush
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Cyan', hex: '#00D4FF' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Orange', hex: '#FB923C' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'White', hex: '#FFFFFF' },
];

const SIZES = [2, 4, 8, 14];

export default function PdfViewerModal({ open, onClose, pdfUrl, title = "Cambridge Primary Notes" }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Drawing mode states
  const [drawMode, setDrawMode] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen', 'highlighter', 'eraser'
  const [color, setColor] = useState('#00D4FF');
  const [brushSize, setBrushSize] = useState(4);
  const [strokes, setStrokes] = useState([]);
  const [redoStrokes, setRedoStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);

  // Canvas size sync
  useEffect(() => {
    if (!open || !canvasRef.current || !canvasContainerRef.current) return;
    const updateCanvasDimensions = () => {
      if (!canvasRef.current || !canvasContainerRef.current) return;
      const container = canvasContainerRef.current;
      const width = container.clientWidth || 1000;
      const height = container.clientHeight || 800;
      if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
      drawAllStrokes();
    };
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [drawMode, open]);

  const drawAllStrokes = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const all = currentStroke ? [...strokes, currentStroke] : strokes;
    all.forEach(stroke => {
      if (!stroke.points || stroke.points.length < 1) return;
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.size * 3;
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size * 3;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });
  };

  useEffect(() => {
    drawAllStrokes();
  }, [strokes, currentStroke]);

  // Global Capture-Phase Event Interception
  useEffect(() => {
    if (!open) return;

    const preventContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toast.error('Right-clicking and downloading are disabled to protect curriculum content.', { id: 'no-context-menu-toast' });
      return false;
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'S' || e.key === 'P' || e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Downloading, saving, and printing are disabled.', { id: 'no-download-toast' });
      }
    };

    window.addEventListener('contextmenu', preventContextMenu, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('contextmenu', preventContextMenu, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  if (!open || !pdfUrl) return null;

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Drawing event handlers
  const getCoords = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvasRef.current.width / (rect.width || 1);
    const scaleY = canvasRef.current.height / (rect.height || 1);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    if (!drawMode) return;
    const pt = getCoords(e);
    setIsDrawing(true);
    setCurrentStroke({
      tool,
      color,
      size: brushSize,
      points: [pt]
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentStroke) return;
    const pt = getCoords(e);
    setCurrentStroke(prev => ({
      ...prev,
      points: [...prev.points, pt]
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    setStrokes(prev => [...prev, currentStroke]);
    setCurrentStroke(null);
    setRedoStrokes([]);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes(prev => prev.slice(0, -1));
    setRedoStrokes(prev => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStrokes.length === 0) return;
    const last = redoStrokes[redoStrokes.length - 1];
    setRedoStrokes(prev => prev.slice(0, -1));
    setStrokes(prev => [...prev, last]);
  };

  const handleClearAll = () => {
    setStrokes([]);
    setRedoStrokes([]);
    setCurrentStroke(null);
    toast.success('Drawing canvas cleared');
  };

  const securePdfUrl = pdfUrl.includes('docs.google.com')
    ? pdfUrl
    : `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-7xl h-[95vh] flex flex-col rounded-2xl border border-white/10 bg-zinc-950 text-zinc-100 shadow-[0_0_90px_rgba(0,0,0,0.9)] overflow-hidden select-none"
        >
          {/* ── CUSTOM MENTARA GLASS TOOLBAR ── */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 border-b border-white/10 bg-zinc-900/95 backdrop-blur-md z-30 shrink-0 gap-2 flex-wrap">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-8 w-8 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-[280px]">
                    {title}
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono-label font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="h-2.5 w-2.5" /> Cambridge Story
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Controls: DRAWING TOOLS */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              
              {/* Draw Mode Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  const next = !drawMode;
                  setDrawMode(next);
                  if (next) toast.success('Drawing Mode active! Draw or highlight over the document.');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  drawMode 
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.4)]' 
                    : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
                title={drawMode ? 'Switch to Pointer / Read Mode' : 'Enable Drawing Tool'}
              >
                {drawMode ? <Paintbrush className="h-3.5 w-3.5" /> : <MousePointer className="h-3.5 w-3.5 text-cyan-400" />}
                <span>{drawMode ? 'Drawing On' : 'Draw Tool'}</span>
              </button>

              {/* Drawing Controls Panel (Shown when Draw Mode is active) */}
              {drawMode && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-xl border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-md">
                  {/* Tool Pickers: Pen, Highlighter, Eraser */}
                  <button
                    type="button"
                    onClick={() => setTool('pen')}
                    className={`p-1.5 rounded-lg transition-colors ${tool === 'pen' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' : 'text-zinc-400 hover:text-white'}`}
                    title="Pen"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTool('highlighter')}
                    className={`p-1.5 rounded-lg transition-colors ${tool === 'highlighter' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50' : 'text-zinc-400 hover:text-white'}`}
                    title="Highlighter"
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTool('eraser')}
                    className={`p-1.5 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-rose-500/30 text-rose-300 border border-rose-400/50' : 'text-zinc-400 hover:text-white'}`}
                    title="Eraser"
                  >
                    <Eraser className="h-3.5 w-3.5" />
                  </button>

                  <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

                  {/* Color Swatches */}
                  {tool !== 'eraser' && (
                    <div className="flex items-center gap-1">
                      {COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          className={`w-4 h-4 rounded-full border transition-transform ${color === c.hex ? 'scale-125 border-white ring-2 ring-cyan-400/50' : 'border-black/40 opacity-80 hover:opacity-100'}`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}

                  <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

                  {/* Brush Sizes */}
                  <div className="flex items-center gap-1">
                    {SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setBrushSize(sz)}
                        className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${brushSize === sz ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'}`}
                        title={`Size ${sz}px`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

                  {/* Undo / Redo / Clear */}
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={strokes.length === 0}
                    className="p-1 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                    title="Undo"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStrokes.length === 0}
                    className="p-1 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                    title="Redo"
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={strokes.length === 0}
                    className="p-1 rounded-md text-rose-400 hover:text-rose-300 disabled:opacity-30 transition-colors"
                    title="Clear All Drawings"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:border-cyan-500/40 transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>

            {/* Right: Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 transition-all ml-1"
              title="Close Reader"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── MAIN PDF CONTENT & CANVAS OVERLAY CONTAINER ── */}
          <div 
            ref={canvasContainerRef}
            className="relative flex-1 bg-zinc-950 overflow-hidden flex flex-col items-center justify-center p-0 select-none"
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          >
            {/* Native High-Res Viewer Frame */}
            <iframe
              ref={iframeRef}
              src={securePdfUrl}
              title={title}
              className="w-full h-full border-0 bg-zinc-900"
              style={{ width: '100%', height: '100%' }}
            />

            {/* Interactive Transparent Drawing Canvas Overlay */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              className={`absolute inset-0 z-20 ${drawMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
            />

            {/* Top-Right Shield covering pop-out area */}
            <div 
              className="absolute top-0 right-0 z-40 h-14 w-28 bg-zinc-950/95 backdrop-blur-md border-b border-l border-white/10 rounded-bl-2xl flex items-center justify-center pointer-events-auto"
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono-label font-bold text-cyan-400">
                <Lock className="h-3 w-3" /> Protected
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
