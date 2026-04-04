import { useState, useEffect, useRef } from 'react';
import { recommendations as recData, zoneAnalytics } from '../data/mockRecommendations.js';
import { next24h, threeDayOutlook, currentHour, peakTraffic, peakAQI } from '../data/mockPredictions.js';
import { getAQHex } from '../config/mapConfig.js';
import { useAIPredictions } from '../hooks/useAIPredictions.js';
import { useLanguage } from '../context/LanguageContext.jsx';

/* ─────────────────────────────────────────────
   Scoped CSS — all selectors prefixed .dash-
───────────────────────────────────────────── */
const CSS = `
  .dash-wrap {
    --bg-base:        #04090f;
    --bg-panel:       #080f1a;
    --bg-card:        #0d1825;
    --bg-card-hover:  #111f2e;
    --border:         rgba(56,139,255,0.12);
    --border-accent:  rgba(56,139,255,0.25);
    --primary:        #3b8fff;
    --primary-glow:   rgba(59,143,255,0.15);
    --cyan:           #00d4ff;
    --green:          #00e5a0;
    --orange:         #ff8c42;
    --red:            #ff4757;
    --yellow:         #ffd060;
    --text:           #e8f1ff;
    --text-muted:     #4a7099;
    --text-dim:       #2a4a6a;
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--text);
  }

  /* ── Noise texture ── */
  .dash-noise {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.03;
  }

  /* ── Scrollbar ── */
  .dash-scroll::-webkit-scrollbar { width: 4px; }
  .dash-scroll::-webkit-scrollbar-track { background: transparent; }
  .dash-scroll::-webkit-scrollbar-thumb { background: rgba(59,143,255,0.2); border-radius: 2px; }
  .dash-scroll::-webkit-scrollbar-thumb:hover { background: rgba(59,143,255,0.4); }

  /* ── Keyframes ── */
  @keyframes dash-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes dash-crit-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(255,71,87,0.35); }
    50%      { box-shadow: 0 0 0 5px rgba(255,71,87,0); }
  }

  /* ── Metric cards ── */
  .dash-metric {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 22px;
    transition: border-color 200ms ease, box-shadow 200ms ease;
    position: relative;
    overflow: hidden;
  }
  .dash-metric::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--metric-accent, transparent);
    opacity: 0;
    transition: opacity 200ms ease;
    border-radius: 12px 12px 0 0;
  }
  .dash-metric:hover {
    border-color: var(--border-accent);
    box-shadow: 0 0 20px var(--primary-glow);
  }
  .dash-metric:hover::after { opacity: 1; }

  /* ── Zone table ── */
  .dash-zone-row {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 150ms ease, border-radius 150ms ease;
    cursor: default;
  }
  .dash-zone-row:last-child { border-bottom: none; }
  .dash-zone-row:hover {
    background: rgba(59,143,255,0.04);
    border-radius: 8px;
  }

  /* ── Recommendation cards ── */
  .dash-rec {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
    cursor: pointer;
    text-align: left;
    width: 100%;
  }
  .dash-rec:hover {
    border-color: var(--border-accent);
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(59,143,255,0.1);
  }
  .dash-rec.expanded {
    border-color: var(--border-accent);
  }

  /* ── Filter buttons ── */
  .dash-filter {
    padding: 6px 14px; border-radius: 20px;
    font-size: 0.75rem; font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer; transition: all 200ms ease;
    border: 1px solid var(--border);
    background: transparent; color: var(--text-muted);
  }
  .dash-filter:hover { border-color: var(--border-accent); color: var(--text); }
  .dash-filter.active {
    background: var(--primary); color: #fff;
    border-color: var(--primary);
    box-shadow: 0 0 12px rgba(59,143,255,0.4);
  }

  /* ── Critical badge pulse ── */
  .dash-badge-crit { animation: dash-crit-pulse 2s ease infinite; }

  /* ── AI card ── */
  .dash-ai-card {
    border-radius: 12px; padding: 16px;
    background: rgba(59,143,255,0.06);
    border: 1px solid var(--border-accent);
    transition: box-shadow 200ms;
  }
  .dash-ai-card:hover { box-shadow: 0 0 24px rgba(59,143,255,0.12); }

  /* ── 3-day / peak cards ── */
  .dash-outlook-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 16px;
    transition: border-color 200ms, box-shadow 200ms;
  }
  .dash-outlook-card:hover {
    border-color: var(--border-accent);
    box-shadow: 0 0 16px var(--primary-glow);
  }

  /* ── Section header text ── */
  .dash-section-label {
    font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
    font-weight: 600; color: var(--text-muted);
    font-family: 'Space Grotesk', sans-serif;
    margin-bottom: 12px;
  }
`;

