import { useMemo } from 'react';
import { mockAirQualityStations } from '../data/mockAirQuality.js';

export function useAirQuality() {
  const stations = useMemo(() => mockAirQualityStations, []);

  return {
    stations,
    loading: false,
    error: null,
  };
}
