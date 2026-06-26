import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import { studentApi } from '@/api/services';
import toast from 'react-hot-toast';
import { BookOpen, Layers, CheckCircle } from 'lucide-react';

export default function OnboardingPage() {
  const { onboard, user } = useAuthStore();
  const navigate = useNavigate();

  const [curriculums, setCurriculums] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all active curriculums on mount
  useEffect(() => {
    studentApi.getAllCurriculums()
      .then(({ data }) => {
        setCurriculums(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Failed to load curriculums');
        setLoading(false);
      });
  }, []);

  // Fetch classes dynamically when curriculum is selected
  useEffect(() => {
    if (!selectedCurriculum) {
      setClasses([]);
      setSelectedClass(null);
      return;
    }
    setLoading(true);
    studentApi.getCurriculumClasses(selectedCurriculum.id)
      .then(({ data }) => {
        setClasses(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Failed to load classes for selected curriculum');
        setLoading(false);
      });
  }, [selectedCurriculum]);

  const handleSubmit = async () => {
    if (!selectedCurriculum || !selectedClass) {
      toast.error('Please select both a curriculum and a class');
      return;
    }
    setSubmitting(true);
    try {
      await onboard({
        curriculum_id: selectedCurriculum.id,
        class_id: selectedClass.id
      });
      toast.success('Setup completed! Welcome to your dashboard.');
      navigate('/courses');
    } catch (err) {
      toast.error(err.message || 'Failed to complete onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && curriculums.length === 0) {
    return (
      <div className="onb-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0A0E1A', color: '#F5F0E8' }}>
        <p>Loading onboarding options...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        .onb-shell {
          min-height: 100vh;
          background: #0A0E1A;
          color: #F5F0E8;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        .onb-shell::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          top: -150px;
          left: -150px;
          background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%);
          pointer-events: none;
        }
        .onb-shell::after {
          content: '';
          position: absolute;
          width: 450px;
          height: 450px;
          bottom: -100px;
          right: -100px;
          background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .onb-card {
          width: 100%;
          max-width: 680px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 3rem;
          backdrop-filter: blur(16px);
          position: relative;
          z-index: 1;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .onb-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00D4FF, #C4B5FD);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2rem;
          text-align: center;
        }
        .onb-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          text-align: center;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        .onb-subtitle {
          color: rgba(245,240,232,0.45);
          font-size: 0.95rem;
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .onb-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(245,240,232,0.5);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .onb-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .onb-item {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.25rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .onb-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(124,58,237,0.3);
          transform: translateY(-2px);
        }
        .onb-item.active {
          background: rgba(124,58,237,0.1);
          border-color: #7C3AED;
          box-shadow: 0 0 15px rgba(124,58,237,0.25);
        }
        .onb-item-title {
          font-weight: 600;
          font-size: 1.05rem;
          color: #F5F0E8;
        }
        .onb-item-desc {
          font-size: 0.8rem;
          color: rgba(245,240,232,0.45);
          line-height: 1.4;
        }
        .onb-select {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          color: #F5F0E8;
          font-size: 1rem;
          outline: none;
          cursor: pointer;
          margin-bottom: 2.5rem;
          font-family: inherit;
        }
        .onb-select option {
          background: #0F1629;
          color: #F5F0E8;
        }
        .onb-btn {
          width: 100%;
          background: linear-gradient(135deg, #7C3AED, #5B5FEF);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 1.1rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(91,95,239,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .onb-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(91,95,239,0.45);
        }
        .onb-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .onb-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>

      <div className="onb-shell">
        <motion.div 
          className="onb-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="onb-logo">Mentara</div>
          <h1 className="onb-title">Select Your Path</h1>
          <p className="onb-subtitle">Choose your curriculum and class to customize your learning dashboard.</p>

          {/* Curriculum Selection */}
          <div className="onb-label">
            <BookOpen size={14} /> Select Curriculum
          </div>
          <div className="onb-grid">
            {curriculums.map((curr) => (
              <div 
                key={curr.id}
                className={`onb-item ${selectedCurriculum?.id === curr.id ? 'active' : ''}`}
                onClick={() => setSelectedCurriculum(curr)}
              >
                <div className="onb-item-title">{curr.name}</div>
                <div className="onb-item-desc">{curr.description || 'Access study material, notes, and exams.'}</div>
              </div>
            ))}
          </div>

          {/* Class Selection */}
          {selectedCurriculum && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="onb-label">
                <Layers size={14} /> Select Class
              </div>
              <select 
                className="onb-select"
                value={selectedClass?.id || ''}
                onChange={(e) => {
                  const cls = classes.find(c => c.id === e.target.value);
                  setSelectedClass(cls || null);
                }}
              >
                <option value="" disabled>-- Choose your class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.description ? `(${cls.description})` : ''}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          <button 
            className="onb-btn"
            disabled={!selectedCurriculum || !selectedClass || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Setting up your desk...' : 'Complete Setup'}
            <CheckCircle size={18} />
          </button>
        </motion.div>
      </div>
    </>
  );
}