/* ─────────────────────────────────────────────
   Count-up hook
───────────────────────────────────────────── */
function useCountUp(target, duration = 800) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCur(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return cur;
}

/* ─────────────────────────────────────────────
   Colour helpers
───────────────────────────────────────────── */
function trafficColor(c) {
  return c >= 75 ? '#ff4757' : c >= 50 ? '#ff8c42' : c >= 30 ? '#ffd060' : '#00e5a0';
}
function trafficLabel(c) {
  return c >= 75 ? 'Standstill' : c >= 50 ? 'Congested' : c >= 30 ? 'Slow' : 'Free Flow';
}

const PRIORITY_STYLES = {
  critical: { bg: 'rgba(255,71,87,0.15)',  color: '#ff4757', border: 'rgba(255,71,87,0.3)',  pulse: true  },
  high:     { bg: 'rgba(255,140,66,0.15)', color: '#ff8c42', border: 'rgba(255,140,66,0.3)', pulse: false },
  medium:   { bg: 'rgba(255,208,96,0.15)', color: '#ffd060', border: 'rgba(255,208,96,0.3)', pulse: false },
  low:      { bg: 'rgba(0,229,160,0.15)',  color: '#00e5a0', border: 'rgba(0,229,160,0.3)',  pulse: false },
};
const CATEGORY_COLORS = {
  traffic: '#ff8c42',
  air:     '#00d4ff',
};

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function MetricCard({ label, value, sub, color, delay = 0, suffix = '' }) {
  const animated = useCountUp(typeof value === 'number' ? value : parseInt(value) || 0);
  const display  = typeof value === 'number' ? animated : `${animated}${suffix}`;

  return (
    <div
      className="dash-metric"
      style={{
        '--metric-accent': color,
        animation: `dash-in 400ms ${delay}ms ease-out both`,
      }}
    >
      <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.1rem', fontWeight: 700, lineHeight: 1, color, marginBottom: 4 }}>
        {display}{suffix && typeof value !== 'number' ? '' : suffix}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{sub}</p>
      )}
    </div>
  );
}

