import { useMemo } from 'react';
import { next24h, currentHour, peakTraffic, peakAQI } from '../data/mockPredictions.js';
import { getAQHex } from '../config/mapConfig.js';
import { useAIPredictions } from '../hooks/useAIPredictions.js';
import { useLanguage } from '../context/LanguageContext.jsx';

function trafficColor(congestion) {
  if (congestion < 25) return '#22c55e';
  if (congestion < 50) return '#facc15';
  if (congestion < 75) return '#f97316';
  return '#ef4444';
}

function trafficLabel(congestion) {
  if (congestion < 25) return 'Free Flow';
  if (congestion < 50) return 'Slow';
  if (congestion < 75) return 'Congested';
  return 'Standstill';
}

function MiniBarChart({ bars, getValue, getColor, label, unit }) {
  const max = Math.max(...bars.map(getValue), 1);
  return (
    <div>
      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">{label}</p>
      <div className="flex items-end gap-0.5" style={{ height: '52px' }}>
        {bars.map((item, i) => {
          const val = getValue(item);
          const pct = Math.max(4, (val / max) * 100);
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-opacity hover:opacity-80"
              style={{ height: `${pct}%`, backgroundColor: getColor(val) }}
              title={`${item.timeLabel}: ${val}${unit}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-gray-600 mt-1">
        <span>{bars[0]?.timeLabel}</span>
        <span>{bars[Math.floor(bars.length / 2)]?.timeLabel}</span>
        <span>{bars[bars.length - 1]?.timeLabel}</span>
      </div>
    </div>
  );
}

function AlternativeRoutes() {
  const { tr } = useLanguage();
  const routes = [
    { from: 'Al-Farabi Ave', to: 'Abay Ave',   saving: '12 min', via: 'Furmanova St', congestion: 38 },
    { from: 'Raiymbek Ave',  to: 'N Bypass',    saving: '8 min',  via: 'Suyunbay Ave', congestion: 22 },
    { from: 'Seifullin Ave', to: 'Dostyk Ave',  saving: '6 min',  via: 'Pushkin St',   congestion: 44 },
  ];

  return (
    <div>
      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">{tr.forecast.altRoutes}</p>
      <div className="flex flex-col gap-1.5">
        {routes.map((r, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-2.5 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-medium truncate">
                {r.from} → {tr.forecast.altVia} {r.via}
              </p>
              <p className="text-gray-500 text-[10px] mt-0.5">
                {tr.forecast.altCong}: <span style={{ color: trafficColor(r.congestion) }}>{r.congestion}%</span>
              </p>
            </div>
            <span className="text-green-400 text-[10px] font-semibold shrink-0">−{r.saving}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ForecastPanel({ open, onClose }) {
  const { tr } = useLanguage();
  const bars = useMemo(() => next24h.filter((_, i) => i % 2 === 0), []);
  const { data: aiData, loading: aiLoading } = useAIPredictions();

  const cColor = trafficColor(currentHour.congestion);
  const aColor = getAQHex(currentHour.aqi);
  const tLabel = trafficLabel(currentHour.congestion);

  return (
    <div
      className={`absolute top-4 right-14 z-10 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 transition-all duration-300 ease-out ${
        open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
      }`}
    >
      <div className="sticky top-0 flex items-start justify-between px-4 py-3.5 border-b border-gray-700/50 bg-gray-900/95 backdrop-blur-sm rounded-t-2xl">
        <div>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">{tr.forecast.tag}</p>
          <h3 className="text-white font-semibold text-sm">{tr.forecast.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-xl leading-none mt-0.5 shrink-0"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/60 rounded-xl p-3">
            <p className="text-gray-500 text-[9px] uppercase tracking-wide mb-1">{tr.forecast.trafficNow}</p>
            <p className="font-bold text-xl leading-none" style={{ color: cColor }}>
              {currentHour.congestion}%
            </p>
            <p className="text-xs mt-0.5" style={{ color: cColor }}>{tLabel}</p>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3">
            <p className="text-gray-500 text-[9px] uppercase tracking-wide mb-1">{tr.forecast.aqiNow}</p>
            <p className="font-bold text-xl leading-none" style={{ color: aColor }}>
              {currentHour.aqi}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{currentHour.weather}</p>
          </div>
        </div>

        <MiniBarChart
          bars={bars}
          getValue={d => d.congestion}
          getColor={trafficColor}
          label={tr.forecast.trafficChart}
          unit="%"
        />

        <MiniBarChart
          bars={bars}
          getValue={d => d.aqi}
          getColor={getAQHex}
          label={tr.forecast.aqiChart}
          unit=""
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2 bg-gray-800/50 rounded-xl p-3">
            <div>
              <p className="text-white text-xs font-medium">{tr.forecast.peakTraffic}</p>
              <p className="text-[11px] mt-0.5" style={{ color: trafficColor(peakTraffic.congestion) }}>
                {tr.forecast.peakFmt(peakTraffic.congestion, peakTraffic.timeLabel)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-gray-800/50 rounded-xl p-3">
            <div>
              <p className="text-white text-xs font-medium">{tr.forecast.peakAQI}</p>
              <p className="text-[11px] mt-0.5" style={{ color: getAQHex(peakAQI.aqi) }}>
                {tr.forecast.aqiFmt(peakAQI.aqi, peakAQI.timeLabel)}
              </p>
            </div>
          </div>
        </div>

        {aiData?.trafficOutlook && (
          <div className="bg-gray-800/50 rounded-xl p-3">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">{tr.forecast.aiTraffic}</p>
            <p className="text-gray-300 text-xs leading-relaxed">{aiData.trafficOutlook}</p>
          </div>
        )}

        {aiData?.airOutlook && (
          <div className="bg-gray-800/50 rounded-xl p-3">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">{tr.forecast.aiAir}</p>
            <p className="text-gray-300 text-xs leading-relaxed">{aiData.airOutlook}</p>
          </div>
        )}

        <AlternativeRoutes />

        <CitizenAdvisory aiText={aiData?.citizenAdvisory} aiLoading={aiLoading} />

        <p className="text-gray-700 text-[9px] text-center">
          {tr.forecast.powered}
        </p>
      </div>
    </div>
  );
}

function CitizenAdvisory({ aiText, aiLoading }) {
  const { tr } = useLanguage();
  const cong = currentHour.congestion;
  const aqi  = currentHour.aqi;
  const fb   = tr.forecast.fallbacks;

  let fallback, color;
  if (aqi > 150)                      { fallback = fb.airBad;        color = '#ef4444'; }
  else if (cong > 75)                 { fallback = fb.trafficSevere; color = '#ef4444'; }
  else if (cong > 50)                 { fallback = fb.trafficHeavy;  color = '#f97316'; }
  else if (peakTraffic.congestion > 70) { fallback = fb.peakSoon(peakTraffic.congestion, peakTraffic.timeLabel); color = '#facc15'; }
  else                                { fallback = fb.good;          color = '#22c55e'; }

  const text = aiText || fallback;

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: color + '15', border: `1px solid ${color}33` }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase tracking-widest" style={{ color }}>{tr.forecast.advisory}</p>
        {aiLoading && <span className="text-[9px] text-gray-600 animate-pulse">{tr.forecast.aiGenerating}</span>}
        {aiText && <span className="text-[9px] text-gray-500">AI</span>}
      </div>
      <p className="text-gray-300 text-xs leading-relaxed">{text}</p>
    </div>
  );
}
