import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Users, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchJoinInfo();
  }, [inviteCode]);

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

  const handleJoinClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in as a student to join this classroom');
      return navigate(`/login?redirect=/classroom/join/${inviteCode}${token ? `?token=${token}` : ''}`);
    }

    if (user?.role !== 'student') {
      return toast.error('Only student accounts can join classrooms. Please log in with a student account.');
    }

    try {
      setIsJoining(true);
      const res = await classroomApi.joinClassroom(inviteCode, token);
      toast.success(res.data?.message || 'Successfully joined classroom! 🎉');
      if (res.data?.data?.classroom_id) {
        navigate(`/student/classrooms/${res.data.data.classroom_id}`);
      } else {
        navigate('/student/classrooms');
      }
    } catch (err) {
      if (err.response?.data?.code === 'CLASSROOM_FULL') {
        toast.error('This classroom has reached its maximum seat capacity limit.', { duration: 5000 });
      } else {
        toast.error(err.response?.data?.message || 'Failed to join classroom');
      }
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', background: '#080C16', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading Classroom Invitation...
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

  return (
    <div style={{ height: '100vh', background: '#080C16', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Quicksand, sans-serif' }}>
      <div style={{
        background: 'rgba(14, 20, 36, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 28,
        padding: '2.5rem',
        maxWidth: 520,
        width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={32} color="#06B6D4" />
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            CLASSROOM INVITATION
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '0.3rem 0 0.4rem 0' }}>
            {joinInfo.name}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>
            Teacher: <strong>{joinInfo.teacher_name}</strong>
          </p>
          {joinInfo.description && (
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              "{joinInfo.description}"
            </p>
          )}
        </div>

        <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>
          🔒 <strong>Isolated Batch Workspace:</strong> By joining, you will receive access to exclusive study materials, exams, and announcements assigned by {joinInfo.teacher_name}.
        </div>

        <button
          onClick={handleJoinClick}
          disabled={isJoining}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
            border: 'none',
            padding: '0.9rem',
            borderRadius: 14,
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: isJoining ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)'
          }}
        >
          {isJoining ? 'Joining Classroom...' : 'Join Classroom Now'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
