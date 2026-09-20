import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  ChevronRight, Search, ChevronDown, ChevronUp, FolderTree, Layers, 
  Check, Sparkles, BookOpen, Eye, ArrowRight, FileText, Binary, Atom, Globe, GraduationCap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, EmptyState, Modal } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import PdfViewerModal from '@/components/shared/PdfViewerModal';
import toast from 'react-hot-toast';

function getSubjectTheme(subjectName) {
  const name = (subjectName || '').toLowerCase();
  if (name.includes('english')) {
    return {
      icon: BookOpen,
      accent: '#6366F1',
      badgeBg: '#1E293B',
      badgeBorder: '#334155',
      badgeColor: '#CBD5E1',
      iconBg: '#1E293B',
      cardBorder: '#334155'
    };
  }
  if (name.includes('math')) {
    return {
      icon: Binary,
      accent: '#2563EB',
      badgeBg: '#1E293B',
      badgeBorder: '#334155',
      badgeColor: '#CBD5E1',
      iconBg: '#1E293B',
      cardBorder: '#334155'
    };
  }
  if (name.includes('science')) {
    return {
      icon: Atom,
      accent: '#059669',
      badgeBg: '#1E293B',
      badgeBorder: '#334155',
      badgeColor: '#CBD5E1',
      iconBg: '#1E293B',
      cardBorder: '#334155'
    };
  }
  if (name.includes('global') || name.includes('perspective')) {
    return {
      icon: Globe,
      accent: '#D97706',
      badgeBg: '#1E293B',
      badgeBorder: '#334155',
      badgeColor: '#CBD5E1',
      iconBg: '#1E293B',
      cardBorder: '#334155'
    };
  }
  return {
    icon: GraduationCap,
    accent: '#4F46E5',
    badgeBg: '#1E293B',
    badgeBorder: '#334155',
    badgeColor: '#CBD5E1',
    iconBg: '#1E293B',
    cardBorder: '#334155'
  };
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .cp-root {
    --navy:       #0F172A;
    --navy2:      #1E293B;
    --violet:     #2563EB;
    --violet-l:   #60A5FA;
    --cyan:       #38BDF8;
    --cream:      #F8FAFC;
    --lavender:   #CBD5E1;
    --muted:      #94A3B8;
    --card-bg:    #1E293B;
    --card-bdr:   #334155;
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .cp-root *, .cp-root *::before, .cp-root *::after { box-sizing: border-box; }

  /* ── HEADER ── */
  .cp-header {
    position: relative;
    background: #1E293B;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 2rem;
    overflow: hidden;
    margin-bottom: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .cp-header-image {
    width: 160px;
    height: 110px;
    object-fit: contain;
    flex-shrink: 0;
  }
  @media (max-width: 767px) {
    .cp-header-image { display: none; }
  }
  
  .cp-title {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 800;
    color: #F8FAFC;
    letter-spacing: -0.02em;
    line-height: 1.25;
    margin-bottom: 0.4rem;
  }
  .cp-subtitle { font-size: 0.88rem; color: #94A3B8; font-weight: 500; }

  /* ── TOOLBAR (SEARCH + DROPDOWN) ── */
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
    background: #1E293B;
    border: 1px solid #334155;
    border-radius: 10px;
    color: #F8FAFC;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .cp-dropdown-btn:hover, .cp-dropdown-btn.open {
    border-color: #475569;
    background: #334155;
    color: #FFFFFF;
  }

  .cp-dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 100%;
    min-width: 280px;
    background: #1E293B;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 0.4rem;
    z-index: 50;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-height: 320px;
    overflow-y: auto;
  }
  .cp-dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #E2E8F0;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .cp-dropdown-item:hover {
    background: #334155;
    color: #FFFFFF;
  }
  .cp-dropdown-item.active {
    background: #2563EB;
    color: #FFFFFF;
    font-weight: 700;
  }
  .cp-item-badge {
    font-size: 0.72rem;
    font-weight: 700;
    color: #94A3B8;
    background: #0F172A;
    border: 1px solid #334155;
    padding: 0.15rem 0.55rem;
    border-radius: 6px;
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
    border-radius: 10px;
    border: 1px solid #334155;
    background: #1E293B;
    color: #F8FAFC;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .cp-search-input:focus {
    border-color: #2563EB;
  }
  .cp-search-icon {
    position: absolute;
    left: 0.95rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    pointer-events: none;
  }

  /* ── STAGE SECTION (Stage 1 to N) ── */
  .cp-stage-card {
    background: #1E293B;
    border: 1px solid #334155;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1.75rem;
  }
  .cp-stage-header {
    padding: 1.25rem 1.5rem;
    background: #0F172A;
    border-bottom: 1px solid #334155;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .cp-stage-name {
    font-size: 1.4rem;
    font-weight: 800;
    color: #F8FAFC;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    letter-spacing: -0.01em;
  }
  .cp-stage-badge {
    padding: 0.2rem 0.65rem;
    border-radius: 6px;
    background: #334155;
    border: 1px solid #475569;
    font-size: 0.7rem;
    color: #E2E8F0;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* ── SUBJECT GRID INSIDE STAGE ── */
  .cp-subjects-container {
    padding: 1.25rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }

  .cp-subject-card {
    background: #0F172A;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.25rem;
    transition: background 0.2s ease, border-color 0.2s ease;
    display: flex;
    flex-direction: column;
  }
  .cp-subject-card:hover {
    border-color: #475569;
    background: #1E293B;
  }

  .cp-subj-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .cp-subj-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: #F8FAFC;
    letter-spacing: -0.01em;
  }

  /* ── TOPICS TREE ACCORDION ── */
  .cp-topics-list {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-top: 1px solid #334155;
    padding-top: 0.75rem;
  }
  .cp-topic-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.55rem 0.85rem;
    border-radius: 8px;
    background: #1E293B;
    border: 1px solid #334155;
    text-decoration: none;
    color: inherit;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .cp-topic-item:hover {
    background: #334155;
    border-color: #475569;
  }
  .cp-topic-name {
    font-size: 0.82rem;
    font-weight: 600;
    color: #F8FAFC;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .cp-topic-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: #94A3B8;
  }
  .cp-meta-chip {
    padding: 0.15rem 0.45rem;
    border-radius: 6px;
    background: #0F172A;
    border: 1px solid #334155;
    font-weight: 600;
    color: #94A3B8;
  }

  .cp-expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: #1E293B;
    border: 1px solid #334155;
    color: #38BDF8;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .cp-expand-btn:hover {
    background: #334155;
    color: #FFFFFF;
  }
