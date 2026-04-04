import { useState, useEffect } from 'react';
import { getAQHex, getAQLabel, TRAFFIC_LEVEL_COLORS, TRAFFIC_LEVEL_LABELS } from '../config/mapConfig.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const CSS = `
  .ip-wrap {
    --bg-panel:      #080f1a;
    --bg-card:       #0d1825;
    --bg-card-hover: #111f2e;
    --border:        rgba(56,139,255,0.12);
    --border-accent: rgba(56,139,255,0.25);
    --primary:       #3b8fff;
    --primary-glow:  rgba(59,143,255,0.15);
    --text:          #e8f1ff;
    --text-muted:    #4a7099;
    --text-dim:      #2a4a6a;
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--text);
  }

  /* ── Noise overlay ── */
  .ip-noise {
    position: absolute; inset: 0; border-radius: inherit;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.03; pointer-events: none; z-index: 0;
  }

  /* ── Custom scrollbar ── */
  .ip-wrap::-webkit-scrollbar { width: 4px; }
  .ip-wrap::-webkit-scrollbar-track { background: transparent; }
  .ip-wrap::-webkit-scrollbar-thumb { background: rgba(59,143,255,0.2); border-radius: 2px; }
  .ip-wrap::-webkit-scrollbar-thumb:hover { background: rgba(59,143,255,0.4); }

  /* ── Section label ── */
  .ip-section-label {
    font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
    font-weight: 600; color: var(--text-muted);
    font-family: 'Space Grotesk', sans-serif;
    margin-bottom: 10px;
  }

  /* ── Pollutant bar ── */
  .ip-bar-track {
    height: 3px; background: rgba(255,255,255,0.06);
    border-radius: 2px; overflow: hidden; margin-top: 4px;
  }

  /* ── Weather tile ── */
  .ip-weather-tile {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 10px 8px;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    transition: border-color 200ms ease;
  }
  .ip-weather-tile:hover { border-color: var(--border-accent); }

  /* ── Advice box ── */
  .ip-advice {
    border-radius: 12px; padding: 12px 14px;
    background: var(--primary-glow);
    border: 1px solid var(--border-accent);
    transition: box-shadow 200ms;
  }
  .ip-advice:hover { box-shadow: 0 0 20px rgba(59,143,255,0.12); }

  /* ── Close button ── */
  .ip-close {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--bg-card); border: 1px solid var(--border);
    color: var(--text-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; line-height: 1; flex-shrink: 0;
    transition: all 200ms ease;
  }
  .ip-close:hover {
    border-color: var(--border-accent);
    background: var(--primary-glow);
    color: var(--text);
  }

  /* ── AQI dial ── */
  .ip-aqi-dial {
    border-radius: 14px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: box-shadow 200ms;
  }
  .ip-aqi-dial:hover { box-shadow: 0 0 24px var(--dial-glow, transparent); }

  /* ── Stagger fade-in ── */
  @keyframes ip-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }
