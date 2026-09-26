import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, FileText, ArrowRight, Clock, Award, ShieldCheck, 
  Calendar, CheckCircle2, AlertCircle, HelpCircle
} from 'lucide-react';
import { PageWrapper, Button } from '@/components/ui';
import { classroomApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function StudentClassroomView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('exams'); // 'exams', 'materials', 'assignments', 'announcements'
  const [isLoading, setIsLoading] = useState(true);

  const [exams, setExams] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchClassroomData();
  }, [id]);

  const fetchClassroomData = async () => {
    try {
      setIsLoading(true);
      const detailRes = await classroomApi.getStudentClassroomDetail(id);
      setClassroom(detailRes.data?.data || null);

      // Fetch isolated contents in parallel
      const [examsRes, materialsRes, assignRes, announceRes] = await Promise.all([
        classroomApi.getStudentClassroomExams(id),
        classroomApi.getStudentClassroomMaterials(id),
        classroomApi.getStudentClassroomAssignments(id),
        classroomApi.getStudentClassroomAnnouncements(id)
      ]);

      setExams(examsRes.data?.data || []);
      setMaterials(materialsRes.data?.data || []);
      setAssignments(assignRes.data?.data || []);
      setAnnouncements(announceRes.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Access denied: You are not an active member of this classroom');
      navigate('/student/classrooms');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !classroom) {
    return (
      <PageWrapper title="Classroom Workspace">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
          Loading Isolated Classroom Content...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={classroom.name}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
        
        {/* ── CLASSROOM HEADER BANNER ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.12) 50%, rgba(8, 12, 22, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TEACHER: {classroom.teacher_name}
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0.4rem 0 0.4rem 0' }}>
              {classroom.name}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              {classroom.description || 'Welcome to your classroom batch workspace.'}
            </p>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981', padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 800 }}>
            Verified Batch Member ✓
          </div>
        </div>

        {/* ── TAB NAV ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(14, 20, 36, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16, padding: '0.35rem'
        }}>
          {[
            { id: 'exams', label: `Assigned Exams (${exams.length})` },
            { id: 'materials', label: `Study Materials (${materials.length})` },
            { id: 'assignments', label: `Assignments (${assignments.length})` },
            { id: 'announcements', label: `Announcements (${announcements.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.65rem 1.25rem', borderRadius: 12, border: 'none', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-text-primary)' : 'rgba(255,255,255,0.6)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: EXAMS ── */}
        {activeTab === 'exams' && (
          <div>
            {exams.length === 0 ? (
              <div style={{ background: 'rgba(14, 20, 36, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No exams assigned to this classroom yet. Check back soon!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {exams.map(e => (
                  <div key={e.id} style={{ background: 'rgba(14, 20, 36, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#06B6D4', textTransform: 'uppercase', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '0.15rem 0.55rem', borderRadius: 6 }}>
                          {e.subject_name || e.exam_type || 'Exam'}
                        </span>
                        {e.class_name && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#A78BFA', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)', padding: '0.15rem 0.55rem', borderRadius: 6 }}>
                            {e.class_name}
                          </span>
                        )}
                        {e.topic_name && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.55rem', borderRadius: 6 }}>
                            {e.topic_name}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0.3rem 0 0.5rem 0' }}>{e.title}</h3>
                      <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
                        <span>⏱️ {e.duration_minutes || 30} mins</span>
                        {e.question_count > 0 && <span>📝 {e.question_count} Questions</span>}
                        {e.total_marks > 0 && <span>🎯 {e.total_marks} Marks</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/exams/${e.id}/take`)}
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none',
                        padding: '0.75rem', borderRadius: 12, color: 'var(--color-text-primary)', fontWeight: 800,
                        fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)', transition: 'transform 0.15s ease'
                      }}
                    >
                      Start Assessment <ArrowRight size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: MATERIALS ── */}
        {activeTab === 'materials' && (
          <div>
            {materials.length === 0 ? (
              <div style={{ background: 'rgba(14, 20, 36, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No study materials assigned to this classroom yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {materials.map(m => (
                  <div key={m.id} style={{ background: 'rgba(14, 20, 36, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>{m.content_type || 'Material'}</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0.3rem 0 0.5rem 0' }}>{m.title}</h3>
                    </div>
                    {m.file_url && (
                      <a
                        href={m.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                          padding: '0.65rem', borderRadius: 12, color: '#10B981', fontWeight: 700,
                          fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none'
                        }}
                      >
                        Open Material ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: ASSIGNMENTS ── */}
        {activeTab === 'assignments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignments.length === 0 ? (
              <div style={{ background: 'rgba(14, 20, 36, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No assignments posted for this batch yet.
              </div>
            ) : (
              assignments.map(as => (
                <div key={as.id} style={{ background: 'rgba(14, 20, 36, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.4rem 0' }}>{as.title}</h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>{as.description}</p>
                    </div>
                    {as.due_date && (
                      <span style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid #F59E0B', color: '#F59E0B', padding: '0.25rem 0.65rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>
                        Due: {new Date(as.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 4: ANNOUNCEMENTS ── */}
        {activeTab === 'announcements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.length === 0 ? (
              <div style={{ background: 'rgba(14, 20, 36, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No announcements broadcasted yet.
              </div>
            ) : (
              announcements.map(a => (
                <div key={a.id} style={{ background: 'rgba(14, 20, 36, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
                    <span>Author: {a.author_name}</span>
                    <span>{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.35rem 0' }}>{a.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>{a.content}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
