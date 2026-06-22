import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Edit2, GripVertical,
  FileText, Video, Sparkles, ChevronDown, Lock,
  Eye, Code2, UploadCloud, CheckCircle2, Loader2,
  FilePlus, X,
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

  /* ── SUBJECT CARDS ── */
  .cd-subject-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .cd-subject {
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 20px; overflow: hidden; backdrop-filter: blur(12px);
    transition: border-color 0.3s;
  }
  .cd-subject:hover { border-color: rgba(124,58,237,0.2); }
  .cd-subject.is-open { border-color: rgba(124,58,237,0.28); }

  .cd-subject-header {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.95rem 1.15rem; cursor: pointer; transition: background 0.2s;
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
  .cd-content-title { flex: 1; min-width: 0; font-size: 0.78rem; font-weight: 600; color: var(--cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cd-type-badge {
    display: inline-flex; align-items: center; padding: 0.14rem 0.5rem;
    border-radius: 50px; font-size: 0.58rem; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid; flex-shrink: 0;
  }
  .cd-type-badge.note      { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color: var(--muted); }
  .cd-type-badge.video     { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.3); color: var(--lavender); }
  .cd-type-badge.animation { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: #6EE7B7; }
  .cd-premium-tag { color: #FCD34D; flex-shrink: 0; }
  .cd-add-content-btn {
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    padding: 0.6rem; border-radius: 14px;
    border: 1px dashed rgba(124,58,237,0.25);
    background: transparent; color: var(--muted);
    font-size: 0.75rem; font-weight: 600; cursor: pointer;
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
  .cd-dropzone-icon.green { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); }
  .cd-dropzone-label { font-size: 0.78rem; font-weight: 600; color: var(--cream); }
  .cd-dropzone-hint  { font-size: 0.68rem; color: var(--muted); }
  .cd-file-name {
    font-size: 0.72rem; font-weight: 600; color: #6EE7B7;
    display: flex; align-items: center; gap: 0.35rem;
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
`;

const CONTENT_ICON = { note: FileText, video: Video, animation: Sparkles };

const BLANK_SUBJECT = { name: '', description: '' };
const BLANK_CONTENT = {
  title: '', content_type: 'note',
  // note
  noteFile: null,
  // video – tracked across 3 stages: idle → uploading → confirming → done
  videoStage: 'idle',   // 'idle' | 'uploading' | 'confirming' | 'done'
  videoFile: null,
  videoProgress: 0,
  videoContentId: null,
  videoUploadId: null,
  videoPlaybackId: null,
  // animation
  html_content: '',
  is_premium: false,
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function CurriculumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expandedSubject, setExpandedSubject] = useState(null);
  const [subjectModal, setSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState(BLANK_SUBJECT);
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);

  const [contentModal, setContentModal] = useState(null); // holds subjectId
  const [editingContent, setEditingContent] = useState(null);
  const [contentForm, setContentForm] = useState(BLANK_CONTENT);
  const [deleteContentId, setDeleteContentId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);

  const { data: curriculum, loading, refetch } = useApi(
    () => adminApi.getCurriculum(id), null, [id]
  );

  // ── Subject mutations ────────────────────────────────────────────────────────
  const { mutate: saveSubject, loading: savingSubject } = useMutation(
    (data) => editingSubject
      ? adminApi.updateSubject(editingSubject.id, data)
      : adminApi.createSubject(id, data),
    {
      onSuccess: () => { setSubjectModal(false); setEditingSubject(null); refetch(); },
      successMsg: editingSubject ? 'Subject updated' : 'Subject created',
    }
  );

  const { mutate: deleteSubject } = useMutation(adminApi.deleteSubject, {
    onSuccess: () => { setDeleteSubjectId(null); refetch(); },
    successMsg: 'Subject deleted',
  });

  // ── Content save ─────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSaveContent = async () => {
    setSaveError('');
    setSaving(true);
    try {
      const f = contentForm;

      if (f.content_type === 'note') {
        // ── NOTE ──────────────────────────────────────────────────────────────
        if (editingContent) {
          // Edit: may or may not include a new file
          const fd = new FormData();
          fd.append('title', f.title);
          fd.append('is_premium', String(f.is_premium));
          if (f.noteFile) fd.append('file', f.noteFile);
          await adminApi.replaceNote(editingContent.id, fd);
        } else {
          // Create: file is required
          if (!f.noteFile) { setSaveError('Please select a PDF file.'); setSaving(false); return; }
          const fd = new FormData();
          fd.append('title', f.title);
          fd.append('is_premium', String(f.is_premium));
          fd.append('file', f.noteFile);
          await adminApi.uploadNote(contentModal, fd);
        }

      } else if (f.content_type === 'video') {
        // ── VIDEO ─────────────────────────────────────────────────────────────
        if (editingContent) {
          // Editing video: only allow title/premium update (file replacement not supported in UI for now)
          await adminApi.updateContent(editingContent.id, { title: f.title, is_premium: f.is_premium });
        } else {
          // New video: must have completed the upload flow
          if (f.videoStage !== 'done') {
            setSaveError('Please upload a video file first.');
            setSaving(false);
            return;
          }
          // Content row is already created on the backend; just update title/premium
          await adminApi.updateContent(f.videoContentId, { title: f.title, is_premium: f.is_premium });
        }

      } else if (f.content_type === 'animation') {
        // ── ANIMATION ─────────────────────────────────────────────────────────
        if (!f.html_content.trim()) { setSaveError('Paste the animation HTML/CSS/JS code.'); setSaving(false); return; }
        const animRes = await adminApi.upsertAnimation({
          title: f.title,
          html_content: f.html_content,
          subject_id: contentModal,
          animation_id: editingContent?.animation_id ?? null,
          is_premium: f.is_premium,
        });
        const animationId = animRes.data?.data?.id ?? animRes.data?.id;
        const payload = { title: f.title, content_type: 'animation', animation_id: animationId, is_premium: f.is_premium };
        if (editingContent) {
          await adminApi.updateContent(editingContent.id, payload);
        } else {
          await adminApi.addContent(contentModal, payload);
        }
      }

      setContentModal(null);
      setEditingContent(null);
      setContentForm(BLANK_CONTENT);
      refetch();
    } catch (err) {
      setSaveError(err?.response?.data?.message ?? err?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const { mutate: deleteContent } = useMutation(adminApi.deleteContent, {
    onSuccess: () => { setDeleteContentId(null); refetch(); },
    successMsg: 'Content deleted',
  });

  // ── Mux direct upload ────────────────────────────────────────────────────────
  const handleVideoUpload = async (file) => {
    if (!contentForm.title.trim()) {
      setSaveError('Enter a title before uploading the video.');
      return;
    }
    setSaveError('');
    setContentForm(f => ({ ...f, videoFile: file, videoStage: 'uploading', videoProgress: 0 }));

    try {
      // Step 1: get upload URL + placeholder content row
      const res = await adminApi.createMuxUpload(contentModal, {
        title: contentForm.title,
        is_premium: String(contentForm.is_premium),
      });
      const { uploadUrl, uploadId, content_id } = res.data;
      setContentForm(f => ({ ...f, videoContentId: content_id, videoUploadId: uploadId }));

      // Step 2: PUT file directly to Mux
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

      // Step 3: confirm with backend (polls Mux for playback_id)
      setContentForm(f => ({ ...f, videoStage: 'confirming', videoProgress: 100 }));
      const confirmRes = await adminApi.confirmMuxUpload(content_id, { upload_id: uploadId });
      const confirmData = confirmRes.data;

      if (confirmData.processing) {
        // Mux still processing — leave in confirming state; user can save and it will update later
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

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const openCreateSubject = () => { setEditingSubject(null); setSubjectForm(BLANK_SUBJECT); setSubjectModal(true); };
  const openEditSubject = (s) => {
    setEditingSubject(s);
    setSubjectForm({ name: s.name, description: s.description ?? '' });
    setSubjectModal(true);
  };
  const openAddContent = (subjectId) => {
    setEditingContent(null);
    setContentForm(BLANK_CONTENT);
    setSaveError('');
    setContentModal(subjectId);
  };
  const openEditContent = (subjectId, c) => {
    setEditingContent(c);
    setSaveError('');
    setContentForm({
      ...BLANK_CONTENT,
      title: c.title,
      content_type: c.content_type,
      html_content: c.html_content ?? '',
      is_premium: c.is_premium,
      // For video editing, treat as already done (we have the existing playback id)
      videoStage: c.content_type === 'video' ? 'done' : 'idle',
      videoPlaybackId: c.mux_playback_id ?? null,
    });
    setContentModal(subjectId);
  };

  const subjects = curriculum?.subjects ?? [];

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
              <p className="cd-subtitle">{subjects.length} subject{subjects.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button className="cd-btn-primary" onClick={openCreateSubject}>
            <Plus size={14} /> Add Subject
          </button>
        </motion.div>

        {/* ── Subjects ── */}
        {subjects.length === 0 ? (
          <motion.div className="cd-empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
            <div className="cd-empty-icon"><Plus size={22} style={{ color: 'var(--violet-l)' }} /></div>
            <p className="cd-empty-title">No subjects yet</p>
            <p className="cd-empty-desc">Add your first subject to organize this curriculum.</p>
            <button className="cd-btn-primary" onClick={openCreateSubject}><Plus size={14} /> Add Subject</button>
          </motion.div>
        ) : (
          <motion.div className="cd-subject-list" variants={listContainer} initial="hidden" animate="show">
            {subjects.map((subject, idx) => {
              const isOpen = expandedSubject === subject.id;
              return (
                <motion.div key={subject.id} className={`cd-subject ${isOpen ? 'is-open' : ''}`} variants={subjectVariant} layout>
                  <div className="cd-subject-header" onClick={() => setExpandedSubject(isOpen ? null : subject.id)}>
                    <GripVertical size={13} className="cd-grip" />
                    <span className="cd-subject-idx">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="cd-subject-info">
                      <p className="cd-subject-name">{subject.name}</p>
                      {subject.description && <p className="cd-subject-desc">{subject.description}</p>}
                    </div>
                    <div className="cd-subject-actions">
                      <button onClick={(e) => { e.stopPropagation(); openEditSubject(subject); }} className="cd-icon-btn edit" title="Edit subject"><Edit2 size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteSubjectId(subject.id); }} className="cd-icon-btn delete" title="Delete subject"><Trash2 size={12} /></button>
                      <ChevronDown size={14} className={`cd-chevron ${isOpen ? 'open' : ''}`} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div key="panel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ overflow: 'hidden' }}>
                        <SubjectContentPanel
                          subjectId={subject.id}
                          onAddContent={() => openAddContent(subject.id)}
                          onEditContent={(c) => openEditContent(subject.id, c)}
                          onDeleteContent={(cId) => setDeleteContentId(cId)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── Subject modal ── */}
      <Modal open={subjectModal} onClose={() => { setSubjectModal(false); setEditingSubject(null); }} title={editingSubject ? 'Edit Subject' : 'New Subject'} size="sm">
        <div className="space-y-4">
          <Input label="Subject Name" placeholder="e.g. Physics — Kinematics" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
          <Textarea label="Description (optional)" rows={3} value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => setSubjectModal(false)}>Cancel</Button>
          <Button variant="primary" loading={savingSubject} onClick={() => saveSubject(subjectForm)}>
            {editingSubject ? 'Save Changes' : 'Create Subject'}
          </Button>
        </div>
      </Modal>

      {/* ── Content modal ── */}
      <Modal
        open={!!contentModal}
        onClose={() => { setContentModal(null); setEditingContent(null); setContentForm(BLANK_CONTENT); setSaveError(''); }}
        title={editingContent ? 'Edit Content' : 'Add Content'}
        size="md"
      >
        <style>{CSS}</style>
        <div className="cd-root">
          <div className="space-y-4">

            {/* Title */}
            <Input
              label="Title"
              placeholder="e.g. Introduction to Motion"
              value={contentForm.title}
              onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
            />

            {/* Type selector (disabled when editing — type can't change) */}
            <Select
              label="Content Type"
              value={contentForm.content_type}
              onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value, videoStage: 'idle', noteFile: null })}
              disabled={!!editingContent}
            >
              <option value="note">Note / PDF</option>
              <option value="video">Video</option>
              <option value="animation">Animation</option>
            </Select>

            {/* ── NOTE: file picker ── */}
            {contentForm.content_type === 'note' && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  {editingContent ? 'Replace PDF (optional — leave empty to keep existing)' : 'Upload PDF'}
                </p>
                <NoteDropzone
                  file={contentForm.noteFile}
                  onChange={(f) => setContentForm({ ...contentForm, noteFile: f })}
                  existingName={editingContent?.title}
                />
              </div>
            )}

            {/* ── VIDEO: Mux direct upload ── */}
            {contentForm.content_type === 'video' && (
              <VideoUploader
                editingContent={editingContent}
                stage={contentForm.videoStage}
                progress={contentForm.videoProgress}
                playbackId={contentForm.videoPlaybackId}
                titleReady={!!contentForm.title.trim()}
                onFileSelected={handleVideoUpload}
              />
            )}

            {/* ── ANIMATION: code editor ── */}
            {contentForm.content_type === 'animation' && (
              <div>
                <div className="cd-anim-editor-wrap">
                  <div className="cd-anim-editor-toolbar">
                    <span className="cd-anim-editor-label"><Code2 size={12} /> HTML · CSS · JS</span>
                    <button className="cd-anim-preview-btn" onClick={() => setPreviewHtml(contentForm.html_content || ANIM_PLACEHOLDER)}>
                      <Eye size={11} /> Preview
                    </button>
                  </div>
                  <textarea
                    className="cd-anim-textarea"
                    placeholder={ANIM_PLACEHOLDER}
                    value={contentForm.html_content}
                    onChange={(e) => setContentForm({ ...contentForm, html_content: e.target.value })}
                    spellCheck={false}
                    rows={12}
                  />
                </div>
                <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.4rem', paddingLeft: '0.25rem' }}>
                  Paste a complete single-page HTML document. Inline CSS &amp; JS are supported.
                </p>
              </div>
            )}

            <Toggle
              label="Premium content (requires paid plan)"
              checked={contentForm.is_premium}
              onChange={(v) => setContentForm({ ...contentForm, is_premium: v })}
            />

            {saveError && (
              <p style={{ fontSize: '0.74rem', color: '#F87171', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                {saveError}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
          <Button variant="ghost" onClick={() => { setContentModal(null); setEditingContent(null); setContentForm(BLANK_CONTENT); setSaveError(''); }}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSaveContent}>
            {editingContent ? 'Save Changes' : 'Add Content'}
          </Button>
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

      {/* ── Delete subject ── */}
      <ConfirmDialog open={!!deleteSubjectId} onClose={() => setDeleteSubjectId(null)} onConfirm={() => deleteSubject(deleteSubjectId)} title="Delete Subject" description="This will permanently delete the subject and all its content items." danger />

      {/* ── Delete content ── */}
      <ConfirmDialog open={!!deleteContentId} onClose={() => setDeleteContentId(null)} onConfirm={() => deleteContent(deleteContentId)} title="Delete Content" description="This content item will be permanently removed." danger />
    </PageWrapper>
  );
}

// ── Sub-component: content list inside expanded subject ───────────────────────
function SubjectContentPanel({ subjectId, onAddContent, onEditContent, onDeleteContent }) {
  const { data: content, loading } = useApi(
    () => adminApi.getSubjectContent(subjectId), null, [subjectId]
  );
  const items = content ?? [];
  return (
    <div className="cd-panel">
      {loading ? (
        <>{Array(2).fill(0).map((_, i) => <div key={i} className="cd-skel" style={{ height: 46 }} />)}</>
      ) : items.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', padding: '1rem 0' }}>
          No content yet — add notes, videos, or animations.
        </p>
      ) : (
        <AnimatePresence>
          {items.map((c, i) => {
            const Icon = CONTENT_ICON[c.content_type] ?? FileText;
            return (
              <motion.div key={c.id} className="cd-content-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.25 }}>
                <div className={`cd-content-icon ${c.content_type}`}><Icon size={12} /></div>
                <p className="cd-content-title">{c.title}</p>
                <span className={`cd-type-badge ${c.content_type}`}>{c.content_type}</span>
                {c.is_premium && <span className="cd-premium-tag" title="Premium"><Lock size={11} /></span>}
                <button onClick={() => onEditContent(c)} className="cd-icon-btn edit" style={{ width: 26, height: 26 }}><Edit2 size={11} /></button>
                <button onClick={() => onDeleteContent(c.id)} className="cd-icon-btn delete" style={{ width: 26, height: 26 }}><Trash2 size={11} /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
      <button className="cd-add-content-btn" onClick={onAddContent}><Plus size={12} /> Add content</button>
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

// ── Video uploader ────────────────────────────────────────────────────────────
function VideoUploader({ editingContent, stage, progress, playbackId, titleReady, onFileSelected }) {
  const inputRef = useRef(null);

  if (editingContent) {
    // When editing a video content item, we only allow title/premium edits.
    // Full re-upload would require deleting the old Mux asset first — show info instead.
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