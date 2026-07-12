import { useState, useEffect } from 'react';
import { Save, AlertCircle, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper, Button, Input } from '@/components/ui';
import { adminApi } from '@/api/services';
import toast from 'react-hot-toast';

const CSS = `
  .set-root {
    padding: 2rem;
    max-width: 1100px;
    margin: 0 auto;
  }
  
  .set-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .set-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }
  
  .set-subtitle {
    font-size: 0.85rem;
    color: var(--muted);
    margin-top: 0.35rem;
  }

  .set-main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 900px) {
    .set-main-grid {
      grid-template-columns: 1fr 320px;
    }
  }

  .set-forms-stack {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Glassmorphic settings panel */
  .set-card {
    background: rgba(15, 22, 41, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 2rem;
    backdrop-filter: blur(20px);
  }

  .set-card-teacher {
    border-color: rgba(124, 58, 237, 0.3);
    background: rgba(124, 58, 237, 0.04);
  }

  .set-card-student {
    border-color: rgba(6, 182, 212, 0.3);
    background: rgba(6, 182, 212, 0.04);
  }
  
  .set-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .set-role-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.2rem 0.6rem;
    border-radius: 50px;
  }
  .set-role-badge-teacher {
    background: rgba(124, 58, 237, 0.15);
    border: 1px solid rgba(124, 58, 237, 0.35);
    color: #C4B5FD;
  }
  .set-role-badge-student {
    background: rgba(6, 182, 212, 0.12);
    border: 1px solid rgba(6, 182, 212, 0.3);
    color: #00D4FF;
  }

  .set-row {
    margin-bottom: 1.5rem;
  }

  .set-info-box {
    display: flex;
    gap: 0.75rem;
    background: rgba(124, 58, 237, 0.08);
    border: 1px solid rgba(124, 58, 237, 0.25);
    padding: 1rem;
    border-radius: 16px;
    margin-top: 1.5rem;
    font-size: 0.78rem;
    color: #C4B5FD;
    line-height: 1.5;
  }

  .set-info-box-cyan {
    background: rgba(6, 182, 212, 0.06);
    border-color: rgba(6, 182, 212, 0.2);
    color: #67E8F9;
  }

  /* Right-hand side stats widget */
  .set-stat-box {
    background: linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(0,212,255,0.05) 100%);
    border: 1px solid rgba(124, 58, 237, 0.2);
    border-radius: 24px;
    padding: 1.5rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .set-stat-box-cyan {
    background: linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(124,58,237,0.05) 100%);
    border-color: rgba(6, 182, 212, 0.2);
  }
  .set-stat-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2.2rem;
    font-weight: 700;
    color: #fff;
    margin-top: 0.5rem;
  }
  .set-stat-label {
    font-size: 0.75rem;
    color: var(--muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.25rem;
  }

  /* Select styling */
  .set-select {
    width: 100%;
    padding: 0.625rem;
    border-radius: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--local-card-bdr, rgba(255,255,255,0.08));
    color: var(--cream, #f4f4f5);
    font-size: 0.85rem;
  }

  /* ── LIGHT THEME COMPATIBILITY ── */
  html.light .set-title, .light .set-title { color: #0F172A; }
  html.light .set-card, .light .set-card {
    background: #FFFFFF;
    border-color: #CBD5E1;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }
  html.light .set-card-teacher, .light .set-card-teacher { border-color: rgba(124,58,237,0.25); background: rgba(124,58,237,0.03); }
  html.light .set-card-student, .light .set-card-student { border-color: rgba(6,182,212,0.2); background: rgba(6,182,212,0.03); }
  html.light .set-card-title, .light .set-card-title { color: #0F172A; }
  html.light .set-info-box, .light .set-info-box { background: rgba(124,58,237,0.05); border-color: rgba(124,58,237,0.2); color: #4F46E5; }
  html.light .set-info-box-cyan, .light .set-info-box-cyan { background: rgba(6,182,212,0.05); border-color: rgba(6,182,212,0.2); color: #0E7490; }
  html.light .set-stat-box, .light .set-stat-box { background: linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(0,212,255,0.04) 100%); border-color: rgba(124,58,237,0.15); }
  html.light .set-stat-box-cyan, .light .set-stat-box-cyan { background: linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(124,58,237,0.04) 100%); border-color: rgba(6,182,212,0.15); }
  html.light .set-stat-val, .light .set-stat-val { color: #0F172A; }
  html.light .set-subtitle, .light .set-subtitle { color: #475569; }
  html.light .set-stat-box p, .light .set-stat-box p { color: #475569 !important; }
  html.light .set-stat-label, .light .set-stat-label { color: #475569; }
  html.light .set-card form label, .light .set-card form label { color: #334155; }
  html.light .set-card form input, .light .set-card form input { background: #FFFFFF; color: #0F172A; border-color: #CBD5E1; }
  html.light .set-card form input:focus, .light .set-card form input:focus { border-color: #7C3AED; box-shadow: 0 0 0 2px rgba(124,58,237,0.15); }
  html.light .set-select, .light .set-select { background: #fff; color: #0F172A; border-color: #CBD5E1; }
`;

