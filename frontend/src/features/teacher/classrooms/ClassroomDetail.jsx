import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, FileText, Plus, Trash2, Copy, Check, Share2, 
  AlertTriangle, ShieldCheck, Sparkles, Send, Calendar, Clock, Archive, ExternalLink,
  Search, Filter, Layers, CheckSquare, Square, ChevronDown, ChevronRight, Crown, CheckCircle, Tag
} from 'lucide-react';
import { PageWrapper, Button, EmptyState } from '@/components/ui';
import { classroomApi, adminApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ClassroomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [classroom, setClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'exams', 'materials', 'assignments', 'announcements', 'settings'
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Structured Exam Chooser State
  const [showExamModal, setShowExamModal] = useState(false);
  const [availableExams, setAvailableExams] = useState([]);
  const [selectedExamIds, setSelectedExamIds] = useState([]);
  const [isAssigningExam, setIsAssigningExam] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [examFilterSubject, setExamFilterSubject] = useState('all');
  const [examFilterClass, setExamFilterClass] = useState('all');
  const [examFilterTopic, setExamFilterTopic] = useState('all');
  const [examFilterStatus, setExamFilterStatus] = useState('all');

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);
  const [isAssigningMaterial, setIsAssigningMaterial] = useState(false);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ title: '', description: '', due_date: '' });
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

  const [announcementData, setAnnouncementData] = useState({ title: '', content: '' });
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  // Classroom settings update
  const [settingsData, setSettingsData] = useState({ name: '', description: '' });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  useEffect(() => {
    fetchClassroomDetail();
  }, [id]);

  const fetchClassroomDetail = async () => {
    try {
      setIsLoading(true);
      const res = await classroomApi.getClassroom(id);
      const data = res.data?.data || null;
      setClassroom(data);
      if (data) {
        setSettingsData({ name: data.name || '', description: data.description || '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load classroom details');
      navigate('/classrooms');
    } finally {
      setIsLoading(false);
    }
  };

  const copyJoinLink = () => {
    if (!classroom) return;
    const link = `${window.location.origin}/classroom/join/${classroom.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Join Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // ── INVITATIONS ──
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return toast.error('Email is required');

    if (user && user.role !== 'teacher' && user.role !== 'admin') {
      return toast.error(
        `Session conflict: Active browser account is "${user.email}" (${user.role}). Please log out and sign in with your Teacher account.`,
        { duration: 6000 }
      );
    }

    try {
      setIsInviting(true);
      const res = await classroomApi.sendInvitation(id, inviteEmail.trim());
      toast.success(res.data?.message || 'Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      fetchClassroomDetail();
    } catch (err) {
      if (err.response?.data?.code === 'LIMIT_REACHED') {
        toast.error(err.response.data.message, { duration: 5000 });
      } else if (err.response?.status === 403) {
        toast.error(
          err.response?.data?.message?.includes('permissions')
            ? 'Permission denied: Your current browser session is logged in as a student. Please log out and sign in with your Teacher account.'
            : (err.response?.data?.message || 'Forbidden: You do not have permission for this classroom'),
          { duration: 6000 }
        );
      } else {
        toast.error(err.response?.data?.message || 'Failed to send invitation');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName || 'this student'} from the classroom?`)) return;
    try {
      await classroomApi.removeStudent(id, studentId);
      toast.success('Student removed from classroom');
      fetchClassroomDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove student');
    }
  };

  // ── EXAMS ASSIGNMENT ──
  const openAssignExamsModal = async () => {
    setShowExamModal(true);
    setIsLoadingExams(true);
    try {
      const res = await adminApi.getExams();
      setAvailableExams(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load system exam library');
    } finally {
      setIsLoadingExams(false);
    }
  };

  const allExamSubjects = Array.from(new Set(availableExams.map(e => e.subject_name).filter(Boolean))).sort();
  const allExamClasses = Array.from(new Set(availableExams.map(e => e.class_name).filter(Boolean))).sort();
  const allExamTopics = Array.from(new Set(
    availableExams
      .filter(e => examFilterSubject === 'all' || e.subject_name === examFilterSubject)
      .map(e => e.topic_name)
      .filter(Boolean)
  )).sort();

  const assignedExamIdSet = new Set((classroom?.assigned_exams || []).map(e => e.id || e.exam_id));

  const filteredAvailableExams = availableExams.filter(ex => {
    if (examFilterSubject !== 'all' && ex.subject_name !== examFilterSubject) return false;
    if (examFilterClass !== 'all' && ex.class_name !== examFilterClass) return false;
    if (examFilterTopic !== 'all' && ex.topic_name !== examFilterTopic) return false;
    if (examFilterStatus !== 'all' && ex.status !== examFilterStatus) return false;
    if (examSearchQuery.trim()) {
      const q = examSearchQuery.toLowerCase().trim();
      const matchTitle = (ex.title || '').toLowerCase().includes(q);
      const matchSub = (ex.subject_name || '').toLowerCase().includes(q);
      const matchTop = (ex.topic_name || '').toLowerCase().includes(q);
      const matchCls = (ex.class_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchTop && !matchCls) return false;
    }
    return true;
  });

  const handleSelectAllFiltered = () => {
    const unassignedFilteredIds = filteredAvailableExams
      .filter(e => !assignedExamIdSet.has(e.id))
      .map(e => e.id);
    const newSet = new Set([...selectedExamIds, ...unassignedFilteredIds]);
    setSelectedExamIds(Array.from(newSet));
  };

  const handleDeselectAllFiltered = () => {
    const filteredIdSet = new Set(filteredAvailableExams.map(e => e.id));
    setSelectedExamIds(selectedExamIds.filter(id => !filteredIdSet.has(id)));
  };

  const handleAssignExamsSubmit = async () => {
    if (!selectedExamIds.length) return toast.error('Select at least one exam to assign');
    try {
      setIsAssigningExam(true);
      await classroomApi.assignExams(id, { exam_ids: selectedExamIds });
      toast.success('Exam(s) assigned to classroom successfully!');
      setShowExamModal(false);
      setSelectedExamIds([]);
      fetchClassroomDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign exams');
    } finally {
      setIsAssigningExam(false);
    }
  };

  const handleUnassignExam = async (examId) => {
    try {
      await classroomApi.unassignExam(id, examId);
      toast.success('Exam unassigned');
      fetchClassroomDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unassign exam');
    }
  };

  // ── MATERIALS ASSIGNMENT ──
  const openAssignMaterialsModal = async () => {
    setShowMaterialModal(true);
    try {
      const res = await adminApi.getHierarchy();
      // Flatten content items
      const contentList = [];
      const traverse = (node) => {
        if (node.content && Array.isArray(node.content)) {
          contentList.push(...node.content);
        }
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(traverse);
        }
      };
      traverse(res.data?.data || {});
      setAvailableMaterials(contentList);
    } catch (err) {
      toast.error('Failed to load study materials library');
    }
  };

  const handleAssignMaterialsSubmit = async () => {
    if (!selectedMaterialIds.length) return toast.error('Select at least one material to assign');
    try {
      setIsAssigningMaterial(true);
      await classroomApi.assignMaterials(id, { material_ids: selectedMaterialIds });
      toast.success('Material(s) assigned to classroom successfully!');
      setShowMaterialModal(false);
      setSelectedMaterialIds([]);
      fetchClassroomDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign materials');
    } finally {
      setIsAssigningMaterial(false);
    }
  };

  const handleUnassignMaterial = async (materialId) => {
    try {
      await classroomApi.unassignMaterial(id, materialId);
      toast.success('Material unassigned');
      fetchClassroomDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unassign material');
    }
  };

  // ── CUSTOM ASSIGNMENTS ──
  const handleCreateAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentData.title.trim()) return toast.error('Title is required');
    try {
      setIsCreatingAssignment(true);
      await classroomApi.createAssignment(id, assignmentData);
      toast.success('Assignment posted successfully!');
      setShowAssignmentModal(false);
      setAssignmentData({ title: '', description: '', due_date: '' });
      fetchClassroomDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  // ── ANNOUNCEMENTS ──
  const handlePostAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!announcementData.title.trim() || !announcementData.content.trim()) {
      return toast.error('Title and content are required');
    }
    try {
      setIsPostingAnnouncement(true);
      await classroomApi.createAnnouncement(id, announcementData);
      toast.success('Announcement broadcasted!');
      setAnnouncementData({ title: '', content: '' });
      fetchClassroomDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  // ── SETTINGS UPDATE & ARCHIVE ──
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingSettings(true);
      await classroomApi.updateClassroom(id, settingsData);
      toast.success('Classroom settings updated');
      fetchClassroomDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleArchiveClassroom = async () => {
    if (!window.confirm('Are you sure you want to archive this classroom? Students will no longer be able to access it.')) return;
    try {
      await classroomApi.archiveClassroom(id);
      toast.success('Classroom archived');
      navigate('/classrooms');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive classroom');
    }
  };

  if (isLoading || !classroom) {
    return (
      <PageWrapper title="Classroom Detail">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B', fontWeight: 600 }}>
          Loading Classroom Details...
        </div>
      </PageWrapper>
    );
  }

  const activeCount = classroom.active_count || 0;
  const pendingCount = classroom.pending_count || 0;
  const usedSeats = classroom.used_seats || 0;
  const limit = classroom.effective_seat_limit || 10;
  const isOverLimit = classroom.is_over_limit || activeCount > limit;
  const isFull = usedSeats >= limit;

  return (
    <PageWrapper title={classroom.name}>
      <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
        
        {/* Session Conflict Alert Banner */}
        {user && user.role !== 'teacher' && user.role !== 'admin' && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 16,
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            color: '#991B1B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#DC2626" />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                <strong>Session Mismatch:</strong> You are currently signed in as <strong>{user.email}</strong> ({user.role}). Classroom management requires your Teacher account.
              </span>
            </div>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                navigate('/login');
              }}
              style={{
                background: '#DC2626',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                padding: '0.45rem 0.9rem',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Sign Out & Re-login
            </button>
          </div>
        )}

        {/* ── HEADER BANNER (Light Theme) ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(125deg, #FFFFFF 0%, #F5F7FF 45%, #EEF2FF 78%, #FDF4FF 100%)',
          border: isOverLimit ? '1.5px solid #EF4444' : '1px solid #E0E7FF',
          borderRadius: 24,
          padding: '2rem',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{
                background: '#EEF2FF', border: '1px solid #C7D2FE',
                padding: '0.25rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 800,
                color: '#4F46E5', fontFamily: 'monospace'
              }}>
                CODE: {classroom.invite_code}
              </span>
              {isOverLimit ? (
                <span style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.22rem 0.75rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800 }}>
                  ⚠️ Over Limit ({activeCount}/{limit} Seats)
                </span>
              ) : isFull ? (
                <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', padding: '0.22rem 0.75rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800 }}>
                  Full ({usedSeats}/{limit} Seats Used)
                </span>
              ) : (
                <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '0.22rem 0.75rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800 }}>
                  Active ({activeCount}/{limit} Students)
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
              {classroom.name}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, fontWeight: 500 }}>
              {classroom.description || 'No description provided.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={copyJoinLink}
              style={{
                background: '#FFFFFF', border: '1px solid #CBD5E1',
                padding: '0.75rem 1.25rem', borderRadius: 14, color: '#1E293B', fontWeight: 700,
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
              }}
            >
              {copiedLink ? <Check size={16} color="#059669" /> : <Copy size={16} color="#4F46E5" />}
              {copiedLink ? 'Copied!' : 'Share Join Link'}
            </button>
            <button
              onClick={() => {
                if (isOverLimit || isFull) {
                  toast.error(`Classroom is ${isOverLimit ? 'over limit' : 'full'}. Cannot invite more students until capacity is upgraded.`);
                }
                setShowInviteModal(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)', border: 'none',
                padding: '0.75rem 1.3rem', borderRadius: 14, color: '#fff', fontWeight: 800,
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 6px 18px rgba(99, 102, 241, 0.28)'
              }}
            >
              <Plus size={16} /> Add / Invite Student
            </button>
          </div>
        </div>

        {/* ── TAB NAVIGATION (Light Theme) ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 16, padding: '0.4rem', overflowX: 'auto',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'students', label: `Students (${activeCount})` },
            { id: 'exams', label: `Exams (${(classroom.assigned_exams || []).length})` },
            { id: 'materials', label: `Materials (${(classroom.assigned_materials || []).length})` },
            { id: 'assignments', label: `Assignments (${(classroom.custom_assignments || []).length})` },
            { id: 'announcements', label: `Announcements (${(classroom.announcements || []).length})` },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.62rem 1.15rem', borderRadius: 12, border: 'none', fontSize: '0.84rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(99, 102, 241, 0.22)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '1.35rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>ACTIVE STUDENTS</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A' }}>{activeCount}</div>
                <div style={{ fontSize: '0.78rem', color: isOverLimit ? '#DC2626' : '#64748B', marginTop: '0.2rem', fontWeight: 600 }}>Quota: {limit} Seats</div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '1.35rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>PENDING INVITES</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#D97706' }}>{pendingCount}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem', fontWeight: 600 }}>Reserves seat quota</div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '1.35rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>ASSIGNED EXAMS</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0284C7' }}>{(classroom.assigned_exams || []).length}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem', fontWeight: 600 }}>Targeted assessments</div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '1.35rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>STUDY MATERIALS</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#059669' }}>{(classroom.assigned_materials || []).length}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem', fontWeight: 600 }}>Isolated notes & labs</div>
              </div>
            </div>

            {/* Recent Announcements Overview */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 22, padding: '1.5rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', marginTop: 0 }}>📢 Recent Announcements</h3>
              {(classroom.announcements || []).length === 0 ? (
                <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, fontWeight: 500 }}>No announcements posted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {(classroom.announcements || []).slice(0, 3).map(a => (
                    <div key={a.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748B', fontWeight: 600, marginBottom: '0.3rem' }}>
                        <span>{a.author_name}</span>
                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.3rem 0' }}>{a.title}</h4>
                      <p style={{ fontSize: '0.86rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: STUDENTS ── */}
        {activeTab === 'students' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Enrolled Students ({activeCount})</h3>
              <button
                onClick={() => setShowInviteModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', border: 'none',
                  padding: '0.68rem 1.2rem', borderRadius: 12, color: '#fff', fontWeight: 700,
                  fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.22)'
                }}
              >
                + Invite Student by Email
              </button>
            </div>

            {/* Active Students Table */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
              {(classroom.students || []).length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', fontSize: '0.88rem', fontWeight: 500 }}>
                  No active students enrolled in this classroom yet. Click &ldquo;+ Invite Student by Email&rdquo; or share the Join Link!
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>Student Name</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Email</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Think Streak</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Joined Date</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(classroom.students || []).map(s => (
                      <tr key={s.membership_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '1rem 1.25rem', color: '#0F172A', fontWeight: 700 }}>{s.full_name || 'Student'}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 500 }}>{s.email}</td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: s.current_streak > 0 ? '#FFFBEB' : '#F8FAFC',
                            border: s.current_streak > 0 ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                            color: s.current_streak > 0 ? '#D97706' : '#64748B',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '50px',
                            fontWeight: 800,
                            fontSize: '0.78rem'
                          }}>
                            🔥 {s.current_streak || 0}d Streak
                            <span style={{ fontSize: '0.7rem', color: '#64748B', marginLeft: '0.2rem' }}>
                              (Best: {s.longest_streak || 0}d)
                            </span>
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontWeight: 500 }}>{new Date(s.joined_at).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleRemoveStudent(s.student_id, s.full_name)}
                            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.38rem 0.8rem', borderRadius: 8, fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pending Invitations Section */}
            {(classroom.pending_invitations || []).length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#D97706', marginBottom: '0.85rem' }}>
                  ⏳ Pending Invitations ({(classroom.pending_invitations || []).length})
                </h4>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Invited Email</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Sent Date</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(classroom.pending_invitations || []).map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#0F172A', fontWeight: 700 }}>{inv.student_email}</td>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#64748B', fontWeight: 500 }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#D97706', fontWeight: 700 }}>{new Date(inv.expires_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: EXAMS ── */}
        {activeTab === 'exams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Assigned Exams ({(classroom.assigned_exams || []).length})</h3>
              <button
                onClick={openAssignExamsModal}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', border: 'none',
                  padding: '0.68rem 1.2rem', borderRadius: 12, color: '#fff', fontWeight: 700,
                  fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.22)'
                }}
              >
                + Assign Exams from Library
              </button>
            </div>

            {(classroom.assigned_exams || []).length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '1.5px dashed #CBD5E1', borderRadius: 20, padding: '3rem', textAlign: 'center', color: '#64748B', fontWeight: 500 }}>
                No exams assigned to this classroom yet. Click &ldquo;+ Assign Exams from Library&rdquo; to assign Cambridge Primary assessments!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {(classroom.assigned_exams || []).map(e => (
                  <div key={e.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', background: '#E0F2FE', border: '1px solid #BAE6FD', padding: '0.18rem 0.55rem', borderRadius: 6 }}>
                          {e.subject_name || e.exam_type || 'Exam'}
                        </span>
                        {e.class_name && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '0.18rem 0.55rem', borderRadius: 6 }}>
                            {e.class_name}
                          </span>
                        )}
                        {e.topic_name && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.18rem 0.55rem', borderRadius: 6 }}>
                            {e.topic_name}
                          </span>
                        )}
                        {e.is_premium && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.18rem 0.45rem', borderRadius: 6 }}>
                            VIP
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0.35rem 0 0.5rem 0' }}>{e.title}</h4>
                      <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, flexWrap: 'wrap' }}>
                        <span>⏱️ {e.duration_minutes || 30} mins</span>
                        {e.question_count > 0 && <span>📝 {e.question_count} Questions</span>}
                        {e.total_marks > 0 && <span>🎯 {e.total_marks} Marks</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnassignExam(e.id)}
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Unassign Exam
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: MATERIALS ── */}
        {activeTab === 'materials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Assigned Study Materials ({(classroom.assigned_materials || []).length})</h3>
              <button
                onClick={openAssignMaterialsModal}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', border: 'none',
                  padding: '0.68rem 1.2rem', borderRadius: 12, color: '#fff', fontWeight: 700,
                  fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.22)'
                }}
              >
                + Assign Materials from Curriculum
              </button>
            </div>

            {(classroom.assigned_materials || []).length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '1.5px dashed #CBD5E1', borderRadius: 20, padding: '3rem', textAlign: 'center', color: '#64748B', fontWeight: 500 }}>
                No study materials assigned yet. Click &ldquo;+ Assign Materials from Curriculum&rdquo; to share exclusive 3D labs and notes!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {(classroom.assigned_materials || []).map(m => (
                  <div key={m.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.18rem 0.55rem', borderRadius: 6 }}>{m.content_type || 'Material'}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0.45rem 0 0.5rem 0' }}>{m.title}</h4>
                    </div>
                    <button
                      onClick={() => handleUnassignMaterial(m.id)}
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Unassign Material
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: ASSIGNMENTS ── */}
        {activeTab === 'assignments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Classroom Assignments ({(classroom.custom_assignments || []).length})</h3>
              <button
                onClick={() => setShowAssignmentModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', border: 'none',
                  padding: '0.68rem 1.2rem', borderRadius: 12, color: '#fff', fontWeight: 700,
                  fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.22)'
                }}
              >
                + Create Assignment
              </button>
            </div>

            {(classroom.custom_assignments || []).length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '1.5px dashed #CBD5E1', borderRadius: 20, padding: '3rem', textAlign: 'center', color: '#64748B', fontWeight: 500 }}>
                No custom classroom assignments created yet. Click &ldquo;+ Create Assignment&rdquo; to post coursework!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(classroom.custom_assignments || []).map(as => (
                  <div key={as.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: '1.25rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem 0' }}>{as.title}</h4>
                        <p style={{ fontSize: '0.86rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>{as.description}</p>
                      </div>
                      {as.due_date && (
                        <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', padding: '0.28rem 0.7rem', borderRadius: 8, fontSize: '0.76rem', fontWeight: 800, flexShrink: 0 }}>
                          Due: {new Date(as.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: ANNOUNCEMENTS ── */}
        {activeTab === 'announcements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '1.5rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', marginTop: 0 }}>📢 Post Classroom Announcement</h3>
              <form onSubmit={handlePostAnnouncementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  required
                  placeholder="Announcement Title..."
                  value={announcementData.title}
                  onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none' }}
                />
                <textarea
                  rows={3}
                  required
                  placeholder="Announcement content for all students in this batch..."
                  value={announcementData.content}
                  onChange={(e) => setAnnouncementData({ ...announcementData, content: e.target.value })}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isPostingAnnouncement}
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', border: 'none',
                      padding: '0.68rem 1.4rem', borderRadius: 12, color: '#fff', fontWeight: 800,
                      fontSize: '0.85rem', cursor: isPostingAnnouncement ? 'wait' : 'pointer',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.22)'
                    }}
                  >
                    {isPostingAnnouncement ? 'Posting...' : 'Broadcast Announcement'}
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(classroom.announcements || []).map(a => (
                <div key={a.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: '1.25rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748B', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <span>Author: {a.author_name}</span>
                    <span>{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem 0' }}>{a.title}</h4>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 7: SETTINGS ── */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 650 }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '1.5rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem', marginTop: 0 }}>⚙️ Classroom Settings</h3>
              <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'block' }}>Classroom Name</label>
                  <input
                    type="text"
                    required
                    value={settingsData.name}
                    onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'block' }}>Description</label>
                  <textarea
                    rows={3}
                    value={settingsData.description}
                    onChange={(e) => setSettingsData({ ...settingsData, description: e.target.value })}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={isUpdatingSettings}
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', border: 'none',
                      padding: '0.68rem 1.4rem', borderRadius: 12, color: '#fff', fontWeight: 800,
                      fontSize: '0.85rem', cursor: isUpdatingSettings ? 'wait' : 'pointer',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.22)'
                    }}
                  >
                    {isUpdatingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 20, padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#DC2626', margin: '0 0 0.5rem 0' }}>Archive Classroom</h4>
              <p style={{ fontSize: '0.84rem', color: '#7F1D1D', margin: '0 0 1rem 0', lineHeight: 1.5, fontWeight: 500 }}>
                Archiving will hide this classroom from students and prevent new enrollments while preserving all historical records, exam attempts, and analytics.
              </p>
              <button
                onClick={handleArchiveClassroom}
                style={{ background: '#DC2626', border: 'none', padding: '0.68rem 1.25rem', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Archive Classroom
              </button>
            </div>
          </div>
        )}

        {/* ── MODAL: INVITE STUDENT (Light Theme) ── */}
        {showInviteModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '2rem', maxWidth: 480, width: '100%', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Invite Student by Email</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  style={{
                    background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10,
                    width: 32, height: 32, color: '#475569', fontSize: '0.95rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'block' }}>Student Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@gmail.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none' }}
                  />
                </div>

                <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#4C1D95', lineHeight: 1.5, fontWeight: 500 }}>
                  🛡️ <strong>Security Notice:</strong> Pending invitations reserve 1 seat quota. Student must log in with this exact email to accept and join.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isInviting} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', color: '#fff', fontWeight: 800, cursor: isInviting ? 'wait' : 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)' }}>
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: ASSIGN EXAMS (STRUCTURED CHOOSER - Light Theme) ── */}
        {showExamModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.48)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              maxWidth: 920,
              width: '100%',
              height: '90vh',
              maxHeight: 820,
              boxShadow: '0 25px 70px rgba(15, 23, 42, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              
              {/* Modal Header */}
              <div style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid #E2E8F0',
                background: 'linear-gradient(125deg, #FFFFFF 0%, #F5F7FF 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Assign Assessments to Classroom
                    </h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', background: '#E0F2FE', border: '1px solid #BAE6FD', padding: '0.18rem 0.65rem', borderRadius: 50 }}>
                      {availableExams.length} Total in Library
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
                    Filter by Subject, Stage, and Topic to easily assign structured Cambridge Primary assessments.
                  </p>
                </div>
                <button
                  onClick={() => setShowExamModal(false)}
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div style={{
                padding: '1rem 1.75rem',
                borderBottom: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Search input */}
                  <div style={{ position: 'relative', flex: '1 1 240px' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                    <input
                      type="text"
                      placeholder="Search by exam title, subject, topic..."
                      value={examSearchQuery}
                      onChange={(e) => setExamSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: 12,
                        padding: '0.6rem 1rem 0.6rem 2.2rem',
                        color: '#0F172A',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Subject Filter */}
                  <select
                    value={examFilterSubject}
                    onChange={(e) => {
                      setExamFilterSubject(e.target.value);
                      setExamFilterTopic('all');
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: 12,
                      padding: '0.6rem 0.85rem',
                      color: '#0F172A',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">📚 All Subjects</option>
                    {allExamSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>

                  {/* Stage / Class Filter */}
                  <select
                    value={examFilterClass}
                    onChange={(e) => setExamFilterClass(e.target.value)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: 12,
                      padding: '0.6rem 0.85rem',
                      color: '#0F172A',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">🎓 All Stages</option>
                    {allExamClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>

                  {/* Topic Filter */}
                  <select
                    value={examFilterTopic}
                    onChange={(e) => setExamFilterTopic(e.target.value)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: 12,
                      padding: '0.6rem 0.85rem',
                      color: '#0F172A',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer',
                      maxWidth: 180
                    }}
                  >
                    <option value="all">🔖 All Topics</option>
                    {allExamTopics.map(top => (
                      <option key={top} value={top}>{top}</option>
                    ))}
                  </select>
                </div>

                {/* Selection Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <span>Showing <strong style={{ color: '#0F172A' }}>{filteredAvailableExams.length}</strong> matching exams</span>
                    {(examFilterSubject !== 'all' || examFilterClass !== 'all' || examFilterTopic !== 'all' || examSearchQuery) && (
                      <button
                        onClick={() => {
                          setExamFilterSubject('all');
                          setExamFilterClass('all');
                          setExamFilterTopic('all');
                          setExamSearchQuery('');
                        }}
                        style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        Reset filters
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Select All Matching
                    </button>
                    {selectedExamIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeselectAllFiltered}
                        style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Clear Filtered
                      </button>
                    )}
                    <span style={{ fontWeight: 800, color: selectedExamIds.length > 0 ? '#059669' : '#64748B', background: '#FFFFFF', padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      {selectedExamIds.length} Selected
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Exams Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#F8FAFC' }}>
                {isLoadingExams ? (
                  <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B', fontWeight: 600 }}>
                    <Sparkles size={28} color="#4F46E5" style={{ animation: 'spin 2s linear infinite', marginBottom: '0.75rem' }} />
                    <div>Loading system exam library...</div>
                  </div>
                ) : filteredAvailableExams.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#FFFFFF', borderRadius: 18, border: '1.5px dashed #CBD5E1', color: '#64748B' }}>
                    <FileText size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                    <h4 style={{ color: '#0F172A', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>No Assessments Match Criteria</h4>
                    <p style={{ fontSize: '0.84rem', margin: 0 }}>Try clearing search keywords or selecting a different subject/stage filter.</p>
                  </div>
                ) : (
                  /* ── FLAT ASSESSMENT CARD GRID VIEW ── */
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem' }}>
                    {filteredAvailableExams.map(ex => {
                      const isAssigned = assignedExamIdSet.has(ex.id);
                      const isChecked = selectedExamIds.includes(ex.id);

                      return (
                        <div
                          key={ex.id}
                          onClick={() => {
                            if (isAssigned) return;
                            if (isChecked) setSelectedExamIds(selectedExamIds.filter(i => i !== ex.id));
                            else setSelectedExamIds([...selectedExamIds, ex.id]);
                          }}
                          style={{
                            padding: '1.1rem',
                            borderRadius: 16,
                            cursor: isAssigned ? 'default' : 'pointer',
                            background: isAssigned 
                              ? '#F1F5F9' 
                              : isChecked 
                                ? '#EEF2FF' 
                                : '#FFFFFF',
                            border: isAssigned
                              ? '1px solid #E2E8F0'
                              : isChecked
                                ? '1.5px solid #6366F1'
                                : '1px solid #E2E8F0',
                            opacity: isAssigned ? 0.65 : 1,
                            boxShadow: isChecked ? '0 6px 16px rgba(99, 102, 241, 0.14)' : '0 2px 8px rgba(15, 23, 42, 0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.85rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.4rem' }}>
                              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', background: '#E0F2FE', border: '1px solid #BAE6FD', padding: '0.15rem 0.5rem', borderRadius: 6 }}>
                                  {ex.subject_name || ex.exam_type || 'Exam'}
                                </span>
                                {ex.class_name && (
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '0.15rem 0.5rem', borderRadius: 6 }}>
                                    {ex.class_name}
                                  </span>
                                )}
                              </div>
                              {isAssigned ? (
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.15rem 0.5rem', borderRadius: 50 }}>
                                  ✓ Assigned
                                </span>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  style={{ accentColor: '#4F46E5', width: 18, height: 18, cursor: 'pointer' }}
                                />
                              )}
                            </div>

                            <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0 0.45rem 0', lineHeight: 1.35 }}>
                              {ex.title}
                            </h5>

                            {ex.topic_name && (
                              <div style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 600, marginBottom: '0.4rem' }}>
                                🔖 {ex.topic_name}
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: '#64748B', fontWeight: 600, flexWrap: 'wrap' }}>
                              <span>⏱️ {ex.duration_minutes || 30} mins</span>
                              {ex.question_count > 0 && <span>📝 {ex.question_count} Questions</span>}
                              {ex.total_marks > 0 && <span>🎯 {ex.total_marks} Marks</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sticky Modal Footer Bar */}
              <div style={{
                padding: '1.15rem 1.75rem',
                borderTop: '1px solid #E2E8F0',
                background: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
                  Selected: <strong style={{ color: selectedExamIds.length > 0 ? '#059669' : '#0F172A' }}>{selectedExamIds.length} assessment(s)</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowExamModal(false)}
                    style={{ padding: '0.72rem 1.25rem', borderRadius: 12, border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignExamsSubmit}
                    disabled={isAssigningExam || selectedExamIds.length === 0}
                    style={{
                      padding: '0.72rem 1.5rem',
                      borderRadius: 12,
                      border: 'none',
                      background: selectedExamIds.length === 0 ? '#E2E8F0' : 'linear-gradient(135deg, #6366F1, #0EA5E9)',
                      color: selectedExamIds.length === 0 ? '#94A3B8' : '#fff',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: (isAssigningExam || selectedExamIds.length === 0) ? 'not-allowed' : 'pointer',
                      boxShadow: selectedExamIds.length > 0 ? '0 6px 20px rgba(99, 102, 241, 0.28)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isAssigningExam ? 'Assigning...' : `Assign ${selectedExamIds.length} Assessment(s)`}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── MODAL: ASSIGN MATERIALS (Light Theme) ── */}
        {showMaterialModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '2rem', maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Assign Materials from Curriculum</h3>
                <button
                  onClick={() => setShowMaterialModal(false)}
                  style={{
                    background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10,
                    width: 32, height: 32, color: '#475569', fontSize: '0.95rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 360, overflowY: 'auto' }}>
                {availableMaterials.map(mat => {
                  const isChecked = selectedMaterialIds.includes(mat.id);
                  return (
                    <div
                      key={mat.id}
                      onClick={() => {
                        if (isChecked) setSelectedMaterialIds(selectedMaterialIds.filter(i => i !== mat.id));
                        else setSelectedMaterialIds([...selectedMaterialIds, mat.id]);
                      }}
                      style={{
                        padding: '1rem', borderRadius: 14, cursor: 'pointer',
                        background: isChecked ? '#ECFDF5' : '#F8FAFC',
                        border: isChecked ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>{mat.content_type || 'Material'}</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>{mat.title}</div>
                      </div>
                      <input type="checkbox" checked={isChecked} readOnly style={{ accentColor: '#059669', width: 18, height: 18 }} />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowMaterialModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAssignMaterialsSubmit} disabled={isAssigningMaterial} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', color: '#fff', fontWeight: 800, cursor: isAssigningMaterial ? 'wait' : 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)' }}>
                  {isAssigningMaterial ? 'Assigning...' : `Assign ${selectedMaterialIds.length} Selected`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: CREATE ASSIGNMENT (Light Theme) ── */}
        {showAssignmentModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '2rem', maxWidth: 500, width: '100%', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Create Classroom Assignment</h3>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  style={{
                    background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10,
                    width: 32, height: 32, color: '#475569', fontSize: '0.95rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'block' }}>Assignment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fractions & Decimals Worksheet 1"
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'block' }}>Instructions / Details</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed instructions for students..."
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'block' }}>Due Date (Optional)</label>
                  <input
                    type="date"
                    value={assignmentData.due_date}
                    onChange={(e) => setAssignmentData({ ...assignmentData, due_date: e.target.value })}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAssignmentModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isCreatingAssignment} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', color: '#fff', fontWeight: 800, cursor: isCreatingAssignment ? 'wait' : 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)' }}>
                    {isCreatingAssignment ? 'Posting...' : 'Create Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
