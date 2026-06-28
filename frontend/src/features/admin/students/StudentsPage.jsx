import { useState } from 'react';
import { Search, Users, Star } from 'lucide-react';
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
    font-size: 0.82rem; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    backdrop-filter: blur(8px);
  }
  .sp-input::placeholder { color: var(--muted); }
  .sp-input:focus { border-color: rgba(124,58,237,0.45); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }

  .sp-select {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 14px;
    padding: 0.62rem 2rem 0.62rem 0.9rem;
    color: var(--cream); font-family: 'Inter', sans-serif;
    font-size: 0.82rem; outline: none; cursor: pointer;
    backdrop-filter: blur(8px);
    transition: border-color 0.2s;
    -webkit-appearance: none; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(245,240,232,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 0.7rem center;
    min-width: 160px;
  }
  .sp-select option { background: #0F1629; color: var(--cream); }
  .sp-select:focus { border-color: rgba(124,58,237,0.45); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }

  /* ── TABLE CARD ── */
  .sp-table-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px; overflow: hidden;
    backdrop-filter: blur(12px);
    transition: border-color 0.3s;
  }
  .sp-table-card:hover { border-color: rgba(124,58,237,0.15); }

  .sp-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }

  .sp-table thead tr {
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .sp-table th {
    text-align: left; padding: 0.85rem 1.25rem;
    font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--muted);
  }
  .sp-table th:last-child { text-align: right; }

  .sp-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.05);
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

  .sp-date { color: var(--muted); }

  /* star action */
  .sp-star-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 10px;
    background: transparent; border: none; cursor: pointer;
    transition: background 0.18s, color 0.18s;
  }
  .sp-star-btn.is-premium { color: #FCD34D; }
  .sp-star-btn:not(.is-premium) { color: var(--muted); }
  .sp-star-btn:hover { background: rgba(245,158,11,0.1); color: #FCD34D; }

  /* ── SHIMMER ── */
  .sp-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: sp-shimmer 1.6s ease infinite;
    border-radius: 12px;
  }
  @keyframes sp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── EMPTY ── */
  .sp-empty {
    display: flex; flex-direction: column; align-items: center; gap: 1rem;
    padding: 4rem 2rem; border: 1px dashed rgba(124,58,237,0.2);
    border-radius: 24px; background: rgba(124,58,237,0.02); text-align: center;
  }
  .sp-empty-icon {
    width: 60px; height: 60px; border-radius: 18px;
    background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .sp-empty-title { font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 700; color: var(--cream); }
  .sp-empty-desc  { font-size: 0.8rem; color: var(--muted); max-width: 260px; line-height: 1.55; }

  /* ── MODAL STUDENT CARD ── */
  .sp-modal-student {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.9rem 1rem; border-radius: 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 0.25rem;
  }
  .sp-modal-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem;
    font-weight: 700; color: var(--violet-l); flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .sp-hide-md { display: none !important; }
  }
  @media (max-width: 1024px) {
    .sp-hide-lg { display: none !important; }
  }
`;

export default function StudentsPage() {
  const [search, setSearch]         = useState('');
  const [premFilter, setPremFilter] = useState('');
  const [premModal, setPremModal]   = useState(null);
  const [expiryDate, setExpiryDate] = useState('');

  const { data: students, loading, refetch } = useApi(
    adminApi.getStudents,
    { search: search || undefined, is_premium: premFilter || undefined },
    [search, premFilter]
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
            <h1 className="sp-title">Students</h1>
            <p className="sp-subtitle">
              {loading ? 'Loading…' : `${list.length} result${list.length !== 1 ? 's' : ''}`}
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
          <select
            className="sp-select"
            value={premFilter}
            onChange={(e) => setPremFilter(e.target.value)}
          >
            <option value="">All Students</option>
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
            <p className="sp-empty-title">No students found</p>
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
                  <th>Student</th>
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
                      {/* Student */}
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
                            color: s.is_premium ? 'var(--amber)' : '#F5F0E8',
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