const selectStyle = {
  width: '100%',
  padding: '0.625rem',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--local-card-bdr, rgba(255,255,255,0.08))',
  color: 'var(--cream, #f4f4f5)',
  fontSize: '0.85rem',
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Teacher pricing
  const [teacherPrice, setTeacherPrice] = useState('65');
  const [teacherDuration, setTeacherDuration] = useState('1');
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
          setTeacherDuration(d.premium_duration_months || '1');
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
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="set-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ color: '#C4B5FD', fontFamily: 'Space Grotesk', fontSize: '1rem' }}>Loading Configurations...</div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <style>{CSS}</style>
      <div className="set-root">

        {/* Header */}
        <div className="set-header">
          <div>
            <h1 className="set-title">System Settings</h1>
            <p className="set-subtitle">Manage pricing configurations for Teachers and Students separately.</p>
          </div>
        </div>

        <div className="set-main-grid">
          {/* LEFT: FORMS */}
          <div className="set-forms-stack">

            {/* ── Teacher Pricing ── */}
            <motion.div
              className="set-card set-card-teacher"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="set-card-title">
                <GraduationCap size={18} color="#A78BFA" />
                Teacher Pricing
                <span className="set-role-badge set-role-badge-teacher">Teacher Plan</span>
              </h3>

              <form onSubmit={handleSave}>
                <div className="set-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Subscription Price"
                    type="number"
                    placeholder="e.g. 65"
                    value={teacherPrice}
                    onChange={(e) => setTeacherPrice(e.target.value)}
                  />
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Currency Symbol</label>
                    <select value={teacherCurrency} onChange={(e) => setTeacherCurrency(e.target.value)} style={selectStyle}>
                      <option style={{ background: '#0F1629', color: '#fff' }} value="$">$ (USD)</option>
                      <option style={{ background: '#0F1629', color: '#fff' }} value="₹">₹ (INR)</option>
                      <option style={{ background: '#0F1629', color: '#fff' }} value="£">£ (GBP)</option>
                      <option style={{ background: '#0F1629', color: '#fff' }} value="€">€ (EUR)</option>
                    </select>
                  </div>
                </div>

                <div className="set-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Duration (months/years)"
                    type="number"
                    placeholder="e.g. 1"
                    value={teacherDuration}
                    onChange={(e) => setTeacherDuration(e.target.value)}
                  />
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Billing Period</label>
                    <select value={teacherBillingPeriod} onChange={(e) => setTeacherBillingPeriod(e.target.value)} style={selectStyle}>
                      <option style={{ background: '#0F1629', color: '#fff' }} value="/ month">/ month</option>
                      <option style={{ background: '#0F1629', color: '#fff' }} value="/ year">/ year</option>
                      <option style={{ background: '#0F1629', color: '#fff' }} value="one-time">One-time payment</option>
                    </select>
                  </div>
                </div>

                <div className="set-row">
                  <Input
                    label="Discount Percentage (%)"
                    type="number"
                    placeholder="e.g. 40 for 40% off"
                    value={teacherDiscount}
                    onChange={(e) => setTeacherDiscount(e.target.value)}
                  />
                </div>

                <div className="set-info-box">
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    Teacher pricing shows on the landing page <strong>Teacher Pricing</strong> tab and the upgrade page for teacher accounts.
                  </div>
                </div>
              </form>
            </motion.div>

            {/* ── Student Pricing ── */}
            <motion.div
              className="set-card set-card-student"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
            >
              <h3 className="set-card-title">
                <Users size={18} color="#22D3EE" />
                Student Pricing
                <span className="set-role-badge set-role-badge-student">Student Plan</span>
              </h3>

              <div className="set-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Student Subscription Price"
                  type="number"
                  placeholder="e.g. 39"
                  value={studentPrice}
                  onChange={(e) => setStudentPrice(e.target.value)}
                />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                    Uses the same currency & billing period as teacher pricing above.
                  </p>
                </div>
              </div>

              <div className="set-row">
                <Input
                  label="Student Discount Percentage (%)"
                  type="number"
                  placeholder="e.g. 40 for 40% off"
                  value={studentDiscount}
                  onChange={(e) => setStudentDiscount(e.target.value)}
                />
              </div>

              <div className="set-info-box set-info-box-cyan">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  Student pricing shows on the landing page <strong>Student Pricing</strong> tab and the upgrade page for student accounts. Discounted price = original × (1 – discount%).
                </div>
              </div>

              {/* Save button shared by both sections */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <Button
                  variant="primary"
                  type="button"
                  loading={saving}
                  disabled={saving}
                  onClick={handleSave}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={14} /> Save All Settings
                </Button>
              </div>
            </motion.div>

          </div>

          {/* RIGHT: STATS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Teacher Premium Stats */}
            <motion.div
              className="set-stat-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GraduationCap size={24} color="#A78BFA" />
              </div>
              <div className="set-stat-val">{stats.premiumTeachers}</div>
              <div className="set-stat-label">Premium Teachers</div>
              <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.8rem', lineHeight: 1.4 }}>
                Out of {stats.totalTeachers} registered teachers.
              </p>
            </motion.div>

            {/* Student Premium Stats */}
            <motion.div
              className="set-stat-box set-stat-box-cyan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Users size={24} color="#22D3EE" />
              </div>
              <div className="set-stat-val">{stats.premiumStudents}</div>
              <div className="set-stat-label">Premium Students</div>
              <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.8rem', lineHeight: 1.4 }}>
                Out of {stats.totalStudents} registered students.
              </p>
            </motion.div>

            {/* Security Status */}
            <motion.div
              className="set-card"
              style={{ padding: '1.5rem' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <h4 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontFamily: 'Space Grotesk', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="var(--green, #10B981)" /> Security Status
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Cloudinary Integration</span>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Database Host</span>
                  <span style={{ color: '#fff' }}>Supabase</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>System Environment</span>
                  <span style={{ color: '#A78BFA' }}>Production</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
