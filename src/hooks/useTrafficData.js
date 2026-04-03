import { useMemo } from 'react';
import { mockTrafficGeojson } from '../data/mockTraffic.js';

export function useTrafficData() {
  const geojson = useMemo(() => mockTrafficGeojson, []);

  return {
    geojson,
    loading: false,
    error: null,
  };
}
