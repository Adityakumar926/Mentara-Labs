import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

// In-memory cache & in-flight request deduplication for instant page transitions
const apiCache = new Map();
const inFlightRequests = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds fresh window

function getCacheKey(fn, params, deps) {
  const fnKey = fn?.name || fn?.toString()?.slice(0, 120) || 'anon';
  let paramKey = '';
  try {
    paramKey = JSON.stringify({ params, deps });
  } catch {
    paramKey = String(params);
  }
  return `${fnKey}::${paramKey}`;
}

/**
 * Generic data-fetching hook with stale-while-revalidate caching.
 * Usage:  const { data, loading, error, refetch } = useApi(adminApi.getDashboard);
 */
export const useApi = (fn, params = null, deps = []) => {
  const cacheKey = getCacheKey(fn, params, deps);
  const cachedEntry = apiCache.get(cacheKey);

  const [data, setData] = useState(() => (cachedEntry ? cachedEntry.data : null));
  const [loading, setLoading] = useState(() => !cachedEntry);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (force = false) => {
    const existing = apiCache.get(cacheKey);
    const isFresh = existing && Date.now() - existing.ts < CACHE_TTL_MS;

    if (!force && existing) {
      setData(existing.data);
      setLoading(false);
      if (isFresh) return existing.data;
    } else {
      setLoading(true);
    }

    setError(null);
    try {
      let promise = !force ? inFlightRequests.get(cacheKey) : null;
      if (!promise) {
        promise = (params !== null ? fn(params) : fn());
        inFlightRequests.set(cacheKey, promise);
      }
      const res = await promise;
      inFlightRequests.delete(cacheKey);

      const resolved = res?.data?.data ?? res?.data ?? res;
      apiCache.set(cacheKey, { data: resolved, ts: Date.now() });
      setData(resolved);
      return resolved;
    } catch (err) {
      inFlightRequests.delete(cacheKey);
      const msg = err.response?.data?.message ?? err.message ?? 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ...deps]);

  useEffect(() => {
    fetch(false);
  }, [fetch]);

  const manualRefetch = useCallback(() => fetch(true), [fetch]);

  return { data, loading, error, refetch: manualRefetch };
};

/**
 * Progressive "One-by-One" item reveal hook with automatic scroll pagination.
 * Reveals items sequentially one by one (every intervalMs) so heavy lists/grids
 * start appearing immediately and stream into view without blocking the UI.
 */
export const useProgressiveItems = (
  items = [],
  { initialCount = 1, step = 1, intervalMs = 55, batchSize = 18, resetKey = '' } = {}
) => {
  const safeItems = Array.isArray(items) ? items : [];
  const totalCount = safeItems.length;

  const [batchLimit, setBatchLimit] = useState(batchSize);
  const [revealedCount, setRevealedCount] = useState(() =>
    Math.min(initialCount, totalCount)
  );
  const sentinelRef = useRef(null);

  // Reset progressive stream when filter/tab/search changes
  useEffect(() => {
    setBatchLimit(batchSize);
    setRevealedCount(Math.min(initialCount, safeItems.length));
  }, [resetKey, batchSize, initialCount, safeItems.length]);

  const targetCount = Math.min(batchLimit, totalCount);

  // Reveal items one by one up to targetCount
  useEffect(() => {
    if (revealedCount >= targetCount) return;
    const timer = setTimeout(() => {
      setRevealedCount((prev) => Math.min(prev + step, targetCount));
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [revealedCount, targetCount, step, intervalMs]);

  // Automatically expand batchLimit when scrolling near the bottom sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || batchLimit >= totalCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setBatchLimit((prev) => Math.min(prev + batchSize, totalCount));
        }
      },
      { rootMargin: '240px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [batchLimit, totalCount, batchSize, revealedCount]);

  const visibleItems = safeItems.slice(0, revealedCount);
  const isStreaming = revealedCount < targetCount;
  const hasMoreBatches = batchLimit < totalCount;

  const loadMore = useCallback(() => {
    setBatchLimit((prev) => Math.min(prev + batchSize, totalCount));
  }, [batchSize, totalCount]);

  return {
    visibleItems,
    revealedCount,
    totalCount,
    isStreaming,
    hasMoreBatches,
    sentinelRef,
    loadMore,
  };
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
      apiCache.clear(); // Invalidate GET cache on mutation
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