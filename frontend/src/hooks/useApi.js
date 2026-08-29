import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Generic data-fetching hook.
 * Usage:  const { data, loading, error, refetch } = useApi(adminApi.getDashboard);
 */
export const useApi = (fn, params = null, deps = []) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await (params !== null ? fn(params) : fn());
      setData(res?.data?.data ?? res?.data ?? res);
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

/**
 * Mutation hook — for POST / PUT / DELETE actions.
 * Usage:  const { mutate, loading } = useMutation(adminApi.createQuestion, { onSuccess });
 */
export const useMutation = (fn, { onSuccess, onError, successMsg } = {}) => {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    try {
      const res = await fn(...args);
      if (successMsg) toast.success(successMsg);
      onSuccess?.(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Action failed';
      toast.error(msg);
      onError?.(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn, onSuccess, onError, successMsg]);

  return { mutate, loading };
};