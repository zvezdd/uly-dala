function pseudo(n) {
  return (Math.sin(n * 9301 + 49297) * 233280 + 233280) % 1;
}

function baseCongestion(hour, dow) {
  const weekend = dow === 0 || dow === 6;
  if (hour <= 5 || hour >= 23) return 9;
  if (weekend) {
    if (hour >= 12 && hour <= 15) return 40;
    if (hour >= 17 && hour <= 20) return 44;
    return 22;
  }
  if (dow === 5 && hour >= 17 && hour <= 19) return 86;
  if (hour >= 7 && hour <= 9)  return 76;
  if (hour >= 17 && hour <= 19) return 81;
  if (hour >= 10 && hour <= 16) return 45;
  return 27;
}

function baseAQI(hour, dow) {
  const weekend = dow === 0 || dow === 6;
  const base = weekend ? 52 : 74;
  if (hour >= 0 && hour <= 4)   return Math.round(base * 0.58);
  if (hour >= 7 && hour <= 10)  return Math.round(base * 1.42);
  if (hour >= 17 && hour <= 21) return Math.round(base * 1.38);
  return base;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEATHERS  = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Foggy'];

const _now = new Date();
_now.setMinutes(0, 0, 0);

export const hourlyForecast = Array.from({ length: 72 }, (_, i) => {
  const date    = new Date(_now.getTime() + i * 3_600_000);
  const hour    = date.getHours();
  const dow     = date.getDay();
  const noise   = (pseudo(i * 41 + 123) - 0.5) * 14;
  const aqNoise = (pseudo(i * 37 + 456) - 0.5) * 22;
  const cong    = Math.max(5, Math.min(97, Math.round(baseCongestion(hour, dow) + noise)));
  const aqi     = Math.max(12, Math.min(260, Math.round(baseAQI(hour, dow) + aqNoise)));
  const wx      = WEATHERS[Math.floor(pseudo(i * 53 + 789) * WEATHERS.length)];

  return {
    index:        i,
    timestamp:    date.toISOString(),
    timeLabel:    i === 0 ? 'Now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dayLabel:     DAY_NAMES[dow],
    hour,
    dow,
    congestion:   cong,
    trafficLevel: cong < 25 ? 1 : cong < 50 ? 2 : cong < 75 ? 3 : 4,
    aqi,
    weather:      wx,
  };
});

export const next24h = hourlyForecast.slice(0, 24);
export const next72h = hourlyForecast;

export const currentHour = hourlyForecast[0];

export const peakTraffic = next24h.reduce((m, h) => h.congestion > m.congestion ? h : m);
export const peakAQI     = next24h.reduce((m, h) => h.aqi > m.aqi ? h : m);

function sliceAvg(from, to) {
  const slice = hourlyForecast.slice(from, to);
  return {
    avgCongestion: Math.round(slice.reduce((s, h) => s + h.congestion, 0) / slice.length),
    avgAQI:        Math.round(slice.reduce((s, h) => s + h.aqi, 0) / slice.length),
  };
}

export const threeDayOutlook = [
  { day: 'Today',     ...sliceAvg(0,  24) },
  { day: 'Tomorrow',  ...sliceAvg(24, 48) },
  { day: 'Day After', ...sliceAvg(48, 72) },
];
