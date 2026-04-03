import { useEffect } from 'react';

const CSS = `
  .lp-wrap {
    font-family: 'Figtree', system-ui, sans-serif;
    background: #050d1a;
    color: #f0f6ff;
    line-height: 1.6;
    overflow-x: hidden;
    position: relative;
  }

  .lp-grain {
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='600' height='600' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.028; pointer-events: none; z-index: 9999;
  }

  .lp-cursor-glow {
    position: fixed; width: 420px; height: 420px; border-radius: 50%;
    background: radial-gradient(circle, rgba(59,158,255,0.07) 0%, transparent 65%);
    pointer-events: none; transform: translate(-50%,-50%); z-index: 9998;
    transition: left 0.08s linear, top 0.08s linear;
    will-change: left, top;
  }

  /* ── Navbar ── */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    transition: background 0.35s, backdrop-filter 0.35s, border-color 0.35s;
    border-bottom: 1px solid transparent;
  }
  .lp-nav.lp-scrolled {
    background: rgba(5,13,26,0.84);
    backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
    border-bottom-color: rgba(255,255,255,0.08);
  }
  .lp-nav-inner {
    max-width: 1200px; margin: 0 auto; padding: 20px 40px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .lp-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem; font-weight: 700; color: #f0f6ff;
    text-decoration: none; letter-spacing: -0.02em; cursor: pointer;
  }
  .lp-logo span { color: #3b9eff; }
  .lp-nav-links {
    display: flex; align-items: center; gap: 36px; list-style: none;
  }
  .lp-nav-links a {
    color: #7a9cc4; text-decoration: none; font-size: 0.9rem; font-weight: 500;
    transition: color 0.2s;
  }
  .lp-nav-links a:hover { color: #f0f6ff; }
  .lp-nav-cta {
    background: #3b9eff; color: #fff; border: none; cursor: pointer;
    padding: 10px 22px; border-radius: 50px; font-size: 0.875rem;
    font-family: 'Figtree', sans-serif; font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 0 0 rgba(59,158,255,0);
  }
  .lp-nav-cta:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 24px rgba(59,158,255,0.35);
  }

  /* ── Hero ── */
  .lp-hero {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    text-align: center; position: relative; overflow: hidden; padding: 120px 40px 80px;
  }
  .lp-orb-1 {
    position: absolute; width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, rgba(59,158,255,0.12) 0%, transparent 70%);
    top: -200px; left: 50%; transform: translateX(-50%);
    animation: lp-drift 12s ease-in-out infinite alternate;
    pointer-events: none;
  }
  .lp-orb-2 {
    position: absolute; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%);
    bottom: -100px; right: 5%;
    animation: lp-drift 15s ease-in-out infinite alternate-reverse;
    pointer-events: none;
  }
  @keyframes lp-drift {
    from { transform: translateY(0) scale(1); }
    to   { transform: translateY(-40px) scale(1.05); }
  }
  .lp-hero-inner { position: relative; z-index: 1; max-width: 820px; }
  .lp-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(59,158,255,0.1); border: 1px solid rgba(59,158,255,0.25);
    color: #3b9eff; border-radius: 50px; padding: 6px 16px;
    font-size: 0.78rem; font-weight: 600; letter-spacing: 0.03em;
    margin-bottom: 28px;
    animation: lp-fadeUp 0.6s ease both;
  }
  .lp-pill-dot {
    width: 6px; height: 6px; background: #3b9eff; border-radius: 50%;
    animation: lp-pulse 2s ease infinite;
  }
  @keyframes lp-pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
  .lp-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.8rem, 6vw, 5rem); font-weight: 700;
    line-height: 1.1; letter-spacing: -0.03em; color: #f0f6ff;
    margin-bottom: 20px;
    animation: lp-fadeUp 0.6s 0.12s ease both;
  }
  .lp-h1 em {
    font-style: italic; color: #3b9eff;
    background: linear-gradient(135deg, #3b9eff, #00e5ff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .lp-subtitle {
    font-size: clamp(1rem, 2vw, 1.15rem); color: #7a9cc4; font-weight: 400;
    max-width: 560px; margin: 0 auto 36px;
    animation: lp-fadeUp 0.6s 0.24s ease both;
  }
  .lp-hero-btns {
    display: flex; align-items: center; justify-content: center; gap: 14px;
    flex-wrap: wrap;
    animation: lp-fadeUp 0.6s 0.36s ease both;
  }
  .lp-btn-primary {
    background: #3b9eff; color: #fff; border: none; cursor: pointer;
    padding: 14px 32px; border-radius: 50px; font-size: 1rem;
    font-family: 'Figtree', sans-serif; font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(59,158,255,0.25);
    display: flex; align-items: center; gap: 8px;
  }
  .lp-btn-primary:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 32px rgba(59,158,255,0.45);
  }
  .lp-btn-ghost {
    background: rgba(255,255,255,0.04); color: #7a9cc4;
    border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
    padding: 14px 32px; border-radius: 50px; font-size: 1rem;
    font-family: 'Figtree', sans-serif; font-weight: 500;
    transition: all 0.2s; text-decoration: none; display: inline-flex;
    align-items: center; gap: 8px;
  }
  .lp-btn-ghost:hover {
    background: rgba(255,255,255,0.08); color: #f0f6ff;
    border-color: rgba(255,255,255,0.2);
  }

  /* ── Map Mockup ── */
  .lp-mockup {
    position: relative; margin: 64px auto 0; max-width: 760px;
    border-radius: 20px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,158,255,0.1);
    animation: lp-fadeUp 0.6s 0.48s ease both;
  }
  .lp-mockup-bar {
    background: rgba(10,22,40,0.98); padding: 12px 16px;
    display: flex; align-items: center; gap: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .lp-dot { width: 10px; height: 10px; border-radius: 50%; }
  .lp-mockup-url {
    flex: 1; background: rgba(255,255,255,0.05); border-radius: 6px;
    padding: 5px 12px; color: #7a9cc4; font-size: 0.75rem;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .lp-map-canvas {
    height: 300px; background: #0d1f35; position: relative; overflow: hidden;
  }
  .lp-map-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(59,158,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,158,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .lp-road {
    position: absolute; height: 3px; border-radius: 3px;
    animation: lp-traffic-flow 3s ease-in-out infinite alternate;
  }
  @keyframes lp-traffic-flow {
    from { opacity: 0.6; }
    to   { opacity: 1; }
  }
  .lp-aq-dot {
    position: absolute; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3);
    animation: lp-aq-pulse 3s ease-in-out infinite;
  }
  @keyframes lp-aq-pulse {
    0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.9; }
    50% { transform: translate(-50%,-50%) scale(1.2); opacity: 0.6; }
  }
  .lp-map-label {
    position: absolute; background: rgba(5,13,26,0.85);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
    padding: 6px 10px; font-size: 0.65rem; color: #7a9cc4;
    backdrop-filter: blur(8px);
  }
  .lp-map-badge {
    position: absolute; right: 12px; top: 12px;
    background: rgba(59,158,255,0.15); border: 1px solid rgba(59,158,255,0.3);
    border-radius: 8px; padding: 8px 12px; font-size: 0.72rem; color: #3b9eff; font-weight: 600;
  }

  /* ── Stats ── */
  .lp-stats {
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 40px;
  }
  .lp-stats-inner {
    max-width: 900px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; text-align: center;
  }
  .lp-stat-val {
    font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700;
    color: #3b9eff; display: block; line-height: 1;
  }
  .lp-stat-lbl { font-size: 0.8rem; color: #7a9cc4; margin-top: 6px; display: block; }

  /* ── Section wrapper ── */
  .lp-section {
    max-width: 1200px; margin: 0 auto; padding: 100px 40px;
  }
  .lp-section-tag {
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em;
    color: #3b9eff; text-transform: uppercase; margin-bottom: 12px;
  }
  .lp-section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 700;
    letter-spacing: -0.025em; color: #f0f6ff; margin-bottom: 16px;
    line-height: 1.2;
  }
  .lp-section-sub {
    font-size: 1.05rem; color: #7a9cc4; max-width: 480px; line-height: 1.7;
  }
  .lp-divider {
    height: 1px; max-width: 1200px; margin: 0 auto;
    background: linear-gradient(90deg, transparent, rgba(59,158,255,0.15), transparent);
  }

  /* ── Feature cards ── */
  .lp-features-grid {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 56px;
  }
  .lp-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px; padding: 32px 28px;
    transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
    backdrop-filter: blur(10px);
  }
  .lp-card:hover {
    transform: translateY(-4px);
    border-color: rgba(59,158,255,0.2);
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }
  .lp-card-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: rgba(59,158,255,0.1); border: 1px solid rgba(59,158,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em;
    color: #3b9eff; margin-bottom: 20px;
    font-family: 'Figtree', sans-serif;
  }
  .lp-card-title {
    font-size: 1.05rem; font-weight: 600; color: #f0f6ff; margin-bottom: 10px;
  }
  .lp-card-desc { font-size: 0.9rem; color: #7a9cc4; line-height: 1.65; }

  /* ── How it works ── */
  .lp-how-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
  }
  .lp-steps { display: flex; flex-direction: column; gap: 24px; }
  .lp-step {
    display: flex; gap: 20px; align-items: flex-start;
    padding: 24px; border-radius: 16px; cursor: default;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
    transition: background 0.25s, border-color 0.25s;
  }
  .lp-step:hover {
    background: rgba(59,158,255,0.05); border-color: rgba(59,158,255,0.15);
  }
  .lp-step-num {
    width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(59,158,255,0.35);
    background: rgba(59,158,255,0.1); color: #3b9eff;
    font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .lp-step-title { font-size: 0.95rem; font-weight: 600; color: #f0f6ff; margin-bottom: 6px; }
  .lp-step-desc { font-size: 0.85rem; color: #7a9cc4; line-height: 1.6; }
  .lp-visual-card {
    background: rgba(10,22,40,0.9); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 32px; position: relative; overflow: hidden;
  }
  .lp-visual-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at top left, rgba(59,158,255,0.08), transparent 60%);
    pointer-events: none;
  }

  /* ── Quote / Social Proof ── */
  .lp-quote-section {
    background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06); padding: 80px 40px; text-align: center;
  }
  .lp-quote {
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: clamp(1.2rem, 2.5vw, 1.6rem); color: #c5d8f0;
    max-width: 700px; margin: 0 auto 24px; line-height: 1.55;
  }
  .lp-trust-badges {
    display: flex; align-items: center; justify-content: center; gap: 32px;
    flex-wrap: wrap; margin-top: 36px;
  }
  .lp-badge {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 50px; padding: 8px 20px; font-size: 0.8rem; color: #7a9cc4;
    font-weight: 500;
  }

  /* ── CTA section ── */
  .lp-cta {
    text-align: center; padding: 100px 40px;
    background: radial-gradient(ellipse at center top, rgba(59,158,255,0.06), transparent 70%);
  }
  .lp-cta-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 700;
    color: #f0f6ff; margin-bottom: 18px; letter-spacing: -0.025em;
  }
  .lp-cta-sub { font-size: 1.05rem; color: #7a9cc4; margin-bottom: 36px; }

  /* ── Footer ── */
  .lp-footer {
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 32px 40px;
    display: flex; align-items: center; justify-content: space-between;
    max-width: 1200px; margin: 0 auto; flex-wrap: wrap; gap: 16px;
  }
  .lp-footer-copy { font-size: 0.8rem; color: #3d5a7a; }
  .lp-footer-links { display: flex; gap: 24px; }
  .lp-footer-links a { font-size: 0.8rem; color: #3d5a7a; text-decoration: none; transition: color 0.2s; }
  .lp-footer-links a:hover { color: #7a9cc4; }

  /* ── Reveal animation ── */
  .lp-reveal {
    opacity: 0; transform: translateY(24px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }
  .lp-reveal.lp-visible { opacity: 1; transform: none; }

  /* ── Stagger for hero ── */
  @keyframes lp-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .lp-features-grid { grid-template-columns: 1fr; }
    .lp-how-grid { grid-template-columns: 1fr; gap: 40px; }
    .lp-stats-inner { grid-template-columns: repeat(2,1fr); }
    .lp-nav-links { display: none; }
  }
  @media (max-width: 600px) {
    .lp-nav-inner { padding: 18px 20px; }
    .lp-section { padding: 64px 20px; }
    .lp-stats { padding: 32px 20px; }
    .lp-hero { padding: 100px 20px 60px; }
  }
`;

