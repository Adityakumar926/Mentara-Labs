import { useState, useRef, useEffect, useCallback } from 'react';
import { Pen, Eraser, RotateCcw, CheckCircle2, X } from 'lucide-react';
import clsx from 'clsx';

const PALETTE = [
  '#1a1a1a', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#ffffff',
];

const CSS = `
  .ws-modal-inner {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background: #0A0E1A;
    color: #F5F0E8;
    font-family: 'Inter', sans-serif;
    border-radius: 0;
    overflow: hidden;
    position: relative;
  }
  .ws-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.4rem 0.85rem;
    background: rgba(15, 22, 41, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }
  .ws-toolbar-group { display: flex; align-items: center; gap: 0.35rem; }
  .ws-toolbar-sep { width: 1px; height: 22px; background: rgba(255,255,255,0.1); margin: 0 0.2rem; }
  .ws-tool-btn {
    height: 32px; padding: 0 0.65rem; border-radius: 9px;
    border: 1px solid transparent; background: rgba(255,255,255,0.04);
    color: rgba(245,240,232,0.6); cursor: pointer; font-size: 0.8rem; font-weight: 600;
    display: flex; align-items: center; gap: 0.35rem; transition: all 0.15s;
  }
  .ws-tool-btn:hover { background: rgba(255,255,255,0.09); color: #F5F0E8; }
  .ws-tool-btn.active { background: rgba(245,158,11,0.18); border-color: rgba(245,158,11,0.45); color: #FCD34D; }
  .ws-tool-btn.danger:hover { background: rgba(239,68,68,0.14); color: #F87171; border-color: rgba(239,68,68,0.35); }
  .ws-size-wrap { display: flex; align-items: center; gap: 0.4rem; }
  .ws-size-label { font-size: 0.65rem; color: rgba(245,240,232,0.45); font-weight: 700; text-transform: uppercase; }
  .ws-size-input {
    -webkit-appearance: none; appearance: none; width: 85px; height: 4px;
    border-radius: 2px; background: rgba(255,255,255,0.12); outline: none; cursor: pointer;
  }
  .ws-size-input::-webkit-slider-thumb {
    -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
    background: #FCD34D; cursor: pointer; box-shadow: 0 0 8px rgba(252,211,77,0.6);
  }
  .ws-color-swatch {
    width: 22px; height: 22px; border-radius: 6px; cursor: pointer;
    border: 2px solid transparent; transition: transform 0.15s, border-color 0.15s; flex-shrink: 0;
  }
  .ws-color-swatch:hover { transform: scale(1.15); }
  .ws-color-swatch.active { border-color: #ffffff; transform: scale(1.1); box-shadow: 0 0 8px rgba(255,255,255,0.4); }
  .ws-canvas-container {
    flex: 1; overflow: auto; display: flex; justify-content: center; align-items: center;
    background: #090D16; padding: 0; position: relative;
  }
  .ws-sizer { position: relative; display: inline-block; line-height: 0; max-width: 100%; max-height: calc(100vh - 42px); }
  .ws-bg-img { display: block; max-width: 100vw; max-height: calc(100vh - 42px); width: auto; height: auto; object-fit: contain; user-select: none; pointer-events: none; border-radius: 0; }
  .ws-drawing-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; touch-action: none; cursor: crosshair; }
  .ws-drawing-overlay.eraser { cursor: cell; }
`;

export default function WorksheetCanvas({ imageUrl, contentId, title = 'Interactive Worksheet', onSubmit, onClose }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#1a1a1a');
  const [size, setSize] = useState(3);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    const img = canvasRef.current;
    if (!img || !overlayRef.current) return;
    overlayRef.current.width = img.offsetWidth || img.naturalWidth;
    overlayRef.current.height = img.offsetHeight || img.naturalHeight;
    setImgLoaded(true);
  }, []);

  // Broadcast active worksheet context to GOGO AI Voice Tutor
  useEffect(() => {
    if (imageUrl) {
      const ctx = {
        questionNumber: 1,
        totalQuestions: 1,
        questionText: title || 'Interactive Worksheet Task',
        options: [],
        imageUrl: imageUrl,
        extractedText: null
      };
      window.activeExamContext = ctx;
      window.dispatchEvent(new CustomEvent('active-exam-question-changed', { detail: ctx }));
    }

    return () => {
      window.activeExamContext = null;
      window.dispatchEvent(new CustomEvent('active-exam-question-changed', { detail: null }));
    };
  }, [imageUrl, title]);

  useEffect(() => {
    const img = canvasRef.current;
    if (!img) return;
    const ro = new ResizeObserver(() => {
      if (!overlayRef.current || !imgLoaded) return;
      overlayRef.current.width = img.offsetWidth;
      overlayRef.current.height = img.offsetHeight;
    });
    ro.observe(img);
    return () => ro.disconnect();
  }, [imgLoaded]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    if (!imgLoaded) return;
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e, overlayRef.current);
  };

  const draw = (e) => {
    if (!isDrawing.current || !imgLoaded) return;
    e.preventDefault();
    const canvas = overlayRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

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
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="ws-modal-inner">
      <style>{CSS}</style>

      {/* Sleek Top Toolbar with Title & Close Button */}
      <div className="ws-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFF', whiteSpace: 'nowrap' }}>
            {title}
          </h3>
          <div className="ws-toolbar-sep" />
          <div className="ws-toolbar-group">
            <button className={clsx('ws-tool-btn', tool === 'pen' && 'active')} title="Pen" onClick={() => setTool('pen')}>
              <Pen size={14} /> <span>Pen</span>
            </button>
            <button className={clsx('ws-tool-btn', tool === 'eraser' && 'active')} title="Eraser" onClick={() => setTool('eraser')}>
              <Eraser size={14} /> <span>Eraser</span>
            </button>
          </div>
          <div className="ws-toolbar-sep" />
          <div className="ws-toolbar-group ws-size-wrap">
            <span className="ws-size-label">Size</span>
            <input type="range" min={1} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} className="ws-size-input" />
            <span className="ws-size-label" style={{ minWidth: 18, textAlign: 'right' }}>{size}</span>
          </div>
          <div className="ws-toolbar-sep" />
          {tool === 'pen' && (
            <div className="ws-toolbar-group" style={{ flexWrap: 'nowrap', gap: '0.28rem' }}>
              {PALETTE.map((c) => (
                <button key={c} className={clsx('ws-color-swatch', color === c && 'active')} style={{ background: c, border: c === '#ffffff' ? '2px solid rgba(255,255,255,0.3)' : undefined }} title={c} onClick={() => setColor(c)} />
              ))}
            </div>
          )}
          <div className="ws-toolbar-sep" />
          <button className="ws-tool-btn danger" title="Clear drawings" onClick={clearCanvas}>
            <RotateCcw size={14} /> <span>Clear</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(245,240,232,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s'
            }}
            title="Close Worksheet"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Bezelless Canvas Area */}
      <div className="ws-canvas-container">
        <div className="ws-sizer">
          <img ref={canvasRef} src={imageUrl} alt={title} className="ws-bg-img" onLoad={handleImageLoad} crossOrigin="anonymous" />
          <canvas
            ref={overlayRef}
            className={clsx('ws-drawing-overlay', tool === 'eraser' && 'eraser')}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>
      </div>
    </div>
  );
}
