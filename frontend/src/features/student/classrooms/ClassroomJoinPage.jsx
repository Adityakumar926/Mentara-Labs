import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, ArrowRight, BookOpen, FileText, CheckCircle2, AlertCircle, 
  Award, Clock, Calendar, Sparkles, Share2, Copy, Check 
} from 'lucide-react';
import { classroomApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ClassroomJoinPage() {
  const { inviteCode } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [joinInfo, setJoinInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Email verification state
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    fetchJoinInfo();
  }, [inviteCode]);

  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
    }
  }, [user]);

  const fetchJoinInfo = async () => {
    try {
      setIsLoading(true);
      const res = await classroomApi.getJoinInfo(inviteCode);
      setJoinInfo(res.data?.data || null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired classroom join link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Classroom link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleVerifyEmail = async (e) => {
    e?.preventDefault();
    if (!emailInput || !emailInput.trim()) {
      return setVerifyError('Please enter your email address');
    }
    setVerifyError(null);
    setIsVerifying(true);
    try {
      const res = await classroomApi.verifyJoinEmail({
        inviteCode,
        email: emailInput.trim()
      });
      const data = res.data?.data;
      if (data) {
        useAuthStore.getState().setAuthData({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user
        });
        setAccessGranted(true);
        toast.success(res.data?.message || 'Access granted to classroom!');
        if (data.classroom_id) {
          navigate(`/student/classrooms/${data.classroom_id}`);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'This email has not been invited to this classroom yet.';
      setVerifyError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleJoinClick = async () => {
    if (!isAuthenticated) {
      // If not logged in, trigger email verification prompt
      return handleVerifyEmail();
    }

    if (user?.role === 'teacher') {
      return toast.error('You are logged in as a Teacher. Please switch to a student account to enroll.');
    }

    try {
      setIsJoining(true);
      const res = await classroomApi.joinClassroom(inviteCode, token);
      toast.success(res.data?.message || 'Successfully joined classroom! 🎉');
      if (res.data?.data?.classroom_id) {
        navigate(`/student/classrooms/${res.data.data.classroom_id}`);
      }
    } catch (err) {
      if (err.response?.data?.code === 'CLASSROOM_FULL') {
        toast.error('This classroom has reached its maximum seat capacity limit.', { duration: 5000 });
      } else {
        toast.error(err.response?.data?.message || 'Joined classroom view active!');
      }
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', background: '#080C16', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={36} color="#8B5CF6" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
          <div>Loading Classroom Invitation...</div>
        </div>
      </div>
    );
  }

  if (errorMsg || !joinInfo) {
    return (
      <div style={{ height: '100vh', background: '#080C16', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: 'rgba(14,20,36,0.8)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 24, padding: '3rem 2rem', textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <AlertCircle size={28} color="#EF4444" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Invitation Error</h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>{errorMsg || 'Classroom link not found'}</p>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // ── EMAIL VERIFICATION STEP FOR GUESTS / UNVERIFIED USERS ──
  if (!isAuthenticated && !accessGranted) {
    return (
      <div style={{ minHeight: '100vh', background: '#080C16', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 22, 41, 0.95) 0%, rgba(20, 30, 55, 0.9) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 24,
          padding: '2.5rem 2rem',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
              border: '1px solid rgba(139,92,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto'
            }}>
              <BookOpen size={30} color="#8B5CF6" />
            </div>

            <span style={{
              background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)',
              padding: '0.2rem 0.65rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800,
              color: '#A78BFA', fontFamily: 'monospace'
            }}>
              CODE: {joinInfo.invite_code}
            </span>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0.75rem 0 0.4rem 0' }}>
              Join {joinInfo.name}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Teacher: <strong>{joinInfo.teacher_name}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>
                Enter your invited email address:
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="student@example.com"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {verifyError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 12,
                padding: '0.85rem 1rem',
                color: '#F87171',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{verifyError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                border: 'none',
                padding: '0.9rem',
                borderRadius: 12,
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: isVerifying ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                transition: 'opacity 0.2s'
              }}
            >
              {isVerifying ? 'Verifying Invitation...' : 'Verify Email & Join Classroom'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const exams = joinInfo.assigned_exams || [];
  const materials = joinInfo.assigned_materials || [];
  const customAssignments = joinInfo.custom_assignments || [];
  const announcements = joinInfo.announcements || [];

  return (
    <div style={{ minHeight: '100vh', background: '#080C16', color: '#fff', padding: '2rem 1rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── HEADER BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(14, 20, 36, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 24,
          padding: '2.25rem',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{
                background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)',
                padding: '0.25rem 0.75rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 800,
                color: '#A78BFA', fontFamily: 'monospace'
              }}>
                BATCH CODE: {joinInfo.invite_code}
              </span>
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', color: '#10B981', padding: '0.2rem 0.7rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800 }}>
                Open Batch Access ({joinInfo.active_students || 0} Enrolled)
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
              {joinInfo.name}
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 0.4rem 0' }}>
              Teacher: <strong>{joinInfo.teacher_name}</strong> ({joinInfo.teacher_email})
            </p>
            {joinInfo.description && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', margin: 0, fontStyle: 'italic' }}>
                "{joinInfo.description}"
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={copyLink}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.8rem 1.25rem', borderRadius: 14, color: '#fff', fontWeight: 700,
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}
            >
              {copiedLink ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              {copiedLink ? 'Copied!' : 'Share Link'}
            </button>
            <button
              onClick={handleJoinClick}
              disabled={isJoining}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)', border: 'none',
                padding: '0.8rem 1.4rem', borderRadius: 14, color: '#fff', fontWeight: 800,
                fontSize: '0.88rem', cursor: isJoining ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              {isJoining ? 'Joining...' : 'Enter Batch Workspace'} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ── TABS NAV ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(15, 22, 41, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16, padding: '0.35rem', overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: 'Batch Overview' },
            { id: 'materials', label: `Study Materials (${materials.length})` },
            { id: 'exams', label: `Assigned Exams (${exams.length})` },
            { id: 'assignments', label: `Assignments (${customAssignments.length})` },
            { id: 'announcements', label: `Announcements (${announcements.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.65rem 1.25rem', borderRadius: 12, border: 'none', fontSize: '0.84rem', fontWeight: 700,
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>STUDY MATERIALS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>{materials.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Isolated notes & labs</div>
              </div>

              <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>ASSIGNED EXAMS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06B6D4' }}>{exams.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Targeted assessments</div>
              </div>

              <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>COURSE ASSIGNMENTS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>{customAssignments.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Batch coursework</div>
              </div>

              <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>ANNOUNCEMENTS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#A78BFA' }}>{announcements.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Teacher broadcasts</div>
              </div>
            </div>

            {/* Quick Announcements Preview */}
            <div style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>📢 Batch Announcements</h3>
              {announcements.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>No announcements posted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {announcements.map(a => (
                    <div key={a.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem' }}>
                        <span>Author: {a.author_name}</span>
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

        {/* ── TAB 2: MATERIALS ── */}
        {activeTab === 'materials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {materials.length === 0 ? (
              <div style={{ background: 'rgba(15, 22, 41, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                No study materials assigned to this batch yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {materials.map(m => (
                  <div key={m.id} style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>{m.content_type || 'Material'}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0.3rem 0 0.5rem 0' }}>{m.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{m.description || 'Exclusive classroom study material.'}</p>
                    </div>
                    {m.resource_url && (
                      <a href={m.resource_url} target="_blank" rel="noreferrer" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981', padding: '0.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center' }}>
                        View Material
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: EXAMS ── */}
        {activeTab === 'exams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {exams.length === 0 ? (
              <div style={{ background: 'rgba(15, 22, 41, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                No exams assigned to this batch yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {exams.map(e => (
                  <div key={e.id} style={{ background: 'rgba(15, 22, 41, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#06B6D4', textTransform: 'uppercase' }}>{e.exam_type || 'Exam'}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0.3rem 0 0.5rem 0' }}>{e.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Duration: {e.duration_minutes || 30} mins</p>
                    </div>
                    <button
                      onClick={() => navigate(`/exams/${e.id}/take`)}
                      style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Start Assessment Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: ASSIGNMENTS ── */}
        {activeTab === 'assignments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {customAssignments.length === 0 ? (
              <div style={{ background: 'rgba(15, 22, 41, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                No custom assignments posted yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {customAssignments.map(as => (
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

        {/* ── TAB 5: ANNOUNCEMENTS ── */}
        {activeTab === 'announcements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map(a => (
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
        )}

      </div>
    </div>
  );
}
