import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Edit2, GripVertical,
  FileText, Video, Sparkles, ChevronDown, ChevronRight, Lock,
  Eye, Code2, UploadCloud, CheckCircle2, Loader2,
  FilePlus, X, Image, FolderPlus, Layers, BookOpen,
  Search, ArrowRight, Folder, Filter, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageWrapper, Button, Badge, Skeleton, EmptyState,
  Modal, Input, Textarea, Select, Toggle, ConfirmDialog,
} from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import clsx from 'clsx';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS as DndCSS } from '@dnd-kit/utilities';

/* ─── TITLE & SIZE UTILITIES ─── */
export function formatTitleFromFilename(filename) {
  if (!filename) return '';
  // Remove file extension
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  // Replace underscores, hyphens, and dots with spaces
  const withSpaces = withoutExt.replace(/[-_.]+/g, ' ');
  // Clean multiple spaces and trim
  const cleaned = withSpaces.replace(/\s+/g, ' ').trim();
  if (!cleaned) return filename;
  // Capitalize each word nicely
  return cleaned
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
    .join(' ');
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/* ─── COLOR PALETTES FOR SQUARE FOLDER CARDS (Image 4 Inspiration) ─── */
const CARD_PALETTES = [
  {
    id: 'blue',
    bg: '#3E7BFA',
    tabBg: '#2E66E2',
    border: 'rgba(255, 255, 255, 0.22)',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    descText: 'rgba(255, 255, 255, 0.88)',
    glow: 'rgba(62, 123, 250, 0.45)',
    badgeBg: 'rgba(0, 0, 0, 0.22)',
    badgeColor: '#FFFFFF',
  },
  {
    id: 'teal',
    bg: '#14B8A6',
    tabBg: '#0D9488',
    border: 'rgba(255, 255, 255, 0.22)',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    descText: 'rgba(255, 255, 255, 0.88)',
    glow: 'rgba(20, 184, 166, 0.45)',
    badgeBg: 'rgba(0, 0, 0, 0.22)',
    badgeColor: '#FFFFFF',
  },
  {
    id: 'emerald',
    bg: '#10B981',
    tabBg: '#059669',
    border: 'rgba(255, 255, 255, 0.22)',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    descText: 'rgba(255, 255, 255, 0.88)',
    glow: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'rgba(0, 0, 0, 0.22)',
    badgeColor: '#FFFFFF',
  },
  {
    id: 'coral',
    bg: '#FA7268',
    tabBg: '#E85B51',
    border: 'rgba(255, 255, 255, 0.22)',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    descText: 'rgba(255, 255, 255, 0.88)',
    glow: 'rgba(250, 114, 104, 0.45)',
    badgeBg: 'rgba(0, 0, 0, 0.22)',
    badgeColor: '#FFFFFF',
  },
  {
    id: 'amber',
    bg: '#FBBF24',
    tabBg: '#F59E0B',
    border: 'rgba(0, 0, 0, 0.15)',
    accent: '#0F172A',
    text: '#1E293B',
    descText: 'rgba(30, 41, 59, 0.85)',
    glow: 'rgba(251, 191, 36, 0.45)',
    badgeBg: 'rgba(0, 0, 0, 0.15)',
    badgeColor: '#1E293B',
  },
  {
    id: 'rose',
    bg: '#F43F5E',
    tabBg: '#E11D48',
    border: 'rgba(255, 255, 255, 0.22)',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    descText: 'rgba(255, 255, 255, 0.88)',
    glow: 'rgba(244, 63, 94, 0.45)',
    badgeBg: 'rgba(0, 0, 0, 0.22)',
    badgeColor: '#FFFFFF',
  },
  {
    id: 'sky',
    bg: '#0EA5E9',
    tabBg: '#0284C7',
    border: 'rgba(255, 255, 255, 0.22)',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    descText: 'rgba(255, 255, 255, 0.88)',
    glow: 'rgba(14, 165, 233, 0.45)',
    badgeBg: 'rgba(0, 0, 0, 0.22)',
    badgeColor: '#FFFFFF',
  },
  {
    id: 'purple',
    bg: '#8B5CF6',
    tabBg: '#7C3AED',
    border: 'rgba(255, 255, 255, 0.22)',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    descText: 'rgba(255, 255, 255, 0.88)',
    glow: 'rgba(139, 92, 246, 0.45)',
    badgeBg: 'rgba(0, 0, 0, 0.22)',
    badgeColor: '#FFFFFF',
  },
];

/* ─── CSS ─── */
const CSS = `
  .cd-root {
    --navy:     var(--local-navy, #0A0E1A);
    --navy2:    var(--local-navy2, #0F1629);
    --violet:   #7C3AED;
    --violet-l: var(--local-violet-l, #9D6FEF);
    --cyan:     var(--local-cyan, #00D4FF);
    --cream:    var(--local-cream, #F5F0E8);
    --lavender: var(--local-lavender, #C4B5FD);
    --green:    var(--local-green, #10B981);
    --amber:    var(--local-amber, #F59E0B);
    --red:      var(--local-red, #EF4444);
    --muted:    var(--local-muted, rgba(245,240,232,0.45));
    --card-bg:  var(--local-card-bg, rgba(255,255,255,0.03));
    --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.08));
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .cd-root *, .cd-root *::before, .cd-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .cd-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 24px; padding: 1.5rem 2rem;
    overflow: hidden; backdrop-filter: blur(16px);
    margin-bottom: 1.25rem;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    flex-wrap: wrap;
  }
  .cd-hblob { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
  .cd-hblob-1 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    top: -90px; right: -50px;
    animation: cd-drift 11s ease-in-out infinite alternate;
  }
  .cd-hblob-2 {
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%);
    bottom: -40px; left: 30%;
    animation: cd-drift 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes cd-drift { from{transform:translate(0,0)} to{transform:translate(20px,-14px)} }

  .cd-back-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 12px; border: none;
    background: rgba(255,255,255,0.06); color: var(--muted);
    cursor: pointer; transition: background 0.2s, color 0.2s, transform 0.2s; flex-shrink: 0;
  }
  .cd-back-btn:hover { background: rgba(124,58,237,0.15); color: var(--cream); transform: translateX(-2px); }

  .cd-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.22rem 0.75rem; border-radius: 50px;
    font-size: 0.67rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.35rem;
  }
  .cd-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 7px var(--cyan);
    animation: cd-blink 2s ease infinite;
  }
  @keyframes cd-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .cd-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.2rem, 2vw, 1.6rem); font-weight: 700; letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    line-height: 1.2; margin-bottom: 0.15rem;
  }
  .cd-subtitle { font-size: 0.8rem; color: var(--muted); }

  .cd-btn-primary {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
    border: 1px solid rgba(124,58,237,0.5); color: #fff;
    font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 600;
    padding: 0.6rem 1.15rem; border-radius: 12px; cursor: pointer;
    box-shadow: 0 4px 18px rgba(124,58,237,0.35); white-space: nowrap;
    transition: transform 0.2s, box-shadow 0.2s; flex-shrink: 0; position: relative; z-index: 1;
  }
  .cd-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 7px 24px rgba(124,58,237,0.5); }
  .cd-btn-primary:active { transform: translateY(0); }

  .cd-btn-secondary {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: var(--cream); font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 600;
    padding: 0.55rem 1rem; border-radius: 12px; cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .cd-btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }

  /* ── DRILL-DOWN NAVIGATION BAR (BREADCRUMBS) ── */
  .cd-nav-bar {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: rgba(15,22,41,0.6);
    border: 1px solid var(--card-bdr);
    border-radius: 16px;
    margin-bottom: 1.25rem;
    backdrop-filter: blur(12px);
  }
  .cd-breadcrumbs {
    display: flex; align-items: center; gap: 0.45rem;
    flex-wrap: wrap; font-size: 0.8rem;
  }
  .cd-crumb-link {
    color: var(--muted); cursor: pointer; display: flex; align-items: center; gap: 0.35rem;
    transition: color 0.15s; font-weight: 500; border: none; background: none; padding: 0;
  }
  .cd-crumb-link:hover { color: var(--lavender); }
  .cd-crumb-sep { color: rgba(255,255,255,0.25); font-size: 0.75rem; }
  .cd-crumb-current { color: var(--cyan); font-weight: 700; }

  .cd-back-action-btn {
    display: inline-flex; align-items: center; gap: 0.45rem;
    font-size: 0.75rem; font-weight: 600; color: var(--muted);
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    padding: 0.4rem 0.85rem; border-radius: 10px; cursor: pointer;
    transition: all 0.2s;
  }
  .cd-back-action-btn:hover {
    color: var(--cream); background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.3);
    transform: translateX(-2px);
  }

  /* ── HERO BANNER FOR FOCUSED ENTITY ── */
  .cd-entity-banner {
    background: linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(15,22,41,0.7) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 20px; padding: 1.25rem 1.6rem;
    margin-bottom: 1.25rem;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    flex-wrap: wrap;
  }
  .cd-entity-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.2rem 0.6rem; border-radius: 6px;
    font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25); color: var(--cyan);
    margin-bottom: 0.35rem;
  }
  .cd-entity-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.25rem; font-weight: 700; color: var(--cream);
  }
  .cd-entity-desc {
    font-size: 0.76rem; color: var(--muted); margin-top: 0.2rem; max-width: 650px; line-height: 1.5;
  }
  .cd-entity-actions {
    display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
  }

  /* ── SECTION HEADER ── */
  .cd-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0.85rem; padding: 0 0.25rem; gap: 0.75rem; flex-wrap: wrap;
  }
  .cd-section-title {
    font-size: 0.8rem; font-weight: 700; color: var(--lavender);
    text-transform: uppercase; letter-spacing: 0.05em;
    display: flex; align-items: center; gap: 0.5rem;
  }

  /* ── SQUARE FOLDER CARDS (Image 4 Inspiration) ── */
  .cd-folder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem 1.25rem;
    margin-top: 0.5rem;
  }
  .cd-folder-card {
    position: relative;
    margin-top: 16px;
    background: var(--f-bg);
    border: 1px solid var(--f-bdr);
    border-radius: 0 18px 18px 18px;
    padding: 1.25rem 1.2rem 1.1rem;
    min-height: 175px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
                box-shadow 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
                border-color 0.22s ease;
  }
  .cd-folder-card:hover {
    transform: translateY(-4px);
    border-color: var(--f-accent);
    box-shadow: 0 12px 28px rgba(0,0,0,0.38), 0 0 20px var(--f-glow);
  }
  .cd-folder-tab {
    position: absolute;
    top: -15px;
    left: -1px;
    height: 16px;
    width: 96px;
    border-top: 1px solid var(--f-bdr);
    border-left: 1px solid var(--f-bdr);
    border-right: 1px solid var(--f-bdr);
    border-radius: 10px 14px 0 0;
    clip-path: polygon(0 0, 78% 0, 100% 100%, 0 100%);
    display: flex;
    align-items: center;
    transition: border-color 0.22s ease;
  }
  .cd-folder-card:hover .cd-folder-tab {
    border-color: var(--f-accent);
  }
  .cd-folder-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.01em;
    word-break: break-word;
  }
  .cd-folder-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }
  .cd-folder-action-btn {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .cd-folder-action-btn:hover {
    background: rgba(255,255,255,0.12);
    color: #fff;
    border-color: rgba(255,255,255,0.2);
  }
  .cd-folder-action-btn.delete:hover {
    background: rgba(239,68,68,0.25);
    color: #F87171;
    border-color: rgba(239,68,68,0.4);
  }
  .cd-folder-desc {
    font-size: 0.76rem;
    color: rgba(245,240,232,0.65);
    line-height: 1.45;
    margin: 0.65rem 0 0.85rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .cd-folder-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .cd-folder-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.22rem 0.6rem;
    border-radius: 20px;
    font-size: 0.66rem;
    font-weight: 700;
    border: 1px solid;
    letter-spacing: 0.02em;
  }
  .cd-folder-arrow {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, background 0.2s ease;
    flex-shrink: 0;
  }
  .cd-folder-card:hover .cd-folder-arrow {
    transform: translateX(4px);
    background: rgba(255,255,255,0.12);
  }


  /* Staged Files Multi-Upload Grid */
  .cd-batch-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.65rem;
    padding: 0.65rem 0.85rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .cd-batch-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.6rem;
    border-radius: 9999px;
    background: rgba(0, 212, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.25);
    color: var(--cyan);
    font-size: 0.72rem;
    font-weight: 700;
  }
  .cd-batch-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .cd-batch-add-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }
  .cd-dest-pills {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.15rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .cd-dest-pill-btn {
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 700;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .cd-dest-pill-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  .cd-batch-clear-btn {
    padding: 0.25rem 0.55rem;
    border-radius: 8px;
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #F87171;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .cd-batch-clear-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
  }
  .cd-staged-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.85rem;
    max-height: 440px;
    overflow-y: auto;
    padding: 0.2rem 0.1rem 0.4rem;
  }
  .cd-staged-card {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    position: relative;
    transition: all 0.2s ease;
  }
  .cd-staged-card:hover {
    border-color: rgba(255, 255, 255, 0.22);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  }
  .cd-staged-card.uploading {
    border-color: var(--cyan);
    box-shadow: 0 0 14px rgba(0, 212, 255, 0.25);
  }
  .cd-staged-card.done {
    border-color: #10B981;
    background: rgba(16, 185, 129, 0.08);
  }
  .cd-staged-card.error {
    border-color: #EF4444;
    background: rgba(239, 68, 68, 0.08);
  }
  .cd-file-type-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.18rem 0.45rem;
    border-radius: 6px;
    font-size: 0.64rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .cd-file-type-pill.pdf {
    background: rgba(239, 68, 68, 0.16);
    color: #F87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  .cd-file-type-pill.img {
    background: rgba(245, 158, 11, 0.16);
    color: #FBBF24;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  .cd-staged-remove-btn {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .cd-staged-remove-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #F87171;
    border-color: rgba(239, 68, 68, 0.4);
  }
  .cd-staged-title-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 0.45rem 0.6rem;
    font-size: 0.82rem;
    color: #fff;
    outline: none;
    transition: border-color 0.15s ease;
  }
  .cd-staged-title-input:focus {
    border-color: var(--cyan);
  }
  .cd-dest-chip {
    padding: 0.2rem 0.45rem;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .cd-dest-chip:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }
  .cd-dest-chip.active.shared {
    background: rgba(0, 212, 255, 0.12);
    border-color: rgba(0, 212, 255, 0.35);
    color: var(--cyan);
  }
  .cd-dest-chip.active.student {
    background: rgba(167, 139, 250, 0.15);
    border-color: rgba(167, 139, 250, 0.35);
    color: var(--lavender);
  }
  .cd-dest-chip.active.teacher {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.35);
    color: #FBBF24;
  }
  .cd-protected-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.22rem 0.55rem;
    border-radius: 9999px;
    background: #000000;
    border: 1px solid #22D3EE;
    color: #22D3EE;
    font-size: 0.68rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(34, 211, 238, 0.25);
    transition: all 0.15s ease;
  }
  .cd-protected-pill.unlocked {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.55);
    box-shadow: none;
  }
  .cd-protected-pill:hover {
    transform: scale(1.03);
  }
  .cd-staged-thumbnail {
    width: 100%;
    height: 90px;
    border-radius: 8px;
    overflow: hidden;
    background: #000;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .cd-staged-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Add New Folder Card */
  .cd-folder-add-card {
    border: 2px dashed rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.015);
    border-radius: 18px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 175px;
    transition: all 0.2s ease;
  }
  .cd-folder-add-card:hover {
    border-color: var(--violet);
    background: rgba(124,58,237,0.05);
    transform: translateY(-4px);
  }
  .cd-folder-add-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    color: var(--muted);
  }
  .cd-folder-add-card:hover .cd-folder-add-inner {
    color: var(--lavender);
  }
  .cd-folder-add-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .cd-folder-add-card:hover .cd-folder-add-icon {
    background: rgba(124,58,237,0.2);
    color: #fff;
  }
  .cd-folder-add-label {
    font-size: 0.82rem;
    font-weight: 700;
  }

  /* ── TOPIC STUDIO & MATERIALS ── */
  .cd-materials-header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.85rem;
  }
  .cd-filter-pills {
    display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;
  }
  .cd-filter-pill {
    padding: 0.35rem 0.75rem; border-radius: 20px;
    font-size: 0.7rem; font-weight: 600; cursor: pointer;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    color: var(--muted); transition: all 0.15s ease;
  }
  .cd-filter-pill:hover { color: var(--cream); background: rgba(255,255,255,0.06); }
  .cd-filter-pill.active {
    background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.4);
    color: var(--lavender);
  }

  .cd-content-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem; border-radius: 14px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    margin-bottom: 0.45rem;
  }
  .cd-content-item:hover { border-color: rgba(124,58,237,0.25); background: rgba(124,58,237,0.04); }
  .cd-content-item.cd-dragging {
    opacity: 0.85;
    background: rgba(124,58,237,0.15);
    border-color: rgba(124,58,237,0.4);
    box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(124,58,237,0.2);
  }
  .cd-content-drag-handle {
    display: inline-flex; align-items: center; justify-content: center;
    color: var(--muted); cursor: grab; opacity: 0.45;
    transition: opacity 0.2s, color 0.2s; padding: 2px;
    touch-action: none; flex-shrink: 0;
  }
  .cd-content-drag-handle:hover { opacity: 1; color: var(--lavender); }
  .cd-content-drag-handle:active { cursor: grabbing; }

  .cd-content-icon {
    width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; border: 1px solid;
  }
  .cd-content-icon.note      { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); color: var(--muted); }
  .cd-content-icon.video     { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.3); color: var(--violet-l); }
  .cd-content-icon.animation { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: #6EE7B7; }
  .cd-content-icon.worksheet { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }

  .cd-content-title { flex: 1; min-width: 0; font-size: 0.82rem; font-weight: 600; color: var(--cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .cd-type-badge {
    display: inline-flex; align-items: center; padding: 0.16rem 0.55rem;
    border-radius: 50px; font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid; flex-shrink: 0;
  }
  .cd-type-badge.note      { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color: var(--muted); }
  .cd-type-badge.video     { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.3); color: var(--lavender); }
  .cd-type-badge.animation { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: #6EE7B7; }
  .cd-type-badge.worksheet { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }

  .cd-reorder-saving { font-size: 0.7rem; color: var(--lavender); font-weight: 500; }

  /* ── QUICK UPLOAD CARDS (EMPTY STATE SHORTCUTS) ── */
  .cd-upload-shortcuts {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem; margin-top: 1rem;
  }
  .cd-shortcut-card {
    background: rgba(255,255,255,0.02);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 14px; padding: 1.25rem 1rem;
    display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem;
    cursor: pointer; transition: all 0.2s;
  }
  .cd-shortcut-card:hover {
    background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.4);
    transform: translateY(-2px);
  }
  .cd-shortcut-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .cd-shortcut-title { font-size: 0.8rem; font-weight: 700; color: var(--cream); }
  .cd-shortcut-desc { font-size: 0.68rem; color: var(--muted); }

  /* ── DROPZONES, VIDEO & ANIMATION STYLES ── */
  .cd-dropzone {
    border: 2px dashed rgba(255,255,255,0.12);
    border-radius: 14px; padding: 1.5rem 1rem;
    display: flex; flex-direction: column; align-items: center; gap: 0.65rem;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
    background: rgba(255,255,255,0.02); text-align: center; position: relative;
  }
  .cd-dropzone:hover, .cd-dropzone.drag-over {
    border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.04);
  }
  .cd-dropzone.has-file {
    border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.04);
  }
  .cd-dropzone input[type="file"] {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
  .cd-dropzone-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2);
  }
  .cd-dropzone-icon.green  { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); }
  .cd-dropzone-icon.amber  { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); }
  .cd-dropzone-label { font-size: 0.78rem; font-weight: 600; color: var(--cream); }
  .cd-dropzone-hint  { font-size: 0.68rem; color: var(--muted); }
  .cd-file-name {
    font-size: 0.72rem; font-weight: 600; color: #6EE7B7;
    display: flex; align-items: center; gap: 0.35rem;
  }

  .cd-ws-preview {
    border-radius: 12px; overflow: hidden;
    border: 1px solid rgba(245,158,11,0.25);
    background: rgba(10,14,26,0.6); display: flex; flex-direction: column;
  }
  .cd-ws-preview-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.45rem 0.75rem; background: rgba(245,158,11,0.06);
    border-bottom: 1px solid rgba(245,158,11,0.15);
    font-size: 0.68rem; font-weight: 700; color: #FCD34D;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .cd-ws-preview img {
    width: 100%; max-height: 220px; object-fit: contain; display: block; background: #fff;
  }

  .cd-video-stage {
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 14px; overflow: hidden; background: rgba(10,14,26,0.5);
  }
  .cd-video-stage-header {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.6rem 0.85rem; background: rgba(124,58,237,0.06);
    border-bottom: 1px solid rgba(124,58,237,0.12);
    font-size: 0.68rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .cd-video-progress-bar {
    height: 4px; background: rgba(255,255,255,0.06);
    border-radius: 0 0 4px 4px; overflow: hidden;
  }
  .cd-video-progress-fill {
    height: 100%; background: linear-gradient(90deg, var(--violet), var(--cyan));
    transition: width 0.3s ease;
  }
  .cd-video-stage-body { padding: 0.85rem; }

  .cd-status-row {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.75rem; font-weight: 600; padding: 0.5rem 0;
  }
  .cd-status-row.success { color: #6EE7B7; }
  .cd-status-row.pending { color: var(--amber); }
  .cd-status-row.error   { color: #F87171; }

  .cd-anim-editor-wrap {
    border: 1px solid rgba(16,185,129,0.25); border-radius: 14px;
    overflow: hidden; background: rgba(10,14,26,0.8);
  }
  .cd-anim-editor-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.5rem 0.75rem; background: rgba(16,185,129,0.06);
    border-bottom: 1px solid rgba(16,185,129,0.15);
  }
  .cd-anim-editor-label {
    display: flex; align-items: center; gap: 0.45rem;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: #6EE7B7;
  }
  .cd-anim-preview-btn {
    display: inline-flex; align-items: center; gap: 0.35rem;
    font-size: 0.68rem; font-weight: 600; color: var(--muted);
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; padding: 0.28rem 0.65rem; cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }
  .cd-anim-preview-btn:hover { color: #6EE7B7; border-color: rgba(16,185,129,0.35); background: rgba(16,185,129,0.06); }
  .cd-anim-textarea {
    width: 100%; resize: vertical; min-height: 200px;
    background: transparent; border: none; outline: none;
    color: rgba(245,240,232,0.85);
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 0.75rem; line-height: 1.65; padding: 0.85rem 1rem; tab-size: 2;
  }
  .cd-anim-textarea::placeholder { color: rgba(245,240,232,0.2); }

  .cd-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%; animation: cd-shimmer 1.6s ease infinite; border-radius: 12px;
  }
  @keyframes cd-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .cd-empty {
    display: flex; flex-direction: column; align-items: center; gap: 0.85rem;
    padding: 3rem 1.5rem; border: 1px dashed rgba(124,58,237,0.2);
    border-radius: 20px; background: rgba(124,58,237,0.02); text-align: center;
  }
  .cd-empty-icon {
    width: 50px; height: 50px; border-radius: 16px;
    background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .cd-empty-title { font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; font-weight: 700; color: var(--cream); }
  .cd-empty-desc  { font-size: 0.78rem; color: var(--muted); max-width: 320px; line-height: 1.5; }

  /* ── LIGHT THEME COMPATIBILITY ── */
  html.light .cd-root, .light .cd-root {
    --cream: #0F172A;
    --muted: #475569;
    --card-bg: #FFFFFF;
    --card-bdr: #CBD5E1;
  }
  html.light .cd-folder-card, .light .cd-folder-card {
    box-shadow: 0 4px 14px rgba(0,0,0,0.05);
  }
  html.light .cd-folder-title, .light .cd-folder-title { color: #0F172A !important; }
  html.light .cd-folder-desc, .light .cd-folder-desc { color: #475569; }
  html.light .cd-folder-action-btn, .light .cd-folder-action-btn {
    background: #FFFFFF; border-color: #E2E8F0; color: #475569;
  }
  html.light .cd-folder-action-btn:hover, .light .cd-folder-action-btn:hover {
    background: #F1F5F9; color: #0F172A;
  }
  html.light .cd-folder-add-card, .light .cd-folder-add-card {
    background: #FFFFFF; border-color: #CBD5E1;
  }
  html.light .cd-content-item, .light .cd-content-item {
    background: #FFFFFF; border-color: #CBD5E1;
  }
  html.light .cd-content-item:hover, .light .cd-content-item:hover {
    background: #F1F5F9; border-color: #94A3B8;
  }
  html.light .cd-content-title, .light .cd-content-title { color: #0F172A; }
  html.light .cd-nav-bar, .light .cd-nav-bar {
    background: #F8FAFC; border-color: #CBD5E1;
  }
  html.light .cd-entity-banner, .light .cd-entity-banner {
    background: #FFFFFF; border-color: #CBD5E1;
  }
  html.light .cd-entity-title, .light .cd-entity-title { color: #0F172A; }
  html.light .cd-empty, .light .cd-empty {
    background: #F8FAFC; border-color: #CBD5E1;
  }
  html.light .cd-empty-title, .light .cd-empty-title { color: #0F172A; }
  html.light .cd-shortcut-card, .light .cd-shortcut-card {
    background: #FFFFFF; border-color: #CBD5E1;
  }
  html.light .cd-shortcut-title, .light .cd-shortcut-title { color: #0F172A; }
  html.light .cd-dropzone, .light .cd-dropzone {
    background: #FFFFFF; border-color: #CBD5E1;
  }
  html.light .cd-dropzone-label, .light .cd-dropzone-label { color: #0F172A; }
  html.light .cd-video-stage, .light .cd-video-stage {
    background: #FFFFFF; border-color: #CBD5E1;
  }
  html.light .cd-anim-editor-wrap, .light .cd-anim-editor-wrap {
    background: #FFFFFF; border-color: #CBD5E1;
  }
  html.light .cd-anim-textarea, .light .cd-anim-textarea { color: #0F172A; }
  html.light .cd-skel, .light .cd-skel {
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  }
`;

const CONTENT_ICON = {
  note:      FileText,
  video:     Video,
  animation: Sparkles,
  worksheet: Image,
};

const BLANK_CLASS = { name: '', description: '' };
const BLANK_SUBJECT = { name: '', description: '' };
const BLANK_TOPIC = { name: '', description: '', parent_topic_id: '' };
const BLANK_CONTENT = {
  title: '',
  content_type: 'note',
  destination: 'shared',
  target_tab: 'simulators',
  noteFile: null,
  videoFile: null,
  videoStage: 'idle',
  videoProgress: 0,
  videoContentId: null,
  videoUploadId: null,
  videoPlaybackId: null,
  html_content: '',
  worksheetFile: null,
  worksheetPreviewUrl: null,
  is_premium: false,
  html_part: '',
  css_part: '',
  js_part: '',
  json_part: '',
};

const parseHtmlContent = (fullHtml) => {
  if (!fullHtml) return { html: '', css: '', js: '', json: '' };

  const trimmed = fullHtml.trim();
  const isFullDoc = trimmed.toLowerCase().startsWith('<!doctype') ||
                    trimmed.toLowerCase().startsWith('<html') ||
                    /<(html|head|body)\b/i.test(trimmed);

  if (isFullDoc) {
    let json = '';
    const jsonMatch = trimmed.match(/<script id="animation-data"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonMatch) json = jsonMatch[1].trim();

    const styleMatches = trimmed.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const css = styleMatches.map(tag => {
      const m = tag.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      return m ? m[1].trim() : '';
    }).filter(Boolean).join('\n\n');

    const scriptMatches = trimmed.match(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi) || [];
    const js = scriptMatches.map(tag => {
      if (tag.includes('id="animation-data"') || tag.includes('window.ANIMATION_DATA')) return '';
      const m = tag.match(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/i);
      return m ? m[1].trim() : '';
    }).filter(Boolean).join('\n\n');

    return { html: trimmed, css, js, json };
  }

  let json = '';
  const jsonMatch = fullHtml.match(/<script id="animation-data"[^>]*>([\s\S]*?)<\/script>/i);
  if (jsonMatch) json = jsonMatch[1].trim();

  let cleanHtml = fullHtml
    .replace(/<script id="animation-data"[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<script>\s*try\s*\{\s*window\.ANIMATION_DATA[\s\S]*?<\/script>/gi, '')
    .replace(/<script>\s*window\.ANIMATION_DATA\s*=[\s\S]*?<\/script>/gi, '');

  let css = '';
  const styleMatch = cleanHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) css = styleMatch[1].trim();
  cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  let js = '';
  const scriptMatch = cleanHtml.match(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) js = scriptMatch[1].trim();
  cleanHtml = cleanHtml.replace(/<script(?![^>]*\bsrc\b)[^>]*>[\s\S]*?<\/script>/gi, '');

  let html = '';
  const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const headScripts = [];
    const headMatches = cleanHtml.match(/<(script\b[^>]*\bsrc\b|link\b[^>]*)[^>]*>([\s\S]*?<\/script>)?/gi) || [];
    headMatches.forEach(tag => {
      if (!bodyMatch[0].includes(tag)) headScripts.push(tag);
    });
    html = (headScripts.join('\n') + '\n' + bodyMatch[1]).trim();
  } else {
    html = cleanHtml.trim();
  }
  return { html, css, js, json };
};

const compileHtmlContent = (html, css, js, json) => {
  const jsonStr = json?.trim() || '{}';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
${css}
  </style>
  <script id="animation-data" type="application/json">
${jsonStr}
  </script>
  <script>
    try {
      window.ANIMATION_DATA = JSON.parse(document.getElementById('animation-data').textContent);
    } catch (e) {
      window.ANIMATION_DATA = {};
      console.error("Invalid JSON data provided:", e);
    }
  </script>
</head>
<body>
${html}
  <script>
${js}
  </script>
</body>
</html>`;
};

const getEffectiveHtml = (form) => {
  if (!form) return '';
  const html = form.html_part?.trim() || '';
  const isFullDoc = html.toLowerCase().startsWith('<!doctype') ||
                    html.toLowerCase().startsWith('<html') ||
                    /<(html|head|body)\b/i.test(html);
  if (isFullDoc) return html;
  return compileHtmlContent(form.html_part, form.css_part, form.js_part, form.json_part);
};

function SimulationFolderDropzone({ onParsed }) {
  const [parsing, setParsing] = useState(false);
  const [filesSummary, setFilesSummary] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const processFileList = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setParsing(true);
    setFilesSummary(null);

    let parsedFiles = [];
    try {
      const fileMap = {};
      const zipFile = files.find(f => f.name.toLowerCase().endsWith('.zip'));

      if (zipFile) {
        const zip = await JSZip.loadAsync(zipFile);
        const entries = Object.keys(zip.files).filter(k => !zip.files[k].dir);

        for (const filename of entries) {
          const lowerName = filename.toLowerCase();
          const ext = lowerName.split('.').pop();
          if (!['html', 'htm', 'css', 'js', 'json'].includes(ext)) continue;
          const fileObj = zip.files[filename];
          const text = await fileObj.async('string');
          const basename = filename.split('/').pop().toLowerCase();
          fileMap[basename] = text;
          fileMap[filename.toLowerCase()] = text;
          parsedFiles.push({ name: filename, type: ext.toUpperCase(), size: text.length });
        }
      } else {
        for (const file of files) {
          const ext = file.name.toLowerCase().split('.').pop();
          if (!['html', 'htm', 'css', 'js', 'json'].includes(ext)) continue;
          const text = await file.text();
          const relPath = (file.webkitRelativePath || file.name).toLowerCase();
          const basename = file.name.toLowerCase();
          fileMap[basename] = text;
          fileMap[relPath] = text;
          parsedFiles.push({ name: file.webkitRelativePath || file.name, type: ext.toUpperCase(), size: file.size });
        }
      }

      let htmlEntry = Object.keys(fileMap).find(k => k.endsWith('index.html') || k.endsWith('index.htm'));
      if (!htmlEntry) htmlEntry = Object.keys(fileMap).find(k => k.endsWith('.html') || k.endsWith('.htm'));
      let rawHtml = htmlEntry ? fileMap[htmlEntry] : '';

      if (!rawHtml) {
        toast.error('No HTML file found in the uploaded files.');
        setParsing(false);
        return;
      }

      rawHtml = rawHtml.replace(
        /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*\/?>/gi,
        (match, href) => {
          const key = href.toLowerCase().split('/').pop();
          const css = fileMap[key] || fileMap[href.toLowerCase()];
          if (css) return `<style>\n${css}\n</style>`;
          return match;
        }
      );
      rawHtml = rawHtml.replace(
        /<link\b[^>]*\bhref=["']([^"']+\.css)["'][^>]*\/?>/gi,
        (match, href) => {
          const key = href.toLowerCase().split('/').pop();
          const css = fileMap[key] || fileMap[href.toLowerCase()];
          if (css) return `<style>\n${css}\n</style>`;
          return match;
        }
      );
      rawHtml = rawHtml.replace(
        /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi,
        (match, src) => {
          if (/^https?:\/\//.test(src)) return match;
          const key = src.toLowerCase().split('/').pop();
          const js = fileMap[key] || fileMap[src.toLowerCase()];
          if (js) return `<script>\n${js}\n</script>`;
          return match;
        }
      );

      const extracted = parseHtmlContent(rawHtml);
      onParsed({
        html_part: rawHtml.trim(),
        css_part: extracted.css || '',
        js_part: extracted.js || '',
        json_part: extracted.json || ''
      });

      setFilesSummary({ fileCount: parsedFiles.length, files: parsedFiles });
      toast.success(`Simulation bundle processed! ${parsedFiles.length} file(s) inlined.`);
    } catch (err) {
      toast.error('Error reading simulation bundle: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <input ref={folderInputRef} type="file" webkitdirectory="true" directory="true" multiple style={{ display: 'none' }} onChange={(e) => processFileList(e.target.files)} />
      <input ref={fileInputRef} type="file" multiple accept=".zip,.html,.htm,.css,.js,.json" style={{ display: 'none' }} onChange={(e) => processFileList(e.target.files)} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? 'var(--cyan)' : 'rgba(124, 58, 237, 0.35)'}`,
          borderRadius: '16px',
          background: dragActive ? 'rgba(0, 212, 255, 0.08)' : 'rgba(15, 23, 42, 0.65)',
          padding: '1.4rem 1.25rem',
          textAlign: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        {parsing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0' }}>
            <Loader2 size={26} className="animate-spin" style={{ color: 'var(--cyan)' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>Extracting & compiling simulation files...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lavender)',
            }}>
              <UploadCloud size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>Upload Simulation Folder or ZIP Bundle</div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px', maxWidth: '420px', margin: '4px auto 0' }}>
                Drop a simulation folder, .zip file, or HTML/CSS/JS/JSON files. All code and assets will be auto-inlined.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                style={{
                  padding: '0.55rem 1.1rem', borderRadius: '10px',
                  background: 'rgba(0, 212, 255, 0.12)', border: '1px solid rgba(0, 212, 255, 0.35)',
                  color: 'var(--cyan)', fontSize: '0.8rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer',
                }}
              >
                <FolderPlus size={15} /> Upload Folder
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.55rem 1.1rem', borderRadius: '10px',
                  background: 'rgba(124, 58, 237, 0.18)', border: '1px solid rgba(124, 58, 237, 0.35)',
                  color: 'var(--lavender)', fontSize: '0.8rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer',
                }}
              >
                <FilePlus size={15} /> Upload ZIP / Files
              </button>
            </div>
          </div>
        )}
      </div>

      {filesSummary && (
        <div style={{
          marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                Auto-extracted ${filesSummary.fileCount} file(s)
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px' }}>
                Extracted HTML, CSS, JS, and JSON are populated below.
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--cyan)', background: 'rgba(0, 212, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
            ✓ Ready to preview/save
          </span>
        </div>
      )}
    </div>
  );
}

