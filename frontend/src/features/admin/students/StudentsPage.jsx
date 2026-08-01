import { useState, useMemo } from 'react';
import { 
  Search, Users, Star, Filter, ShieldCheck, GraduationCap, 
  Crown, Calendar, Mail, CheckCircle2, UserCheck, Sparkles, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Badge, Skeleton, EmptyState, Modal, Input, Button, ConfirmDialog } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import clsx from 'clsx';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  .sp-root {
    --navy:     #080C16;
    --navy2:    #0D1322;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --muted:    rgba(245,240,232,0.55);
    --card-bg:  rgba(13, 19, 34, 0.75);
    --card-bdr: rgba(255, 255, 255, 0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }

  /* ── HERO BANNER ── */
  .sp-hero {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(0,212,255,0.08) 50%, rgba(16,185,129,0.05) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 2.25rem 2.5rem;
    overflow: hidden;
    backdrop-filter: blur(24px);
    margin-bottom: 1.75rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .sp-hblob {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  }
  .sp-hblob-1 {
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    top: -120px; right: -80px;
    animation: sp-drift 12s ease-in-out infinite alternate;
  }
  .sp-hblob-2 {
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%);
    bottom: -60px; left: 30%;
    animation: sp-drift 16s ease-in-out infinite alternate-reverse;
  }
  @keyframes sp-drift { from{transform:translate(0,0)} to{transform:translate(25px,-20px)} }

  .sp-status-pill {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.35);
    padding: 0.35rem 0.95rem; border-radius: 50px;
    font-size: 0.72rem; font-weight: 700; color: #C4B5FD;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
  }
  .sp-status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #00D4FF; box-shadow: 0 0 10px #00D4FF;
    animation: sp-blink 2s infinite ease-in-out;
  }
  @keyframes sp-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .sp-hero-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.75rem, 3.5vw, 2.35rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #C4B5FD 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
    margin-bottom: 0.4rem;
  }
  .sp-hero-sub {
    font-size: 0.9rem; color: #94A3B8; font-weight: 500; max-width: 540px;
  }

  /* ── STATS ROW ── */
  .sp-stats-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem; margin-bottom: 1.5rem;
  }
  .sp-stat-box {
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 18px; padding: 1.1rem 1.25rem; backdrop-filter: blur(20px);
    display: flex; align-items: center; gap: 1rem;
    transition: all 0.25s ease;
  }
  .sp-stat-box:hover {
    border-color: rgba(255, 255, 255, 0.15); transform: translateY(-2px);
  }
  .sp-stat-icon-wrap {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sp-stat-val { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 900; color: #FFF; line-height: 1; }
  .sp-stat-lbl { font-size: 0.75rem; color: #94A3B8; font-weight: 600; margin-top: 0.2rem; }

  /* ── FILTER BAR ── */
  .sp-controls-bar {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 20px; padding: 0.85rem 1.25rem; backdrop-filter: blur(20px);
    margin-bottom: 1.75rem;
  }
  .sp-search-wrap {
    position: relative; flex: 1; min-width: 240px; max-width: 400px;
  }
  .sp-search-input {
    width: 100%;
    background: rgba(15, 23, 42, 0.85) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 12px;
    padding: 0.65rem 1rem 0.65rem 2.4rem;
    color: #FFFFFF !important;
    font-size: 0.85rem;
    outline: none;
    transition: all 0.2s ease;
  }
  .sp-search-input::placeholder { color: #94A3B8 !important; }
  .sp-search-input:focus {
    border-color: rgba(0, 212, 255, 0.6) !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.25) !important;
  }

  .sp-select {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 0.65rem 2.2rem 0.65rem 0.9rem;
    color: #FFFFFF; font-family: 'Inter', sans-serif;
    font-size: 0.82rem; font-weight: 600; outline: none; cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.8rem center;
    background-size: 0.85rem;
    min-width: 140px;
  }
  .sp-select option { background: #0F172A; color: #FFFFFF; }

  /* ── TABLE CARD ── */
  .sp-table-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(24px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }
  .sp-table { width: 100%; border-collapse: collapse; text-align: left; }
  .sp-table th {
    padding: 1rem 1.25rem; font-size: 0.72rem; font-weight: 800;
    color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
  }
  .sp-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.2s ease;
  }
  .sp-table tbody tr:last-child { border-bottom: none; }
  .sp-table tbody tr:hover { background: rgba(255,255,255,0.025); }
  .sp-table td { padding: 1rem 1.25rem; vertical-align: middle; font-size: 0.83rem; color: #E2E8F0; }

  /* avatar */
  .sp-avatar {
    width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(0,212,255,0.2) 100%);
    border: 1px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; font-weight: 800; color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  .sp-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .sp-student-name { font-weight: 700; color: #FFFFFF; font-size: 0.88rem; }
  .sp-student-email { color: #94A3B8; font-size: 0.75rem; margin-top: 0.1rem; font-weight: 500; }

  /* plan badge */
  .sp-badge {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.25rem 0.65rem; border-radius: 50px;
    font-size: 0.65rem; font-weight: 800;
    letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid;
  }
  .sp-badge-premium { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.35); color: #FCD34D; box-shadow: 0 0 10px rgba(245,158,11,0.15); }
  .sp-badge-free    { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); color: #94A3B8; }

  /* role badge */
  .sp-role-badge {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.25rem 0.65rem; border-radius: 10px;
    font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .sp-role-teacher { background: rgba(124,58,237,0.15); color: #C4B5FD; border: 1px solid rgba(124,58,237,0.3); }
  .sp-role-student { background: rgba(0,212,255,0.12); color: #67E8F9; border: 1px solid rgba(0,212,255,0.25); }

  .sp-manage-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.45rem 0.85rem; border-radius: 12px;
    font-size: 0.75rem; font-weight: 700; cursor: pointer;
    transition: all 0.2s ease; border: 1px solid;
  }
  .sp-manage-btn.prem {
    background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); color: #FCD34D;
  }
  .sp-manage-btn.prem:hover {
    background: rgba(245,158,11,0.22); border-color: rgba(245,158,11,0.5); color: #FFF;
  }
  .sp-manage-btn.grant {
    background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.3); color: #C4B5FD;
  }
  .sp-manage-btn.grant:hover {
    background: rgba(124,58,237,0.22); border-color: rgba(124,58,237,0.5); color: #FFF;
  }
`;

export default function StudentsPage() {
  const [search, setSearch]         = useState('');
  const [premFilter, setPremFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [premModal, setPremModal]   = useState(null);
  const [expiryDate, setExpiryDate] = useState('');

  const { data: students, loading, refetch } = useApi(
    adminApi.getStudents,
    { 
      search: search || undefined, 
      is_premium: premFilter || undefined,
      role: roleFilter || undefined 
    },
    [search, premFilter, roleFilter]
  );

  const { mutate: togglePremium, loading: toggling } = useMutation(
    ({ id, is_premium, premium_expires_at }) =>
      adminApi.toggleStudentPremium(id, { is_premium, premium_expires_at }),
    {
      onSuccess: () => { setPremModal(null); refetch(); },
      successMsg: 'Premium status updated',
    }
  );

  const openPremModal = (s) => {
    setPremModal(s);
    if (!s.is_premium) {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      setExpiryDate(d.toISOString().split('T')[0]);
    } else {
      setExpiryDate(s.premium_expires_at?.split('T')[0] ?? '');
    }
  };

  const list = students ?? [];

  const premiumCount = useMemo(() => list.filter(s => s.is_premium).length, [list]);
  const teacherCount = useMemo(() => list.filter(s => s.role === 'teacher').length, [list]);
  const studentCount = useMemo(() => list.filter(s => s.role === 'student' || !s.role).length, [list]);

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="sp-root">

        {/* ── HERO BANNER ── */}
        <motion.div
          className="sp-hero"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="sp-hblob sp-hblob-1" />
          <div className="sp-hblob sp-hblob-2" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="sp-status-pill">
                <span className="sp-status-dot" />
                User & Student Directory
              </div>
              <h1 className="sp-hero-title">Platform Users</h1>
              <p className="sp-hero-sub">
                Manage student accounts, teacher roles, and premium subscription access across Mentara Labs.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── SUMMARY STATS ── */}
        <div className="sp-stats-grid">
          <div className="sp-stat-box">
            <div className="sp-stat-icon-wrap bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <Users size={20} />
            </div>
            <div>
              <div className="sp-stat-val">{list.length}</div>
              <div className="sp-stat-lbl">Total Users</div>
            </div>
          </div>

          <div className="sp-stat-box">
            <div className="sp-stat-icon-wrap bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="sp-stat-val">{studentCount}</div>
              <div className="sp-stat-lbl">Enrolled Students</div>
            </div>
          </div>

          <div className="sp-stat-box">
            <div className="sp-stat-icon-wrap bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="sp-stat-val">{teacherCount}</div>
              <div className="sp-stat-lbl">Teachers & Staff</div>
            </div>
          </div>

          <div className="sp-stat-box">
            <div className="sp-stat-icon-wrap bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <Crown size={20} />
            </div>
            <div>
              <div className="sp-stat-val">{premiumCount}</div>
              <div className="sp-stat-lbl">Premium VIP Members</div>
            </div>
          </div>
        </div>

        {/* ── CONTROLS & FILTERS BAR ── */}
        <div className="sp-controls-bar">
          <div className="sp-search-wrap">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="sp-search-input"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Role Filter */}
            <select
              className="sp-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
            </select>

            {/* Premium Filter */}
            <select
              className="sp-select"
              value={premFilter}
              onChange={(e) => setPremFilter(e.target.value)}
            >
              <option value="">All Plans</option>
              <option value="true">Premium VIP</option>
              <option value="false">Free Tier</option>
            </select>

            <button
              onClick={refetch}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-bold transition-all"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* ── USERS TABLE ── */}
        {loading ? (
          <div className="sp-table-card p-6 space-y-3">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-14 bg-slate-900/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <motion.div
            className="sp-table-card p-12 text-center"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Users size={36} className="text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Users Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Try adjusting your search criteria or role filters.</p>
          </motion.div>
        ) : (
          <motion.div
            className="sp-table-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="overflow-x-auto">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>User Profile</th>
                    <th>Account Role</th>
                    <th>Joined Date</th>
                    <th>Subscription Plan</th>
                    <th>Access Expiry</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {list.map((s, i) => (
                      <motion.tr
                        key={s.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02, duration: 0.2 }}
                      >
                        {/* Name/Email */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="sp-avatar">
                              {s.avatar_url ? (
                                <img src={s.avatar_url} alt={s.full_name} />
                              ) : (
                                s.full_name?.[0]?.toUpperCase() ?? 'U'
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="sp-student-name">{s.full_name}</p>
                              <p className="sp-student-email">{s.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td>
                          <span className={`sp-role-badge ${s.role === 'teacher' ? 'sp-role-teacher' : 'sp-role-student'}`}>
                            {s.role === 'teacher' ? <ShieldCheck size={12} /> : <GraduationCap size={12} />}
                            {s.role === 'teacher' ? 'Teacher' : 'Student'}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="text-xs text-slate-400 font-semibold">{fmt(s.created_at) ?? '—'}</td>

                        {/* Plan */}
                        <td>
                          <span className={`sp-badge ${s.is_premium ? 'sp-badge-premium' : 'sp-badge-free'}`}>
                            {s.is_premium ? <Crown size={12} /> : null}
                            {s.is_premium ? 'Premium VIP' : 'Free Tier'}
                          </span>
                        </td>

                        {/* Expires */}
                        <td className="text-xs text-slate-400 font-semibold">
                          {s.is_premium && s.premium_expires_at ? (
                            <div className="flex items-center gap-1 text-amber-300">
                              <Calendar size={12} />
                              {fmt(s.premium_expires_at)}
                            </div>
                          ) : (
                            'Lifetime / N/A'
                          )}
                        </td>

                        {/* Action */}
                        <td className="text-right">
                          <button
                            onClick={() => openPremModal(s)}
                            className={`sp-manage-btn ${s.is_premium ? 'prem' : 'grant'}`}
                          >
                            <Crown size={13} />
                            {s.is_premium ? 'Manage Plan' : 'Grant Premium'}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>

      {/* ── Premium Modal ── */}
      <Modal
        open={!!premModal}
        onClose={() => setPremModal(null)}
        title={premModal?.is_premium ? 'Manage Premium Subscription' : 'Grant Premium VIP Access'}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="sp-avatar">
              {premModal?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="sp-student-name">{premModal?.full_name}</p>
              <p className="sp-student-email">{premModal?.email}</p>
            </div>
          </div>

          <Input
            label="Premium Expiry Date (Optional for Lifetime Access)"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          <p className="text-xs text-slate-400 leading-relaxed">
            {premModal?.is_premium
              ? 'Update expiration date above or click Revoke to convert account back to Free Tier.'
              : 'Grants access to all Cambridge Primary worksheets, exams, and AI voice tutor features.'}
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-800">
          <Button variant="ghost" onClick={() => setPremModal(null)}>Cancel</Button>
          {premModal?.is_premium ? (
            <>
              <Button
                variant="danger"
                loading={toggling}
                onClick={() =>
                  togglePremium({
                    id: premModal.id,
                    is_premium: false,
                    premium_expires_at: null,
                  })
                }
              >
                Revoke VIP
              </Button>
              <Button
                variant="primary"
                loading={toggling}
                onClick={() =>
                  togglePremium({
                    id: premModal.id,
                    is_premium: true,
                    premium_expires_at: expiryDate || null,
                  })
                }
              >
                Update Expiry
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              loading={toggling}
              onClick={() =>
                togglePremium({
                  id: premModal.id,
                  is_premium: true,
                  premium_expires_at: expiryDate || null,
                })
              }
            >
              Grant Premium VIP
            </Button>
          )}
        </div>
      </Modal>
    </PageWrapper>
  );
}