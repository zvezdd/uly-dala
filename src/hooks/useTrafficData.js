import { useState, useEffect } from 'react';

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_KEY || '';

const ALMATY_BBOX = '42.85,76.65,43.45,77.25';

export function useTrafficData() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!TOMTOM_KEY) {
      setLoading(false);
      setError('TomTom API key not set (VITE_TOMTOM_KEY)');
      return;
    }

    const controller = new AbortController();

    async function fetchIncidents() {
      try {
        setLoading(true);
        setError(null);

        const url =
          `https://api.tomtom.com/traffic/services/5/incidentDetails` +
          `?key=${TOMTOM_KEY}` +
          `&bbox=${ALMATY_BBOX}` +
          `&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}` +
          `&language=en-GB` +
          `&categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11,14` +
          `&timeValidityFilter=present`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`TomTom API error: ${res.status}`);
        const data = await res.json();

        const parsed = (data.incidents || []).map((inc, idx) => {
          const props = inc.properties || {};
          const coords =
            inc.geometry?.type === 'Point'
              ? inc.geometry.coordinates
              : inc.geometry?.coordinates?.[0] || [76.9286, 43.2567];

          return {
            id: idx,
            type: inc.type || 'Unknown',
            iconCategory: props.iconCategory || 0,
            category: getCategoryName(props.iconCategory),
            delay: props.delay || 0,
            magnitude: props.magnitudeOfDelay || 0,
            description: props.events?.[0]?.description || 'Traffic incident',
            from: props.from || '',
            to: props.to || '',
            roadNumbers: props.roadNumbers || [],
            startTime: props.startTime || null,
            coordinates: coords,
            geometry: inc.geometry,
          };
        });

        setIncidents(parsed);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('useTrafficData error:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();

    const interval = setInterval(fetchIncidents, 3 * 60 * 1000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return { incidents, loading, error };
}

function getCategoryName(code) {
  const categories = {
    0:  'Unknown',
    1:  'Accident',
    2:  'Fog',
    3:  'Dangerous Conditions',
    4:  'Rain',
    5:  'Ice',
    6:  'Jam',
    7:  'Lane Closed',
    8:  'Road Closed',
    9:  'Road Works',
    10: 'Wind',
    11: 'Flooding',
    14: 'Broken Down Vehicle',
  };
  return categories[code] || 'Incident';
}
