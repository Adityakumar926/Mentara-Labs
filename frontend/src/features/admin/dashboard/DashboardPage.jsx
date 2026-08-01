import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, FileText, HelpCircle, Star, TrendingUp, Activity, Plus, 
  Search, ArrowUpRight, ShieldCheck, Layers, Zap, Clock, Sparkles, 
  BarChart3, CheckCircle2, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { adminApi } from '@/api/services';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  .db-root {
    --navy:     #080C16;
    --navy2:    #0D1322;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cyan-d:   #0284C7;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --rose:     #F43F5E;
    --muted:    rgba(245,240,232,0.55);
    --card-bg:  rgba(13, 19, 34, 0.7);
    --card-bdr: rgba(255, 255, 255, 0.08);
    font-family: 'Inter', sans-serif;
    color: var(--cream);
  }

  /* ── HERO BANNER ── */
  .db-hero {
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
  .db-hblob {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  }
  .db-hblob-1 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    top: -120px; right: -80px;
    animation: db-drift 12s ease-in-out infinite alternate;
  }
  .db-hblob-2 {
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%);
    bottom: -80px; left: 30%;
    animation: db-drift 16s ease-in-out infinite alternate-reverse;
  }
  @keyframes db-drift { from{transform:translate(0,0)} to{transform:translate(25px,-20px)} }
  @keyframes db-pulse-glow { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.4; transform:scale(0.85)} }

  .db-status-pill {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 0.35rem 0.95rem; border-radius: 50px;
    font-size: 0.72rem; font-weight: 700; color: #6EE7B7;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
  }
  .db-status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #10B981; box-shadow: 0 0 10px #10B981;
    animation: db-pulse-glow 2s infinite ease-in-out;
  }

  .db-hero-title {
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
  .db-hero-sub {
    font-size: 0.9rem; color: #94A3B8; font-weight: 500; max-width: 540px;
  }

  .db-quick-actions {
    display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;
  }
  .db-action-btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.65rem 1.15rem; border-radius: 14px;
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 700;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    text-decoration: none; border: 1px solid transparent;
  }
  .db-btn-primary {
    background: linear-gradient(135deg, #7C3AED 0%, #00D4FF 100%);
    color: #FFFFFF; border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 0 25px rgba(124, 58, 237, 0.35);
  }
  .db-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(0, 212, 255, 0.5);
    filter: brightness(1.1);
  }
  .db-btn-secondary {
    background: rgba(255, 255, 255, 0.04);
    color: #E2E8F0; border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
  }
  .db-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px); color: #FFFFFF;
  }

  /* ── STAT CARDS GRID ── */
  .db-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 1.1rem;
    margin-bottom: 1.75rem;
  }
  .db-stat-card {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 22px; padding: 1.35rem 1.4rem;
    overflow: hidden; backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  .db-stat-card:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
  }
  .db-stat-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.1rem;
  }
  .db-stat-icon {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid; transition: transform 0.3s ease;
  }
  .db-stat-card:hover .db-stat-icon {
    transform: scale(1.1) rotate(5deg);
  }
  .db-stat-badge {
    font-size: 0.68rem; font-weight: 700; padding: 0.25rem 0.65rem;
    border-radius: 50px; display: inline-flex; align-items: center; gap: 0.25rem;
  }
  .db-stat-value {
    font-family: 'Outfit', sans-serif;
    font-size: 2.1rem; font-weight: 900; line-height: 1;
    color: #FFFFFF; letter-spacing: -0.02em; margin-bottom: 0.3rem;
  }
  .db-stat-title {
    font-size: 0.78rem; color: #94A3B8; font-weight: 600; letter-spacing: 0.02em;
  }

  /* Stat Card Variant Styling */
  .db-stat-violet { border-color: rgba(124, 58, 237, 0.2); }
  .db-stat-violet:hover { border-color: rgba(124, 58, 237, 0.5); box-shadow: 0 15px 35px -10px rgba(124, 58, 237, 0.3); }
  .db-stat-violet .db-stat-icon { background: rgba(124, 58, 237, 0.15); border-color: rgba(124, 58, 237, 0.3); color: #C4B5FD; }
  .db-stat-violet .db-stat-badge { background: rgba(124, 58, 237, 0.15); color: #C4B5FD; border: 1px solid rgba(124, 58, 237, 0.3); }

  .db-stat-amber { border-color: rgba(245, 158, 11, 0.2); }
  .db-stat-amber:hover { border-color: rgba(245, 158, 11, 0.5); box-shadow: 0 15px 35px -10px rgba(245, 158, 11, 0.3); }
  .db-stat-amber .db-stat-icon { background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.3); color: #FCD34D; }
  .db-stat-amber .db-stat-badge { background: rgba(245, 158, 11, 0.15); color: #FCD34D; border: 1px solid rgba(245, 158, 11, 0.3); }

  .db-stat-green { border-color: rgba(16, 185, 129, 0.2); }
  .db-stat-green:hover { border-color: rgba(16, 185, 129, 0.5); box-shadow: 0 15px 35px -10px rgba(16, 185, 129, 0.3); }
  .db-stat-green .db-stat-icon { background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3); color: #6EE7B7; }
  .db-stat-green .db-stat-badge { background: rgba(16, 185, 129, 0.15); color: #6EE7B7; border: 1px solid rgba(16, 185, 129, 0.3); }

  .db-stat-cyan { border-color: rgba(0, 212, 255, 0.2); }
  .db-stat-cyan:hover { border-color: rgba(0, 212, 255, 0.5); box-shadow: 0 15px 35px -10px rgba(0, 212, 255, 0.3); }
  .db-stat-cyan .db-stat-icon { background: rgba(0, 212, 255, 0.15); border-color: rgba(0, 212, 255, 0.3); color: #38BDF8; }
  .db-stat-cyan .db-stat-badge { background: rgba(0, 212, 255, 0.15); color: #38BDF8; border: 1px solid rgba(0, 212, 255, 0.3); }

  /* ── GLASS CARD CONTAINER ── */
  .db-card {
    background: var(--card-bg);
    border: 1px solid var(--card-bdr);
    border-radius: 24px; padding: 1.65rem;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    transition: all 0.3s ease;
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
  }
  .db-card:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }
  .db-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
  }
  .db-card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.05rem; font-weight: 700; color: #FFFFFF;
    display: flex; align-items: center; gap: 0.6rem;
  }
  .db-card-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }

  /* ── CHARTS LAYOUT GRID ── */
  .db-charts-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.25rem;
    margin-bottom: 1.75rem;
  }
  @media (max-width: 1024px) { .db-charts-grid { grid-template-columns: 1fr; } }

  /* Custom Pie Legend */
  .db-pie-legend {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem;
    padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
  .db-pie-item {
    display: flex; align-items: center; gap: 0.5rem;
    background: rgba(255, 255, 255, 0.02); padding: 0.4rem 0.65rem;
    border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.04);
  }
  .db-pie-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .db-pie-text { font-size: 0.72rem; color: #CBD5E1; font-weight: 600; flex: 1; }
  .db-pie-val { font-size: 0.75rem; color: #FFFFFF; font-weight: 800; }

  /* ── SECONDARY CHARTS GRID ── */
  .db-sec-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.75rem;
  }
  @media (max-width: 900px) { .db-sec-grid { grid-template-columns: 1fr; } }

  /* ── RECENT EXAMS TABLE ── */
  .db-table-container { overflow-x: auto; margin-top: 0.5rem; }
  .db-table {
    width: 100%; border-collapse: separate; border-spacing: 0 0.4rem;
    font-size: 0.85rem;
  }
  .db-table th {
    text-align: left; padding: 0.6rem 1rem;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: #64748B; border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .db-table tbody tr {
    background: rgba(255, 255, 255, 0.015);
    border-radius: 12px;
    transition: all 0.2s ease;
  }
  .db-table tbody tr:hover {
    background: rgba(124, 58, 237, 0.08);
    transform: scale(1.002);
  }
  .db-table td {
    padding: 0.85rem 1rem; vertical-align: middle;
  }
  .db-table td:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
  .db-table td:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

  .db-exam-title {
    font-weight: 700; color: #FFFFFF; display: flex; align-items: center; gap: 0.6rem;
  }
  .db-exam-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2);
    display: flex; align-items: center; justify-content: center; color: #38BDF8; flex-shrink: 0;
  }

  /* Status Badges */
  .db-badge {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.25rem 0.75rem; border-radius: 50px;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
    border: 1px solid;
  }
  .db-badge-live     { background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.35); color: #6EE7B7; box-shadow: 0 0 10px rgba(16,185,129,0.15); }
  .db-badge-ended    { background: rgba(148, 163, 184, 0.1); border-color: rgba(148, 163, 184, 0.2); color: #94A3B8; }
  .db-badge-upcoming { background: rgba(124, 58, 237, 0.15); border-color: rgba(124, 58, 237, 0.35); color: #C4B5FD; }
  .db-badge-draft    { background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.3); color: #FCD34D; }

  /* Score Bar */
  .db-score-wrap { display: flex; align-items: center; gap: 0.6rem; min-width: 130px; }
  .db-score-track {
    flex: 1; height: 6px; border-radius: 6px;
    background: rgba(255, 255, 255, 0.08); overflow: hidden;
  }
  .db-score-fill { height: 100%; border-radius: 6px; transition: width 0.8s ease; }
  .db-score-val { font-size: 0.78rem; font-weight: 800; color: #FFFFFF; min-width: 42px; }

  /* Custom Recharts Tooltip */
  .db-tooltip {
    background: rgba(13, 19, 34, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px; padding: 0.75rem 1rem;
    backdrop-filter: blur(20px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  .db-tooltip-title { color: #94A3B8; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.4rem; }
  .db-tooltip-row { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.2rem; }
  .db-tooltip-dot { width: 8px; height: 8px; border-radius: 50%; }
  .db-tooltip-val { font-weight: 800; color: #FFFFFF; font-size: 0.85rem; }
`;

const PIE_COLORS = ['#10B981', '#7C3AED', '#00D4FF', '#F59E0B', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-title">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="db-tooltip-row">
          <div className="db-tooltip-dot" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
          <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>{p.name}:</span>
          <span className="db-tooltip-val">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { data, loading } = useApi(adminApi.getDashboard);
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = [
    { 
      icon: Users, 
      label: 'Active Students & Teachers', 
      value: data?.totalStudents ?? 0, 
      badge: '+14% this month',
      variant: 'violet' 
    },
    { 
      icon: Star, 
      label: 'Premium Subscribers', 
      value: data?.premiumUsers ?? 0, 
      badge: '98% Retention',
      variant: 'amber'  
    },
    { 
      icon: FileText, 
      label: 'Assessment Exams', 
      value: data?.examsByStatus?.reduce((a, e) => a + parseInt(e.count), 0) ?? 0, 
      badge: 'Live & Scheduled',
      variant: 'green' 
    },
    { 
      icon: HelpCircle, 
      label: 'Question Bank Pool', 
      value: data?.questionsByType?.reduce((a, q) => a + parseInt(q.count), 0) ?? 0, 
      badge: 'Cambridge Aligned',
      variant: 'cyan' 
    },
  ];

  const examStatusData = data?.examsByStatus?.map((e) => ({
    name: e.status.charAt(0).toUpperCase() + e.status.slice(1),
    value: parseInt(e.count),
  })) ?? [];

  const questionTypeData = data?.questionsByType?.map((q) => ({
    name: q.question_type.replace('_', ' ').toUpperCase(),
    count: parseInt(q.count),
  })) ?? [];

  const trendData = data?.weeklyActivity ?? [];

  const filteredExams = (data?.recentExams ?? []).filter(e => {
    if (filterStatus === 'all') return true;
    return e.status === filterStatus;
  });

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

        {/* ── HERO BANNER ── */}
        <motion.div
          className="db-hero"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="db-hblob db-hblob-1" />
          <div className="db-hblob db-hblob-2" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="db-status-pill">
                <span className="db-status-dot" />
                Mentara Admin • Live Operations
              </div>
              <h1 className="db-hero-title">Platform Intelligence</h1>
              <p className="db-hero-sub">
                Real-time curriculum metrics, student activity trends, and Cambridge assessment statistics.
              </p>
            </div>

            <div className="db-quick-actions">
              <Link to="/admin/exams" className="db-action-btn db-btn-primary">
                <Plus size={16} />
                Create Exam
              </Link>
              <Link to="/admin/questions" className="db-action-btn db-btn-secondary">
                <HelpCircle size={16} />
                Manage Questions
              </Link>
              <Link to="/admin/curriculum" className="db-action-btn db-btn-secondary">
                <Layers size={16} />
                Curriculum
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS GRID ── */}
        <div className="db-stats-grid">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                className={`db-stat-card db-stat-${s.variant}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className="db-stat-top">
                  <div className="db-stat-icon">
                    <Icon size={20} />
                  </div>
                  <span className="db-stat-badge">
                    <TrendingUp size={11} />
                    {s.badge}
                  </span>
                </div>
                <div className="db-stat-value">
                  {loading ? '...' : s.value.toLocaleString()}
                </div>
                <div className="db-stat-title">{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* ── MAIN CHARTS SECTION ── */}
        <div className="db-charts-grid">

          {/* Weekly Activity Area Chart */}
          <motion.div
            className="db-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <div className="db-card-header">
              <div>
                <div className="db-card-title">
                  <span className="db-card-dot" style={{ background: '#7C3AED', boxShadow: '0 0 10px #7C3AED' }} />
                  Platform Engagement Activity
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Daily active student sessions vs completed exam submissions</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
                  <Activity size={14} className="text-cyan-400" />
                  <span>7 Days Live</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="db-g-students" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="db-g-exams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D4FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day"
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124,58,237,0.3)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="students" stroke="#7C3AED" fill="url(#db-g-students)" strokeWidth={2.5} name="Active Students" dot={false} activeDot={{ r: 6, fill: '#7C3AED', stroke: '#FFFFFF', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="exams" stroke="#00D4FF" fill="url(#db-g-exams)" strokeWidth={2.5} name="Exams Submitted" dot={false} activeDot={{ r: 6, fill: '#00D4FF', stroke: '#FFFFFF', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend Chips */}
            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600 shadow-[0_0_8px_#7C3AED]" />
                <span className="text-xs font-semibold text-slate-300">Active Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00D4FF]" />
                <span className="text-xs font-semibold text-slate-300">Exams Submitted</span>
              </div>
            </div>
          </motion.div>

          {/* Exam Status Donut Chart */}
          <motion.div
            className="db-card flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.4 }}
          >
            <div>
              <div className="db-card-header">
                <div className="db-card-title">
                  <span className="db-card-dot" style={{ background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                  Exam Statuses
                </div>
                <BarChart3 size={15} className="text-slate-400" />
              </div>

              {loading ? (
                <div className="h-44 bg-slate-900/50 rounded-2xl animate-pulse" />
              ) : examStatusData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-slate-500 text-xs font-medium">No Exams Found</div>
              ) : (
                <div className="relative h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={examStatusData}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={72}
                        paddingAngle={5} dataKey="value"
                        strokeWidth={0}
                      >
                        {examStatusData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white leading-none">
                      {examStatusData.reduce((a, b) => a + b.value, 0)}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mt-1">Exams Total</span>
                  </div>
                </div>
              )}
            </div>

            <div className="db-pie-legend">
              {examStatusData.map((e, i) => (
                <div key={e.name} className="db-pie-item">
                  <div className="db-pie-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length], boxShadow: `0 0 6px ${PIE_COLORS[i % PIE_COLORS.length]}` }} />
                  <span className="db-pie-text">{e.name}</span>
                  <span className="db-pie-val">{e.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* ── SECONDARY CHARTS & BREAKDOWN ── */}
        <div className="db-sec-grid">
          {/* Question Type Breakdown */}
          <motion.div
            className="db-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.4 }}
          >
            <div className="db-card-header">
              <div className="db-card-title">
                <span className="db-card-dot" style={{ background: '#00D4FF', boxShadow: '0 0 10px #00D4FF' }} />
                Question Bank Types
              </div>
              <Link to="/admin/questions" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                Manage <ArrowUpRight size={13} />
              </Link>
            </div>

            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={questionTypeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" fill="#00D4FF" radius={[6, 6, 0, 0]} name="Questions">
                  {questionTypeData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick Cambridge Primary Highlights */}
          <motion.div
            className="db-card flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.4 }}
          >
            <div>
              <div className="db-card-header">
                <div className="db-card-title">
                  <span className="db-card-dot" style={{ background: '#F59E0B', boxShadow: '0 0 10px #F59E0B' }} />
                  Curriculum Coverage
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wide">
                  Stage 1 - Stage 5
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { title: 'Mathematics', status: 'Stage 1-5 Ready', color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30' },
                  { title: 'English Language', status: 'Stage 1-5 Ready', color: 'from-purple-500/20 to-indigo-500/10', border: 'border-purple-500/30' },
                  { title: 'Science Inquiry', status: 'Stage 1-5 Ready', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30' },
                  { title: 'Global Perspective', status: 'Stage 1-5 Active', color: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/30' },
                ].map((item) => (
                  <div key={item.title} className={`p-3 rounded-xl bg-gradient-to-br ${item.color} border ${item.border} flex flex-col justify-between`}>
                    <span className="text-xs font-black text-white">{item.title}</span>
                    <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1 mt-1">
                      <CheckCircle2 size={10} className="text-emerald-400" /> {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── RECENT EXAMS TABLE CARD ── */}
        <motion.div
          className="db-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56, duration: 0.4 }}
        >
          <div className="db-card-header">
            <div>
              <div className="db-card-title">
                <span className="db-card-dot" style={{ background: '#00D4FF', boxShadow: '0 0 10px #00D4FF' }} />
                Recent Assessment Exams
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Live student submissions, scores, and active schedules</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
              {['all', 'live', 'upcoming', 'ended', 'draft'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    filterStatus === st
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-slate-900/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="db-table-container">
              <table className="db-table">
                <thead>
                  <tr>
                    {['Exam Title', 'Status', 'Total Submissions', 'Average Score Performance', 'Actions'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredExams.map((e, i) => (
                      <motion.tr
                        key={e.title + i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td>
                          <div className="db-exam-title">
                            <div className="db-exam-icon">
                              <FileText size={15} />
                            </div>
                            <span>{e.title}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`db-badge ${badgeCls(e.status)}`}>
                            {e.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                            {e.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                            <Users size={14} className="text-slate-500" />
                            {e.submission_count} Submissions
                          </div>
                        </td>
                        <td>
                          {e.avg_score ? (
                            <div className="db-score-wrap">
                              <div className="db-score-track">
                                <div
                                  className="db-score-fill"
                                  style={{
                                    width: `${Math.min(parseFloat(e.avg_score), 100)}%`,
                                    background: scoreColor(e.avg_score),
                                    boxShadow: `0 0 10px ${scoreColor(e.avg_score)}`,
                                  }}
                                />
                              </div>
                              <span className="db-score-val">{parseFloat(e.avg_score).toFixed(1)}%</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs font-semibold">— No submissions</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => navigate('/admin/exams')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            View Details <ChevronRight size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 text-xs font-semibold">
                        No exams found matching filter "{filterStatus}"
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