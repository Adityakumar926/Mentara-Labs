import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { assessmentApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function LearningCompassPage() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthed = Boolean(user || localStorage.getItem('accessToken'));
  const searchParams = new URLSearchParams(location.search);
  const wantsReport =
    searchParams.get('report') === '1' ||
    (isAuthed && localStorage.getItem('mentara_compass_pending_report') === '1');

  useEffect(() => {
    if (searchParams.get('report') === '1' && !isAuthed) {
      try {
        sessionStorage.setItem('mentara_post_auth_redirect', '/discover-thinking-style?report=1');
        localStorage.setItem('mentara_post_auth_redirect', '/discover-thinking-style?report=1');
        localStorage.setItem('mentara_compass_pending_report', '1');
      } catch (e) {
        // ignore
      }
      navigate(`/register?redirect=${encodeURIComponent('/discover-thinking-style?report=1')}`, { replace: true });
    }
  }, [isAuthed, navigate, searchParams]);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    if (user?.name || user?.full_name) {
      params.set('name', (user.name || user.full_name).split(' ')[0]);
    }
    const stageMatch = String(user?.class_name || user?.stage || '').match(/\d+/);
    if (stageMatch) {
      params.set('stage', stageMatch[0]);
    }
    const returnUrl = !isAuthed
      ? '/'
      : user?.role === 'admin'
      ? '/admin'
      : user?.role === 'teacher'
      ? '/courses'
      : '/student/dashboard';
    params.set('returnUrl', returnUrl);
    params.set('authed', isAuthed ? '1' : '0');
    if (wantsReport && isAuthed) {
      params.set('report', '1');
    }
    return `/thinking-style/learning-compass.html?${params.toString()}`;
  }, [user, isAuthed, wantsReport]);

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event?.data?.type === 'COMPASS_REQUIRE_AUTH_FOR_REPORT') {
        try {
          if (event.data.payload) {
            localStorage.setItem('mentara_compass_completed_state', JSON.stringify(event.data.payload));
          }
          sessionStorage.setItem('mentara_post_auth_redirect', '/discover-thinking-style?report=1');
          localStorage.setItem('mentara_post_auth_redirect', '/discover-thinking-style?report=1');
          localStorage.setItem('mentara_compass_pending_report', '1');
        } catch (e) {
          // ignore
        }
        toast('Please sign up or log in to unlock your Final Discovery Report!', { icon: '🔐' });
        navigate(`/register?redirect=${encodeURIComponent('/discover-thinking-style?report=1')}`);
        return;
      }

      if (event?.data?.type === 'COMPASS_ASSESSMENT_COMPLETE') {
        try {
          localStorage.removeItem('mentara_compass_pending_report');
          localStorage.removeItem('mentara_post_auth_redirect');
          sessionStorage.removeItem('mentara_post_auth_redirect');
        } catch (e) {
          // ignore
        }

        if (!localStorage.getItem('accessToken')) return;

        const payload = event.data.payload || {};
        try {
          await assessmentApi.submitAssessment({
            childName: payload.childName || user?.name || user?.full_name || 'Explorer',
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
  }, [user, navigate]);

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
