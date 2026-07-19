import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import toast from 'react-hot-toast';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TFJan710onN37o';

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
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // Create order on backend
      const { data } = await api.post('/payment/create-order', { plan });
      if (!data.success) throw new Error(data.message || 'Failed to create payment order');

      const order = data.order;

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Mentara Labs',
        description: order.planLabel,
        image: 'https://www.mentp.com/mentara-new.png',
        order_id: order.id,
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#0f172a',
          backdrop_color: 'rgba(9, 13, 22, 0.85)',
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
            const msg = err.response?.data?.message || err.message || 'Payment verification failed';
            setError(msg);
            toast.error(msg);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        const msg = response.error?.description || 'Payment failed';
        setError(msg);
        toast.error(msg);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Payment failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { startPayment, loading, error };
};

export default useRazorpay;
