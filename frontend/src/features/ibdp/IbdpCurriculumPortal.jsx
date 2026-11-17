import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen, FileText, Video, Sparkles, Image as ImageIcon,
  ChevronRight, ChevronDown, Search, LogOut,
  Layers, ExternalLink, ShieldCheck,
  ArrowLeft, ArrowRight, Home, Star, Clock, Trash2,
  User, Mail, KeyRound, Loader2, X
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { studentApi } from '@/api/services';
import PdfViewerModal from '@/components/shared/PdfViewerModal';
import MuxPlayer from '@mux/mux-player-react';
import toast from 'react-hot-toast';

const SUBJECT_MATERIALS_TOPIC_NAME = 'Subject Materials';

// ── Custom Illustrated Folder SVGs (Matching Reference Screenshot) ────────────
function YellowHeaderFolder({ size = 56 }) {
  return (
    <svg width={size} height={Math.round(size * 0.86)} viewBox="0 0 64 55" fill="none">
      <path
        d="M4 10C4 6.68629 6.68629 4 10 4H24.3431C25.9344 4 27.4606 4.63214 28.5858 5.75736L32.8284 10H54C57.3137 10 60 12.6863 60 16V45C60 48.3137 57.3137 51 54 51H10C6.68629 51 4 48.3137 4 45V10Z"
        fill="url(#yellowBack)"
      />
      <rect x="4" y="15" width="56" height="36" rx="6" fill="url(#yellowFront)" />
      <rect x="4" y="15" width="56" height="36" rx="6" stroke="#F59E0B" strokeOpacity="0.25" />
      <defs>
        <linearGradient id="yellowBack" x1="32" y1="4" x2="32" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="yellowFront" x1="32" y1="15" x2="32" y2="51" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SmallFolderIcon({ color = 'blue', size = 24 }) {
  const palettes = {
    blue:   { back: '#60A5FA', frontTop: '#93C5FD', frontBot: '#3B82F6' },
    green:  { back: '#34D399', frontTop: '#86EFAC', frontBot: '#10B981' },
    purple: { back: '#A78BFA', frontTop: '#C4B5FD', frontBot: '#8B5CF6' },
    amber:  { back: '#FBBF24', frontTop: '#FDE68A', frontBot: '#F59E0B' },
    rose:   { back: '#FB7185', frontTop: '#FDA4AF', frontBot: '#F43F5E' },
  };
  const p = palettes[color] || palettes.blue;
  const uid = `smf-${color}`;
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 28 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M2 4.5C2 3.11929 3.11929 2 4.5 2H10.6C11.3 2 11.97 2.28 12.46 2.77L14.2 4.5H23.5C24.8807 4.5 26 5.61929 26 7V19.5C26 20.8807 24.8807 22 23.5 22H4.5C3.11929 22 2 20.8807 2 19.5V4.5Z"
        fill={p.back}
      />
      <rect x="2" y="6.8" width="24" height="15.2" rx="3" fill={`url(#${uid})`} />
      <defs>
        <linearGradient id={uid} x1="14" y1="6.8" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor={p.frontTop} />
          <stop offset="1" stopColor={p.frontBot} />
        </linearGradient>
      </defs>
    </svg>
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
      back: '#7DD3FC',
      frontStart: '#BAE6FD',
      frontEnd: '#60A5FA',
      stroke: '#3B82F6',
      glyph: '#1D4ED8',
    },
    green: {
      back: '#6EE7B7',
      frontStart: '#A7F3D0',
      frontEnd: '#34D399',
      stroke: '#10B981',
      glyph: '#047857',
    },
    purple: {
      back: '#C4B5FD',
      frontStart: '#DDD6FE',
      frontEnd: '#A78BFA',
      stroke: '#8B5CF6',
      glyph: '#5B21B6',
    },
    amber: {
      back: '#FDE68A',
      frontStart: '#FEF3C7',
      frontEnd: '#FBBF24',
      stroke: '#F59E0B',
      glyph: '#B45309',
    },
    rose: {
      back: '#FDA4AF',
      frontStart: '#FFE4E6',
      frontEnd: '#FB7185',
      stroke: '#F43F5E',
      glyph: '#BE123C',
    },
  };

  const t = themes[theme];
  const gradId = `subj-folder-${theme}-${index}`;

  return (
    <svg width="86" height="72" viewBox="0 0 86 72" fill="none">
      {/* Folder Back & Tab */}
      <path
        d="M4 13C4 9.13401 7.13401 6 11 6H31.5C33.4 6 35.2 6.78 36.5 8.15L41.2 13H75C78.866 13 82 16.134 82 20V59C82 62.866 78.866 66 75 66H11C7.13401 66 4 62.866 4 59V13Z"
        fill={t.back}
      />
      {/* Paper Sheet Peeking Out */}
      <rect x="10" y="13" width="66" height="10" rx="3" fill="#FFFFFF" fillOpacity="0.65" />
      {/* Folder Front Body */}
      <rect x="4" y="18" width="78" height="48" rx="7" fill={`url(#${gradId})`} />
      <rect x="4.5" y="18.5" width="77" height="47" rx="6.5" stroke={t.stroke} strokeOpacity="0.25" />

      {/* Center Emblem */}
      {isMath ? (
        <g transform="translate(29, 28)">
          <rect x="0" y="0" width="12" height="12" rx="2.5" fill={t.glyph} fillOpacity="0.85" />
          <path d="M6 3.5V8.5M3.5 6H8.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="15" y="0" width="12" height="12" rx="2.5" fill={t.glyph} fillOpacity="0.85" />
          <path d="M18.5 6H23.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="0" y="15" width="12" height="12" rx="2.5" fill={t.glyph} fillOpacity="0.85" />
          <path d="M4 19L8 23M8 19L4 23" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="15" y="15" width="12" height="12" rx="2.5" fill={t.glyph} fillOpacity="0.85" />
          <path d="M18.5 19.5H23.5M18.5 22.5H23.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ) : isScience ? (
        <g transform="translate(31, 26)">
          <path
            d="M9 2H15M10.5 2V9.5L4.5 20.5C3.7 22 4.8 24 6.5 24H17.5C19.2 24 20.3 22 19.5 20.5L13.5 9.5V2"
            stroke={t.glyph}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={t.glyph}
            fillOpacity="0.18"
          />
          <path
            d="M6.2 18.5H17.8L19.2 21C19.8 22.1 19 23.5 17.7 23.5H6.3C5 23.5 4.2 22.1 4.8 21L6.2 18.5Z"
            fill={t.glyph}
            fillOpacity="0.75"
          />
          <circle cx="10.5" cy="15.5" r="1.2" fill={t.glyph} />
          <circle cx="13.8" cy="13.5" r="1" fill={t.glyph} />
        </g>
      ) : (
        <g transform="translate(31, 29)">
          <rect x="2" y="2" width="20" height="22" rx="3" fill={t.glyph} fillOpacity="0.2" stroke={t.glyph} strokeWidth="1.8" />
          <path d="M6.5 8H17.5M6.5 12.5H17.5M6.5 17H13.5" stroke={t.glyph} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}

      <defs>
        <linearGradient id={gradId} x1="43" y1="18" x2="43" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor={t.frontStart} />
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
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  worksheet: {
    label: 'Worksheet',
    actionLabel: 'Open Worksheet',
    icon: ImageIcon,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  video: {
    label: 'Video Lesson',
    actionLabel: 'Watch Video',
    icon: Video,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
  animation: {
    label: 'Interactive / 3D',
    actionLabel: 'Launch Interactive',
    icon: Sparkles,
    color: '#059669',
    bg: '#ECFDF5',
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
  const [sidebarTab, setSidebarTab] = useState('curriculum'); // 'curriculum' | 'materials' | 'starred' | 'recent'
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [ibdpCurriculum, setIbdpCurriculum] = useState(null);

  const [expandedGrades, setExpandedGrades] = useState({});
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Browser-like Back / Forward history stack inside the IBDP Explorer
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

  // Starred & Recent materials persisted in localStorage
  const [starredIds, setStarredIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ibdp_starred_items') || '[]'); } catch { return []; }
  });
  const [recentItems, setRecentItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ibdp_recent_items') || '[]'); } catch { return []; }
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

  const recordRecentItem = (item) => {
    setRecentItems(prev => {
      const filtered = prev.filter(x => x.id !== item.id);
      const next = [{ ...item, openedAt: new Date().toISOString() }, ...filtered].slice(0, 30);
      try { localStorage.setItem('ibdp_recent_items', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Topic/Subject content state
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

  // All subjects flattened for Quick Access in the left sidebar
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

  // Load all materials across all IBDP topics when "My Materials" tab is clicked
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

  // ── Open Material Viewer ─────────────────────────────────────────────────────
  const handleOpenMaterial = async (item) => {
    recordRecentItem(item);
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

  // Filtered materials for current view
  const displayedMaterials = useMemo(() => {
    const source =
      sidebarTab === 'materials' ? allIbdpMaterials :
      sidebarTab === 'starred'   ? starredIds :
      sidebarTab === 'recent'    ? recentItems :
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
  }, [sidebarTab, allIbdpMaterials, starredIds, recentItems, topicItems, typeFilter, searchQuery]);

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW 1: CONFIDENTIAL AUTH GATE (WHEN NOT LOGGED IN)
  // ════════════════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #F1F5F9 0%, #F8FAFC 50%, #EFF6FF 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#0F172A',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '22px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <SmallFolderIcon color="blue" size={28} />
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#2563EB',
              background: '#EFF6FF', padding: '0.25rem 0.65rem', borderRadius: 999,
            }}>
              IBDP Curriculum Portal
            </span>
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            {authMode === 'login' ? 'Sign in to IBDP Curriculum' : 'Register for IBDP Curriculum'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
            IBDP curriculum portal. Continue with Google or sign in with your email credentials.
          </p>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={submittingAuth || authLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              padding: '0.78rem 1rem',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              color: '#0F172A',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              or with email
            </span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '1.1rem',
          }}>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              style={{
                padding: '0.45rem',
                borderRadius: '7px',
                border: 'none',
                background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: authMode === 'login' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              style={{
                padding: '0.45rem',
                borderRadius: '7px',
                border: 'none',
                background: authMode === 'register' ? '#FFFFFF' : 'transparent',
                color: authMode === 'register' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: authMode === 'register' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {authMode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={authForm.full_name}
                    onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      borderRadius: '10px', border: '1px solid #CBD5E1',
                      fontSize: '0.86rem', color: '#0F172A', background: '#FFFFFF',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                    borderRadius: '10px', border: '1px solid #CBD5E1',
                    fontSize: '0.86rem', color: '#0F172A', background: '#FFFFFF',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="password"
                  placeholder={authMode === 'register' ? 'Minimum 8 characters' : 'Enter your password'}
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                    borderRadius: '10px', border: '1px solid #CBD5E1',
                    fontSize: '0.86rem', color: '#0F172A', background: '#FFFFFF',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingAuth || authLoading}
              style={{
                marginTop: '0.35rem',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {(submittingAuth || authLoading) && <Loader2 size={15} className="animate-spin" />}
              <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW 2: FILE-EXPLORER STYLE WHITE DESKTOP APPLICATION (MATCHING SCREENSHOT)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#FFFFFF',
      color: '#0F172A',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* ── TOP FILE EXPLORER ADDRESS & SEARCH BAR ── */}
      <header style={{
        height: 64,
        background: '#FAFBFD',
        borderBottom: '1px solid #E8EEF5',
        padding: '0 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        {/* Back / Forward / Home Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={!canGoBack}
            title="Back"
            style={{
              width: 34, height: 34, borderRadius: 9,
              border: 'none', background: 'transparent',
              color: canGoBack ? '#334155' : '#CBD5E1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canGoBack ? 'pointer' : 'default',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={!canGoForward}
            title="Forward"
            style={{
              width: 34, height: 34, borderRadius: 9,
              border: 'none', background: 'transparent',
              color: canGoForward ? '#334155' : '#CBD5E1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canGoForward ? 'pointer' : 'default',
            }}
          >
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            onClick={handleHome}
            title="Curriculum Home"
            style={{
              width: 34, height: 34, borderRadius: 9,
              border: 'none', background: 'transparent',
              color: '#334155',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Home size={18} />
          </button>
        </div>

        {/* Center Breadcrumb Address Pill */}
        <div style={{
          flex: 1,
          height: 40,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 11,
          padding: '0 0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          minWidth: 0,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
        }}>
          <SmallFolderIcon color="blue" size={20} />

          <button
            type="button"
            onClick={handleHome}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: !activeSubject ? 700 : 500,
              color: !activeSubject ? '#0F172A' : '#475569',
              whiteSpace: 'nowrap',
            }}
          >
            {sidebarTab === 'materials' ? 'My Materials' : sidebarTab === 'starred' ? 'Starred' : 'Curriculum'}
          </button>

          {activeSubject && sidebarTab === 'curriculum' && (
            <>
              <ChevronRight size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.86rem', fontWeight: 500, color: '#475569', whiteSpace: 'nowrap' }}>
                {activeSubject.class_name}
              </span>
              <ChevronRight size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
              <button
                type="button"
                onClick={() => navigateExplorer({ tab: 'curriculum', subjectId: activeSubject.id, topicId: null })}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: !activeTopic ? 700 : 500,
                  color: !activeTopic ? '#0F172A' : '#475569',
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
                      fontSize: '0.86rem', fontWeight: 500, color: '#475569', whiteSpace: 'nowrap',
                    }}
                  >
                    {activeTopic.parentTopic.name}
                  </button>
                </>
              )}
              <ChevronRight size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTopic.name}
              </span>
            </>
          )}
        </div>

        {/* Right Search Input + User / Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 230 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                padding: '0 0.85rem 0 2.25rem',
                borderRadius: 11,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: '0.84rem',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="button"
            onClick={logout}
            title={`Signed in as ${user.full_name || user.email} — Click to Sign Out`}
            style={{
              height: 40,
              padding: '0 0.85rem',
              borderRadius: 11,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#475569',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── MAIN BODY: LEFT SIDEBAR + WHITE CONTENT CANVAS ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
        {/* Left Sidebar (Matching Reference Image) */}
        <aside style={{
          width: 245,
          flexShrink: 0,
          background: '#F8FAFD',
          borderRight: '1px solid #E8EEF5',
          padding: '1.15rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          {/* Top IBDP Dropdown Header */}
          <div
            onClick={handleHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.65rem',
              marginBottom: '0.5rem',
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: '#EFF6FF', color: '#2563EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Layers size={17} />
              </div>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>
                {ibdpCurriculum?.name || 'IBDP'}
              </span>
            </div>
            <ChevronDown size={15} color="#475569" />
          </div>

          {/* Primary Nav Items */}
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
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 11,
                  border: 'none',
                  background: isActive ? '#DCEBFE' : 'transparent',
                  color: isActive ? '#0F172A' : '#334155',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
              >
                {nav.icon === 'folder' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#2563EB' : '#475569'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* ── MAIN WHITE CONTENT WORKSPACE ── */}
        <main style={{ flex: 1, padding: '2rem 2.5rem', background: '#FFFFFF', overflowY: 'auto' }}>
          {loadingHierarchy ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
              <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#2563EB' }} />
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Loading IBDP Curriculum...</div>
            </div>
          ) : !ibdpCurriculum ? (
            <div style={{
              background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 18,
              padding: '3rem 2rem', textAlign: 'center', maxWidth: 520, margin: '2rem auto',
            }}>
              <YellowHeaderFolder size={56} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0.85rem 0 0.35rem' }}>
                IBDP Curriculum Not Found
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
                Create a curriculum named <strong>IBDP</strong> in the Admin Dashboard to populate this workspace.
              </p>
            </div>
          ) : sidebarTab !== 'curriculum' ? (
            /* ── FLAT MATERIALS VIEW (My Materials / Starred / Recent) ── */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                <YellowHeaderFolder size={54} />
                <div>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                    {sidebarTab === 'materials' ? 'My Materials' : sidebarTab === 'starred' ? 'Starred Materials' : 'Recent Materials'}
                  </h1>
                  <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '0.2rem 0 0' }}>
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
                <div style={{
                  padding: '3rem 1.5rem', textAlign: 'center', background: '#F8FAFC',
                  borderRadius: 16, border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '0.9rem',
                }}>
                  {sidebarTab === 'starred'
                    ? 'No starred materials yet. Click the star icon on any material to bookmark it here.'
                    : sidebarTab === 'recent'
                    ? 'No recently opened materials yet.'
                    : 'No uploaded materials found.'}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.15rem',
                }}>
                  {displayedMaterials.map((item) => {
                    const meta = TYPE_META[item.content_type] || TYPE_META.note;
                    const Icon = meta.icon;
                    const isStarred = starredIds.some(x => x.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleOpenMaterial(item)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #EEF2F6',
                          borderRadius: 16,
                          padding: '1.25rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.9rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{
                              width: 42, height: 42, borderRadius: 11,
                              background: meta.bg, border: `1px solid ${meta.border}`,
                              color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Icon size={20} />
                            </div>
                            <button
                              type="button"
                              onClick={(e) => toggleStarItem(e, item)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: isStarred ? '#F59E0B' : '#CBD5E1', padding: 4,
                              }}
                              title={isStarred ? 'Remove from Starred' : 'Add to Starred'}
                            >
                              <Star size={17} fill={isStarred ? '#F59E0B' : 'none'} />
                            </button>
                          </div>
                          <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem' }}>
                            {item.title}
                          </h4>
                          {(item._subjectName || item._topicName) && (
                            <p style={{ fontSize: '0.76rem', color: '#64748B', margin: 0 }}>
                              {[item._className, item._subjectName, item._topicName].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          paddingTop: '0.65rem', borderTop: '1px solid #F1F5F9',
                          fontSize: '0.78rem', fontWeight: 600, color: meta.color,
                        }}>
                          <span>{meta.actionLabel}</span>
                          <ExternalLink size={13} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !selectedSubjectId ? (
            /* ── ROOT CURRICULUM EXPLORER (EXACT MATCH TO SCREENSHOT) ── */
            <div>
              {/* Top Curriculum Folder Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.1rem',
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #F1F5F9',
              }}>
                <YellowHeaderFolder size={58} />
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                    Curriculum
                  </h1>
                  <p style={{ fontSize: '0.92rem', color: '#64748B', margin: '0.2rem 0 0', fontWeight: 500 }}>
                    {ibdpCurriculum.description || 'IBDP Curriculum Structure'}
                  </p>
                </div>
              </div>

              {/* Collapsible Grade / Stage Accordions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {classes.map((cls) => {
                  const isOpen = !!expandedGrades[cls.id];
                  const clsSubjects = (cls.subjects || []).filter(s => {
                    if (!searchQuery.trim()) return true;
                    return s.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
                  });

                  return (
                    <div key={cls.id}>
                      {/* Grade / Stage Bar */}
                      <button
                        type="button"
                        onClick={() => setExpandedGrades(prev => ({ ...prev, [cls.id]: !isOpen }))}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.85rem 1rem',
                          borderRadius: 12,
                          border: isOpen ? 'none' : '1px solid #F1F5F9',
                          background: isOpen ? 'transparent' : '#F8FAFD',
                          color: '#0F172A',
                          fontSize: '1.08rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {isOpen ? (
                          <ChevronDown size={18} color="#334155" />
                        ) : (
                          <ChevronRight size={18} color="#334155" />
                        )}
                        <SmallFolderIcon color="blue" size={26} />
                        <span>{cls.name}</span>
                      </button>

                      {/* Expanded Subject Cards Grid */}
                      {isOpen && (
                        <div style={{
                          padding: '0.75rem 0.5rem 1.25rem 1.25rem',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 285px))',
                          gap: '1.25rem',
                        }}>
                          {clsSubjects.length === 0 ? (
                            <div style={{
                              gridColumn: '1 / -1',
                              padding: '1.25rem',
                              borderRadius: 14,
                              background: '#F8FAFD',
                              border: '1px dashed #CBD5E1',
                              color: '#64748B',
                              fontSize: '0.85rem',
                            }}>
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
                                  style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #EDF2F7',
                                    borderRadius: 18,
                                    padding: '1.4rem 1.5rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 24px rgba(15, 23, 42, 0.04)',
                                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '0.85rem',
                                  }}
                                >
                                  <SubjectFolderIllustration subjectName={sub.name} index={sIdx} />

                                  <div>
                                    <h3 style={{
                                      fontSize: '1.12rem',
                                      fontWeight: 800,
                                      color: '#0F172A',
                                      margin: '0 0 0.3rem 0',
                                      letterSpacing: '-0.01em',
                                    }}>
                                      {sub.name}
                                    </h3>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.45rem',
                                      fontSize: '0.84rem',
                                      fontWeight: 500,
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
            /* ── DRILLED-IN SUBJECT OR TOPIC EXPLORER VIEW ── */
            <div>
              {/* Subject / Topic Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingBottom: '1.35rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #F1F5F9',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <SubjectFolderIllustration subjectName={activeSubject?.name} index={0} />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', marginBottom: '0.15rem' }}>
                      {activeTopic ? `${activeSubject?.class_name} • ${activeSubject?.name}` : activeSubject?.class_name}
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                      {activeTopic ? activeTopic.name : activeSubject?.name}
                    </h1>
                    <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                      {(activeTopic ? activeTopic.description : activeSubject?.description) || 'Browse topics and uploaded study materials'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Topics Folder Cards (when viewing a Subject) */}
              {!selectedTopicId && subjectRootTopics.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#334155', margin: '0 0 0.9rem' }}>
                    Topics & Chapters ({subjectRootTopics.length})
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 265px))',
                    gap: '1.1rem',
                  }}>
                    {subjectRootTopics.map((top, idx) => {
                      const subs = top.children || top.subtopics || [];
                      return (
                        <div
                          key={top.id}
                          onClick={() => navigateExplorer({ tab: 'curriculum', subjectId: activeSubject.id, topicId: top.id })}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #EDF2F7',
                            borderRadius: 16,
                            padding: '1.2rem 1.3rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.7rem',
                          }}
                        >
                          <SmallFolderIcon color={['blue', 'green', 'purple', 'amber', 'rose'][idx % 5]} size={38} />
                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem' }}>
                              {top.name}
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                              {subs.length > 0 && <span>{subs.length} Subtopic{subs.length !== 1 ? 's' : ''} • </span>}
                              <span>{top.resource_count || 0} Material{(top.resource_count || 0) !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Subtopics Folder Cards (when viewing a root Topic that has subtopics) */}
              {activeTopic && !activeTopic.isSubtopic && (activeTopic.children || activeTopic.subtopics || []).length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#334155', margin: '0 0 0.9rem' }}>
                    Subtopics ({(activeTopic.children || activeTopic.subtopics || []).length})
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 250px))',
                    gap: '1rem',
                  }}>
                    {(activeTopic.children || activeTopic.subtopics || []).map((st, idx) => (
                      <div
                        key={st.id}
                        onClick={() => navigateExplorer({ tab: 'curriculum', subjectId: activeSubject.id, topicId: st.id })}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #EDF2F7',
                          borderRadius: 15,
                          padding: '1.1rem 1.2rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        <SmallFolderIcon color={['blue', 'green', 'purple', 'amber', 'rose'][idx % 5]} size={32} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>{st.name}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                            {st.resource_count || 0} Material{(st.resource_count || 0) !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
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
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', margin: 0 }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {availableTabs.map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setTypeFilter(tab.id)}
                              style={{
                                padding: '0.38rem 0.75rem',
                                borderRadius: 9,
                                border: typeFilter === tab.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                                background: typeFilter === tab.id ? '#EFF6FF' : '#F8FAFD',
                                color: typeFilter === tab.id ? '#1D4ED8' : '#475569',
                                fontSize: '0.78rem',
                                fontWeight: 600,
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
                    <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
                      <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#2563EB' }} />
                      Loading materials...
                    </div>
                  ) : displayedMaterials.length === 0 ? (
                    <div style={{
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      background: '#F8FAFD',
                      borderRadius: 16,
                      border: '1px dashed #CBD5E1',
                      color: '#64748B',
                      fontSize: '0.88rem',
                    }}>
                      No materials uploaded here yet.
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: '1.1rem',
                    }}>
                      {displayedMaterials.map((item) => {
                        const meta = TYPE_META[item.content_type] || TYPE_META.note;
                        const Icon = meta.icon;
                        const isStarred = starredIds.some(x => x.id === item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenMaterial(item)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #EDF2F7',
                              borderRadius: 16,
                              padding: '1.2rem',
                              cursor: 'pointer',
                              boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '0.85rem',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                                <div style={{
                                  width: 40, height: 40, borderRadius: 10,
                                  background: meta.bg, border: `1px solid ${meta.border}`,
                                  color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <Icon size={19} />
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => toggleStarItem(e, item)}
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: isStarred ? '#F59E0B' : '#CBD5E1', padding: 4,
                                  }}
                                  title={isStarred ? 'Remove from Starred' : 'Add to Starred'}
                                >
                                  <Star size={16} fill={isStarred ? '#F59E0B' : 'none'} />
                                </button>
                              </div>

                              <span style={{
                                display: 'inline-block',
                                fontSize: '0.68rem', fontWeight: 700,
                                color: meta.color, background: meta.bg,
                                padding: '0.15rem 0.5rem', borderRadius: 6,
                                marginBottom: '0.35rem',
                              }}>
                                {meta.label}
                              </span>

                              <h4 style={{
                                fontSize: '0.94rem', fontWeight: 700, color: '#0F172A',
                                margin: 0, lineHeight: 1.4, wordBreak: 'break-word',
                              }}>
                                {item.title}
                              </h4>
                            </div>

                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              paddingTop: '0.65rem', borderTop: '1px solid #F1F5F9',
                              fontSize: '0.78rem', fontWeight: 600, color: meta.color,
                            }}>
                              <span>{meta.actionLabel}</span>
                              <ExternalLink size={13} />
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

      {/* ── VIEWER 2: Worksheet Image Modal ── */}
      {activeWorksheet && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 960,
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{
              padding: '0.85rem 1.25rem', borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                {activeWorksheet.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveWorksheet(null)}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: '1px solid #E2E8F0',
                  background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', textAlign: 'center', background: '#F8FAFC' }}>
              <img
                src={activeWorksheet.url}
                alt={activeWorksheet.title}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #E2E8F0' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── VIEWER 3: Video Modal ── */}
      {activeVideo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 900,
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{
              padding: '0.85rem 1.25rem', borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                {activeVideo.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: '1px solid #E2E8F0',
                  background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* ── VIEWER 4: Interactive Simulation Modal ── */}
      {activeSimulation && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.25rem',
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 1180,
            height: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{
              padding: '0.75rem 1.25rem', borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                {activeSimulation.title}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  style={{
                    padding: '0.35rem 0.65rem', borderRadius: 7,
                    border: '1px solid #CBD5E1', background: '#FFFFFF',
                    fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer',
                  }}
                >
                  Open in New Tab
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSimulation(null)}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid #E2E8F0',
                    background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
