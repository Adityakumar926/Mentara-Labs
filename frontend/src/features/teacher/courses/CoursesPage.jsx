import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight, Search, ChevronDown, ChevronUp, FolderTree, Layers,
  Check, Sparkles, BookOpen, Eye, ArrowRight, FileText, Binary, Atom,
  Globe, GraduationCap, Zap, Plus, ClipboardCheck, Share2, Presentation,
  FileSpreadsheet, FlaskConical, Award, Users, Clock, Trophy, CheckCircle2,
  X, PenTool
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, EmptyState, Modal } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { studentApi, classroomApi, adminApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import PdfViewerModal from '@/components/shared/PdfViewerModal';
import toast from 'react-hot-toast';
import {
  StarNumberBadge,
  TeacherZoneCapIllustration,
  LionIllustration,
  GiraffeIllustration,
  PandaIllustration,
  ElephantIllustration,
  WhaleIllustration,
  OwlIllustration,
  HeroTeacherIllustration,
} from './TeacherDashboardIllustrations';

function getSubjectTheme(subjectName) {
  const name = (subjectName || '').toLowerCase();
  if (name.includes('english')) {
    return {
      icon: BookOpen,
      accent: '#EC4899',
      badgeBg: '#FDF2F8',
      badgeBorder: '#FBCFE8',
      badgeColor: '#BE185D',
      iconBg: '#FCE7F3',
      cardBorder: '#F3E8FF',
    };
  }
  if (name.includes('math')) {
    return {
      icon: Binary,
      accent: '#2563EB',
      badgeBg: '#EFF6FF',
      badgeBorder: '#BFDBFE',
      badgeColor: '#1D4ED8',
      iconBg: '#DBEAFE',
      cardBorder: '#E0E7FF',
    };
  }
  if (name.includes('science')) {
    return {
      icon: Atom,
      accent: '#059669',
      badgeBg: '#ECFDF5',
      badgeBorder: '#A7F3D0',
      badgeColor: '#047857',
      iconBg: '#D1FAE5',
      cardBorder: '#DCFCE7',
    };
  }
  if (name.includes('global') || name.includes('perspective')) {
    return {
      icon: Globe,
      accent: '#D97706',
      badgeBg: '#FFFBEB',
      badgeBorder: '#FDE68A',
      badgeColor: '#B45309',
      iconBg: '#FEF3C7',
      cardBorder: '#FEF3C7',
    };
  }
  return {
    icon: GraduationCap,
    accent: '#7C3AED',
    badgeBg: '#F5F3FF',
    badgeBorder: '#DDD6FE',
    badgeColor: '#6D28D9',
    iconBg: '#EDE9FE',
    cardBorder: '#EDE9FE',
  };
}

const STAGE_CARD_CONFIGS = [
  {
    num: 1,
    key: 'Stage 1',
    title: 'Stage 1',
    ages: 'Ages 5–6',
    starColor: '#FF6B8B',
    starGlow: 'rgba(255, 107, 139, 0.28)',
    bgGradient: 'linear-gradient(180deg, #FFF0F3 0%, #FFE0E9 100%)',
    borderColor: '#FECDD3',
    activeRing: '#FF6B8B',
    Mascot: LionIllustration,
  },
  {
    num: 2,
    key: 'Stage 2',
    title: 'Stage 2',
    ages: 'Ages 6–7',
    starColor: '#F59E0B',
    starGlow: 'rgba(245, 158, 11, 0.28)',
    bgGradient: 'linear-gradient(180deg, #FFFBEB 0%, #FDE68A 100%)',
    borderColor: '#FDE68A',
    activeRing: '#F59E0B',
    Mascot: GiraffeIllustration,
  },
  {
    num: 3,
    key: 'Stage 3',
    title: 'Stage 3',
    ages: 'Ages 7–8',
    starColor: '#10B981',
    starGlow: 'rgba(16, 185, 129, 0.28)',
    bgGradient: 'linear-gradient(180deg, #ECFDF5 0%, #CCFBF1 100%)',
    borderColor: '#A7F3D0',
    activeRing: '#10B981',
    Mascot: PandaIllustration,
  },
  {
    num: 4,
    key: 'Stage 4',
    title: 'Stage 4',
    ages: 'Ages 8–9',
    starColor: '#3B82F6',
    starGlow: 'rgba(59, 130, 246, 0.28)',
    bgGradient: 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)',
    borderColor: '#BFDBFE',
    activeRing: '#3B82F6',
    Mascot: ElephantIllustration,
  },
  {
    num: 5,
    key: 'Stage 5',
    title: 'Stage 5',
    ages: 'Ages 9–11',
    starColor: '#8B5CF6',
    starGlow: 'rgba(139, 92, 246, 0.28)',
    bgGradient: 'linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%)',
    borderColor: '#DDD6FE',
    activeRing: '#8B5CF6',
    Mascot: WhaleIllustration,
  },
];

