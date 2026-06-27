import { Users, FileText, HelpCircle, Star, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { PageWrapper, Skeleton } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { adminApi } from '@/api/services';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  .db-root {
    --navy:     #0A0E1A;
    --navy2:    #0F1629;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --red:      #EF4444;
    --muted:    rgba(245,240,232,0.45);
    --card-bg:  rgba(255,255,255,0.04);
    --card-bdr: rgba(255,255,255,0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }
  .db-root *, .db-root *::before, .db-root *::after { box-sizing: border-box; }

  /* ── PAGE HEADER ── */
  .db-header {
    position: relative;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,212,255,0.06) 60%, rgba(10,14,26,0) 100%);
    border: 1px solid var(--card-bdr);
    border-radius: 28px;
    padding: 2rem 2.5rem;
    overflow: hidden;
    backdrop-filter: blur(16px);
    margin-bottom: 1.75rem;
  }
  .db-hblob {
    position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
  }
  .db-hblob-1 {
    width: 340px; height: 340px;
    background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
    top: -100px; right: -80px;
    animation: db-drift 11s ease-in-out infinite alternate;
  }
  .db-hblob-2 {
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%);
    bottom: -50px; left: 30%;
    animation: db-drift 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes db-drift { from{transform:translate(0,0)} to{transform:translate(22px,-16px)} }

  .db-eyebrow {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
    padding: 0.3rem 0.9rem; border-radius: 50px;
    font-size: 0.7rem; font-weight: 700; color: var(--lavender);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.75rem;
  }
  .db-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
    animation: db-blink 2s ease infinite;
  }
  @keyframes db-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  .db-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.5rem,3vw,2rem); font-weight: 700; letter-spacing: -0.025em;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.3rem;
  }
  .db-subtitle { font-size: 0.85rem; color: var(--muted); }

  /* ── STAT CARDS ── */
  .db-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.85rem;
    margin-bottom: 1.5rem;
  }
  .db-stat {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 22px; padding: 1.25rem 1.25rem 1.1rem;
    overflow: hidden; backdrop-filter: blur(12px);
    transition: border-color 0.3s, transform 0.25s, box-shadow 0.3s;
    cursor: default;
  }
  .db-stat:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 44px rgba(0,0,0,0.25);
  }
  .db-stat-glow {
    position: absolute; border-radius: 50%; filter: blur(40px); pointer-events: none;
    width: 100px; height: 100px; top: -20px; right: -20px; opacity: 0.5;
  }
  .db-stat-icon-wrap {
    width: 38px; height: 38px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 0.85rem;
    border: 1px solid;
  }
  .db-stat-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.65rem; font-weight: 700; line-height: 1;
    background: linear-gradient(135deg, var(--cream) 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.3rem;
  }
  .db-stat-label { font-size: 0.7rem; color: var(--muted); font-weight: 600; letter-spacing: 0.03em; }

  /* Stat color variants */
  .db-stat-violet .db-stat-glow { background: radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%); }
  .db-stat-violet .db-stat-icon-wrap { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.25); }
  .db-stat-violet:hover { border-color: rgba(124,58,237,0.4); box-shadow: 0 14px 44px rgba(124,58,237,0.15); }

  .db-stat-amber .db-stat-glow { background: radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 70%); }
  .db-stat-amber .db-stat-icon-wrap { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); }
  .db-stat-amber:hover { border-color: rgba(245,158,11,0.35); box-shadow: 0 14px 44px rgba(245,158,11,0.12); }

  .db-stat-green .db-stat-glow { background: radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%); }
  .db-stat-green .db-stat-icon-wrap { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); }
  .db-stat-green:hover { border-color: rgba(16,185,129,0.35); box-shadow: 0 14px 44px rgba(16,185,129,0.12); }

  .db-stat-cyan .db-stat-glow { background: radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%); }
  .db-stat-cyan .db-stat-icon-wrap { background: rgba(0,212,255,0.08); border-color: rgba(0,212,255,0.2); }
  .db-stat-cyan:hover { border-color: rgba(0,212,255,0.3); box-shadow: 0 14px 44px rgba(0,212,255,0.1); }

  /* ── GLASS CARD (shared container) ── */
  .db-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px; padding: 1.5rem;
    backdrop-filter: blur(12px);
    transition: border-color 0.3s;
  }
  .db-card:hover { border-color: rgba(124,58,237,0.18); }
  .db-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem; font-weight: 700; color: var(--cream);
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1.1rem;
  }
  .db-card-title-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  }

  /* ── CHARTS GRID ── */
  .db-charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 900px) { .db-charts-grid { grid-template-columns: 1fr; } }

  /* Pie legend */
  .db-pie-legend { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.9rem; }
  .db-pie-legend-item { display: flex; align-items: center; gap: 0.4rem; }
  .db-pie-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .db-pie-legend-label { font-size: 0.68rem; color: var(--muted); font-weight: 500; }

  /* ── TABLE ── */
  .db-table-wrap { overflow-x: auto; }
  .db-table {
    width: 100%; border-collapse: collapse;
    font-size: 0.78rem;
  }
  .db-table thead tr {
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .db-table th {
    text-align: left; padding: 0.5rem 1rem 0.75rem;
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--muted);
  }
  .db-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: background 0.2s;
  }
  .db-table tbody tr:last-child { border-bottom: none; }
  .db-table tbody tr:hover { background: rgba(124,58,237,0.05); }
  .db-table td { padding: 0.85rem 1rem; vertical-align: middle; }
  .db-table-name { font-weight: 600; color: var(--cream); }
  .db-table-muted { color: var(--muted); }

  /* Status badge */
  .db-badge {
    display: inline-flex; align-items: center;
    padding: 0.18rem 0.6rem; border-radius: 50px;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    border: 1px solid;
  }
  .db-badge-live     { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: #6EE7B7; }
  .db-badge-ended    { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: var(--muted); }
  .db-badge-upcoming { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.3); color: var(--lavender); }
  .db-badge-draft    { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }

  /* Score bar */
  .db-score-wrap { display: flex; align-items: center; gap: 0.55rem; }
  .db-score-track {
    flex: 1; height: 4px; border-radius: 4px;
    background: rgba(255,255,255,0.08); overflow: hidden; max-width: 80px;
  }
  .db-score-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
  .db-score-val { font-size: 0.72rem; font-weight: 600; color: var(--cream); white-space: nowrap; }

  /* Shimmer */
  .db-skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: db-shimmer 1.6s ease infinite;
    border-radius: 12px;
  }
  @keyframes db-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* Custom tooltip */
  .db-tooltip {
    background: rgba(15,22,41,0.95);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 0.6rem 0.85rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem; backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .db-tooltip-label { color: var(--muted); margin-bottom: 0.35rem; font-weight: 500; }
  .db-tooltip-row { display: flex; align-items: center; gap: 0.4rem; }
  .db-tooltip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .db-tooltip-val { font-weight: 700; color: var(--cream); }
`;

/* ── Colour map ── */
const STAT_COLORS = {
  violet: { glow: 'rgba(124,58,237,0.5)', icon: 'var(--violet-l)' },
  amber:  { glow: 'rgba(245,158,11,0.5)', icon: '#FCD34D' },
  green:  { glow: 'rgba(16,185,129,0.5)', icon: '#6EE7B7' },
  cyan:   { glow: 'rgba(0,212,255,0.4)',  icon: 'var(--cyan)' },
};

const PIE_COLORS = ['#7C3AED', '#00D4FF', '#10B981', '#F59E0B', '#EF4444'];

/* ── Custom recharts tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-label">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="db-tooltip-row">
          <div className="db-tooltip-dot" style={{ background: p.color }} />
          <span style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>{p.name}:</span>
          <span className="db-tooltip-val">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, variant, loading, index }) {
  const c = STAT_COLORS[variant] ?? STAT_COLORS.violet;
  return (
    <motion.div
      className={`db-stat db-stat-${variant}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="db-stat-glow" />
      <div className="db-stat-icon-wrap">
        <Icon size={17} style={{ color: c.icon }} />
      </div>
      {loading
        ? <div className="db-skel" style={{ height: 32, width: '60%', marginBottom: '0.3rem' }} />
        : <div className="db-stat-val">{value.toLocaleString()}</div>
      }
      <div className="db-stat-label">{label}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data, loading } = useApi(adminApi.getDashboard);

  const stats = [
    { icon: Users,         label: 'Total Students', value: data?.totalStudents ?? 0,  variant: 'violet' },
    { icon: Star,          label: 'Premium Users',  value: data?.premiumUsers ?? 0,   variant: 'amber'  },
    { icon: FileText,      label: 'Total Exams',    value: data?.examsByStatus?.reduce((a, e) => a + parseInt(e.count), 0) ?? 0, variant: 'green' },
    { icon: HelpCircle,    label: 'Questions',      value: data?.questionsByType?.reduce((a, q) => a + parseInt(q.count), 0) ?? 0, variant: 'cyan' },
  ];

  const examStatusData = data?.examsByStatus?.map((e) => ({
    name: e.status.charAt(0).toUpperCase() + e.status.slice(1),
    value: parseInt(e.count),
  })) ?? [];

  const questionTypeData = data?.questionsByType?.map((q) => ({
    name: q.question_type.replace('_', ' ').toUpperCase(),
    value: parseInt(q.count),
  })) ?? [];

  const trendData = data?.weeklyActivity ?? [];

  const badgeCls = (status) => {
    if (status === 'live')     return 'db-badge-live';
    if (status === 'ended')    return 'db-badge-ended';
    if (status === 'upcoming') return 'db-badge-upcoming';
    return 'db-badge-draft';
  };

  const scoreColor = (score) => {
    const s = parseFloat(score);
    if (s >= 75) return '#10B981';
    if (s >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="db-root">

        {/* ── Header ── */}
        <motion.div
          className="db-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="db-hblob db-hblob-1" />
          <div className="db-hblob db-hblob-2" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="db-eyebrow">
              <span className="db-eyebrow-dot" />
              Admin
            </div>
            <h1 className="db-title">Dashboard</h1>
            <p className="db-subtitle">Platform overview and key metrics</p>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <div className="db-stats-grid">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} loading={loading} index={i} />
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="db-charts-grid">

          {/* Weekly activity – spans 2 cols */}
          <motion.div
            className="db-card"
            style={{ gridColumn: 'span 2' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.35 }}
          >
            <div className="db-card-title">
              <span className="db-card-title-dot" style={{ background: 'var(--violet-l)', boxShadow: '0 0 6px var(--violet)' }} />
              Weekly Activity
              <Activity size={13} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="db-g-students" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="db-g-exams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D4FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day"
                  tick={{ fill: 'rgba(245,240,232,0.35)', fontSize: 10, fontFamily: 'Inter' }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'rgba(245,240,232,0.35)', fontSize: 10, fontFamily: 'Inter' }}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124,58,237,0.2)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="students" stroke="#7C3AED" fill="url(#db-g-students)" strokeWidth={2} name="Students" dot={false} activeDot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="exams"    stroke="#00D4FF" fill="url(#db-g-exams)"    strokeWidth={2} name="Exams"    dot={false} activeDot={{ r: 4, fill: '#00D4FF', strokeWidth: 0 }} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem' }}>
              {[['#7C3AED','Students'],['#00D4FF','Exams']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Exam status pie */}
          <motion.div
            className="db-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.35 }}
          >
            <div className="db-card-title">
              <span className="db-card-title-dot" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              Exams by Status
            </div>
            {loading ? (
              <div className="db-skel" style={{ height: 160, borderRadius: 16 }} />
            ) : examStatusData.length === 0 ? (
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.78rem' }}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={examStatusData}
                    cx="50%" cy="50%"
                    innerRadius={46} outerRadius={68}
                    paddingAngle={4} dataKey="value"
                    strokeWidth={0}
                  >
                    {examStatusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="db-pie-legend">
              {examStatusData.map((e, i) => (
                <div key={e.name} className="db-pie-legend-item">
                  <div className="db-pie-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length], boxShadow: `0 0 5px ${PIE_COLORS[i % PIE_COLORS.length]}` }} />
                  <span className="db-pie-legend-label">{e.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* ── Recent exams table ── */}
        <motion.div
          className="db-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
        >
          <div className="db-card-title">
            <span className="db-card-title-dot" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
            Recent Exams
            <TrendingUp size={13} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="db-skel" style={{ height: 44 }} />
              ))}
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    {['Exam', 'Status', 'Submissions', 'Avg Score'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentExams ?? []).map((e, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.05 }}
                    >
                      <td className="db-table-name">{e.title}</td>
                      <td>
                        <span className={`db-badge ${badgeCls(e.status)}`}>{e.status}</span>
                      </td>
                      <td className="db-table-muted">{e.submission_count}</td>
                      <td>
                        {e.avg_score ? (
                          <div className="db-score-wrap">
                            <div className="db-score-track">
                              <div
                                className="db-score-fill"
                                style={{
                                  width: `${Math.min(parseFloat(e.avg_score), 100)}%`,
                                  background: scoreColor(e.avg_score),
                                  boxShadow: `0 0 6px ${scoreColor(e.avg_score)}`,
                                }}
                              />
                            </div>
                            <span className="db-score-val">{parseFloat(e.avg_score).toFixed(1)}%</span>
                          </div>
                        ) : (
                          <span className="db-table-muted">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                  {!data?.recentExams?.length && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--muted)', fontSize: '0.8rem' }}>
                        No exams yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

      </div>
    </PageWrapper>
  );
}