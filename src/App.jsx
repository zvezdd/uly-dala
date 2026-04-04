import { useState, useCallback } from 'react';
import Map from './components/Map.jsx';
import LayerControls from './components/LayerControls.jsx';
import Legend from './components/Legend.jsx';
import InfoPanel from './components/InfoPanel.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import ForecastPanel from './components/ForecastPanel.jsx';
import AkimatDashboard from './components/AkimatDashboard.jsx';
import LandingPage from './components/LandingPage.jsx';
import { useAirQuality } from './hooks/useAirQuality.js';
import { useTrafficData } from './hooks/useTrafficData.js';
import { currentHour } from './data/mockPredictions.js';
import { useLanguage, LanguageSwitcher } from './context/LanguageContext.jsx';

const DEFAULT_LAYERS = {
  buildings:   true,
  trafficFlow: true,
  airQuality:  true,
};

export default function App() {
  const { tr } = useLanguage();

  const [phase, setPhase]                     = useState('landing');
  const [layers, setLayers]                   = useState(DEFAULT_LAYERS);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [chatOpen, setChatOpen]               = useState(false);
  const [dashboardOpen, setDashboardOpen]     = useState(false);
  const [forecastOpen, setForecastOpen]       = useState(false);
  const [alertDismissed, setAlertDismissed]   = useState(false);

  const handleLaunch = useCallback(() => {
    setPhase('exiting');
    setTimeout(() => setPhase('map'), 480);
  }, []);

  const handleBackToLanding = useCallback(() => {
    setPhase('landing');
  }, []);

  const { stations: airStations }   = useAirQuality();
  const { geojson: trafficGeojson } = useTrafficData();

  const handleToggle       = useCallback((id) => setLayers(p => ({ ...p, [id]: !p[id] })), []);
  const handleFeatureClick = useCallback((feature) => setSelectedFeature(feature), []);
  const handleClosePanel   = useCallback(() => setSelectedFeature(null), []);

  const token         = import.meta.env.VITE_MAPBOX_TOKEN || '';
  const hasToken      = Boolean(token);
  const isSecretToken = token.startsWith('sk.');

  const { congestion, aqi } = currentHour;
  const activeAlert = (() => {
    if (aqi > 150)        return { text: tr.alerts.airCritical(aqi),  color: '#ef4444' };
    if (congestion > 75)  return { text: tr.alerts.trafficHigh(congestion), color: '#f97316' };
    if (aqi > 100)        return { text: tr.alerts.airModerate(aqi),  color: '#facc15' };
    return null;
  })();

  if (phase === 'landing' || phase === 'exiting') {
    return <LandingPage onLaunch={handleLaunch} exiting={phase === 'exiting'} />;
  }

  if (!hasToken || isSecretToken) {
    return (
      <div
        className="flex items-center justify-center w-full h-full text-white"
        style={{ background: '#050d1a', animation: 'mapFadeIn 0.5s ease both' }}
      >
        <div
          className="max-w-md text-center p-8 rounded-2xl shadow-xl"
          style={{ background: 'rgba(10,22,40,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h1 className="text-xl font-bold mb-2">Uly Dala</h1>
          {isSecretToken ? (
            <>
              <p className="text-red-400 text-sm font-semibold mb-2">
                Secret token detected (<code className="bg-gray-800 px-1 py-0.5 rounded">sk.*</code>)
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Mapbox requires a <strong className="text-white">public token</strong>{' '}
                (<code className="bg-gray-800 px-1 py-0.5 rounded" style={{ color: '#3b9eff' }}>pk.*</code>) in frontend apps.
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-sm mb-4">
              Add <code className="bg-gray-800 px-1 py-0.5 rounded" style={{ color: '#3b9eff' }}>VITE_MAPBOX_TOKEN</code> to your{' '}
              <code className="bg-gray-800 px-1 py-0.5 rounded" style={{ color: '#3b9eff' }}>.env</code> file.
            </p>
          )}
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank" rel="noreferrer"
            style={{ background: '#3b9eff', color: '#fff', borderRadius: 50, padding: '10px 24px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
          >
            Open Mapbox token dashboard →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ animation: 'mapFadeIn 0.5s ease both' }}>
      <Map layers={layers} airStations={airStations} onFeatureClick={handleFeatureClick} />

      <LayerControls layers={layers} onToggle={handleToggle} onDashboard={() => setDashboardOpen(true)} onBack={handleBackToLanding} />
      <Legend layers={layers} />

      <InfoPanel feature={!dashboardOpen ? selectedFeature : null} onClose={handleClosePanel} />

      <ForecastPanel
        open={forecastOpen && !selectedFeature && !dashboardOpen}
        onClose={() => setForecastOpen(false)}
      />

      {!dashboardOpen && !forecastOpen && !selectedFeature && (
        <button
          onClick={() => setForecastOpen(true)}
          className="absolute right-0 top-1/3 z-10 text-gray-300 hover:text-white rounded-l-xl py-4 px-2.5 text-xs font-semibold tracking-wider shadow-xl transition-all duration-200"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            background: 'rgba(10,22,40,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRight: 'none',
            backdropFilter: 'blur(12px)',
          }}
        >
          {tr.map.details}
        </button>
      )}

      {dashboardOpen && <AkimatDashboard onClose={() => setDashboardOpen(false)} />}

      {chatOpen ? (
        <ChatPanel onClose={() => setChatOpen(false)} />
      ) : (
        <button
          onClick={() => setChatOpen(true)}
          className="absolute bottom-4 right-4 z-20 text-white rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-2xl transition-all duration-200"
          style={{ background: '#3b9eff', border: '1px solid rgba(59,158,255,0.4)', boxShadow: '0 4px 20px rgba(59,158,255,0.25)' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,158,255,0.45)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,158,255,0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {tr.map.aiChat}
        </button>
      )}

      {/* Title bar + lang switcher */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div
          className="pointer-events-auto rounded-full shadow-xl flex items-center gap-2 pl-3 pr-2 py-1.5"
          style={{ background: 'rgba(10,22,40,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <img src="/logo.png" alt="Uly Dala" className="h-7 w-7 rounded-full object-cover" />
          <span className="text-white text-sm font-semibold tracking-wide pr-1">Uly Dala</span>
          <LanguageSwitcher />
        </div>

        {activeAlert && !alertDismissed && (
          <div
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full shadow-xl border text-xs max-w-sm"
            style={{ backgroundColor: activeAlert.color + '18', borderColor: activeAlert.color + '55' }}
          >
            <span className="text-gray-200 leading-snug">{activeAlert.text}</span>
            <button
              onClick={() => setAlertDismissed(true)}
              className="text-gray-500 hover:text-white shrink-0 ml-1 text-base leading-none"
            >×</button>
          </div>
        )}
      </div>

      <div className="absolute bottom-16 right-4 z-10 flex flex-col items-end gap-1.5">
        <CountBadge label={tr.layers.airQuality} count={airStations.length} color="cyan" />
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
      {label}: {count}
    </div>
  );
}