export default function LandingPage({ onLaunch, exiting = false }) {
  useEffect(() => {
    const root = document.getElementById('root');
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyHeight   = document.body.style.height;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevHtmlHeight   = document.documentElement.style.height;
    const prevRootOverflow = root?.style.overflow;
    const prevRootHeight   = root?.style.height;

    document.body.style.overflow = 'auto';
    document.body.style.height   = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height   = 'auto';
    if (root) { root.style.overflow = 'auto'; root.style.height = 'auto'; }

    const glow = document.getElementById('lp-cursor-glow');
    const onMove = e => {
      if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
    };
    document.addEventListener('mousemove', onMove);

    const nav = document.getElementById('lp-nav');
    const onScroll = () => {
      if (nav) nav.classList.toggle('lp-scrolled', window.scrollY > 55);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('lp-visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.lp-reveal').forEach(el => observer.observe(el));

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.height   = prevBodyHeight;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.documentElement.style.height   = prevHtmlHeight;
      if (root) { root.style.overflow = prevRootOverflow; root.style.height = prevRootHeight; }
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="lp-wrap"
      style={{
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(-12px)' : 'none',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      <style>{CSS}</style>

      <div className="lp-grain" aria-hidden="true" />
      <div id="lp-cursor-glow" className="lp-cursor-glow" aria-hidden="true" />

      {/* Navbar */}
      <nav id="lp-nav" className="lp-nav">
        <div className="lp-nav-inner">
          <span className="lp-logo">Uly <span>Dala</span></span>
          <ul className="lp-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#about">About</a></li>
          </ul>
          <button className="lp-nav-cta" onClick={onLaunch}>Open Map →</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-orb-1" aria-hidden="true" />
        <div className="lp-orb-2" aria-hidden="true" />
        <div className="lp-hero-inner">
          <div className="lp-pill">
            <span className="lp-pill-dot" />
            Live in Almaty · Powered by Uly Dala
          </div>
          <h1 className="lp-h1">
            The city, understood.<br />
            <em>Intelligently.</em>
          </h1>
          <p className="lp-subtitle">
            Uly Dala turns Almaty's real-time traffic and air quality data into
            actionable intelligence — for citizens and city officials alike.
          </p>
          <div className="lp-hero-btns">
            <button className="lp-btn-primary" onClick={onLaunch}>
            ✦ Launch 3D Map
            </button>
            <a href="#features" className="lp-btn-ghost">See features ↓</a>
          </div>

          {/* Map mockup */}
          <div className="lp-mockup">
            <div className="lp-mockup-bar">
              <span className="lp-dot" style={{ background: '#ef4444' }} />
              <span className="lp-dot" style={{ background: '#facc15' }} />
              <span className="lp-dot" style={{ background: '#22c55e' }} />
              <span className="lp-mockup-url">uly-dala.kz/map</span>
            </div>
            <div className="lp-map-canvas">
              <div className="lp-map-grid" />
              {/* Roads */}
              {[
                { top:'38%', left:'10%', width:'35%', rotate:'-8deg', color:'#ef4444' },
                { top:'55%', left:'20%', width:'45%', rotate:'3deg',  color:'#f97316' },
                { top:'45%', left:'40%', width:'30%', rotate:'45deg', color:'#22c55e' },
                { top:'65%', left:'45%', width:'40%', rotate:'-12deg',color:'#facc15' },
                { top:'30%', left:'55%', width:'35%', rotate:'20deg', color:'#22c55e' },
              ].map((r, i) => (
                <div key={i} className="lp-road" style={{
                  top: r.top, left: r.left, width: r.width,
                  background: r.color, transform: `rotate(${r.rotate})`,
                  opacity: 0.75,
                  animationDelay: `${i * 0.6}s`,
                }} />
              ))}
              {/* AQ Dots */}
              {[
                { top:'30%', left:'25%', size:14, color:'#22d3ee' },
                { top:'60%', left:'55%', size:12, color:'#f97316' },
                { top:'45%', left:'70%', size:16, color:'#22d3ee' },
                { top:'75%', left:'30%', size:10, color:'#ef4444' },
                { top:'25%', left:'65%', size:11, color:'#22c55e' },
              ].map((d, i) => (
                <div key={i} className="lp-aq-dot" style={{
                  top: d.top, left: d.left,
                  width: d.size, height: d.size,
                  background: d.color + '80',
                  borderColor: d.color,
                  animationDelay: `${i * 0.7}s`,
                }} />
              ))}
              <div className="lp-map-label" style={{ bottom: 12, left: 12 }}>
                Almaty, Kazakhstan
              </div>
              <div className="lp-map-badge">
                Live · 3D View
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="lp-stats">
        <div className="lp-stats-inner">
          {[
            { val: '72h', lbl: 'Predictive Horizon' },
            { val: '18+', lbl: 'Air Quality Stations' },
            { val: 'AI',  lbl: 'Gemini-Powered Insights' },
            { val: '3D',  lbl: 'Interactive City Map' },
          ].map(s => (
            <div key={s.val} className="lp-reveal">
              <span className="lp-stat-val">{s.val}</span>
              <span className="lp-stat-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features">
        <div className="lp-section">
          <div className="lp-reveal">
            <p className="lp-section-tag">Platform Capabilities</p>
            <h2 className="lp-section-title">
              Everything a smart city needs
            </h2>
            <p className="lp-section-sub">
              From predictive models to citizen alerts — Uly Dala connects data to decisions.
            </p>
          </div>
          <div className="lp-features-grid">
            {[
              {
                icon: 'TF',
                title: 'Traffic Prediction',
                desc: 'AI forecasts congestion 72 hours ahead using historical patterns, weather, and events — so Akimat acts before jams form.',
              },
              {
                icon: 'AQ',
                title: 'Air Quality Intelligence',
                desc: 'Real-time PM2.5, PM10, and NO₂ monitoring across 18+ stations with predictive trend analysis and health alerts.',
              },
              {
                icon: 'DB',
                title: 'Akimat Dashboard',
                desc: 'City officials get prioritised AI recommendations: traffic rerouting, signal timing optimization, and emission-reduction actions.',
              },
              {
                icon: 'MP',
                title: '3D Interactive Map',
                desc: 'Explore Almaty in full 3D with live traffic overlays, air quality heat zones, and real road-network alignment.',
              },
              {
                icon: 'AL',
                title: 'Citizen Alerts',
                desc: 'Contextual push alerts for poor air quality and traffic incidents, with alternative route suggestions.',
              },
              {
                icon: 'AI',
                title: 'Gemini AI Advisor',
                desc: 'An always-on AI assistant that synthesizes city data into plain-language advisories for both officials and citizens.',
              },
            ].map(card => (
              <div key={card.title} className="lp-card lp-reveal">
                <div className="lp-card-icon">{card.icon}</div>
                <div className="lp-card-title">{card.title}</div>
                <p className="lp-card-desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lp-divider" />

      {/* How it works */}
      <div id="how">
        <div className="lp-section">
          <div className="lp-how-grid">
            <div>
              <div className="lp-reveal">
                <p className="lp-section-tag">How it works</p>
                <h2 className="lp-section-title">
                  From raw data to<br /><em style={{ fontStyle:'italic', color:'#3b9eff' }}>smart decisions</em>
                </h2>
                <p className="lp-section-sub" style={{ marginBottom: 36 }}>
                  Three layers of intelligence working in real time.
                </p>
              </div>
              <div className="lp-steps">
                {[
                  { n:'01', title:'Data Ingestion', desc:'Traffic sensors, air quality stations, and weather APIs stream live data into the platform every minute.' },
                  { n:'02', title:'AI Analysis', desc:'Gemini models process historical patterns with current conditions to produce 72-hour forecasts and anomaly detection.' },
                  { n:'03', title:'Actionable Insights', desc:'City officials receive prioritised recommendations; citizens see personalised alerts and route suggestions on the map.' },
                ].map(s => (
                  <div key={s.n} className="lp-step lp-reveal">
                    <div className="lp-step-num">{s.n}</div>
                    <div>
                      <div className="lp-step-title">{s.title}</div>
                      <p className="lp-step-desc">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-visual-card lp-reveal">
              <p style={{ fontSize:'0.7rem', color:'#3b9eff', fontWeight:600, letterSpacing:'0.08em', marginBottom:16 }}>LIVE FORECAST — NEXT 24H</p>
              {[
                { t:'08:00', traffic:'High', aqi:112, tc:'#ef4444', ac:'#f97316' },
                { t:'12:00', traffic:'Medium', aqi:89, tc:'#facc15', ac:'#facc15' },
                { t:'17:00', traffic:'High', aqi:134, tc:'#ef4444', ac:'#ef4444' },
                { t:'21:00', traffic:'Low', aqi:67, tc:'#22c55e', ac:'#22c55e' },
              ].map(row => (
                <div key={row.t} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ color:'#7a9cc4', fontSize:'0.78rem', width:44 }}>{row.t}</span>
                  <span style={{
                    fontSize:'0.72rem', fontWeight:600, color: row.tc,
                    background: row.tc + '18', border: `1px solid ${row.tc}40`,
                    borderRadius:6, padding:'2px 8px', flex:1,
                  }}>{row.traffic} Traffic</span>
                  <span style={{ fontSize:'0.72rem', color: row.ac, fontWeight:600 }}>AQI {row.aqi}</span>
                </div>
              ))}
              <div style={{ marginTop:18, display:'flex', gap:8, flexWrap:'wrap' }}>
                <span style={{ background:'rgba(59,158,255,0.1)', border:'1px solid rgba(59,158,255,0.25)', borderRadius:6, padding:'5px 10px', fontSize:'0.72rem', color:'#3b9eff', fontWeight:500 }}>AI Advisory active</span>
                <span style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:6, padding:'5px 10px', fontSize:'0.72rem', color:'#22c55e', fontWeight:500 }}>18 Stations online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="lp-quote-section">
        <blockquote className="lp-quote">
          "The future of urban management is not reactive — it is predictive, transparent,
          and built for the people who live in the city."
        </blockquote>
        <p style={{ color:'#3d5a7a', fontSize:'0.82rem' }}>Uly Dala · Almaty City Intelligence Platform</p>
        <div className="lp-trust-badges">
          {['Real-time Data', 'AI-Powered', 'Mapbox 3D', 'Gemini API', 'Open Platform'].map(b => (
            <span key={b} className="lp-badge">{b}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="lp-cta" id="about">
        <h2 className="lp-cta-title">Ready to explore Almaty?</h2>
        <p className="lp-cta-sub">Open the live 3D map and see the city's pulse in real time.</p>
        <button className="lp-btn-primary" onClick={onLaunch} style={{ fontSize:'1.05rem', padding:'16px 40px' }}>
          Launch the Map
        </button>
      </div>

      {/* Footer */}
      <footer>
        <div className="lp-footer">
          <span className="lp-footer-copy">© 2026 Uly Dala · Almaty City Intelligence Platform</span>
          <div className="lp-footer-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#about">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
