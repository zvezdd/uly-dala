export default function LayerControls({ layers, onToggle, onDashboard, onBack }) {
  const controls = [
    { id: 'buildings',   label: '3D Buildings',  color: '#475569' },
    { id: 'trafficFlow', label: 'Traffic Flow',   color: '#f97316' },
    { id: 'airQuality',  label: 'Air Quality',    color: '#22d3ee' },
  ];

  return (
    <div
      className="absolute top-4 left-4 z-10 rounded-xl p-4 shadow-2xl min-w-[180px]"
      style={{ background: 'rgba(10,22,40,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <h2 className="text-white text-[10px] font-semibold uppercase tracking-widest mb-3 opacity-50">
        Layers
      </h2>
      <div className="flex flex-col gap-2.5">
        {controls.map(({ id, label, color }) => (
          <label key={id} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative shrink-0">
              <input
                type="checkbox"
                checked={layers[id]}
                onChange={() => onToggle(id)}
                className="sr-only peer"
              />
              <div
                className="w-9 h-5 rounded-full transition-colors duration-200 peer-checked:opacity-100 opacity-25"
                style={{ backgroundColor: color }}
              />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors select-none">
              {label}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={onDashboard}
          className="w-full flex items-center gap-2 justify-center text-white rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200"
          style={{ background: '#3b9eff', boxShadow: '0 2px 12px rgba(59,158,255,0.25)' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,158,255,0.45)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(59,158,255,0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Dashboard
        </button>
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center text-xs font-medium rounded-lg px-3 py-2 transition-all duration-200"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.45)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
        >
          ← Home
        </button>
      </div>
    </div>
  );
}
