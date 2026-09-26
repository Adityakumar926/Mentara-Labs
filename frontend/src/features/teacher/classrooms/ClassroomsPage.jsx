import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Search, Copy, Check, ExternalLink, Sparkles, 
  AlertTriangle, ShieldCheck, ArrowRight, Lock, BookOpen, FileText, Share2
} from 'lucide-react';
import { PageWrapper, Button, EmptyState } from '@/components/ui';
import { classroomApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function ClassroomsPage() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // New classroom form state
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setIsLoading(true);
      const res = await classroomApi.getClassrooms();
      setClassrooms(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load classrooms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Classroom name is required');

    try {
      setIsSubmitting(true);
      const res = await classroomApi.createClassroom(formData);
      toast.success('Classroom created successfully! 🎉');
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      fetchClassrooms();
      if (res.data?.data?.id) {
        navigate(`/classrooms/${res.data.data.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create classroom');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = (code) => {
    const link = `${window.location.origin}/classroom/join/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast.success('Classroom Join Link copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filtered = classrooms.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.invite_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper title="Mentara Classrooms & Virtual Batches">
      <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
        
        {/* ── HEADER BANNER ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(14, 20, 36, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: '2rem',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div style={{ maxWidth: 750 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '0.3rem 0.85rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700,
              color: '#06B6D4', textTransform: 'uppercase', marginBottom: '0.75rem'
            }}>
              <Users size={14} /> Mentara Labs • Virtual Batch Manager
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.5rem 0' }}>
              My Virtual Classrooms
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, margin: 0 }}>
              Create isolated batch classrooms, invite students securely, and assign exclusive Cambridge Primary exams, materials, and assignments with seat capacity controls.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
              border: 'none',
              padding: '0.85rem 1.4rem',
              borderRadius: 14,
              color: 'var(--color-text-primary)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} /> Create Classroom
          </button>
        </div>

        {/* ── SEARCH & FILTER BAR ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder="Search classrooms by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 22, 41, 0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                color: 'var(--color-text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Showing <strong>{filtered.length}</strong> active classroom(s)
          </div>
        </div>

        {/* ── CLASSROOM GRID ── */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            Loading Classrooms...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: 'rgba(15, 22, 41, 0.4)',
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>No Classrooms Found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: 460, margin: '0 auto' }}>
              {searchQuery ? 'No classrooms match your search terms.' : 'Create your first classroom batch to invite students and assign targeted Cambridge Primary content.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', border: 'none',
                  padding: '0.75rem 1.25rem', borderRadius: 12, color: 'var(--color-text-primary)', fontWeight: 700,
                  fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem'
                }}
              >
                + Create First Classroom
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {filtered.map(c => {
              const activeCount = c.active_students || 0;
              const pendingCount = c.pending_invitations || 0;
              const usedSeats = c.used_seats || 0;
              const limit = c.effective_seat_limit || 10;
              const isOverLimit = c.is_over_limit || activeCount > limit;
              const isFull = usedSeats >= limit;

              const percent = Math.min(100, Math.round((usedSeats / limit) * 100));

              return (
                <div
                  key={c.id}
                  style={{
                    background: 'rgba(15, 22, 41, 0.75)',
                    border: isOverLimit ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 20,
                    padding: '1.5rem',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    boxShadow: isOverLimit ? '0 0 20px rgba(239, 68, 68, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    {/* Top row: Code Badge & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CODE:</span>
                        <span style={{
                          background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)',
                          padding: '0.2rem 0.6rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 800,
                          color: '#A78BFA', fontFamily: 'monospace'
                        }}>
                          {c.invite_code}
                        </span>
                        <button
                          onClick={() => copyInviteLink(c.invite_code)}
                          title="Copy Join Link"
                          style={{
                            background: 'var(--local-card-bg)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 6, padding: '0.25rem 0.4rem', color: 'var(--color-text-primary)', cursor: 'pointer'
                          }}
                        >
                          {copiedCode === c.invite_code ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                        </button>
                      </div>

                      {isOverLimit ? (
                        <span style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#EF4444', padding: '0.2rem 0.6rem', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800 }}>
                          ⚠️ Over Limit
                        </span>
                      ) : isFull ? (
                        <span style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', color: '#F59E0B', padding: '0.2rem 0.6rem', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800 }}>
                          Full ({usedSeats}/{limit})
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981', padding: '0.2rem 0.6rem', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800 }}>
                          Active
                        </span>
                      )}
                    </div>

                    {/* Classroom Name & Description */}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.4rem 0', lineHeight: 1.3 }}>
                      {c.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 38 }}>
                      {c.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Seat Progress Bar & Stats */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Seat Allocation</span>
                      <span style={{ color: isOverLimit ? '#EF4444' : isFull ? '#F59E0B' : '#06B6D4' }}>
                        {activeCount} Active {pendingCount > 0 ? `+ ${pendingCount} Pending` : ''} / {limit} Seats
                      </span>
                    </div>

                    <div style={{ width: '100%', height: 7, background: 'var(--local-card-bdr)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: isOverLimit ? '#EF4444' : isFull ? '#F59E0B' : 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
                        borderRadius: 10,
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      onClick={() => navigate(`/classrooms/${c.id}`)}
                      style={{
                        flex: 1, padding: '0.7rem', borderRadius: 12, border: 'none',
                        background: 'var(--local-card-bdr)', color: 'var(--color-text-primary)',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Manage Classroom <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => copyInviteLink(c.invite_code)}
                      style={{
                        padding: '0.7rem 0.85rem', borderRadius: 12, border: '1px solid rgba(139,92,246,0.3)',
                        background: 'rgba(139,92,246,0.1)', color: '#A78BFA',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.35rem'
                      }}
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CREATE CLASSROOM MODAL ── */}
        {showCreateModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <div style={{
              background: '#0E1424', border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 24, padding: '2rem', maxWidth: 520, width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>Create New Classroom</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', display: 'block' }}>
                    Classroom Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java Placement Preparation 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12, padding: '0.75rem 1rem', color: 'var(--color-text-primary)', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', display: 'block' }}>
                    Description / Target Objectives (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of course focus, schedule, or batch target..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12, padding: '0.75rem 1rem', color: 'var(--color-text-primary)', fontSize: '0.85rem', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: '0.85rem', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  💡 <strong>Seat Quota Note:</strong> Maximum student capacity per classroom is automatically determined by your active teacher subscription plan.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'var(--color-text-primary)', fontWeight: 800, cursor: isSubmitting ? 'wait' : 'pointer' }}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Classroom'}
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
