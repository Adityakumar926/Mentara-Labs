import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, ShieldAlert, Award, Lock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper, Button } from '@/components/ui';
import { studentApi } from '@/api/services';
import { useApi } from '@/hooks/useApi';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

/* ─── Premium Modern CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

  .pr-root {
    --navy:     var(--local-navy, #0A0E1A);
    --navy2:    var(--local-navy2, #0F1629);
    --violet:   #7C3AED;
    --violet-l: var(--local-violet-l, #9D6FEF);
    --cyan:     var(--local-cyan, #00D4FF);
    --cream:    var(--local-cream, #F5F0E8);
    --lavender: var(--local-lavender, #C4B5FD);
    --green:    #10B981;
    --amber:    #F59E0B;
    --muted:    var(--local-muted, rgba(245,240,232,0.45));
    --card-bg:  var(--local-card-bg, rgba(255,255,255,0.03));
    --card-bdr: var(--local-card-bdr, rgba(255,255,255,0.06));
    font-family: 'Inter', sans-serif;
    color: var(--cream);
    min-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .pr-root *, .pr-root *::before, .pr-root *::after { box-sizing: border-box; }

  /* Background Glow Blobs */
  .pr-bg-blob {
    position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0;
  }
  .pr-blob-1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
    top: 10%; left: 15%;
  }
  .pr-blob-2 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 70%);
    bottom: 10%; right: 15%;
  }

  /* Container card */
  .pr-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 820px;
    background: var(--local-navy2);
    border: 2px solid var(--card-bdr);
    border-radius: 28px;
    backdrop-filter: blur(24px);
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr;
  }
  @media (min-width: 768px) {
    .pr-container { grid-template-columns: 1fr 1fr; }
  }

  /* Left Panel: Info & Benefits */
  .pr-info-panel {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 2px solid var(--card-bdr);
  }
  @media (min-width: 768px) {
    .pr-info-panel { border-bottom: none; border-right: 2px solid var(--card-bdr); }
  }

  .pr-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(245,158,11,0.08); border: 2px solid var(--local-card-bdr);
    padding: 0.35rem 0.8rem; border-radius: 50px;
    font-size: 0.65rem; font-weight: 700; color: var(--amber);
    text-transform: uppercase; letter-spacing: 0.05em; width: fit-content; margin-bottom: 1.25rem;
  }

  .pr-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.8rem; font-weight: 700; line-height: 1.2;
    background: linear-gradient(135deg, var(--cream) 30%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.8rem;
  }
  .pr-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.5; margin-bottom: 1.75rem; font-weight: 600; }

  .pr-benefits-list { display: flex; flex-direction: column; gap: 1rem; }
  .pr-benefit-item { display: flex; align-items: start; gap: 0.75rem; }
  .pr-benefit-icon {
    width: 22px; height: 22px; border-radius: 50%; background: rgba(16,185,129,0.1);
    border: 1.5px solid var(--local-green);
    display: flex; align-items: center; justify-content: center; color: var(--green); flex-shrink: 0; margin-top: 0.1rem;
  }
  .pr-benefit-text { font-size: 0.82rem; font-weight: 700; color: var(--cream); }
  .pr-benefit-subtext { font-size: 0.7rem; color: var(--muted); margin-top: 0.15rem; font-weight: 600; }

  /* Right Panel: Checkout / Pricing card */
  .pr-pricing-panel {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--local-navy);
  }

  .pr-price-box {
    text-align: center; margin-bottom: 2rem;
  }
  .pr-price-tag {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2.8rem; font-weight: 700; color: var(--cream); line-height: 1;
  }
  .pr-price-sub { font-size: 0.78rem; color: var(--muted); margin-top: 0.4rem; font-weight: 600; }

  .pr-action-btn {
    width: 100%;
    background: linear-gradient(135deg, var(--violet), var(--violet-l));
    border: 2px solid var(--violet); border-radius: 16px;
    padding: 0.95rem; font-size: 0.85rem; font-weight: 800; color: #fff;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: all 0.22s ease;
    box-shadow: 0 8px 24px rgba(124,58,237,0.35); margin-bottom: 1.25rem;
  }
  .pr-action-btn:hover {
    transform: translateY(-2px); box-shadow: 0 12px 30px rgba(124,58,237,0.45);
    border-color: var(--violet-l);
  }
  .pr-action-btn:active { transform: translateY(0); }

  .pr-security-hint {
    display: flex; align-items: center; gap: 0.4rem; font-size: 0.65rem; color: var(--muted); font-weight: 600;
  }
  
  .pr-already-premium {
    text-align: center; padding: 1rem; border-radius: 16px;
    background: rgba(16,185,129,0.05); border: 2px solid var(--local-green);
    color: var(--green); font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;
  }

  @keyframes pr-pulse {
    0% { opacity: 0.45; }
    50% { opacity: 0.85; }
    100% { opacity: 0.45; }
  }