const ANIM_PLACEHOLDER = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #0A0E1A; display: flex; align-items: center; justify-content: center; height: 100vh; }
  </style>
</head>
<body>
  <!-- your HTML here -->
  <script>
    // your JS here
  </script>
</body>
</html>`;

// ── SQUARE FOLDER CARD COMPONENT (Image 4 Inspiration) ────────────────────────
function FolderCard({
  title,
  description,
  badgeText,
  badgeIcon: BadgeIcon,
  palette,
  index,
  onClick,
  onEdit,
  onDelete,
  onAddSub,
  addSubTitle,
  isTeacher,
  teacherLink,
}) {
  return (
    <div
      className="cd-folder-card group"
      style={{
        '--f-bg': palette.bg,
        '--f-bdr': palette.border,
        '--f-accent': palette.accent,
        '--f-glow': palette.glow,
      }}
      onClick={onClick}
    >
      {/* Folder Tab at Top Left */}
      <div
        className="cd-folder-tab"
        style={{
          background: palette.tabBg,
          borderColor: palette.border,
        }}
      >
        <span style={{ fontSize: '9px', fontWeight: 800, color: palette.accent, letterSpacing: '0.05em', paddingLeft: '8px', lineHeight: '16px' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Top Header of Card Body */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <h3 className="cd-folder-title" style={{ color: palette.text || '#fff' }}>
          {title}
        </h3>

        {/* Action icons */}
        <div className="cd-folder-actions" onClick={(e) => e.stopPropagation()}>
          {!isTeacher ? (
            <>
              {onAddSub && (
                <button
                  type="button"
                  onClick={onAddSub}
                  className="cd-folder-action-btn"
                  title={addSubTitle || 'Add'}
                  style={{ color: palette.accent }}
                >
                  <FolderPlus size={13} />
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="cd-folder-action-btn"
                  title="Edit"
                >
                  <Edit2 size={12} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="cd-folder-action-btn delete"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </>
          ) : teacherLink ? (
            <Link
              to={teacherLink}
              className="cd-folder-action-btn"
              title="View"
              style={{ color: palette.accent }}
            >
              <Eye size={13} />
            </Link>
          ) : null}
        </div>
      </div>

      {/* Description */}
      <p className="cd-folder-desc" style={{ color: palette.descText || 'rgba(255,255,255,0.85)' }}>
        {description || 'No description provided.'}
      </p>

      {/* Footer Row */}
      <div className="cd-folder-footer">
        <span
          className="cd-folder-pill"
          style={{
            background: palette.badgeBg,
            borderColor: palette.border,
            color: palette.badgeColor,
          }}
        >
          {BadgeIcon && <BadgeIcon size={11} />}
          <span>{badgeText}</span>
        </span>

        <div className="cd-folder-arrow" style={{ color: palette.accent }}>
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}

// ── ADD NEW FOLDER CARD (Square Dashed Card) ──────────────────────────────────
function AddFolderCard({ label, onClick }) {
  return (
    <div className="cd-folder-card cd-folder-add-card" onClick={onClick}>
      <div className="cd-folder-add-inner">
        <div className="cd-folder-add-icon">
          <Plus size={22} />
        </div>
        <span className="cd-folder-add-label">{label}</span>
      </div>
    </div>
  );
}

// ── MAIN CURRICULUM DETAIL COMPONENT ───────────────────────────────────────────
export default function CurriculumDetail() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = user?.role === 'teacher';

  const { id } = useParams(); // curriculumId
  const navigate = useNavigate();

  // ── DRILL-DOWN NAVIGATION STATE ─────────────────────────────────────────────
  // Tier 1: selectedClassId = null -> Shows all stages/classes of this curriculum
  // Tier 2: selectedClassId && !selectedSubjectId -> Shows only the selected stage and its subjects
  // Tier 3: selectedClassId && selectedSubjectId && !selectedTopicId -> Shows only the selected subject and its topics
  // Tier 4: selectedClassId && selectedSubjectId && selectedTopicId -> Shows only the selected topic, its subtopics & materials
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Search & Filter state
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all');

  // Modals & Forms
  const [classModal, setClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState(BLANK_CLASS);
  const [deleteClassId, setDeleteClassId] = useState(null);

  const [subjectModal, setSubjectModal] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState(BLANK_SUBJECT);
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);

  const [topicModal, setTopicModal] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm, setTopicForm] = useState(BLANK_TOPIC);
  const [deleteTopicId, setDeleteTopicId] = useState(null);

  const [contentModal, setContentModal] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [contentForm, setContentForm] = useState(BLANK_CONTENT);
  const [batchQueue, setBatchQueue] = useState([]);
  const [uploadingBatch, setUploadingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const batchFileInputRef = useRef(null);
  const [deleteContentId, setDeleteContentId] = useState(null);
  
  const [animTab, setAnimTab] = useState('html');

  // Auto-refresh keys
  const [topicsRefreshKey, setTopicsRefreshKey] = useState(0);
  const [contentRefreshKey, setContentRefreshKey] = useState(0);

  const triggerTopicsRefetch = () => setTopicsRefreshKey(k => k + 1);
  const triggerContentRefetch = () => setContentRefreshKey(k => k + 1);

  // Fetch curriculum & all subjects
  const { data: curriculum, loading, refetch } = useApi(
    () => adminApi.getCurriculum(id), null, [id]
  );
  const { data: allSubjects, refetch: refetchSubjects } = useApi(
    adminApi.getSubjects
  );

  const classes = curriculum?.classes ?? [];
  const subjects = allSubjects ?? [];

  // Active items resolved from drill-down state
  const activeClass = useMemo(() => classes.find(c => c.id === selectedClassId) || null, [classes, selectedClassId]);
  const activeSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId) || null, [subjects, selectedSubjectId]);

  // Fetch topics for currently active subject
  const { data: topicsData, loading: loadingTopics } = useApi(
    () => selectedSubjectId ? adminApi.getTopics(selectedSubjectId) : Promise.resolve({ data: [] }),
    null,
    [selectedSubjectId, topicsRefreshKey]
  );
  const topicsList = useMemo(() => topicsData ?? [], [topicsData]);

  // Active topic resolved from drill-down state
  const activeTopic = useMemo(() => topicsList.find(t => t.id === selectedTopicId) || null, [topicsList, selectedTopicId]);
  const parentTopic = useMemo(() => {
    if (!activeTopic?.parent_topic_id) return null;
    return topicsList.find(t => t.id === activeTopic.parent_topic_id) || null;
  }, [activeTopic, topicsList]);

  // ── Class mutations ──────────────────────────────────────────────────────────
  const { mutate: saveClass, loading: savingClass } = useMutation(
    (data) => editingClass
      ? adminApi.updateClass(editingClass.id, data)
      : adminApi.createClass(id, data),
    {
      onSuccess: () => { setClassModal(false); setEditingClass(null); refetch(); },
      successMsg: editingClass ? 'Class updated' : 'Class created',
    }
  );
  const { mutate: deleteClass } = useMutation(adminApi.deleteClass, {
    onSuccess: () => {
      if (deleteClassId === selectedClassId) {
        setSelectedClassId(null);
        setSelectedSubjectId(null);
        setSelectedTopicId(null);
      }
      setDeleteClassId(null);
      refetch();
    },
    successMsg: 'Class deleted',
  });

  // ── Subject mutations ────────────────────────────────────────────────────────
  const { mutate: saveSubject, loading: savingSubject } = useMutation(
    (data) => editingSubject
      ? adminApi.updateSubject(editingSubject.id, data)
      : adminApi.createSubject(subjectModal, data),
    {
      onSuccess: () => { setSubjectModal(null); setEditingSubject(null); refetchSubjects(); },
      successMsg: editingSubject ? 'Subject updated' : 'Subject created',
    }
  );
  const { mutate: deleteSubject } = useMutation(adminApi.deleteSubject, {
    onSuccess: () => {
      if (deleteSubjectId === selectedSubjectId) {
        setSelectedSubjectId(null);
        setSelectedTopicId(null);
      }
      setDeleteSubjectId(null);
      refetchSubjects();
    },
    successMsg: 'Subject deleted',
  });

  // ── Topic mutations ──────────────────────────────────────────────────────────
  const { mutate: saveTopic, loading: savingTopic } = useMutation(
    (data) => editingTopic
      ? adminApi.updateTopic(editingTopic.id, data)
      : adminApi.createTopic(topicModal, data),
    {
      onSuccess: () => { setTopicModal(null); setEditingTopic(null); triggerTopicsRefetch(); },
      successMsg: editingTopic ? 'Topic updated' : 'Topic created',
    }
  );
  const { mutate: deleteTopic } = useMutation(adminApi.deleteTopic, {
    onSuccess: () => {
      if (deleteTopicId === selectedTopicId) {
        setSelectedTopicId(parentTopic ? parentTopic.id : null);
      }
      setDeleteTopicId(null);
      triggerTopicsRefetch();
    },
    successMsg: 'Topic deleted',
  });

  // ── Content mutations ────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { mutate: deleteContent } = useMutation(adminApi.deleteContent, {
    onSuccess: () => { setDeleteContentId(null); triggerContentRefetch(); },
    successMsg: 'Content deleted',
  });

  // ── Multi-File Batch Queue Handlers ──────────────────────────────────────────
  const handleFilesAdded = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const isNote = contentForm.content_type === 'note';

    const validFiles = files.filter(f => {
      if (isNote) {
        return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      } else {
        return f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(f.name);
      }
    });

    if (validFiles.length === 0) {
      toast.error(isNote ? 'Please select valid PDF files.' : 'Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    const newItems = validFiles.map((f, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
      file: f,
      filename: f.name,
      size: f.size,
      formattedSize: formatFileSize(f.size),
      title: formatTitleFromFilename(f.name),
      destination: contentForm.destination || 'shared',
      is_premium: contentForm.is_premium || false,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      status: 'idle',
      error: null,
    }));

    setBatchQueue(q => [...q, ...newItems]);

    // If single title is blank, fill with first file's clean name
    if (!contentForm.title && newItems.length > 0) {
      setContentForm(cf => ({ ...cf, title: newItems[0].title }));
    }
  };

  const handleUpdateBatchItem = (id, updates) => {
    setBatchQueue(q => q.map(it => it.id === id ? { ...it, ...updates } : it));
  };

  const handleRemoveBatchItem = (id) => {
    setBatchQueue(q => q.filter(it => it.id !== id));
  };

  const handleSetAllDestination = (dest) => {
    setBatchQueue(q => q.map(it => ({ ...it, destination: dest })));
    setContentForm(cf => ({ ...cf, destination: dest }));
  };

  const handleToggleAllPremium = () => {
    const allPremium = batchQueue.length > 0 && batchQueue.every(it => it.is_premium);
    const nextVal = !allPremium;
    setBatchQueue(q => q.map(it => ({ ...it, is_premium: nextVal })));
    setContentForm(cf => ({ ...cf, is_premium: nextVal }));
  };

  const handleSaveContent = async () => {
    setSaveError('');
    const f = contentForm;

    // ── BATCH MULTI-UPLOAD MODE ────────────────────────────────────────────────
    if (!editingContent && (f.content_type === 'note' || f.content_type === 'worksheet') && batchQueue.length > 0) {
      setUploadingBatch(true);
      setBatchProgress({ current: 0, total: batchQueue.length });
      let successCount = 0;
      let hasError = false;

      for (let i = 0; i < batchQueue.length; i++) {
        const item = batchQueue[i];
        if (item.status === 'done') {
          successCount++;
          continue;
        }

        setBatchQueue(q => q.map(it => it.id === item.id ? { ...it, status: 'uploading', error: null } : it));
        setBatchProgress({ current: i + 1, total: batchQueue.length });

        try {
          const itemTitle = (item.title || '').trim() || formatTitleFromFilename(item.filename) || 'Untitled';
          const fd = new FormData();
          fd.append('title', itemTitle);
          fd.append('is_premium', String(!!item.is_premium));
          fd.append('destination', item.destination || 'shared');
          fd.append('file', item.file);

          if (f.content_type === 'note') {
            await adminApi.uploadNote(contentModal, fd);
          } else {
            await adminApi.uploadWorksheet(contentModal, fd);
          }

          setBatchQueue(q => q.map(it => it.id === item.id ? { ...it, status: 'done', error: null } : it));
          successCount++;
        } catch (itemErr) {
          hasError = true;
          const msg = itemErr.response?.data?.message ?? itemErr.message ?? 'Upload failed';
          setBatchQueue(q => q.map(it => it.id === item.id ? { ...it, status: 'error', error: msg } : it));
        }
      }

      setUploadingBatch(false);
      triggerContentRefetch();

      if (!hasError) {
        toast.success(`Successfully uploaded ${successCount} material${successCount !== 1 ? 's' : ''}!`);
        setContentModal(null);
        setEditingContent(null);
        setContentForm(BLANK_CONTENT);
        setBatchQueue([]);
      } else {
        toast.error(`Uploaded ${successCount} files, but some had errors. You can fix and retry.`);
      }
      return;
    }

    // ── SINGLE CONTENT SAVE MODE ──────────────────────────────────────────────
    setSaving(true);
    try {
      if (f.content_type === 'note') {
        if (editingContent) {
          const fd = new FormData();
          fd.append('title', f.title);
          fd.append('is_premium', String(f.is_premium));
          if (f.noteFile) fd.append('file', f.noteFile);
          await adminApi.replaceNote(editingContent.id, fd);
        } else {
          if (!f.noteFile) { setSaveError('Please select a PDF file.'); setSaving(false); return; }
          const fd = new FormData();
          fd.append('title', f.title);
          fd.append('is_premium', String(f.is_premium));
          fd.append('destination', f.destination);
          fd.append('file', f.noteFile);
          await adminApi.uploadNote(contentModal, fd);
        }
      } else if (f.content_type === 'video') {
        if (editingContent) {
          await adminApi.updateContent(editingContent.id, { title: f.title, is_premium: f.is_premium });
        } else {
          if (f.videoStage !== 'done') {
            setSaveError('Please upload a video file first.');
            setSaving(false);
            return;
          }
          await adminApi.updateContent(f.videoContentId, { title: f.title, is_premium: f.is_premium });
        }
      } else if (f.content_type === 'animation') {
        const compiledHtml = getEffectiveHtml(f);
        const isStudyAdventure = f.target_tab === 'notes' || f.target_tab === 'study_adventure';
        let finalHtml = compiledHtml;
        if (isStudyAdventure && !finalHtml.includes('METADATA:target_tab=notes')) {
          finalHtml = `<!-- METADATA:target_tab=notes -->\n` + finalHtml;
        } else if (!isStudyAdventure) {
          finalHtml = finalHtml.replace(/<!--\s*METADATA:target_tab=notes\s*-->\n?/gi, '');
        }

        const animBody = {
          title: f.title,
          html_content: finalHtml,
          is_premium: f.is_premium,
          target_tab: isStudyAdventure ? 'notes' : 'simulators',
          animation_id: editingContent ? editingContent.animation_id : undefined
        };
        const animRes = await adminApi.upsertAnimation(animBody);
        const savedAnim = animRes.data.data;

        const body = {
          title: f.title,
          content_type: 'animation',
          animation_id: savedAnim.id,
          is_premium: f.is_premium,
          destination: f.destination,
          target_tab: isStudyAdventure ? 'notes' : 'simulators',
        };
        if (editingContent) {
          await adminApi.updateContent(editingContent.id, body);
        } else {
          await adminApi.addContent(contentModal, body);
        }
      } else if (f.content_type === 'worksheet') {
        if (editingContent) {
          const fd = new FormData();
          fd.append('title', f.title);
          fd.append('is_premium', String(f.is_premium));
          if (f.worksheetFile) fd.append('file', f.worksheetFile);
          await adminApi.replaceWorksheet(editingContent.id, fd);
        } else {
          if (!f.worksheetFile) { setSaveError('Please select a worksheet image.'); setSaving(false); return; }
          const fd = new FormData();
          fd.append('title', f.title);
          fd.append('is_premium', String(f.is_premium));
          fd.append('destination', f.destination);
          fd.append('file', f.worksheetFile);
          await adminApi.uploadWorksheet(contentModal, fd);
        }
      }

      setContentModal(null);
      setEditingContent(null);
      setContentForm(BLANK_CONTENT);
      setBatchQueue([]);
      triggerContentRefetch();
    } catch (err) {
      setSaveError(err.response?.data?.message ?? err.message ?? 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  // ── Video upload handler ─────────────────────────────────────────────────────
  const handleVideoUpload = async (file) => {
    let currentTitle = contentForm.title.trim();
    if (!currentTitle) {
      currentTitle = formatTitleFromFilename(file.name);
      setContentForm(f => ({ ...f, title: currentTitle }));
    }
    setSaveError('');
    setContentForm(f => ({ ...f, title: currentTitle, videoFile: file, videoStage: 'uploading', videoProgress: 0 }));

    const performDirectUpload = async () => {
      const fd = new FormData();
      fd.append('title', contentForm.title);
      fd.append('is_premium', String(contentForm.is_premium));
      fd.append('destination', contentForm.destination);
      fd.append('file', file);

      const res = await adminApi.uploadVideo(contentModal, fd, (progressEvent) => {
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setContentForm(f => ({ ...f, videoProgress: pct }));
        }
      });
      const data = res.data?.data ?? res.data;
      setContentForm(f => ({
        ...f,
        videoStage: 'done',
        videoContentId: data.id,
        videoPlaybackId: null,
      }));
    };

    try {
      let res;
      try {
        res = await adminApi.createMuxUpload(contentModal, {
          title: contentForm.title,
          is_premium: String(contentForm.is_premium),
          destination: contentForm.destination,
        });
      } catch (muxErr) {
        await performDirectUpload();
        return;
      }

      const { uploadUrl, uploadId, content_id } = res.data;
      setContentForm(f => ({ ...f, videoContentId: content_id, videoUploadId: uploadId }));

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setContentForm(f => ({ ...f, videoProgress: Math.round((e.loaded / e.total) * 100) }));
          }
        };
        xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });

      setContentForm(f => ({ ...f, videoStage: 'confirming', videoProgress: 100 }));
      const confirmRes = await adminApi.confirmMuxUpload(content_id, { upload_id: uploadId });
      const confirmData = confirmRes.data;

      if (confirmData.processing) {
        setContentForm(f => ({ ...f, videoStage: 'confirming' }));
      } else {
        setContentForm(f => ({
          ...f,
          videoStage: 'done',
          videoPlaybackId: confirmData.data?.mux_playback_id,
        }));
      }
    } catch (err) {
      try {
        await performDirectUpload();
      } catch (directErr) {
        setContentForm(f => ({ ...f, videoStage: 'idle', videoProgress: 0 }));
        setSaveError(directErr.response?.data?.message ?? directErr.message ?? 'Video upload failed.');
      }
    }
  };

  // ── Open Helpers ─────────────────────────────────────────────────────────────
  const openCreateClass = () => { setEditingClass(null); setClassForm(BLANK_CLASS); setClassModal(true); };
  const openEditClass = (c) => {
    setEditingClass(c);
    setClassForm({ name: c.name, description: c.description ?? '' });
    setClassModal(true);
  };

  const openCreateSubject = (classId) => { setEditingSubject(null); setSubjectForm(BLANK_SUBJECT); setSubjectModal(classId); };
  const openEditSubject = (s) => {
    setEditingSubject(s);
    setSubjectForm({ name: s.name, description: s.description ?? '' });
    setSubjectModal(s.class_id);
  };

  const openCreateTopic = (subjectId) => { setEditingTopic(null); setTopicForm(BLANK_TOPIC); setTopicModal(subjectId); };
  const openCreateSubtopic = (parent) => {
    setEditingTopic(null);
    setTopicForm({ name: '', description: '', parent_topic_id: parent.id });
    setTopicModal(parent.subject_id);
  };
  const openEditTopic = (t) => {
    setEditingTopic(t);
    setTopicForm({ name: t.name, description: t.description ?? '', parent_topic_id: t.parent_topic_id ?? '' });
    setTopicModal(t.subject_id);
  };

  const openAddContent = (topicId, defaultType = 'note') => {
    setEditingContent(null);
    setContentForm({ ...BLANK_CONTENT, content_type: defaultType });
    setBatchQueue([]);
    setUploadingBatch(false);
    setSaveError('');
    setContentModal(topicId);
  };
  const openEditContent = (topicId, c) => {
    setEditingContent(c);
    setBatchQueue([]);
    setUploadingBatch(false);
    setSaveError('');
    const parsed = parseHtmlContent(c.html_content ?? '');
    setContentForm({
      ...BLANK_CONTENT,
      title: c.title,
      content_type: c.content_type,
      destination: c.destination ?? 'shared',
      target_tab: c.target_tab || 'simulators',
      html_content: c.html_content ?? '',
      is_premium: c.is_premium,
      videoStage: c.content_type === 'video' ? 'done' : 'idle',
      videoPlaybackId: c.mux_playback_id ?? null,
      worksheetPreviewUrl: c.content_type === 'worksheet' ? (c.file_url ?? null) : null,
      html_part: parsed.html,
      css_part: parsed.css,
      js_part: parsed.js,
      json_part: parsed.json
    });
    setContentModal(topicId);
  };

  // ── SKELETON LOADING ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper className="p-6">
        <style>{CSS}</style>
        <div className="cd-root">
          <div className="cd-header" style={{ marginBottom: '1.5rem' }}>
            <div className="cd-hblob cd-hblob-1" /><div className="cd-hblob cd-hblob-2" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
              <div className="cd-skel" style={{ width: 36, height: 36, borderRadius: 12 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div className="cd-skel" style={{ width: 180, height: 20 }} />
                <div className="cd-skel" style={{ width: 80, height: 12 }} />
              </div>
            </div>
          </div>
          <div className="cd-folder-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="cd-skel" style={{ height: 185, borderRadius: 18, marginTop: 16 }} />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!curriculum) return null;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="cd-root">

        {/* ── TOP HEADER (Curriculum Scope) ── */}
        <motion.div
          className="cd-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="cd-hblob cd-hblob-1" /><div className="cd-hblob cd-hblob-2" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', position: 'relative', zIndex: 1 }}>
            <button className="cd-back-btn" onClick={() => navigate(isTeacher ? '/courses' : '/admin/curriculum')} title="Curriculums List">
              <ArrowLeft size={15} />
            </button>
            <div>
              <div className="cd-eyebrow"><span className="cd-eyebrow-dot" /> Curriculum</div>
              <h1 className="cd-title">{curriculum.name}</h1>
              <p className="cd-subtitle">{classes.length} Stage/Class{classes.length !== 1 ? 'es' : ''} assigned</p>
            </div>
          </div>
          {!isTeacher && !selectedClassId && (
            <button className="cd-btn-primary" onClick={openCreateClass}>
              <FolderPlus size={14} /> Add Class
            </button>
          )}
        </motion.div>

        {/* ── DRILL-DOWN BREADCRUMBS BAR (Appears whenever drilling into a stage) ── */}
        {selectedClassId && (
          <motion.div
            className="cd-nav-bar"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="cd-breadcrumbs">
              <button
                className="cd-crumb-link"
                onClick={() => { setSelectedClassId(null); setSelectedSubjectId(null); setSelectedTopicId(null); }}
              >
                <Compass size={13} style={{ color: 'var(--lavender)' }} />
                <span>{curriculum.name}</span>
              </button>

              <span className="cd-crumb-sep"><ChevronRight size={12} /></span>

              <button
                className={clsx('cd-crumb-link', !selectedSubjectId && 'cd-crumb-current')}
                onClick={() => { setSelectedSubjectId(null); setSelectedTopicId(null); }}
              >
                <span>{activeClass?.name || 'Stage'}</span>
              </button>

              {activeSubject && (
                <>
                  <span className="cd-crumb-sep"><ChevronRight size={12} /></span>
                  <button
                    className={clsx('cd-crumb-link', !selectedTopicId && 'cd-crumb-current')}
                    onClick={() => { setSelectedTopicId(null); }}
                  >
                    <span>{activeSubject.name}</span>
                  </button>
                </>
              )}

              {activeTopic && (
                <>
                  {parentTopic && (
                    <>
                      <span className="cd-crumb-sep"><ChevronRight size={12} /></span>
                      <button
                        className="cd-crumb-link"
                        onClick={() => setSelectedTopicId(parentTopic.id)}
                      >
                        <span>{parentTopic.name}</span>
                      </button>
                    </>
                  )}
                  <span className="cd-crumb-sep"><ChevronRight size={12} /></span>
                  <span className="cd-crumb-current">{activeTopic.name}</span>
                </>
              )}
            </div>

            {/* Back action with contextual label */}
            {selectedTopicId ? (
              <button
                className="cd-back-action-btn"
                onClick={() => setSelectedTopicId(parentTopic ? parentTopic.id : null)}
              >
                <ArrowLeft size={13} />
                <span>Back to {parentTopic ? parentTopic.name : activeSubject?.name + ' Topics'}</span>
              </button>
            ) : selectedSubjectId ? (
              <button
                className="cd-back-action-btn"
                onClick={() => setSelectedSubjectId(null)}
              >
                <ArrowLeft size={13} />
                <span>Back to {activeClass?.name} Subjects</span>
              </button>
            ) : (
              <button
                className="cd-back-action-btn"
                onClick={() => setSelectedClassId(null)}
              >
                <ArrowLeft size={13} />
                <span>Back to All Stages</span>
              </button>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TIER 1: ALL STAGES / CLASSES LIST VIEW
            (Rendered as Square Folder-Type Cards inspired by Image 4)
        ══════════════════════════════════════════════════════════════════════ */}
        {!selectedClassId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div className="cd-section-header">
              <span className="cd-section-title">Stages / Classes ({classes.length})</span>
            </div>

            {classes.length === 0 ? (
              <div className="cd-empty">
                <div className="cd-empty-icon"><FolderPlus size={22} style={{ color: 'var(--violet-l)' }} /></div>
                <p className="cd-empty-title">No stages or classes yet</p>
                <p className="cd-empty-desc">Create stages (e.g. Stage 1, Stage 2) under this curriculum.</p>
                {!isTeacher && (
                  <button className="cd-btn-primary" onClick={openCreateClass}><Plus size={14} /> Add Class</button>
                )}
              </div>
            ) : (
              <div className="cd-folder-grid">
                {classes.map((cls, idx) => {
                  const classSubjects = subjects.filter(sub => sub.class_id === cls.id);
                  const palette = CARD_PALETTES[idx % CARD_PALETTES.length];
                  return (
                    <FolderCard
                      key={cls.id}
                      title={cls.name}
                      description={cls.description}
                      badgeText={`${classSubjects.length} Subject${classSubjects.length !== 1 ? 's' : ''}`}
                      badgeIcon={BookOpen}
                      palette={palette}
                      index={idx}
                      onClick={() => setSelectedClassId(cls.id)}
                      onEdit={() => openEditClass(cls)}
                      onDelete={() => setDeleteClassId(cls.id)}
                      isTeacher={isTeacher}
                    />
                  );
                })}

                {!isTeacher && (
                  <AddFolderCard label="Add New Stage" onClick={openCreateClass} />
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TIER 2: SELECTED STAGE'S SUBJECTS VIEW
            (Rendered as Square Folder-Type Cards inspired by Image 4)
        ══════════════════════════════════════════════════════════════════════ */}
        {selectedClassId && !selectedSubjectId && activeClass && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {/* Stage Hero Banner */}
            <div className="cd-entity-banner">
              <div>
                <span className="cd-entity-badge">Active Stage</span>
                <h2 className="cd-entity-title">{activeClass.name}</h2>
                {activeClass.description && <p className="cd-entity-desc">{activeClass.description}</p>}
              </div>

              <div className="cd-entity-actions">
                {!isTeacher && (
                  <>
                    <button className="cd-btn-secondary" onClick={() => openEditClass(activeClass)}>
                      <Edit2 size={13} /> Edit Stage
                    </button>
                    <button className="cd-btn-primary" onClick={() => openCreateSubject(activeClass.id)}>
                      <Plus size={13} /> Add Subject
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* List of Subjects in this Stage */}
            <div className="cd-section-header">
              <span className="cd-section-title">Subjects in {activeClass.name}</span>
            </div>

            {(() => {
              const stageSubjects = subjects.filter(sub => sub.class_id === activeClass.id);
              if (stageSubjects.length === 0) {
                return (
                  <div className="cd-empty">
                    <div className="cd-empty-icon"><BookOpen size={22} style={{ color: 'var(--cyan)' }} /></div>
                    <p className="cd-empty-title">No subjects in {activeClass.name} yet</p>
                    <p className="cd-empty-desc">Add subjects like English, Mathematics, or Science to this stage.</p>
                    {!isTeacher && (
                      <button className="cd-btn-primary" onClick={() => openCreateSubject(activeClass.id)}>
                        <Plus size={14} /> Add First Subject
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="cd-folder-grid">
                  {stageSubjects.map((sub, idx) => {
                    const palette = CARD_PALETTES[idx % CARD_PALETTES.length];
                    return (
                      <FolderCard
                        key={sub.id}
                        title={sub.name}
                        description={sub.description}
                        badgeText="Open Topics"
                        badgeIcon={Layers}
                        palette={palette}
                        index={idx}
                        onClick={() => setSelectedSubjectId(sub.id)}
                        onEdit={() => openEditSubject(sub)}
                        onDelete={() => setDeleteSubjectId(sub.id)}
                        isTeacher={isTeacher}
                      />
                    );
                  })}

                  {!isTeacher && (
                    <AddFolderCard label="Add New Subject" onClick={() => openCreateSubject(activeClass.id)} />
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TIER 3: SELECTED SUBJECT'S TOPICS VIEW
            (Rendered as Square Folder-Type Cards inspired by Image 4)
        ══════════════════════════════════════════════════════════════════════ */}
        {selectedClassId && selectedSubjectId && !selectedTopicId && activeSubject && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {/* Subject Hero Banner */}
            <div className="cd-entity-banner">
              <div>
                <span className="cd-entity-badge">{activeClass?.name} · Subject</span>
                <h2 className="cd-entity-title">{activeSubject.name}</h2>
                {activeSubject.description && <p className="cd-entity-desc">{activeSubject.description}</p>}
              </div>

              <div className="cd-entity-actions">
                {!isTeacher && (
                  <>
                    <button className="cd-btn-secondary" onClick={() => openEditSubject(activeSubject)}>
                      <Edit2 size={13} /> Edit Subject
                    </button>
                    <button className="cd-btn-primary" onClick={() => openCreateTopic(activeSubject.id)}>
                      <Plus size={13} /> Add Topic
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Topics Section & Search Filter */}
            <div className="cd-section-header">
              <span className="cd-section-title">Topics & Chapters ({topicsList.filter(t => !t.parent_topic_id).length})</span>
              {topicsList.length > 3 && (
                <div style={{ position: 'relative', width: 220 }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={topicSearchQuery}
                    onChange={(e) => setTopicSearchQuery(e.target.value)}
                    style={{
                      width: '100%', padding: '0.4rem 0.75rem 0.4rem 2rem',
                      borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)', color: 'var(--cream)',
                      fontSize: '0.75rem', outline: 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {loadingTopics ? (
              <div className="cd-folder-grid">
                {Array(4).fill(0).map((_, i) => <div key={i} className="cd-skel" style={{ height: 185, borderRadius: 18, marginTop: 16 }} />)}
              </div>
            ) : (() => {
              const rootTopics = topicsList.filter(t => !t.parent_topic_id);
              const filteredRoots = rootTopics.filter(t => 
                t.name.toLowerCase().includes(topicSearchQuery.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(topicSearchQuery.toLowerCase()))
              );

              if (filteredRoots.length === 0) {
                return (
                  <div className="cd-empty">
                    <div className="cd-empty-icon"><Layers size={22} style={{ color: 'var(--lavender)' }} /></div>
                    <p className="cd-empty-title">{topicSearchQuery ? 'No matching topics' : 'No topics added yet'}</p>
                    <p className="cd-empty-desc">
                      {topicSearchQuery ? 'Try clearing your search query.' : `Add topics and chapters under ${activeSubject.name}.`}
                    </p>
                    {!isTeacher && !topicSearchQuery && (
                      <button className="cd-btn-primary" onClick={() => openCreateTopic(activeSubject.id)}>
                        <Plus size={14} /> Add First Topic
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="cd-folder-grid">
                  {filteredRoots.map((topic, idx) => {
                    const childTopics = topicsList.filter(t => t.parent_topic_id === topic.id);
                    const palette = CARD_PALETTES[idx % CARD_PALETTES.length];
                    return (
                      <FolderCard
                        key={topic.id}
                        title={topic.name}
                        description={topic.description}
                        badgeText={childTopics.length > 0 ? `${childTopics.length} Subtopic${childTopics.length !== 1 ? 's' : ''}` : 'View Resources'}
                        badgeIcon={childTopics.length > 0 ? Layers : FileText}
                        palette={palette}
                        index={idx}
                        onClick={() => setSelectedTopicId(topic.id)}
                        onEdit={() => openEditTopic(topic)}
                        onDelete={() => setDeleteTopicId(topic.id)}
                        onAddSub={() => openCreateSubtopic(topic)}
                        addSubTitle="Add Subtopic"
                        isTeacher={isTeacher}
                        teacherLink={`/courses/${id}/subjects/${topic.subject_id}/topics/${topic.id}`}
                      />
                    );
                  })}

                  {!isTeacher && !topicSearchQuery && (
                    <AddFolderCard label="Add New Topic" onClick={() => openCreateTopic(activeSubject.id)} />
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TIER 4: SELECTED TOPIC STUDIO VIEW
            (Subtopics also rendered as square folder cards!)
        ══════════════════════════════════════════════════════════════════════ */}
        {selectedClassId && selectedSubjectId && selectedTopicId && activeTopic && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {/* Topic Hero Banner */}
            <div className="cd-entity-banner">
              <div>
                <span className="cd-entity-badge">
                  {parentTopic ? `Subtopic of ${parentTopic.name}` : 'Topic'}
                </span>
                <h2 className="cd-entity-title">{activeTopic.name}</h2>
                {activeTopic.description && <p className="cd-entity-desc">{activeTopic.description}</p>}
              </div>

              <div className="cd-entity-actions">
                {!isTeacher ? (
                  <>
                    <button className="cd-btn-secondary" onClick={() => openCreateSubtopic(activeTopic)}>
                      <FolderPlus size={13} /> Add Subtopic
                    </button>
                    <button className="cd-btn-secondary" onClick={() => openEditTopic(activeTopic)}>
                      <Edit2 size={13} /> Edit Topic
                    </button>
                    <button className="cd-btn-primary" onClick={() => openAddContent(activeTopic.id)}>
                      <Plus size={13} /> Add Material
                    </button>
                  </>
                ) : (
                  <Link
                    to={`/courses/${id}/subjects/${activeTopic.subject_id}/topics/${activeTopic.id}`}
                    className="cd-btn-primary"
                  >
                    <Eye size={13} /> Student View
                  </Link>
                )}
              </div>
            </div>

            {/* Subtopics Section (rendered as Square Folder-Type Cards) */}
            {(() => {
              const childTopics = topicsList.filter(t => t.parent_topic_id === activeTopic.id);
              if (childTopics.length === 0) return null;

              return (
                <div style={{ marginBottom: '1.75rem' }}>
                  <div className="cd-section-header">
                    <span className="cd-section-title">Subtopics ({childTopics.length})</span>
                    {!isTeacher && (
                      <button
                        className="cd-back-action-btn"
                        style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }}
                        onClick={() => openCreateSubtopic(activeTopic)}
                      >
                        <Plus size={11} /> Add Subtopic
                      </button>
                    )}
                  </div>

                  <div className="cd-folder-grid">
                    {childTopics.map((ct, idx) => {
                      const palette = CARD_PALETTES[(idx + 2) % CARD_PALETTES.length];
                      return (
                        <FolderCard
                          key={ct.id}
                          title={ct.name}
                          description={ct.description}
                          badgeText="Subtopic"
                          badgeIcon={Layers}
                          palette={palette}
                          index={idx}
                          onClick={() => setSelectedTopicId(ct.id)}
                          onEdit={() => openEditTopic(ct)}
                          onDelete={() => setDeleteTopicId(ct.id)}
                          isTeacher={isTeacher}
                        />
                      );
                    })}

                    {!isTeacher && (
                      <AddFolderCard label="Add Subtopic" onClick={() => openCreateSubtopic(activeTopic)} />
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Topic Materials Studio */}
            <TopicContentPanel
              topicId={activeTopic.id}
              contentRefreshKey={contentRefreshKey}
              onEditContent={(c) => openEditContent(activeTopic.id, c)}
              onDeleteContent={(cId) => setDeleteContentId(cId)}
              onQuickAdd={(type) => openAddContent(activeTopic.id, type)}
              isTeacher={isTeacher}
              filter={materialFilter}
              onFilterChange={setMaterialFilter}
            />
          </motion.div>
        )}

      </div>

      {/* ── MODALS ── */}

      {/* Class Modal */}
      <Modal open={classModal} onClose={() => { setClassModal(false); setEditingClass(null); }} title={editingClass ? 'Edit Class' : 'New Class'} size="sm" preventOutsideClickClose={true}>
        <div className="space-y-4">
          <Input label="Class Name" placeholder="e.g. Stage 1" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} />
          <Textarea label="Description (optional)" rows={3} value={classForm.description} onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => setClassModal(false)}>Cancel</Button>
          <Button variant="primary" loading={savingClass} onClick={() => saveClass(classForm)}>
            {editingClass ? 'Save Changes' : 'Create Class'}
          </Button>
        </div>
      </Modal>

      {/* Subject Modal */}
      <Modal open={!!subjectModal} onClose={() => { setSubjectModal(null); setEditingSubject(null); }} title={editingSubject ? 'Edit Subject' : 'New Subject'} size="sm" preventOutsideClickClose={true}>
        <div className="space-y-4">
          <Input label="Subject Name" placeholder="e.g. English" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
          <Textarea label="Description (optional)" rows={3} value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => setSubjectModal(null)}>Cancel</Button>
          <Button variant="primary" loading={savingSubject} onClick={() => saveSubject(subjectForm)}>
            {editingSubject ? 'Save Changes' : 'Create Subject'}
          </Button>
        </div>
      </Modal>

      {/* Topic Modal */}
      <Modal open={!!topicModal} onClose={() => { setTopicModal(null); setEditingTopic(null); }} title={editingTopic ? 'Edit Topic' : 'New Topic'} size="sm" preventOutsideClickClose={true}>
        <div className="space-y-4">
          {topicForm.parent_topic_id && (
            <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 600 }}>
              Creating subtopic under parent topic
            </div>
          )}
          <Input label="Topic Name" placeholder="e.g. Reading & Phonics" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} />
          <Textarea label="Description (optional)" rows={3} value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => setTopicModal(null)}>Cancel</Button>
          <Button variant="primary" loading={savingTopic} onClick={() => saveTopic(topicForm)}>
            {editingTopic ? 'Save Changes' : 'Create Topic'}
          </Button>
        </div>
      </Modal>

      {/* Content Modal (Supports Multi-File Batch Staging & Editing) */}
      <Modal
        open={!!contentModal}
        onClose={() => {
          if (uploadingBatch) return;
          setContentModal(null);
          setEditingContent(null);
          setContentForm(BLANK_CONTENT);
          setBatchQueue([]);
          setSaveError('');
        }}
        title={editingContent ? 'Edit Material' : 'Add Materials / Content'}
        size="xl"
        preventOutsideClickClose={true}
      >
        <style>{CSS}</style>
        <div className="cd-root">
          <div className="space-y-4">
            {/* If editing existing single item OR uploading video / animation, show single title input */}
            {(!!editingContent || (contentForm.content_type !== 'note' && contentForm.content_type !== 'worksheet')) && (
              <Input
                label="Title"
                placeholder="e.g. Unit 5: Forces and Magnetism"
                value={contentForm.title}
                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: (!editingContent && (contentForm.content_type === 'note' || contentForm.content_type === 'worksheet')) ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
              <Select
                label="Content Type"
                value={contentForm.content_type}
                onChange={(e) => {
                  setContentForm({
                    ...contentForm,
                    content_type: e.target.value,
                    videoStage: 'idle',
                    noteFile: null,
                    worksheetFile: null,
                    worksheetPreviewUrl: null,
                  });
                  setBatchQueue([]);
                }}
                disabled={uploadingBatch || !!editingContent}
              >
                <option value="note">Note / PDF (Multi-upload supported)</option>
                <option value="worksheet">Worksheet Image (Multi-upload supported)</option>
                <option value="video">Video</option>
                <option value="animation">Animation / 3D Simulation</option>
              </Select>

              {/* Default Audience for new batch or single destination for edit */}
              <Select
                label={!editingContent && (contentForm.content_type === 'note' || contentForm.content_type === 'worksheet') ? 'Default Audience' : 'Destination Audience'}
                value={contentForm.destination}
                onChange={(e) => {
                  const val = e.target.value;
                  setContentForm({ ...contentForm, destination: val });
                  if (batchQueue.length > 0) {
                    handleSetAllDestination(val);
                  }
                }}
                disabled={uploadingBatch || (!!editingContent && contentForm.content_type !== 'note' && contentForm.content_type !== 'worksheet')}
              >
                <option value="shared">Shared Content (Both Student & Teacher)</option>
                <option value="student">Student Content (Student Only)</option>
                <option value="teacher">Teacher Content (Teacher Only)</option>
              </Select>
            </div>

            {/* ── NOTES / PDFS SECTION ── */}
            {contentForm.content_type === 'note' && (
              <div className="space-y-3">
                {editingContent ? (
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>Replace PDF (optional)</p>
                    <NoteDropzone
                      file={contentForm.noteFile}
                      onChange={(file) => {
                        setContentForm({ ...contentForm, noteFile: file });
                        if (!contentForm.title) {
                          setContentForm(f => ({ ...f, title: formatTitleFromFilename(file.name) }));
                        }
                      }}
                      existingName={editingContent ? 'Current PDF file' : null}
                    />
                  </div>
                ) : (
                  <div>
                    <NoteDropzone
                      multiple={true}
                      onFilesSelected={handleFilesAdded}
                      batchCount={batchQueue.length}
                      disabled={uploadingBatch}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── WORKSHEETS SECTION ── */}
            {contentForm.content_type === 'worksheet' && (
              <div className="space-y-3">
                {editingContent ? (
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>Replace Worksheet Image (optional)</p>
                    <WorksheetDropzone
                      file={contentForm.worksheetFile}
                      previewUrl={contentForm.worksheetPreviewUrl || (contentForm.worksheetFile ? URL.createObjectURL(contentForm.worksheetFile) : null)}
                      onChange={(file) => {
                        setContentForm({ ...contentForm, worksheetFile: file, worksheetPreviewUrl: URL.createObjectURL(file) });
                        if (!contentForm.title) {
                          setContentForm(f => ({ ...f, title: formatTitleFromFilename(file.name) }));
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <WorksheetDropzone
                      multiple={true}
                      onFilesSelected={handleFilesAdded}
                      batchCount={batchQueue.length}
                      disabled={uploadingBatch}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── STAGED QUEUE TOOLBAR & CARDS GRID (When files are staged in multi-mode) ── */}
            {!editingContent && (contentForm.content_type === 'note' || contentForm.content_type === 'worksheet') && batchQueue.length > 0 && (
              <div className="space-y-3 pt-1">
                <div className="cd-batch-toolbar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="cd-batch-badge">
                      <Layers size={13} />
                      <span>{batchQueue.length} File{batchQueue.length !== 1 ? 's' : ''} Staged</span>
                    </span>

                    <button
                      type="button"
                      className="cd-batch-add-btn"
                      onClick={() => batchFileInputRef.current?.click()}
                      disabled={uploadingBatch}
                      title="Select more files to add to this batch"
                    >
                      <Plus size={13} /> Add More Files
                    </button>
                    <input
                      ref={batchFileInputRef}
                      type="file"
                      multiple
                      accept={contentForm.content_type === 'note' ? 'application/pdf' : 'image/jpeg,image/png,image/webp'}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files) handleFilesAdded(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </div>

                  {/* Bulk Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 600 }}>Set all:</span>
                    <div className="cd-dest-pills">
                      {[
                        { id: 'shared', label: 'Shared' },
                        { id: 'student', label: 'Student' },
                        { id: 'teacher', label: 'Teacher' },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          className="cd-dest-pill-btn"
                          onClick={() => handleSetAllDestination(d.id)}
                          disabled={uploadingBatch}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="cd-protected-pill"
                      onClick={handleToggleAllPremium}
                      disabled={uploadingBatch}
                      title="Toggle Protected status for all staged files"
                    >
                      <Lock size={11} />
                      <span>Toggle Protected</span>
                    </button>

                    <button
                      type="button"
                      className="cd-batch-clear-btn"
                      onClick={() => setBatchQueue([])}
                      disabled={uploadingBatch}
                      title="Clear all staged files"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Staged Cards Grid */}
                <div className="cd-staged-grid">
                  {batchQueue.map((item) => (
                    <div
                      key={item.id}
                      className={clsx(
                        'cd-staged-card',
                        item.status === 'uploading' && 'uploading',
                        item.status === 'done' && 'done',
                        item.status === 'error' && 'error'
                      )}
                    >
                      {/* Top row: Pill + Size + Remove */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          {contentForm.content_type === 'note' ? (
                            <span className="cd-file-type-pill pdf">
                              <FileText size={11} /> PDF
                            </span>
                          ) : (
                            <span className="cd-file-type-pill img">
                              <Image size={11} /> IMG
                            </span>
                          )}
                          <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 600 }}>
                            {item.formattedSize}
                          </span>
                        </div>

                        {!uploadingBatch && item.status !== 'done' && (
                          <button
                            type="button"
                            className="cd-staged-remove-btn"
                            onClick={() => handleRemoveBatchItem(item.id)}
                            title="Remove file from upload queue"
                          >
                            <X size={13} />
                          </button>
                        )}

                        {item.status === 'done' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>
                            <CheckCircle2 size={13} /> Uploaded
                          </span>
                        )}

                        {item.status === 'uploading' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 700 }}>
                            <Loader2 size={13} className="animate-spin" /> Uploading...
                          </span>
                        )}
                      </div>

                      {/* Worksheet Image Thumbnail Preview */}
                      {item.previewUrl && (
                        <div className="cd-staged-thumbnail">
                          <img src={item.previewUrl} alt={item.filename} />
                        </div>
                      )}

                      {/* Editable Title Input */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.25rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                          Material Title
                        </label>
                        <input
                          type="text"
                          className="cd-staged-title-input"
                          value={item.title}
                          onChange={(e) => handleUpdateBatchItem(item.id, { title: e.target.value })}
                          placeholder="e.g. Animal Sounds and Movement"
                          disabled={uploadingBatch || item.status === 'done'}
                        />
                        <span style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.filename}>
                          Source: {item.filename}
                        </span>
                      </div>

                      {/* Controls row: Audience + Protected badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {/* Audience Chips */}
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                          {[
                            { id: 'shared', label: 'Shared' },
                            { id: 'student', label: 'Student' },
                            { id: 'teacher', label: 'Teacher' },
                          ].map((aud) => (
                            <button
                              key={aud.id}
                              type="button"
                              className={clsx('cd-dest-chip', aud.id, item.destination === aud.id && 'active')}
                              onClick={() => handleUpdateBatchItem(item.id, { destination: aud.id })}
                              disabled={uploadingBatch || item.status === 'done'}
                            >
                              {aud.label}
                            </button>
                          ))}
                        </div>

                        {/* Protected / Premium Toggle Button */}
                        <button
                          type="button"
                          className={clsx('cd-protected-pill', !item.is_premium && 'unlocked')}
                          onClick={() => handleUpdateBatchItem(item.id, { is_premium: !item.is_premium })}
                          disabled={uploadingBatch || item.status === 'done'}
                          title={item.is_premium ? 'Protected (Premium) - click to make Free' : 'Free - click to make Protected'}
                        >
                          <Lock size={11} />
                          <span>{item.is_premium ? 'Protected' : 'Free'}</span>
                        </button>
                      </div>

                      {item.error && (
                        <p style={{ fontSize: '0.68rem', color: '#F87171', background: 'rgba(239,68,68,0.1)', padding: '0.35rem 0.5rem', borderRadius: 6, margin: 0 }}>
                          {item.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── VIDEO SECTION ── */}
            {contentForm.content_type === 'video' && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>Video File</p>
                <VideoUploader
                  editingContent={!!editingContent}
                  stage={contentForm.videoStage}
                  progress={contentForm.videoProgress}
                  playbackId={contentForm.videoPlaybackId}
                  titleReady={!!contentForm.title.trim()}
                  onFileSelected={handleVideoUpload}
                />
              </div>
            )}

            {/* ── ANIMATION SECTION ── */}
            {contentForm.content_type === 'animation' && (
              <div className="space-y-4">
                <Select
                  label="Target Section / Feature Tab"
                  value={contentForm.target_tab}
                  onChange={(e) => setContentForm({ ...contentForm, target_tab: e.target.value })}
                >
                  <option value="simulators">🎮 3D Simulator (Rendered in Lab / Simulations Tab)</option>
                  <option value="notes">📖 Study Adventure / Interactive Story (Rendered in Course Notes Tab)</option>
                </Select>

                <SimulationFolderDropzone
                  onParsed={({ html_part, css_part, js_part, json_part }) => {
                    setContentForm(f => ({
                      ...f,
                      html_part,
                      css_part,
                      js_part,
                      json_part,
                      html_content: html_part
                    }));
                  }}
                />

                <div className="cd-anim-editor-wrap">
                  <div className="cd-anim-editor-toolbar">
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {['html', 'css', 'js', 'json'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={clsx('cd-filter-pill', animTab === t && 'active')}
                          onClick={() => setAnimTab(t)}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="cd-anim-preview-btn"
                      onClick={() => {
                        const html = getEffectiveHtml(contentForm);
                        const win = window.open();
                        win.document.write(html);
                        win.document.close();
                      }}
                    >
                      <Eye size={12} /> Test Simulation
                    </button>
                  </div>
                  <textarea
                    className="cd-anim-textarea"
                    placeholder="Enter code here..."
                    value={
                      animTab === 'html' ? contentForm.html_part :
                      animTab === 'css'  ? contentForm.css_part  :
                      animTab === 'js'   ? contentForm.js_part   : contentForm.json_part
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setContentForm(f => ({
                        ...f,
                        [animTab === 'html' ? 'html_part' : animTab === 'css' ? 'css_part' : animTab === 'js' ? 'js_part' : 'json_part']: val
                      }));
                    }}
                  />
                </div>
              </div>
            )}

            {/* Global Premium Toggle (for single content or edit mode) */}
            {(!!editingContent || (contentForm.content_type !== 'note' && contentForm.content_type !== 'worksheet')) && (
              <div className="pt-2">
                <Toggle
                  label="Premium Content"
                  checked={contentForm.is_premium}
                  onChange={(val) => setContentForm({ ...contentForm, is_premium: val })}
                />
              </div>
            )}

            {saveError && (
              <p style={{ fontSize: '0.75rem', color: '#F87171', background: 'rgba(239,68,68,0.1)', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                {saveError}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
            <Button
              variant="ghost"
              onClick={() => {
                setContentModal(null);
                setEditingContent(null);
                setContentForm(BLANK_CONTENT);
                setBatchQueue([]);
                setUploadingBatch(false);
              }}
              disabled={uploadingBatch}
            >
              Cancel
            </Button>

            {!editingContent && (contentForm.content_type === 'note' || contentForm.content_type === 'worksheet') && batchQueue.length > 0 ? (
              <Button
                variant="primary"
                loading={uploadingBatch}
                onClick={handleSaveContent}
                style={{
                  background: 'linear-gradient(135deg, var(--cyan) 0%, var(--lavender) 100%)',
                  color: '#0A0E1A',
                  fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(0, 212, 255, 0.3)',
                }}
              >
                <UploadCloud size={15} />
                <span>
                  {uploadingBatch
                    ? `Uploading ${batchProgress.current} of ${batchProgress.total}...`
                    : `Upload All (${batchQueue.length} ${contentForm.content_type === 'note' ? 'Notes' : 'Worksheets'})`}
                </span>
              </Button>
            ) : (
              <Button variant="primary" loading={saving} onClick={handleSaveContent}>
                {editingContent ? 'Save Changes' : 'Upload Content'}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* ── CONFIRM DIALOGS ── */}
      <ConfirmDialog
        open={!!deleteClassId}
        onClose={() => setDeleteClassId(null)}
        onConfirm={() => deleteClass(deleteClassId)}
        title="Delete Class"
        message="Are you sure you want to delete this class? All subjects, topics, and materials inside it will be permanently deleted."
        confirmVariant="danger"
      />
      <ConfirmDialog
        open={!!deleteSubjectId}
        onClose={() => setDeleteSubjectId(null)}
        onConfirm={() => deleteSubject(deleteSubjectId)}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? All topics and materials inside it will be permanently deleted."
        confirmVariant="danger"
      />
      <ConfirmDialog
        open={!!deleteTopicId}
        onClose={() => setDeleteTopicId(null)}
        onConfirm={() => deleteTopic(deleteTopicId)}
        title="Delete Topic"
        message="Are you sure you want to delete this topic? All subtopics and materials inside it will be permanently deleted."
        confirmVariant="danger"
      />
      <ConfirmDialog
        open={!!deleteContentId}
        onClose={() => setDeleteContentId(null)}
        onConfirm={() => deleteContent(deleteContentId)}
        title="Delete Content"
        message="Are you sure you want to delete this material?"
        confirmVariant="danger"
      />

    </PageWrapper>
  );
}

// ── SORTABLE CONTENT ITEM (DRAG & DROP) ───────────────────────────────────────
function SortableContentItem({ item, isTeacher, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: isTeacher });

  const style = {
    transform: DndCSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = CONTENT_ICON[item.content_type] ?? FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx('cd-content-item', isDragging && 'cd-dragging')}
    >
      {!isTeacher && (
        <span
          className="cd-content-drag-handle"
          {...attributes}
          {...listeners}
          title="Drag up or down to change sequence"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={13} />
        </span>
      )}
      <div className={`cd-content-icon ${item.content_type}`}><Icon size={14} /></div>
      <p className="cd-content-title">{item.title}</p>
      <span className={`cd-type-badge ${item.content_type}`}>{item.content_type}</span>
      {item.destination && (
        <span 
          className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border"
          style={{
            background: item.destination === 'shared' ? 'rgba(0,212,255,0.06)' : item.destination === 'student' ? 'rgba(124,58,237,0.06)' : 'rgba(245,158,11,0.06)',
            borderColor: item.destination === 'shared' ? 'rgba(0,212,255,0.15)' : item.destination === 'student' ? 'rgba(124,58,237,0.2)' : 'rgba(245,158,11,0.2)',
            color: item.destination === 'shared' ? 'var(--cyan)' : item.destination === 'student' ? 'var(--lavender)' : '#F59E0B',
            fontSize: '8px',
            fontWeight: 800,
            letterSpacing: '0.04em'
          }}
        >
          {item.destination}
        </span>
      )}
      {item.content_type === 'animation' && (
        <span 
          className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border"
          style={{
            background: (item.target_tab === 'notes' || item.target_tab === 'study_adventure' || item.html_content?.includes('target_tab=notes')) ? 'rgba(6,182,212,0.1)' : 'rgba(16,185,129,0.1)',
            borderColor: (item.target_tab === 'notes' || item.target_tab === 'study_adventure' || item.html_content?.includes('target_tab=notes')) ? 'rgba(6,182,212,0.3)' : 'rgba(16,185,129,0.3)',
            color: (item.target_tab === 'notes' || item.target_tab === 'study_adventure' || item.html_content?.includes('target_tab=notes')) ? 'var(--cyan)' : '#10B981',
            fontSize: '8px',
            fontWeight: 800,
            letterSpacing: '0.04em'
          }}
        >
          {(item.target_tab === 'notes' || item.target_tab === 'study_adventure' || item.html_content?.includes('target_tab=notes')) ? '📖 Study Adv' : '🎮 Play Sim'}
        </span>
      )}
      {item.is_premium && <span className="cd-premium-tag" title="Premium"><Lock size={12} color="#FCD34D" /></span>}
      {!isTeacher && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <button onClick={() => onEdit(item)} className="cd-icon-btn edit" style={{ width: 28, height: 28 }} title="Edit"><Edit2 size={12} /></button>
          <button onClick={() => onDelete(item.id)} className="cd-icon-btn delete" style={{ width: 28, height: 28 }} title="Delete"><Trash2 size={12} /></button>
        </div>
      )}
    </div>
  );
}

// ── TOPIC CONTENT PANEL (STUDIO) ──────────────────────────────────────────────
function TopicContentPanel({ topicId, contentRefreshKey, onEditContent, onDeleteContent, onQuickAdd, isTeacher, filter, onFilterChange }) {
  const { data: content, loading } = useApi(
    () => adminApi.getSubjectContent(topicId), null, [topicId, contentRefreshKey]
  );
  const [items, setItems] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (content) setItems(content);
  }, [content]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    setSavingOrder(true);

    try {
      const orderPayload = reordered.map((item, idx) => ({
        id: item.id,
        order_index: idx,
      }));
      await adminApi.reorderContent(topicId, orderPayload);
    } catch (err) {
      toast.error('Failed to update material sequence');
      setItems(items);
    } finally {
      setSavingOrder(false);
    }
  }, [items, topicId]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(c => c.content_type === filter);
  }, [items, filter]);

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div className="cd-materials-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="cd-section-title">
            Materials & Resources ({items.length})
          </span>
          {savingOrder && <span className="cd-reorder-saving">⟳ Saving sequence…</span>}
        </div>

        {items.length > 0 && (
          <div className="cd-filter-pills">
            {[
              { id: 'all', label: 'All' },
              { id: 'animation', label: 'Simulations' },
              { id: 'note', label: 'PDFs' },
              { id: 'video', label: 'Videos' },
              { id: 'worksheet', label: 'Worksheets' },
            ].map(p => (
              <button
                key={p.id}
                className={clsx('cd-filter-pill', filter === p.id && 'active')}
                onClick={() => onFilterChange(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && items.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array(2).fill(0).map((_, i) => <div key={i} className="cd-skel" style={{ height: 50, borderRadius: 14 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="cd-empty">
          <div className="cd-empty-icon"><Sparkles size={22} style={{ color: 'var(--cyan)' }} /></div>
          <p className="cd-empty-title">No materials in this topic yet</p>
          <p className="cd-empty-desc">Choose a resource type below to quickly upload and attach content.</p>

          {!isTeacher && (
            <div className="cd-upload-shortcuts">
              <div className="cd-shortcut-card" onClick={() => onQuickAdd('note')}>
                <div className="cd-shortcut-icon" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--cream)' }}>
                  <FileText size={20} />
                </div>
                <span className="cd-shortcut-title">Upload PDF</span>
                <span className="cd-shortcut-desc">Lesson notes, guides, and readable slides</span>
              </div>

              <div className="cd-shortcut-card" onClick={() => onQuickAdd('animation')}>
                <div className="cd-shortcut-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#6EE7B7' }}>
                  <Sparkles size={20} />
                </div>
                <span className="cd-shortcut-title">3D Simulation</span>
                <span className="cd-shortcut-desc">Interactive HTML labs and study adventures</span>
              </div>

              <div className="cd-shortcut-card" onClick={() => onQuickAdd('video')}>
                <div className="cd-shortcut-icon" style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--lavender)' }}>
                  <Video size={20} />
                </div>
                <span className="cd-shortcut-title">Upload Video</span>
                <span className="cd-shortcut-desc">Video explanations and walk-throughs</span>
              </div>

              <div className="cd-shortcut-card" onClick={() => onQuickAdd('worksheet')}>
                <div className="cd-shortcut-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D' }}>
                  <Image size={20} />
                </div>
                <span className="cd-shortcut-title">Worksheet</span>
                <span className="cd-shortcut-desc">Drawable printable worksheets for students</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredItems.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {filteredItems.map((c) => (
                <SortableContentItem
                  key={c.id}
                  item={c}
                  isTeacher={isTeacher}
                  onEdit={onEditContent}
                  onDelete={onDeleteContent}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ── NOTE DROPZONE (Supports Single & Multi-File Batch) ────────────────────────
function NoteDropzone({ file, onChange, existingName, multiple, onFilesSelected, batchCount, disabled }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    if (multiple && onFilesSelected) {
      onFilesSelected(fileList);
    } else if (onChange) {
      const f = fileList[0];
      if (f?.type === 'application/pdf' || f?.name?.toLowerCase().endsWith('.pdf')) {
        onChange(f);
      }
    }
  };

  return (
    <div
      className={clsx('cd-dropzone', drag && 'drag-over', (file || batchCount > 0) && 'has-file')}
      style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={!!multiple}
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div className={clsx('cd-dropzone-icon', (file || batchCount > 0) && 'green')}>
        {batchCount > 0 || file ? <CheckCircle2 size={18} color="#6EE7B7" /> : <FilePlus size={18} color="var(--violet-l)" />}
      </div>
      {batchCount > 0 ? (
        <>
          <span className="cd-file-name"><CheckCircle2 size={12} /> {batchCount} PDF{batchCount !== 1 ? 's' : ''} staged in list below</span>
          <span className="cd-dropzone-hint">Click or drag more PDFs to add to the batch</span>
        </>
      ) : file ? (
        <span className="cd-file-name"><CheckCircle2 size={12} /> {file.name}</span>
      ) : existingName ? (
        <>
          <span className="cd-dropzone-label">Click or drag to replace</span>
          <span className="cd-dropzone-hint">Current: {existingName} · PDF only · max 20 MB</span>
        </>
      ) : (
        <>
          <span className="cd-dropzone-label">Click or drag PDF files here</span>
          <span className="cd-dropzone-hint">{multiple ? 'Select multiple PDFs at once · Auto-names each from file' : 'PDF only · max 20 MB'}</span>
        </>
      )}
    </div>
  );
}

// ── WORKSHEET DROPZONE (Supports Single & Multi-File Batch) ───────────────────
function WorksheetDropzone({ file, previewUrl, onChange, multiple, onFilesSelected, batchCount, disabled }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    if (multiple && onFilesSelected) {
      onFilesSelected(fileList);
    } else if (onChange) {
      const f = fileList[0];
      if (f && ACCEPTED.includes(f.type)) onChange(f);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div
        className={clsx('cd-dropzone', drag && 'drag-over', (file || batchCount > 0) && 'has-file')}
        style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={!!multiple}
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className={clsx('cd-dropzone-icon', (file || batchCount > 0) ? 'green' : 'amber')}>
          {batchCount > 0 || file ? <CheckCircle2 size={18} color="#6EE7B7" /> : <Image size={18} color="#FCD34D" />}
        </div>
        {batchCount > 0 ? (
          <>
            <span className="cd-file-name"><CheckCircle2 size={12} /> {batchCount} image{batchCount !== 1 ? 's' : ''} staged in list below</span>
            <span className="cd-dropzone-hint">Click or drag more images to add to the batch</span>
          </>
        ) : file ? (
          <span className="cd-file-name"><CheckCircle2 size={12} /> {file.name}</span>
        ) : previewUrl ? (
          <>
            <span className="cd-dropzone-label">Click or drag to replace</span>
            <span className="cd-dropzone-hint">JPG, PNG, WebP · max 10 MB</span>
          </>
        ) : (
          <>
            <span className="cd-dropzone-label">Click or drag worksheet images here</span>
            <span className="cd-dropzone-hint">{multiple ? 'Select multiple images at once · Auto-names each from file' : 'JPG, PNG, WebP · max 10 MB'}</span>
          </>
        )}
      </div>

      {!multiple && previewUrl && (
        <div className="cd-ws-preview">
          <div className="cd-ws-preview-toolbar">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Image size={11} /> Preview</span>
            {file && <span style={{ fontSize: '0.62rem', color: 'rgba(252,211,77,0.6)', fontWeight: 500 }}>New image selected</span>}
          </div>
          <img src={previewUrl} alt="Worksheet preview" />
        </div>
      )}
    </div>
  );
}

// ── VIDEO UPLOADER ────────────────────────────────────────────────────────────
function VideoUploader({ editingContent, stage, progress, playbackId, titleReady, onFileSelected }) {
  const inputRef = useRef(null);

  if (editingContent) {
    return (
      <div className="cd-video-stage">
        <div className="cd-video-stage-header"><Video size={12} /> Existing Video</div>
        <div className="cd-video-stage-body">
          <div className="cd-status-row success">
            <CheckCircle2 size={14} /> Playback ID: {playbackId ?? 'saved'}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
            To replace the video, delete this content item and add a new one.
          </p>
        </div>
      </div>
    );
  }

  if (stage === 'idle') {
    return (
      <div
        className="cd-dropzone"
        onClick={() => { if (!titleReady) return; inputRef.current?.click(); }}
        style={{ cursor: titleReady ? 'pointer' : 'not-allowed', opacity: titleReady ? 1 : 0.5 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files[0]; if (f) onFileSelected(f); }}
        />
        <div className="cd-dropzone-icon"><UploadCloud size={18} color="var(--violet-l)" /></div>
        <span className="cd-dropzone-label">Click to select a video</span>
        <span className="cd-dropzone-hint">
          {titleReady ? 'MP4, MOV, MKV, WebM · max 500 MB' : 'Enter a title first'}
        </span>
      </div>
    );
  }

  if (stage === 'uploading') {
    return (
      <div className="cd-video-stage">
        <div className="cd-video-stage-header"><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Uploading to Mux…</div>
        <div className="cd-video-progress-bar">
          <div className="cd-video-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="cd-video-stage-body">
          <div className="cd-status-row pending"><Loader2 size={13} /> {progress}% uploaded</div>
        </div>
      </div>
    );
  }

  if (stage === 'confirming') {
    return (
      <div className="cd-video-stage">
        <div className="cd-video-stage-header"><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Mux processing…</div>
        <div className="cd-video-progress-bar"><div className="cd-video-progress-fill" style={{ width: '100%', animation: 'pulse 1.5s ease infinite' }} /></div>
        <div className="cd-video-stage-body">
          <div className="cd-status-row pending"><Loader2 size={13} /> Upload complete. Waiting for Mux to assign a playback ID…</div>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
            You can save now — the playback ID will be stored once Mux finishes.
          </p>
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div className="cd-video-stage">
        <div className="cd-video-stage-header" style={{ color: '#6EE7B7', background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.15)' }}>
          <CheckCircle2 size={12} /> Upload complete
        </div>
        <div className="cd-video-stage-body">
          <div className="cd-status-row success"><CheckCircle2 size={14} /> Playback ID: {playbackId}</div>
        </div>
      </div>
    );
  }
  return null;
}
