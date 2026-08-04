import { useState, useEffect, useMemo } from 'react';
import { 
  Save, AlertCircle, ShieldCheck, GraduationCap, Users, 
  DollarSign, Percent, Settings, Database, Cloud, Zap, CheckCircle2, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Button, Input } from '@/components/ui';
import { adminApi } from '@/api/services';
import toast from 'react-hot-toast';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  .set-root {
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
  .set-hero {
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
  .set-hblob {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  }
  .set-hblob-1 {
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    top: -120px; right: -80px;
    animation: set-drift 12s ease-in-out infinite alternate;
  }
  .set-hblob-2 {
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%);
    bottom: -60px; left: 30%;
    animation: set-drift 16s ease-in-out infinite alternate-reverse;
  }
  @keyframes set-drift { from{transform:translate(0,0)} to{transform:translate(25px,-20px)} }

  .set-status-pill {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.35);
    padding: 0.35rem 0.95rem; border-radius: 50px;
    font-size: 0.72rem; font-weight: 700; color: #C4B5FD;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
  }
  .set-status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #00D4FF; box-shadow: 0 0 10px #00D4FF;
    animation: set-blink 2s infinite ease-in-out;
  }
  @keyframes set-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .set-hero-title {
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
  .set-hero-sub {
    font-size: 0.9rem; color: #94A3B8; font-weight: 500; max-width: 540px;
  }

  /* ── STATS ROW ── */
  .set-stats-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem; margin-bottom: 1.75rem;
  }
  .set-stat-box {
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 18px; padding: 1.1rem 1.25rem; backdrop-filter: blur(20px);
    display: flex; align-items: center; gap: 1rem;
    transition: all 0.25s ease;
  }
  .set-stat-box:hover {
    border-color: rgba(255, 255, 255, 0.15); transform: translateY(-2px);
  }
  .set-stat-icon-wrap {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .set-stat-val { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 900; color: #FFF; line-height: 1; }
  .set-stat-lbl { font-size: 0.75rem; color: #94A3B8; font-weight: 600; margin-top: 0.2rem; }

  /* ── GLASS PANELS ── */
  .set-card {
    background: var(--card-bg); border: 1px solid var(--card-bdr);
    border-radius: 24px; padding: 1.75rem; backdrop-filter: blur(24px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }
  .set-card-teacher { border-color: rgba(124, 58, 237, 0.35); background: rgba(124, 58, 237, 0.05); }
  .set-card-student { border-color: rgba(0, 212, 255, 0.3); background: rgba(0, 212, 255, 0.04); }

  .set-card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.15rem; font-weight: 800; color: #FFFFFF;
    display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .set-role-pill {
    display: inline-flex; align-items: center; gap: 0.35rem;
    font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.05em; padding: 0.25rem 0.65rem; border-radius: 50px; border: 1px solid;
  }
  .set-role-teacher { background: rgba(124, 58, 237, 0.15); border-color: rgba(124, 58, 237, 0.35); color: #C4B5FD; }
  .set-role-student { background: rgba(0, 212, 255, 0.12); border-color: rgba(0, 212, 255, 0.3); color: #67E8F9; }

  .set-select-custom {
    width: 100%;
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 0.65rem 0.9rem;
    color: #FFFFFF; font-family: 'Inter', sans-serif;
    font-size: 0.85rem; font-weight: 600; outline: none;
  }

  .set-price-preview {
    background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12);
    border-radius: 14px; padding: 0.85rem 1rem; margin-top: 1rem;
    display: flex; align-items: center; justify-content: space-between;
  }

  .set-save-btn {
    display: inline-flex; align-items: center; gap: 0.55rem;
    background: linear-gradient(135deg, #7C3AED 0%, #00D4FF 100%);
    color: #FFFFFF; font-family: 'Outfit', sans-serif;
    font-size: 0.88rem; font-weight: 800;
    padding: 0.75rem 1.6rem; border-radius: 14px;
    cursor: pointer; border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 0 25px rgba(124, 58, 237, 0.35);
    transition: all 0.25s ease;
  }
  .set-save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(0, 212, 255, 0.5);
    filter: brightness(1.1);
  }
`;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Teacher pricing
  const [teacherPrice, setTeacherPrice] = useState('65');
  const [teacherDuration, setTeacherDuration] = useState('12');
  const [teacherCurrency, setTeacherCurrency] = useState('$');
  const [teacherBillingPeriod, setTeacherBillingPeriod] = useState('/ year');
  const [teacherDiscount, setTeacherDiscount] = useState('40');

  // Student pricing
  const [studentPrice, setStudentPrice] = useState('39');
  const [studentDiscount, setStudentDiscount] = useState('40');

  const [stats, setStats] = useState({ totalTeachers: 0, premiumTeachers: 0, totalStudents: 0, premiumStudents: 0 });

  useEffect(() => {
    Promise.all([
      adminApi.getSettings(),
      adminApi.getStudents()
    ])
      .then(([settingsRes, usersRes]) => {
        if (settingsRes.data.success) {
          const d = settingsRes.data.data;
          setTeacherPrice(d.premium_price || '65');
          setTeacherDuration(d.premium_duration_months || '12');
          setTeacherCurrency(d.premium_currency || '$');
          setTeacherBillingPeriod(d.premium_billing_period || '/ year');
          setTeacherDiscount(d.premium_discount || '40');
          setStudentPrice(d.student_premium_price || '39');
          setStudentDiscount(d.student_premium_discount || '40');
        }
        if (usersRes.data.success) {
          const all = usersRes.data.data ?? [];
          const teachers = all.filter(u => u.role === 'teacher');
          const students = all.filter(u => u.role === 'student');
          setStats({
            totalTeachers: teachers.length,
            premiumTeachers: teachers.filter(u => u.is_premium).length,
            totalStudents: students.length,
            premiumStudents: students.filter(u => u.is_premium).length,
          });
        }
      })
      .catch(() => toast.error('Failed to load configuration settings.'))
      .finally(() => setLoading(false));
  }, []);

  const validateNum = (val, label) => {
    if (!val || isNaN(val) || parseFloat(val) < 0) {
      toast.error(`${label} must be a valid positive number.`);
      return false;
    }
    return true;
  };
  const validatePct = (val, label) => {
    if (isNaN(val) || parseFloat(val) < 0 || parseFloat(val) > 100) {
      toast.error(`${label} must be between 0 and 100.`);
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateNum(teacherPrice, 'Teacher price')) return;
    if (!validateNum(teacherDuration, 'Duration')) return;
    if (!validatePct(teacherDiscount, 'Teacher discount')) return;
    if (!validateNum(studentPrice, 'Student price')) return;
    if (!validatePct(studentDiscount, 'Student discount')) return;

    setSaving(true);
    try {
      await Promise.all([
        adminApi.updateSetting({ key: 'premium_price',           value: String(teacherPrice) }),
        adminApi.updateSetting({ key: 'premium_duration_months', value: String(teacherDuration) }),
        adminApi.updateSetting({ key: 'premium_currency',        value: String(teacherCurrency) }),
        adminApi.updateSetting({ key: 'premium_billing_period',  value: String(teacherBillingPeriod) }),
        adminApi.updateSetting({ key: 'premium_discount',        value: String(teacherDiscount) }),
        adminApi.updateSetting({ key: 'student_premium_price',   value: String(studentPrice) }),
        adminApi.updateSetting({ key: 'student_premium_discount',value: String(studentDiscount) }),
      ]);
      toast.success('System settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  // Price calculations
  const calcTeacherFinal = useMemo(() => {
    const p = parseFloat(teacherPrice) || 0;
    const d = parseFloat(teacherDiscount) || 0;
    return (p * (1 - d / 100)).toFixed(2);
  }, [teacherPrice, teacherDiscount]);

  const calcStudentFinal = useMemo(() => {
    const p = parseFloat(studentPrice) || 0;
    const d = parseFloat(studentDiscount) || 0;
    return (p * (1 - d / 100)).toFixed(2);
  }, [studentPrice, studentDiscount]);

  if (loading) {
    return (
      <PageWrapper className="p-6">
        <div className="flex items-center justify-center h-64 text-purple-300 font-bold">
          Loading System Settings...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="p-6">
      <style>{CSS}</style>
      <div className="set-root max-w-6xl mx-auto">

        {/* ── HERO BANNER ── */}
        <motion.div
          className="set-hero"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="set-hblob set-hblob-1" />
          <div className="set-hblob set-hblob-2" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="set-status-pill">
                <span className="set-status-dot" />
                System Configurations & Pricing
              </div>
              <h1 className="set-hero-title">Platform Settings</h1>
              <p className="set-hero-sub">
                Configure teacher and student subscription tiers, pricing discounts, and system security parameters.
              </p>
            </div>

            <button className="set-save-btn" onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Configurations'}
            </button>
          </div>
        </motion.div>

        {/* ── METRIC STATS ROW ── */}
        <div className="set-stats-grid">
          <div className="set-stat-box">
            <div className="set-stat-icon-wrap bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="set-stat-val">{stats.premiumTeachers} / {stats.totalTeachers}</div>
              <div className="set-stat-lbl">Premium Teachers</div>
            </div>
          </div>

          <div className="set-stat-box">
            <div className="set-stat-icon-wrap bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <Users size={20} />
            </div>
            <div>
              <div className="set-stat-val">{stats.premiumStudents} / {stats.totalStudents}</div>
              <div className="set-stat-lbl">Premium Students</div>
            </div>
          </div>

          <div className="set-stat-box">
            <div className="set-stat-icon-wrap bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="set-stat-val">Active</div>
              <div className="set-stat-lbl">Cloud Storage & Video</div>
            </div>
          </div>
        </div>

        {/* ── TWO COLUMN CONFIGURATION PANELS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2 COLUMNS: PRICING FORMS */}
          <div className="lg:col-span-2 space-y-6">

            {/* Teacher Pricing Card */}
            <motion.div
              className="set-card set-card-teacher"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="set-card-title">
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-purple-400" />
                  <span>Teacher Subscription Tier</span>
                </div>
                <span className="set-role-pill set-role-teacher">Teacher Plan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Subscription Price"
                  type="number"
                  placeholder="e.g. 65"
                  value={teacherPrice}
                  onChange={(e) => setTeacherPrice(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Currency Symbol</label>
                  <select
                    className="set-select-custom"
                    value={teacherCurrency}
                    onChange={(e) => setTeacherCurrency(e.target.value)}
                  >
                    <option value="$">$ (USD)</option>
                    <option value="₹">₹ (INR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="€">€ (EUR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Billing Interval</label>
                  <select
                    className="set-select-custom"
                    value={teacherBillingPeriod}
                    onChange={(e) => setTeacherBillingPeriod(e.target.value)}
                  >
                    <option value="/ month">/ month</option>
                    <option value="/ year">/ year</option>
                    <option value="one-time">One-time payment</option>
                  </select>
                </div>

                <Input
                  label="Discount Percentage (%)"
                  type="number"
                  placeholder="e.g. 40"
                  value={teacherDiscount}
                  onChange={(e) => setTeacherDiscount(e.target.value)}
                />
              </div>

              {/* Live Calculator Preview */}
              <div className="set-price-preview">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Percent size={14} className="text-purple-400" />
                  <span>Calculated Teacher Offer:</span>
                </div>
                <div className="text-sm font-black text-purple-300">
                  <span className="line-through text-slate-500 mr-2">{teacherCurrency}{teacherPrice}</span>
                  {teacherCurrency}{calcTeacherFinal} {teacherBillingPeriod} ({teacherDiscount}% OFF)
                </div>
              </div>
            </motion.div>

            {/* Student Pricing Card */}
            <motion.div
              className="set-card set-card-student"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="set-card-title">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-cyan-400" />
                  <span>Student Subscription Tier</span>
                </div>
                <span className="set-role-pill set-role-student">Student Plan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Student Price"
                  type="number"
                  placeholder="e.g. 39"
                  value={studentPrice}
                  onChange={(e) => setStudentPrice(e.target.value)}
                />

                <Input
                  label="Student Discount (%)"
                  type="number"
                  placeholder="e.g. 40"
                  value={studentDiscount}
                  onChange={(e) => setStudentDiscount(e.target.value)}
                />
              </div>

              {/* Live Calculator Preview */}
              <div className="set-price-preview">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Percent size={14} className="text-cyan-400" />
                  <span>Calculated Student Offer:</span>
                </div>
                <div className="text-sm font-black text-cyan-300">
                  <span className="line-through text-slate-500 mr-2">{teacherCurrency}{studentPrice}</span>
                  {teacherCurrency}{calcStudentFinal} {teacherBillingPeriod} ({studentDiscount}% OFF)
                </div>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: SECURITY & INTEGRATION STATUS */}
          <div className="space-y-6">

            <motion.div
              className="set-card"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h4 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                System Integration Status
              </h4>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Cloud size={14} className="text-cyan-400" /> Cloud Storage
                  </span>
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap size={14} className="text-purple-400" /> AI Tutor Sockets
                  </span>
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Live
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Database size={14} className="text-amber-400" /> PostgreSQL DB
                  </span>
                  <span className="text-white font-extrabold">Connected</span>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 leading-relaxed">
                Changes saved here take effect immediately across all landing pages and student checkout flows.
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </PageWrapper>
  );
}
