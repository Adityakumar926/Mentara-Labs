import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  FileText, Lock, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PdfViewerModal({ open, onClose, pdfUrl, title = "Cambridge Primary Notes" }) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Global Capture-Phase Event Interception (Blocks Right-Click & Shortcuts at Window Level)
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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 75));
  const handleResetZoom = () => setZoom(100);

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

  // Convert raw PDF to Google Docs HTML Viewer URL
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
          className="relative w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl border border-white/10 bg-zinc-950 text-zinc-100 shadow-[0_0_90px_rgba(0,0,0,0.9)] overflow-hidden select-none"
        >
          {/* ── CUSTOM MENTARA GLASS TOOLBAR ── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-zinc-900/95 backdrop-blur-md z-30 shrink-0">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[320px]">
                    {title}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono-label font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="h-2.5 w-2.5" /> Cambridge Study Material
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono-label block">
                  Mentara Protected Document Reader
                </span>
              </div>
            </div>

            {/* Middle Controls: Zoom & View Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl border border-white/10 bg-white/[0.03]">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 hover:bg-white/10 rounded transition-colors"
                  title="Reset Zoom"
                >
                  {zoom}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

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
              className="p-2 rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 transition-all ml-2"
              title="Close Reader"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── MAIN PDF CONTENT CONTAINER ── */}
          <div 
            className="relative flex-1 bg-zinc-950 overflow-hidden flex flex-col items-center justify-center p-1 sm:p-2 select-none"
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          >
            <div 
              className="relative w-full h-full transition-transform duration-200 ease-out flex flex-col items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-zinc-900 shadow-2xl"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              {/* Cropped Viewer Frame: Pushes top Google toolbar (-54px) outside viewport */}
              <iframe
                ref={iframeRef}
                src={securePdfUrl}
                title={title}
                className="w-full border-0 bg-zinc-900"
                style={{ height: 'calc(100% + 54px)', marginTop: '-54px' }}
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

            {/* Bottom Floating Watermark & Security Shield */}
            <div className="absolute bottom-3 pointer-events-none flex justify-center z-30">
              <div className="px-4 py-1 rounded-full border border-cyan-500/30 bg-zinc-950/90 backdrop-blur-md text-[11px] font-mono-label font-bold text-zinc-300 flex items-center gap-2 shadow-lg">
                <Lock className="h-3.5 w-3.5 text-cyan-400" />
                Mentara Protected Content · Downloads Disabled
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
