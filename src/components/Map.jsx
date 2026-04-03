import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_CONFIG, getAQColor, getAQHex, TRAFFIC_INCIDENT_COLORS } from '../config/mapConfig.js';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_KEY || '';

export default function Map({ layers, airStations, trafficIncidents, onFeatureClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const trafficMarkersRef = useRef([]);
  const mapLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      ...MAP_CONFIG,
      antialias: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100 }), 'bottom-left');

    map.on('load', () => {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });

      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 10,
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'height'],
            0,   '#1e293b',
            50,  '#334155',
            200, '#475569',
          ],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.85,
        },
      });

      if (TOMTOM_KEY) {
        map.addSource('tomtom-flow', {
          type: 'raster',
          tiles: [
            `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,
          ],
          tileSize: 256,
          attribution: '© TomTom',
        });

        map.addLayer({
          id: 'traffic-flow',
          type: 'raster',
          source: 'tomtom-flow',
          layout: { visibility: 'visible' },
          paint: { 'raster-opacity': 0.7 },
        });
      }

      map.addSource('air-quality', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'aq-heatmap',
        type: 'heatmap',
        source: 'air-quality',
        maxzoom: 14,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'aqi'], 0, 0, 300, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 9, 2],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,   'rgba(0,228,0,0)',
            0.2, 'rgba(255,255,0,0.6)',
            0.5, 'rgba(255,126,0,0.8)',
            0.8, 'rgba(255,0,0,0.9)',
            1,   'rgba(126,0,35,1)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 40],
          'heatmap-opacity': 0.75,
        },
      });

      map.addLayer({
        id: 'aq-circles',
        type: 'circle',
        source: 'air-quality',
        minzoom: 11,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'aqi'], 0, 8, 300, 20],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'aqi'],
            0,   '#00e400',
            50,  '#ffff00',
            100, '#ff7e00',
            150, '#ff0000',
            200, '#8f3f97',
            300, '#7e0023',
          ],
          'circle-stroke-color': 'rgba(255,255,255,0.4)',
          'circle-stroke-width': 1.5,
          'circle-opacity': 0.9,
        },
      });

      map.addLayer({
        id: 'aq-labels',
        type: 'symbol',
        source: 'air-quality',
        minzoom: 12,
        layout: {
          'text-field': ['get', 'aqi'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 11,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.8)',
          'text-halo-width': 1,
        },
      });

      map.on('click', 'aq-circles', (e) => {
        const feature = e.features[0];
        if (feature && onFeatureClick) {
          onFeatureClick({
            type: 'air-quality',
            data: feature.properties,
            coordinates: e.lngLat,
          });
        }
      });

      map.on('mouseenter', 'aq-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'aq-circles', () => {
        map.getCanvas().style.cursor = '';
      });

      mapLoadedRef.current = true;
    });

    return () => {
      mapLoadedRef.current = false;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    const setVisibility = (id, visible) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      }
    };

    setVisibility('3d-buildings', layers.buildings);
    setVisibility('traffic-flow', layers.trafficFlow);
    setVisibility('aq-heatmap', layers.airQuality);
    setVisibility('aq-circles', layers.airQuality);
    setVisibility('aq-labels', layers.airQuality);
  }, [layers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    const source = map.getSource('air-quality');
    if (!source) return;

    const geojson = {
      type: 'FeatureCollection',
      features: airStations
        .filter((s) => s.coordinates && !isNaN(s.aqi))
        .map((s) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: s.coordinates },
          properties: {
            id: s.id,
            name: s.name,
            aqi: s.aqi,
            time: s.time,
          },
        })),
    };

    source.setData(geojson);
  }, [airStations]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    trafficMarkersRef.current.forEach((m) => m.remove());
    trafficMarkersRef.current = [];

    if (!layers.trafficIncidents) return;

    trafficIncidents.forEach((inc) => {
      const el = document.createElement('div');
      const color = TRAFFIC_INCIDENT_COLORS[inc.category] || '#6b7280';
      el.className = 'traffic-marker';
      el.style.cssText = `
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.7);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      `;
      el.title = inc.description;
      el.innerHTML = getIncidentEmoji(inc.iconCategory);

      el.addEventListener('click', () => {
        if (onFeatureClick) {
          onFeatureClick({
            type: 'traffic',
            data: inc,
            coordinates: { lng: inc.coordinates[0], lat: inc.coordinates[1] },
          });
        }
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(inc.coordinates)
        .addTo(map);

      trafficMarkersRef.current.push(marker);
    });
  }, [trafficIncidents, layers.trafficIncidents]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}

function getIncidentEmoji(code) {
  const icons = {
    1:  '!',
    6:  '~',
    7:  '#',
    8:  'X',
    9:  'W',
    14: 'B',
  };
  return icons[code] || '!';
}