`;

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [upgrading, setUpgrading] = useState(false);
  const { data: settings, loading } = useApi(studentApi.getSettings);
  const price = settings?.premium_price || '499';
  const durationMonths = settings?.premium_duration_months || '1';

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await studentApi.upgradePremium();
      if (res.data.success) {
        // Update user inside localStorage & Zustand store immediately
        localStorage.setItem('user', JSON.stringify(res.data.user));
        useAuthStore.setState({ user: res.data.user });

        toast.success('Congratulations! Mentara Labs Premium is now active.');
        navigate('/explore');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const isPremium = user?.is_premium;

  return (
    <PageWrapper>
      <style>{CSS}</style>
      <div className="pr-root">
        
        {/* Glow Effects */}
        <div className="pr-bg-blob pr-blob-1" />
        <div className="pr-bg-blob pr-blob-2" />

        <motion.div 
          className="pr-container"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          {/* LEFT: INFO & BENEFITS */}
          <div className="pr-info-panel">
            <div className="pr-badge">
              <Star size={11} fill="var(--amber)" /> Mentara Labs Pro
            </div>
            <h2 className="pr-title">Go Premium</h2>
            <p className="pr-desc">Unlock advanced study modules, drawing materials, and simulated practice tests designed to help you excel.</p>

            <div className="pr-benefits-list">
              <div className="pr-benefit-item">
                <div className="pr-benefit-icon">
                  <Check size={12} />
                </div>
                <div>
                  <div className="pr-benefit-text">Interactive Animations</div>
                  <div className="pr-benefit-subtext">Instant access to 3D animations and simulation widgets.</div>
                </div>
              </div>

              <div className="pr-benefit-item">
                <div className="pr-benefit-icon">
                  <Check size={12} />
                </div>
                <div>
                  <div className="pr-benefit-text">Drawable Worksheets</div>
                  <div className="pr-benefit-subtext">Practice directly on sheets using the digital drawing board.</div>
                </div>
              </div>

              <div className="pr-benefit-item">
                <div className="pr-benefit-icon">
                  <Check size={12} />
                </div>
                <div>
                  <div className="pr-benefit-text">Premium Study Materials</div>
                  <div className="pr-benefit-subtext">Unlock premium video lectures and revision sheets.</div>
                </div>
              </div>

              <div className="pr-benefit-item">
                <div className="pr-benefit-icon">
                  <Check size={12} />
                </div>
                <div>
                  <div className="pr-benefit-text">Full Practice Exams</div>
                  <div className="pr-benefit-subtext">Test your skills under actual time constraint models.</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: PRICING CARD */}
          <div className="pr-pricing-panel">
            <div className="pr-price-box">
              {loading ? (
                <div style={{
                  height: '46px',
                  width: '180px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  margin: '0.4rem auto 0.6rem auto',
                  animation: 'pr-pulse 1.5s infinite'
                }} />
              ) : (
                <div className="pr-price-tag">₹{price}<span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}> / {durationMonths} month{parseInt(durationMonths, 10) !== 1 ? 's' : ''}</span></div>
              )}
              <div className="pr-price-sub">Secure checkout encryption.</div>
            </div>

            {isPremium ? (
              <div className="pr-already-premium">
                <Award size={16} />
                You are currently a Premium Member!
              </div>
            ) : (
              <button 
                className="pr-action-btn"
                onClick={handleUpgrade}
                disabled={upgrading}
              >
                {upgrading ? (
                  'Activating...'
                ) : (
                  <>
                    Upgrade Now <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}

            <div className="pr-security-hint">
              <ShieldAlert size={12} />
              Testing mode: Instantly unlocks features in database.
            </div>
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
}
