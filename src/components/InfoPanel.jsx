import { getAQHex, getAQLabel, TRAFFIC_LEVEL_COLORS, TRAFFIC_LEVEL_LABELS } from '../config/mapConfig.js';

export default function InfoPanel({ feature, onClose }) {
  if (!feature) return null;

  return (
    <div className="absolute top-4 right-14 z-10 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50">
      <div className="sticky top-0 flex items-start justify-between px-4 py-3.5 border-b border-gray-700/50 bg-gray-900/95 backdrop-blur-sm rounded-t-2xl">
        <div className="flex-1 pr-3">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">
            {feature.type === 'air-quality' ? 'Air Quality Station' : 'Road Segment'}
          </p>
          <h3 className="text-white font-semibold text-sm leading-tight">
            {feature.type === 'air-quality'
              ? (feature.data.name || 'Air Quality Station')
              : (feature.data.roadName || 'Road')}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-xl leading-none mt-0.5 flex-shrink-0"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="p-4">
        {feature.type === 'air-quality' ? (
          <AirQualityDetail data={feature.data} />
        ) : (
          <TrafficLineDetail data={feature.data} />
        )}
      </div>
    </div>
  );
}

function AirQualityDetail({ data }) {
  const aqi = Number(data.aqi);
  const color = getAQHex(aqi);
  const label = getAQLabel(aqi);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg flex-shrink-0"
          style={{ backgroundColor: color + '22', border: `2px solid ${color}` }}
        >
          <span className="text-white font-bold text-2xl leading-none" style={{ color }}>
            {aqi}
          </span>
          <span className="text-gray-400 text-[9px] uppercase tracking-wide mt-0.5">AQI</span>
        </div>
        <div>
          <p className="text-white font-semibold text-base leading-tight">{label}</p>
          {data.dominantPollutant && (
            <p className="text-gray-400 text-xs mt-1">
              Dominant: <span className="text-gray-200">{data.dominantPollutant}</span>
            </p>
          )}
          {data.updatedAt && (
            <p className="text-gray-500 text-[10px] mt-1">
              Updated {new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      <Section title="Pollutants">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <PollutantBar label="PM2.5" value={data.pm25} unit="μg/m³" max={150} warn={35}  danger={75}  />
          <PollutantBar label="PM10"  value={data.pm10} unit="μg/m³" max={250} warn={54}  danger={154} />
          <PollutantBar label="NO₂"   value={data.no2}  unit="μg/m³" max={200} warn={54}  danger={100} />
          <PollutantBar label="O₃"    value={data.o3}   unit="μg/m³" max={180} warn={100} danger={140} />
          <PollutantBar label="CO"    value={data.co}   unit="mg/m³"  max={10}  warn={4}   danger={7}   />
          <PollutantBar label="SO₂"   value={data.so2}  unit="μg/m³" max={200} warn={20}  danger={80}  />
        </div>
      </Section>

      {(data.temperature !== undefined || data.humidity !== undefined || data.windSpeed !== undefined) && (
        <Section title="Weather Conditions">
          <div className="grid grid-cols-3 gap-2">
            {data.temperature !== undefined && (
              <WeatherTile icon="🌡️" value={`${data.temperature}°C`} label="Temp" />
            )}
            {data.humidity !== undefined && (
              <WeatherTile icon="💧" value={`${data.humidity}%`} label="Humidity" />
            )}
            {data.windSpeed !== undefined && (
              <WeatherTile icon="💨" value={`${data.windSpeed} km/h`} label={`Wind ${data.windDirection || ''}`} />
            )}
          </div>
        </Section>
      )}

      <div className="rounded-xl p-3" style={{ backgroundColor: color + '15', border: `1px solid ${color}33` }}>
        <p className="text-gray-300 text-xs leading-relaxed">{getAQAdvice(aqi)}</p>
      </div>
    </div>
  );
}

function TrafficLineDetail({ data }) {
  const level = Number(data.level) || 1;
  const color = TRAFFIC_LEVEL_COLORS[level] || '#94a3b8';
  const label = data.levelLabel || TRAFFIC_LEVEL_LABELS[level] || 'Unknown';
  const pct = Math.max(0, Math.min(100, 100 - Number(data.congestionPct || 0)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-lg"
          style={{ backgroundColor: color + '20', border: `2px solid ${color}` }}
        >
          <TrafficIcon level={level} color={color} />
        </div>
        <div>
          <p className="text-white font-semibold text-base" style={{ color }}>{label}</p>
          <p className="text-gray-400 text-xs mt-0.5">{data.roadName}</p>
        </div>
      </div>

      <Section title="Speed">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Current speed</span>
            <span className="text-white font-semibold">{data.currentSpeed} km/h</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Free flow speed</span>
            <span className="text-gray-300">{data.freeFlowSpeed} km/h</span>
          </div>
          <div className="mt-1">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>Traffic flow</span>
              <span>{pct}% of normal</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        </div>
      </Section>

      <div className="rounded-xl p-3" style={{ backgroundColor: color + '15', border: `1px solid ${color}33` }}>
        <p className="text-gray-300 text-xs leading-relaxed">{getTrafficAdvice(level, data.congestionPct)}</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">{title}</p>
      {children}
    </div>
  );
}

function PollutantBar({ label, value, unit, max, warn, danger }) {
  const v = Number(value) || 0;
  const pct = Math.min(100, (v / max) * 100);
  const barColor = v >= danger ? '#ef4444' : v >= warn ? '#f97316' : '#22c55e';

  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-gray-400 text-[10px]">{label}</span>
        <span className="text-gray-200 text-[10px] font-medium">{v} <span className="text-gray-500">{unit}</span></span>
      </div>
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}

function WeatherTile({ icon, value, label }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-2 flex flex-col items-center gap-0.5">
      <span className="text-base">{icon}</span>
      <span className="text-white text-xs font-semibold">{value}</span>
      <span className="text-gray-500 text-[9px] text-center leading-tight">{label}</span>
    </div>
  );
}

function TrafficIcon({ level, color }) {
  const icons = { 1: '→', 2: '↝', 3: '⤳', 4: '✕' };
  return (
    <span className="text-xl font-bold" style={{ color }}>
      {icons[level] || '→'}
    </span>
  );
}

function getAQAdvice(aqi) {
  if (aqi <= 50)  return 'Air quality is satisfactory. Great conditions for outdoor activities.';
  if (aqi <= 100) return 'Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.';
  if (aqi <= 150) return 'Sensitive groups (children, elderly, heart/lung conditions) should reduce prolonged outdoor exertion.';
  if (aqi <= 200) return 'Everyone should reduce prolonged outdoor exertion. Sensitive groups should avoid outdoor activity.';
  if (aqi <= 300) return 'Health alert: everyone may experience health effects. Move activities indoors and reduce outdoor exertion.';
  return 'Emergency conditions. Entire population is at risk. Avoid all outdoor activities.';
}

function getTrafficAdvice(level, congestionPct) {
  const pct = Number(congestionPct) || 0;
  if (level === 1) return `Traffic is flowing freely at ${100 - pct}% of normal speed. Good conditions for travel.`;
  if (level === 2) return `Traffic is moving slowly — ${pct}% congestion. Expect minor delays. Consider alternate routes.`;
  if (level === 3) return `Heavy congestion — ${pct}% slower than normal. Significant delays expected. Plan extra travel time.`;
  return `Standstill traffic — road is nearly stopped. Avoid this route if possible or wait for conditions to improve.`;
}
