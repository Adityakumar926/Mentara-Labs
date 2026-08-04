import { useState, useMemo } from 'react';
import { 
  Search, Users, Star, Filter, ShieldCheck, GraduationCap, 
  Crown, Calendar, Mail, CheckCircle2, UserCheck, Sparkles, RefreshCw,
  Eye, Activity, Flame, Award, BookOpen, Clock, XCircle, FileText, Video, Layers, ChevronRight
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

  /* stage badge */
  .sp-stage-badge {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.25rem 0.65rem; border-radius: 10px;
    font-size: 0.72rem; font-weight: 800;
    background: rgba(52, 211, 153, 0.12); color: #34D399; border: 1px solid rgba(52, 211, 153, 0.3);
  }

  .sp-manage-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.45rem 0.85rem; border-radius: 12px;
    font-size: 0.75rem; font-weight: 700; cursor: pointer;
    transition: all 0.2s ease; border: 1px solid;
  }
  .sp-manage-btn.view {
    background: rgba(0, 212, 255, 0.12); border-color: rgba(0, 212, 255, 0.3); color: #67E8F9;
  }
  .sp-manage-btn.view:hover {
    background: rgba(0, 212, 255, 0.25); border-color: rgba(0, 212, 255, 0.5); color: #FFF; box-shadow: 0 0 15px rgba(0,212,255,0.3);
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

  /* Modal Tabs */
  .sp-tab-nav {
    display: flex; gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 1.25rem; padding-bottom: 0.5rem;
  }
  .sp-tab-item {
    display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.85rem; border-radius: 10px;
    font-size: 0.8rem; font-weight: 700; color: #94A3B8; cursor: pointer; transition: all 0.2s;
    background: transparent; border: none;
  }
  .sp-tab-item.active {
    color: #FFF; background: rgba(124, 58, 237, 0.2); border: 1px solid rgba(124, 58, 237, 0.4);
  }
`;

export default function StudentsPage() {
  const [search, setSearch]         = useState('');
  const [premFilter, setPremFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [premModal, setPremModal]   = useState(null);
  const [expiryDate, setExpiryDate] = useState('');

  // User details view state
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [viewTab, setViewTab] = useState('overview');

  const { data: students, loading, refetch } = useApi(
    adminApi.getStudents,
    { 
      search: search || undefined, 
      is_premium: premFilter || undefined,
      role: roleFilter || undefined 
    },
    [search, premFilter, roleFilter]
  );

  // Fetch full details when user selected for view
  const { data: userDetails, loading: loadingDetails } = useApi(
    () => selectedUserForView ? adminApi.getStudentDetails(selectedUserForView.id) : null,
    null,
    [selectedUserForView?.id]
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
      d.setFullYear(d.getFullYear() + 1);
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

  const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  const details = userDetails ?? {};

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
                Manage student accounts, teacher roles, stage assignments, and view full activity tracking history.
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
                    <th>Enrolled Stage</th>
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

                        {/* Stage / Class */}
                        <td>
                          {s.class_name ? (
                            <span className="sp-stage-badge">
                              <Layers size={11} />
                              {s.class_name}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Not Selected</span>
                          )}
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

                        {/* Actions */}
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedUserForView(s); setViewTab('overview'); }}
                              className="sp-manage-btn view"
                              title="View complete history and activity details"
                            >
                              <Eye size={13} />
                              View
                            </button>
                            <button
                              onClick={() => openPremModal(s)}
                              className={`sp-manage-btn ${s.is_premium ? 'prem' : 'grant'}`}
                            >
                              <Crown size={13} />
                              {s.is_premium ? 'Plan' : 'VIP'}
                            </button>
                          </div>
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

      {/* ── User History & Intelligence Drawer Modal ── */}
      <Modal
        open={!!selectedUserForView}
        onClose={() => setSelectedUserForView(null)}
        title="User Intelligence & Complete Activity History"
        size="lg"
      >
        {selectedUserForView && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 border border-white/10 flex items-center justify-center text-lg font-black text-white">
                  {selectedUserForView.avatar_url ? (
                    <img src={selectedUserForView.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    selectedUserForView.full_name?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUserForView.full_name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedUserForView.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`sp-role-badge ${selectedUserForView.role === 'teacher' ? 'sp-role-teacher' : 'sp-role-student'}`}>
                  {selectedUserForView.role === 'teacher' ? 'Teacher' : 'Student'}
                </span>
                {selectedUserForView.class_name && (
                  <span className="sp-stage-badge">
                    <Layers size={11} /> {selectedUserForView.class_name}
                  </span>
                )}
                <span className={`sp-badge ${selectedUserForView.is_premium ? 'sp-badge-premium' : 'sp-badge-free'}`}>
                  {selectedUserForView.is_premium ? 'Premium VIP' : 'Free Tier'}
                </span>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="sp-tab-nav">
              <button
                className={`sp-tab-item ${viewTab === 'overview' ? 'active' : ''}`}
                onClick={() => setViewTab('overview')}
              >
                <Users size={14} /> Overview
              </button>
              <button
                className={`sp-tab-item ${viewTab === 'activity' ? 'active' : ''}`}
                onClick={() => setViewTab('activity')}
              >
                <Flame size={14} /> Streaks & Activity ({details.activityLogs?.length ?? 0})
              </button>
              <button
                className={`sp-tab-item ${viewTab === 'exams' ? 'active' : ''}`}
                onClick={() => setViewTab('exams')}
              >
                <Award size={14} /> Exam History ({details.examHistory?.length ?? 0})
              </button>
              <button
                className={`sp-tab-item ${viewTab === 'progress' ? 'active' : ''}`}
                onClick={() => setViewTab('progress')}
              >
                <BookOpen size={14} /> Learning Progress
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw size={24} className="animate-spin text-purple-400 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Loading user details and activity logs...</p>
              </div>
            ) : (
              <div>
                {/* ── TAB 1: OVERVIEW ── */}
                {viewTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Stage</p>
                        <p className="text-sm font-black text-cyan-400 mt-1">{details.user?.class_name ?? 'Not Selected'}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Curriculum</p>
                        <p className="text-sm font-black text-purple-300 mt-1">{details.user?.curriculum_name ?? 'Cambridge Primary'}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Streak</p>
                        <p className="text-sm font-black text-emerald-400 mt-1">{details.streak?.current_streak ?? 0} Days 🔥</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Active Days</p>
                        <p className="text-sm font-black text-amber-400 mt-1">{details.streak?.total_active_days ?? 0} Days</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Metadata</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Account ID:</span>
                          <span className="font-mono text-slate-200">{details.user?.id}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Joined Date:</span>
                          <span className="text-slate-200 font-semibold">{fmtDateTime(details.user?.created_at)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Onboarding Completed:</span>
                          <span className="text-slate-200 font-semibold">{details.user?.onboarded ? 'Yes ✓' : 'Pending ⏳'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">VIP Subscription Expiry:</span>
                          <span className="text-amber-300 font-semibold">{details.user?.premium_expires_at ? fmt(details.user?.premium_expires_at) : 'Lifetime / None'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: ACTIVITY & STREAKS ── */}
                {viewTab === 'activity' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <div>
                        <p className="text-xs font-bold text-purple-300">Streak Record</p>
                        <p className="text-xs text-slate-400 mt-0.5">Best Streak: {details.streak?.longest_streak ?? 0} Days · Last Active: {fmt(details.streak?.last_activity_date) ?? 'N/A'}</p>
                      </div>
                      <span className="text-lg font-black text-amber-400">🔥 {details.streak?.current_streak ?? 0} Days</span>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                      {details.activityLogs?.length === 0 ? (
                        <p className="text-center text-xs text-slate-500 py-6">No activity logs recorded yet.</p>
                      ) : (
                        details.activityLogs?.map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                            <div className="flex items-center gap-2.5">
                              <Activity size={14} className="text-cyan-400 shrink-0" />
                              <div>
                                <p className="font-bold text-white">{log.content_title || log.activity_type || 'User Activity'}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{log.activity_type}</p>
                              </div>
                            </div>
                            <span className="text-slate-400 font-mono text-[11px]">{fmtDateTime(log.created_at || log.activity_date)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ── TAB 3: EXAM HISTORY ── */}
                {viewTab === 'exams' && (
                  <div className="space-y-3">
                    {details.examHistory?.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-8">No exam submissions recorded for this user.</p>
                    ) : (
                      <div className="max-h-[320px] overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                              <th className="p-2">Exam Title</th>
                              <th className="p-2">Subject</th>
                              <th className="p-2">Score</th>
                              <th className="p-2">Result</th>
                              <th className="p-2 text-right">Submitted</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.examHistory?.map((ex) => (
                              <tr key={ex.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                                <td className="p-2 font-bold text-white">{ex.exam_title}</td>
                                <td className="p-2 text-slate-400">{ex.subject_name || 'General'}</td>
                                <td className="p-2 font-mono font-bold text-cyan-300">{ex.score} / {ex.total_marks} ({ex.percentage}%)</td>
                                <td className="p-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${ex.passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                                    {ex.passed ? 'Passed ✓' : 'Needs Practice'}
                                  </span>
                                </td>
                                <td className="p-2 text-right text-slate-400 font-mono text-[11px]">{fmtDateTime(ex.submitted_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 4: LEARNING PROGRESS ── */}
                {viewTab === 'progress' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Completed Resources</p>
                        <p className="text-base font-black text-cyan-400 mt-0.5">{details.progressSummary?.completed_resources ?? 0}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Topics Visited</p>
                        <p className="text-base font-black text-purple-400 mt-0.5">{details.progressSummary?.topics_visited ?? 0}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Videos Watched</p>
                        <p className="text-base font-black text-emerald-400 mt-0.5">{details.progressSummary?.videos_started ?? 0}</p>
                      </div>
                    </div>

                    <div className="max-h-[260px] overflow-y-auto space-y-2">
                      {details.resourceProgress?.length === 0 ? (
                        <p className="text-center text-xs text-slate-500 py-6">No learning progress logged yet.</p>
                      ) : (
                        details.resourceProgress?.map((res) => (
                          <div key={res.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                            <div>
                              <p className="font-bold text-white">{res.content_title || 'Learning Resource'}</p>
                              <p className="text-[10px] text-slate-400">{res.subject_name} · {res.topic_name}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${res.completed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                {res.completed ? 'Completed' : `Progress: ${res.video_progress ?? 0}%`}
                              </span>
                              <p className="text-[10px] text-slate-500 mt-0.5">{fmt(res.updated_at)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-5 pt-4 border-t border-slate-800">
          <Button variant="ghost" onClick={() => setSelectedUserForView(null)}>Close Intelligence View</Button>
        </div>
      </Modal>

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