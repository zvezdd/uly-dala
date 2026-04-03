import { AQ_COLOR_SCALE } from '../config/mapConfig.js';

export default function Legend({ layers }) {
  const showAQ = layers.airQuality;
  const showTraffic = layers.trafficFlow || layers.trafficIncidents;

  if (!showAQ && !showTraffic) return null;

  return (
    <div className="absolute bottom-10 left-4 z-10 flex flex-col gap-3">
      {showAQ && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700/50">
          <p className="text-white text-xs font-semibold uppercase tracking-widest mb-2 opacity-70">
            AQI Scale
          </p>
          <div className="flex flex-col gap-1.5">
            {AQ_COLOR_SCALE.map((band) => (
              <div key={band.label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: band.hex }}
                />
                <span className="text-xs text-gray-300">
                  {band.label}
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
          <p className="text-white text-xs font-semibold uppercase tracking-widest mb-2 opacity-70">
            Traffic
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-sm bg-green-400 flex-shrink-0" />
              <span className="text-xs text-gray-300">Free flow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-sm bg-yellow-400 flex-shrink-0" />
              <span className="text-xs text-gray-300">Slow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-sm bg-red-500 flex-shrink-0" />
              <span className="text-xs text-gray-300">Congested</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
