import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  BookOpen, ChevronRight, Play, Eye, FileText, Sparkles, Image,
  Activity, GraduationCap, Video, CheckCircle, ArrowLeft, Clock,
  Trophy, Palette, Gamepad2, Map, Star, ArrowRight
} from 'lucide-react';
import { PageWrapper, Skeleton, Modal } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import MuxPlayer from '@mux/mux-player-react';
import toast from 'react-hot-toast';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Quicksand:wght@600;700;800&display=swap');

  .sd-root {
    --navy:     #080C16;
    --navy2:    #0E1424;
    --violet:   #8B5CF6;
    --violet-l: #A78BFA;
    --cyan:     #06B6D4;
    --cream:    #F4F6FC;
    --muted:    #94A3B8;
    --card-bg:  rgba(255, 255, 255, 0.03);
    --card-bdr: rgba(255, 255, 255, 0.08);

    font-family: 'Quicksand', sans-serif;
    color: var(--cream);
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  html.light .sd-root {
    --navy:     #F0F4F8;
    --navy2:    #FFFFFF;
    --violet:   #7C3AED;
    --violet-l: #8B5CF6;
    --cyan:     #0284C7;
    --cream:    #0F172A;
    --muted:    #64748B;
    --card-bg:  #FFFFFF;
    --card-bdr: #E2E8F0;
  }

  /* Hero Welcome Banner */
  .sd-hero-banner {
    position: relative;
    background: linear-gradient(135deg, rgba(14, 20, 36, 0.95) 0%, rgba(26, 36, 64, 0.9) 100%);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 32px;
    padding: 2.25rem 2.5rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    box-shadow: 0 16px 40px rgba(0,0,0,0.25);
  }

  html.light .sd-hero-banner {
    background: linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 60%, #E0F2FE 100%);
    border-color: #7DD3FC;
    box-shadow: 0 16px 40px rgba(56, 189, 248, 0.15);
  }

  .sd-hero-title {
    font-family: 'Outfit', sans-serif;
    font-size: 2.6rem;
    font-weight: 900;
    margin: 0;
    color: var(--cream);
    line-height: 1.15;
  }

  html.light .sd-hero-title {
    color: #1E1B4B;
  }

  .sd-hero-sub {
    font-size: 0.95rem;
    color: var(--muted);
    font-weight: 700;
    margin-top: 0.6rem;
    max-width: 400px;
    line-height: 1.5;
  }

  html.light .sd-hero-sub {
    color: #475569;
  }

  .sd-hero-btn {
    margin-top: 1.25rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.6rem;
    border-radius: 50px;
    background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
    color: #FFFFFF;
    font-weight: 800;
    font-size: 0.95rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
    transition: all 0.25s ease;
  }

  .sd-hero-btn:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 12px 30px rgba(139, 92, 246, 0.55);
  }

  /* Today's Quest Widget Card */
  .sd-quest-card {
    background: var(--navy2);
    border: 2px solid var(--card-bdr);
    border-radius: 24px;
    padding: 1.35rem 1.5rem;
    width: 270px;
    flex-shrink: 0;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  }

  html.light .sd-quest-card {
    background: #FFFFFF;
    border-color: rgba(255,255,255,0.8);
    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  }

  .sd-quest-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--cream);
    margin-bottom: 0.75rem;
  }

  html.light .sd-quest-header {
    color: #1E1B4B;
  }

  .sd-quest-task {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--muted);
    line-height: 1.4;
  }

  html.light .sd-quest-task {
    color: #475569;
  }

  .sd-quest-bar {
    height: 8px;
    background: rgba(255,255,255,0.1);
    border-radius: 50px;
    overflow: hidden;
    margin: 0.85rem 0 0.6rem;
  }

  html.light .sd-quest-bar {
    background: #E2E8F0;
  }

  .sd-quest-fill {
    height: 100%;
    background: linear-gradient(90deg, #10B981, #34D399);
    border-radius: 50px;
  }

  .sd-quest-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.78rem;
    font-weight: 800;
  }

  /* Dynamic 3D Subject Cards Grid */
  .sd-section-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--cream);
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.25rem;
  }

  .sd-grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.35rem;
  }

  .sd-subject-card {
    background: var(--navy2);
    border: 2px solid var(--card-bdr);
    border-radius: 28px;
    padding: 1.6rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    min-height: 170px;
  }

  .sd-subject-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 16px 35px rgba(139, 92, 246, 0.2);
  }

  .sd-subject-card.active {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
    border-color: var(--violet);
    box-shadow: 0 16px 35px rgba(139, 92, 246, 0.25);
  }

  .sd-subject-icon {
    width: 80px;
    height: 80px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.2rem;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  .sd-subject-card:hover .sd-subject-icon {
    transform: scale(1.04);
  }

  .sd-subj-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.65rem 1.2rem;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 800;
    color: #fff;
    border: none;
    cursor: pointer;
    width: fit-content;
    margin-top: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: transform 0.2s ease;
  }

  /* Topic Sidebar & Resource Panel */
  .sd-dashboard-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  @media (max-width: 920px) {
    .sd-dashboard-layout { grid-template-columns: 1fr; }
  }

  .sd-topic-item {
    background: var(--card-bg);
    border: 1.5px solid var(--card-bdr);
    border-radius: 18px;
    padding: 0.9rem 1.1rem;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.6rem;
  }

  .sd-topic-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--violet);
    transform: translateX(3px);
  }

  .sd-topic-item.active {
    border-color: var(--violet);
    background: linear-gradient(90deg, rgba(139, 92, 246, 0.18) 0%, transparent 100%);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.15);
  }

  .sd-tabs-bar {
    display: flex;
    gap: 0.65rem;
    border-bottom: 2px solid var(--card-bdr);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
    overflow-x: auto;
  }

  .sd-tab-btn {
    padding: 0.6rem 1.15rem;
    border-radius: 16px;
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--muted);
    background: transparent;
    border: 1.5px solid var(--card-bdr);
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
    box-shadow: 0 6px 18px rgba(139, 92, 246, 0.35);
    transform: translateY(-2px) scale(1.02);
  }

  .sd-resource-card {
    background: var(--card-bg);
    border: 1.5px solid var(--card-bdr);
    border-radius: 20px;
    padding: 1.1rem 1.35rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.25s ease;
    margin-bottom: 0.85rem;
  }

  .sd-resource-card:hover {
    border-color: rgba(139, 92, 246, 0.35);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.12);
  }

  .sd-res-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.4rem;
  }

  /* Bottom Superstar Banner */
  .sd-superstar-banner {
    background: linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(139,92,246,0.12) 100%);
    border: 2px solid rgba(245,158,11,0.25);
    border-radius: 28px;
    padding: 1.25rem 1.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .sd-resource-card.highlighted-voice-item {
    border-color: #00D4FF !important;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.45) !important;
    background: rgba(0, 212, 255, 0.08) !important;
    transform: scale(1.02);
    transition: all 0.3s ease;
    animation: voiceHighlightPulse 1.5s infinite alternate;
  }
  @keyframes voiceHighlightPulse {
    from {
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
    }
    to {
      box-shadow: 0 0 22px rgba(0, 212, 255, 0.6);
    }
  }
