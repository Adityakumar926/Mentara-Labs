import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, BookOpen, FileText, CheckCircle2 } from 'lucide-react';
import { PageWrapper, Button, EmptyState } from '@/components/ui';
import { classroomApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function StudentClassroomsPage() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudentClassrooms();
  }, []);

  const fetchStudentClassrooms = async () => {
    try {
      setIsLoading(true);
      const res = await classroomApi.getStudentClassrooms();
      setClassrooms(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load your classrooms');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper title="My Joined Classrooms">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
        
        {/* ── HEADER BANNER ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(8, 12, 22, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: '2rem',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '0.3rem 0.85rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700,
              color: '#06B6D4', textTransform: 'uppercase', marginBottom: '0.75rem'
            }}>
              <Users size={14} /> Mentara Student Workspace
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0' }}>
              My Enrolled Classrooms
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              Access exclusive batch study materials, targeted Cambridge Primary assessments, and classroom announcements from your teachers.
            </p>
          </div>
        </div>

        {/* ── CLASSROOM LISTING ── */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.5)' }}>
            Loading Enrolled Classrooms...
          </div>
        ) : classrooms.length === 0 ? (
          <div style={{
            background: 'rgba(14, 20, 36, 0.6)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} color="#8B5CF6" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>No Classrooms Joined Yet</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto' }}>
              You have not joined any teacher classrooms yet. Use an invitation join link provided by your teacher to access isolated batch content!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {classrooms.map(c => (
              <div
                key={c.id}
                style={{
                  background: 'rgba(14, 20, 36, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 20,
                  padding: '1.5rem',
                  backdropFilter: 'blur(16px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    TEACHER: {c.teacher_name}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0.4rem 0 0.4rem 0' }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description || 'Classroom batch.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    Joined: {new Date(c.joined_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => navigate(`/student/classrooms/${c.id}`)}
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none',
                      padding: '0.65rem 1.1rem', borderRadius: 12, color: '#fff',
                      fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    Enter Classroom <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
