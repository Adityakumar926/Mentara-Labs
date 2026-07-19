import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const startPayment = async ({ plan, user, onSuccess }) => {
    setError(null);
    setLoading(true);

    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error('Failed to load Razorpay. Check your internet connection.');
      }

      // Create order on backend
      const { data } = await api.post('/payment/create-order', { plan });
      if (!data.success) throw new Error(data.message);

      const order = data.order;

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Mentara Labs',
        description: order.planLabel,
        image: '/mentara-new.png',
        order_id: order.id,
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#6C63FF',
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            });

            if (verifyRes.data.success) {
              onSuccess?.(verifyRes.data.user);
              navigate('/payment/success', {
                state: { plan, planLabel: order.planLabel },
              });
            } else {
              throw new Error(verifyRes.data.message);
            }
          } catch (err) {
            setError(err.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error.description || 'Payment failed');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { startPayment, loading, error };
};

export default useRazorpay;