function ZoneRow({ z, delay = 0 }) {
  const trendIcon  = z.trend === 'up' ? '↑' : z.trend === 'down' ? '↓' : '→';
  const trendColor = z.trend === 'up' ? '#ff4757' : z.trend === 'down' ? '#00e5a0' : '#4a7099';
  return (
    <div className="dash-zone-row" style={{ animation: `dash-in 400ms ${delay}ms ease-out both` }}>
      <span style={{ flex: 1, fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{z.zone}</span>
      <span style={{ color: trafficColor(z.congestion), fontWeight: 700, fontSize: 13, width: 40, textAlign: 'right', fontFamily: "'Space Grotesk', sans-serif" }}>{z.congestion}%</span>
      <span style={{ color: getAQHex(z.aqi), fontWeight: 700, fontSize: 13, width: 40, textAlign: 'right', fontFamily: "'Space Grotesk', sans-serif" }}>{z.aqi}</span>
      <span style={{ color: trendColor, width: 24, textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>{trendIcon}</span>
    </div>
  );
}

function RecCard({ rec, expanded, onToggle, delay = 0, priorityLabels, categoryLabels, effortLabel }) {
  const p = { ...PRIORITY_STYLES[rec.priority], label: priorityLabels[rec.priority] };
  const catColor = CATEGORY_COLORS[rec.category];
  const catLabel = categoryLabels[rec.category];
  return (
    <button
      className={`dash-rec${expanded ? ' expanded' : ''}`}
      onClick={onToggle}
      style={{
        animation: `dash-in 400ms ${delay}ms ease-out both`,
        background: expanded ? `${p.color}08` : 'var(--bg-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon circle */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
        }}>
          {rec.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 7 }}>
            <span
              className={p.pulse ? 'dash-badge-crit' : ''}
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                color: p.color, background: p.bg, border: `1px solid ${p.border}`,
                borderRadius: 20, padding: '3px 8px',
              }}
            >
              {p.label}
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 500, color: catColor }}>{catLabel}</span>
          </div>

          <p style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.35, margin: 0 }}>
            {rec.title}
          </p>

          {expanded && (
            <div style={{ marginTop: 12 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.65, marginBottom: 10 }}>
                {rec.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {rec.zones.map(z => (
                  <span key={z} style={{
                    fontSize: '0.68rem', borderRadius: 20, padding: '3px 10px',
                    background: 'rgba(59,143,255,0.08)', color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}>{z}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.75rem' }}>
                <span style={{ color: '#00e5a0', fontWeight: 600 }}>↑ {rec.impact}</span>
                <span style={{ color: 'var(--text-muted)' }}>{effortLabel}: {rec.effort}</span>
                <span style={{ color: 'var(--text-muted)' }}>{rec.timeframe}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   Main dashboard
───────────────────────────────────────────── */
export default function AkimatDashboard({ onClose }) {
  const { tr } = useLanguage();
  const [filter, setFilter]     = useState('all');
  const [expanded, setExpanded] = useState(null);
  const { data: aiData, loading: aiLoading } = useAIPredictions();
  const d = tr.dashboard;

  const recommendations = recData.map((rec, i) => ({
    ...rec,
    ...(tr.recommendations?.[i] && {
      title:       tr.recommendations[i].title,
      description: tr.recommendations[i].description,
      effort:      tr.recommendations[i].effort,
      timeframe:   tr.recommendations[i].timeframe,
    }),
  }));

  const avgCong   = Math.round(next24h.reduce((s, h) => s + h.congestion, 0) / next24h.length);
  const avgAQI    = Math.round(next24h.reduce((s, h) => s + h.aqi, 0) / next24h.length);
  const critCount = recommendations.filter(r => r.priority === 'critical').length;

  const shown = filter === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === filter);

  return (
    <div
      className="dash-wrap"
      style={{
        position: 'fixed', inset: 0, zIndex: 30,
        background: 'var(--bg-base)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <style>{CSS}</style>

      {/* Noise overlay */}
      <div className="dash-noise" aria-hidden="true" />

      {/* Ambient radial glow — top-left */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -200, left: -100,
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,143,255,0.03) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px', borderBottom: '1px solid var(--border)',
        flexShrink: 0, position: 'relative', zIndex: 1,
        animation: 'dash-in 400ms ease-out both',
      }}>
        <div>
          {/* Pill badge */}
          <div style={{ marginBottom: 8 }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px', borderRadius: 20,
              border: '1px solid var(--border-accent)',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Akimat Dashboard            </span>
          </div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.65rem', fontWeight: 700,
            color: 'var(--text)', margin: 0, letterSpacing: '-0.02em',
          }}>
            {d.title}
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', lineHeight: 1,
            transition: 'all 200ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-accent)';
            e.currentTarget.style.background  = 'var(--primary-glow)';
            e.currentTarget.style.color       = 'var(--text)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background  = 'var(--bg-card)';
            e.currentTarget.style.color       = 'var(--text-muted)';
          }}
        >
          ×
        </button>
      </div>

      {/* ── Main content ── */}
      <div style={{
        flex: 1, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
        position: 'relative', zIndex: 1,
      }}>

        {/* Left column */}
        <div
          className="dash-scroll"
          style={{ display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', padding: '24px 20px 24px 28px' }}
        >

          {/* AI Priority Action */}
          {(aiData?.akimatAction || aiLoading) && (
            <div className="dash-ai-card" style={{ animation: 'dash-in 400ms ease-out both', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--primary)', fontFamily: "'Space Grotesk', sans-serif",
                }}>{d.aiLabel}</span>
                {aiLoading && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', animation: 'dash-crit-pulse 1.5s ease infinite' }}>{d.aiGenerating}</span>
                )}
              </div>
              <p style={{ color: '#c5d8f0', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                {aiData?.akimatAction ?? '—'}
              </p>
            </div>
          )}

          {/* Current Snapshot */}
          <div style={{ flexShrink: 0 }}>
            <p className="dash-section-label">{d.sections.snapshot}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <MetricCard
                label={d.kpis.liveTraffic}
                value={currentHour.congestion}
                suffix="%"
                sub={trafficLabel(currentHour.congestion)}
                color={trafficColor(currentHour.congestion)}
                delay={60}
              />
              <MetricCard
                label={d.kpis.liveAQI}
                value={currentHour.aqi}
                sub={currentHour.weather}
                color={getAQHex(currentHour.aqi)}
                delay={120}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <MetricCard label={d.kpis.avgTraffic} value={avgCong} suffix="%" color={trafficColor(avgCong)} delay={180} />
              <MetricCard label={d.kpis.avgAQI}     value={avgAQI}          color={getAQHex(avgAQI)}         delay={240} />
              <MetricCard label={d.kpis.critical}   value={critCount}       color="#ff4757"                  delay={300} />
            </div>
          </div>

          {/* Zone Status */}
          <div style={{ flexShrink: 0 }}>
            <p className="dash-section-label">{d.sections.zones}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <span style={{ flex: 1, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>{d.zones.zone}</span>
              <span style={{ width: 40, textAlign: 'right', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>{d.zones.cong}</span>
              <span style={{ width: 40, textAlign: 'right', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>{d.zones.aqi}</span>
              <span style={{ width: 24, textAlign: 'center', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>↕</span>
            </div>
            {zoneAnalytics.map((z, i) => (
              <ZoneRow key={z.zone} z={z} delay={360 + i * 50} />
            ))}
          </div>

          {/* 3-Day Outlook */}
          <div style={{ flexShrink: 0 }}>
            <p className="dash-section-label">{d.sections.outlook}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {threeDayOutlook.map((day, i) => (
                <div key={day.day} className="dash-outlook-card" style={{ animation: `dash-in 400ms ${660 + i * 60}ms ease-out both` }}>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>{day.day}</p>
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>{d.outlook.traffic}</p>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: trafficColor(day.avgCongestion), margin: 0 }}>{day.avgCongestion}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>{d.outlook.air}</p>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: getAQHex(day.avgAQI), margin: 0 }}>AQI {day.avgAQI}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Forecast */}
          <div style={{ flexShrink: 0 }}>
            <p className="dash-section-label">{d.sections.peakForecast}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="dash-outlook-card" style={{ animation: 'dash-in 400ms 840ms ease-out both' }}>
                <p style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{d.peak.traffic}</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.3rem', color: trafficColor(peakTraffic.congestion), margin: 0 }}>{peakTraffic.congestion}%</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{d.peak.at} {peakTraffic.timeLabel}</p>
              </div>
              <div className="dash-outlook-card" style={{ animation: 'dash-in 400ms 900ms ease-out both' }}>
                <p style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{d.peak.aqi}</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.3rem', color: getAQHex(peakAQI.aqi), margin: 0 }}>{peakAQI.aqi}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{d.peak.at} {peakAQI.timeLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Recommendations */}
        <div
          style={{
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            padding: '24px 28px 24px 20px',
            borderLeft: '1px solid var(--border)',
            background: 'var(--bg-panel)',
          }}
        >
          {/* Filter row */}
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0, animation: 'dash-in 400ms 60ms ease-out both' }}
          >
            <p className="dash-section-label" style={{ margin: 0 }}>
              {d.sections.recommendations} ({shown.length})
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'traffic', 'air'].map(f => (
                <button
                  key={f}
                  className={`dash-filter${filter === f ? ' active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? d.filters.all : f === 'traffic' ? d.filters.traffic : d.filters.air}
                </button>
              ))}
            </div>
          </div>

          {/* Cards list */}
          <div
            className="dash-scroll"
            style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2 }}
          >
            {shown.map((rec, i) => (
              <RecCard
                key={rec.id}
                rec={rec}
                expanded={expanded === rec.id}
                onToggle={() => setExpanded(expanded === rec.id ? null : rec.id)}
                delay={i * 50}
                priorityLabels={d.priority}
                categoryLabels={d.category}
                effortLabel={d.effort}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '12px 28px', borderTop: '1px solid var(--border)',
        flexShrink: 0, position: 'relative', zIndex: 1,
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', margin: 0, fontFamily: "'Inter', sans-serif" }}>
          {d.footer}
        </p>
      </div>
    </div>
  );
}