`;

export default function InfoPanel({ feature, onClose }) {
  const { tr } = useLanguage();
  const [displayFeature, setDisplayFeature] = useState(feature);

  useEffect(() => {
    if (feature) setDisplayFeature(feature);
  }, [feature]);

  const open = !!feature;
  if (!displayFeature) return null;

  const isAQ = displayFeature.type === 'air-quality';
  const info = tr.info;

  return (
    <div
      className="ip-wrap"
      style={{
        position: 'absolute', top: 16, right: 56, zIndex: 20,
        width: 312,
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto',
        background: 'rgba(8,15,26,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 20,
        border: '1px solid rgba(56,139,255,0.15)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(56,139,255,0.06)',
        transition: 'opacity 300ms ease, transform 300ms ease',
        opacity: open ? 1 : 0,
        transform: open ? 'translateX(0)' : 'translateX(24px)',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <style>{CSS}</style>
      <div className="ip-noise" aria-hidden="true" />

      {/* Ambient orb */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -60, right: -60,
        width: 220, height: 220, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,143,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 2,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(56,139,255,0.1)',
        background: 'rgba(8,15,26,0.98)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px 20px 0 0',
      }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          {/* Type pill */}
          <div style={{ marginBottom: 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 9px', borderRadius: 20,
              border: '1px solid rgba(56,139,255,0.25)',
              background: 'rgba(59,143,255,0.1)',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#3b8fff', fontFamily: "'Space Grotesk', sans-serif",
            }}>
              <span style={{ fontSize: 7, opacity: 0.8 }}>●</span>
              {isAQ ? info.types.airQuality : info.types.road}
            </span>
          </div>
          <h3 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '0.95rem', color: '#e8f1ff',
            margin: 0, lineHeight: 1.3,
          }}>
            {isAQ
              ? (displayFeature.data.name || info.types.airQuality)
              : (displayFeature.data.roadName || 'Road')}
          </h3>
        </div>
        <button className="ip-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
        {isAQ
          ? <AirQualityDetail data={displayFeature.data} info={info} />
          : <TrafficLineDetail data={displayFeature.data} info={info} />
        }
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Air Quality Detail
───────────────────────────────────────────── */
function AirQualityDetail({ data, info }) {
  const aqi   = Number(data.aqi);
  const color = getAQHex(aqi);
  const label = getAQLabel(aqi);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* AQI hero row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, animation: 'ip-in 350ms ease-out both' }}>
        <div
          className="ip-aqi-dial"
          style={{
            width: 68, height: 68,
            '--dial-glow': color + '40',
            backgroundColor: color + '18',
            border: `2px solid ${color}`,
          }}
        >
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '1.7rem', lineHeight: 1, color,
          }}>{aqi}</span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>AQI</span>
        </div>
        <div>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color, margin: '0 0 4px' }}>{label}</p>
          {data.dominantPollutant && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 2px' }}>
              {info.labels.dominant}: <span style={{ color: 'var(--text)' }}>{data.dominantPollutant}</span>
            </p>
          )}
          {data.updatedAt && (
            <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0 }}>
              {info.labels.updated} {new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* Pollutants */}
      <div style={{ animation: 'ip-in 350ms 60ms ease-out both' }}>
        <p className="ip-section-label">{info.sections.pollutants}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
          <PollutantBar label="PM2.5" value={data.pm25} unit="μg/m³" max={150} warn={35}  danger={75}  />
          <PollutantBar label="PM10"  value={data.pm10} unit="μg/m³" max={250} warn={54}  danger={154} />
          <PollutantBar label="NO₂"   value={data.no2}  unit="μg/m³" max={200} warn={54}  danger={100} />
          <PollutantBar label="O₃"    value={data.o3}   unit="μg/m³" max={180} warn={100} danger={140} />
          <PollutantBar label="CO"    value={data.co}   unit="mg/m³"  max={10}  warn={4}   danger={7}   />
          <PollutantBar label="SO₂"   value={data.so2}  unit="μg/m³" max={200} warn={20}  danger={80}  />
        </div>
      </div>

      {/* Weather */}
      {(data.temperature !== undefined || data.humidity !== undefined || data.windSpeed !== undefined) && (
        <div style={{ animation: 'ip-in 350ms 120ms ease-out both' }}>
          <p className="ip-section-label">{info.sections.weather}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {data.temperature !== undefined && (
              <WeatherTile icon="°C" value={`${data.temperature}°C`} label={info.weather.temp} />
            )}
            {data.humidity !== undefined && (
              <WeatherTile icon="RH" value={`${data.humidity}%`} label={info.weather.humidity} />
            )}
            {data.windSpeed !== undefined && (
              <WeatherTile icon="WD" value={`${data.windSpeed} km/h`} label={`${info.weather.wind} ${data.windDirection || ''}`} />
            )}
          </div>
        </div>
      )}

      {/* Advice box with ✦ badge */}
      <div className="ip-advice" style={{ animation: 'ip-in 350ms 180ms ease-out both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#3b8fff', fontFamily: "'Space Grotesk', sans-serif",
          }}>{info.advisory.health}</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#c5d8f0', lineHeight: 1.65, margin: 0 }}>
          {getAQAdvice(aqi, info)}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Traffic Line Detail
───────────────────────────────────────────── */
function TrafficLineDetail({ data, info }) {
  const level = Number(data.level) || 1;
  const color = TRAFFIC_LEVEL_COLORS[level] || '#94a3b8';
  const label = data.levelLabel || TRAFFIC_LEVEL_LABELS[level] || 'Unknown';
  const pct   = Math.max(0, Math.min(100, 100 - Number(data.congestionPct || 0)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Traffic hero row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, animation: 'ip-in 350ms ease-out both' }}>
        <div style={{
          width: 60, height: 60, borderRadius: 14, flexShrink: 0,
          background: color + '18', border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrafficIcon level={level} color={color} />
        </div>
        <div>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '1rem', color, margin: '0 0 3px',
          }}>{label}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{data.roadName}</p>
        </div>
      </div>

      {/* Speed section */}
      <div style={{ animation: 'ip-in 350ms 60ms ease-out both' }}>
        <p className="ip-section-label">{info.sections.speed}</p>
        <div
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{info.labels.currentSpeed}</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#e8f1ff' }}>{data.currentSpeed} km/h</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{info.labels.freeFlow}</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: 'var(--text-muted)' }}>{data.freeFlowSpeed} km/h</span>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>{info.labels.trafficFlow}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color, fontFamily: "'Space Grotesk', sans-serif" }}>{pct}% {info.labels.ofNormal}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 600ms ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Advice box with ✦ badge */}
      <div className="ip-advice" style={{ animation: 'ip-in 350ms 120ms ease-out both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#3b8fff', fontFamily: "'Space Grotesk', sans-serif",
          }}>{info.advisory.route}</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#c5d8f0', lineHeight: 1.65, margin: 0 }}>
          {getTrafficAdvice(level, data.congestionPct, info)}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared sub-components
───────────────────────────────────────────── */
function PollutantBar({ label, value, unit, max, warn, danger }) {
  const v        = Number(value) || 0;
  const pct      = Math.min(100, (v / max) * 100);
  const barColor = v >= danger ? '#ff4757' : v >= warn ? '#ff8c42' : '#00e5a0';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 10, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: barColor, fontFamily: "'Space Grotesk', sans-serif" }}>
          {v} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      <div className="ip-bar-track">
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function WeatherTile({ icon, value, label }) {
  return (
    <div className="ip-weather-tile">
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)', fontFamily: "'Space Grotesk', sans-serif" }}>{icon}</span>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{value}</span>
      <span style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

function TrafficIcon({ level, color }) {
  const icons = { 1: '→', 2: '↝', 3: '⤳', 4: '✕' };
  return (
    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 700, color }}>
      {icons[level] || '→'}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Advisory text
───────────────────────────────────────────── */
function getAQAdvice(aqi, info) {
  const a = info.aqAdvice;
  if (aqi <= 50)  return a.good;
  if (aqi <= 100) return a.moderate;
  if (aqi <= 150) return a.sensitive;
  if (aqi <= 200) return a.unhealthy;
  if (aqi <= 300) return a.veryUnhealthy;
  return a.hazardous;
}

function getTrafficAdvice(level, congestionPct, info) {
  const pct = Number(congestionPct) || 0;
  const a   = info.trafficAdvice;
  if (level === 1) return a.free(100 - pct);
  if (level === 2) return a.slow(pct);
  if (level === 3) return a.heavy(pct);
  return a.standstill;
}
