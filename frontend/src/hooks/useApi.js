/**
 * Segmint — Custom API Hooks
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data fetching hook.
 */
export function useApi(fetchFn, deps = [], autoFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, deps);

  return { data, loading, error, execute, setData };
}

/**
 * Polling hook — calls fetchFn every interval ms while active.
 */
export function usePolling(fetchFn, intervalMs = 2000, active = false) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!active) return;

    let mounted = true;
    const poll = async () => {
      try {
        const response = await fetchFn();
        if (mounted) setData(response.data);
      } catch (err) {
        // silently ignore polling errors
      }
    };

    poll(); // immediate first poll
    const interval = setInterval(poll, intervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchFn, intervalMs, active]);

  return data;
}
