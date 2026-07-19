import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, ShieldAlert, Award, Star, BookOpen, PenTool, Tv, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/ui';
import { studentApi } from '@/api/services';
import { useApi } from '@/hooks/useApi';
import useAuthStore from '@/store/authStore';
import useRazorpay from '@/hooks/useRazorpay';
import toast from 'react-hot-toast';

/* ─── Premium Modern CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

  .pr-root {
    --navy:     #0A0E1A;
    --navy2:    #0F1629;
    --violet:   #7C3AED;
    --violet-l: #9D6FEF;
    --cyan:     #00D4FF;
    --cream:    #F5F0E8;
    --lavender: #C4B5FD;
    --green:    #10B981;
    --amber:    #F59E0B;
    --muted:    rgba(245,240,232,0.5);
    --card-bg:  rgba(255,255,255,0.02);
    --card-bdr: rgba(255,255,255,0.06);
    --glass-bg: rgba(15, 22, 41, 0.7);
    --text-primary: #F5F0E8;
    
    font-family: 'Inter', sans-serif;
    color: var(--text-primary);
    min-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 2rem;
  }
  .pr-root *, .pr-root *::before, .pr-root *::after { box-sizing: border-box; }

  /* Background Glow Blobs */
  .pr-bg-blob {
    position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0;
  }
  .pr-blob-1 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
    top: 5%; left: 10%;
  }
  .pr-blob-2 {
    width: 350px; height: 350px;
    background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%);
    bottom: 5%; right: 10%;
  }

  /* Header Section */
  .pr-header {
    text-align: center;
    margin-bottom: 2.5rem;
    z-index: 1;
  }
  .pr-header-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #FFFFFF 0%, var(--lavender) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 0.5rem;
  }
  .pr-header-sub {
    font-size: 0.95rem;
    color: var(--muted);
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.5;
    font-weight: 500;
  }

  /* Container card */
  .pr-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 900px;
    background: var(--glass-bg);
    border: 2px solid var(--card-bdr);
    border-radius: 32px;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
  @media (min-width: 768px) {
    .pr-container { grid-template-columns: 1.1fr 0.9fr; }
  }

  /* Left Panel: Info & Benefits */
  .pr-info-panel {
    padding: 3rem;
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
    background: rgba(245,158,11,0.08); 
    border: 1px solid rgba(245,158,11,0.3);
    padding: 0.35rem 0.8rem; border-radius: 50px;
    font-size: 0.68rem; font-weight: 700; color: var(--amber);
    text-transform: uppercase; letter-spacing: 0.06em; width: fit-content; margin-bottom: 1.5rem;
  }

  .pr-subtitle {
    font-family: 'Outfit', sans-serif;
    font-size: 1.6rem; font-weight: 800; line-height: 1.2;
    color: #FFFFFF;
    margin-bottom: 1.5rem;
  }

  .pr-benefits-list { display: flex; flex-direction: column; gap: 1.25rem; }
  .pr-benefit-item { display: flex; align-items: start; gap: 1rem; }
  .pr-benefit-icon-wrapper {
    width: 32px; height: 32px; border-radius: 10px;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.25);
    display: flex; align-items: center; justify-content: center; color: var(--violet-l); flex-shrink: 0;
  }
  .pr-benefit-text { font-size: 0.88rem; font-weight: 700; color: #FFFFFF; }
  .pr-benefit-subtext { font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem; line-height: 1.4; font-weight: 500; }

  /* Right Panel: Checkout / Pricing card */
  .pr-pricing-panel {
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(10, 14, 26, 0.4);
    position: relative;
  }

  .pr-illustration-box {
    margin-bottom: 1.5rem;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .pr-illustration {
    width: 120px;
    height: 120px;
    object-fit: contain;
    filter: drop-shadow(0 15px 25px rgba(124,58,237,0.4));
    animation: float-book 6s ease-in-out infinite;
  }
  @keyframes float-book {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-8px) rotate(2deg); }
  }

  .pr-price-box {
    text-align: center; margin-bottom: 1.75rem;
  }
  .pr-price-tag {
    font-family: 'Outfit', sans-serif;
    font-size: 3rem; font-weight: 900; color: #FFFFFF; line-height: 1;
    letter-spacing: -0.02em;
  }
  .pr-price-sub { font-size: 0.8rem; color: var(--muted); margin-top: 0.5rem; font-weight: 600; }

  .pr-action-btn {
    width: 100%;
    background: linear-gradient(135deg, var(--violet), var(--violet-l));
    border: none; border-radius: 18px;
    padding: 1.1rem; font-size: 0.9rem; font-weight: 800; color: #fff;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 30px rgba(124,58,237,0.4); margin-bottom: 1.25rem;
  }
  .pr-action-btn:hover {
    transform: translateY(-2px); 
    box-shadow: 0 15px 35px rgba(124,58,237,0.55);
    filter: brightness(1.1);
  }
  .pr-action-btn:active { transform: translateY(0); }
  .pr-action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .pr-security-hint {
    display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--muted); font-weight: 600;
  }
  
  .pr-already-premium {
    width: 100%;
    text-align: center; padding: 1.1rem; border-radius: 18px;
    background: rgba(16,185,129,0.08); border: 2px dashed rgba(16,185,129,0.3);
    color: var(--green); font-size: 0.85rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  }

  /* ── Light Mode Overrides ── */
  .light .pr-root {
    --text-primary: #0F172A;
    --muted: #475569;
    --card-bdr: #D2D6FF;
    --glass-bg: rgba(248, 250, 252, 0.85);
  }
  .light .pr-header-title {
    background: linear-gradient(135deg, #0F172A 0%, var(--violet) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .light .pr-subtitle, .light .pr-benefit-text, .light .pr-price-tag {
    color: #0F172A;
  }
  .light .pr-container {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
    border-color: #D2D6FF;
  }
  .light .pr-pricing-panel {
    background: rgba(241, 245, 249, 0.5);
  }
  .light .pr-badge {
    background: rgba(245,158,11,0.12);
    border-color: rgba(245,158,11,0.4);
  }
  .light .pr-benefit-icon-wrapper {
    background: rgba(124,58,237,0.08);
    border-color: rgba(124,58,237,0.2);
  }
`;

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startPayment, loading: upgrading, error } = useRazorpay();
  const { data: settings, loading } = useApi(studentApi.getSettings);
  const isStudent = user?.role === 'student';
  const price = isStudent ? (settings?.student_premium_price || '39') : (settings?.premium_price || '65');
  const durationMonths = settings?.premium_duration_months || '1';
  const currency = settings?.premium_currency || '$';
  const billingPeriod = settings?.premium_billing_period || '/ year';
  const discountPct = parseFloat(isStudent ? (settings?.student_premium_discount || '40') : (settings?.premium_discount || '40')) || 0;

  const originalVal = parseFloat(price) || 0;
  const hasDiscount = discountPct > 0 && discountPct <= 100;
  const discountedVal = hasDiscount ? Math.round(originalVal * (1 - discountPct / 100)) : originalVal;
  const savingsVal = originalVal - discountedVal;

  const handleUpgrade = async () => {
    const selectedPlan = isStudent ? 'student' : 'teacher';
    const isIndianTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';
    const checkoutCurrency = isIndianTimezone ? 'INR' : (settings?.premium_currency === '$' ? 'USD' : 'INR');

    await startPayment({
      plan: selectedPlan,
      user,
      currency: checkoutCurrency,
      onSuccess: (updatedUser) => {
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          useAuthStore.setState({ user: updatedUser });
        }
        toast.success('Congratulations! Mentara Labs Premium is now active.');
      },
    });
  };

  const isPremium = user?.is_premium;

  return (
    <PageWrapper>
      <style>{CSS}</style>
      <div className="pr-root">
        
        {/* Glow Effects */}
        <div className="pr-bg-blob pr-blob-1" />
        <div className="pr-bg-blob pr-blob-2" />

        {/* Page Header */}
        <div className="pr-header">
          <h1 className="pr-header-title">
            {isStudent ? 'Unlock Premium Learning' : 'Unlock Premium Teaching'}
          </h1>
          <p className="pr-header-sub">
            {isStudent 
              ? 'Excel in your curriculums with complete access to top-tier learning resources.' 
              : 'Equip your classroom with interactive teaching tools, drawable explanations, and real-time simulators.'}
          </p>
        </div>

        <motion.div 
          className="pr-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* LEFT: INFO & BENEFITS */}
          <div className="pr-info-panel">
            <div className="pr-badge">
              <Sparkles size={11} fill="var(--amber)" /> Mentara {isStudent ? 'Student' : 'Teacher'} Premium
            </div>
            <h2 className="pr-subtitle">Premium Benefits</h2>

            <div className="pr-benefits-list">
              {isStudent ? (
                <>
                  <div className="pr-benefit-item">
                    <div className="pr-benefit-icon-wrapper">
                      <BookOpen size={15} />
                    </div>
                    <div>
                      <div className="pr-benefit-text">3D Simulation &amp; Animations</div>
                      <div className="pr-benefit-subtext">Visualize complex ideas with interactive web-based 3D widgets.</div>
                    </div>
                  </div>

                  <div className="pr-benefit-item">
                    <div className="pr-benefit-icon-wrapper">
                      <PenTool size={15} />
                    </div>
                    <div>
                      <div className="pr-benefit-text">Interactive Drawing Worksheets</div>
                      <div className="pr-benefit-subtext">Solve worksheets directly inside your dashboard with sketch tools.</div>
                    </div>
                  </div>

                  <div className="pr-benefit-item">
                    <div className="pr-benefit-icon-wrapper">
                      <Tv size={15} />
                    </div>
                    <div>
                      <div className="pr-benefit-text">High Quality Video Lectures</div>
                      <div className="pr-benefit-subtext">Seamless video lectures streaming with zero buffering via Mux.</div>
                    </div>
                  </div>

                  <div className="pr-benefit-item">
                    <div className="pr-benefit-icon-wrapper">
                      <GraduationCap size={15} />
                    </div>
                    <div>
                      <div className="pr-benefit-text">Full Practice Examinations</div>
                      <div className="pr-benefit-subtext">Practice mock tests curated specifically for your curriculum.</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="pr-benefit-item">
                    <div className="pr-benefit-icon-wrapper">
                      <BookOpen size={15} />
                    </div>
                    <div>
                      <div className="pr-benefit-text">All Student Features Included</div>
                      <div className="pr-benefit-subtext">Full access to curriculum subjects, worksheets, mock exams, and notes.</div>
                    </div>
                  </div>

                  <div className="pr-benefit-item">
                    <div className="pr-benefit-icon-wrapper">
                      <Tv size={15} />
                    </div>
                    <div>
                      <div className="pr-benefit-text">Interactive Whiteboard Mode</div>
                      <div className="pr-benefit-subtext">Project and use 3D simulations easily for classroom instruction.</div>
                    </div>
                  </div>

                  <div className="pr-benefit-item">
                    <div className="pr-benefit-icon-wrapper">
                      <GraduationCap size={15} />
                    </div>
                    <div>
                      <div className="pr-benefit-text">Classroom Hub &amp; Analytics</div>
                      <div className="pr-benefit-subtext">Monitor student dashboard streaks, grades, and submissions in real-time.</div>
                    </div>
                  </div>

                  <div className="pr-benefit-item">
                    <div className="pr-benefit-icon-wrapper">
                      <Sparkles size={15} />
                    </div>
                    <div>
                      <div className="pr-benefit-text">Advanced Simulation Playbacks</div>
                      <div className="pr-benefit-subtext">Custom playback tools, guided tutorials, and quick reset settings.</div>
                    </div>
                  </div>
                </>
              )}
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
                <div className="flex flex-col items-center gap-1.5">
                  {hasDiscount ? (
                    <>
                      {/* Original Price & Discount Tag */}
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-lg line-through text-zinc-500 font-medium">{currency}{price}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                          {discountPct}% OFF
                        </span>
                      </div>

                      {/* New Discounted Price */}
                      <div className="text-5xl font-black tracking-tight text-white flex items-baseline justify-center gap-1.5">
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                          {currency}{discountedVal}
                        </span>
                        <span className="text-sm text-zinc-500 font-semibold">{billingPeriod}</span>
                      </div>

                      {/* Savings message */}
                      <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-lg py-1 px-2.5 mt-1">
                        🎉 You save {currency}{savingsVal} instantly
                      </div>
                    </>
                  ) : (
                    <div className="text-5xl font-black tracking-tight text-white flex items-baseline justify-center gap-1.5">
                      <span>{currency}{price}</span>
                      <span className="text-sm text-zinc-500 font-semibold">{billingPeriod}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isPremium ? (
              <div className="pr-already-premium">
                <Award size={18} />
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
                    Upgrade Now <ArrowRight size={15} />
                  </>
                )}
              </button>
            )}

            <div className="pr-security-hint">
              <ShieldAlert size={13} style={{ color: 'var(--amber)' }} />
              Test Mode: Instantly unlocks premium tier.
            </div>
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
}

