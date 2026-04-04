import { AQ_COLOR_SCALE, TRAFFIC_LEVEL_COLORS } from '../config/mapConfig.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Legend({ layers }) {
  const { tr } = useLanguage();
  const showAQ      = layers.airQuality;
  const showTraffic = layers.trafficFlow;

  if (!showAQ && !showTraffic) return null;

  return (
    <div className="absolute bottom-10 left-4 z-10 flex flex-col gap-3">
      {showAQ && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700/50">
          <p className="text-white text-[10px] font-semibold uppercase tracking-widest mb-2.5 opacity-70">
            {tr.legend.aqiScale}
          </p>
          <div className="flex flex-col gap-1.5">
            {AQ_COLOR_SCALE.map((band, i) => (
              <div key={band.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: band.hex }} />
                <span className="text-xs text-gray-300">
                  {tr.legend.aqLabels[i]}
                  {band.max !== Infinity && (
                    <span className="text-gray-500 ml-1">≤{band.max}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTraffic && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700/50">
          <p className="text-white text-[10px] font-semibold uppercase tracking-widest mb-2.5 opacity-70">
            {tr.legend.trafficFlow}
          </p>
          <div className="flex flex-col gap-1.5">
            {Object.entries(tr.legend.trafficLabels).map(([level, label]) => (
              <div key={level} className="flex items-center gap-2">
                <span
                  className="w-5 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: TRAFFIC_LEVEL_COLORS[Number(level)] }}
                />
                <span className="text-xs text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
