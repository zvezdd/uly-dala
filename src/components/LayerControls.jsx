export default function LayerControls({ layers, onToggle }) {
  const controls = [
    {
      id: 'buildings',
      label: '3D Buildings',
      icon: '🏢',
      color: '#475569',
    },
    {
      id: 'trafficFlow',
      label: 'Traffic Flow',
      icon: '🚗',
      color: '#f97316',
    },
    {
      id: 'trafficIncidents',
      label: 'Incidents',
      icon: '⚠️',
      color: '#ef4444',
    },
    {
      id: 'airQuality',
      label: 'Air Quality',
      icon: '🌫️',
      color: '#22d3ee',
    },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700/50 min-w-[180px]">
      <h2 className="text-white text-xs font-semibold uppercase tracking-widest mb-3 opacity-70">
        Layers
      </h2>
      <div className="flex flex-col gap-2">
        {controls.map(({ id, label, icon, color }) => (
          <label
            key={id}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={layers[id]}
                onChange={() => onToggle(id)}
                className="sr-only peer"
              />
              <div
                className="w-9 h-5 rounded-full transition-colors duration-200 peer-checked:opacity-100 opacity-40"
                style={{ backgroundColor: color }}
              />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors select-none">
              {icon} {label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
