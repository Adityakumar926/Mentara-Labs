import React, { useEffect, useMemo } from 'react';
import useAuthStore from '@/store/authStore';
import { assessmentApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function LearningCompassPage() {
  const user = useAuthStore((s) => s.user);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    if (user?.name) {
      params.set('name', user.name.split(' ')[0]);
    }
    const stageMatch = String(user?.class_name || user?.stage || '').match(/\d+/);
    if (stageMatch) {
      params.set('stage', stageMatch[0]);
    }
    const returnUrl =
      user?.role === 'admin'
        ? '/admin'
        : user?.role === 'teacher'
        ? '/courses'
        : '/student/dashboard';
    params.set('returnUrl', returnUrl);
    return `/thinking-style/learning-compass.html?${params.toString()}`;
  }, [user]);

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event?.data?.type === 'COMPASS_ASSESSMENT_COMPLETE') {
        const payload = event.data.payload || {};
        try {
          await assessmentApi.submitAssessment({
            childName: payload.childName || user?.name || 'Explorer',
            ageBand: payload.ageBand || '7-9',
            stage: payload.stage || 3,
            answers: payload.answers || {},
            report: payload.report || {},
          });
          toast.success('Thinking Style Profile saved to your account!');
        } catch (err) {
          // Non-blocking save; static report continues to work seamlessly
          console.warn('Could not persist assessment to backend:', err?.message);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#FAF7F2' }}>
      <iframe
        src={iframeSrc}
        title="Discover Your Thinking Style — Conceptualised and crafted by Ms. Sakshi Srivastava"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        allow="autoplay"
      />
    </div>
  );
}
