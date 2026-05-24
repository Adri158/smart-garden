import { useState, useEffect, useRef } from 'react';
import { getServerStats } from '../api/serverApi';

export function useServerStats(intervalMs = 2000) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        const raw = await getServerStats();
        if (!cancelled) {


          const normalized = {
            cpu: raw?.cpu?.percent ?? null,
            ram: raw?.memory
              ? {
                  used: raw.memory.used_bytes,
                  total: raw.memory.total_bytes,
                  used_percent: raw.memory.percent,
                }
              : null,
            disk: raw?.disk
              ? {
                  used: raw.disk.used_bytes,
                  total: raw.disk.total_bytes,
                  used_percent: raw.disk.percent,
                }
              : null,
            uptime: raw?.uptime?.seconds ?? null,
            load_avg: raw?.load_avg ?? null,

            _raw: raw,
          };
          setStats(normalized);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }


    fetch();


    timerRef.current = setInterval(fetch, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timerRef.current);
    };
  }, [intervalMs]);

  return { stats, loading, error };
}
