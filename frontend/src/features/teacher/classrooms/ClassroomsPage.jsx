import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Search, Copy, Check, Sparkles, 
  ArrowRight, Share2
} from 'lucide-react';
import { PageWrapper } from '@/components/ui';
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
        
        {/* ── HEADER BANNER (Light Theme) ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(125deg, #FFFFFF 0%, #F5F7FF 45%, #EEF2FF 78%, #FDF4FF 100%)',
          border: '1px solid #E0E7FF',
          borderRadius: 24,
          padding: '2rem',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: 750, position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: '#EEF2FF', border: '1px solid #C7D2FE',
              padding: '0.3rem 0.85rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800,
              color: '#4F46E5', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.03em'
            }}>
              <Users size={14} /> Mentara Learning • Virtual Batch Manager
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
              My Virtual Classrooms
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
              Create isolated batch classrooms, invite students securely, and assign exclusive Cambridge Primary exams, materials, and assignments with seat capacity controls.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
              border: 'none',
              padding: '0.85rem 1.45rem',
              borderRadius: 14,
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.28)',
              transition: 'all 0.2s',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Plus size={18} /> Create Classroom
          </button>
        </div>

        {/* ── SEARCH & FILTER BAR ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search classrooms by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: 14,
                padding: '0.7rem 1rem 0.7rem 2.5rem',
                color: '#0F172A',
                fontSize: '0.86rem',
                fontWeight: 500,
                outline: 'none',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
              }}
            />
          </div>

          <div style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
            Showing <strong style={{ color: '#0F172A' }}>{filtered.length}</strong> active classroom(s)
          </div>
        </div>

        {/* ── CLASSROOM GRID ── */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B', fontWeight: 600 }}>
            Loading Classrooms...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            border: '1.5px dashed #CBD5E1',
            borderRadius: 22,
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#EEF2FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} color="#4F46E5" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>No Classrooms Found</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: 460, margin: '0 auto', lineHeight: 1.55 }}>
              {searchQuery ? 'No classrooms match your search terms.' : 'Create your first classroom batch to invite students and assign targeted Cambridge Primary content.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', border: 'none',
                  padding: '0.75rem 1.35rem', borderRadius: 12, color: '#fff', fontWeight: 700,
                  fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)'
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
                    background: '#FFFFFF',
                    border: isOverLimit ? '1.5px solid #EF4444' : '1px solid #E2E8F0',
                    borderRadius: 22,
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    boxShadow: isOverLimit
                      ? '0 8px 24px rgba(239, 68, 68, 0.12)'
                      : '0 8px 24px rgba(15, 23, 42, 0.05)',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Top Accent Strip */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: 4,
                    background: isOverLimit
                      ? '#EF4444'
                      : 'linear-gradient(90deg, #6366F1 0%, #0EA5E9 100%)'
                  }} />

                  <div>
                    {/* Top row: Code Badge & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CODE:</span>
                        <span style={{
                          background: '#EEF2FF', border: '1px solid #C7D2FE',
                          padding: '0.22rem 0.65rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 800,
                          color: '#4F46E5', fontFamily: 'monospace'
                        }}>
                          {c.invite_code}
                        </span>
                        <button
                          onClick={() => copyInviteLink(c.invite_code)}
                          title="Copy Join Link"
                          style={{
                            background: '#F8FAFC', border: '1px solid #CBD5E1',
                            borderRadius: 7, padding: '0.28rem 0.45rem', color: '#475569', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          {copiedCode === c.invite_code ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                        </button>
                      </div>

                      {isOverLimit ? (
                        <span style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.22rem 0.65rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 800 }}>
                          ⚠️ Over Limit
                        </span>
                      ) : isFull ? (
                        <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', padding: '0.22rem 0.65rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 800 }}>
                          Full ({usedSeats}/{limit})
                        </span>
                      ) : (
                        <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '0.22rem 0.65rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 800 }}>
                          Active
                        </span>
                      )}
                    </div>

                    {/* Classroom Name & Description */}
                    <h3 style={{ fontSize: '1.22rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem 0', lineHeight: 1.3 }}>
                      {c.name}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 38, fontWeight: 500 }}>
                      {c.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Seat Progress Bar & Stats */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                      <span style={{ color: '#475569' }}>Seat Allocation</span>
                      <span style={{ color: isOverLimit ? '#DC2626' : isFull ? '#D97706' : '#0284C7', fontWeight: 800 }}>
                        {activeCount} Active {pendingCount > 0 ? `+ ${pendingCount} Pending` : ''} / {limit} Seats
                      </span>
                    </div>

                    <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: isOverLimit ? '#EF4444' : isFull ? '#F59E0B' : 'linear-gradient(90deg, #6366F1, #0EA5E9)',
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
                        flex: 1, padding: '0.72rem', borderRadius: 12,
                        border: '1px solid #C7D2FE',
                        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                        color: '#3730A3',
                        fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Manage Classroom <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => copyInviteLink(c.invite_code)}
                      title="Share Classroom Invite Link"
                      style={{
                        padding: '0.72rem 0.9rem', borderRadius: 12, border: '1px solid #E2E8F0',
                        background: '#F8FAFC', color: '#4F46E5',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.35rem'
                      }}
                    >
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CREATE CLASSROOM MODAL (Light Theme) ── */}
        {showCreateModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: 24, padding: '2rem', maxWidth: 520, width: '100%',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)', display: 'flex', flexDirection: 'column', gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Create New Classroom</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10,
                    width: 32, height: 32, color: '#475569', fontSize: '0.95rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'block' }}>
                    Classroom Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stage 4 – Young Thinkers"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                      borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'block' }}>
                    Description / Target Objectives (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of course focus, schedule, or batch target..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                      borderRadius: 12, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#4C1D95', lineHeight: 1.5, fontWeight: 500 }}>
                  💡 <strong>Seat Quota Note:</strong> Maximum student capacity per classroom is automatically determined by your active teacher subscription plan.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', color: '#fff',
                      fontWeight: 800, cursor: isSubmitting ? 'wait' : 'pointer',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)'
                    }}
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
