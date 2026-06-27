import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, ShieldCheck, Sparkles, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper, Button, Input } from '@/components/ui';
import { adminApi } from '@/api/services';
import toast from 'react-hot-toast';

const CSS = `
  .set-root {
    padding: 2rem;
    max-width: 1000px;
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

  .set-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 768px) {
    .set-grid {
      grid-template-columns: 2fr 1fr;
    }
  }

  /* Glassmorphic settings panel */
  .set-card {
    background: rgba(15, 22, 41, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 2rem;
    backdrop-filter: blur(20px);
  }
  
  .set-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.15rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
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
`;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState('499');
  const [studentStats, setStudentStats] = useState({ total: 0, premium: 0 });

  useEffect(() => {
    // Fetch settings and student list to compute stats
    Promise.all([
      adminApi.getSettings(),
      adminApi.getStudents()
    ])
      .then(([settingsRes, studentsRes]) => {
        if (settingsRes.data.success) {
          setPremiumPrice(settingsRes.data.data.premium_price || '499');
        }
        if (studentsRes.data.success) {
          const students = studentsRes.data.data ?? [];
          const premiumCount = students.filter(s => s.is_premium).length;
          setStudentStats({
            total: students.length,
            premium: premiumCount
          });
        }
      })
      .catch(err => {
        console.error('Failed to load settings data:', err);
        toast.error('Failed to load configuration settings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!premiumPrice || isNaN(premiumPrice) || parseInt(premiumPrice) <= 0) {
      toast.error('Please enter a valid positive number for pricing.');
      return;
    }

    setSaving(true);
    try {
      const res = await adminApi.updateSetting({
        key: 'premium_price',
        value: String(premiumPrice)
      });
      if (res.data.success) {
        toast.success('Settings updated successfully!');
      }
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
            <p className="set-subtitle">Manage global options, configurations, and pricing structures for Mentara Labs.</p>
          </div>
        </div>

        <div className="set-grid">
          {/* LEFT: SETTINGS FORM */}
          <motion.div 
            className="set-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="set-card-title">
              <Settings size={18} color="var(--violet-l)" /> Pricing Configuration
            </h3>
            
            <form onSubmit={handleSave}>
              <div className="set-row">
                <Input 
                  label="Premium Subscription Monthly Price (INR)" 
                  type="number"
                  placeholder="e.g. 499"
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(e.target.value)}
                />
              </div>

              <div className="set-info-box">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  This configuration directly updates the checkout and membership details on the student dashboard. 
                  Any pricing adjustments take effect immediately for new subscribers.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <Button 
                  variant="primary" 
                  type="submit" 
                  loading={saving}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={14} /> Save Configuration
                </Button>
              </div>
            </form>
          </motion.div>

          {/* RIGHT: PREMIUM METRICS & STATS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <motion.div 
              className="set-stat-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Sparkles size={24} color="var(--amber)" />
              </div>
              <div className="set-stat-val">{studentStats.premium}</div>
              <div className="set-stat-label">Premium Students</div>
              <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.8rem', lineHeight: 1.4 }}>
                Active premium subscriptions across a total of {studentStats.total} registered students.
              </p>
            </motion.div>

            <motion.div 
              className="set-card"
              style={{ padding: '1.5rem' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <h4 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontFamily: 'Space Grotesk', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="var(--green)" /> Security Status
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Cloudinary Integration</span>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Database Host</span>
                  <span style={{ color: '#fff' }}>Supabase</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>System Environment</span>
                  <span style={{ color: 'var(--violet-l)' }}>Production</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
