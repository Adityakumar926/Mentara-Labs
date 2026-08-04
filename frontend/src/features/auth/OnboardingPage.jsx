import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import { studentApi } from '@/api/services';
import toast from 'react-hot-toast';
import { BookOpen, Layers, CheckCircle, ArrowRight, Sparkles, GraduationCap, ChevronRight } from 'lucide-react';

export default function OnboardingPage() {
  const { onboard, user } = useAuthStore();
  const navigate = useNavigate();

  const [curriculums, setCurriculums] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 = curriculum, 2 = stage

  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    studentApi.getAllCurriculums()
      .then(({ data }) => { setCurriculums(data.data || []); setLoading(false); })
      .catch(() => { toast.error('Failed to load curriculums'); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedCurriculum) { setClasses([]); setSelectedClass(null); return; }
    setLoading(true);
    studentApi.getCurriculumClasses(selectedCurriculum.id)
      .then(({ data }) => {
        const studentClasses = (data.data || []).filter(
          (cls) => !cls.name.toLowerCase().includes('teacher')
        );
        setClasses(studentClasses);
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load stages'); setLoading(false); });
  }, [selectedCurriculum]);

  const handleCurriculumSelect = (curr) => {
    setSelectedCurriculum(curr);
    setSelectedClass(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedCurriculum || !selectedClass) {
      toast.error('Please select both a curriculum and a stage');
      return;
    }
    setSubmitting(true);
    try {
      await onboard({ curriculum_id: selectedCurriculum.id, class_id: selectedClass.id });
      toast.success('Welcome to Mentara Labs! 🎉');
      navigate('/courses');
    } catch (err) {
      toast.error(err.message || 'Failed to complete setup');
    } finally {
      setSubmitting(false);
    }
  };

  const stageColors = [
    { border: 'rgba(34,211,238,0.4)',  glow: 'rgba(34,211,238,0.15)',  accent: '#22d3ee',  label: 'Stage 1' },
    { border: 'rgba(52,211,153,0.4)',  glow: 'rgba(52,211,153,0.15)',  accent: '#34d399',  label: 'Stage 2' },
    { border: 'rgba(168,85,247,0.4)',  glow: 'rgba(168,85,247,0.15)',  accent: '#a855f7',  label: 'Stage 3' },
    { border: 'rgba(251,191,36,0.4)',  glow: 'rgba(251,191,36,0.15)',  accent: '#fbbf24',  label: 'Stage 4' },
    { border: 'rgba(244,63,94,0.4)',   glow: 'rgba(244,63,94,0.15)',   accent: '#f43f5e',  label: 'Stage 5' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .onb-shell {
          min-height: 100vh;
          background: #09090b;
          color: #f4f4f5;
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        /* Animated background orbs (matching landing) */
        @keyframes onb-blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(30px,-40px) scale(1.06); }
          66%       { transform: translate(-20px,20px) scale(0.94); }
        }
        .onb-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          animation: onb-blob 14s infinite alternate ease-in-out;
        }

        /* Grid overlay */
        .onb-grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-size: 30px 30px;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
        }

        .onb-card {
          width: 100%;
          max-width: 700px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 28px;
          padding: 2.75rem 3rem;
          backdrop-filter: blur(20px);
          position: relative;
          z-index: 10;
          box-shadow: 0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
        }

        @media (max-width: 600px) {
          .onb-card { padding: 2rem 1.25rem; }
        }

        /* Step pills */
        .onb-steps {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          margin-bottom: 2rem;
        }
        .onb-step-dot {
          height: 8px;
          border-radius: 99px;
          transition: all 0.4s ease;
          background: rgba(255,255,255,0.12);
        }
        .onb-step-dot.active {
          background: linear-gradient(90deg, #22d3ee, #34d399);
          width: 32px;
        }
        .onb-step-dot.done {
          background: #34d399;
        }

        /* Curriculum & stage card grid */
        .onb-curr-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.875rem;
          margin-bottom: 2rem;
        }
        .onb-stage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 0.875rem;
          margin-bottom: 2rem;
        }

        .onb-pick-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .onb-pick-card:hover {
          background: rgba(255,255,255,0.07);
          transform: translateY(-2px);
        }
        .onb-pick-card.selected {
          border-color: var(--card-accent, #22d3ee);
          background: rgba(34,211,238,0.07);
          box-shadow: 0 0 20px var(--card-glow, rgba(34,211,238,0.15));
        }

        .onb-stage-card {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.25rem 1rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
        }
        .onb-stage-card:hover {
          background: rgba(255,255,255,0.07);
          transform: translateY(-3px);
        }
        .onb-stage-card.selected {
          border-color: var(--stage-accent);
          background: var(--stage-glow-bg);
          box-shadow: 0 0 24px var(--stage-glow);
        }

        /* CTA button */
        .onb-btn {
          width: 100%;
          background: linear-gradient(135deg, #22d3ee, #34d399);
          color: #09090b;
          border: none;
          border-radius: 16px;
          padding: 1.05rem;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 0 0 rgba(34,211,238,0);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .onb-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(34,211,238,0.45);
        }
        .onb-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Back link */
        .onb-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          color: rgba(244,244,245,0.4);
          cursor: pointer;
          transition: color 0.2s;
          margin-bottom: 1.5rem;
          border: none;
          background: none;
          padding: 0;
          font-family: 'Space Grotesk', sans-serif;
        }
        .onb-back:hover { color: rgba(244,244,245,0.7); }

        /* ── RGB rotating border on curriculum card (Google AI style) ── */
        @keyframes rgb-spin {
          0%   { --rgb-angle: 0deg; }
          100% { --rgb-angle: 360deg; }
        }
        @property --rgb-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .onb-curr-rgb-wrap {
          position: relative;
          border-radius: 18px;
          padding: 2px;
          background: conic-gradient(
            from var(--rgb-angle),
            #22d3ee, #a855f7, #f43f5e, #fbbf24, #34d399, #22d3ee
          );
          animation: rgb-spin 3s linear infinite;
        }
        .onb-curr-rgb-wrap::before {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 22px;
          background: conic-gradient(
            from var(--rgb-angle),
            rgba(34,211,238,0.3), rgba(168,85,247,0.3), rgba(244,63,94,0.3),
            rgba(251,191,36,0.3), rgba(52,211,153,0.3), rgba(34,211,238,0.3)
          );
          filter: blur(12px);
          z-index: -1;
          animation: rgb-spin 3s linear infinite;
        }
        .onb-curr-rgb-inner {
          background: #0e0e10;
          border-radius: 16px;
          overflow: hidden;
        }
      `}</style>

      <div className="onb-shell">
        {/* Background orbs */}
        <div className="onb-orb" style={{ width: 500, height: 500, top: -120, left: -150, background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)', animationDelay: '0s' }} />
        <div className="onb-orb" style={{ width: 420, height: 420, bottom: -80, right: -100, background: 'radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 70%)', animationDelay: '-5s' }} />
        <div className="onb-orb" style={{ width: 300, height: 300, top: '40%', right: '20%', background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)', animationDelay: '-9s' }} />
        <div className="onb-grid-bg" />

        <motion.div
          className="onb-card"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          {/* Logo — icon left, text right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', marginBottom: '1.75rem' }}>
            <img
              src="/mentara-new.png"
              alt="Mentara Labs"
              style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }}
            />
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: '1.5rem',
              background: 'linear-gradient(90deg, #22d3ee, #a855f7, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}>Mentara Labs</span>
          </div>

          {/* Step indicator */}
          <div className="onb-steps">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`onb-step-dot ${step === s ? 'active' : step > s ? 'done' : ''}`}
                style={{ width: step === s ? 32 : step > s ? 8 : 8 }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Curriculum ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'rgba(34,211,238,0.12)',
                      border: '1px solid rgba(34,211,238,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <BookOpen size={24} style={{ color: '#22d3ee' }} />
                    </div>
                  </div>
                  <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1.9rem', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
                    Choose Your Curriculum
                  </h1>
                  <p style={{ color: 'rgba(244,244,245,0.45)', fontSize: '0.9rem' }}>
                    Select the curriculum that matches your school programme
                  </p>
                </div>

                <div className="onb-curr-grid">
                  {loading ? (
                    <div style={{ textAlign: 'center', color: 'rgba(244,244,245,0.35)', padding: '2rem', fontSize: '0.9rem' }}>
                      Loading curriculums…
                    </div>
                  ) : curriculums.map((curr) => (
                    <div key={curr.id} className="onb-curr-rgb-wrap">
                      <div className="onb-curr-rgb-inner">
                        <motion.div
                          className={`onb-pick-card ${selectedCurriculum?.id === curr.id ? 'selected' : ''}`}
                          style={{ '--card-accent': '#22d3ee', '--card-glow': 'rgba(34,211,238,0.15)', border: 'none', borderRadius: 16 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCurriculumSelect(curr)}
                        >
                          <div style={{
                            flexShrink: 0, width: 44, height: 44, borderRadius: 12,
                            background: 'rgba(34,211,238,0.12)',
                            border: '1px solid rgba(34,211,238,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <GraduationCap size={20} style={{ color: '#22d3ee' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{curr.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(244,244,245,0.45)', lineHeight: 1.4 }}>
                              {curr.description || 'Access study material, notes, and exams.'}
                            </div>
                          </div>
                          <ChevronRight size={16} style={{ color: 'rgba(244,244,245,0.25)', flexShrink: 0 }} />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Stage/Class ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button className="onb-back" onClick={() => { setStep(1); setSelectedClass(null); }}>
                  ← Back to curriculum
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'rgba(52,211,153,0.12)',
                      border: '1px solid rgba(52,211,153,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Layers size={24} style={{ color: '#34d399' }} />
                    </div>
                  </div>
                  <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1.9rem', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
                    Pick Your Stage
                  </h1>
                  <p style={{ color: 'rgba(244,244,245,0.45)', fontSize: '0.9rem' }}>
                    <span style={{ color: '#22d3ee', fontWeight: 600 }}>{selectedCurriculum?.name}</span>
                    {' '}· Choose the stage matching your year group
                  </p>
                </div>

                <div className="onb-stage-grid">
                  {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(244,244,245,0.35)', padding: '2rem', fontSize: '0.9rem' }}>
                      Loading stages…
                    </div>
                  ) : classes.map((cls, idx) => {
                    const palette = stageColors[idx % stageColors.length];
                    const isSelected = selectedClass?.id === cls.id;
                    return (
                      <motion.div
                        key={cls.id}
                        className={`onb-stage-card ${isSelected ? 'selected' : ''}`}
                        style={{
                          '--stage-accent': palette.border.replace('0.4', '0.9'),
                          '--stage-glow': palette.glow,
                          '--stage-glow-bg': palette.glow.replace('0.15', '0.08'),
                        }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedClass(cls)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: `${palette.glow}`,
                          border: `1px solid ${palette.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.1rem', fontWeight: 900,
                          color: palette.accent,
                          fontFamily: "'Outfit', sans-serif",
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cls.name}</div>
                        {cls.description && (
                          <div style={{ fontSize: '0.73rem', color: 'rgba(244,244,245,0.4)', lineHeight: 1.4 }}>
                            {cls.description}
                          </div>
                        )}
                        {isSelected && (
                          <CheckCircle size={14} style={{ color: palette.accent, marginTop: 2 }} />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <button
                  className="onb-btn"
                  disabled={!selectedClass || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <>Setting up your dashboard…</>
                  ) : (
                    <>
                      Start Learning
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {selectedClass && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'rgba(244,244,245,0.3)' }}
                  >
                    You can change your stage later from Profile settings.
                  </motion.p>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
