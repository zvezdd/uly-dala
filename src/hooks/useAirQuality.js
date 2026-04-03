import { useState, useEffect } from 'react';

const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN || '';

const ALMATY_BOUNDS = '42.8,76.5,43.6,77.4';

export function useAirQuality() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!WAQI_TOKEN) {
      setError('WAQI token not set — add VITE_WAQI_TOKEN to .env');
      return;
    }

    const controller = new AbortController();

    async function fetchStations() {
      try {
        setLoading(true);
        setError(null);

        const url = `https://api.waqi.info/map/bounds/?latlng=${ALMATY_BOUNDS}&token=${WAQI_TOKEN}`;
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) throw new Error(`WAQI API error: ${res.status}`);
        const data = await res.json();

        if (data.status !== 'ok') {
          throw new Error(data.data || 'WAQI returned non-ok status');
        }

        const parsed = data.data.map((s) => ({
          id: s.uid,
          name: s.station?.name || `Station ${s.uid}`,
          aqi: typeof s.aqi === 'number' ? s.aqi : parseInt(s.aqi, 10) || 0,
          coordinates: [s.lon, s.lat],
          time: s.station?.time || null,
        }));

        setStations(parsed);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('useAirQuality error:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStations();

    const interval = setInterval(fetchStations, 10 * 60 * 1000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [WAQI_TOKEN]);

  return { stations, loading, error };
}