`;

const getSubjectStyle = (name) => {
  const n = name.toLowerCase();
  if (n.includes('science')) {
    return {
      iconBg: 'rgba(16, 185, 129, 0.18)',
      color: '#10B981',
      avatar: '🧪',
      btnBg: '#10B981',
    };
  }
  if (n.includes('math') || n.includes('arithmetic')) {
    return {
      iconBg: 'rgba(245, 158, 11, 0.18)',
      color: '#F59E0B',
      avatar: '🧮',
      btnBg: '#F59E0B',
    };
  }
  return {
    iconBg: 'rgba(139, 92, 246, 0.18)',
    color: '#A78BFA',
    avatar: '📖',
    btnBg: '#8B5CF6',
  };
};

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('exams');
  const [pendingVoiceAction, setPendingVoiceAction] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [videoToken, setVideoToken] = useState(null);
  const [selectedVideoContent, setSelectedVideoContent] = useState(null);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [voiceLauncherItem, setVoiceLauncherItem] = useState(null);

  const { data: subjectsRes, loading: loadingSubjects } = useApi(
    () => studentApi.getCurriculumSubjects(user.curriculum_id),
    null,
    [user.curriculum_id]
  );
  const subjects = subjectsRes?.data ?? subjectsRes ?? [];

  useEffect(() => {
    if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  useEffect(() => {
    const handleVoiceAction = (action) => {
      if (!action) return;
      toast.success(`Voice Command Captured: ${action.matchedItem || 'No item'} in ${action.subject || 'No subject'}`);
      if (action.tab) {
        setActiveTab(action.tab);
      }
      if (action.matchedItem) {
        setPendingVoiceAction(action);
      }
      if (action.subject && subjects.length > 0) {
        const found = subjects.find(s => 
          s.name.toLowerCase().includes(action.subject.toLowerCase()) || 
          action.subject.toLowerCase().includes(s.name.toLowerCase())
        );
        if (found) {
          setSelectedSubject(found);
        }
      }
    };

    const pending = sessionStorage.getItem('pending_voice_action');
    if (pending) {
      try {
        const action = JSON.parse(pending);
        handleVoiceAction(action);
      } catch (e) {}
      sessionStorage.removeItem('pending_voice_action');
    }

    const onCustomEvent = (e) => handleVoiceAction(e.detail);
    window.addEventListener('VOICE_TUTOR_ACTION', onCustomEvent);
    return () => window.removeEventListener('VOICE_TUTOR_ACTION', onCustomEvent);
  }, [subjects]);

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
        const roots = list.filter(t => !t.parent_topic_id);
        setTopics(roots);
        setLoadingTopics(false);
      })
      .catch(() => {
        toast.error('Failed to load topics');
        setLoadingTopics(false);
      });
  }, [selectedSubject]);

  useEffect(() => {
    if (topics.length === 0) return;

    const pending = pendingVoiceAction;
    let targetTopic = null;

    if (pending && pending.subject && pending.topic) {
      const isSubMatch = selectedSubject && (
        selectedSubject.name.toLowerCase().includes(pending.subject.toLowerCase()) ||
        pending.subject.toLowerCase().includes(selectedSubject.name.toLowerCase())
      );

      if (isSubMatch) {
        const cleanPendingTopic = pending.topic.toLowerCase().replace(/[^\w\s]/g, '').trim();
        targetTopic = topics.find(t => {
          const cleanRootName = t.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
          return cleanRootName.includes(cleanPendingTopic) || cleanPendingTopic.includes(cleanRootName);
        });
      }
    }

    if (targetTopic) {
      if (!selectedTopic || selectedTopic.id !== targetTopic.id) {
        setSelectedTopic(targetTopic);
      }
    } else {
      // Default to first topic if nothing selected or current selection is not in the active subject topics
      const isCurrentTopicInNewTopics = topics.some(t => selectedTopic && t.id === selectedTopic.id);
      if (!isCurrentTopicInNewTopics && topics[0]) {
        setSelectedTopic(topics[0]);
      }
    }
  }, [topics, pendingVoiceAction, selectedSubject, selectedTopic]);

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
        toast.error('No simulator contents found.');
      }
    } catch (e) {
      if (animWindow) animWindow.close();
      toast.error('Failed to open simulation.');
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
      toast.error('Failed to open worksheet');
      if (wsWindow) wsWindow.close();
    }
  };

  useEffect(() => {
    if (pendingVoiceAction && (items.length > 0 || exams.length > 0)) {
      const pending = pendingVoiceAction;
      const match = items.find(item => 
        item.title.toLowerCase().includes(pending.matchedItem.toLowerCase()) ||
        pending.matchedItem.toLowerCase().includes(item.title.toLowerCase())
      );
      
      if (match) {
        setPendingVoiceAction(null);
        if (match.content_type === 'worksheet' || match.content_type === 'animation') {
          setHighlightedItemId(match.id);
          setTimeout(() => {
            const el = document.getElementById(`resource-card-${match.id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
          setTimeout(() => {
            setHighlightedItemId(prev => prev === match.id ? null : prev);
          }, 6000);
        } else if (match.content_type === 'video') {
          handleOpenVideo(match);
        } else if (match.content_type === 'note') {
          handleOpenNote(match);
        }
      } else {
        const examMatch = exams.find(exam => 
          exam.title.toLowerCase().includes(pending.matchedItem.toLowerCase()) ||
          pending.matchedItem.toLowerCase().includes(exam.title.toLowerCase())
        );
        if (examMatch) {
          setPendingVoiceAction(null);
          setHighlightedItemId(examMatch.id);
          setTimeout(() => {
            const el = document.getElementById(`resource-card-${examMatch.id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
          setTimeout(() => {
            setHighlightedItemId(prev => prev === examMatch.id ? null : prev);
          }, 6000);
        }
      }
    }
  }, [pendingVoiceAction, topicContent, items, exams]);

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
  #submitted-overlay { position: absolute; inset: 0; background: rgba(10,14,26,0.92); backdrop-filter: blur(8px); display: none; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem; border-radius: 12px; opacity: 0; transition: opacity 0.3s; z-index: 20; }
  #submitted-overlay.show { display: flex; opacity: 1; }
  .sub-icon { font-size: 2.8rem; margin-bottom: 0.6rem; }
  .sub-title { font-size: 1.25rem; font-weight: 700; color: #34D399; margin-bottom: 0.35rem; }
  .sub-desc { font-size: 0.8rem; color: rgba(245,240,232,0.6); max-width: 320px; line-height: 1.45; margin-bottom: 1.5rem; }
  .sub-btns { display: flex; gap: 0.75rem; }
  .sub-btn { padding: 0.55rem 1.1rem; border-radius: 9px; font-weight: 700; font-size: 0.8rem; color: #fff; border: none; cursor: pointer; transition: transform 0.15s; }
  .sub-btn:hover { transform: translateY(-1px); }
  #submit-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 1rem; background: rgba(10,14,26,0.95); border-top: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
  #submit-bar .hint { font-size: 0.72rem; color: rgba(245,240,232,0.4); }
  #submitBtn { background: linear-gradient(135deg, #10B981, #059669); border: none; border-radius: 9px; padding: 0.5rem 1.3rem; font-weight: 700; font-size: 0.82rem; color: #fff; cursor: pointer; transition: transform 0.15s, opacity 0.15s; box-shadow: 0 4px 14px rgba(16,185,129,0.3); }
  #submitBtn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
  #submitBtn:not(:disabled):hover { transform: translateY(-1px); }
</style>
</head>
<body>
<div id="toolbar">
  <button class="tool active" id="btnPen" title="Pen">&#9999;&#65039;</button>
  <button class="tool" id="btnEraser" title="Eraser">&#9003;</button>
  <div class="sep"></div>
  <span class="size-label">Size: <span id="sizeVal">3</span>px</span>
  <input type="range" id="sizeRange" min="1" max="30" value="3" />
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
        <button class="sub-btn" id="btnClose" style="background:rgba(255,255,255,0.08)">&#10005; Close</button>
      </div>
    </div>
  </div>
</div>
<div id="submit-bar">
  <p class="hint">Draw on the worksheet, then click Submit.</p>
  <button id="submitBtn" disabled>&#10003; Submit</button>
</div>
<script>
  const img = document.getElementById('wsImg');
  const overlay = document.getElementById('overlay');
  const ctx = overlay.getContext('2d');
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
  };
  document.getElementById('btnEraser').onclick = () => {
    tool = 'eraser';
    document.getElementById('btnEraser').classList.add('active');
    document.getElementById('btnPen').classList.remove('active');
    document.getElementById('swatches').style.display = 'none';
  };
  document.getElementById('btnClear').onclick = () => ctx.clearRect(0, 0, overlay.width, overlay.height);
  document.getElementById('sizeRange').oninput = (e) => { size = +e.target.value; document.getElementById('sizeVal').textContent = size; };

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
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
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
    if (window.opener && typeof window.opener.onWorksheetSubmit === 'function') {
      window.opener.onWorksheetSubmit('${contentId}');
    }
  };
  document.getElementById('btnRetry').onclick = () => { subOver.classList.remove('show'); ctx.clearRect(0, 0, overlay.width, overlay.height); };
  document.getElementById('btnClose').onclick = () => window.close();
</script>
</body>
</html>`;
    if (!wsWindow) return;
    wsWindow.document.open();
    wsWindow.document.write(html);
    wsWindow.document.close();
  };

  const firstName = user?.full_name?.split(' ')?.[0] ?? 'Learner';

  const notesAndVideos = items.filter(c => c.content_type === 'note' || c.content_type === 'video');
  const simulators = items.filter(c => c.content_type === 'animation');
  const worksheets = items.filter(c => c.content_type === 'worksheet');

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="sd-root">
        
        {/* ── 1. Animated Hero Welcome Banner ── */}
        <motion.div
          className="sd-hero-banner"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Left Text & CTA */}
          <div style={{ flex: 1, zIndex: 5 }}>
            <div className="sd-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1.1rem', borderRadius: '50px', background: 'rgba(139,92,246,0.15)', border: '1.5px solid rgba(139,92,246,0.3)', color: '#A78BFA', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              🎓 Cambridge Primary Quest
            </div>
            <h1 className="sd-hero-title">
              Hello, {firstName}! 👋
            </h1>
            <p className="sd-hero-sub">
              Ready for a learning adventure?<br />
              Explore fun lessons, exciting activities, and amazing discoveries today! 🚀
            </p>
          </div>

          {/* Animated Mascot Lottie Graphic */}
          <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DotLottieReact
              src="/header_card_animation.json"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </motion.div>

        {/* ── 2. Dynamic 3D Subjects List Grid ── */}
        <div>
          <div className="sd-section-title">
            <span>Explore Subjects</span> <Sparkles size={20} color="#F59E0B" />
          </div>

          {loadingSubjects ? (
            <div className="sd-grid-3">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} style={{ height: 160, borderRadius: 28 }} />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontWeight: 700 }}>No subjects allocated yet.</div>
          ) : (
            <div className="sd-grid-3">
              {subjects.map((sub, i) => {
                const isActive = selectedSubject?.id === sub.id;
                const style = getSubjectStyle(sub.name);
                return (
                  <motion.div
                    key={sub.id}
                    className={`sd-subject-card ${isActive ? 'active' : ''}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    onClick={() => setSelectedSubject(isActive ? null : sub)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: style.color }}>
                          {sub.name}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.35rem', margin: 0, fontWeight: 600, maxWidth: '210px' }}>
                          {sub.description || 'Access worksheets, games & illustrated stories.'}
                        </p>
                      </div>
                      {(() => {
                        const sName = sub.name.toLowerCase();
                        const isEnglish = sName.includes('english');
                        const isMath = sName.includes('math') || sName.includes('arithmetic');
                        const isScience = sName.includes('science');
                        const isLottie = isEnglish || isMath || isScience;
                        const lottieSrc = isEnglish ? '/english_animation.json' : isMath ? '/maths_animation.json' : isScience ? '/Science_animation.json' : null;

                        return (
                          <div
                            className={`sd-subject-icon ${isLottie ? '' : 'shadow-inner'}`}
                            style={{ background: isLottie ? 'transparent' : style.iconBg, overflow: 'hidden' }}
                          >
                            {isLottie ? (
                              <DotLottieReact
                                src={lottieSrc}
                                loop
                                autoplay
                                style={{ width: '85px', height: '85px' }}
                              />
                            ) : (
                              style.avatar
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <button className="sd-subj-btn" style={{ background: style.btnBg }}>
                      {isActive ? 'Selected' : `Explore ${sub.name}`} <ArrowRight size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. Selected Subject Split View (Topics & Learning Resources) ── */}
        <AnimatePresence mode="wait">
          {selectedSubject && (
            <motion.div
              className="sd-dashboard-layout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Sidebar: Adventure Topics */}
              <div style={{ background: 'var(--navy2)', border: '2px solid var(--card-bdr)', borderRadius: '28px', padding: '1.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <Activity size={18} style={{ color: 'var(--violet-l)' }} />
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    Adventure Topics 🎯
                  </h3>
                </div>

                {loadingTopics ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} style={{ height: 48, borderRadius: 18 }} />
                    ))}
                  </div>
                ) : topics.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '1.5rem 0', fontWeight: 700 }}>No topics found.</p>
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
                          <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>{t.name}</span>
                          <ChevronRight size={15} style={{ color: isAct ? 'var(--violet)' : 'var(--muted)' }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Main Contents Panel */}
              <div style={{ background: 'var(--navy2)', border: '2px solid var(--card-bdr)', borderRadius: '28px', padding: '1.65rem' }}>
                {selectedTopic ? (
                  <>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                      {selectedTopic.name}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.35rem', fontWeight: 600 }}>
                      {selectedTopic.description || 'Interactive games, coloring sheets & challenge mock checkpoints.'}
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

                    {/* Resource Lists */}
                    {loadingContents ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Array(3).fill(0).map((_, i) => (
                          <Skeleton key={i} style={{ height: 60, borderRadius: 20 }} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ minHeight: '200px' }}>
                        {activeTab === 'notes' && (
                          notesAndVideos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontWeight: 700 }}>No study guides available yet.</div>
                          ) : (
                            notesAndVideos.map((c) => (
                              <div key={c.id} id={`resource-card-${c.id}`} className={`sd-resource-card ${highlightedItemId === c.id ? 'highlighted-voice-item' : ''}`}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div className="sd-res-icon-wrapper" style={{ background: c.content_type === 'video' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(6, 182, 212, 0.15)' }}>
                                    {c.content_type === 'video' ? '🎥' : '📖'}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{c.title}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
                                      {c.content_type === 'video' ? 'Watch Video Story' : 'Read Illustrated Story Book'}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  className="sd-subj-btn"
                                  style={{
                                    background: c.content_type === 'video' ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' : 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                                    margin: 0
                                  }}
                                  onClick={() => c.content_type === 'video' ? handleOpenVideo(c) : handleOpenNote(c)}
                                >
                                  {c.content_type === 'video' ? <Play size={14} /> : <Eye size={14} />}
                                  {c.content_type === 'video' ? 'Watch Story' : 'Read Story'}
                                </button>
                              </div>
                            ))
                          )
                        )}

                        {activeTab === 'simulators' && (
                          simulators.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontWeight: 700 }}>No game simulators available yet.</div>
                          ) : (
                            simulators.map((c) => (
                              <div key={c.id} id={`resource-card-${c.id}`} className={`sd-resource-card ${highlightedItemId === c.id ? 'highlighted-voice-item' : ''}`}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div className="sd-res-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                                    🎮
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{c.title}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>Playful 3D Simulation Game</div>
                                  </div>
                                </div>
                                <button 
                                  className="sd-subj-btn" 
                                  style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', margin: 0 }}
                                  onClick={() => handleOpenAnimation(c)}
                                >
                                  <Play size={14} /> Play Game
                                </button>
                              </div>
                            ))
                          )
                        )}

                        {activeTab === 'worksheets' && (
                          worksheets.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontWeight: 700 }}>No worksheets available yet.</div>
                          ) : (
                            worksheets.map((c) => (
                              <div key={c.id} id={`resource-card-${c.id}`} className={`sd-resource-card ${highlightedItemId === c.id ? 'highlighted-voice-item' : ''}`}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div className="sd-res-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                                    🎨
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{c.title}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>Drawable Coloring Sheet</div>
                                  </div>
                                </div>
                                <button 
                                  className="sd-subj-btn" 
                                  style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', margin: 0 }}
                                  onClick={() => handleOpenWorksheet(c)}
                                >
                                  <Eye size={14} /> Start Sketching
                                </button>
                              </div>
                            ))
                          )
                        )}

                        {activeTab === 'exams' && (
                          exams.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontWeight: 700 }}>No mock quests found.</div>
                          ) : (
                            exams.map((e) => (
                              <div key={e.id} id={`resource-card-${e.id}`} className={`sd-resource-card ${highlightedItemId === e.id ? 'highlighted-voice-item' : ''}`}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div className="sd-res-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                                    🏆
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{e.title}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>⏱️ {e.duration_minutes} Mins Challenge Quest</div>
                                  </div>
                                </div>
                                <button
                                  className="sd-subj-btn"
                                  style={{ background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)', margin: 0 }}
                                  onClick={() => window.open(`/exams/${e.id}/take`, '_blank')}
                                >
                                  <CheckCircle size={14} /> Start Quest
                                </button>
                              </div>
                            ))
                          )
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)', fontWeight: 700 }}>
                    Please select a topic from the sidebar.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 4. Bottom Superstar Mascot Banner ── */}
        <div className="sd-superstar-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '105px', height: '105px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DotLottieReact
                src="/Cute Tiger_animation.json"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--cream)' }}>
                Keep going, superstar! ⭐
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.2rem', fontWeight: 700 }}>
                Every lesson brings you one step closer to your dreams!
              </div>
            </div>
          </div>
          <div style={{ width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DotLottieReact
              src="/UFO_animation.json"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

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
