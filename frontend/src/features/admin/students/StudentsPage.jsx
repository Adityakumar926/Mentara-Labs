import { useState } from 'react';
import { Search, Users, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Badge, Skeleton, EmptyState, Modal, Input, Button, ConfirmDialog } from '@/components/ui';
import { useApi, useMutation } from '@/hooks/useApi';
import { adminApi } from '@/api/services';
import clsx from 'clsx';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .sp-root {
    --navy:     var(--local-navy, #0A0E1A);
    --navy2:    var(--local-navy2, #0F1629);
    --violet:   #7C3AED;
    --violet-l: var(--local-violet-l, #9D6FEF);
    --cyan:     var(--local-cyan, #00D4FF);
    --cream:    var(--local-cream, #F5F0E8);
    --lavender: var(--local-lavender, #C4B5FD);
    --green:    var(--local-green, #10B981);
    --amber:    var(--local-amber, #F59E0B);
    --red:      var(--local-red, #EF4444);
    --muted:    var(--local-muted, rgba(245,240,232,0.45));
    --card-bg:  var(--local-card-bg, rgba(255,255,255,0.04));
    --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.08));
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .sp-root *, .sp-root *::before, .sp-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .sp-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 28px;
    padding: 2rem 2.5rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.25rem;
  }
  .sp-hblob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .sp-hblob-1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    top: -100px; right: -60px;
    animation: sp-drift 12s ease-in-out infinite alternate;
  }
  .sp-hblob-2 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%);
    bottom: -50px; left: 30%;
    animation: sp-drift 16s ease-in-out infinite alternate-reverse;
  }
  @keyframes sp-drift { from{transform:translate(0,0)} to{transform:translate(22px,-16px)} }

  .sp-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.3rem 0.9rem; border-radius: 50px;
    font-size: 0.7rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.6rem;
  }
  .sp-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: sp-blink 2s ease infinite;
  }
  @keyframes sp-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  .sp-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.4rem, 2.5vw, 1.85rem); font-weight: 700; letter-spacing: -0.025em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.2rem; line-height: 1.15;
  }
  .sp-subtitle { font-size: 0.83rem; color: var(--muted); }

  /* ── FILTER BAR ── */
  .sp-filters {
    display: flex; flex-wrap: wrap; gap: 0.75rem;
    margin-bottom: 1.25rem;
    align-items: center;
  }
  .sp-search-wrap {
    position: relative; flex: 1; min-width: 220px;
  }
  .sp-search-icon {
    position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%);
    color: var(--muted); pointer-events: none;
  }
  .sp-input {
    width: 100%;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    padding: 0.62rem 0.9rem 0.62rem 2.4rem;
    color: var(--cream); font-family: 'Inter', sans-serif;
    font-size: 0.82rem; outline: none; transition: all 0.2s;
  }
  .sp-input:focus { border-color: var(--violet); box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }

  .sp-select {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    padding: 0.62rem 2rem 0.62rem 0.9rem;
    color: var(--cream); font-family: 'Inter', sans-serif;
    font-size: 0.82rem; outline: none; cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(245,240,232,0.45)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.8rem center;
    background-size: 0.85rem;
    min-width: 150px;
  }
  .sp-select option { background: var(--navy2); color: var(--cream); }

  /* ── TABLE CARD ── */
  .sp-table-card {
    background: rgba(15,22,41,0.5);
    border: 1px solid var(--card-bdr);
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(20px);
  }
  .sp-table { width: 100%; border-collapse: collapse; text-align: left; }
  .sp-table th {
    padding: 1.1rem 1.25rem; font-size: 0.72rem; font-weight: 700;
    color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em;
    border-bottom: 1px solid var(--card-bdr);
  }
  .sp-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.02);
    transition: background 0.18s;
  }
  .sp-table tbody tr:last-child { border-bottom: none; }
  .sp-table tbody tr:hover { background: rgba(124,58,237,0.05); }
  .sp-table td { padding: 0.9rem 1.25rem; vertical-align: middle; }

  /* avatar */
  .sp-avatar {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    background: rgba(124,58,237,0.15);
    border: 1px solid rgba(124,58,237,0.3);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem; font-weight: 700; color: var(--violet-l);
  }
  .sp-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .sp-student-name { font-weight: 600; color: var(--cream); font-size: 0.82rem; }
  .sp-student-email { color: var(--muted); font-size: 0.72rem; margin-top: 0.05rem; }

  /* plan badge */
  .sp-badge {
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.2rem 0.6rem; border-radius: 50px;
    font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.04em; text-transform: uppercase; border: 1px solid;
  }
  .sp-badge-premium { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); color: #FCD34D; }
  .sp-badge-free    { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: var(--muted); }

  /* role badge */
  .sp-role-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .sp-role-teacher {
    background: rgba(124,58,237,0.12);
    color: #C4B5FD;
    border: 1px solid rgba(124,58,237,0.25);
  }
  .sp-role-student {
    background: rgba(6,182,212,0.12);
    color: #67E8F9;
    border: 1px solid rgba(6,182,212,0.25);
  }

  html.light .sp-student-name, .light .sp-student-name { color: #0F172A; }
  html.light .sp-empty-title, .light .sp-empty-title { color: #0F172A; }
  html.light .sp-student-email, .light .sp-student-email,
  html.light .sp-empty-desc, .light .sp-empty-desc,
  html.light .sp-subtitle, .light .sp-subtitle,
  html.light .sp-date, .light .sp-date { color: #475569; }
  html.light .sp-modal-student .sp-student-name, .light .sp-modal-student .sp-student-name { color: #0F172A; }
  html.light .sp-modal-student .sp-student-email, .light .sp-modal-student .sp-student-email { color: #475569; }
  html.light .text-text-muted, .light .text-text-muted { color: #475569 !important; }
  html.light [data-testid="modal"] h2, .light .modal h2, html.light .modal-title, .light .modal-title { color: #0F172A !important; }
  html.light .sp-table td button, .light .sp-table td button { background: #F1F5F9 !important; border-color: #CBD5E1 !important; }
  html.light .sp-table td button:hover, .light .sp-table td button:hover { background: #E2E8F0 !important; }

  /* ── LIGHT THEME COMPATIBILITY ── */
  html.light .sp-root, .light .sp-root {
    --cream: #0F172A;
    --muted: #475569;
    --card-bg: #FFFFFF;
    --card-bdr: #CBD5E1;
  }
  html.light .sp-input, .light .sp-input,
  html.light .sp-select, .light .sp-select {
    background: #FFFFFF;
    color: #0F172A;
    border-color: #CBD5E1;
  }
  html.light .sp-select option, .light .sp-select option { background: #FFFFFF; color: #0F172A; }
  html.light .sp-table-card, .light .sp-table-card {
    background: #FFFFFF;
    border-color: #CBD5E1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }
  html.light .sp-table thead tr, .light .sp-table thead tr { border-bottom: 1px solid #E2E8F0; }
  html.light .sp-table tbody tr, .light .sp-table tbody tr { border-bottom: 1px solid #F1F5F9; }
  html.light .sp-table tbody tr:hover, .light .sp-table tbody tr:hover { background: #F8FAFC; }
  html.light .sp-avatar, .light .sp-avatar { background: rgba(124, 58, 237, 0.08); border-color: rgba(124, 58, 237, 0.2); }
  html.light .sp-badge-free, .light .sp-badge-free { background: #F1F5F9; border-color: #E2E8F0; }
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

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="sp-root">

        {/* ── Header ── */}
        <motion.div
          className="sp-header"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="sp-hblob sp-hblob-1" />
          <div className="sp-hblob sp-hblob-2" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="sp-eyebrow">
              <span className="sp-eyebrow-dot" />
              Admin
            </div>
            <h1 className="sp-title">Users</h1>
            <p className="sp-subtitle">
              {loading ? 'Loading…' : `${list.length} user${list.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          className="sp-filters"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.32 }}
        >
          <div className="sp-search-wrap">
            <Search size={14} className="sp-search-icon" />
            <input
              className="sp-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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
            <option value="true">Premium only</option>
            <option value="false">Free only</option>
          </select>
        </motion.div>

        {/* ── Table ── */}
        {loading ? (
          <motion.div
            className="sp-table-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
          >
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="sp-skel" style={{ height: 50 }} />
              ))}
            </div>
          </motion.div>
        ) : list.length === 0 ? (
          <motion.div
            className="sp-empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="sp-empty-icon">
              <Users size={26} style={{ color: 'var(--violet-l)' }} />
            </div>
            <p className="sp-empty-title">No users found</p>
            <p className="sp-empty-desc">Try adjusting your search or filters.</p>
          </motion.div>
        ) : (
          <motion.div
            className="sp-table-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.35 }}
          >
            <table className="sp-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th className="sp-hide-md">Joined</th>
                  <th>Plan</th>
                  <th className="sp-hide-lg">Expires</th>
                  <th style={{ textAlign: 'right' }}>Manage</th>
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
                      transition={{ delay: i * 0.03, duration: 0.22 }}
                    >
                      {/* Name/Email */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="sp-avatar">
                            {s.avatar_url
                              ? <img src={s.avatar_url} alt="" />
                              : s.full_name?.[0]?.toUpperCase()
                            }
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p className="sp-student-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.full_name}</p>
                            <p className="sp-student-email" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`sp-role-badge ${s.role === 'teacher' ? 'sp-role-teacher' : 'sp-role-student'}`}>
                          {s.role === 'teacher' ? 'Teacher' : 'Student'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="sp-date sp-hide-md">{fmt(s.created_at) ?? '—'}</td>

                      {/* Plan */}
                      <td>
                        <span className={`sp-badge ${s.is_premium ? 'sp-badge-premium' : 'sp-badge-free'}`}>
                          {s.is_premium ? '⭐ Premium' : 'Free'}
                        </span>
                      </td>

                      {/* Expires */}
                      <td className="sp-date sp-hide-lg">
                        {s.is_premium && s.premium_expires_at ? fmt(s.premium_expires_at) : '—'}
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => openPremModal(s)}
                          title={s.is_premium ? 'Manage premium plan' : 'Grant premium plan'}
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: s.is_premium ? 'var(--amber)' : 'var(--cream)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = s.is_premium ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.borderColor = s.is_premium ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          }}
                        >
                          {s.is_premium ? 'Manage Plan' : 'Grant Premium'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}

      </div>

      {/* ── Premium toggle modal ── */}
      <Modal
        open={!!premModal}
        onClose={() => setPremModal(null)}
        title={premModal?.is_premium ? 'Manage Premium Plan' : 'Grant Premium'}
        size="sm"
      >
        <div className="space-y-4">
          <div className="sp-modal-student">
            <div className="sp-modal-avatar">
              {premModal?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="sp-student-name">{premModal?.full_name}</p>
              <p className="sp-student-email">{premModal?.email}</p>
            </div>
          </div>

          <Input
            label="Premium Expiry Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          <p className="text-xs text-text-muted">
            {premModal?.is_premium
              ? 'Modify the expiry date above, or click Revoke to remove their premium status entirely. Leave blank for lifetime access.'
              : 'This will grant them access to all premium content. Expiry is optional; leave blank for lifetime access.'}
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-border">
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
                Revoke
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
              Grant Premium
            </Button>
          )}
        </div>
      </Modal>
    </PageWrapper>
  );
}