import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Edit2, GripVertical,
  FileText, Video, Sparkles, ChevronDown, Lock,
  Eye, Code2, UploadCloud, CheckCircle2, Loader2,
  FilePlus, X, Image, FolderPlus, Layers, BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageWrapper, Button, Badge, Skeleton, EmptyState,
  Modal, Input, Textarea, Select, Toggle, ConfirmDialog,
} from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import clsx from 'clsx';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .cd-root {
    --navy:     #0A0E1A;
    --navy2:    #0F1629;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --red:      #EF4444;
    --muted:    rgba(245,240,232,0.45);
    --card-bg:  rgba(255,255,255,0.04);
    --card-bdr: rgba(255,255,255,0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .cd-root *, .cd-root *::before, .cd-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .cd-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 28px; padding: 1.75rem 2.25rem;
    overflow: hidden; backdrop-filter: blur(16px);
    margin-bottom: 1.5rem;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
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
    padding: 0.25rem 0.8rem; border-radius: 50px;
    font-size: 0.67rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.4rem;
  }
  .cd-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 7px var(--cyan);
    animation: cd-blink 2s ease infinite;
  }
  @keyframes cd-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .cd-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.2rem, 2.2vw, 1.65rem); font-weight: 700; letter-spacing: -0.02em;
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

  /* ── SECTION CARDS ── */
  .cd-subject-list { display: flex; flex-direction: column; gap: 0.75rem; }
  
  .cd-class-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 20px; overflow: hidden;
    margin-bottom: 0.75rem;
  }
  .cd-class-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem 1.35rem; cursor: pointer;
    background: rgba(255,255,255,0.01);
    transition: background 0.2s;
  }
  .cd-class-header:hover {
    background: rgba(255,255,255,0.03);
  }

  .cd-class-title-sec {
    display: flex; align-items: center; gap: 0.75rem;
  }
  .cd-class-title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700; font-size: 1.05rem; color: var(--cream);
  }
  
  .cd-subject {
    background: rgba(255,255,255,0.02); border: 1px solid var(--card-bdr);
    border-radius: 16px; overflow: hidden; backdrop-filter: blur(12px);
    margin-bottom: 0.5rem;
    transition: border-color 0.3s;
  }
  .cd-subject:hover { border-color: rgba(124,58,237,0.2); }
  .cd-subject.is-open { border-color: rgba(124,58,237,0.28); }

  .cd-subject-header {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.85rem 1rem; cursor: pointer; transition: background 0.2s;
  }
  .cd-subject-header:hover { background: rgba(255,255,255,0.025); }

  .cd-grip { color: var(--muted); flex-shrink: 0; opacity: 0.5; }
  .cd-subject-idx {
    font-size: 0.65rem; font-family: 'Space Grotesk', sans-serif;
    color: var(--muted); width: 20px; flex-shrink: 0; font-weight: 600;
  }
  .cd-subject-info { flex: 1; min-width: 0; }
  .cd-subject-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.875rem; font-weight: 700; color: var(--cream);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cd-subject-desc { font-size: 0.72rem; color: var(--muted); margin-top: 0.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cd-subject-actions { display: flex; align-items: center; gap: 0.2rem; flex-shrink: 0; }
  .cd-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 9px; background: transparent;
    border: none; cursor: pointer; color: var(--muted); transition: background 0.2s, color 0.2s;
  }
  .cd-icon-btn:hover { background: rgba(255,255,255,0.06); color: var(--cream); }
  .cd-icon-btn.edit:hover   { color: var(--violet-l); background: rgba(124,58,237,0.1); }
  .cd-icon-btn.delete:hover { color: #F87171; background: rgba(239,68,68,0.08); }
  .cd-chevron { color: var(--muted); flex-shrink: 0; transition: transform 0.25s ease; }
  .cd-chevron.open { transform: rotate(180deg); }

  /* ── CONTENT PANEL ── */
  .cd-panel {
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(10,14,26,0.4);
    padding: 0.85rem 1.15rem 1rem;
    display: flex; flex-direction: column; gap: 0.5rem;
  }
  
  .cd-topics-container {
    padding: 0.75rem 1rem;
    background: rgba(10,14,26,0.3);
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cd-topic-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 0.4rem;
  }
  .cd-topic-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .cd-topic-header:hover {
    background: rgba(255,255,255,0.03);
  }
  .cd-topic-name {
    font-size: 0.82rem; font-weight: 600; color: var(--cream);
  }
  .cd-topic-desc {
    font-size: 0.7rem; color: var(--muted);
  }

  .cd-content-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 0.85rem; border-radius: 14px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    transition: border-color 0.2s, background 0.2s;
  }
  .cd-content-item:hover { border-color: rgba(124,58,237,0.2); background: rgba(124,58,237,0.04); }
  .cd-content-icon {
    width: 28px; height: 28px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; border: 1px solid;
  }
  .cd-content-icon.note      { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); color: var(--muted); }
  .cd-content-icon.video     { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.3); color: var(--violet-l); }
  .cd-content-icon.animation { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: #6EE7B7; }
  .cd-content-icon.worksheet { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }
  .cd-content-title { flex: 1; min-width: 0; font-size: 0.78rem; font-weight: 600; color: var(--cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cd-type-badge {
    display: inline-flex; align-items: center; padding: 0.14rem 0.5rem;
    border-radius: 50px; font-size: 0.58rem; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid; flex-shrink: 0;
  }
  .cd-type-badge.note      { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color: var(--muted); }
  .cd-type-badge.video     { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.3); color: var(--lavender); }
  .cd-type-badge.animation { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: #6EE7B7; }
  .cd-type-badge.worksheet { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }
  .cd-premium-tag { color: #FCD34D; flex-shrink: 0; }
  
  .cd-add-content-btn {
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    padding: 0.6rem; border-radius: 14px;
    border: 1px dashed rgba(124,58,237,0.25);
    background: transparent; color: var(--muted);
    font-size: 0.75rem; font-weight: 600; cursor: pointer;
    width: 100%;
    transition: border-color 0.2s, color 0.2s, background 0.2s; margin-top: 0.25rem;
  }
  .cd-add-content-btn:hover { border-color: rgba(124,58,237,0.5); color: var(--violet-l); background: rgba(124,58,237,0.05); }

  /* ── FILE DROP ZONE ── */
  .cd-dropzone {
    border: 2px dashed rgba(255,255,255,0.12);
    border-radius: 14px; padding: 1.5rem 1rem;
    display: flex; flex-direction: column; align-items: center; gap: 0.65rem;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
    background: rgba(255,255,255,0.02); text-align: center;
    position: relative;
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

  /* ── WORKSHEET IMAGE PREVIEW ── */
  .cd-ws-preview {
    border-radius: 12px; overflow: hidden;
    border: 1px solid rgba(245,158,11,0.25);
    background: rgba(10,14,26,0.6);
    display: flex; flex-direction: column;
  }
  .cd-ws-preview-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.45rem 0.75rem;
    background: rgba(245,158,11,0.06);
    border-bottom: 1px solid rgba(245,158,11,0.15);
    font-size: 0.68rem; font-weight: 700; color: #FCD34D;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .cd-ws-preview img {
    width: 100%; max-height: 220px; object-fit: contain;
    display: block; background: #fff;
  }

  /* ── VIDEO UPLOADER STATES ── */
  .cd-video-stage {
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 14px; overflow: hidden;
    background: rgba(10,14,26,0.5);
  }
  .cd-video-stage-header {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.6rem 0.85rem;
    background: rgba(124,58,237,0.06);
    border-bottom: 1px solid rgba(124,58,237,0.12);
    font-size: 0.68rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .cd-video-progress-bar {
    height: 4px; background: rgba(255,255,255,0.06);
    border-radius: 0 0 4px 4px; overflow: hidden;
  }
  .cd-video-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--violet), var(--cyan));
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

  /* ── ANIMATION CODE EDITOR ── */
  .cd-anim-editor-wrap {
    border: 1px solid rgba(16,185,129,0.25); border-radius: 14px;
    overflow: hidden; background: rgba(10,14,26,0.8);
  }
  .cd-anim-editor-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: rgba(16,185,129,0.06);
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

  /* ── SHIMMER ── */
  .cd-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%; animation: cd-shimmer 1.6s ease infinite; border-radius: 12px;
  }
  @keyframes cd-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── EMPTY STATE ── */
  .cd-empty {
    display: flex; flex-direction: column; align-items: center; gap: 1rem;
    padding: 3.5rem 2rem; border: 1px dashed rgba(124,58,237,0.2);
    border-radius: 20px; background: rgba(124,58,237,0.02); text-align: center;
  }
  .cd-empty-icon {
    width: 52px; height: 52px; border-radius: 16px;
    background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .cd-empty-title { font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; font-weight: 700; color: var(--cream); }
  .cd-empty-desc  { font-size: 0.78rem; color: var(--muted); max-width: 260px; line-height: 1.55; }

  /* ── TOPIC OPTIONS ROW ── */
  .cd-topic-actions-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 0.85rem;
    border-top: 1px dashed rgba(255,255,255,0.06);
    background: rgba(10,14,26,0.15);
  }
  .cd-action-choice-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.5rem 0.75rem;
    border-radius: 10px;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    color: var(--muted);
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .cd-action-choice-btn:hover {
    color: var(--cream);
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.15);
  }
  .cd-action-choice-btn.subtopic {
    color: var(--cyan);
    background: rgba(0,212,255,0.03);
    border-color: rgba(0,212,255,0.15);
  }
  .cd-action-choice-btn.subtopic:hover {
    background: rgba(0,212,255,0.06);
    border-color: rgba(0,212,255,0.35);
  }
  .cd-action-choice-btn.material {
    color: var(--lavender);
    background: rgba(196,181,253,0.03);
    border-color: rgba(196,181,253,0.15);
  }
  .cd-action-choice-btn.material:hover {
    background: rgba(196,181,253,0.06);
    border-color: rgba(196,181,253,0.35);
    color: var(--cream);
  }
`;

const CONTENT_ICON = { note: FileText, video: Video, animation: Sparkles, worksheet: Image };

const BLANK_CLASS = { name: '', description: '' };
const BLANK_SUBJECT = { name: '', description: '' };
const BLANK_TOPIC = { name: '', description: '', parent_topic_id: '' };
const BLANK_CONTENT = {
  title: '', content_type: 'note',
  noteFile: null,
  videoStage: 'idle',
  videoFile: null,
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
  
  let json = '';
  const jsonMatch = fullHtml.match(/<script id="animation-data"[^>]*>([\s\S]*?)<\/script>/i);
  if (jsonMatch) {
    json = jsonMatch[1].trim();
  }

  // Strip the JSON data script and the window.ANIMATION_DATA script from the html
  const cleanHtml = fullHtml
    .replace(/<script id="animation-data"[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<script>\s*try\s*\{\s*window\.ANIMATION_DATA[\s\S]*?<\/script>/gi, '')
    .replace(/<script>\s*window\.ANIMATION_DATA\s*=[\s\S]*?<\/script>/gi, '');

  let css = '';
  const styleMatch = cleanHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    css = styleMatch[1].trim();
  }
  
  let js = '';
  const scriptMatch = cleanHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) {
    js = scriptMatch[1].trim();
  }
  
  let html = '';
  const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1].replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '').trim();
  } else {
    html = cleanHtml
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .trim();
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

const listContainer = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const subjectVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function CurriculumDetail() {
  const { id } = useParams(); // curriculumId
  const navigate = useNavigate();

  const [expandedClass, setExpandedClass] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);

  // Modals & Forms
  const [classModal, setClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState(BLANK_CLASS);
  const [deleteClassId, setDeleteClassId] = useState(null);

  const [subjectModal, setSubjectModal] = useState(null); // holds classId when creating
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState(BLANK_SUBJECT);
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);

  const [topicModal, setTopicModal] = useState(null); // holds subjectId when creating
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm, setTopicForm] = useState(BLANK_TOPIC);
  const [deleteTopicId, setDeleteTopicId] = useState(null);

  const [contentModal, setContentModal] = useState(null); // holds topicId when creating
  const [editingContent, setEditingContent] = useState(null);
  const [contentForm, setContentForm] = useState(BLANK_CONTENT);
  const [deleteContentId, setDeleteContentId] = useState(null);
  
  const [previewHtml, setPreviewHtml] = useState(null);
  const [animTab, setAnimTab]         = useState('html');

  // Auto-refresh states for localized components
  const [topicsRefreshKey, setTopicsRefreshKey] = useState(0);
  const [contentRefreshKey, setContentRefreshKey] = useState(0);

  const triggerTopicsRefetch = () => setTopicsRefreshKey(k => k + 1);
  const triggerContentRefetch = () => setContentRefreshKey(k => k + 1);

  // Fetch curriculum & pre-load all subjects globally
  const { data: curriculum, loading, refetch } = useApi(
    () => adminApi.getCurriculum(id), null, [id]
  );
  const { data: allSubjects, refetch: refetchSubjects } = useApi(
    adminApi.getSubjects
  );

  const classes = curriculum?.classes ?? [];
  const subjects = allSubjects ?? [];

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
    onSuccess: () => { setDeleteClassId(null); refetch(); },
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
    onSuccess: () => { setDeleteSubjectId(null); refetchSubjects(); },
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
    onSuccess: () => { setDeleteTopicId(null); triggerTopicsRefetch(); },
    successMsg: 'Topic deleted',
  });

  // ── Content mutations ────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { mutate: deleteContent } = useMutation(adminApi.deleteContent, {
    onSuccess: () => { setDeleteContentId(null); triggerContentRefetch(); },
    successMsg: 'Content deleted',
  });

  const handleSaveContent = async () => {
    setSaveError('');
    setSaving(true);
    try {
      const f = contentForm;
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
        const compiledHtml = compileHtmlContent(f.html_part, f.css_part, f.js_part, f.json_part);
        const body = {
          title: f.title,
          content_type: 'animation',
          html_content: compiledHtml,
          is_premium: f.is_premium,
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
          fd.append('file', f.worksheetFile);
          await adminApi.uploadWorksheet(contentModal, fd);
        }
      }

      setContentModal(null);
      setEditingContent(null);
      setContentForm(BLANK_CONTENT);
      triggerContentRefetch();
    } catch (err) {
      setSaveError(err.response?.data?.message ?? err.message ?? 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  // ── Mux direct video upload ──────────────────────────────────────────────────
  const handleVideoUpload = async (file) => {
    if (!contentForm.title.trim()) {
      setSaveError('Enter a title before uploading the video.');
      return;
    }
    setSaveError('');
    setContentForm(f => ({ ...f, videoFile: file, videoStage: 'uploading', videoProgress: 0 }));

    try {
      const res = await adminApi.createMuxUpload(contentModal, {
        title: contentForm.title,
        is_premium: String(contentForm.is_premium),
      });
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
        xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`Mux upload failed: ${xhr.status}`));
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
      setContentForm(f => ({ ...f, videoStage: 'idle', videoProgress: 0 }));
      setSaveError(err.message ?? 'Video upload failed.');
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
  const openCreateSubtopic = (parentTopic) => {
    setEditingTopic(null);
    setTopicForm({ name: '', description: '', parent_topic_id: parentTopic.id });
    setTopicModal(parentTopic.subject_id);
  };
  const openEditTopic = (t) => {
    setEditingTopic(t);
    setTopicForm({ name: t.name, description: t.description ?? '', parent_topic_id: t.parent_topic_id ?? '' });
    setTopicModal(t.subject_id);
  };

  const openAddContent = (topicId) => {
    setEditingContent(null);
    setContentForm(BLANK_CONTENT);
    setSaveError('');
    setContentModal(topicId);
  };
  const openEditContent = (topicId, c) => {
    setEditingContent(c);
    setSaveError('');
    const parsed = parseHtmlContent(c.html_content ?? '');
    setContentForm({
      ...BLANK_CONTENT,
      title: c.title,
      content_type: c.content_type,
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
          <div className="cd-subject-list">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="cd-skel" style={{ height: 62, borderRadius: 20 }} />
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

        {/* ── Header ── */}
        <motion.div
          className="cd-header"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="cd-hblob cd-hblob-1" /><div className="cd-hblob cd-hblob-2" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', position: 'relative', zIndex: 1 }}>
            <button className="cd-back-btn" onClick={() => navigate('/admin/curriculum')}>
              <ArrowLeft size={15} />
            </button>
            <div>
              <div className="cd-eyebrow"><span className="cd-eyebrow-dot" /> Curriculum</div>
              <h1 className="cd-title">{curriculum.name}</h1>
              <p className="cd-subtitle">{classes.length} Class{classes.length !== 1 ? 'es' : ''} assigned</p>
            </div>
          </div>
          <button className="cd-btn-primary" onClick={openCreateClass}>
            <FolderPlus size={14} /> Add Class
          </button>
        </motion.div>

        {/* ── Classes ACCORDION ── */}
        {classes.length === 0 ? (
          <motion.div className="cd-empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
            <div className="cd-empty-icon"><FolderPlus size={22} style={{ color: 'var(--violet-l)' }} /></div>
            <p className="cd-empty-title">No classes yet</p>
            <p className="cd-empty-desc">Create classes (e.g. CBSE Class 10) under this curriculum.</p>
            <button className="cd-btn-primary" onClick={openCreateClass}><Plus size={14} /> Add Class</button>
          </motion.div>
        ) : (
          <div className="cd-subject-list">
            {classes.map((cls, idx) => {
              const isClassOpen = expandedClass === cls.id;
              const classSubjects = subjects.filter(sub => sub.class_id === cls.id);
              return (
                <div key={cls.id} className="cd-class-card">
                  <div className="cd-class-header" onClick={() => setExpandedClass(isClassOpen ? null : cls.id)}>
                    <div className="cd-class-title-sec">
                      <ChevronDown size={16} className={`cd-chevron ${isClassOpen ? 'open' : ''}`} />
                      <div>
                        <span className="cd-class-title">{cls.name}</span>
                        {cls.description && <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>{cls.description}</p>}
                      </div>
                    </div>
                    <div className="cd-subject-actions" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEditClass(cls)} className="cd-icon-btn edit" title="Edit Class"><Edit2 size={12} /></button>
                      <button onClick={() => setDeleteClassId(cls.id)} className="cd-icon-btn delete" title="Delete Class"><Trash2 size={12} /></button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isClassOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden', padding: '1rem 1.25rem' }}
                      >
                        {/* Subjects Inside Class */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lavender)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subjects List</span>
                          <button className="cd-btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.72rem' }} onClick={() => openCreateSubject(cls.id)}>
                            <Plus size={12} /> Add Subject
                          </button>
                        </div>

                        {classSubjects.length === 0 ? (
                          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', padding: '1rem 0', textAlign: 'center' }}>No subjects added to this class yet.</p>
                        ) : (
                          <div className="cd-subject-list">
                            {classSubjects.map((subject, subIdx) => {
                              const isSubOpen = expandedSubject === subject.id;
                              return (
                                <div key={subject.id} className={`cd-subject ${isSubOpen ? 'is-open' : ''}`}>
                                  <div className="cd-subject-header" onClick={() => setExpandedSubject(isSubOpen ? null : subject.id)}>
                                    <GripVertical size={13} className="cd-grip" />
                                    <span className="cd-subject-idx">{String(subIdx + 1).padStart(2, '0')}</span>
                                    <div className="cd-subject-info">
                                      <p className="cd-subject-name">{subject.name}</p>
                                      {subject.description && <p className="cd-subject-desc">{subject.description}</p>}
                                    </div>
                                    <div className="cd-subject-actions" onClick={e => e.stopPropagation()}>
                                      <button onClick={() => openEditSubject(subject)} className="cd-icon-btn edit" title="Edit Subject"><Edit2 size={12} /></button>
                                      <button onClick={() => setDeleteSubjectId(subject.id)} className="cd-icon-btn delete" title="Delete Subject"><Trash2 size={12} /></button>
                                      <ChevronDown size={14} className={`cd-chevron ${isSubOpen ? 'open' : ''}`} onClick={() => setExpandedSubject(isSubOpen ? null : subject.id)} />
                                    </div>
                                  </div>

                                  <AnimatePresence>
                                    {isSubOpen && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        style={{ overflow: 'hidden' }}
                                      >
                                        <SubjectTopicsPanel
                                          subjectId={subject.id}
                                          topicsRefreshKey={topicsRefreshKey}
                                          onAddTopic={() => openCreateTopic(subject.id)}
                                          onAddSubtopic={openCreateSubtopic}
                                          onEditTopic={openEditTopic}
                                          onDeleteTopic={(tId) => setDeleteTopicId(tId)}
                                          onAddContent={openAddContent}
                                          onEditContent={openEditContent}
                                          onDeleteContent={(cId) => setDeleteContentId(cId)}
                                          expandedTopic={expandedTopic}
                                          setExpandedTopic={setExpandedTopic}
                                          contentRefreshKey={contentRefreshKey}
                                        />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Class Modal ── */}
      <Modal open={classModal} onClose={() => { setClassModal(false); setEditingClass(null); }} title={editingClass ? 'Edit Class' : 'New Class'} size="sm" preventOutsideClickClose={true}>
        <div className="space-y-4">
          <Input label="Class Name" placeholder="e.g. CBSE Class 10" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} />
          <Textarea label="Description (optional)" rows={3} value={classForm.description} onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => setClassModal(false)}>Cancel</Button>
          <Button variant="primary" loading={savingClass} onClick={() => saveClass(classForm)}>
            {editingClass ? 'Save Changes' : 'Create Class'}
          </Button>
        </div>
      </Modal>

      {/* ── Subject Modal ── */}
      <Modal open={!!subjectModal} onClose={() => { setSubjectModal(null); setEditingSubject(null); }} title={editingSubject ? 'Edit Subject' : 'New Subject'} size="sm" preventOutsideClickClose={true}>
        <div className="space-y-4">
          <Input label="Subject Name" placeholder="e.g. Science" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
          <Textarea label="Description (optional)" rows={3} value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => setSubjectModal(null)}>Cancel</Button>
          <Button variant="primary" loading={savingSubject} onClick={() => saveSubject(subjectForm)}>
            {editingSubject ? 'Save Changes' : 'Create Subject'}
          </Button>
        </div>
      </Modal>

      {/* ── Topic Modal ── */}
      <Modal open={!!topicModal} onClose={() => { setTopicModal(null); setEditingTopic(null); }} title={editingTopic ? 'Edit Topic' : 'New Topic'} size="sm" preventOutsideClickClose={true}>
        <div className="space-y-4">
          {topicForm.parent_topic_id && (
            <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 600 }}>
              Creating subtopic under parent topic
            </div>
          )}
          <Input label="Topic Name" placeholder="e.g. Chapter 1: Chemical Reactions" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} />
          <Textarea label="Description (optional)" rows={3} value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => setTopicModal(null)}>Cancel</Button>
          <Button variant="primary" loading={savingTopic} onClick={() => saveTopic(topicForm)}>
            {editingTopic ? 'Save Changes' : 'Create Topic'}
          </Button>
        </div>
      </Modal>

      {/* ── Content Modal ── */}
      <Modal
        open={!!contentModal}
        onClose={() => { setContentModal(null); setEditingContent(null); setContentForm(BLANK_CONTENT); setSaveError(''); }}
        title={editingContent ? 'Edit Content' : 'Add Content'}
        size="md"
        preventOutsideClickClose={true}
      >
        <style>{CSS}</style>
        <div className="cd-root">
          <div className="space-y-4">
            <Input label="Title" placeholder="e.g. Introduction to Motion" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} />
            <Select label="Content Type" value={contentForm.content_type} onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value, videoStage: 'idle', noteFile: null, worksheetFile: null, worksheetPreviewUrl: null })} disabled={!!editingContent}>
              <option value="note">Note / PDF</option>
              <option value="video">Video</option>
              <option value="animation">Animation</option>
              <option value="worksheet">Worksheet (Image)</option>
            </Select>

            {contentForm.content_type === 'note' && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>{editingContent ? 'Replace PDF (optional)' : 'Upload PDF'}</p>
                <NoteDropzone file={contentForm.noteFile} onChange={(f) => setContentForm({ ...contentForm, noteFile: f })} existingName={editingContent?.title} />
              </div>
            )}

            {contentForm.content_type === 'video' && (
              <VideoUploader editingContent={editingContent} stage={contentForm.videoStage} progress={contentForm.videoProgress} playbackId={contentForm.videoPlaybackId} titleReady={!!contentForm.title.trim()} onFileSelected={handleVideoUpload} />
            )}

             {contentForm.content_type === 'animation' && (
              <div className="cd-anim-editor-wrap">
                <div className="cd-anim-editor-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {['html', 'css', 'js', 'json', 'output'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setAnimTab(tab)}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          background: animTab === tab ? 'rgba(124,58,237,0.2)' : 'transparent',
                          color: animTab === tab ? 'var(--lavender)' : 'rgba(250,250,250,0.5)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    type="button"
                    className="cd-anim-preview-btn" 
                    onClick={() => {
                      const compiled = compileHtmlContent(contentForm.html_part, contentForm.css_part, contentForm.js_part, contentForm.json_part);
                      setPreviewHtml(compiled || ANIM_PLACEHOLDER);
                    }}
                  >
                    <Eye size={11} /> Live Preview
                  </button>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  {animTab === 'html' && (
                    <textarea 
                      className="cd-anim-textarea" 
                      placeholder="<!-- Paste your HTML layout here -->" 
                      value={contentForm.html_part} 
                      onChange={(e) => setContentForm({ ...contentForm, html_part: e.target.value })} 
                    />
                  )}
                  {animTab === 'css' && (
                    <textarea 
                      className="cd-anim-textarea" 
                      placeholder="/* Paste your CSS styling rules here (without <style> tags) */" 
                      value={contentForm.css_part} 
                      onChange={(e) => setContentForm({ ...contentForm, css_part: e.target.value })} 
                    />
                  )}
                  {animTab === 'js' && (
                    <textarea 
                      className="cd-anim-textarea" 
                      placeholder="// Paste your JavaScript interactive logic here (without <script> tags). Access JSON data using window.ANIMATION_DATA." 
                      value={contentForm.js_part} 
                      onChange={(e) => setContentForm({ ...contentForm, js_part: e.target.value })} 
                    />
                  )}
                  {animTab === 'json' && (
                    <textarea 
                      className="cd-anim-textarea" 
                      placeholder='{ "key": "value", "list": [1, 2, 3] }' 
                      value={contentForm.json_part} 
                      onChange={(e) => setContentForm({ ...contentForm, json_part: e.target.value })} 
                    />
                  )}
                  {animTab === 'output' && (
                    <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#fff', height: '320px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <iframe
                        srcDoc={compileHtmlContent(contentForm.html_part, contentForm.css_part, contentForm.js_part, contentForm.json_part) || ANIM_PLACEHOLDER}
                        title="Animation Preview"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        sandbox="allow-scripts"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {contentForm.content_type === 'worksheet' && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>{editingContent ? 'Replace Image (optional)' : 'Upload image worksheet'}</p>
                <WorksheetDropzone file={contentForm.worksheetFile} previewUrl={contentForm.worksheetPreviewUrl} onChange={(f) => setContentForm({ ...contentForm, worksheetFile: f, worksheetPreviewUrl: URL.createObjectURL(f) })} />
              </div>
            )}

            <Toggle label="Premium content (requires paid plan)" checked={contentForm.is_premium} onChange={(v) => setContentForm({ ...contentForm, is_premium: v })} />
            {saveError && <p style={{ fontSize: '0.74rem', color: '#F87171', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>{saveError}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => { setContentModal(null); setEditingContent(null); setContentForm(BLANK_CONTENT); setSaveError(''); }}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSaveContent}>{editingContent ? 'Save Changes' : 'Add Content'}</Button>
        </div>
      </Modal>

      {/* ── Animation preview modal ── */}
      <Modal open={!!previewHtml} onClose={() => setPreviewHtml(null)} title="Animation Preview" size="xl">
        <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', height: 420 }}>
          {previewHtml && (
            <iframe srcDoc={previewHtml} title="Animation Preview" style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts" />
          )}
        </div>
      </Modal>

      {/* ── Delete Confirm Dialogs ── */}
      <ConfirmDialog open={!!deleteClassId} onClose={() => setDeleteClassId(null)} onConfirm={() => deleteClass(deleteClassId)} title="Delete Class" description="All subjects, topics, and contents under this class will be permanently deleted." danger />
      <ConfirmDialog open={!!deleteSubjectId} onClose={() => setDeleteSubjectId(null)} onConfirm={() => deleteSubject(deleteSubjectId)} title="Delete Subject" description="This subject and all its topics and contents will be permanently deleted." danger />
      <ConfirmDialog open={!!deleteTopicId} onClose={() => setDeleteTopicId(null)} onConfirm={() => deleteTopic(deleteTopicId)} title="Delete Topic" description="This topic and all its contents will be permanently deleted." danger />
      <ConfirmDialog open={!!deleteContentId} onClose={() => setDeleteContentId(null)} onConfirm={() => deleteContent(deleteContentId)} title="Delete Content" description="This content item will be permanently removed." danger />
    </PageWrapper>
  );
}

// ── Sub-component: Topics list inside expanded subject ────────────────────────
function SubjectTopicsPanel({
  subjectId,
  topicsRefreshKey,
  onAddTopic,
  onAddSubtopic,
  onEditTopic,
  onDeleteTopic,
  onAddContent,
  onEditContent,
  onDeleteContent,
  contentRefreshKey
}) {
  const { data: topics, loading } = useApi(
    () => adminApi.getTopics(subjectId), null, [subjectId, topicsRefreshKey]
  );

  const list = topics ?? [];
  const rootTopics = list.filter(t => !t.parent_topic_id);

  return (
    <div className="cd-topics-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Topics & Chapters</span>
        <button className="cd-add-content-btn" style={{ width: 'auto', padding: '0.35rem 0.75rem', marginTop: 0 }} onClick={onAddTopic}>
          <Plus size={11} /> Add Root Topic
        </button>
      </div>

      {loading ? (
        <>{Array(2).fill(0).map((_, i) => <div key={i} className="cd-skel" style={{ height: 46 }} />)}</>
      ) : rootTopics.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', padding: '0.75rem 0' }}>No topics added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {rootTopics.map(rt => (
            <TopicNode
              key={rt.id}
              topic={rt}
              allTopics={list}
              onAddSubtopic={onAddSubtopic}
              onEditTopic={onEditTopic}
              onDeleteTopic={onDeleteTopic}
              onAddContent={onAddContent}
              onEditContent={onEditContent}
              onDeleteContent={onDeleteContent}
              contentRefreshKey={contentRefreshKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Recursive Node Component for unlimited nested subtopics ───────────────────
function TopicNode({
  topic,
  allTopics,
  onAddSubtopic,
  onEditTopic,
  onDeleteTopic,
  onAddContent,
  onEditContent,
  onDeleteContent,
  contentRefreshKey
}) {
  const [isOpen, setIsOpen] = useState(false);
  const childTopics = allTopics.filter(t => t.parent_topic_id === topic.id);

  return (
    <div className="cd-topic-card" style={{ marginLeft: topic.parent_topic_id ? '0.75rem' : '0' }}>
      <div className="cd-topic-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ChevronDown size={12} className={`cd-chevron ${isOpen ? 'open' : ''}`} style={{ opacity: childTopics.length > 0 ? 1 : 0.2 }} />
          <div>
            <span className="cd-topic-name">{topic.name}</span>
            {topic.description && <p className="cd-topic-desc">{topic.description}</p>}
          </div>
        </div>
        <div className="cd-subject-actions" onClick={e => e.stopPropagation()}>
          <button onClick={() => onAddSubtopic(topic)} className="cd-icon-btn edit" style={{ color: 'var(--cyan)' }} title="Add Subtopic"><FolderPlus size={11} /></button>
          <button onClick={() => onEditTopic(topic)} className="cd-icon-btn edit" title="Edit Topic"><Edit2 size={11} /></button>
          <button onClick={() => onDeleteTopic(topic.id)} className="cd-icon-btn delete" title="Delete Topic"><Trash2 size={11} /></button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden', borderLeft: '1px dashed rgba(255,255,255,0.06)' }}
          >
            {/* Child Topics (Recursive) */}
            {childTopics.length > 0 && (
              <div style={{ padding: '0.25rem 0 0.25rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {childTopics.map(ct => (
                  <TopicNode
                    key={ct.id}
                    topic={ct}
                    allTopics={allTopics}
                    onAddSubtopic={onAddSubtopic}
                    onEditTopic={onEditTopic}
                    onDeleteTopic={onDeleteTopic}
                    onAddContent={onAddContent}
                    onEditContent={onEditContent}
                    onDeleteContent={onDeleteContent}
                    contentRefreshKey={contentRefreshKey}
                  />
                ))}
              </div>
            )}

            {/* Topic Resources */}
            <TopicContentPanel
              topicId={topic.id}
              contentRefreshKey={contentRefreshKey}
              onEditContent={(c) => onEditContent(topic.id, c)}
              onDeleteContent={onDeleteContent}
            />

            {/* Two choice actions row */}
            <div className="cd-topic-actions-row">
              <button className="cd-action-choice-btn subtopic" onClick={() => onAddSubtopic(topic)}>
                <FolderPlus size={12} /> Add Subtopic
              </button>
              <button className="cd-action-choice-btn material" onClick={() => onAddContent(topic.id)}>
                <Plus size={12} /> Add Material
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-component: Content list inside expanded Topic ─────────────────────────
function TopicContentPanel({ topicId, contentRefreshKey, onEditContent, onDeleteContent }) {
  const { data: content, loading } = useApi(
    () => adminApi.getSubjectContent(topicId), null, [topicId, contentRefreshKey]
  );
  const items = content ?? [];

  if (!loading && items.length === 0) {
    return null; // hide completely when empty to keep UI clean and compact
  }

  return (
    <div className="cd-panel" style={{ borderBottom: 'none' }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--lavender)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Topic Resources</span>
      {loading ? (
        <>{Array(2).fill(0).map((_, i) => <div key={i} className="cd-skel" style={{ height: 46 }} />)}</>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {items.map((c, i) => {
            const Icon = CONTENT_ICON[c.content_type] ?? FileText;
            return (
              <div key={c.id} className="cd-content-item">
                <div className={`cd-content-icon ${c.content_type}`}><Icon size={12} /></div>
                <p className="cd-content-title">{c.title}</p>
                <span className={`cd-type-badge ${c.content_type}`}>{c.content_type}</span>
                {c.is_premium && <span className="cd-premium-tag" title="Premium"><Lock size={11} /></span>}
                <button onClick={() => onEditContent(c)} className="cd-icon-btn edit" style={{ width: 26, height: 26 }}><Edit2 size={11} /></button>
                <button onClick={() => onDeleteContent(c.id)} className="cd-icon-btn delete" style={{ width: 26, height: 26 }}><Trash2 size={11} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Note drop-zone ────────────────────────────────────────────────────────────
function NoteDropzone({ file, onChange, existingName }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  return (
    <div
      className={clsx('cd-dropzone', drag && 'drag-over', file && 'has-file')}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') onChange(f); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => { const f = e.target.files[0]; if (f) onChange(f); }}
      />
      <div className={clsx('cd-dropzone-icon', file && 'green')}>
        {file ? <CheckCircle2 size={18} color="#6EE7B7" /> : <FilePlus size={18} color="var(--violet-l)" />}
      </div>
      {file ? (
        <span className="cd-file-name"><CheckCircle2 size={12} /> {file.name}</span>
      ) : existingName ? (
        <>
          <span className="cd-dropzone-label">Click or drag to replace</span>
          <span className="cd-dropzone-hint">Current: {existingName} · PDF only · max 20 MB</span>
        </>
      ) : (
        <>
          <span className="cd-dropzone-label">Click or drag a PDF here</span>
          <span className="cd-dropzone-hint">PDF only · max 20 MB</span>
        </>
      )}
    </div>
  );
}

// ── Worksheet drop-zone ───────────────────────────────────────────────────────
function WorksheetDropzone({ file, previewUrl, onChange }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

  const handleFile = (f) => {
    if (f && ACCEPTED.includes(f.type)) onChange(f);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div
        className={clsx('cd-dropzone', drag && 'drag-over', file && 'has-file')}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className={clsx('cd-dropzone-icon', file ? 'green' : 'amber')}>
          {file ? <CheckCircle2 size={18} color="#6EE7B7" /> : <Image size={18} color="#FCD34D" />}
        </div>
        {file ? (
          <span className="cd-file-name"><CheckCircle2 size={12} /> {file.name}</span>
        ) : previewUrl ? (
          <>
            <span className="cd-dropzone-label">Click or drag to replace</span>
            <span className="cd-dropzone-hint">JPG, PNG, WebP · max 10 MB</span>
          </>
        ) : (
          <>
            <span className="cd-dropzone-label">Click or drag an image here</span>
            <span className="cd-dropzone-hint">JPG, PNG, WebP · max 10 MB</span>
          </>
        )}
      </div>

      {/* Live preview of selected or existing image */}
      {previewUrl && (
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

// ── Video uploader ────────────────────────────────────────────────────────────
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