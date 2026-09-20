import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, FileText, Plus, Trash2, Copy, Check, Share2, 
  AlertTriangle, ShieldCheck, Sparkles, Send, Calendar, Clock, Archive, ExternalLink
} from 'lucide-react';
import { PageWrapper, Button, EmptyState } from '@/components/ui';
import { classroomApi, adminApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function ClassroomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'exams', 'materials', 'assignments', 'announcements', 'settings'
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const [showExamModal, setShowExamModal] = useState(false);
  const [availableExams, setAvailableExams] = useState([]);
  const [selectedExamIds, setSelectedExamIds] = useState([]);
  const [isAssigningExam, setIsAssigningExam] = useState(false);

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
    try {
      const res = await adminApi.getExams();
      setAvailableExams(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load system exam library');
    }
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
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.5)' }}>
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
        
        {/* ── HEADER BANNER ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.12) 50%, rgba(14, 20, 36, 0.9) 100%)',
          border: isOverLimit ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24,
          padding: '2rem',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{
                background: 'rgba(139, 92, 246, 0.18)', border: '1px solid rgba(139, 92, 246, 0.35)',
                padding: '0.25rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 800,
                color: '#A78BFA', fontFamily: 'monospace'
              }}>
                CODE: {classroom.invite_code}
              </span>
              {isOverLimit ? (
                <span style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#EF4444', padding: '0.2rem 0.7rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800 }}>
                  ⚠️ Over Limit ({activeCount}/{limit} Seats)
                </span>
              ) : isFull ? (
                <span style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', color: '#F59E0B', padding: '0.2rem 0.7rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800 }}>
                  Full ({usedSeats}/{limit} Seats Used)
                </span>
              ) : (
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981', padding: '0.2rem 0.7rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800 }}>
                  Active ({activeCount}/{limit} Students)
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.4rem 0' }}>
              {classroom.name}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              {classroom.description || 'No description provided.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={copyJoinLink}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.75rem 1.25rem', borderRadius: 14, color: '#fff', fontWeight: 700,
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}
            >
              {copiedLink ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
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
                background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)', border: 'none',
                padding: '0.75rem 1.25rem', borderRadius: 14, color: '#fff', fontWeight: 800,
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Plus size={16} /> Add / Invite Student
            </button>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(15, 22, 41, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16, padding: '0.35rem', overflowX: 'auto'
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
                padding: '0.65rem 1.1rem', borderRadius: 12, border: 'none', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s', whitespace: 'nowrap',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.6)'
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
              <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>ACTIVE STUDENTS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{activeCount}</div>
                <div style={{ fontSize: '0.75rem', color: isOverLimit ? '#EF4444' : 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Quota: {limit} Seats</div>
              </div>

              <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>PENDING INVITES</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>{pendingCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Reserves seat quota</div>
              </div>

              <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>ASSIGNED EXAMS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06B6D4' }}>{(classroom.assigned_exams || []).length}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Targeted assessments</div>
              </div>

              <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>STUDY MATERIALS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>{(classroom.assigned_materials || []).length}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Isolated notes & labs</div>
              </div>
            </div>

            {/* Recent Announcements Overview */}
            <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>📢 Recent Announcements</h3>
              {(classroom.announcements || []).length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>No announcements posted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {(classroom.announcements || []).slice(0, 3).map(a => (
                    <div key={a.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem' }}>
                        <span>{a.author_name}</span>
                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '0 0 0.3rem 0' }}>{a.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{a.content}</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Enrolled Students ({activeCount})</h3>
              <button
                onClick={() => setShowInviteModal(true)}
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none', padding: '0.65rem 1.1rem', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                + Invite Student by Email
              </button>
            </div>

            {/* Active Students Table */}
            <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
              {(classroom.students || []).length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                  No active students enrolled in this classroom yet. Click "+ Invite Student by Email" or share the Join Link!
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>Student Name</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Email</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Think Streak</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Joined Date</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(classroom.students || []).map(s => (
                      <tr key={s.membership_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '1rem 1.25rem', color: '#fff', fontWeight: 700 }}>{s.full_name || 'Student'}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.7)' }}>{s.email}</td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: s.current_streak > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: s.current_streak > 0 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: s.current_streak > 0 ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '50px',
                            fontWeight: 800,
                            fontSize: '0.78rem'
                          }}>
                            🔥 {s.current_streak || 0}d Streak
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginLeft: '0.2rem' }}>
                              (Best: {s.longest_streak || 0}d)
                            </span>
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)' }}>{new Date(s.joined_at).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleRemoveStudent(s.student_id, s.full_name)}
                            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '0.35rem 0.75rem', borderRadius: 8, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
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
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F59E0B', marginBottom: '0.85rem' }}>
                  ⏳ Pending Invitations ({(classroom.pending_invitations || []).length})
                </h4>
                <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Invited Email</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Sent Date</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(classroom.pending_invitations || []).map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#fff', fontWeight: 600 }}>{inv.student_email}</td>
                          <td style={{ padding: '0.85rem 1.25rem', color: 'rgba(255,255,255,0.5)' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#F59E0B' }}>{new Date(inv.expires_at).toLocaleDateString()}</td>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Assigned Exams ({(classroom.assigned_exams || []).length})</h3>
              <button
                onClick={openAssignExamsModal}
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none', padding: '0.65rem 1.1rem', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                + Assign Exams from Library
              </button>
            </div>

            {(classroom.assigned_exams || []).length === 0 ? (
              <div style={{ background: 'rgba(15, 22, 41, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                No exams assigned to this classroom yet. Click "+ Assign Exams from Library" to assign Cambridge Primary assessments!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {(classroom.assigned_exams || []).map(e => (
                  <div key={e.id} style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#06B6D4', textTransform: 'uppercase' }}>{e.exam_type || 'Exam'}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0.3rem 0 0.5rem 0' }}>{e.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Duration: {e.duration_minutes || 30} mins</p>
                    </div>
                    <button
                      onClick={() => handleUnassignExam(e.id)}
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '0.45rem', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Assigned Study Materials ({(classroom.assigned_materials || []).length})</h3>
              <button
                onClick={openAssignMaterialsModal}
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none', padding: '0.65rem 1.1rem', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                + Assign Materials from Curriculum
              </button>
            </div>

            {(classroom.assigned_materials || []).length === 0 ? (
              <div style={{ background: 'rgba(15, 22, 41, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                No study materials assigned yet. Click "+ Assign Materials from Curriculum" to share exclusive 3D labs and notes!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {(classroom.assigned_materials || []).map(m => (
                  <div key={m.id} style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>{m.content_type || 'Material'}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0.3rem 0 0.5rem 0' }}>{m.title}</h4>
                    </div>
                    <button
                      onClick={() => handleUnassignMaterial(m.id)}
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '0.45rem', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Classroom Assignments ({(classroom.custom_assignments || []).length})</h3>
              <button
                onClick={() => setShowAssignmentModal(true)}
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none', padding: '0.65rem 1.1rem', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                + Create Assignment
              </button>
            </div>

            {(classroom.custom_assignments || []).length === 0 ? (
              <div style={{ background: 'rgba(15, 22, 41, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                No custom classroom assignments created yet. Click "+ Create Assignment" to post coursework!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(classroom.custom_assignments || []).map(as => (
                  <div key={as.id} style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0 0 0.4rem 0' }}>{as.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{as.description}</p>
                      </div>
                      {as.due_date && (
                        <span style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid #F59E0B', color: '#F59E0B', padding: '0.25rem 0.65rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>
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
            <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>📢 Post Classroom Announcement</h3>
              <form onSubmit={handlePostAnnouncementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  required
                  placeholder="Announcement Title..."
                  value={announcementData.title}
                  onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
                <textarea
                  rows={3}
                  required
                  placeholder="Announcement content for all students in this batch..."
                  value={announcementData.content}
                  onChange={(e) => setAnnouncementData({ ...announcementData, content: e.target.value })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isPostingAnnouncement}
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none', padding: '0.65rem 1.4rem', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: isPostingAnnouncement ? 'wait' : 'pointer' }}
                  >
                    {isPostingAnnouncement ? 'Posting...' : 'Broadcast Announcement'}
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(classroom.announcements || []).map(a => (
                <div key={a.id} style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
                    <span>Author: {a.author_name}</span>
                    <span>{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 0.35rem 0' }}>{a.title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 7: SETTINGS ── */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 650 }}>
            <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>⚙️ Classroom Settings</h3>
              <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', display: 'block' }}>Classroom Name</label>
                  <input
                    type="text"
                    required
                    value={settingsData.name}
                    onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', display: 'block' }}>Description</label>
                  <textarea
                    rows={3}
                    value={settingsData.description}
                    onChange={(e) => setSettingsData({ ...settingsData, description: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={isUpdatingSettings}
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none', padding: '0.65rem 1.4rem', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: isUpdatingSettings ? 'wait' : 'pointer' }}
                  >
                    {isUpdatingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 20, padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#EF4444', margin: '0 0 0.5rem 0' }}>Archive Classroom</h4>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                Archiving will hide this classroom from students and prevent new enrollments while preserving all historical records, exam attempts, and analytics.
              </p>
              <button
                onClick={handleArchiveClassroom}
                style={{ background: '#EF4444', border: 'none', padding: '0.65rem 1.25rem', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Archive Classroom
              </button>
            </div>
          </div>
        )}

        {/* ── MODAL: INVITE STUDENT ── */}
        {showInviteModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#0E1424', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '2rem', maxWidth: 480, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Invite Student by Email</h3>
                <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', display: 'block' }}>Student Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@gmail.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: '0.85rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  🛡️ <strong>Security Notice:</strong> Pending invitations reserve 1 seat quota. Student must log in with this exact email to accept and join.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isInviting} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: '#fff', fontWeight: 800, cursor: isInviting ? 'wait' : 'pointer' }}>
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: ASSIGN EXAMS ── */}
        {showExamModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#0E1424', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '2rem', maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Assign Exams from Library</h3>
                <button onClick={() => setShowExamModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 360, overflowY: 'auto' }}>
                {availableExams.map(ex => {
                  const isChecked = selectedExamIds.includes(ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => {
                        if (isChecked) setSelectedExamIds(selectedExamIds.filter(i => i !== ex.id));
                        else setSelectedExamIds([...selectedExamIds, ex.id]);
                      }}
                      style={{
                        padding: '1rem', borderRadius: 14, cursor: 'pointer',
                        background: isChecked ? 'rgba(139,92,246,0.15)' : 'rgba(0,0,0,0.3)',
                        border: isChecked ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#06B6D4', textTransform: 'uppercase' }}>{ex.exam_type || 'Exam'}</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>{ex.title}</div>
                      </div>
                      <input type="checkbox" checked={isChecked} readOnly style={{ accentColor: '#8B5CF6', width: 18, height: 18 }} />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowExamModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAssignExamsSubmit} disabled={isAssigningExam} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: '#fff', fontWeight: 800, cursor: isAssigningExam ? 'wait' : 'pointer' }}>
                  {isAssigningExam ? 'Assigning...' : `Assign ${selectedExamIds.length} Selected`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: ASSIGN MATERIALS ── */}
        {showMaterialModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#0E1424', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '2rem', maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Assign Materials from Curriculum</h3>
                <button onClick={() => setShowMaterialModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
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
                        background: isChecked ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.3)',
                        border: isChecked ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>{mat.content_type || 'Material'}</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>{mat.title}</div>
                      </div>
                      <input type="checkbox" checked={isChecked} readOnly style={{ accentColor: '#10B981', width: 18, height: 18 }} />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowMaterialModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAssignMaterialsSubmit} disabled={isAssigningMaterial} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: '#fff', fontWeight: 800, cursor: isAssigningMaterial ? 'wait' : 'pointer' }}>
                  {isAssigningMaterial ? 'Assigning...' : `Assign ${selectedMaterialIds.length} Selected`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: CREATE ASSIGNMENT ── */}
        {showAssignmentModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#0E1424', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '2rem', maxWidth: 500, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Create Classroom Assignment</h3>
                <button onClick={() => setShowAssignmentModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', display: 'block' }}>Assignment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java OOP Concepts Assignment 1"
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', display: 'block' }}>Instructions / Details</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed instructions for students..."
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', display: 'block' }}>Due Date (Optional)</label>
                  <input
                    type="date"
                    value={assignmentData.due_date}
                    onChange={(e) => setAssignmentData({ ...assignmentData, due_date: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAssignmentModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isCreatingAssignment} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: '#fff', fontWeight: 800, cursor: isCreatingAssignment ? 'wait' : 'pointer' }}>
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
