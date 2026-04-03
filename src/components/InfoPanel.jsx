import { getAQHex } from '../config/mapConfig.js';

export default function InfoPanel({ feature, onClose }) {
  if (!feature) return null;

  return (
    <div className="absolute top-4 right-14 z-10 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 w-72 overflow-hidden">
      <div className="flex items-start justify-between p-4 border-b border-gray-700/50">
        <h3 className="text-white font-semibold text-sm leading-tight pr-2">
          {feature.type === 'air-quality'
            ? feature.data.name || 'Air Quality Station'
            : feature.data.description || 'Traffic Incident'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors flex-shrink-0 text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="p-4">
        {feature.type === 'air-quality' ? (
          <AirQualityDetail data={feature.data} />
        ) : (
          <TrafficDetail data={feature.data} />
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {aqi}
        </div>
        <div>
          <p className="text-white font-semibold">{label}</p>
          <p className="text-gray-400 text-xs mt-0.5">Air Quality Index</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Row label="Station" value={data.name} />
        {data.time && (
          <Row
            label="Updated"
            value={new Date(data.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
        )}
      </div>

      <p className="text-gray-400 text-xs leading-relaxed bg-gray-800/50 rounded-lg p-2.5">
        {getAQAdvice(aqi)}
      </p>
    </div>
  );
}

function TrafficDetail({ data }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{getCategoryEmoji(data.iconCategory)}</span>
        <div>
          <p className="text-white font-semibold text-sm">{data.category}</p>
          <p className="text-gray-400 text-xs">{data.description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-1">
        {data.from && <Row label="From" value={data.from} />}
        {data.to && <Row label="To" value={data.to} />}
        {data.roadNumbers?.length > 0 && (
          <Row label="Road" value={data.roadNumbers.join(', ')} />
        )}
        {data.delay > 0 && (
          <Row label="Delay" value={formatDelay(data.delay)} />
        )}
        {data.startTime && (
          <Row
            label="Since"
            value={new Date(data.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
        )}
      </div>

      <MagnitudeBadge magnitude={data.magnitude} />
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-gray-500 w-14 flex-shrink-0">{label}</span>
      <span className="text-gray-200 break-words">{value}</span>
    </div>
  );
}

function MagnitudeBadge({ magnitude }) {
  const labels = ['', 'Unknown', 'Minor', 'Moderate', 'Major'];
  const colors = ['', 'bg-gray-600', 'bg-yellow-600', 'bg-orange-600', 'bg-red-700'];
  if (!magnitude) return null;

  return (
    <span
      className={`inline-block text-xs text-white px-2 py-0.5 rounded-full ${colors[magnitude] || 'bg-gray-600'}`}
    >
      {labels[magnitude] || 'Incident'}
    </span>
  );
}

function getAQLabel(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAQAdvice(aqi) {
  if (aqi <= 50) return 'Air quality is satisfactory. Enjoy outdoor activities.';
  if (aqi <= 100) return 'Unusually sensitive people should consider limiting prolonged outdoor exertion.';
  if (aqi <= 150) return 'People with heart or lung disease, older adults, and children should reduce prolonged outdoor exertion.';
  if (aqi <= 200) return 'Everyone should reduce prolonged outdoor exertion. Sensitive groups should avoid it.';
  if (aqi <= 300) return 'Everyone should avoid prolonged outdoor exertion. Move activities indoors.';
  return 'Health alert: everyone may experience serious health effects. Avoid all outdoor activities.';
}

function getCategoryEmoji(code) {
  const icons = {
    1: '💥', 2: '🌫️', 3: '⚠️', 4: '🌧️', 5: '🧊',
    6: '🚦', 7: '🚧', 8: '🚫', 9: '🔧', 10: '💨',
    11: '🌊', 14: '🚗',
  };
  return icons[code] || '⚠️';
}

function formatDelay(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
