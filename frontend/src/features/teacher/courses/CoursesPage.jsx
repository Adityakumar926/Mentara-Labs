import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, Search, ChevronDown, ChevronUp, FolderTree, Layers, Check, Sparkles, BookOpen, Eye, ArrowRight, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, EmptyState, Modal } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import PdfViewerModal from '@/components/shared/PdfViewerModal';
import toast from 'react-hot-toast';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  .cp-root {
    --navy:       var(--local-navy, #0A0E1A);
    --navy2:      var(--local-navy2, #0F1629);
    --violet:     #7C3AED;
    --violet-l:   var(--local-violet-l, #9D6FEF);
    --cyan:       var(--local-cyan, #00D4FF);
    --cream:      var(--local-cream, #F5F0E8);
    --lavender:   var(--local-lavender, #C4B5FD);
    --muted:      var(--local-muted, rgba(245,240,232,0.45));
    --card-bg:    rgba(255, 255, 255, 0.02);
    --card-bdr:   rgba(255, 255, 255, 0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .cp-root *, .cp-root *::before, .cp-root *::after { box-sizing: border-box; }

  /* ── HEADER ── */
  .cp-header {
    position: relative;
    background: linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.12) 60%, rgba(10,14,26,0.5) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    padding: 2.25rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .cp-header-image {
    width: 170px;
    height: 120px;
    object-fit: contain;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  @media (max-width: 767px) {
    .cp-header-image { display: none; }
  }
  .cp-header-blob-1 {
    position: absolute; width: 250px; height: 250px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 70%);
    top: -60px; left: -40px; pointer-events: none; filter: blur(60px);
  }
  .cp-header-blob-2 {
    position: absolute; width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    bottom: -50px; right: -20px; pointer-events: none; filter: blur(60px);
  }
  .cp-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2);
    padding: 0.35rem 0.95rem; border-radius: 50px;
    font-size: 0.7rem; font-weight: 700; color: var(--cyan);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.65rem;
  }
  .eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: cp-blink 2s ease infinite;
  }
  @keyframes cp-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  
  .cp-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.5rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1.1;
    background: linear-gradient(135deg, #FFFFFF 0%, var(--lavender) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.4rem;
  }
  .cp-subtitle { font-size: 0.88rem; color: var(--muted); font-weight: 500; }

  /* ── TOOLBAR (SEARCH + CUSTOM GLASS DROPDOWN) ── */
  .cp-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
  }

  /* CUSTOM DROPDOWN CONTAINER */
  .cp-dropdown-wrap {
    position: relative;
    min-width: 260px;
  }
  .cp-dropdown-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1.25rem;
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    color: #ffffff;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    backdrop-filter: blur(16px);
    transition: all 0.25s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  .cp-dropdown-btn:hover, .cp-dropdown-btn.open {
    border-color: rgba(0, 212, 255, 0.5);
    background: rgba(0, 212, 255, 0.08);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
    color: var(--cyan);
  }

  .cp-dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 100%;
    min-width: 280px;
    background: rgba(15, 22, 41, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    padding: 0.5rem;
    z-index: 50;
    backdrop-filter: blur(24px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 212, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 320px;
    overflow-y: auto;
  }
  .cp-dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 0.95rem;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--cream);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .cp-dropdown-item:hover {
    background: rgba(0, 212, 255, 0.12);
    color: var(--cyan);
  }
  .cp-dropdown-item.active {
    background: rgba(0, 212, 255, 0.18);
    color: var(--cyan);
    font-weight: 700;
    border: 1px solid rgba(0, 212, 255, 0.3);
  }
  .cp-item-badge {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--lavender);
    background: rgba(124, 58, 237, 0.2);
    padding: 0.15rem 0.55rem;
    border-radius: 50px;
  }

  .cp-search-wrap {
    position: relative;
    min-width: 260px;
    flex: 1;
    max-width: 380px;
  }
  .cp-search-input {
    width: 100%;
    padding: 0.75rem 1.1rem 0.75rem 2.6rem;
    border-radius: 16px;
    border: 1px solid var(--card-bdr);
    background: rgba(15, 22, 41, 0.75);
    color: #ffffff;
    font-size: 0.88rem;
    outline: none;
    transition: all 0.2s ease;
    backdrop-filter: blur(16px);
  }
  .cp-search-input:focus {
    border-color: rgba(0, 212, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
  }
  .cp-search-icon {
    position: absolute;
    left: 0.95rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
  }

  /* ── STAGE SECTION (Stage 1 to N) ── */
  .cp-stage-card {
    background: rgba(15, 22, 41, 0.65);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    overflow: hidden;
    margin-bottom: 2rem;
    backdrop-filter: blur(20px);
  }
  .cp-stage-header {
    padding: 1.5rem 1.75rem;
    background: linear-gradient(90deg, rgba(124, 58, 237, 0.15) 0%, rgba(0, 212, 255, 0.06) 100%);
    border-bottom: 1px solid var(--card-bdr);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .cp-stage-name {
    font-family: 'Outfit', sans-serif;
    font-size: 1.6rem;
    font-weight: 900;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    letter-spacing: -0.02em;
  }
  .cp-stage-badge {
    padding: 0.25rem 0.8rem;
    border-radius: 50px;
    background: rgba(124, 58, 237, 0.25);
    border: 1px solid rgba(124, 58, 237, 0.4);
    font-size: 0.72rem;
    color: var(--lavender);
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* ── SUBJECT GRID INSIDE STAGE ── */
  .cp-subjects-container {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }

  .cp-subject-card {
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid var(--card-bdr);
    border-radius: 20px;
    padding: 1.25rem;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
  }
  .cp-subject-card:hover {
    border-color: rgba(0, 212, 255, 0.35);
    background: rgba(0, 212, 255, 0.04);
    box-shadow: 0 10px 30px -10px rgba(0, 212, 255, 0.18);
  }

  .cp-subj-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .cp-subj-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.01em;
  }

  /* ── TOPICS TREE ACCORDION ── */
  .cp-topics-list {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 0.75rem;
  }
  .cp-topic-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.6rem 0.85rem;
    border-radius: 12px;
    background: rgba(15, 22, 41, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
  }
  .cp-topic-item:hover {
    background: rgba(124, 58, 237, 0.18);
    border-color: rgba(124, 58, 237, 0.35);
    transform: translateX(3px);
  }
  .cp-topic-name {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--cream);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .cp-topic-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: var(--muted);
  }
  .cp-meta-chip {
    padding: 0.15rem 0.45rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.06);
    font-weight: 600;
  }

  .cp-expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.5rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--cyan);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .cp-expand-btn:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: rgba(0, 212, 255, 0.3);
  }
`;

export default function CoursesPage() {
  const user = useAuthStore((s) => s.user);

  // Fetch full nested hierarchy (Stage 1 to N -> Subjects -> Topics)
  const { data: hierarchy, loading } = useApi(studentApi.getHierarchy);
  
  const stagesList = useMemo(() => {
    if (!hierarchy || !Array.isArray(hierarchy)) return [];
    let list = [];
    if (hierarchy[0] && hierarchy[0].classes) {
      list = hierarchy.flatMap((c) => c.classes || []);
    } else {
      list = hierarchy;
    }
    return [...list].sort((a, b) => {
      const aIsTeacher = a.name.toLowerCase().includes('teacher') || a.name.toLowerCase().includes('zone');
      const bIsTeacher = b.name.toLowerCase().includes('teacher') || b.name.toLowerCase().includes('zone');
      if (aIsTeacher && !bIsTeacher) return -1;
      if (!aIsTeacher && bIsTeacher) return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [hierarchy]);

  const [selectedStage, setSelectedStage]       = useState('ALL');
  const [search, setSearch]                     = useState('');
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [activeSubjectModal, setActiveSubjectModal] = useState(null);
  const [activeTeacherZoneModal, setActiveTeacherZoneModal] = useState(null);
  const [activePdfModal, setActivePdfModal] = useState({ open: false, url: '', title: '' });

  const handleViewTopicContent = async (topicId, topicName) => {
    try {
      toast.loading('Opening document...', { id: 'pdf-load' });
      const res = await studentApi.getTopicContent(topicId);
      toast.dismiss('pdf-load');
      const items = res.data?.data?.items || [];
      const docItem = items.find(item => item.file_url) || items[0];
      if (docItem && docItem.file_url) {
        setActivePdfModal({ open: true, url: docItem.file_url, title: docItem.title || topicName });
      } else if (items.length > 0 && items[0].id) {
        const noteRes = await studentApi.getNoteUrl(items[0].id);
        if (noteRes.data?.data?.note_url) {
          setActivePdfModal({ open: true, url: noteRes.data.data.note_url, title: items[0].title || topicName });
        } else {
          toast.error('No document file attached to this topic yet.');
        }
      } else {
        toast.error('No document file found for this topic.');
      }
    } catch (err) {
      toast.dismiss('pdf-load');
      console.error('Failed to load topic document', err);
      toast.error('Could not open document');
    }
  };

  const getSubjectIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('active')) return '⚡';
    if (n.includes('assessment')) return '🎯';
    if (n.includes('language skills')) return '🗣️';
    if (n.includes('differentiation')) return '🧩';
    if (n.includes('questioning')) return '❓';
    if (n.includes('awareness')) return '🌐';
    if (n.includes('metacognition')) return '🧠';
    if (n.includes('life')) return '🚀';
    return '📚';
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (user && user.role === 'student' && user.curriculum_id) {
    return <Navigate to={`/courses/${user.curriculum_id}/subjects`} replace />;
  }

  const toggleExpand = (subjectId) => {
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  // Filter stages (Stage 1 to N), subjects, and topics based on search & dropdown selection
  const filteredStages = useMemo(() => {
    const q = search.trim().toLowerCase();

    return stagesList
      .filter((stage) => selectedStage === 'ALL' || stage.name.toLowerCase() === selectedStage.toLowerCase())
      .map((stage) => {
        const stageNameMatch = Boolean(q && stage.name.toLowerCase().includes(q));

        const matchingSubjects = (stage.subjects || []).filter((subj) => {
          if (!q || stageNameMatch) return true;
          const matchSubj  = subj.name.toLowerCase().includes(q) || (subj.description && subj.description.toLowerCase().includes(q));
          const matchTopic = (subj.topics || []).some((t) => t.name.toLowerCase().includes(q));
          return matchSubj || matchTopic;
        });

        return { ...stage, subjects: matchingSubjects };
      })
      .filter((stage) => !q || stage.subjects.length > 0);
  }, [stagesList, selectedStage, search]);

  const selectedStageObj = useMemo(() => {
    if (selectedStage === 'ALL') return null;
    return stagesList.find((s) => s.name.toLowerCase() === selectedStage.toLowerCase());
  }, [selectedStage, stagesList]);

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="cp-root">

        {/* Toolbar with Modern Custom Glass Dropdown */}
        <div className="cp-toolbar">

          {/* CUSTOM GLASS DROPDOWN */}
          <div className="cp-dropdown-wrap" ref={dropdownRef}>
            <button
              type="button"
              className={`cp-dropdown-btn ${dropdownOpen ? 'open' : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="var(--cyan)" />
                <span>
                  {selectedStage === 'ALL'
                    ? `All Zones & Stages (${stagesList.length})`
                    : selectedStageObj
                    ? `${selectedStageObj.name} (${(selectedStageObj.subjects || []).length} Subjects)`
                    : selectedStage}
                </span>
              </div>
              <ChevronDown
                size={16}
                style={{
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  color: 'var(--cyan)'
                }}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="cp-dropdown-menu"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <div
                    className={`cp-dropdown-item ${selectedStage === 'ALL' ? 'active' : ''}`}
                    onClick={() => { setSelectedStage('ALL'); setDropdownOpen(false); }}
                  >
                    <span>All Zones & Stages</span>
                    <span className="cp-item-badge">{stagesList.length} Total</span>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

                  {stagesList.map((stg) => {
                    const isTeacher = stg.name.toLowerCase().includes('teacher') || stg.name.toLowerCase().includes('zone');
                    return (
                      <div
                        key={stg.id}
                        className={`cp-dropdown-item ${selectedStage.toLowerCase() === stg.name.toLowerCase() ? 'active' : ''}`}
                        onClick={() => { setSelectedStage(stg.name); setDropdownOpen(false); }}
                        style={isTeacher ? { background: 'rgba(124, 58, 237, 0.15)', borderLeft: '3px solid #C4B5FD' } : {}}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {selectedStage.toLowerCase() === stg.name.toLowerCase() && <Check size={14} color="var(--cyan)" />}
                          <span style={{ fontWeight: isTeacher ? 800 : 600, color: isTeacher ? '#FDE68A' : 'inherit' }}>
                            {stg.name}
                          </span>
                        </div>
                        <span className="cp-item-badge">{(stg.subjects || []).length} Subjects</span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SEARCH BAR */}
          <div className="cp-search-wrap">
            <Search size={15} className="cp-search-icon" />
            <input
              type="text"
              placeholder="Search stage, subject, or topic..."
              className="cp-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stage 1 to N Hierarchy List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} style={{ height: 220, borderRadius: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : filteredStages.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No stages found"
            description="Try clearing your search query or selecting a different stage from the dropdown."
          />
        ) : (
          filteredStages.map((stage) => {
            const isTeacherZone = stage.name.toLowerCase().includes('teacher') || stage.name.toLowerCase().includes('zone');
            const totalTopics = (stage.subjects || []).reduce((sum, s) => sum + (s.topic_count || 0), 0);

            return (
              <motion.div
                key={stage.id}
                className="cp-stage-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={isTeacherZone ? {
                  background: 'linear-gradient(135deg, rgba(15, 22, 41, 0.95) 0%, rgba(124, 58, 237, 0.15) 50%, rgba(10, 14, 26, 0.85) 100%)',
                  border: '2px solid rgba(124, 58, 237, 0.35)',
                  borderRadius: '28px',
                  padding: '2.25rem 2.5rem',
                  marginBottom: '2.5rem',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(124, 58, 237, 0.2)'
                } : {}}
              >
                {isTeacherZone ? (
                  /* ── SINGLE SUBJECT CARD FOR WHOLE TEACHER'S ZONE ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', fontWeight: 900, color: '#FFF', margin: 0 }}>
                          Teacher's zone
                        </h1>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.85rem', borderRadius: '50px', background: 'rgba(124, 58, 237, 0.25)', border: '1px solid rgba(124, 58, 237, 0.5)', color: '#C4B5FD', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          CAMBRIDGE PRIMARY
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#00D4FF', fontWeight: 800, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', padding: '0.35rem 0.95rem', borderRadius: 50 }}>
                          {(stage.subjects || []).length || 8} Subjects
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#C4B5FD', fontWeight: 800, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', padding: '0.35rem 0.95rem', borderRadius: 50 }}>
                          {totalTopics || 8} Topics
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'rgba(245, 240, 232, 0.8)', lineHeight: 1.65, maxWidth: '960px', margin: 0, fontWeight: 500 }}>
                      Discover a collection of practical teaching approaches designed for Cambridge Primary educators. From active learning and differentiation to metacognition and assessment for learning, these resources provide clear guidance, classroom strategies, and ready-to-use ideas to help create engaging, inclusive, and learner-centred classrooms.
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveTeacherZoneModal(stage)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1.5rem',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #00D4FF 100%)',
                        border: 'none',
                        color: '#FFF',
                        fontWeight: 900,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <Eye size={18} color="#FFF" />
                      <span>View Inside Content</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Standard Stage 1 to N Header Card */}
                    <div className="cp-stage-header">
                      <div>
                        <div className="cp-stage-name">
                          <span>{stage.name}</span>
                          <span className="cp-stage-badge">{stage.curriculum_name || 'Curriculum Stage'}</span>
                        </div>
                        {stage.description && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{stage.description}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 800, background: 'rgba(0,212,255,0.1)', padding: '0.35rem 0.85rem', borderRadius: 50 }}>
                          {(stage.subjects || []).length} Subjects
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--lavender)', fontWeight: 800, background: 'rgba(124,58,237,0.15)', padding: '0.35rem 0.85rem', borderRadius: 50 }}>
                          {totalTopics} Topics
                        </span>
                      </div>
                    </div>

                    <div className="cp-subjects-container">
                    {(stage.subjects || []).map((subject) => {
                      const isExpanded = expandedSubjects[subject.id] || false;
                      const visibleTopics = isExpanded ? (subject.topics || []) : (subject.topics || []).slice(0, 3);
                      const hasMore = (subject.topics || []).length > 3;

                      return (
                        <div key={subject.id} className="cp-subject-card">
                          <div className="cp-subj-top">
                            <div>
                              <div className="cp-subj-title">{subject.name}</div>
                              {subject.description && <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>{subject.description}</p>}
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--cyan)', background: 'rgba(0,212,255,0.1)', padding: '0.2rem 0.65rem', borderRadius: 50 }}>
                              {subject.topic_count || 0} chapters
                            </span>
                          </div>

                          {/* Topics List inside Subject */}
                          <div className="cp-topics-list">
                            {(subject.topics || []).length === 0 ? (
                              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontStyle: 'italic', padding: '0.4rem 0' }}>
                                No topics added yet for this subject.
                              </div>
                            ) : (
                              visibleTopics.map((topic, idx) => (
                                <Link
                                  key={topic.id}
                                  to={`/topics/${topic.id}`}
                                  className="cp-topic-item"
                                >
                                  <div className="cp-topic-name">
                                    <span style={{ color: 'var(--cyan)', fontSize: '0.7rem', fontWeight: 800 }}>#{String(idx + 1).padStart(2, '0')}</span>
                                    <span>{topic.name}</span>
                                  </div>
                                  <div className="cp-topic-meta">
                                    {topic.resource_count > 0 && (
                                      <span className="cp-meta-chip">{topic.resource_count} items</span>
                                    )}
                                    {topic.exam_count > 0 && (
                                      <span className="cp-meta-chip" style={{ color: '#F59E0B' }}>{topic.exam_count} exams</span>
                                    )}
                                    <ChevronRight size={12} color="var(--violet-l)" />
                                  </div>
                                </Link>
                              ))
                            )}
                          </div>

                          {/* Expand Button */}
                          {hasMore && (
                            <button
                              type="button"
                              className="cp-expand-btn"
                              onClick={() => toggleExpand(subject.id)}
                            >
                              {isExpanded ? (
                                <>
                                  <span>Show Less</span>
                                  <ChevronUp size={14} />
                                </>
                              ) : (
                                <>
                                  <span>View All {subject.topics.length} Topics</span>
                                  <ChevronDown size={14} />
                                </>
                              )}
                            </button>
                          )}

                          {/* View Full Subject Link */}
                          <Link
                            to={`/subjects/${subject.id}`}
                            style={{
                              marginTop: 'auto',
                              paddingTop: '0.75rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: 'var(--cyan)',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>Explore Subject Chapters</span>
                            <ChevronRight size={13} />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              </motion.div>
            );
          })
        )}
        {/* Modal: Subject Content Explorer */}
        <Modal
          open={!!activeSubjectModal}
          onClose={() => setActiveSubjectModal(null)}
          size="2xl"
          title={activeSubjectModal?.name || 'Subject Content'}
        >
          {activeSubjectModal && (
            <div style={{ padding: '0.5rem 0' }}>
              {/* Header Banner */}
              <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(0,212,255,0.12) 100%)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{getSubjectIcon(activeSubjectModal.name)}</span>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: '#FFF', margin: 0 }}>
                    {activeSubjectModal.name}
                  </h2>
                  <span style={{ padding: '0.25rem 0.85rem', borderRadius: 50, background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.35)', color: '#00D4FF', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    Cambridge Primary
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'rgba(245,240,232,0.82)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {activeSubjectModal.description || 'Explore teaching guidance, classroom strategies, and ready-to-use ideas for this approach.'}
                </p>
              </div>

              {/* Chapters & Topics List */}
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} color="#00D4FF" />
                <span>Chapters & Learning Documents ({(activeSubjectModal.topics || []).length})</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {(activeSubjectModal.topics || []).length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', color: 'rgba(245,240,232,0.5)', fontStyle: 'italic' }}>
                    No chapters found for this subject yet.
                  </div>
                ) : (
                  activeSubjectModal.topics.map((topic, idx) => (
                    <Link
                      key={topic.id}
                      to={`/topics/${topic.id}`}
                      onClick={() => setActiveSubjectModal(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#FFF',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(124,58,237,0.18)';
                        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span style={{ color: '#00D4FF', fontWeight: 900, fontSize: '0.82rem' }}>#{String(idx + 1).padStart(2, '0')}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{topic.name}</div>
                          {topic.resource_count > 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'rgba(245,240,232,0.5)', marginTop: '2px' }}>
                              📁 {topic.resource_count} items available
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#C4B5FD', fontWeight: 700, fontSize: '0.8rem' }}>
                        <span>Open Chapter</span>
                        <ChevronRight size={15} />
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Footer Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Link
                  to={`/subjects/${activeSubjectModal.id}`}
                  onClick={() => setActiveSubjectModal(null)}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #00D4FF 100%)',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(124,58,237,0.3)'
                  }}
                >
                  <span>Explore Full Subject Page</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Full Teacher's Zone Explorer */}
        <Modal
          open={!!activeTeacherZoneModal}
          onClose={() => setActiveTeacherZoneModal(null)}
          size="2xl"
          title="Teacher's Zone - Practical Teaching Approaches"
        >
          {activeTeacherZoneModal && (
            <div style={{ padding: '0.25rem 0' }}>
              {/* Header Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(0,212,255,0.1) 100%)',
                border: '1px solid rgba(124,58,237,0.35)',
                borderRadius: '20px',
                padding: '1.4rem 1.6rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} color="#00D4FF" />
                    </div>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.45rem', fontWeight: 900, color: '#FFF', margin: 0, letterSpacing: '-0.02em' }}>
                      Teacher's Zone Approaches
                    </h2>
                  </div>
                  <span style={{ padding: '0.3rem 0.9rem', borderRadius: 50, background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.5)', color: '#C4B5FD', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    CAMBRIDGE PRIMARY
                  </span>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'rgba(245,240,232,0.8)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  Discover practical teaching methodologies and reference guidance designed for Cambridge Primary educators. Click any approach card to open and view its official document.
                </p>
              </div>

              {/* Grid of all 8 Teaching Approach Subjects */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {(activeTeacherZoneModal.subjects || []).map((subject) => {
                  const iconEmoji = getSubjectIcon(subject.name);
                  const topicsList = subject.topics || [];

                  return (
                    <div
                      key={subject.id}
                      style={{
                        background: 'linear-gradient(135deg, rgba(15, 22, 41, 0.85) 0%, rgba(26, 35, 62, 0.65) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.25s ease',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      <div>
                        {/* Top Meta Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(124, 58, 237, 0.18)', border: '1px solid rgba(124, 58, 237, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                            {iconEmoji}
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#00D4FF', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.25)', padding: '0.2rem 0.7rem', borderRadius: 50 }}>
                            {topicsList.length || 1} {topicsList.length === 1 ? 'document' : 'documents'}
                          </span>
                        </div>

                        {/* Approach Title */}
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.18rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                          {subject.name}
                        </h3>

                        {/* Approach Description */}
                        <p style={{
                          fontSize: '0.84rem',
                          color: 'rgba(245, 240, 232, 0.75)',
                          lineHeight: 1.6,
                          marginBottom: '1.5rem'
                        }}>
                          {subject.description || 'Clear guidance, classroom strategies, and ready-to-use ideas.'}
                        </p>
                      </div>

                      {/* Single Professional Action Button Row */}
                      <div style={{ marginTop: 'auto' }}>
                        {topicsList.map((tp) => (
                          <button
                            key={tp.id}
                            type="button"
                            onClick={() => handleViewTopicContent(tp.id, tp.name)}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              borderRadius: '14px',
                              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(0, 212, 255, 0.25) 100%)',
                              border: '1px solid rgba(0, 212, 255, 0.45)',
                              color: '#FFF',
                              fontSize: '0.83rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 4px 15px rgba(0, 212, 255, 0.15)',
                              marginBottom: topicsList.length > 1 ? '0.5rem' : '0'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflow: 'hidden' }}>
                              <FileText size={16} color="#00D4FF" style={{ flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                View Document
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.55rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>
                              <Eye size={12} />
                              <span>Read</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal>

        {/* Pdf Viewer Modal: Direct 1-Click Document Access */}
        <PdfViewerModal
          open={activePdfModal.open}
          onClose={() => setActivePdfModal({ open: false, url: '', title: '' })}
          pdfUrl={activePdfModal.url}
          title={activePdfModal.title || 'Teacher Approach Document'}
        />

      </div>
    </PageWrapper>
  );
}