function StrandItem({ topic, idx, accentColor = '#6366F1' }) {
  const [isOpen, setIsOpen] = useState(false);
  const subtopics = topic.subtopics || [];
  const hasSubtopics = subtopics.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
          isOpen
            ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs'
            : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
        }`}
        onClick={() => {
          if (hasSubtopics) setIsOpen(!isOpen);
        }}
      >
        <Link
          to={`/topics/${topic.id}`}
          className="flex items-center gap-2 flex-1 min-w-0 no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0"
            style={{ color: accentColor, background: `${accentColor}15` }}
          >
            #{String(idx + 1).padStart(2, '0')}
          </span>
          <span className="text-[13px] font-bold text-slate-800 truncate hover:text-indigo-600 transition-colors">
            {topic.name}
          </span>
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasSubtopics ? (
            <span className="text-[10.5px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
              {subtopics.length} subtopics
            </span>
          ) : (
            topic.resource_count > 0 && (
              <span className="text-[10.5px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                {topic.resource_count} items
              </span>
            )
          )}

          {hasSubtopics ? (
            <button
              type="button"
              className="text-indigo-500 hover:text-indigo-700 p-0.5 flex items-center cursor-pointer"
            >
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            <Link to={`/topics/${topic.id}`} className="text-slate-400 hover:text-indigo-600 flex items-center">
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && hasSubtopics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="pl-3 ml-3 border-l-2 border-indigo-100 flex flex-col gap-1 my-1 overflow-hidden"
          >
            {subtopics.map((sub, sIdx) => (
              <Link
                key={sub.id}
                to={`/topics/${sub.id}`}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all no-underline"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-extrabold text-indigo-500 shrink-0">
                    #{String(idx + 1).padStart(2, '0')}.{sIdx + 1}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-700 truncate">
                    {sub.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {sub.resource_count > 0 && (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">
                      {sub.resource_count} items
                    </span>
                  )}
                  <ChevronRight size={12} className="text-slate-400" />
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const curriculumRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch full nested hierarchy (Teacher's Zone + Stage 1 to N -> Subjects -> Topics)
  const { data: hierarchy, loading } = useApi(studentApi.getHierarchy);
  // Fetch teacher's classrooms for live dashboard widget
  const { data: classroomsData } = useApi(classroomApi.getClassrooms);

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

  const teacherZoneStage = useMemo(() => {
    return stagesList.find(
      (s) => s.name.toLowerCase().includes('teacher') || s.name.toLowerCase().includes('zone')
    );
  }, [stagesList]);

  const [selectedStage, setSelectedStage] = useState(() => searchParams.get('stage') || 'ALL');
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [activeSubjectModal, setActiveSubjectModal] = useState(null);
  const [activeTeacherZoneModal, setActiveTeacherZoneModal] = useState(null);
  const [activePdfModal, setActivePdfModal] = useState({ open: false, url: '', title: '' });

  // Sync URL query params (?stage=... & ?q=...) from sidebar / topbar
  useEffect(() => {
    const stageParam = searchParams.get('stage');
    const qParam = searchParams.get('q');

    if (stageParam) {
      // Match against actual stage names (e.g. "Teacher Zone" -> "Teacher's Zone")
      if (stageParam.toLowerCase().includes('teacher') || stageParam.toLowerCase().includes('zone')) {
        const tz = stagesList.find(
          (s) => s.name.toLowerCase().includes('teacher') || s.name.toLowerCase().includes('zone')
        );
        setSelectedStage(tz ? tz.name : stageParam);
      } else {
        setSelectedStage(stageParam);
      }
    } else {
      setSelectedStage('ALL');
    }

    if (qParam !== null) {
      setSearch(qParam);
    } else {
      setSearch('');
    }
  }, [searchParams, stagesList]);

  const selectStageAndScroll = (stageValue) => {
    setSelectedStage(stageValue);
    const next = new URLSearchParams(searchParams);
    if (stageValue === 'ALL') {
      next.delete('stage');
    } else {
      next.set('stage', stageValue);
    }
    setSearchParams(next, { replace: true });
    setTimeout(() => {
      if (curriculumRef.current) {
        curriculumRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const handleViewTopicContent = async (topicId, topicName) => {
    try {
      toast.loading('Opening document...', { id: 'pdf-load' });
      const res = await studentApi.getTopicContent(topicId);
      toast.dismiss('pdf-load');
      const items = res.data?.data?.items || [];
      const docItem = items.find((item) => item.file_url) || items[0];
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
      .filter((stage) => {
        if (selectedStage === 'ALL') return true;
        const selLower = selectedStage.toLowerCase();
        const stgLower = stage.name.toLowerCase();
        if (
          (selLower.includes('teacher') || selLower.includes('zone')) &&
          (stgLower.includes('teacher') || stgLower.includes('zone'))
        ) {
          return true;
        }
        return stgLower === selLower;
      })
      .map((stage) => {
        const stageNameMatch = Boolean(q && stage.name.toLowerCase().includes(q));

        const matchingSubjects = (stage.subjects || []).filter((subj) => {
          if (!q || stageNameMatch) return true;
          const matchSubj =
            subj.name.toLowerCase().includes(q) ||
            (subj.description && subj.description.toLowerCase().includes(q));
          const matchTopic = (subj.topics || []).some((t) => t.name.toLowerCase().includes(q));
          return matchSubj || matchTopic;
        });

        return { ...stage, subjects: matchingSubjects };
      })
      .filter((stage) => !q || stage.subjects.length > 0);
  }, [stagesList, selectedStage, search]);

  const selectedStageObj = useMemo(() => {
    if (selectedStage === 'ALL') return null;
    const selLower = selectedStage.toLowerCase();
    return stagesList.find((s) => {
      const stgLower = s.name.toLowerCase();
      if (
        (selLower.includes('teacher') || selLower.includes('zone')) &&
        (stgLower.includes('teacher') || stgLower.includes('zone'))
      ) {
        return true;
      }
      return stgLower === selLower;
    });
  }, [selectedStage, stagesList]);

  // Real classrooms or helpful starter cards
  const classroomsList = useMemo(() => {
    const raw = Array.isArray(classroomsData)
      ? classroomsData
      : classroomsData?.items || classroomsData?.classrooms || [];
    if (raw.length > 0) {
      const stageColors = [
        { dot: '#EC4899', badgeBg: '#FFE4E6', badgeText: '#BE185D', iconBg: '#FCE7F3', num: 1 },
        { dot: '#F59E0B', badgeBg: '#FEF3C7', badgeText: '#B45309', iconBg: '#FEF3C7', num: 2 },
        { dot: '#3B82F6', badgeBg: '#DBEAFE', badgeText: '#1D4ED8', iconBg: '#DBEAFE', num: 4 },
        { dot: '#10B981', badgeBg: '#DCFCE7', badgeText: '#047857', iconBg: '#DCFCE7', num: 3 },
      ];
      return raw.slice(0, 4).map((cls, idx) => {
        const theme = stageColors[idx % stageColors.length];
        return {
          id: cls.id,
          name: cls.name || `Classroom ${idx + 1}`,
          students: cls.student_count ?? cls.students_count ?? (cls.students ? cls.students.length : 0),
          subjectLabel: cls.subject_name || cls.description || 'Cambridge Primary',
          ...theme,
        };
      });
    }
    return [
      {
        id: null,
        name: 'Stage 2 – Sunshine Class',
        students: 24,
        subjectLabel: 'Mathematics',
        dot: '#EC4899',
        badgeBg: '#FEF3C7',
        badgeText: '#B45309',
        iconBg: '#FFE4E6',
        num: 2,
      },
      {
        id: null,
        name: 'Stage 3 – Explorers',
        students: 28,
        subjectLabel: 'Science',
        dot: '#F59E0B',
        badgeBg: '#DCFCE7',
        badgeText: '#047857',
        iconBg: '#FEF3C7',
        num: 3,
      },
      {
        id: null,
        name: 'Stage 4 – Young Thinkers',
        students: 22,
        subjectLabel: 'English',
        dot: '#3B82F6',
        badgeBg: '#DBEAFE',
        badgeText: '#1D4ED8',
        iconBg: '#DBEAFE',
        num: 4,
      },
    ];
  }, [classroomsData]);

  const rawUserName = user?.full_name || user?.name || 'Sarah';
  const firstName = rawUserName.split(' ')[0];

  return (
    <PageWrapper className="p-5 md:p-7 max-w-[1440px] mx-auto">
      <div className="text-slate-800 font-sans space-y-6">

        {/* ── 1. HERO WELCOME BANNER WITH ILLUSTRATION ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[26px] border border-indigo-100/90 px-6 py-5 md:px-9 md:py-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[0_8px_30px_rgba(99,102,241,0.06)]"
          style={{
            background:
              'linear-gradient(125deg, #FFFFFF 0%, #F5F7FF 45%, #EEF2FF 78%, #FDF4FF 100%)',
          }}
        >
          {/* Subtle decorative pastel blobs */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-52 h-52 rounded-full bg-indigo-200/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-1/3 w-64 h-64 rounded-full bg-pink-200/20 blur-3xl" />

          <div className="relative z-10 max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold">
              <Sparkles size={13} />
              <span>Cambridge Primary Educator Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-[32px] font-extrabold text-[#1E1B4B] tracking-tight leading-tight">
              Welcome back, {firstName}! <span className="inline-block">👋</span>
            </h1>
            <p className="text-sm md:text-[15px] text-slate-600 font-medium leading-relaxed">
              Explore resources, plan lessons, and create engaging learning experiences for your students.
            </p>
          </div>

          {/* Right Teacher at Whiteboard Illustration */}
          <div className="relative z-10 w-full lg:w-auto flex justify-center lg:justify-end -my-2">
            <HeroTeacherIllustration />
          </div>
        </motion.div>

        {/* ── 2. SIX COLORFUL CARDS ROW: TEACHER ZONE + STAGE 1 TO 5 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: Teacher Zone */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (teacherZoneStage) {
                setActiveTeacherZoneModal(teacherZoneStage);
              } else {
                selectStageAndScroll("Teacher's Zone");
              }
            }}
            className={`group relative rounded-[22px] p-4 border cursor-pointer transition-all flex flex-col justify-between overflow-hidden min-h-[168px] ${
              selectedStage.toLowerCase().includes('teacher') || selectedStage.toLowerCase().includes('zone')
                ? 'ring-2 ring-purple-500 shadow-md border-purple-300'
                : 'border-purple-200/80 shadow-[0_6px_20px_rgba(124,58,237,0.08)] hover:shadow-[0_10px_25px_rgba(124,58,237,0.14)]'
            }`}
            style={{
              background: 'linear-gradient(155deg, #F3E8FF 0%, #E0E7FF 55%, #EDE9FE 100%)',
            }}
          >
            {/* Soft decorative sparkles */}
            <div className="flex items-start justify-between gap-2">
              <div className="-ml-1 -mt-1">
                <TeacherZoneCapIllustration />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 text-purple-700 border border-purple-200/60 shadow-2xs">
                Guides
              </span>
            </div>

            <div className="mt-1 flex items-end justify-between gap-2">
              <div>
                <h3 className="text-[17px] font-extrabold text-[#2E1065] leading-snug">
                  Teacher Zone
                </h3>
                <p className="text-[11.5px] font-medium text-purple-900/75 leading-snug mt-0.5">
                  Teaching tools, lesson plans, guides and more
                </p>
              </div>
              <button
                type="button"
                aria-label="Open Teacher Zone"
                className="w-8 h-8 rounded-full bg-purple-600 group-hover:bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:translate-x-0.5 cursor-pointer"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </motion.div>

          {/* Cards 2–6: Stage 1 to Stage 5 with Star Badges & Animal Mascots */}
          {STAGE_CARD_CONFIGS.map((cfg) => {
            const isSelected = selectedStage.toLowerCase() === cfg.key.toLowerCase();
            const Mascot = cfg.Mascot;
            return (
              <motion.div
                key={cfg.key}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (isSelected) {
                    selectStageAndScroll('ALL');
                  } else {
                    selectStageAndScroll(cfg.key);
                  }
                }}
                className={`group relative rounded-[22px] p-4 border cursor-pointer transition-all flex flex-col justify-between overflow-hidden min-h-[168px] ${
                  isSelected
                    ? 'shadow-md'
                    : 'shadow-[0_6px_18px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
                }`}
                style={{
                  background: cfg.bgGradient,
                  borderColor: isSelected ? cfg.activeRing : cfg.borderColor,
                  boxShadow: isSelected ? `0 0 0 2px ${cfg.activeRing}` : undefined,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <StarNumberBadge number={cfg.num} color={cfg.starColor} glow={cfg.starGlow} />
                    <h3 className="text-[18px] font-extrabold text-slate-900 mt-2 leading-tight">
                      {cfg.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{cfg.ages}</p>
                  </div>

                  {/* Cute Animal Mascot Illustration */}
                  <div className="w-[84px] h-[88px] flex items-center justify-center shrink-0 -mr-1 mt-1 transition-transform duration-300 group-hover:scale-105">
                    <Mascot />
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>{isSelected ? 'Showing Stage' : 'Explore Stage'}</span>
                  <ChevronRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── 3. MAIN 2-COLUMN TEACHER DASHBOARD GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN (7 cols on lg): Quick Actions + Teaching Resources + Callout Banner */}
          <div className="lg:col-span-7 space-y-6">

            {/* ⚡ Quick Actions Card (Only Create Classroom) */}
            <div className="bg-white rounded-[22px] border border-slate-200/80 p-5 md:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500">
                    <Zap size={16} className="fill-amber-400 text-amber-500" />
                  </span>
                  <h2 className="text-[17px] font-extrabold text-slate-900">Quick Actions</h2>
                </div>
                <span className="text-xs font-semibold text-slate-400">1-click shortcut</span>
              </div>

              <Link
                to="/classrooms"
                className="group rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 border border-blue-100 bg-gradient-to-r from-[#EFF6FF] via-[#F5F9FF] to-[#DBEAFE]/70 hover:shadow-md hover:border-blue-200 transition-all no-underline"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Plus size={24} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                      Create Classroom
                    </div>
                    <div className="text-xs font-medium text-slate-500 truncate">
                      Set up a new classroom, invite students, and assign curriculum resources
                    </div>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-2xs transition-all">
                  <span>Create</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </div>

            {/* 📖 Teaching Resources Card (Animations, Materials, Exams -> /explore tabs) */}
            <div className="bg-white rounded-[22px] border border-slate-200/80 p-5 md:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <BookOpen size={16} />
                  </span>
                  <h2 className="text-[17px] font-extrabold text-slate-900">Teaching Resources</h2>
                </div>
                <Link
                  to="/explore"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 no-underline"
                >
                  <span>View All</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Resource 1: Animations -> /explore?tab=animations */}
                <Link
                  to="/explore?tab=animations"
                  className="group flex flex-col justify-between gap-3 p-4 rounded-2xl border border-emerald-100/80 bg-[#F0FDF4] hover:bg-emerald-50/80 hover:border-emerald-200 hover:shadow-sm transition-all no-underline"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="text-[14.5px] font-extrabold text-slate-900 flex items-center justify-between">
                      <span>Animations</span>
                      <ChevronRight size={15} className="text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5 leading-snug">
                      Interactive 3D simulations &amp; activities
                    </div>
                  </div>
                </Link>

                {/* Resource 2: Materials -> /explore?tab=materials */}
                <Link
                  to="/explore?tab=materials"
                  className="group flex flex-col justify-between gap-3 p-4 rounded-2xl border border-indigo-100/80 bg-[#F5F7FF] hover:bg-indigo-50/80 hover:border-indigo-200 hover:shadow-sm transition-all no-underline"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div className="text-[14.5px] font-extrabold text-slate-900 flex items-center justify-between">
                      <span>Materials</span>
                      <ChevronRight size={15} className="text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5 leading-snug">
                      Notes, videos &amp; printable worksheets
                    </div>
                  </div>
                </Link>

                {/* Resource 3: Exams -> /explore?tab=exams */}
                <Link
                  to="/explore?tab=exams"
                  className="group flex flex-col justify-between gap-3 p-4 rounded-2xl border border-amber-100/80 bg-[#FFFBEB] hover:bg-amber-50/80 hover:border-amber-200 hover:shadow-sm transition-all no-underline"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Award size={20} />
                  </div>
                  <div>
                    <div className="text-[14.5px] font-extrabold text-slate-900 flex items-center justify-between">
                      <span>Exams</span>
                      <ChevronRight size={15} className="text-amber-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5 leading-snug">
                      Quizzes &amp; practice exam papers
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 🏆 Make Teaching Easier Callout Banner */}
            <div
              className="rounded-[22px] p-5 border border-purple-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(124,58,237,0.06)]"
              style={{
                background: 'linear-gradient(120deg, #F5F3FF 0%, #EDE9FE 50%, #FCE7F3 100%)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/90 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
                  <Trophy size={24} className="text-amber-500 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-extrabold text-[#2E1065]">
                    Make teaching easier and more effective!
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-0.5 leading-relaxed">
                    Access complete curriculum resources, create engaging lessons, and track your students&apos; progress.
                  </p>
                </div>
              </div>

              <Link
                to="/explore"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-sm no-underline transition-all"
              >
                <span>Explore Resources</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN (5 cols on lg): My Classrooms + Explanation Board */}
          <div className="lg:col-span-5 space-y-6">

            {/* 🏫 My Classrooms Card */}
            <div className="bg-white rounded-[22px] border border-slate-200/80 p-5 md:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <Users size={16} />
                  </span>
                  <h2 className="text-[17px] font-extrabold text-slate-900">My Classrooms</h2>
                </div>
                <Link
                  to="/classrooms"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 no-underline"
                >
                  <span>View All</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-3">
                {classroomsList.map((cls, idx) => (
                  <Link
                    key={cls.id || idx}
                    to={cls.id ? `/classrooms/${cls.id}` : '/classrooms'}
                    className="group flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/40 hover:border-indigo-100 transition-all no-underline"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm shadow-2xs"
                        style={{ background: cls.iconBg, color: cls.dot }}
                      >
                        {cls.num}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-extrabold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                          {cls.name}
                        </div>
                        <div className="text-[11.5px] font-medium text-slate-500">
                          {cls.students} Students
                        </div>
                      </div>
                    </div>

                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0"
                      style={{ background: cls.badgeBg, color: cls.badgeText }}
                    >
                      {cls.subjectLabel}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 🎨 Explanation Board Card */}
            <div className="bg-white rounded-[22px] border border-slate-200/80 p-5 md:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <PenTool size={16} />
                  </span>
                  <h2 className="text-[17px] font-extrabold text-slate-900">Explanation Board</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Smart Whiteboard
                </span>
              </div>

              <div
                onClick={() => window.dispatchEvent(new CustomEvent('open-explanation-board'))}
                className="group rounded-2xl p-4 sm:p-5 border border-indigo-100 bg-gradient-to-br from-[#F5F7FF] via-[#EEF2FF] to-[#F3E8FF]/70 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <PenTool size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      Interactive Explanation Board
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                      Open a live smart canvas with freehand pens, geometry shapes, ruler, protractor, and laser pointer for classroom teaching.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-indigo-200/50">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700">
                    <span>Draw · Measure · Explain</span>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                  >
                    <span>Launch Board</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. CAMBRIDGE PRIMARY CURRICULUM & STAGE EXPLORER (LIGHT THEME) ── */}
        <div ref={curriculumRef} className="pt-2 space-y-5">
          <div className="bg-white rounded-[22px] border border-slate-200/80 p-4 md:p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-extrabold text-slate-900">
                  Curriculum &amp; Stage Explorer
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  Browse Cambridge Primary stages, subjects, chapters, and official Teacher Zone documents
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Stage Filter Dropdown */}
              <div className="relative min-w-[230px]" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers size={15} className="text-indigo-600 shrink-0" />
                    <span className="truncate">
                      {selectedStage === 'ALL'
                        ? `All Zones & Stages (${stagesList.length})`
                        : selectedStageObj
                        ? `${selectedStageObj.name} (${(selectedStageObj.subjects || []).length} Subjects)`
                        : selectedStage}
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[260px] bg-white border border-slate-200 rounded-2xl p-1.5 z-50 shadow-xl max-h-80 overflow-y-auto space-y-1"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          selectStageAndScroll('ALL');
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          selectedStage === 'ALL'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>All Zones &amp; Stages</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md ${
                            selectedStage === 'ALL'
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {stagesList.length} Total
                        </span>
                      </button>

                      <div className="h-px bg-slate-100 my-1" />

                      {stagesList.map((stg) => {
                        const isActive =
                          selectedStage.toLowerCase() === stg.name.toLowerCase();
                        return (
                          <button
                            key={stg.id}
                            type="button"
                            onClick={() => {
                              selectStageAndScroll(stg.name);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {isActive && <Check size={13} />}
                              <span className="truncate">{stg.name}</span>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {(stg.subjects || []).length} Subjects
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Input */}
              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Filter stage, subject, or topic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stage Hierarchy Cards */}
          {loading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-44 rounded-[22px] bg-white border border-slate-200/80 animate-pulse"
                  />
                ))}
            </div>
          ) : filteredStages.length === 0 ? (
            <div className="bg-white rounded-[22px] border border-slate-200/80 p-8">
              <EmptyState
                icon={FolderTree}
                title="No matching stages or topics found"
                description="Try clearing your search query or selecting All Zones & Stages."
              />
            </div>
          ) : (
            filteredStages.map((stage) => {
              const isTeacherZone =
                stage.name.toLowerCase().includes('teacher') ||
                stage.name.toLowerCase().includes('zone');
              const totalTopics = (stage.subjects || []).reduce(
                (sum, s) => sum + (s.topic_count || (s.topics || []).length || 0),
                0
              );

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-[22px] border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.03)]"
                >
                  {isTeacherZone ? (
                    /* ── LIGHT-THEMED TEACHER'S ZONE BANNER ── */
                    <div
                      className="p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                      style={{
                        background:
                          'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 60%, #FDF2F8 100%)',
                      }}
                    >
                      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-purple-200/80 flex items-center justify-center shrink-0 shadow-xs">
                          <GraduationCap size={28} className="text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap mb-1">
                            <h3 className="text-xl font-extrabold text-[#2E1065]">
                              {stage.name}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-[10.5px] font-extrabold uppercase tracking-wider">
                              Cambridge Primary
                            </span>
                          </div>
                          <p className="text-xs sm:text-[13.5px] text-slate-600 font-medium leading-relaxed max-w-3xl">
                            Discover practical teaching methodologies and reference guidance designed for Cambridge Primary educators. Access active learning, assessment strategies, differentiation, and ready-to-use classroom materials.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-3 shrink-0 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-700 bg-white border border-purple-200/80 px-3 py-1 rounded-lg">
                            {(stage.subjects || []).length || 8} Teaching Approaches
                          </span>
                          <span className="text-xs font-bold text-indigo-700 bg-white border border-indigo-200/80 px-3 py-1 rounded-lg">
                            {totalTopics || 8} Guidance Docs
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTeacherZoneModal(stage)}
                          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
                        >
                          <Eye size={15} />
                          <span>Explore Teaching Approaches</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Standard Stage Header */}
                      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-lg font-extrabold text-slate-900">
                              {stage.name}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[10.5px] font-extrabold uppercase tracking-wider">
                              {stage.curriculum_name || 'Cambridge Primary'}
                            </span>
                          </div>
                          {stage.description && (
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {stage.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
                            {(stage.subjects || []).length} Subjects
                          </span>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                            {totalTopics} Topics
                          </span>
                        </div>
                      </div>

                      {/* Subjects Grid inside Stage */}
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(stage.subjects || []).map((subject) => {
                          const isExpanded = expandedSubjects[subject.id] || false;
                          const visibleTopics = isExpanded
                            ? subject.topics || []
                            : (subject.topics || []).slice(0, 3);
                          const hasMore = (subject.topics || []).length > 3;
                          const theme = getSubjectTheme(subject.name);
                          const SubjectIcon = theme.icon;

                          return (
                            <div
                              key={subject.id}
                              className="rounded-2xl border border-slate-200/90 bg-white p-4 flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all"
                            >
                              <div>
                                {/* Subject Card Top */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                      style={{ background: theme.iconBg }}
                                    >
                                      <SubjectIcon size={20} color={theme.accent} />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-[15px] font-extrabold text-slate-900 truncate">
                                        {subject.name}
                                      </h4>
                                      {subject.description && (
                                        <p className="text-[11.5px] text-slate-500 line-clamp-1">
                                          {subject.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <span
                                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 border"
                                    style={{
                                      background: theme.badgeBg,
                                      borderColor: theme.badgeBorder,
                                      color: theme.badgeColor,
                                    }}
                                  >
                                    {subject.topic_count || (subject.topics || []).length || 0} chapters
                                  </span>
                                </div>

                                {/* Topics Accordion List */}
                                <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                                  {(subject.topics || []).length === 0 ? (
                                    <div className="text-xs text-slate-400 italic py-2">
                                      No topics added yet for this subject.
                                    </div>
                                  ) : (
                                    visibleTopics.map((topic, idx) => (
                                      <StrandItem
                                        key={topic.id}
                                        topic={topic}
                                        idx={idx}
                                        accentColor={theme.accent}
                                      />
                                    ))
                                  )}
                                </div>

                                {/* Show More / Less Button */}
                                {hasMore && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(subject.id)}
                                    className="w-full mt-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-indigo-600 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
                              </div>

                              {/* Explore Full Subject Link */}
                              <Link
                                to={`/subjects/${subject.id}`}
                                className="mt-3 pt-2.5 border-t border-slate-100 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center justify-between no-underline"
                              >
                                <span>Explore Subject Chapters</span>
                                <ArrowRight size={14} />
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
        </div>

        {/* ── Modal: Subject Content Explorer (Light Theme) ── */}
        <Modal
          open={!!activeSubjectModal}
          onClose={() => setActiveSubjectModal(null)}
          size="2xl"
          title={activeSubjectModal?.name || 'Subject Content'}
        >
          {activeSubjectModal && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-xl">{getSubjectIcon(activeSubjectModal.name)}</span>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {activeSubjectModal.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-700 text-[10.5px] font-extrabold uppercase">
                    Cambridge Primary
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {activeSubjectModal.description ||
                    'Explore teaching guidance, classroom strategies, and ready-to-use ideas for this approach.'}
                </p>
              </div>

              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" />
                <span>
                  Chapters &amp; Learning Documents ({(activeSubjectModal.topics || []).length})
                </span>
              </h3>

              <div className="space-y-2">
                {(activeSubjectModal.topics || []).length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-400 text-xs italic">
                    No chapters found for this subject yet.
                  </div>
                ) : (
                  activeSubjectModal.topics.map((topic, idx) => (
                    <Link
                      key={topic.id}
                      to={`/topics/${topic.id}`}
                      onClick={() => setActiveSubjectModal(null)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-slate-800 no-underline transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-indigo-600">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{topic.name}</div>
                          {topic.resource_count > 0 && (
                            <div className="text-[11px] text-slate-500">
                              📁 {topic.resource_count} items available
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                        <span>Open Chapter</span>
                        <ChevronRight size={15} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* ── Modal: Full Teacher's Zone Explorer (Light Theme) ── */}
        <Modal
          open={!!activeTeacherZoneModal}
          onClose={() => setActiveTeacherZoneModal(null)}
          size="2xl"
          title="Teacher's Zone - Practical Teaching Approaches"
        >
          {activeTeacherZoneModal && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/70 p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-purple-600">
                      <BookOpen size={18} />
                    </div>
                    <h2 className="text-lg font-extrabold text-[#2E1065]">
                      Teacher&apos;s Zone Approaches
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-purple-200 text-purple-700 text-[10.5px] font-extrabold uppercase">
                    Cambridge Primary
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Discover practical teaching methodologies and reference guidance designed for Cambridge Primary educators. Click any approach card to open and view its official document.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(activeTeacherZoneModal.subjects || []).map((subject) => {
                  const iconEmoji = getSubjectIcon(subject.name);
                  const topicsList = subject.topics || [];
                  const realDocCount = topicsList.reduce(
                    (sum, tp) => sum + (Number(tp.resource_count) || 0),
                    0
                  );

                  return (
                    <div
                      key={subject.id}
                      className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-purple-200 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-lg">
                            {iconEmoji}
                          </div>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              realDocCount > 0
                                ? 'bg-purple-50 border-purple-200 text-purple-700'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            {realDocCount} {realDocCount === 1 ? 'document' : 'documents'}
                          </span>
                        </div>

                        <h3 className="text-[15px] font-extrabold text-slate-900 mb-1">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">
                          {subject.description ||
                            'Clear guidance, classroom strategies, and ready-to-use ideas.'}
                        </p>
                      </div>

                      <div className="space-y-1.5 mt-auto">
                        {topicsList.map((tp) => {
                          const hasDoc = Number(tp.resource_count) > 0;
                          return (
                            <button
                              key={tp.id}
                              type="button"
                              onClick={
                                hasDoc ? () => handleViewTopicContent(tp.id, tp.name) : undefined
                              }
                              className={`w-full px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all ${
                                hasDoc
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs'
                                  : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-default'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText size={14} className="shrink-0" />
                                <span className="truncate">
                                  {hasDoc ? 'View Document' : 'No Document Uploaded'}
                                </span>
                              </div>
                              {hasDoc && (
                                <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md text-[10.5px]">
                                  <Eye size={12} />
                                  <span>Read</span>
                                </span>
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

        {/* ── Direct 1-Click PDF Document Viewer Modal ── */}
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