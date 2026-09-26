import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, ArrowRight, BookOpen, AlertCircle, Sparkles, CheckCircle2, LogOut 
} from 'lucide-react';
import { classroomApi } from '@/api/services';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ClassroomJoinPage() {
  const { inviteCode } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setAuthData } = useAuthStore();

  const [joinInfo, setJoinInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Email verification state
  const [emailInput, setEmailInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  // Quick join for already authenticated student
  const [isQuickJoining, setIsQuickJoining] = useState(false);

  useEffect(() => {
    fetchJoinInfo();
  }, [inviteCode]);

  useEffect(() => {
    if (user?.email && !emailInput) {
      setEmailInput(user.email);
    }
  }, [user]);

  const fetchJoinInfo = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await classroomApi.getJoinInfo(inviteCode);
      setJoinInfo(res.data?.data || null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired classroom join link');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify Email & Route to Register / Login / Classroom ──
  const handleVerifyEmail = async (e) => {
    e?.preventDefault();
    const clean = (emailInput || '').trim().toLowerCase();
    if (!clean) {
      return setVerifyError('Please enter your email address');
    }
    setVerifyError(null);
    setIsVerifying(true);

    try {
      const res = await classroomApi.verifyJoinEmail({
        inviteCode,
        email: clean,
        token
      });
      const data = res.data?.data;
      if (data) {
        // If student is already authenticated and matched
        if (data.is_authenticated) {
          if (data.accessToken) {
            setAuthData({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user
            });
          }
          toast.success(`Classroom joined! Welcome to ${joinInfo?.name || 'Classroom'} 🎉`);
          navigate(`/student/classrooms/${data.classroom_id}`);
          return;
        }

        const classTitle = joinInfo?.name || data.classroom_name || 'the classroom';

        // CASE 1: User does NOT have an account -> redirect to Register page with message
        if (!data.has_account) {
          toast(`Please create an account to join ${classTitle}`, { icon: '🎓', duration: 5000 });
          const registerUrl = `/register?email=${encodeURIComponent(data.email)}&invite=${inviteCode}${token ? `&token=${token}` : ''}&classroom_name=${encodeURIComponent(classTitle)}&msg=${encodeURIComponent(`Please create an account to join ${classTitle}`)}`;
          navigate(registerUrl);
          return;
        }

        // CASE 2: User DOES have an account -> redirect to Login page with message
        toast(`Please log in to join ${classTitle}`, { icon: '🔑', duration: 5000 });
        const loginUrl = `/login?email=${encodeURIComponent(data.email)}&invite=${inviteCode}${token ? `&token=${token}` : ''}&classroom_name=${encodeURIComponent(classTitle)}&msg=${encodeURIComponent(`Please log in to join ${classTitle}`)}`;
        navigate(loginUrl);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'This email has not been invited to this classroom yet.';
      setVerifyError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Quick Join for Already Logged-in Student ──
  const handleQuickJoin = async () => {
    if (user?.role !== 'student') {
      return toast.error('Only students can join classrooms');
    }
    setIsQuickJoining(true);
    try {
      const res = await classroomApi.joinClassroom(inviteCode, token);
      toast.success(res.data?.message || 'Successfully joined classroom! 🎉');
      const cid = res.data?.data?.classroom_id || joinInfo?.id;
      navigate(`/student/classrooms/${cid}`);
    } catch (err) {
      if (err.response?.data?.code === 'CLASSROOM_FULL') {
        toast.error('This classroom has reached its maximum student limit.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to join classroom');
      }
    } finally {
      setIsQuickJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', background: '#080C16', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={36} color="#8B5CF6" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Loading Classroom Invitation...</div>
        </div>
      </div>
    );
  }

  if (errorMsg || !joinInfo) {
    return (
      <div style={{ minHeight: '100vh', background: '#080C16', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: 'rgba(14,20,36,0.9)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 24, padding: '3rem 2rem', textAlign: 'center', maxWidth: 460, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <AlertCircle size={30} color="#EF4444" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Invitation Error</h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            {errorMsg || 'Classroom link not found or has expired.'}
          </p>
          <button 
            onClick={() => navigate('/')} 
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none', padding: '0.85rem 1.75rem', borderRadius: 12, color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080C16', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 58, 0.9) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        borderRadius: 24,
        padding: '2.5rem 2rem',
        maxWidth: 480,
        width: '100%',
        boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 35px rgba(139, 92, 246, 0.15)',
        backdropFilter: 'blur(20px)'
      }}>
        
        {/* ── CLASSROOM HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.25))',
            border: '1px solid rgba(139,92,246,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto',
            boxShadow: '0 0 20px rgba(139,92,246,0.3)'
          }}>
            <BookOpen size={30} color="#A78BFA" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '0.25rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, color: '#C4B5FD', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
            <span>INVITE CODE:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{joinInfo.invite_code}</strong>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.4rem 0', lineHeight: 1.2 }}>
            {joinInfo.name}
          </h1>

          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', margin: '0 0 1rem 0' }}>
            Teacher: <strong style={{ color: '#E2E8F0' }}>{joinInfo.teacher_name}</strong>
          </p>

          {/* Quick Classroom Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', background: 'var(--local-card-bg)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0.65rem', borderRadius: 8, color: '#CBD5E1' }}>
              📝 {joinInfo.assigned_exams?.length || 0} Exams
            </span>
            <span style={{ fontSize: '0.75rem', background: 'var(--local-card-bg)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0.65rem', borderRadius: 8, color: '#CBD5E1' }}>
              📚 {joinInfo.assigned_materials?.length || 0} Materials
            </span>
            <span style={{ fontSize: '0.75rem', background: 'var(--local-card-bg)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0.65rem', borderRadius: 8, color: '#CBD5E1' }}>
              👥 {joinInfo.active_students || 0} Students
            </span>
          </div>
        </div>

        {/* ── TEACHER WARNING (if teacher is logged in) ── */}
        {user && (user.role === 'teacher' || user.role === 'admin') && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 14,
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
            color: '#FDE68A',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <AlertCircle size={16} color="#F59E0B" />
              <span>Signed in as {user.role.toUpperCase()}: {user.email}</span>
            </div>
            <p style={{ margin: 0, opacity: 0.85 }}>
              Classrooms are for student enrollment. To join as a student, please log out first.
            </p>
            <button
              onClick={() => logout()}
              style={{
                background: 'rgba(245, 158, 11, 0.25)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: 'var(--color-text-primary)',
                padding: '0.4rem 0.8rem',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <LogOut size={13} />
              Log Out of Teacher Account
            </button>
          </div>
        )}

        {/* ── ALREADY LOGGED IN AS STUDENT (1-Click Join) ── */}
        {isAuthenticated && user?.role === 'student' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 14,
              padding: '0.9rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#6EE7B7',
              fontSize: '0.88rem'
            }}>
              <CheckCircle2 size={20} color="#10B981" style={{ flexShrink: 0 }} />
              <div>
                Logged in as <strong>{user.full_name}</strong>
                <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{user.email}</div>
              </div>
            </div>

            <button
              onClick={handleQuickJoin}
              disabled={isQuickJoining}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                border: 'none',
                padding: '0.95rem',
                borderRadius: 12,
                color: 'var(--color-text-primary)',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: isQuickJoining ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.35)'
              }}
            >
              {isQuickJoining ? 'Enrolling in Classroom...' : 'Join Classroom Now'}
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                onClick={() => logout()}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Not your account? Log out and join with another email
              </button>
            </div>
          </div>
        ) : (
          /* ── VERIFY INVITED EMAIL FORM ── */
          <form onSubmit={handleVerifyEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem' }}>
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
                  background: 'rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                Enter the email address where your teacher sent the invitation.
              </span>
            </div>

            {verifyError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
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
                padding: '0.95rem',
                borderRadius: 12,
                color: 'var(--color-text-primary)',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: isVerifying ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                opacity: isVerifying ? 0.7 : 1
              }}
            >
              {isVerifying ? 'Verifying Invitation...' : 'Verify Invitation & Continue'}
              <ArrowRight size={18} />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
