import { useState, useCallback } from 'react';
import Map from './components/Map.jsx';
import LayerControls from './components/LayerControls.jsx';
import Legend from './components/Legend.jsx';
import InfoPanel from './components/InfoPanel.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import { useAirQuality } from './hooks/useAirQuality.js';
import { useTrafficData } from './hooks/useTrafficData.js';

const DEFAULT_LAYERS = {
  buildings:   true,
  trafficFlow: true,
  airQuality:  true,
};

export default function App() {
  const [layers, setLayers]                   = useState(DEFAULT_LAYERS);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [chatOpen, setChatOpen]               = useState(false);

  const { stations: airStations }     = useAirQuality();
  const { geojson: trafficGeojson }   = useTrafficData();

  const handleToggle = useCallback((id) => {
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleFeatureClick = useCallback((feature) => {
    setSelectedFeature(feature);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
  const hasToken = Boolean(token);
  const isSecretToken = token.startsWith('sk.');

  if (!hasToken || isSecretToken) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-950 text-white">
        <div className="max-w-md text-center p-8 bg-gray-900 rounded-2xl shadow-xl border border-gray-700">
          <h1 className="text-xl font-bold mb-2">Uly Dala</h1>
          {isSecretToken ? (
            <>
              <p className="text-red-400 text-sm font-semibold mb-2">
                Secret token detected (<code className="bg-gray-800 px-1 py-0.5 rounded">sk.*</code>)
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Mapbox requires a <strong className="text-white">public token</strong>{' '}
                (<code className="bg-gray-800 px-1 py-0.5 rounded text-cyan-400">pk.*</code>) in frontend apps.
                Go to your Mapbox account, create a new public token, and update{' '}
                <code className="bg-gray-800 px-1 py-0.5 rounded text-cyan-400">VITE_MAPBOX_TOKEN</code> in{' '}
                <code className="bg-gray-800 px-1 py-0.5 rounded text-cyan-400">.env</code>.
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-sm mb-4">
              A <code className="bg-gray-800 px-1 py-0.5 rounded text-cyan-400">VITE_MAPBOX_TOKEN</code> is
              required. Copy <code className="bg-gray-800 px-1 py-0.5 rounded text-cyan-400">.env.example</code>{' '}
              to <code className="bg-gray-800 px-1 py-0.5 rounded text-cyan-400">.env</code> and fill in your
              public Mapbox token.
            </p>
          )}
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg transition-colors"
          >
            Open Mapbox token dashboard →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Map
        layers={layers}
        airStations={airStations}
        onFeatureClick={handleFeatureClick}
      />

      <LayerControls layers={layers} onToggle={handleToggle} />
      <Legend layers={layers} />

      <InfoPanel feature={selectedFeature} onClose={handleClosePanel} />

      {chatOpen ? (
        <ChatPanel onClose={() => setChatOpen(false)} />
      ) : (
        <button
          onClick={() => setChatOpen(true)}
          className="absolute bottom-4 right-4 z-20 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-2xl transition-colors border border-cyan-500/30"
        >
          AI Chat
        </button>
      )}

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-full pl-3 pr-5 py-1.5 border border-gray-700/50 shadow-xl flex items-center gap-2">
          <img src="/logo.png" alt="Uly Dala" className="h-7 w-7 rounded-full object-cover" />
          <span className="text-white text-sm font-semibold tracking-wide">Uly Dala</span>
        </div>
      </div>

      <div className="absolute bottom-16 right-4 z-10 flex flex-col items-end gap-1.5">
        <CountBadge label="Air Quality" count={airStations.length} color="cyan" />
        <CountBadge label="Road Segments" count={trafficGeojson?.features?.length ?? 0} color="orange" />
      </div>
    </div>
  );
}

function CountBadge({ label, count, color }) {
  const colorMap = {
    cyan:   'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  };
  return (
    <div className={`text-xs px-2.5 py-1 rounded-full border ${colorMap[color]} backdrop-blur-sm`}>
      {label}: {count} {count === 1 ? 'item' : 'items'}
    </div>
  );
}
