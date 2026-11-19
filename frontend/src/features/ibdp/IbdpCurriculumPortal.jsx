import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen, FileText, Video, Sparkles, Image as ImageIcon,
  ChevronRight, ChevronDown, Search, LogOut,
  Layers, ExternalLink,
  ArrowLeft, ArrowRight, Home, Star,
  User, Mail, KeyRound, Loader2, X
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { studentApi } from '@/api/services';
import PdfViewerModal from '@/components/shared/PdfViewerModal';
import MuxPlayer from '@mux/mux-player-react';
import toast from 'react-hot-toast';

const SUBJECT_MATERIALS_TOPIC_NAME = 'Subject Materials';

// ── SCOPED CLAYMORPHISM STYLESHEET (IBDP PORTAL ONLY) ────────────────────────
const CLAY_CSS = `
  .ibdp-clay-root {
    --clay-bg: #EEF3FA;
    --clay-canvas: #F4F7FC;
    --clay-surface: #F9FBFF;
    --clay-text: #1E293B;
    --clay-muted: #64748B;
    --clay-blue: #3B82F6;
    font-family: 'Plus Jakarta Sans', 'Quicksand', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--clay-text);
  }

  /* Prevent global dark focus rings inside IBDP Clay Portal */
  .ibdp-clay-root *:focus,
  .ibdp-clay-root *:focus-visible {
    outline: none !important;
    --tw-ring-shadow: 0 0 #0000 !important;
    --tw-ring-offset-shadow: 0 0 #0000 !important;
    --tw-ring-offset-width: 0px !important;
  }

  /* 3D Sculpted White Clay Panel (Auth & Main Containers) */
  .ibdp-clay-panel {
    background: linear-gradient(145deg, #FFFFFF 0%, #F1F6FC 100%);
    border-radius: 32px;
    border: 2px solid rgba(255, 255, 255, 0.9);
    box-shadow:
      16px 20px 40px rgba(148, 163, 184, 0.28),
      -8px -8px 24px rgba(255, 255, 255, 0.92),
      inset 4px 4px 10px rgba(255, 255, 255, 0.96),
      inset -6px -6px 14px rgba(148, 163, 184, 0.22);
  }

  /* Interactive 3D Puffy Clay Card (Subjects, Topics, Materials) */
  .ibdp-clay-card {
    background: linear-gradient(145deg, #FFFFFF 0%, #F2F7FD 100%);
    border-radius: 26px;
    border: 2px solid rgba(255, 255, 255, 0.92);
    box-shadow:
      10px 14px 28px rgba(148, 163, 184, 0.24),
      -6px -6px 18px rgba(255, 255, 255, 0.95),
      inset 3px 3px 8px rgba(255, 255, 255, 0.96),
      inset -5px -5px 12px rgba(148, 163, 184, 0.2);
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease;
  }
  .ibdp-clay-card:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow:
      14px 20px 34px rgba(148, 163, 184, 0.32),
      -8px -8px 22px rgba(255, 255, 255, 1),
      inset 4px 4px 10px rgba(255, 255, 255, 1),
      inset -6px -6px 14px rgba(148, 163, 184, 0.24);
  }
  .ibdp-clay-card:active {
    transform: translateY(-1px) scale(0.99);
  }

  /* Collapsible Grade / Stage Clay Accordion Bar */
  .ibdp-clay-grade-bar {
    background: linear-gradient(145deg, #FFFFFF 0%, #F1F6FD 100%);
    border-radius: 22px;
    border: 2px solid rgba(255, 255, 255, 0.92);
    box-shadow:
      8px 10px 22px rgba(148, 163, 184, 0.22),
      -5px -5px 14px rgba(255, 255, 255, 0.95),
      inset 3px 3px 7px rgba(255, 255, 255, 0.95),
      inset -4px -4px 10px rgba(148, 163, 184, 0.18);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ibdp-clay-grade-bar:hover {
    transform: translateY(-2px);
    box-shadow:
      10px 14px 26px rgba(148, 163, 184, 0.28),
      -6px -6px 16px rgba(255, 255, 255, 1),
      inset 3px 3px 8px rgba(255, 255, 255, 1),
      inset -5px -5px 12px rgba(148, 163, 184, 0.22);
  }
  .ibdp-clay-grade-bar.open {
    background: linear-gradient(145deg, #EBF3FF 0%, #DCEBFE 100%);
    border-color: rgba(255, 255, 255, 0.95);
    box-shadow:
      8px 12px 24px rgba(59, 130, 246, 0.16),
      -5px -5px 14px rgba(255, 255, 255, 0.95),
      inset 3px 3px 8px rgba(255, 255, 255, 0.9),
      inset -4px -4px 10px rgba(59, 130, 246, 0.18);
  }

  /* Pressed / Recessed Clay Input & Address Well */
  .ibdp-clay-well {
    background: #E9EFF8;
    border-radius: 18px;
    border: 1.5px solid rgba(255, 255, 255, 0.78);
    box-shadow:
      inset 4px 4px 9px rgba(148, 163, 184, 0.32),
      inset -4px -4px 9px rgba(255, 255, 255, 0.95);
    transition: box-shadow 0.2s ease, background 0.2s ease;
    overflow: hidden;
  }
  .ibdp-clay-well:focus-within {
    background: #EFF5FC;
    box-shadow:
      inset 5px 5px 11px rgba(148, 163, 184, 0.38),
      inset -5px -5px 11px rgba(255, 255, 255, 1);
  }
  .ibdp-clay-well input,
  .ibdp-clay-well input:focus,
  .ibdp-clay-well input:focus-visible {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    border-radius: 18px !important;
  }
  .ibdp-clay-well input:-webkit-autofill,
  .ibdp-clay-well input:-webkit-autofill:hover,
  .ibdp-clay-well input:-webkit-autofill:focus {
    -webkit-text-fill-color: #0F172A !important;
    -webkit-box-shadow: 0 0 0px 1000px #E9EFF8 inset !important;
    box-shadow: none !important;
    border-radius: 18px !important;
  }

  /* Tactile White Clay Button (High 3D Depth & Contrast) */
  .ibdp-clay-btn {
    background: linear-gradient(145deg, #FFFFFF 0%, #E4EEFB 100%);
    border-radius: 16px;
    border: 1.5px solid #FFFFFF;
    box-shadow:
      6px 9px 18px rgba(100, 116, 139, 0.32),
      -4px -4px 12px rgba(255, 255, 255, 0.98),
      inset 3px 3px 6px #FFFFFF,
      inset -4px -4px 9px rgba(100, 116, 139, 0.28);
    transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ibdp-clay-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      8px 12px 22px rgba(100, 116, 139, 0.38),
      -4px -4px 14px rgba(255, 255, 255, 1),
      inset 3px 3px 7px #FFFFFF,
      inset -4px -4px 10px rgba(59, 130, 246, 0.26);
  }
  .ibdp-clay-btn:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
    box-shadow:
      inset 4px 4px 8px rgba(100, 116, 139, 0.35),
      inset -3px -3px 7px rgba(255, 255, 255, 0.95);
  }

  /* 3D Puffy Blue Primary Clay Button */
  .ibdp-clay-btn-primary {
    background: linear-gradient(145deg, #60A5FA 0%, #2563EB 100%);
    color: #FFFFFF;
    border-radius: 18px;
    border: 1.5px solid rgba(191, 219, 254, 0.55);
    box-shadow:
      8px 12px 24px rgba(37, 99, 235, 0.34),
      -4px -4px 12px rgba(255, 255, 255, 0.8),
      inset 3px 3px 7px rgba(255, 255, 255, 0.48),
      inset -4px -4px 10px rgba(29, 78, 216, 0.55);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ibdp-clay-btn-primary:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.01);
    box-shadow:
      10px 16px 28px rgba(37, 99, 235, 0.42),
      -4px -4px 14px rgba(255, 255, 255, 0.9),
      inset 4px 4px 8px rgba(255, 255, 255, 0.58),
      inset -5px -5px 12px rgba(29, 78, 216, 0.6);
  }
  .ibdp-clay-btn-primary:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
  }

  /* Sidebar Clay Nav Pill */
  .ibdp-clay-nav-item {
    border-radius: 18px;
    border: 1.5px solid transparent;
    background: transparent;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ibdp-clay-nav-item:hover {
    background: rgba(255, 255, 255, 0.78);
    box-shadow:
      5px 7px 14px rgba(148, 163, 184, 0.16),
      inset 2px 2px 5px rgba(255, 255, 255, 0.9),
      inset -2px -2px 6px rgba(148, 163, 184, 0.14);
  }
  .ibdp-clay-nav-item.active {
    background: linear-gradient(145deg, #E8F2FF 0%, #D3E6FE 100%);
    border-color: rgba(255, 255, 255, 0.92);
    box-shadow:
      6px 9px 18px rgba(59, 130, 246, 0.2),
      -3px -3px 10px rgba(255, 255, 255, 0.9),
      inset 3px 3px 6px rgba(255, 255, 255, 0.88),
      inset -3px -3px 8px rgba(59, 130, 246, 0.22);
  }

  /* 3D Clay Icon Bubble */
  .ibdp-clay-bubble {
    border-radius: 16px;
    box-shadow:
      5px 7px 14px rgba(148, 163, 184, 0.22),
      -3px -3px 8px rgba(255, 255, 255, 0.9),
      inset 2px 2px 5px rgba(255, 255, 255, 0.85),
      inset -3px -3px 6px rgba(148, 163, 184, 0.22);
  }

  /* Enhanced 3D Study Folder Card */
  .ibdp-clay-folder-card {
    transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s ease, border-color 0.28s ease;
  }
  .ibdp-clay-folder-card:hover {
    transform: translateY(-6px) scale(1.02);
  }
  .ibdp-clay-folder-card .ibdp-folder-papers {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ibdp-clay-folder-card:hover .ibdp-folder-papers {
    transform: translateY(-5px);
  }
  .ibdp-clay-folder-card .ibdp-folder-badge {
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ibdp-clay-folder-card:hover .ibdp-folder-badge {
    transform: scale(1.18) rotate(-6deg);
  }
  .ibdp-clay-folder-card .ibdp-folder-arrow {
    transition: transform 0.22s ease, opacity 0.22s ease, background 0.22s ease;
    opacity: 0.7;
  }
  .ibdp-clay-folder-card:hover .ibdp-folder-arrow {
    transform: translateX(4px);
    opacity: 1;
  }
`;