`;

function StrandItem({ topic, idx }) {
  const [isOpen, setIsOpen] = useState(false);
  const subtopics = topic.subtopics || [];
  const hasSubtopics = subtopics.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div 
        className="cp-topic-item"
        style={{
          background: isOpen ? '#334155' : '#1E293B',
          borderColor: isOpen ? '#475569' : '#334155',
          cursor: 'pointer',
          padding: '0.55rem 0.85rem'
        }}
        onClick={() => {
          if (hasSubtopics) setIsOpen(!isOpen);
        }}
      >
        <Link 
          to={`/topics/${topic.id}`} 
          className="cp-topic-name" 
          style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ color: '#38BDF8', fontSize: '0.75rem', fontWeight: 800 }}>#{String(idx + 1).padStart(2, '0')}</span>
          <span style={{ fontWeight: 700, color: '#F8FAFC' }}>{topic.name}</span>
        </Link>

        <div className="cp-topic-meta" style={{ gap: '0.45rem', flexShrink: 0 }}>
          {hasSubtopics ? (
            <span className="cp-meta-chip">
              {subtopics.length} subtopics
            </span>
          ) : (
            topic.resource_count > 0 && <span className="cp-meta-chip">{topic.resource_count} items</span>
          )}
          
          {hasSubtopics ? (
            <button 
              type="button" 
              style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            <Link to={`/topics/${topic.id}`} style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {/* Expandable Subtopics Accordion */}
      <AnimatePresence>
        {isOpen && hasSubtopics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{
              paddingLeft: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              borderLeft: '2px solid #334155',
              marginLeft: '0.75rem',
              marginBottom: '0.35rem',
              overflow: 'hidden'
            }}
          >
            {subtopics.map((sub, sIdx) => (
              <Link
                key={sub.id}
                to={`/topics/${sub.id}`}
                className="cp-topic-item"
                style={{ padding: '0.42rem 0.65rem', background: '#0F172A', borderColor: '#334155' }}
              >
                <div className="cp-topic-name" style={{ fontSize: '0.78rem' }}>
                  <span style={{ color: '#38BDF8', fontSize: '0.65rem', fontWeight: 800 }}>#{String(idx + 1).padStart(2, '0')}.{sIdx + 1}</span>
                  <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{sub.name}</span>
                </div>
                <div className="cp-topic-meta">
                  {sub.resource_count > 0 && (
                    <span className="cp-meta-chip" style={{ fontSize: '0.62rem' }}>{sub.resource_count} items</span>
                  )}
                  <ChevronRight size={11} color="#94A3B8" />
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

        {/* Toolbar with Professional Slate Dropdown & Search */}
        <div className="cp-toolbar">

          {/* CUSTOM DROPDOWN */}
          <div className="cp-dropdown-wrap" ref={dropdownRef}>
            <button
              type="button"
              className={`cp-dropdown-btn ${dropdownOpen ? 'open' : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#38BDF8" />
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
                  transition: 'transform 0.2s ease',
                  color: '#94A3B8'
                }}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="cp-dropdown-menu"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    className={`cp-dropdown-item ${selectedStage === 'ALL' ? 'active' : ''}`}
                    onClick={() => { setSelectedStage('ALL'); setDropdownOpen(false); }}
                  >
                    <span>All Zones & Stages</span>
                    <span className="cp-item-badge">{stagesList.length} Total</span>
                  </div>

                  <div style={{ height: '1px', background: '#334155', margin: '3px 0' }} />

                  {stagesList.map((stg) => {
                    const isTeacher = stg.name.toLowerCase().includes('teacher') || stg.name.toLowerCase().includes('zone');
                    return (
                      <div
                        key={stg.id}
                        className={`cp-dropdown-item ${selectedStage.toLowerCase() === stg.name.toLowerCase() ? 'active' : ''}`}
                        onClick={() => { setSelectedStage(stg.name); setDropdownOpen(false); }}
                        style={isTeacher ? { background: '#334155', borderLeft: '3px solid #38BDF8' } : {}}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {selectedStage.toLowerCase() === stg.name.toLowerCase() && <Check size={14} color="#FFFFFF" />}
                          <span style={{ fontWeight: isTeacher ? 700 : 600 }}>
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
              <div key={i} style={{ height: 200, borderRadius: 12, background: '#1E293B', border: '1px solid #334155' }} />
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={isTeacherZone ? {
                  background: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '1.75rem 2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                } : {}}
              >
                {isTeacherZone ? (
                  /* ── PROFESSIONAL TEACHER'S ZONE HERO BANNER ── */
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '10px',
                        background: '#0F172A',
                        border: '1px solid #334155',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <GraduationCap size={26} color="#38BDF8" />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-0.01em' }}>
                            Teacher's Zone
                          </h2>
                          <span style={{
                            padding: '0.2rem 0.65rem', borderRadius: '6px',
                            background: '#0F172A', border: '1px solid #334155',
                            color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase'
                          }}>
                            CAMBRIDGE PRIMARY
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, margin: 0, fontWeight: 500, maxWidth: '820px' }}>
                          Discover practical teaching methodologies and reference guidance designed for Cambridge Primary educators. Access active learning, assessment strategies, differentiation, and ready-to-use classroom materials.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.85rem', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700, background: '#0F172A', border: '1px solid #334155', padding: '0.35rem 0.85rem', borderRadius: '6px' }}>
                          {(stage.subjects || []).length || 8} Teaching Approaches
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: 700, background: '#0F172A', border: '1px solid #334155', padding: '0.35rem 0.85rem', borderRadius: '6px' }}>
                          {totalTopics || 8} Guidance Docs
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTeacherZoneModal(stage)}
                        style={{
                          padding: '0.7rem 1.4rem',
                          borderRadius: '8px',
                          background: '#2563EB',
                          border: 'none',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.55rem',
                          boxShadow: 'none',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}
                      >
                        <Eye size={17} color="#FFF" />
                        <span>Explore Teaching Approaches</span>
                        <ArrowRight size={15} color="#FFF" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Standard Stage 1 to N Header Card */}
                    <div className="cp-stage-header">
                      <div>
                        <div className="cp-stage-name">
                          <span>{stage.name}</span>
                          <span className="cp-stage-badge">{stage.curriculum_name || 'CAMBRIDGE PRIMARY'}</span>
                        </div>
                        {stage.description && <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>{stage.description}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700, background: '#1E293B', border: '1px solid #334155', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                          {(stage.subjects || []).length} Subjects
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: 700, background: '#1E293B', border: '1px solid #334155', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                          {totalTopics} Topics
                        </span>
                      </div>
                    </div>

                    <div className="cp-subjects-container">
                    {(stage.subjects || []).map((subject) => {
                      const isExpanded = expandedSubjects[subject.id] || false;
                      const visibleTopics = isExpanded ? (subject.topics || []) : (subject.topics || []).slice(0, 3);
                      const hasMore = (subject.topics || []).length > 3;
                      const theme = getSubjectTheme(subject.name);
                      const SubjectIcon = theme.icon;

                      return (
                        <div 
                          key={subject.id} 
                          className="cp-subject-card"
                          style={{
                            background: '#0F172A',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: 'none'
                          }}
                        >
                          <div className="cp-subj-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                              <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: '#1E293B',
                                border: '1px solid #334155',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                              }}>
                                <SubjectIcon size={20} color={theme.accent} />
                              </div>

                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="cp-subj-title">{subject.name}</div>
                                {subject.description && (
                                  <p style={{
                                    fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4
                                  }}>
                                    {subject.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span style={{
                              fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8',
                              background: '#1E293B', border: '1px solid #334155',
                              padding: '0.2rem 0.65rem', borderRadius: '6px', flexShrink: 0
                            }}>
                              {subject.topic_count || (subject.topics || []).length || 0} chapters
                            </span>
                          </div>

                      {/* Topics / Documents List inside Subject */}
                      <div className="cp-topics-list">
                        {(subject.topics || []).length === 0 ? (
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic', padding: '0.4rem 0' }}>
                            No topics added yet for this subject.
                          </div>
                        ) : (
                          visibleTopics.map((topic, idx) => (
                            <StrandItem key={topic.id} topic={topic} idx={idx} />
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
                          paddingTop: '0.85rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#38BDF8',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>Explore Subject Chapters</span>
                        <ArrowRight size={14} color="#38BDF8" />
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
              <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getSubjectIcon(activeSubjectModal.name)}</span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                    {activeSubjectModal.name}
                  </h2>
                  <span style={{ padding: '0.2rem 0.65rem', borderRadius: '6px', background: '#0F172A', border: '1px solid #334155', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Cambridge Primary
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                  {activeSubjectModal.description || 'Explore teaching guidance, classroom strategies, and ready-to-use ideas for this approach.'}
                </p>
              </div>

              {/* Chapters & Topics List */}
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} color="#38BDF8" />
                <span>Chapters & Learning Documents ({(activeSubjectModal.topics || []).length})</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {(activeSubjectModal.topics || []).length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: '#1E293B', borderRadius: '10px', color: '#94A3B8', fontStyle: 'italic' }}>
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
                        padding: '0.85rem 1.1rem',
                        borderRadius: '10px',
                        background: '#1E293B',
                        border: '1px solid #334155',
                        color: '#F8FAFC',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#334155';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1E293B';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span style={{ color: '#38BDF8', fontWeight: 800, fontSize: '0.82rem' }}>#{String(idx + 1).padStart(2, '0')}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{topic.name}</div>
                          {topic.resource_count > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                              📁 {topic.resource_count} items available
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontWeight: 700, fontSize: '0.8rem' }}>
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
                    padding: '0.65rem 1.3rem',
                    borderRadius: '8px',
                    background: '#2563EB',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
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
                background: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0F172A', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={18} color="#38BDF8" />
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                      Teacher's Zone Approaches
                    </h2>
                  </div>
                  <span style={{ padding: '0.2rem 0.65rem', borderRadius: '6px', background: '#0F172A', border: '1px solid #334155', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    CAMBRIDGE PRIMARY
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                  Discover practical teaching methodologies and reference guidance designed for Cambridge Primary educators. Click any approach card to open and view its official document.
                </p>
              </div>

              {/* Grid of all 8 Teaching Approach Subjects */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
                {(activeTeacherZoneModal.subjects || []).map((subject) => {
                  const iconEmoji = getSubjectIcon(subject.name);
                  const topicsList = subject.topics || [];
                  const realDocCount = topicsList.reduce((sum, tp) => sum + (Number(tp.resource_count) || 0), 0);

                  return (
                    <div
                      key={subject.id}
                      style={{
                        background: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Top Meta Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0F172A', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                            {iconEmoji}
                          </div>
                          <span style={realDocCount > 0 ? {
                            fontSize: '0.7rem', fontWeight: 700, color: '#38BDF8', background: '#0F172A', border: '1px solid #334155', padding: '0.2rem 0.65rem', borderRadius: '6px'
                          } : {
                            fontSize: '0.7rem', fontWeight: 600, color: '#94A3B8', background: '#0F172A', border: '1px solid #334155', padding: '0.2rem 0.65rem', borderRadius: '6px'
                          }}>
                            {realDocCount} {realDocCount === 1 ? 'document' : 'documents'}
                          </span>
                        </div>

                        {/* Approach Title */}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.4rem', lineHeight: 1.35 }}>
                          {subject.name}
                        </h3>

                        {/* Approach Description */}
                        <p style={{
                          fontSize: '0.82rem',
                          color: '#94A3B8',
                          lineHeight: 1.5,
                          marginBottom: '1.25rem'
                        }}>
                          {subject.description || 'Clear guidance, classroom strategies, and ready-to-use ideas.'}
                        </p>
                      </div>

                      {/* Single Professional Action Button Row */}
                      <div style={{ marginTop: 'auto' }}>
                        {topicsList.map((tp) => {
                          const hasDoc = Number(tp.resource_count) > 0;
                          return (
                            <button
                              key={tp.id}
                              type="button"
                              onClick={hasDoc ? () => handleViewTopicContent(tp.id, tp.name) : undefined}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.9rem',
                                borderRadius: '8px',
                                background: hasDoc ? '#2563EB' : '#0F172A',
                                border: hasDoc ? 'none' : '1px solid #334155',
                                color: hasDoc ? '#FFFFFF' : '#94A3B8',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: hasDoc ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                                transition: 'background 0.15s ease',
                                marginBottom: topicsList.length > 1 ? '0.4rem' : '0'
                              }}
                              onMouseEnter={(e) => {
                                if (hasDoc) e.currentTarget.style.background = '#1D4ED8';
                              }}
                              onMouseLeave={(e) => {
                                if (hasDoc) e.currentTarget.style.background = '#2563EB';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                <FileText size={15} color={hasDoc ? '#FFFFFF' : '#94A3B8'} style={{ flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {hasDoc ? 'View Document' : 'No Document Uploaded'}
                                </span>
                              </div>
                              {hasDoc && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
                                  <Eye size={12} />
                                  <span>Read</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
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