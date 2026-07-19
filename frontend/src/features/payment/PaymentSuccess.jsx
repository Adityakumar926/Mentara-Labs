import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const planLabel = location.state?.planLabel || 'Premium Plan';

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setTimeout(() => navigate('/dashboard'), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '48px',
        textAlign: 'center',
        maxWidth: '480px',
        width: '90%',
        animation: 'fadeInUp 0.6s ease',
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 40px rgba(34, 197, 94, 0.4)',
        }}>
          <CheckCircle size={40} color="white" />
        </div>

        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
          Payment Successful! 🎉
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '8px' }}>
          Welcome to <strong style={{ color: '#a78bfa' }}>{planLabel}</strong>
        </p>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px' }}>
          Your subscription is now active. Redirecting to dashboard in 5 seconds...
        </p>

        {/* Features unlocked */}
        <div style={{
          background: 'rgba(167, 139, 250, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={16} color="#a78bfa" />
            <span style={{ color: '#a78bfa', fontWeight: '600', fontSize: '14px' }}>Features Unlocked</span>
          </div>
          {['Unlimited Questions', 'All Stage Worksheets', 'Checkpoint Assessments', 'Geometry Tools', 'Interactive Whiteboard'].map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
              <CheckCircle size={14} color="#22c55e" />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{f}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          Go to Dashboard <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