// ── Custom 3D Clay Folder SVGs ───────────────────────────────────────────────
function YellowHeaderFolder({ size = 62 }) {
  return (
    <svg width={size} height={Math.round(size * 0.86)} viewBox="0 0 64 55" fill="none" style={{ filter: 'drop-shadow(6px 10px 14px rgba(245, 158, 11, 0.28))' }}>
      <path
        d="M4 11C4 7.13401 7.13401 4 11 4H24.3431C25.9344 4 27.4606 4.63214 28.5858 5.75736L32.8284 10H53C56.866 10 60 13.134 60 17V44C60 47.866 56.866 51 53 51H11C7.13401 51 4 47.866 4 44V11Z"
        fill="url(#clayYellowBack)"
      />
      <rect x="4" y="15" width="56" height="36" rx="10" fill="url(#clayYellowFront)" />
      <rect x="5" y="16" width="54" height="34" rx="9" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.5" />
      <defs>
        <linearGradient id="clayYellowBack" x1="32" y1="4" x2="32" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCD34D" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="clayYellowFront" x1="16" y1="15" x2="48" y2="51" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF08A" />
          <stop offset="0.55" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SmallFolderIcon({ color = 'blue', size = 26 }) {
  const palettes = {
    blue:   { back: '#60A5FA', frontTop: '#BFDBFE', frontMid: '#60A5FA', frontBot: '#2563EB', shadow: 'rgba(37, 99, 235, 0.28)' },
    green:  { back: '#34D399', frontTop: '#A7F3D0', frontMid: '#34D399', frontBot: '#059669', shadow: 'rgba(16, 185, 129, 0.28)' },
    purple: { back: '#A78BFA', frontTop: '#DDD6FE', frontMid: '#A78BFA', frontBot: '#7C3AED', shadow: 'rgba(124, 58, 237, 0.28)' },
    amber:  { back: '#FBBF24', frontTop: '#FEF08A', frontMid: '#FBBF24', frontBot: '#D97706', shadow: 'rgba(217, 119, 6, 0.28)' },
    rose:   { back: '#FB7185', frontTop: '#FECDD3', frontMid: '#FB7185', frontBot: '#E11D48', shadow: 'rgba(225, 29, 72, 0.28)' },
  };
  const p = palettes[color] || palettes.blue;
  const uid = `clay-smf-${color}`;
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 28 24" fill="none" style={{ flexShrink: 0, filter: `drop-shadow(3px 5px 7px ${p.shadow})` }}>
      <path
        d="M2 5C2 3.34315 3.34315 2 5 2H10.6C11.3 2 11.97 2.28 12.46 2.77L14.2 4.5H23C24.6569 4.5 26 5.84315 26 7.5V19C26 20.6569 24.6569 22 23 22H5C3.34315 22 2 20.6569 2 19V5Z"
        fill={p.back}
      />
      <rect x="2" y="6.8" width="24" height="15.2" rx="4.5" fill={`url(#${uid})`} />
      <rect x="2.6" y="7.4" width="22.8" height="14" rx="4" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.9" />
      <defs>
        <linearGradient id={uid} x1="6" y1="6.8" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor={p.frontTop} />
          <stop offset="0.5" stopColor={p.frontMid} />
          <stop offset="1" stopColor={p.frontBot} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Smart Topic Study Meta (Multiple Styles & Unique Study Emojis) ────────────
function getTopicStudyMeta(topicName = '', index = 0) {
  const name = String(topicName || '').trim();
  const lower = name.toLowerCase();

  // 1. Past Papers / Exam Archives / Year papers / Test series / Mocks
  if (lower.includes('past') || lower.includes('year') || lower.includes('exam') || lower.includes('paper') || lower.includes('test') || lower.includes('mock')) {
    return {
      uid: 'past-papers',
      emoji: '📜',
      tag: 'Past Papers',
      theme: 'sapphire',
      folderStyle: 'archive',
      accent: '#2563EB',
      gradient: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 55%, #1D4ED8 100%)',
      backFill: '#3B82F6',
      frontTop: '#BFDBFE',
      frontMid: '#60A5FA',
      frontBot: '#1D4ED8',
      lightBg: 'rgba(37, 99, 235, 0.09)',
      shadow: 'rgba(37, 99, 235, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #DBEAFE 100%)',
      badgeBorder: '#93C5FD',
      badgeColor: '#1E40AF',
    };
  }

  // 2. Conceptual Ladder / Concepts / Foundations / Core Theory / Principles
  if (lower.includes('ladder') || lower.includes('concept') || lower.includes('foundation') || lower.includes('core') || lower.includes('intro') || lower.includes('principle')) {
    return {
      uid: 'concept-ladder',
      emoji: '🪜',
      tag: 'Concept Ladder',
      theme: 'emerald',
      folderStyle: 'stepped',
      accent: '#059669',
      gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 55%, #059669 100%)',
      backFill: '#10B981',
      frontTop: '#A7F3D0',
      frontMid: '#34D399',
      frontBot: '#047857',
      lightBg: 'rgba(16, 185, 129, 0.09)',
      shadow: 'rgba(16, 185, 129, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #D1FAE5 100%)',
      badgeBorder: '#6EE7B7',
      badgeColor: '#065F46',
    };
  }

  // 3. Homework / Assignment / Problem Sets / Tasks / HW Questions
  if (lower.includes('hw') || lower.includes('homework') || lower.includes('assignment') || lower.includes('task') || lower.includes('exercise') || lower.includes('worksheet') || lower.includes('problem')) {
    return {
      uid: 'hw-questions',
      emoji: '✍️',
      tag: 'HW Questions',
      theme: 'violet',
      folderStyle: 'binder',
      accent: '#7C3AED',
      gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 55%, #6D28D9 100%)',
      backFill: '#8B5CF6',
      frontTop: '#DDD6FE',
      frontMid: '#A78BFA',
      frontBot: '#6D28D9',
      lightBg: 'rgba(124, 58, 237, 0.09)',
      shadow: 'rgba(124, 58, 237, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #EDE9FE 100%)',
      badgeBorder: '#C4B5FD',
      badgeColor: '#5B21B6',
    };
  }

  // 4. Models / 3D Simulations / Visuals / Geometry / Physics Structures
  if (lower.includes('model') || lower.includes('simulation') || lower.includes('3d') || lower.includes('diagram') || lower.includes('structure') || lower.includes('visual')) {
    return {
      uid: 'models-3d',
      emoji: '🧊',
      tag: '3D Models',
      theme: 'amber',
      folderStyle: 'technical',
      accent: '#D97706',
      gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 55%, #D97706 100%)',
      backFill: '#F59E0B',
      frontTop: '#FEF08A',
      frontMid: '#FBBF24',
      frontBot: '#B45309',
      lightBg: 'rgba(217, 119, 6, 0.09)',
      shadow: 'rgba(217, 119, 6, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%)',
      badgeBorder: '#FDE68A',
      badgeColor: '#92400E',
    };
  }

  // 5. IBDP Style Practice / Drills / Target / Exam Practice / Scoring
  if (lower.includes('practice') || lower.includes('drill') || lower.includes('style') || lower.includes('target') || lower.includes('mastery') || lower.includes('ibdp')) {
    return {
      uid: 'ibdp-practice',
      emoji: '🎯',
      tag: 'IBDP Practice',
      theme: 'rose',
      folderStyle: 'target',
      accent: '#E11D48',
      gradient: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 55%, #BE123C 100%)',
      backFill: '#F43F5E',
      frontTop: '#FECDD3',
      frontMid: '#FB7185',
      frontBot: '#9F1239',
      lightBg: 'rgba(225, 29, 72, 0.09)',
      shadow: 'rgba(225, 29, 72, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #FFE4E6 100%)',
      badgeBorder: '#FDA4AF',
      badgeColor: '#9F1239',
    };
  }

  // 6. Formulas / Equations / Mathematics / Data Booklet
  if (lower.includes('formula') || lower.includes('equation') || lower.includes('math') || lower.includes('data booklet') || lower.includes('calc')) {
    return {
      uid: 'formulas-data',
      emoji: '🔢',
      tag: 'Formulas & Data',
      theme: 'cyan',
      folderStyle: 'technical',
      accent: '#0891B2',
      gradient: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 55%, #0284C7 100%)',
      backFill: '#0EA5E9',
      frontTop: '#BAE6FD',
      frontMid: '#38BDF8',
      frontBot: '#0369A1',
      lightBg: 'rgba(14, 165, 233, 0.09)',
      shadow: 'rgba(14, 165, 233, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #E0F2FE 100%)',
      badgeBorder: '#BAE6FD',
      badgeColor: '#0369A1',
    };
  }

  // 7. Lab / Practical / Experiments / Internal Assessment (IA)
  if (lower.includes('lab') || lower.includes('practical') || lower.includes('experiment') || lower.includes('investigation') || lower.includes('ia') || lower.includes('assessment')) {
    return {
      uid: 'lab-ia',
      emoji: '🧪',
      tag: 'Lab & IA',
      theme: 'teal',
      folderStyle: 'archive',
      accent: '#0D9488',
      gradient: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 55%, #0F766E 100%)',
      backFill: '#14B8A6',
      frontTop: '#99F6E4',
      frontMid: '#2DD4BF',
      frontBot: '#115E59',
      lightBg: 'rgba(20, 184, 166, 0.09)',
      shadow: 'rgba(20, 184, 166, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #CCFBF1 100%)',
      badgeBorder: '#99F6E4',
      badgeColor: '#115E59',
    };
  }

  // 8. Revision / Summary / Cheatsheet / Quick review
  if (lower.includes('revision') || lower.includes('summary') || lower.includes('cheat') || lower.includes('review') || lower.includes('flash') || lower.includes('quick')) {
    return {
      uid: 'revision-summary',
      emoji: '⚡',
      tag: 'Quick Revision',
      theme: 'orange',
      folderStyle: 'stepped',
      accent: '#EA580C',
      gradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 55%, #C2410C 100%)',
      backFill: '#F97316',
      frontTop: '#FED7AA',
      frontMid: '#FB923C',
      frontBot: '#9A3412',
      lightBg: 'rgba(234, 88, 12, 0.09)',
      shadow: 'rgba(234, 88, 12, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #FFEDD5 100%)',
      badgeBorder: '#FED7AA',
      badgeColor: '#9A3412',
    };
  }

  // 9. Notes / Lectures / Slides / Reading / Textbook / Guide
  if (lower.includes('note') || lower.includes('lecture') || lower.includes('slide') || lower.includes('read') || lower.includes('textbook') || lower.includes('guide') || lower.includes('book')) {
    return {
      uid: 'study-notes',
      emoji: '📚',
      tag: 'Study Notes',
      theme: 'indigo',
      folderStyle: 'binder',
      accent: '#4F46E5',
      gradient: 'linear-gradient(135deg, #818CF8 0%, #6366F1 55%, #4338CA 100%)',
      backFill: '#6366F1',
      frontTop: '#C7D2FE',
      frontMid: '#818CF8',
      frontBot: '#3730A3',
      lightBg: 'rgba(99, 102, 241, 0.09)',
      shadow: 'rgba(99, 102, 241, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #E0E7FF 100%)',
      badgeBorder: '#C7D2FE',
      badgeColor: '#3730A3',
    };
  }

  // 10. Question Bank / Quiz / MCQs / Topical Questions
  if (lower.includes('bank') || lower.includes('mcq') || lower.includes('quiz') || lower.includes('topical')) {
    return {
      uid: 'question-bank',
      emoji: '🧠',
      tag: 'Question Bank',
      theme: 'purple',
      folderStyle: 'target',
      accent: '#9333EA',
      gradient: 'linear-gradient(135deg, #C084FC 0%, #A855F7 55%, #7E22CE 100%)',
      backFill: '#A855F7',
      frontTop: '#E9D5FF',
      frontMid: '#C084FC',
      frontBot: '#6B21A8',
      lightBg: 'rgba(168, 85, 247, 0.09)',
      shadow: 'rgba(168, 85, 247, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #F3E8FF 100%)',
      badgeBorder: '#E9D5FF',
      badgeColor: '#6B21A8',
    };
  }

  // Curated diverse study styles rotation (for multiple folders when names are generic)
  const rotating = [
    {
      uid: `topic-rot-${index}-1`,
      emoji: '💡',
      tag: 'Core Concept',
      theme: 'amber',
      folderStyle: 'stepped',
      accent: '#F59E0B',
      gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 55%, #D97706 100%)',
      backFill: '#F59E0B',
      frontTop: '#FEF08A',
      frontMid: '#FBBF24',
      frontBot: '#B45309',
      lightBg: 'rgba(245, 158, 11, 0.09)',
      shadow: 'rgba(245, 158, 11, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%)',
      badgeBorder: '#FDE68A',
      badgeColor: '#92400E',
    },
    {
      uid: `topic-rot-${index}-2`,
      emoji: '🔬',
      tag: 'Investigation',
      theme: 'emerald',
      folderStyle: 'technical',
      accent: '#10B981',
      gradient: 'linear-gradient(135deg, #6EE7B7 0%, #10B981 55%, #047857 100%)',
      backFill: '#10B981',
      frontTop: '#A7F3D0',
      frontMid: '#34D399',
      frontBot: '#065F46',
      lightBg: 'rgba(16, 185, 129, 0.09)',
      shadow: 'rgba(16, 185, 129, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #D1FAE5 100%)',
      badgeBorder: '#A7F3D0',
      badgeColor: '#065F46',
    },
    {
      uid: `topic-rot-${index}-3`,
      emoji: '📐',
      tag: 'Application',
      theme: 'sapphire',
      folderStyle: 'archive',
      accent: '#3B82F6',
      gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 55%, #1D4ED8 100%)',
      backFill: '#3B82F6',
      frontTop: '#BFDBFE',
      frontMid: '#60A5FA',
      frontBot: '#1E40AF',
      lightBg: 'rgba(59, 130, 246, 0.09)',
      shadow: 'rgba(59, 130, 246, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #DBEAFE 100%)',
      badgeBorder: '#BFDBFE',
      badgeColor: '#1E40AF',
    },
    {
      uid: `topic-rot-${index}-4`,
      emoji: '🏆',
      tag: 'Key Mastery',
      theme: 'rose',
      folderStyle: 'target',
      accent: '#F43F5E',
      gradient: 'linear-gradient(135deg, #FDA4AF 0%, #F43F5E 55%, #BE123C 100%)',
      backFill: '#F43F5E',
      frontTop: '#FECDD3',
      frontMid: '#FB7185',
      frontBot: '#9F1239',
      lightBg: 'rgba(244, 63, 94, 0.09)',
      shadow: 'rgba(244, 63, 94, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #FFE4E6 100%)',
      badgeBorder: '#FECDD3',
      badgeColor: '#9F1239',
    },
    {
      uid: `topic-rot-${index}-5`,
      emoji: '🧩',
      tag: 'Problem Solving',
      theme: 'violet',
      folderStyle: 'binder',
      accent: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 55%, #6D28D9 100%)',
      backFill: '#8B5CF6',
      frontTop: '#DDD6FE',
      frontMid: '#A78BFA',
      frontBot: '#5B21B6',
      lightBg: 'rgba(139, 92, 246, 0.09)',
      shadow: 'rgba(139, 92, 246, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #EDE9FE 100%)',
      badgeBorder: '#DDD6FE',
      badgeColor: '#5B21B6',
    },
    {
      uid: `topic-rot-${index}-6`,
      emoji: '📖',
      tag: 'Theory Guide',
      theme: 'cyan',
      folderStyle: 'stepped',
      accent: '#06B6D4',
      gradient: 'linear-gradient(135deg, #67E8F9 0%, #06B6D4 55%, #0E7490 100%)',
      backFill: '#06B6D4',
      frontTop: '#CFFAFE',
      frontMid: '#67E8F9',
      frontBot: '#155E75',
      lightBg: 'rgba(6, 182, 212, 0.09)',
      shadow: 'rgba(6, 182, 212, 0.28)',
      badgeBg: 'linear-gradient(135deg, #FFFFFF 0%, #CFFAFE 100%)',
      badgeBorder: '#A5F3FC',
      badgeColor: '#155E75',
    },
  ];

  return rotating[index % rotating.length];
}

// ── Multi-Style 3D Clay Topic Folder Component ────────────────────────────────
function TopicClayFolder({ meta, size = 62, className = '' }) {
  const width = Math.round(size * 1.16);
  const height = size;
  const uid = meta.uid || 'folder';

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        flexShrink: 0,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 76 64"
        fill="none"
        style={{
          filter: `drop-shadow(4px 8px 14px ${meta.shadow})`,
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id={`bgFront-${uid}`} x1="10" y1="20" x2="66" y2="62" gradientUnits="userSpaceOnUse">
            <stop stopColor={meta.frontTop} />
            <stop offset="0.5" stopColor={meta.frontMid} />
            <stop offset="1" stopColor={meta.frontBot} />
          </linearGradient>
          <linearGradient id={`bgBack-${uid}`} x1="38" y1="6" x2="38" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor={meta.frontMid} />
            <stop offset="1" stopColor={meta.backFill} />
          </linearGradient>
        </defs>

        {/* Folder Back Tab */}
        <path
          d="M6 14C6 9.58 9.58 6 14 6H29C30.6 6 32.1 6.64 33.2 7.78L36.8 12H62C66.42 12 70 15.58 70 20V52C70 56.42 66.42 60 62 60H14C9.58 60 6 56.42 6 52V14Z"
          fill={`url(#bgBack-${uid})`}
        />

        {/* Peeking Lined Study Papers (Layer 1 - Tilted) */}
        <g className="ibdp-folder-papers">
          <rect
            x="17"
            y="7"
            width="44"
            height="32"
            rx="3.5"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1"
            transform="rotate(-3.5 39 23)"
          />
          <line x1="22" y1="13" x2="48" y2="13" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" transform="rotate(-3.5 39 23)" />
          <line x1="22" y1="17" x2="45" y2="17" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" transform="rotate(-3.5 39 23)" />
          <line x1="22" y1="21" x2="52" y2="21" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" transform="rotate(-3.5 39 23)" />

          {/* Peeking Study Paper (Layer 2 - Crisp Front Sheet with Style Details) */}
          <rect x="23" y="9" width="43" height="30" rx="3.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <line x1="27" y1="15" x2="52" y2="15" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="27" y1="19" x2="48" y2="19" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />

          {meta.folderStyle === 'archive' && (
            <g>
              <circle cx="58" cy="18" r="4.2" fill="#EF4444" fillOpacity="0.85" />
              <path d="M56 18L57.5 19.5L60.2 16.5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          {meta.folderStyle === 'stepped' && (
            <g>
              <line x1="27" y1="15" x2="44" y2="15" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="27" y1="19" x2="38" y2="19" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          )}

          {meta.folderStyle === 'binder' && (
            <g>
              <rect x="25" y="5" width="5.5" height="12" rx="2" fill="#94A3B8" />
              <rect x="26.2" y="6" width="3" height="9" rx="1" fill="#CBD5E1" />
            </g>
          )}

          {meta.folderStyle === 'technical' && (
            <g>
              <line x1="27" y1="15" x2="57" y2="15" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="27" y1="19" x2="50" y2="19" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          )}

          {meta.folderStyle === 'target' && (
            <g>
              <circle cx="58" cy="18" r="4.5" fill="#F43F5E" fillOpacity="0.9" />
              <circle cx="58" cy="18" r="2.2" fill="#FFFFFF" />
            </g>
          )}
        </g>

        {/* Front Clay Folder Flap */}
        <path
          d="M6 26C16 23.5 28 21.5 38 21.5C48 21.5 60 23.5 70 26V52C70 56.42 66.42 60 62 60H14C9.58 60 6 56.42 6 52V26Z"
          fill={`url(#bgFront-${uid})`}
        />
        {/* Specular Edge Highlight on Clay Flap */}
        <path
          d="M7.5 27.2C17 25 28.5 23 38 23C47.5 23 59 25 68.5 27.2V51.5C68.5 55 65.5 58.5 61.5 58.5H14.5C10.5 58.5 7.5 55 7.5 51.5V27.2Z"
          stroke="#FFFFFF"
          strokeOpacity="0.65"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Style-specific front cover accents */}
        {meta.folderStyle === 'archive' && (
          <g>
            <circle cx="11" cy="36" r="1.6" fill="#FFFFFF" fillOpacity="0.8" />
            <circle cx="11" cy="46" r="1.6" fill="#FFFFFF" fillOpacity="0.8" />
          </g>
        )}

        {meta.folderStyle === 'binder' && (
          <line x1="14" y1="26" x2="14" y2="58" stroke="#FFFFFF" strokeOpacity="0.38" strokeWidth="1.2" />
        )}

        {meta.folderStyle === 'technical' && (
          <path d="M12 32H16M12 32V36" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.3" strokeLinecap="round" />
        )}
      </svg>

      {/* Floating 3D Study Emoji Medallion */}
      <div
        className="ibdp-folder-badge"
        style={{
          position: 'absolute',
          right: '-4px',
          bottom: '-3px',
          width: Math.round(size * 0.48),
          height: Math.round(size * 0.48),
          borderRadius: '50%',
          background: meta.badgeBg,
          border: `2px solid ${meta.badgeBorder}`,
          boxShadow: `0 4px 10px ${meta.shadow}, inset 0 2px 3px #FFFFFF`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${Math.round(size * 0.26)}px`,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        <span>{meta.emoji}</span>
      </div>
    </div>
  );
}

function SubjectFolderIllustration({ subjectName = '', index = 0 }) {
  const lower = String(subjectName || '').toLowerCase();
  const isMath = lower.includes('math') || lower.includes('calc') || lower.includes('stat');
  const isScience = lower.includes('sci') || lower.includes('bio') || lower.includes('chem') || lower.includes('phys');
  const isLang = lower.includes('eng') || lower.includes('lang') || lower.includes('lit') || lower.includes('french') || lower.includes('spanish');

  let theme = 'blue';
  if (isMath) theme = 'blue';
  else if (isScience) theme = 'green';
  else if (isLang) theme = 'purple';
  else {
    const cycle = ['blue', 'green', 'purple', 'amber', 'rose'];
    theme = cycle[index % cycle.length];
  }

  const themes = {
    blue: {
      back: '#60A5FA',
      frontStart: '#DBEAFE',
      frontMid: '#93C5FD',
      frontEnd: '#3B82F6',
      glyph: '#1D4ED8',
      shadow: 'rgba(59, 130, 246, 0.3)',
    },
    green: {
      back: '#34D399',
      frontStart: '#D1FAE5',
      frontMid: '#6EE7B7',
      frontEnd: '#10B981',
      glyph: '#047857',
      shadow: 'rgba(16, 185, 129, 0.3)',
    },
    purple: {
      back: '#A78BFA',
      frontStart: '#EDE9FE',
      frontMid: '#C4B5FD',
      frontEnd: '#8B5CF6',
      glyph: '#5B21B6',
      shadow: 'rgba(139, 92, 246, 0.3)',
    },
    amber: {
      back: '#FBBF24',
      frontStart: '#FEF3C7',
      frontMid: '#FDE68A',
      frontEnd: '#F59E0B',
      glyph: '#B45309',
      shadow: 'rgba(245, 158, 11, 0.3)',
    },
    rose: {
      back: '#FB7185',
      frontStart: '#FFE4E6',
      frontMid: '#FDA4AF',
      frontEnd: '#F43F5E',
      glyph: '#BE123C',
      shadow: 'rgba(244, 63, 94, 0.3)',
    },
  };

  const t = themes[theme];
  const gradId = `clay-subj-folder-${theme}-${index}`;

  return (
    <svg width="90" height="76" viewBox="0 0 86 72" fill="none" style={{ filter: `drop-shadow(6px 10px 16px ${t.shadow})` }}>
      <path
        d="M4 14C4 9.58172 7.58172 6 12 6H31.5C33.4 6 35.2 6.78 36.5 8.15L41.2 13H74C78.4183 13 82 16.5817 82 21V58C82 62.4183 78.4183 66 74 66H12C7.58172 66 4 62.4183 4 58V14Z"
        fill={t.back}
      />
      <rect x="10" y="12.5" width="66" height="11" rx="4" fill="#FFFFFF" fillOpacity="0.85" />
      <rect x="4" y="18" width="78" height="48" rx="11" fill={`url(#${gradId})`} />
      <rect x="5.2" y="19.2" width="75.6" height="45.6" rx="10" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.6" />

      {isMath ? (
        <g transform="translate(29, 28)">
          <rect x="0" y="0" width="12" height="12" rx="3.5" fill={t.glyph} fillOpacity="0.88" />
          <path d="M6 3.5V8.5M3.5 6H8.5" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
          <rect x="15" y="0" width="12" height="12" rx="3.5" fill={t.glyph} fillOpacity="0.88" />
          <path d="M18.5 6H23.5" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
          <rect x="0" y="15" width="12" height="12" rx="3.5" fill={t.glyph} fillOpacity="0.88" />
          <path d="M4 19L8 23M8 19L4 23" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="15" y="15" width="12" height="12" rx="3.5" fill={t.glyph} fillOpacity="0.88" />
          <path d="M18.5 19.5H23.5M18.5 22.5H23.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ) : isScience ? (
        <g transform="translate(31, 26)">
          <path
            d="M9 2H15M10.5 2V9.5L4.5 20.5C3.7 22 4.8 24 6.5 24H17.5C19.2 24 20.3 22 19.5 20.5L13.5 9.5V2"
            stroke={t.glyph}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={t.glyph}
            fillOpacity="0.2"
          />
          <path
            d="M6.2 18.5H17.8L19.2 21C19.8 22.1 19 23.5 17.7 23.5H6.3C5 23.5 4.2 22.1 4.8 21L6.2 18.5Z"
            fill={t.glyph}
            fillOpacity="0.8"
          />
          <circle cx="10.5" cy="15.5" r="1.3" fill={t.glyph} />
          <circle cx="13.8" cy="13.5" r="1.1" fill={t.glyph} />
        </g>
      ) : (
        <g transform="translate(31, 29)">
          <rect x="2" y="2" width="20" height="22" rx="4" fill={t.glyph} fillOpacity="0.22" stroke={t.glyph} strokeWidth="1.9" />
          <path d="M6.5 8H17.5M6.5 12.5H17.5M6.5 17H13.5" stroke={t.glyph} strokeWidth="1.9" strokeLinecap="round" />
        </g>
      )}

      <defs>
        <linearGradient id={gradId} x1="16" y1="18" x2="70" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor={t.frontStart} />
          <stop offset="0.52" stopColor={t.frontMid} />
          <stop offset="1" stopColor={t.frontEnd} />
        </linearGradient>
      </defs>
    </svg>
  );
}

const TYPE_META = {
  note: {
    label: 'PDF Note',
    actionLabel: 'Open PDF',
    icon: FileText,
    color: '#2563EB',
    bg: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
    border: '#BFDBFE',
  },
  worksheet: {
    label: 'Worksheet',
    actionLabel: 'Open Worksheet',
    icon: ImageIcon,
    color: '#D97706',
    bg: 'linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)',
    border: '#FDE68A',
  },
  video: {
    label: 'Video Lesson',
    actionLabel: 'Watch Video',
    icon: Video,
    color: '#7C3AED',
    bg: 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
    border: '#DDD6FE',
  },
  animation: {
    label: 'Interactive / 3D',
    actionLabel: 'Launch Interactive',
    icon: Sparkles,
    color: '#059669',
    bg: 'linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)',
    border: '#A7F3D0',
  },
};

export default function IbdpCurriculumPortal() {
  const { user, login, register, loginWithGoogle, logout, loading: authLoading } = useAuthStore();

  // ── Auth State (when not signed in) ──────────────────────────────────────────
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ full_name: '', email: '', password: '' });
  const [submittingAuth, setSubmittingAuth] = useState(false);

  useEffect(() => {
    document.title = 'Curriculum Portal';
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Client ID is not configured');
      return;
    }
    if (!window.google?.accounts?.oauth2) {
      toast.error('Google Sign-In is still loading, please try again in a moment.');
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (tokenResponse) => {
        if (tokenResponse?.error) {
          toast.error(tokenResponse.error_description || 'Google authentication cancelled');
          return;
        }
        if (tokenResponse?.access_token) {
          try {
            setSubmittingAuth(true);
            const loggedUser = await loginWithGoogle({ access_token: tokenResponse.access_token }, 'student', 'register');
            toast.success(`Welcome, ${loggedUser.full_name?.split(' ')[0] || 'User'}!`);
          } catch (err) {
            toast.error(err.message || 'Google authentication failed');
          } finally {
            setSubmittingAuth(false);
          }
        }
      },
    });
    client.requestAccessToken();
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!authForm.email.trim() || !authForm.password.trim()) {
      toast.error('Please enter your email and password');
      return;
    }
    if (authMode === 'register' && !authForm.full_name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (authMode === 'register' && authForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setSubmittingAuth(true);
      if (authMode === 'login') {
        const loggedUser = await login({
          email: authForm.email.trim(),
          password: authForm.password,
        });
        toast.success(`Welcome back, ${loggedUser.full_name?.split(' ')[0] || 'User'}!`);
      } else {
        const newUser = await register({
          full_name: authForm.full_name.trim(),
          email: authForm.email.trim(),
          password: authForm.password,
          role: 'student',
        });
        toast.success(`Account created! Welcome, ${newUser.full_name?.split(' ')[0] || 'User'}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setSubmittingAuth(false);
    }
  };

  // ── Explorer Navigation & Data State ─────────────────────────────────────────
  const [sidebarTab, setSidebarTab] = useState('curriculum');
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [ibdpCurriculum, setIbdpCurriculum] = useState(null);

  const [expandedGrades, setExpandedGrades] = useState({});
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const [navHistory, setNavHistory] = useState([{ tab: 'curriculum', subjectId: null, topicId: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const navigateExplorer = useCallback((nextState) => {
    const target = {
      tab: nextState.tab ?? 'curriculum',
      subjectId: nextState.subjectId ?? null,
      topicId: nextState.topicId ?? null,
    };
    setSidebarTab(target.tab);
    setSelectedSubjectId(target.subjectId);
    setSelectedTopicId(target.topicId);
    setTypeFilter('all');

    setNavHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, target];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navHistory.length - 1;

  const handleBack = () => {
    if (!canGoBack) return;
    const prevIdx = historyIndex - 1;
    const entry = navHistory[prevIdx];
    setHistoryIndex(prevIdx);
    setSidebarTab(entry.tab);
    setSelectedSubjectId(entry.subjectId);
    setSelectedTopicId(entry.topicId);
  };

  const handleForward = () => {
    if (!canGoForward) return;
    const nextIdx = historyIndex + 1;
    const entry = navHistory[nextIdx];
    setHistoryIndex(nextIdx);
    setSidebarTab(entry.tab);
    setSelectedSubjectId(entry.subjectId);
    setSelectedTopicId(entry.topicId);
  };

  const handleHome = () => {
    navigateExplorer({ tab: 'curriculum', subjectId: null, topicId: null });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [starredIds, setStarredIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ibdp_starred_items') || '[]'); } catch { return []; }
  });

  const toggleStarItem = (e, item) => {
    e.stopPropagation();
    setStarredIds(prev => {
      const exists = prev.some(x => x.id === item.id);
      const next = exists ? prev.filter(x => x.id !== item.id) : [item, ...prev];
      try { localStorage.setItem('ibdp_starred_items', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const [topicItems, setTopicItems] = useState([]);
  const [allIbdpMaterials, setAllIbdpMaterials] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Viewers state
  const [activePdf, setActivePdf] = useState(null);
  const [activeWorksheet, setActiveWorksheet] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeSimulation, setActiveSimulation] = useState(null);

  const fetchIbdpData = useCallback(async () => {
    if (!user) return;
    setLoadingHierarchy(true);
    try {
      const res = await studentApi.getIbdpHierarchy();
      const allCurrs = res?.data?.data ?? [];
      const found = allCurrs.find(c => String(c.name || '').trim().toLowerCase().includes('ibdp'));
      setIbdpCurriculum(found || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load IBDP curriculum');
    } finally {
      setLoadingHierarchy(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchIbdpData();
    }
  }, [user, fetchIbdpData]);

  const classes = useMemo(() => ibdpCurriculum?.classes ?? [], [ibdpCurriculum]);

  const allSubjectsFlat = useMemo(() => {
    const list = [];
    classes.forEach((cls) => {
      (cls.subjects || []).forEach((sub) => {
        list.push({ ...sub, class_id: cls.id, class_name: cls.name });
      });
    });
    return list;
  }, [classes]);

  const activeSubject = useMemo(
    () => allSubjectsFlat.find(s => s.id === selectedSubjectId) || null,
    [allSubjectsFlat, selectedSubjectId]
  );

  const subjectRootTopics = useMemo(() => {
    if (!activeSubject) return [];
    return (activeSubject.topics || []).filter(t => t.name !== SUBJECT_MATERIALS_TOPIC_NAME);
  }, [activeSubject]);

  const subjectGeneralTopic = useMemo(() => {
    if (!activeSubject) return null;
    return (activeSubject.topics || []).find(t => t.name === SUBJECT_MATERIALS_TOPIC_NAME) || null;
  }, [activeSubject]);

  const activeTopic = useMemo(() => {
    if (!selectedTopicId || !activeSubject) return null;
    for (const root of activeSubject.topics || []) {
      if (root.id === selectedTopicId) return { ...root, isSubtopic: false, parentTopic: null };
      for (const sub of root.children || root.subtopics || []) {
        if (sub.id === selectedTopicId) return { ...sub, isSubtopic: true, parentTopic: root };
      }
    }
    return null;
  }, [activeSubject, selectedTopicId]);

  const effectiveContentTopicId = useMemo(() => {
    if (selectedTopicId) return selectedTopicId;
    if (selectedSubjectId && subjectGeneralTopic) return subjectGeneralTopic.id;
    return null;
  }, [selectedTopicId, selectedSubjectId, subjectGeneralTopic]);

  const fetchMaterialsForTopic = useCallback(async (topicId) => {
    if (!topicId) {
      setTopicItems([]);
      return;
    }
    setLoadingContent(true);
    try {
      const res = await studentApi.getTopicContent(topicId);
      const data = res?.data?.data ?? res?.data ?? {};
      const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
      setTopicItems(items);
    } catch (err) {
      console.error('[IBDP getTopicContent]', err);
      setTopicItems([]);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    if (sidebarTab === 'curriculum') {
      fetchMaterialsForTopic(effectiveContentTopicId);
    }
  }, [sidebarTab, effectiveContentTopicId, fetchMaterialsForTopic]);

  const fetchAllIbdpMaterials = useCallback(async () => {
    if (!ibdpCurriculum) return;
    setLoadingContent(true);
    try {
      const topicMetaList = [];
      for (const cls of ibdpCurriculum.classes || []) {
        for (const sub of cls.subjects || []) {
          for (const top of sub.topics || []) {
            topicMetaList.push({ id: top.id, topicName: top.name, subjectName: sub.name, className: cls.name });
            for (const st of top.children || top.subtopics || []) {
              topicMetaList.push({ id: st.id, topicName: st.name, subjectName: sub.name, className: cls.name });
            }
          }
        }
      }
      const results = await Promise.all(
        topicMetaList.map(async (tm) => {
          try {
            const r = await studentApi.getTopicContent(tm.id);
            const d = r?.data?.data ?? r?.data ?? {};
            const arr = Array.isArray(d.items) ? d.items : Array.isArray(d) ? d : [];
            return arr.map(it => ({ ...it, _subjectName: tm.subjectName, _className: tm.className, _topicName: tm.topicName }));
          } catch {
            return [];
          }
        })
      );
      setAllIbdpMaterials(results.flat());
    } finally {
      setLoadingContent(false);
    }
  }, [ibdpCurriculum]);

  useEffect(() => {
    if (sidebarTab === 'materials') {
      fetchAllIbdpMaterials();
    }
  }, [sidebarTab, fetchAllIbdpMaterials]);

  const handleOpenMaterial = async (item) => {
    try {
      if (item.content_type === 'note') {
        let url = item.file_url;
        if (!url) {
          const res = await studentApi.getNoteUrl(item.id);
          url = res?.data?.url || res?.data?.data?.url;
        }
        if (!url) {
          toast.error('PDF file URL is not available.');
          return;
        }
        setActivePdf({ url, title: item.title });
      } else if (item.content_type === 'worksheet') {
        let url = item.file_url;
        if (!url) {
          const res = await studentApi.getWorksheetUrl(item.id);
          url = res?.data?.url || res?.data?.data?.url;
        }
        if (!url) {
          toast.error('Worksheet image URL is not available.');
          return;
        }
        setActiveWorksheet({ url, title: item.title });
      } else if (item.content_type === 'video') {
        setActiveVideo({
          playbackId: item.mux_playback_id,
          fileUrl: item.file_url,
          title: item.title,
        });
      } else if (item.content_type === 'animation') {
        if (item.html_content) {
          setActiveSimulation({ html: item.html_content, title: item.title });
          return;
        }
        if (item.animation_id) {
          const res = await studentApi.getAnimation(item.animation_id);
          const anim = res?.data?.data ?? res?.data;
          if (anim?.html_content) {
            setActiveSimulation({ html: anim.html_content, title: item.title });
            return;
          }
        }
        toast.error('Interactive simulation content could not be loaded.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to open material.');
    }
  };

  const displayedMaterials = useMemo(() => {
    const source =
      sidebarTab === 'materials' ? allIbdpMaterials :
      sidebarTab === 'starred'   ? starredIds :
      topicItems;

    return source.filter(item => {
      if (typeFilter !== 'all' && item.content_type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          String(item.title || '').toLowerCase().includes(q) ||
          String(item._subjectName || '').toLowerCase().includes(q) ||
          String(item._topicName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sidebarTab, allIbdpMaterials, starredIds, topicItems, typeFilter, searchQuery]);

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW 1: CLAYMORPHISM LOGIN & REGISTER SCREEN (FIXED SIZE & SMOOTH SLIDE)
  // ════════════════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <div
        className="ibdp-clay-root"
        style={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          position: 'fixed',
          inset: 0,
          backgroundImage: "url('/ibdp-auth-v2.jpg?v=2')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#DDE7FF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          boxSizing: 'border-box',
        }}
      >
        <style>{CLAY_CSS}</style>

        <div
          className="ibdp-clay-panel"
          style={{
            width: '100%',
            maxWidth: '430px',
            padding: '1.85rem 2rem',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(241,246,253,0.94) 100%)',
            backdropFilter: 'blur(14px)',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Mentara Learning · IBDP Portal Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.95rem' }}>
            <img
              src="/mentara-new.png"
              alt="Mentara Learning"
              style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0, background: 'transparent', border: 'none' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}>
                Mentara Learning
              </span>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#2563EB',
                lineHeight: 1.2,
                marginTop: '2px',
              }}>
                IBDP Portal
              </span>
            </div>
          </div>

          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 0.3rem 0',
            letterSpacing: '-0.02em',
            transition: 'opacity 0.2s ease',
          }}>
            {authMode === 'login' ? 'Sign in to IBDP Curriculum' : 'Register for IBDP Curriculum'}
          </h1>
          <p style={{ fontSize: '0.83rem', color: '#64748B', margin: '0 0 1.15rem 0', lineHeight: 1.45, fontWeight: 500 }}>
            IBDP curriculum portal. Continue with Google or sign in with your email credentials.
          </p>

          {/* 3D Clay Google Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={submittingAuth || authLoading}
            className="ibdp-clay-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              borderRadius: '18px',
              color: '#0F172A',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>{authMode === 'login' ? 'Continue with Google' : 'Register with Google'}</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: 1.5, background: 'rgba(148,163,184,0.25)', borderRadius: 2 }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              or with email
            </span>
            <div style={{ flex: 1, height: 1.5, background: 'rgba(148,163,184,0.25)', borderRadius: 2 }} />
          </div>

          {/* Smooth Sliding Recessed Clay Mode Switcher (High Contrast & 3D Depth) */}
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              padding: '6px',
              borderRadius: '20px',
              marginBottom: '1rem',
              background: '#DAE5F5',
              border: '1.5px solid rgba(255, 255, 255, 0.85)',
              boxShadow:
                'inset 5px 5px 11px rgba(100, 116, 139, 0.42), inset -5px -5px 11px rgba(255, 255, 255, 0.96)',
            }}
          >
            {/* Sliding 3D Sculpted Clay Pill Indicator */}
            <div
              style={{
                position: 'absolute',
                top: 6,
                bottom: 6,
                left: 6,
                width: 'calc(50% - 6px)',
                borderRadius: '15px',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #E1EDFF 100%)',
                border: '1.5px solid #FFFFFF',
                boxShadow:
                  '0 6px 14px rgba(30, 64, 175, 0.24), 4px 6px 12px rgba(71, 85, 105, 0.28), inset 3px 3px 6px #FFFFFF, inset -4px -4px 9px rgba(59, 130, 246, 0.32)',
                transform: authMode === 'login' ? 'translateX(0%)' : 'translateX(100%)',
                transition: 'transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1)',
                pointerEvents: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '0.54rem',
                borderRadius: '15px',
                border: 'none',
                background: 'transparent',
                color: authMode === 'login' ? '#1D4ED8' : '#475569',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                transition: 'color 0.25s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '0.54rem',
                borderRadius: '15px',
                border: 'none',
                background: 'transparent',
                color: authMode === 'register' ? '#1D4ED8' : '#475569',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                transition: 'color 0.25s ease',
              }}
            >
              Register
            </button>
          </div>

          {/* Email Form with 100% Fixed Card Height & Smooth Horizontal Slide */}
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ overflow: 'hidden', width: '100%', height: '216px' }}>
              <div style={{
                display: 'flex',
                width: '200%',
                height: '100%',
                transform: authMode === 'login' ? 'translateX(0%)' : 'translateX(-50%)',
                transition: 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
              }}>
                {/* SLIDE 1: SIGN IN FIELDS */}
                <div style={{
                  width: '50%',
                  padding: '2px 4px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '0.85rem',
                  opacity: authMode === 'login' ? 1 : 0.3,
                  transition: 'opacity 0.28s ease',
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', paddingLeft: '0.25rem' }}>
                      Email Address
                    </label>
                    <div className="ibdp-clay-well" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Mail size={15} style={{ position: 'absolute', left: 14, color: '#64748B', pointerEvents: 'none' }} />
                      <input
                        type="email"
                        tabIndex={authMode === 'login' ? 0 : -1}
                        placeholder="name@example.com"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.9rem 0.7rem 2.35rem',
                          border: 'none',
                          boxShadow: 'none',
                          background: 'transparent',
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', paddingLeft: '0.25rem' }}>
                      Password
                    </label>
                    <div className="ibdp-clay-well" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <KeyRound size={15} style={{ position: 'absolute', left: 14, color: '#64748B', pointerEvents: 'none' }} />
                      <input
                        type="password"
                        tabIndex={authMode === 'login' ? 0 : -1}
                        placeholder="Enter your password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.9rem 0.7rem 2.35rem',
                          border: 'none',
                          boxShadow: 'none',
                          background: 'transparent',
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* SLIDE 2: REGISTER FIELDS */}
                <div style={{
                  width: '50%',
                  padding: '2px 4px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: authMode === 'register' ? 1 : 0.3,
                  transition: 'opacity 0.28s ease',
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.71rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
                      Full Name
                    </label>
                    <div className="ibdp-clay-well" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <User size={15} style={{ position: 'absolute', left: 14, color: '#64748B', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        tabIndex={authMode === 'register' ? 0 : -1}
                        placeholder="Enter your full name"
                        value={authForm.full_name}
                        onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.56rem 0.9rem 0.56rem 2.35rem',
                          border: 'none',
                          boxShadow: 'none',
                          background: 'transparent',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.71rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
                      Email Address
                    </label>
                    <div className="ibdp-clay-well" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Mail size={15} style={{ position: 'absolute', left: 14, color: '#64748B', pointerEvents: 'none' }} />
                      <input
                        type="email"
                        tabIndex={authMode === 'register' ? 0 : -1}
                        placeholder="name@example.com"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.56rem 0.9rem 0.56rem 2.35rem',
                          border: 'none',
                          boxShadow: 'none',
                          background: 'transparent',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.71rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
                      Password
                    </label>
                    <div className="ibdp-clay-well" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <KeyRound size={15} style={{ position: 'absolute', left: 14, color: '#64748B', pointerEvents: 'none' }} />
                      <input
                        type="password"
                        tabIndex={authMode === 'register' ? 0 : -1}
                        placeholder="Minimum 8 characters"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.56rem 0.9rem 0.56rem 2.35rem',
                          border: 'none',
                          boxShadow: 'none',
                          background: 'transparent',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingAuth || authLoading}
              className="ibdp-clay-btn-primary"
              style={{
                marginTop: '0.9rem',
                width: '100%',
                padding: '0.82rem 1rem',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {(submittingAuth || authLoading) && <Loader2 size={16} className="animate-spin" />}
              <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW 2: CLAYMORPHISM FILE-EXPLORER DESKTOP DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="ibdp-clay-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(145deg, #EEF3FA 0%, #F5F8FD 60%, #EBF2FC 100%)',
        padding: '0.85rem',
        gap: '0.85rem',
        boxSizing: 'border-box',
      }}
    >
      <style>{CLAY_CSS}</style>

      {/* ── TOP CLAY EXPLORER HEADER BAR ── */}
      <header
        className="ibdp-clay-panel"
        style={{
          height: 68,
          borderRadius: 24,
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.9rem',
          position: 'sticky',
          top: '0.85rem',
          zIndex: 30,
        }}
      >
        {/* 3D Clay Back / Forward / Home Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={!canGoBack}
            title="Back"
            className="ibdp-clay-btn"
            style={{
              width: 38, height: 38, borderRadius: 13,
              color: canGoBack ? '#1E293B' : '#CBD5E1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canGoBack ? 'pointer' : 'default',
              opacity: canGoBack ? 1 : 0.6,
            }}
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={!canGoForward}
            title="Forward"
            className="ibdp-clay-btn"
            style={{
              width: 38, height: 38, borderRadius: 13,
              color: canGoForward ? '#1E293B' : '#CBD5E1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canGoForward ? 'pointer' : 'default',
              opacity: canGoForward ? 1 : 0.6,
            }}
          >
            <ArrowRight size={17} />
          </button>
          <button
            type="button"
            onClick={handleHome}
            title="Curriculum Home"
            className="ibdp-clay-btn"
            style={{
              width: 38, height: 38, borderRadius: 13,
              color: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Home size={17} />
          </button>
        </div>

        {/* Center Recessed Clay Breadcrumb Address Pill */}
        <div
          className="ibdp-clay-well"
          style={{
            flex: 1,
            height: 44,
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            minWidth: 0,
          }}
        >
          <SmallFolderIcon color="blue" size={22} />

          <button
            type="button"
            onClick={handleHome}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: !activeSubject ? 800 : 600,
              color: !activeSubject ? '#0F172A' : '#475569',
              whiteSpace: 'nowrap',
            }}
          >
            {sidebarTab === 'materials' ? 'My Materials' : sidebarTab === 'starred' ? 'Starred' : 'Curriculum'}
          </button>

          {activeSubject && sidebarTab === 'curriculum' && (
            <>
              <ChevronRight size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                {activeSubject.class_name}
              </span>
              <ChevronRight size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
              <button
                type="button"
                onClick={() => navigateExplorer({ tab: 'curriculum', subjectId: activeSubject.id, topicId: null })}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: !activeTopic ? 800 : 600,
                  color: !activeTopic ? '#2563EB' : '#475569',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeSubject.name}
              </button>
            </>
          )}

          {activeTopic && sidebarTab === 'curriculum' && (
            <>
              {activeTopic.parentTopic && (
                <>
                  <ChevronRight size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <button
                    type="button"
                    onClick={() => navigateExplorer({ tab: 'curriculum', subjectId: activeSubject.id, topicId: activeTopic.parentTopic.id })}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      fontSize: '0.86rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap',
                    }}
                  >
                    {activeTopic.parentTopic.name}
                  </button>
                </>
              )}
              <ChevronRight size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2563EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTopic.name}
              </span>
            </>
          )}
        </div>

        {/* Right Recessed Clay Search Input + Clay Sign Out Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexShrink: 0 }}>
          <div className="ibdp-clay-well" style={{ position: 'relative', width: 235, height: 44, display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: 14, color: '#64748B', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                padding: '0 0.9rem 0 2.35rem',
                border: 'none',
                boxShadow: 'none',
                background: 'transparent',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#0F172A',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="button"
            onClick={logout}
            className="ibdp-clay-btn"
            title={`Signed in as ${user.full_name || user.email} — Click to Sign Out`}
            style={{
              height: 44,
              padding: '0 1rem',
              borderRadius: 15,
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
            }}
          >
            <LogOut size={15} color="#EF4444" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── MAIN BODY: CLAY SIDEBAR + CLAY CONTENT WORKSPACE ── */}
      <div style={{ display: 'flex', flex: 1, gap: '0.85rem', minHeight: 'calc(100vh - 102px)' }}>
        {/* Left Clay Sidebar */}
        <aside
          className="ibdp-clay-panel"
          style={{
            width: 250,
            flexShrink: 0,
            borderRadius: 28,
            padding: '1.25rem 0.95rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
        >
          {/* Top Mentara Learning · IBDP Portal Brand Header (No border or background) */}
          <div
            onClick={handleHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.45rem 0.65rem 0.85rem',
              marginBottom: '0.35rem',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
            }}
          >
            <img
              src="/mentara-new.png"
              alt="Mentara Learning"
              style={{
                width: 36,
                height: 36,
                objectFit: 'contain',
                flexShrink: 0,
                background: 'transparent',
                border: 'none',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                fontSize: '1.02rem',
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}>
                Mentara Learning
              </span>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#2563EB',
                lineHeight: 1.2,
                marginTop: '2px',
              }}>
                IBDP Portal
              </span>
            </div>
          </div>

          {/* Primary Clay Nav Items */}
          {[
            { id: 'curriculum', label: 'Curriculum', icon: 'folder' },
            { id: 'materials',  label: 'My Materials', icon: FileText },
            { id: 'starred',    label: 'Starred', icon: Star },
          ].map((nav) => {
            const isActive = sidebarTab === nav.id;
            const IconComp = nav.icon;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => navigateExplorer({ tab: nav.id, subjectId: null, topicId: null })}
                className={`ibdp-clay-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.95rem',
                  color: isActive ? '#1D4ED8' : '#334155',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {nav.icon === 'folder' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#2563EB' : '#475569'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                ) : (
                  <IconComp size={18} color={isActive ? '#2563EB' : '#475569'} />
                )}
                <span>{nav.label}</span>
              </button>
            );
          })}
        </aside>

        {/* ── MAIN CLAY CONTENT WORKSPACE ── */}
        <main
          className="ibdp-clay-panel"
          style={{
            flex: 1,
            borderRadius: 30,
            padding: '2rem 2.4rem',
            overflowY: 'auto',
          }}
        >
          {loadingHierarchy ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
              <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#2563EB' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Loading IBDP Curriculum...</div>
            </div>
          ) : !ibdpCurriculum ? (
            <div
              className="ibdp-clay-card"
              style={{
                padding: '3rem 2rem', textAlign: 'center', maxWidth: 520, margin: '2rem auto',
              }}
            >
              <YellowHeaderFolder size={62} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.95rem 0 0.35rem' }}>
                IBDP Curriculum Not Found
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
                Create a curriculum named <strong>IBDP</strong> in the Admin Dashboard to populate this workspace.
              </p>
            </div>
          ) : sidebarTab !== 'curriculum' ? (
            /* ── FLAT MATERIALS VIEW (My Materials / Starred) ── */
            <div>
              <div
                className="ibdp-clay-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.15rem',
                  padding: '1.35rem 1.65rem',
                  marginBottom: '1.85rem',
                }}
              >
                <YellowHeaderFolder size={58} />
                <div>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                    {sidebarTab === 'materials' ? 'My Materials' : 'Starred Materials'}
                  </h1>
                  <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '0.2rem 0 0', fontWeight: 600 }}>
                    {displayedMaterials.length} resource{displayedMaterials.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {loadingContent ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                  <Loader2 size={22} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563EB' }} />
                  Loading materials...
                </div>
              ) : displayedMaterials.length === 0 ? (
                <div
                  className="ibdp-clay-well"
                  style={{
                    padding: '3rem 1.5rem', textAlign: 'center',
                    borderRadius: 24, color: '#64748B', fontSize: '0.92rem', fontWeight: 600,
                  }}
                >
                  {sidebarTab === 'starred'
                    ? 'No starred materials yet. Click the star icon on any material to bookmark it here.'
                    : 'No uploaded materials found.'}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
                  gap: '1.35rem',
                }}>
                  {displayedMaterials.map((item) => {
                    const meta = TYPE_META[item.content_type] || TYPE_META.note;
                    const Icon = meta.icon;
                    const isStarred = starredIds.some(x => x.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleOpenMaterial(item)}
                        className="ibdp-clay-card"
                        style={{
                          padding: '1.4rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                            <div
                              className="ibdp-clay-bubble"
                              style={{
                                width: 46, height: 46,
                                background: meta.bg,
                                color: meta.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <Icon size={21} />
                            </div>
                            <button
                              type="button"
                              onClick={(e) => toggleStarItem(e, item)}
                              className="ibdp-clay-btn"
                              style={{
                                width: 34, height: 34, borderRadius: 11,
                                cursor: 'pointer',
                                color: isStarred ? '#F59E0B' : '#94A3B8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                              title={isStarred ? 'Remove from Starred' : 'Add to Starred'}
                            >
                              <Star size={16} fill={isStarred ? '#F59E0B' : 'none'} />
                            </button>
                          </div>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.3rem' }}>
                            {item.title}
                          </h4>
                          {(item._subjectName || item._topicName) && (
                            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
                              {[item._className, item._subjectName, item._topicName].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          paddingTop: '0.75rem', borderTop: '1.5px solid rgba(226, 232, 240, 0.7)',
                          fontSize: '0.8rem', fontWeight: 700, color: meta.color,
                        }}>
                          <span>{meta.actionLabel}</span>
                          <ExternalLink size={14} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !selectedSubjectId ? (
            /* ── ROOT CURRICULUM EXPLORER (CLAYMORPHISM STYLE) ── */
            <div>
              {/* Top Puffy Clay Curriculum Header */}
              <div
                className="ibdp-clay-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                  padding: '1.4rem 1.75rem',
                  marginBottom: '1.75rem',
                }}
              >
                <YellowHeaderFolder size={64} />
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                    Curriculum
                  </h1>
                  <p style={{ fontSize: '0.92rem', color: '#64748B', margin: '0.2rem 0 0', fontWeight: 600 }}>
                    {ibdpCurriculum.description || 'IBDP Curriculum Structure'}
                  </p>
                </div>
              </div>

              {/* Collapsible 3D Clay Grade / Stage Accordions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.05rem' }}>
                {classes.map((cls) => {
                  const isOpen = !!expandedGrades[cls.id];
                  const clsSubjects = (cls.subjects || []).filter(s => {
                    if (!searchQuery.trim()) return true;
                    return s.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
                  });

                  return (
                    <div key={cls.id}>
                      {/* Clay Grade / Stage Bar */}
                      <button
                        type="button"
                        onClick={() => setExpandedGrades(prev => ({ ...prev, [cls.id]: !isOpen }))}
                        className={`ibdp-clay-grade-bar ${isOpen ? 'open' : ''}`}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '1rem 1.25rem',
                          color: '#0F172A',
                          fontSize: '1.08rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {isOpen ? (
                          <ChevronDown size={19} color="#2563EB" />
                        ) : (
                          <ChevronRight size={19} color="#475569" />
                        )}
                        <SmallFolderIcon color="blue" size={28} />
                        <span>{cls.name}</span>
                      </button>

                      {/* Expanded 3D Clay Subject Cards Grid */}
                      {isOpen && (
                        <div style={{
                          padding: '1.25rem 0.5rem 1.35rem 1.25rem',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 290px))',
                          gap: '1.4rem',
                        }}>
                          {clsSubjects.length === 0 ? (
                            <div
                              className="ibdp-clay-well"
                              style={{
                                gridColumn: '1 / -1',
                                padding: '1.35rem',
                                color: '#64748B',
                                fontSize: '0.86rem',
                                fontWeight: 600,
                              }}
                            >
                              No subjects added to {cls.name} yet.
                            </div>
                          ) : (
                            clsSubjects.map((sub, sIdx) => {
                              const visibleTopics = (sub.topics || []).filter(t => t.name !== SUBJECT_MATERIALS_TOPIC_NAME);
                              const totalMaterials = (sub.topics || []).reduce((acc, t) => acc + (t.resource_count || 0), 0);

                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => navigateExplorer({ tab: 'curriculum', subjectId: sub.id, topicId: null })}
                                  className="ibdp-clay-card"
                                  style={{
                                    padding: '1.55rem 1.65rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '0.95rem',
                                  }}
                                >
                                  <SubjectFolderIllustration subjectName={sub.name} index={sIdx} />

                                  <div>
                                    <h3 style={{
                                      fontSize: '1.15rem',
                                      fontWeight: 800,
                                      color: '#0F172A',
                                      margin: '0 0 0.35rem 0',
                                      letterSpacing: '-0.01em',
                                    }}>
                                      {sub.name}
                                    </h3>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      fontSize: '0.84rem',
                                      fontWeight: 600,
                                      color: '#475569',
                                    }}>
                                      <span>{visibleTopics.length} Topic{visibleTopics.length !== 1 ? 's' : ''}</span>
                                      <span style={{ color: '#3B82F6', fontWeight: 900 }}>•</span>
                                      <span>{totalMaterials} Material{totalMaterials !== 1 ? 's' : ''}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── DRILLED-IN SUBJECT OR TOPIC CLAY EXPLORER VIEW ── */
            <div>
              {/* Clay Subject / Topic Header */}
              <div
                className="ibdp-clay-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.4rem 1.7rem',
                  marginBottom: '1.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                  {activeTopic ? (
                    <TopicClayFolder meta={getTopicStudyMeta(activeTopic.name, 0)} size={72} />
                  ) : (
                    <SubjectFolderIllustration subjectName={activeSubject?.name} index={0} />
                  )}
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', marginBottom: '0.2rem' }}>
                      {activeTopic ? `${activeSubject?.class_name} • ${activeSubject?.name}` : activeSubject?.class_name}
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                      {activeTopic ? activeTopic.name : activeSubject?.name}
                    </h1>
                    <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.22rem 0 0', fontWeight: 500 }}>
                      {(activeTopic ? activeTopic.description : activeSubject?.description) || 'Browse topics and uploaded study materials'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3D Clay Topics Folder Cards (when viewing a Subject) */}
              {!selectedTopicId && subjectRootTopics.length > 0 && (
                <div style={{ marginBottom: '2.2rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}>
                    <h2 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#334155', margin: 0 }}>
                      Topics & Chapters ({subjectRootTopics.length})
                    </h2>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>
                      Explore study folders & resources
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 285px))',
                    gap: '1.25rem',
                  }}>
                    {subjectRootTopics.map((top, idx) => {
                      const subs = top.children || top.subtopics || [];
                      const meta = getTopicStudyMeta(top.name, idx);
                      return (
                        <div
                          key={top.id}
                          onClick={() => navigateExplorer({ tab: 'curriculum', subjectId: activeSubject.id, topicId: top.id })}
                          className="ibdp-clay-card ibdp-clay-folder-card"
                          style={{
                            padding: '1.3rem 1.4rem 1.15rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.85rem',
                            position: 'relative',
                            overflow: 'hidden',
                            background: `radial-gradient(circle at 18% 18%, ${meta.lightBg} 0%, rgba(255, 255, 255, 0.98) 55%, #F4F7FC 100%)`,
                            minHeight: 180,
                          }}
                        >
                          {/* Top Row: 3D Study Folder Graphic + Category Tag */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.65rem' }}>
                            <TopicClayFolder meta={meta} size={58} />
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.3rem 0.65rem',
                                borderRadius: 999,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                letterSpacing: '0.02em',
                                background: meta.badgeBg,
                                border: `1px solid ${meta.badgeBorder}`,
                                color: meta.badgeColor,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span>{meta.emoji}</span>
                              <span>{meta.tag}</span>
                            </span>
                          </div>

                          {/* Middle: Topic Name & Description */}
                          <div>
                            <h3 style={{
                              fontSize: '1.02rem',
                              fontWeight: 800,
                              color: '#0F172A',
                              margin: '0 0 0.25rem',
                              lineHeight: 1.3,
                              letterSpacing: '-0.01em',
                              wordBreak: 'break-word',
                            }}>
                              {top.name}
                            </h3>
                            {top.description && (
                              <p style={{
                                fontSize: '0.78rem',
                                color: '#64748B',
                                margin: 0,
                                lineHeight: 1.35,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {top.description}
                              </p>
                            )}
                          </div>

                          {/* Bottom Row: Metadata Pill + Arrow */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '0.65rem',
                            borderTop: '1px solid rgba(226, 232, 240, 0.85)',
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: '#475569',
                            }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.28rem',
                                padding: '0.22rem 0.55rem',
                                borderRadius: 8,
                                background: '#F1F5F9',
                                color: '#334155',
                              }}>
                                <FileText size={12} color={meta.accent} />
                                <span>{top.resource_count || 0} Material{(top.resource_count || 0) !== 1 ? 's' : ''}</span>
                              </span>

                              {subs.length > 0 && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.22rem 0.55rem',
                                  borderRadius: 8,
                                  background: '#F1F5F9',
                                  color: '#64748B',
                                }}>
                                  <span>{subs.length} Subtopic{subs.length !== 1 ? 's' : ''}</span>
                                </span>
                              )}
                            </div>

                            <div
                              className="ibdp-folder-arrow"
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: meta.badgeBg,
                                border: `1px solid ${meta.badgeBorder}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: meta.accent,
                              }}
                            >
                              <ArrowRight size={13} strokeWidth={2.6} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3D Clay Subtopics Folder Cards */}
              {activeTopic && !activeTopic.isSubtopic && (activeTopic.children || activeTopic.subtopics || []).length > 0 && (
                <div style={{ marginBottom: '2.2rem' }}>
                  <h2 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#334155', margin: '0 0 1rem' }}>
                    Subtopics ({(activeTopic.children || activeTopic.subtopics || []).length})
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 275px))',
                    gap: '1.15rem',
                  }}>
                    {(activeTopic.children || activeTopic.subtopics || []).map((st, idx) => {
                      const meta = getTopicStudyMeta(st.name, idx);
                      return (
                        <div
                          key={st.id}
                          onClick={() => navigateExplorer({ tab: 'curriculum', subjectId: activeSubject.id, topicId: st.id })}
                          className="ibdp-clay-card ibdp-clay-folder-card"
                          style={{
                            padding: '1.1rem 1.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.95rem',
                            background: `radial-gradient(circle at 15% 50%, ${meta.lightBg} 0%, rgba(255, 255, 255, 0.98) 60%, #F4F7FC 100%)`,
                          }}
                        >
                          <TopicClayFolder meta={meta} size={46} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                              {st.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>{meta.emoji}</span>
                              <span>{st.resource_count || 0} Material{(st.resource_count || 0) !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div
                            className="ibdp-folder-arrow"
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: meta.badgeBg,
                              border: `1px solid ${meta.badgeBorder}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: meta.accent,
                              flexShrink: 0,
                            }}
                          >
                            <ArrowRight size={12} strokeWidth={2.4} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Uploaded Materials Section */}
              {(selectedTopicId || subjectGeneralTopic || subjectRootTopics.length === 0) && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.85rem',
                    marginBottom: '1.15rem',
                  }}>
                    <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#334155', margin: 0 }}>
                      {selectedTopicId ? 'Uploaded Materials' : `${activeSubject?.name} Materials`} ({displayedMaterials.length})
                    </h2>

                    {topicItems.length > 0 && (() => {
                      const availableTabs = [
                        { id: 'all', label: 'All' },
                        ...[
                          { id: 'note', label: 'PDF Notes' },
                          { id: 'worksheet', label: 'Worksheets' },
                          { id: 'video', label: 'Videos' },
                          { id: 'animation', label: 'Interactive / 3D' },
                        ].filter(t => topicItems.some(item => item.content_type === t.id)),
                      ];
                      if (availableTabs.length <= 1) return null;
                      return (
                        <div className="ibdp-clay-well" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '5px', borderRadius: 16, flexWrap: 'wrap' }}>
                          {availableTabs.map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setTypeFilter(tab.id)}
                              className={typeFilter === tab.id ? 'ibdp-clay-btn-primary' : ''}
                              style={{
                                padding: '0.42rem 0.85rem',
                                borderRadius: 12,
                                border: 'none',
                                background: typeFilter === tab.id ? undefined : 'transparent',
                                color: typeFilter === tab.id ? '#FFFFFF' : '#475569',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {loadingContent ? (
                    <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem', fontWeight: 600 }}>
                      <Loader2 size={22} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563EB' }} />
                      Loading materials...
                    </div>
                  ) : displayedMaterials.length === 0 ? (
                    <div
                      className="ibdp-clay-well"
                      style={{
                        padding: '2.75rem 1.5rem',
                        textAlign: 'center',
                        borderRadius: 22,
                        color: '#64748B',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      No materials uploaded here yet.
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
                      gap: '1.3rem',
                    }}>
                      {displayedMaterials.map((item) => {
                        const meta = TYPE_META[item.content_type] || TYPE_META.note;
                        const Icon = meta.icon;
                        const isStarred = starredIds.some(x => x.id === item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenMaterial(item)}
                            className="ibdp-clay-card"
                            style={{
                              padding: '1.35rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '0.95rem',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div
                                  className="ibdp-clay-bubble"
                                  style={{
                                    width: 44, height: 44,
                                    background: meta.bg,
                                    color: meta.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >
                                  <Icon size={20} />
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => toggleStarItem(e, item)}
                                  className="ibdp-clay-btn"
                                  style={{
                                    width: 34, height: 34, borderRadius: 11,
                                    cursor: 'pointer',
                                    color: isStarred ? '#F59E0B' : '#94A3B8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                  title={isStarred ? 'Remove from Starred' : 'Add to Starred'}
                                >
                                  <Star size={16} fill={isStarred ? '#F59E0B' : 'none'} />
                                </button>
                              </div>

                              <span style={{
                                display: 'inline-block',
                                fontSize: '0.68rem', fontWeight: 800,
                                color: meta.color, background: meta.bg,
                                padding: '0.2rem 0.55rem', borderRadius: 8,
                                marginBottom: '0.4rem',
                              }}>
                                {meta.label}
                              </span>

                              <h4 style={{
                                fontSize: '0.96rem', fontWeight: 800, color: '#0F172A',
                                margin: 0, lineHeight: 1.4, wordBreak: 'break-word',
                              }}>
                                {item.title}
                              </h4>
                            </div>

                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              paddingTop: '0.7rem', borderTop: '1.5px solid rgba(226, 232, 240, 0.7)',
                              fontSize: '0.8rem', fontWeight: 700, color: meta.color,
                            }}>
                              <span>{meta.actionLabel}</span>
                              <ExternalLink size={14} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── VIEWER 1: PDF Reader Modal ── */}
      <PdfViewerModal
        open={!!activePdf}
        onClose={() => setActivePdf(null)}
        pdfUrl={activePdf?.url}
        title={activePdf?.title || 'IBDP Study Note'}
      />

      {/* ── VIEWER 2: Clay Worksheet Image Modal ── */}
      {activeWorksheet && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div className="ibdp-clay-panel" style={{
            width: '100%', maxWidth: 960,
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              padding: '1rem 1.4rem', borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>
                {activeWorksheet.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveWorksheet(null)}
                className="ibdp-clay-btn"
                style={{
                  width: 34, height: 34, borderRadius: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.4rem', textAlign: 'center', background: '#F4F7FC' }}>
              <img
                src={activeWorksheet.url}
                alt={activeWorksheet.title}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── VIEWER 3: Clay Video Modal ── */}
      {activeVideo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div className="ibdp-clay-panel" style={{
            width: '100%', maxWidth: 900,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '1rem 1.4rem', borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>
                {activeVideo.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="ibdp-clay-btn"
                style={{
                  width: 34, height: 34, borderRadius: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ aspectRatio: '16/9', background: '#000' }}>
              {activeVideo.playbackId ? (
                <MuxPlayer
                  playbackId={activeVideo.playbackId}
                  streamType="on-demand"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : activeVideo.fileUrl ? (
                <video src={activeVideo.fileUrl} controls autoPlay style={{ width: '100%', height: '100%' }} />
              ) : (
                <div style={{ color: '#FFF', padding: '2rem', textAlign: 'center' }}>Video stream unavailable</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEWER 4: Clay Interactive Simulation Modal ── */}
      {activeSimulation && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.25rem',
        }}>
          <div className="ibdp-clay-panel" style={{
            width: '100%', maxWidth: 1180,
            height: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              padding: '0.85rem 1.4rem', borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>
                {activeSimulation.title}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.open();
                      win.document.write(activeSimulation.html);
                      win.document.close();
                    }
                  }}
                  className="ibdp-clay-btn"
                  style={{
                    padding: '0.42rem 0.85rem', borderRadius: 11,
                    fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', cursor: 'pointer',
                  }}
                >
                  Open in New Tab
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSimulation(null)}
                  className="ibdp-clay-btn"
                  style={{
                    width: 34, height: 34, borderRadius: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#475569',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, background: '#000' }}>
              <iframe
                srcDoc={activeSimulation.html}
                title={activeSimulation.title}
                style={{ border: 'none', width: '100%', height: '100%' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
