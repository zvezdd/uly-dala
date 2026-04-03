export const ALMATY_CENTER = [76.9286, 43.2567];

export const MAP_CONFIG = {
  center: ALMATY_CENTER,
  zoom: 12,
  pitch: 45,
  bearing: -17.6,
  style: 'mapbox://styles/mapbox/dark-v11',
};

export const AQ_COLOR_SCALE = [
  { max: 50,  label: 'Good',        color: [0, 228, 0],     hex: '#00e400' },
  { max: 100, label: 'Moderate',    color: [255, 255, 0],   hex: '#ffff00' },
  { max: 150, label: 'Unhealthy*',  color: [255, 126, 0],   hex: '#ff7e00' },
  { max: 200, label: 'Unhealthy',   color: [255, 0, 0],     hex: '#ff0000' },
  { max: 300, label: 'Very Unhealthy', color: [143, 63, 151], hex: '#8f3f97' },
  { max: Infinity, label: 'Hazardous', color: [126, 0, 35], hex: '#7e0023' },
];

export const getAQColor = (aqi) => {
  for (const band of AQ_COLOR_SCALE) {
    if (aqi <= band.max) return band.color;
  }
  return AQ_COLOR_SCALE[AQ_COLOR_SCALE.length - 1].color;
};

export const getAQHex = (aqi) => {
  for (const band of AQ_COLOR_SCALE) {
    if (aqi <= band.max) return band.hex;
  }
  return AQ_COLOR_SCALE[AQ_COLOR_SCALE.length - 1].hex;
};

export const TRAFFIC_INCIDENT_COLORS = {
  Accident:      '#ef4444',
  Congestion:    '#f97316',
  RoadWork:      '#eab308',
  LaneClosed:    '#a855f7',
  RoadClosed:    '#dc2626',
  Unknown:       '#6b7280',
};
